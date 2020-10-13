#framework importálása
from flask import Flask, render_template

#asszinkron kéréskezelő importálása
from flask_socketio import SocketIO, emit

#a szerverosztály példányosítása
app = Flask(__name__)

socket = SocketIO()

#indexoldal (kezdőlap) kérés kezelése
@app.route('/')
def index():
    return render_template('index.html')

#asszinkron kérések kezelése
@socket.on('req_for_ansver')
def req(data):
    print(data)


#szerver indítása
if __name__ == '__main__':
    app.run()