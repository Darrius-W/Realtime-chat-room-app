from flask_socketio import join_room, leave_room, emit
from server.extensions import socketio

rooms = {} # Temporary server memory for group chats
private_chats = {} # Temporary server memory for one-on-one chats

# Creates a standardized private room ID by sorting and meshing both usernames alphabetically
def make_private_id(a, b):
    first, second = sorted([a.lower(), b.lower()])
    return f"private_{first}_{second}"

# Retrieves the username of the chat partner for sidebar display and notifications
def other_user(chat, me):
    return next(u for u in chat['users'] if u.lower() != me.lower())


# Sends broadcasted event to both participants by looping through the users in the private chat
def notify_users(chat, event, payload):
    for user in chat['users']:
        socketio.emit(event, payload, room=user.lower())

# Acts as a bundler for chats, ensuring accurate room and user metadata is sent each time
def chat_payload(room, chat):
    return {'room': room, 'users': chat['users']}

# Identifies whether a room is a user's personal background inbox channel rather than a private or group chat
def is_personal_room(room):
    return not room.startswith(('private_', 'group_'))

# Scans temporary server memory for a user's chats and sorts them into incoming,
# outgoing, and active lists to rebuild their sidebar on reconnect
def build_sync(username):
    me = username.lower()
    incoming, outgoing, active = [], [], []
    for room, chat in private_chats.items():
        if me not in [u.lower() for u in chat['users']]:
            continue
        partner = other_user(chat, me)
        if chat['status'] == 'active':
            active.append({'room': room, 'partner': partner})
        elif chat['requester'].lower() == me:
            outgoing.append({'room': room, 'partner': partner})
        else:
            incoming.append({'room': room, 'partner': partner})
    return {'incoming': incoming, 'outgoing': outgoing, 'active': active}


# ---------------------------------------------------------------- messaging

# Acts as the main messaging checkpoint, verifying route and member validity,
# packaging and sending messages to the right room
@socketio.on('message')
def handle_message(data):
    room = data['room']
    message = data['currMsg']
    username = data['userName']

    payload = {
        'room': room,
        'message': message,
        'sender': username,
        'status': 'active'
    }

    if room.startswith('private_'):
        chat = private_chats.get(room)
        allowed = (
            chat is not None
            and chat['status'] == 'active'
            and username.lower() in [u.lower() for u in chat['users']]
        )
        if not allowed:
            emit('chat_error', {'message': 'This chat has not been accepted yet.'})
            return
        notify_users(chat, 'received_message', payload)

    elif room.startswith('group_'):
        socketio.emit('received_message', payload, room=room)


# ----------------------------------------------------- chat request handshake

# Handles message requests by validating usernames, checking if a chat already exists, and sending a chat invitation to the receiver
@socketio.on('chat_request')
def handle_chat_request(data):
    sender = (data.get('from') or '').strip()
    target = (data.get('to') or '').strip()

    if not sender or not target:
        emit('chat_error', {'message': 'Missing user name.'})
        return
    if sender.lower() == target.lower():
        emit('chat_error', {'message': "You can't start a chat with yourself."})
        return

    room = make_private_id(sender, target)
    chat = private_chats.get(room)

    if chat:
        if chat['status'] == 'active':
            # Already connected: just open it for the sender
            socketio.emit('chat_accepted', chat_payload(room, chat), room=sender.lower())
        elif chat['requester'].lower() == sender.lower():
            emit('chat_error', {'message': f'You already sent {target} a request.'})
        else:
            # They had already asked us, so asking back counts as accepting
            chat['status'] = 'active'
            notify_users(chat, 'chat_accepted', chat_payload(room, chat))
        return

    private_chats[room] = {
        'users': [sender, target],
        'requester': sender,
        'status': 'pending'
    }
    socketio.emit('chat_request_sent', {'room': room, 'to': target}, room=sender.lower())
    socketio.emit('chat_request_received', {'room': room, 'from': sender}, room=target.lower())

# Handles user chat invitation responses by validating permissions,
# catching invalid requests, and executing the accept or decline action
@socketio.on('chat_response')
def handle_chat_response(data):
    room = data.get('room')
    responder = (data.get('userName') or '').strip()
    accept = bool(data.get('accept'))

    chat = private_chats.get(room)

    # Only the invited user (not the requester) can answer a pending request
    valid = (
        chat is not None
        and chat['status'] == 'pending'
        and responder.lower() in [u.lower() for u in chat['users']]
        and responder.lower() != chat['requester'].lower()
    )
    if not valid:
        emit('chat_error', {'message': 'That request is no longer available.'})
        return

    if accept:
        chat['status'] = 'active'
        notify_users(chat, 'chat_accepted', chat_payload(room, chat))
    else:
        del private_chats[room]
        notify_users(chat, 'chat_declined', {'room': room, 'by': responder})


# -------------------------------------------------------------- room joining

# Handles room joins by connecting the user to the socket channel,
# updating the member list, syncing offline chats on login, or announcing group arrivals
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

    if is_personal_room(room):
        # Send pending requests and accepted chats that happened while offline
        emit('sync_chats', build_sync(username))

    if room.startswith('group_'):
        socketio.emit('received_message', {
            'room': room,
            'message': f'{username} has entered the room.',
            'sender': 'System',
            'status': 'active'
        }, room=room)

# Handles room disconnections by removing the user from the socket channel,
# cleaning up the member list, and alerting group chats that the user left
@socketio.on('leave')
def on_leave(data):
    username = data['userName']
    room = data['room']
    leave_room(room)

    if room in rooms and username in rooms[room]:
        rooms[room].remove(username)

    update_members(room)

    if room.startswith('group_'):
        socketio.emit('received_message', {
            'room': room,
            'message': f'{username} has left the room.',
            'sender': 'System',
            'status': 'active'
        }, room=room)

# Dynamically updates room roster when users join or leave
def update_members(room):
    member_list = rooms.get(room, [])
    socketio.emit('updateMems', {'room': room, 'members': member_list}, room=room)

# Broadcasts to the room when a user is typing a message
@socketio.on('typing')
def handle_typing(data):
    room = data['room']
    username = data['username']
    is_typing = data['isTyping']
    payload = {'room': room, 'username': username, 'isTyping': is_typing}

    if room.startswith('private_'):
        chat = private_chats.get(room)
        if chat and chat['status'] == 'active':
            notify_users(chat, 'updateTyping', payload)
        return

    socketio.emit('updateTyping', payload, room=room, include_self=False)