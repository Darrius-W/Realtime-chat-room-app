from flask import Flask, session, request, jsonify, send_from_directory
from flask_socketio import SocketIO, join_room, leave_room, emit
from flask_session import Session
from flask_cors import CORS
import bcrypt
from flask_sqlalchemy import SQLAlchemy
from datetime import timedelta


app = Flask(__name__, static_folder='static') # Initialize flask app
app.config['SECRET_KEY'] = 'secret!'
SQLALCHEMY_DATABASE_URL = "postgresql://chatroomapp_db_2cs5_user:0PS5HN1VoGMPgIKZZzyBGfCU8jRIcCBg@dpg-csh5t93v2p9s73d2avjg-a.oregon-postgres.render.com/chatroomapp_db_2cs5"
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
    
# Dictionary of current rooms
rooms = {}

@app.route('/')
def serve_react_app():
    return send_from_directory(app.static_folder, 'index.html')


# Socket connection to catch client emitted message
@socketio.on("message")
def handleMessage(data):
    room = data['room']
    message = data['currMsg']
    username = data['userName']
    emit("received_message", {'message': f'{username}: {message}'}, room=room) # Pass user sent msg to all clients in room


# Route to create a new user upon client sign up
@app.route('/newUser', methods=['POST', 'GET'])
def add_user():
    data = request.get_json() # collect user input
    
    # If user already exists in database return error
    if (users.query.filter_by(name=data['userName']).first()):
        return jsonify({"message": "ERROR: Username Taken"}), 401
    else: # user doesn't exist, therefore create new account
        new_user = users(name=data['userName'], email=data['userEmail'], password=data['userPassword'])
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'User added successfully!'}), 201


# Route to Login user upon client request
@app.route('/LoginUser', methods=['POST', 'GET'])
def login():
    data = request.get_json() # collect user input
    user = users.query.filter_by(name=data['userName']).first() # locate user within users database
    
    if user and (data['userPassword'] == user.password): # if user exists and password matches, set user session
        session['userName'] = user.name
        return jsonify({"message": "Logged in successfully"}), 200
    else: # not active user in database
        return jsonify({"message": "Invalid credentials"}), 401


# Route to Logout user upon client request
@app.route('/Logout', methods=['POST'])
def logout():
    session.pop('userName', None)
    session.clear()
    return jsonify({"message": "Logged out successfully"}), 200


# Socket connection event to handle active user request to join sepcific room
@socketio.on('join')
def on_join(data):
    username = data['userName']
    room = data['room']
    join_room(room)

    if room not in rooms:
        rooms[room] = []
        
    if username not in rooms[room]:
        rooms[room].append(username)
        
    updateMembers(room) # update displayed currently active users in specific room
        
    emit('received_message', {'message': f'{username} has entered room {room}'}, room=room) # send response back to client
    
    
# Socket connection event to handle user request to leave room
@socketio.on('leave')
def on_leave(data):
    username= data['userName']
    room = data['room']
    leave_room(room)
    
    if room not in rooms:
        rooms[room] = []
        
    if username in rooms[room]:
        rooms[room].remove(username)
        
    updateMembers(room) # update specific room's displayed online member list
        
    emit("received_message", {'message': f'{username} has left room {room}'}, room=room) # send response back to client
    

# Socket connection to update currently displayed member list in room
@socketio.on('updateMemList')
def updateMembers(room):
    emit("updateMems", {'room': room, 'members': rooms[room]}, room=room) # send updated list back to client
    

if __name__ == '__main__':
    socketio.run(app, host="https://dw-realtime-chatroom-app.netlify.app")