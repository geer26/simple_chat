# a Flask framework importálása
from flask import Flask

#asszinkron kéréskezelő importálása
from flask_socketio import SocketIO, emit

#a szerver példányosítása
app = Flask(__name__)

#az asszinkron kéréskezelő példányosítása és a szerverhez csatolása
socket = SocketIO(app)

#felhasználók listájának létrehozása
users = []

#a route-ok importálása
from app import routes