from flask_socketio import join_room, leave_room, emit
from extensions import socketio

# Temp global storage for tracking active rooms and their members
rooms = {}

# Broadcasts incoming message to all users within a specific chat room
@socketio.on('message')
def handle_message(data):
    room = data['room']
    message = data['currMsg']
    username = data['userName']
    emit('received_message', {'message': f'{username}: {message}'}, room=room)

# Handles a user joining a room and updates room's member list
@socketio.on('join')
def on_join(data):
    username = data['userName']
    room = data['room']
    join_room(room)

    if room not in rooms:
        rooms[room] = []
    if username not in rooms[room]:
        rooms[room].append(username)

    update_members(room)
    emit('received_message', {'message': f'{username} has entered the room {room}'}, room=room)

# Handles a user leaving a room and updates room's member list
@socketio.on('leave')
def on_leave(data):
    username = data['userName']
    room = data['room']
    leave_room(room)

    if room in rooms and username in rooms[room]:
        rooms[room].remove(username)

    update_members(room)
    emit('received_message', {'message': f'{username} has left room {room}'}, room=room)

# Broadcasts current list of members to everyone in specific room
def update_members(room):
    member_list = rooms.get(room, [])
    socketio.emit('updateMems', {'room': room, 'members': member_list}, room=room)