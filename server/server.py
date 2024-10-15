import eventlet
eventlet.monkey_patch()

from flask import Flask, session, request, jsonify, redirect, url_for, send_from_directory, make_response
from flask_socketio import SocketIO, join_room, leave_room, send, emit
from flask_session import Session
from flask_cors import CORS
import bcrypt
from flask_sqlalchemy import SQLAlchemy
from datetime import timedelta


app = Flask(__name__, static_folder='static') # Initialize flask app
app.config['SECRET_KEY'] = 'secret!'
SQLALCHEMY_DATABASE_URL = "postgresql://chatroomapp_db_user:WMLMQVyUxXQCLyijRbHvFvPGTR6k5pCU@dpg-crscqrjtq21c73de7bd0-a.oregon-postgres.render.com/chatroomapp_db"
app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SESSION_TYPE'] = 'filesystem' # Store sessions in server's filesystem
app.config['SESSION_PERMANENT'] = False
app.permanent_session_lifetime = timedelta(minutes=30)

db = SQLAlchemy()

class users(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), unique=False, nullable=False)

socketio = SocketIO(app, cors_allowed_origins="*", manage_session=False) # Initialize SocketIO
db.init_app(app)
Session(app)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "https://dw-realtime-chatroom-app.netlify.app"}})

with app.app_context():
    db.create_all()
    
# Dictionary of current users
rooms = {}

@app.route('/')
def serve_react_app():
    return send_from_directory(app.static_folder, 'index.html')

# Hash the password
def hashPwd(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

# Check password hash
def checkHashPwd(storedPwd, currPwd):
    return bcrypt.checkpw(currPwd.encode('utf-8'), storedPwd)

# Catch client layer's emitted message
@socketio.on("message")
def handleMessage(data):
    room = data['room']
    message = data['value']
    username = data['userName']
    emit("received_message", {'message': f'{username}: {message}'}, room=room) # Pass user msg to all clients

@app.route('/newUser', methods=['POST', 'GET'])
def add_user():
    data = request.get_json()
    
    # If user already exists
    if (users.query.filter_by(name=data['userName']).first()):
        return jsonify({"message": "ERROR: Username Taken"}), 401
    else:
        new_user = users(name=data['userName'], email=data['userEmail'], password=data['userPassword'])#bcrypt.hashpw(data['userPassword'].encode('utf-8'), bcrypt.gensalt()))#hashPwd(data['userPassword']))
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'User added successfully!'}), 201

@app.route('/LoginUser', methods=['POST', 'GET'])
def login():
    data = request.get_json()
    user = users.query.filter_by(name=data['userName']).first()
    
    if user and (data['userPassword'] == user.password):#(bcrypt.checkpw(data['userPassword'].encode('utf-8'), user.password)):#checkHashPwd(user.password, data['userPassword']):
        session['userName'] = user.name
        return jsonify({"message": "Logged in successfully"}), 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401

@app.route('/Logout', methods=['POST', 'GET'])
def logout():
    session.pop('userName', None)
    session.clear()
    return jsonify({"message": "Logged out successfully"}), 200

@app.route('/Session-check', methods=['GET'])
def session_check():
    username = session.get('userName')
    if username:
        return jsonify(username)
    return jsonify({"message": "Not logged in"}), 401

@app.route('/Room-check', methods=['GET'])
def room_check():
    room = session.get('room')
    if room:
        return jsonify(room)
    return jsonify({"message": "User has no Room"}), 401

# Route to join a specific room
@app.route('/join_room_route', methods=['POST'])
def join_room_route():
    data = request.get_json()
    room = data['room']
    
    session['room'] = room # Save room session
    return jsonify({'message': f'Joining room {room}'})

# Socket connection event to handle joining room
@socketio.on('join')
def on_join(data):
    username = data['userName']
    room = data['room']
    join_room(room)

    if room not in rooms:
        rooms[room] = []
        
    if username not in rooms[room]:
        rooms[room].append(username)
        
    updateMembers(room)
        
    emit('received_message', {'message': f'{username} has entered room {room}'}, room=room)
    
# Socket connection event to handle leaving room
@socketio.on('leave')
def on_leave(data):
    username= data['userName']
    room = data['room']
    leave_room(room)
    
    if room not in rooms:
        rooms[room] = []
        
    if username in rooms[room]:
        rooms[room].remove(username)
        
    updateMembers(room)
        
    emit("received_message", {'message': f'{username} has left room {room}'}, room=room)
    

# Route to update current member list in room
@socketio.on('updateMemList')
def updateMembers(room):
    emit("updateMems", {'room': room, 'members': rooms[room]}, room=room)
    

if __name__ == '__main__':
    socketio.run(app, host="https://dw-realtime-chatroom-app.netlify.app")#, debug=False, host='https://dw-realtime-chatroom-app.netlify.app/')