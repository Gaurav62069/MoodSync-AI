from flask import request, jsonify
import logging
from werkzeug.exceptions import BadRequest

from .services import (
    analyze_voice_mood,
    analyze_sleep,
    forecast_mood
)
from .utils import save_temp_audio_file, remove_temp_file

logger = logging.getLogger("AI-CONTROLLERS")

# --------------------------------------------------
# VOICE ANALYSIS CONTROLLER
# --------------------------------------------------

def handle_voice_analysis():
    if 'audio' not in request.files:
        return jsonify({
            'success': False,
            'error': 'Audio file is required'
        }), 400

    audio_file = request.files['audio']
    file_path = None

    try:
        # --- Save Temp File ---
        file_path = save_temp_audio_file(audio_file)

        # --- Analyze ---
        mood, confidence = analyze_voice_mood(file_path)

        # --- Silence Handling (Frontend-safe) ---
        if mood.lower() == "silence":
            logger.info("🎤 Silence detected in voice input")
            return jsonify({
                'success': True,
                'mood': 'neutral',
                'source': 'voice',
                'note': 'silence_detected'
            })

        # --- Normal Response ---
        return jsonify({
            'success': True,
            'mood': mood,
            'source': 'voice',
            'confidence': round(float(confidence), 2),

        })

    except ValueError as ve:
        logger.warning(f"Validation error: {ve}")
        return jsonify({
            'success': False,
            'error': str(ve)
        }), 400

    except Exception as e:
        logger.exception("Voice analysis failed")
        return jsonify({
            'success': False,
            'error': 'Voice analysis failed'
        }), 500

    finally:
        if file_path:
            remove_temp_file(file_path)

# --------------------------------------------------
# SLEEP ANALYSIS CONTROLLER
# --------------------------------------------------

def handle_sleep_analysis():
    try:
        data = request.get_json(force=True)

        if not data:
            raise BadRequest("Request body is empty")

        acc_data = data.get('accData')
        scr_data = data.get('scrData')

        if not acc_data or not scr_data:
            return jsonify({
                'success': False,
                'error': 'accData and scrData are required'
            }), 400

        quality, interruptions = analyze_sleep(acc_data, scr_data)

        return jsonify({
            'success': True,
            'quality': quality,
            'interruptions': int(interruptions)
        })

    except BadRequest as br:
        logger.warning(f"Bad request: {br}")
        return jsonify({
            'success': False,
            'error': str(br)
        }), 400

    except Exception as e:
        logger.exception("Sleep analysis failed")
        return jsonify({
            'success': False,
            'error': 'Sleep analysis failed'
        }), 500

# --------------------------------------------------
# MOOD FORECAST CONTROLLER
# --------------------------------------------------

def handle_mood_forecast():
    try:
        data = request.get_json(force=True)

        if not data:
            return jsonify({
                'success': False,
                'error': 'historicalData is required'
            }), 400

        historical_data = data.get('historicalData')

        if not historical_data:
            return jsonify({
                'success': False,
                'error': 'historicalData missing'
            }), 400

        predicted_mood, confidence = forecast_mood(historical_data)

        return jsonify({
            'success': True,
            'predictedMood': predicted_mood,
            'confidence': round(float(confidence), 3)
        })

    except Exception as e:
        logger.exception("Mood forecast failed")
        return jsonify({
            'success': False,
            'error': 'Mood forecast failed'
        }), 500
