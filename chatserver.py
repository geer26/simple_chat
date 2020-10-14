#framework és a többi lom importálása
from flask import Flask, render_template, json
import datetime


#asszinkron kéréskezelő importálása
from flask_socketio import SocketIO, emit


#a kiszolgáló példányosítása
app = Flask(__name__)


#asszinkron (websocket) kiszolgáló példányosítása
socket = SocketIO(app)


#ebben fogjuk tárolni a felhasználóneveket és a session id-ket
users = {}


#ellenőrzi, hogy a 'users' tárolóban létezik-e a paraméterként kapott név
def check_usernames(username):
    for user in users:
        if user['username'] == username:
            return True
    return False


#indexoldal (kezdőlap) kérés kezelése - ez szinkron kérés-válasz!
@app.route('/')
def index():
    return render_template('index.html')


#asszinkron kérések kezelése

@socket.on('login')
def login(data):
    print(data)


@socket.on('req_error')
def error(data):
    message = data['message']
    page = render_template('errormessage.html', message=message)
    emit('error', page)


@socket.on('newmessage')
def newmessage(data):
    print(data)


#szerver indítása
if __name__ == '__main__':
    app.run()