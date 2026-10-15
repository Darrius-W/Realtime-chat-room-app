import gevent.monkey
# Force multitasking and asynchronous execution to prevent blocking on live WebSocket connections
gevent.monkey.patch_all()

from flask import Flask
from flask_cors import CORS
from server.config import Config
from server.extensions import db, socketio

def create_app():
    app = Flask(__name__, static_folder='static') # create main Flask server and tell it where to find frontend files

    app.config.from_object(Config) # feed environment variables and secret settings into server

    # Plug empty framework tools into this active server
    db.init_app(app)
    socketio.init_app(app)

    # Tells backend to trust requests coming from local frontend
    CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:3000"}})

    from server.routes import auth_bp
    app.register_blueprint(auth_bp) # register URL endpoints like login/signup for use

    # Identify models and build database tables
    with app.app_context():
        db.create_all()

    return app

# Triggers application build and start live chat server on port 5000
app = create_app()

if __name__ == '__main__':
    import server.sockets

    socketio.run(app, host="127.0.0.1", port=5000)