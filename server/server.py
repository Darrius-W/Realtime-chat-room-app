from flask import Flask, session, request, jsonify, redirect, url_for
from flask_socketio import SocketIO
from flask_session import Session
from models import users
from db import db
from flask_cors import CORS

app = Flask(__name__) # Initialize flask app
app.config['SECRET_KEY'] = 'secret!'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SESSION_TYPE'] = 'filesystem' # Store sessions in server's filesystem
app.config['SESSION_PERMANENT'] = False

socketio = SocketIO(app, cors_allowed_origins="*") # Initialize SocketIO
db.init_app(app)
Session(app)
CORS(app, supports_credentials=True)
 
with app.app_context():
    db.create_all()


# Catch client layer's emitted message
@socketio.on("message")
def handleMessage(data):
    print("User connected: Value " + data)
    socketio.emit("received_message", data) # Pass user msg to all clients

@app.route('/newUser', methods=['POST', 'GET'])
def add_user():
    data = request.get_json()
    new_user = users(name=data['userName'], email=data['userEmail'], password=data['userPassword'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User added successfully!'}), 201

@app.route('/Login', methods=['POST'])
def login():
    data = request.get_json()
    
    user = users.query.filter_by(name=data['userName']).first()
    if user and user.password == (data['userPassword']):
        session['userName'] = user.name
        return jsonify({"message": "Logged in successfully"})
    return jsonify({"message": "Invalid credentials"}), 401

@app.route('/Logout', methods=['POST'])
def logout():
    session.pop('userName', None)
    return jsonify({"message": "Logged out successfully"})

@app.route('/Session-check', methods=['GET'])
def session_check():
    username = session.get('userName')
    if username:
        return jsonify(username)
    return jsonify({"message": "Not logged in"}), 401

if __name__ == '__main__':
    socketio.run(app, debug=True)