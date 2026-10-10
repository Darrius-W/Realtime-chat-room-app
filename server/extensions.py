from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from flask_session import Session

# Create blank database manager to act as a placeholder for models and routes
db = SQLAlchemy()

# Create real-time communication manager
# - cors allows connection from any website for testing
# - manage-session=false tell flask to handle sessions
socketio = SocketIO(cors_allowed_origins="*", manage_session=False)

# Blank placeholder for server-side user sessions
server_session = Session()