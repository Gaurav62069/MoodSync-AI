//VoiceAnalysis.jsx
import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import api from "../../services/api";
import toast from "react-hot-toast";

const VoiceAnalysis = ({ onResult }) => {
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Silence Detection Refs
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationFrameRef = useRef(null);
  const hasSpokenRef = useRef(false);

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioContextRef.current) audioContextRef.current.close();
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const startRecording = async () => {
    hasSpokenRef.current = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Audio Context Setup
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      await audioContextRef.current.resume();

      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      sourceRef.current =
        audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);
      detectVolume();

      // Recorder Setup
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        console.log("Chunk size:", event.data.size);

        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = handleVoiceUpload;
      mediaRecorderRef.current.start(1000);
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone Error:", error);
      toast.error("Microphone access denied.");
    }
  };

  const detectVolume = () => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteTimeDomainData(dataArray);

    const average =
      dataArray.reduce((a, b) => a + Math.abs(b - 128), 0) / dataArray.length;
    if (average > 1) hasSpokenRef.current = true;

    if (isRecording) {
      animationFrameRef.current = requestAnimationFrame(detectVolume);
    }
    console.log("Volume:", average);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }
    }
  };

  const handleVoiceUpload = async () => {
    setLoading(true);

    const audioBlob = new Blob(audioChunksRef.current, {
      type: mediaRecorderRef.current.mimeType,
    });

    const audioFile = new File([audioBlob], "voice_note.webm", {
      type: "audio/webm",
    });

    const formData = new FormData();
    formData.append("audio", audioFile, "voice.webm");
    console.log("Blob Type:", audioBlob.type);

    try {
      console.log("Audio size:", audioFile.size);
      console.log("Chunks:", audioChunksRef.current.length);
      const { data } = await api.post("/ai/analyze-voice", formData);

      if (data?.data?.notes?.includes("silence")) {
        toast("Couldn't hear clearly 🎤");
        return;
      }

      const detectedMood = data?.data?.mood || "neutral";

      toast.success(`Mood detected: ${detectedMood}`);

      onResult({
        mood: detectedMood,
        score: "N/A",
        notes: "Voice Analysis Complete",
      });
    } catch (error) {
      console.error("Voice Upload Error:", error);
      toast.error(error.response?.data?.error || "Voice analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-6"
    >
      <div
        className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border-4 transition-all duration-500 relative ${isRecording ? "border-red-500 bg-red-500/20" : "border-white/10 bg-white/5"}`}
      >
        {isRecording && (
          <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-20 animate-ping"></span>
        )}
        {isRecording ? (
          <Mic size={40} className="text-red-500 animate-bounce" />
        ) : (
          <Mic size={40} className="text-gray-400" />
        )}
      </div>

      <h3 className="text-xl font-semibold text-white mb-2">
        {isRecording ? "Listening..." : "Tap to Speak"}
      </h3>
      <p className="text-gray-400 text-sm mb-8 max-w-xs mx-auto">
        {isRecording
          ? "Speak naturally..."
          : "We analyze pitch and tone to detect emotions."}
      </p>

      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={loading}
        className={`px-8 py-3 border rounded-full font-bold  transition-all shadow-lg flex items-center gap-2 mx-auto active:scale-95 ${
          isRecording
            ? "bg-red-500/5 hover:bg-red-800/5 border-red-500 text-red-500 hover:text-red-400"
            : "bg-blue-800/5 hover:bg-blue-500/5 border-blue-500 text-blue-400 hover:text-blue-500"
        }`}
      >
        {/* text-white border border-blue-500/20 bg-blue-500/5 */}
        {loading ? (
          <Loader2 className="animate-spin" />
        ) : isRecording ? (
          <Square size={18} fill="white" />
        ) : (
          <Mic size={18} />
        )}
        {loading
          ? "Analyzing..."
          : isRecording
            ? "Stop Recording"
            : "Start Recording"}
      </button>
    </motion.div>
  );
};

export default VoiceAnalysis;
