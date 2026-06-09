from flask import current_app as app, jsonify
from . import controllers


@app.route('/', methods=['GET'])
def root_health():
    return jsonify({
        "success": True,
        "service": "MoodSync AI Server",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "voice": "/analyze-voice",
            "sleep": "/analyze-sleep",
            "forecast": "/forecast-mood"
        }
    })
@app.errorhandler(404)
def not_found(e):
    return jsonify({
        "success": False,
        "error": "Route not found",
        "hint": "Use /analyze-voice, /analyze-sleep, /forecast-mood"
    }), 404


@app.route('/analyze-voice', methods=['POST'])
def analyze_voice_route():
    return controllers.handle_voice_analysis()

@app.route('/analyze-sleep', methods=['POST'])
def analyze_sleep_route():
    return controllers.handle_sleep_analysis()

@app.route('/forecast-mood', methods=['POST'])
def forecast_mood_route():
    return controllers.handle_mood_forecast()