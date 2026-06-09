import React, { useRef, useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { Camera, RefreshCcw, Loader2, Smile } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const FaceAnalysis = ({ onResult }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null); // Camera stream track karne ke liye
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [detectedMood, setDetectedMood] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [imgSrc, setImgSrc] = useState(null);

  // --- 1. Load Models ---
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models';
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        setIsModelLoaded(true);
      } catch (error) {
        console.error("Model Load Error:", error);
        toast.error("AI Models missing inside public/models folder");
      }
    };
    loadModels();

    // Cleanup on unmount
    return () => stopCamera();
  }, []);

  // --- 2. Trigger Video Restart on 'Retake' ---
  // Jab bhi 'imgSrc' null hoga (Retake mode), camera start hoga
  useEffect(() => {
    if (isModelLoaded && !imgSrc) {
      startVideo();
    }
  }, [isModelLoaded, imgSrc]);

  // --- Helper: Start Camera ---
  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        streamRef.current = stream; // Save stream reference
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error("Camera Error:", err);
        // toast.error("Camera access denied"); 
      });
  };

  // --- Helper: Stop Camera ---
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // --- 3. Detection Loop ---
  const handleVideoOnPlay = () => {
    setIsScanning(true);
    const interval = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current || !!imgSrc) { // Agar image capture ho gayi toh loop roko
         clearInterval(interval);
         return;
      }

      const displaySize = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
      
      // Safety check for zero dimensions
      if(displaySize.width === 0 || displaySize.height === 0) return;

      faceapi.matchDimensions(canvasRef.current, displaySize);

      const detections = await faceapi.detectAllFaces(
        videoRef.current, 
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks().withFaceExpressions();

      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      
      // Canvas Draw
      if (canvasRef.current) {
        const context = canvasRef.current.getContext('2d');
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections);
      }

      if (detections.length > 0) {
        const expressions = detections[0].expressions;
        const maxMood = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);
        
        const moodMap = {
          neutral: 'neutral', happy: 'happy', sad: 'sad', 
          angry: 'angry', fearful: 'anxious', disgusted: 'bored', surprised: 'excited'
        };
        setDetectedMood(moodMap[maxMood] || 'neutral');
      }
    }, 1000);

    return () => clearInterval(interval);
  };

  // --- 4. Handlers ---
  const capture = () => {
    if (!detectedMood && !isScanning) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    
    stopCamera(); // Capture karte hi camera band (Performance Bachane ke liye)
    setImgSrc(canvas.toDataURL('image/jpeg'));
    setIsScanning(false);

    onResult({
        mood: detectedMood || 'neutral',
        source: 'face',
        notes: `AI detected ${detectedMood} expression.`
    });
    
    toast.success("Mood Captured!");
  };

  const retake = () => {
    setImgSrc(null); // Ye change hote hi useEffect wapas startVideo() call karega
    setDetectedMood(null);
    onResult(null);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
      <div className="relative w-full max-w-md mx-auto rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-black h-[300px]">
        
        {/* Video Feed */}
        {!imgSrc && (
            <video 
                ref={videoRef} 
                autoPlay 
                muted 
                onPlay={handleVideoOnPlay}
                className="w-full h-full object-cover transform scale-x-[-1]" 
            />
        )}

        {/* Canvas Overlay */}
        {!imgSrc && (
            <canvas 
                ref={canvasRef} 
                className="absolute top-0 left-0 w-full h-full transform scale-x-[-1]" 
            />
        )}

        {/* Captured Image */}
        {imgSrc && (
            <img src={imgSrc} alt="Captured" className="w-full h-full object-cover" />
        )}

        {/* Detection Overlay */}
        {isScanning && detectedMood && !imgSrc && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-white font-bold flex items-center gap-2 z-10">
                <Smile size={18} className="text-yellow-400" />
                <span className="capitalize">{detectedMood}</span>
            </div>
        )}
      </div>

      <div className="mt-6 flex justify-center gap-4">
        {imgSrc ? (
          <button onClick={retake} className="px-6 py-2.5 rounded-xl bg-gray-700 text-white flex items-center gap-2 hover:bg-gray-600 transition-all shadow-lg">
            <RefreshCcw size={18} /> Retake
          </button>
        ) : (
          <button 
            onClick={capture} 
            disabled={!detectedMood}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600/5 to-purple-600/5 hover:from-blue-500/5 hover:to-purple-500/5 text-gray-300 font-bold flex items-center gap-2 border border-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            <Camera size={20} /> Capture Mood
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default FaceAnalysis;