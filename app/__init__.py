from flask import Flask
from flask_socketio import SocketIO, emit

app = Flask(__name__)

socket = SocketIO(app)

users = []

from app import routes