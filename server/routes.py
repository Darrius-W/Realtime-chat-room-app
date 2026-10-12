from flask import Blueprint, request, jsonify, session, send_from_directory, current_app
import bcrypt
from extensions import db
from models import User

# Container that holds all the skeletons of my routes until activation time
auth_bp = Blueprint('auth', __name__)

# Route serves the main webpage
@auth_bp.route('/')
def server_react_app():
    return send_from_directory(current_app.static_folder, 'index.html')

# Route extracts user signup data from frontend JSON request and validates info to create a new user
@auth_bp.route('/newUser', methods=['POST'])
def add_user():
    # Pulls POST data from user signup form to create a new user using submitted data
    data = request.get_json()
    username = data.get('userName', '').strip()
    email = data.get('userEmail', '').strip()
    raw_password = data.get('userPassword', '')

    # Identifies if user data already exists to avoid data duplication by querying the database
    if User.filter_by(name=username).first():
        return jsonify({'message': "Error: Username Taken"}), 401

    # Enforces authentication character minimums in the backend
    if len(username) < 6 or len(raw_password) < 6:
        return jsonify({'message': "Security bounds validation mismatch. Minimum 6 chars required."}), 400

    # Never stores raw passwords; enforces security using a hashing algorithm to secure the password
    salt = bcrypt.gen_salt()
    hashed_password = bcrypt.hashpw(raw_password.encode('utf-8'), salt)

    # Creates new user object, stages, and stores new user in the database
    new_user = User(name=username, email=email, password=hashed_password.decode('utf-8'))
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': "User added successfully"}), 201

# Route validates and authenticates an existing user by comparing user-submitted credentials to database values
@auth_bp.route('/LoginUser', methods=['POST'])
def login():
    # Pulls and cleans data from the user JSON request
    data = request.get_json()
    username = data.get('userName', '').strip()
    raw_password = data.get('userPassword', '')

    # Checks user validity by querying db, verifying the hashed password, and establishing a session
    user = User.query.filter_by(name=username).first()

    if user and bcrypt.checkpw(raw_password.encode('utf-8'), user.password.encode('utf-8')):
        session['userName'] = user.name
        return jsonify({'message': "Logged in successfully"}), 200

    return jsonify({'message': "Invalid credentials configuration."}), 401

# Logs out user by clearing the user session and removing existing user data from the session stack
@auth_bp.route('/Logout', methods=['POST', 'GET'])
def logout():
    session.pop('userName', None)
    session.clear()
    return jsonify({'message': "Logged out successfully"}), 200

# Health check route used to verify the API server is awake and listening
@auth_bp.route('/ping', methods=['GET'])
def ping():
    return jsonify({'message': "pong"})