from flask import Flask, request, jsonify
from flask_socketio import SocketIO
from models import users
from db import db

app = Flask(__name__) # Initialize flask app
app.config['SECRET_KEY'] = 'secret!'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
socketio = SocketIO(app, cors_allowed_origins="*") # Initialize SocketIO
db.init_app(app)
 
def create_tables():
    with app.app_context():
        db.create_all()

if __name__ == '__main__':
    create_tables()
    socketio.run(app, debug=True)

# Catch client layer's emitted message
@socketio.on("message")
def handleMessage(data):
    print("User connected: Value " + data)
    socketio.emit("received_message", data) # Pass user msg to all clients

@app.route('/newUser', methods=['POST', 'GET'])
def add_user():
    data = request.get_json()
    new_user = users(name=data['userName'], email=data['userEmail'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User added successfully!'}), 201