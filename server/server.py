from flask import Flask, send_from_directory, jsonify
from flask_socketio import SocketIO, send

app = Flask(__name__) # Initialize flask app
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*") # Initialize SocketIO

# Catch client layer's emitted message
@socketio.on("message")
def handleMessage(data):
    print("User connected: Value " + data)
    socketio.emit("received_message", data) # Pass user msg to all clients

@app.route('/')
def hello():
    return "Hello"

if __name__ == '__main__':
    socketio.run(app)