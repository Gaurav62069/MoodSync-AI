from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)

    with app.app_context():
        from . import services
        from . import utils
        from . import controllers
        from . import routes 
    print
    return app