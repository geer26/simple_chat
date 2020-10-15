#framework és a többi lom importálása
from flask import Flask, render_template, json, request, session
from datetime import datetime


#asszinkron kéréskezelő importálása
from flask_socketio import SocketIO, emit


#a kiszolgáló példányosítása
app = Flask(__name__)


#asszinkron (websocket) kiszolgáló példányosítása
socket = SocketIO(app)


#ebben fogjuk tárolni a felhasználóneveket és a session id-ket
users = []


#ellenőrzi, hogy a 'users' tárolóban létezik-e a paraméterként kapott név
def check_usernames(username):
    for user in users:
        if user['username'] == username:
            return True
    return False

#eltávolítja a felhasználót a tárolóból
def deluser(username):
    for user in users:
        if user['username'] == username:
            users.remove(user)
            return True
    return False

#mindenkinek küld üzenetet a tárolóban (egyedileg!!!)
def send_broadcast(message):
    for user in users:
        socket.emit('newmessage', message,  room=user['sid'])
    return True

def broadcast_message(message):
    for user in users:
        now = datetime.now()
        timestamp = now.strftime('%Y.%b-%d.,%H:%M')

        if user['username'] == message['sender']:
            row = render_template('message_temp.html', message=message['message'], timestamp=timestamp)
        else:
            row = render_template('message_temp.html', message=message['message'], username=message['username'], timestamp=timestamp)

        message = {'event': 101, 'htm': row}

        socket.emit('newmessage', message,  room=user['sid'])
    return True


#indexoldal (kezdőlap) kérés kezelése - ez szinkron kérés-válasz!
@app.route('/')
def index():
    return render_template('index.html')


#asszinkron kérések kezelése

#belépések kezelése
@socket.on('login')
def login(data):
    uname = data['username']

    #ha nem létezik:
    if not check_usernames(uname):
        #minden rendben
        data = json.dumps({'status':0})

        #hozzáadjuk a felhasználót (a nevével és az SID-vel) a felhasználók listájához
        usersession = {'username': uname, 'sid': request.sid}
        users.append(usersession)

        #elküldjük a kliensnek, hogy minden rendben
        emit('login', data)

        #megjelenítjük a szobában az értesítést
        now = datetime.now()
        timestamp = now.strftime('%Y.%b-%d.,%H:%M')
        row = render_template('message_temp.html', message=uname+' csatlakozott a beszélgetéshez!', server=1, timestamp=timestamp)
        message = {'event':101, 'htm':row}
        send_broadcast(message)

        #hozzáadjuk a felhasználót a felhasználólistába
        row = render_template('user_temp.html', username=uname)
        message = {'event':102, 'htm':row}
        send_broadcast(message)

    #ha létezik
    else:
        #hibaüzenetet küldünk
        emit('error', render_template('errormessage.html', message='Válassz másik nevet!'))


#kilépés kezelése
@socket.on('logout')
def logout(data):
    uname = data['username']
    deluser(uname)
    #megjelenítjük a szobában az értesítést
    #eltávolítjuk a felhasználót a felhasználólistából


#hibaüzenet kérelmek kezelése
@socket.on('req_error')
def error(data):
    #kinyerjük a hibaüzenetet
    message = data['message']
    #lerendereljünk a hibaüzenet html kódját
    page = render_template('errormessage.html', message=message)
    #elküldjük a kódot, a többit a kliens kezeli
    emit('error', page)


#új üzenetek kezelése
#eseménykódok!!!
#1XX - szerveroldali események
#101 - új üzenet a beszélgetésfolyamba
#102 - felhasználóváltozás a felhasználóblokkban-belépés
#103 - felhasználóváltozás a felhasználóblokkban-kilépés
#2XX - kliensoldali események
#201 - új üzenet küldése mindenkinek
@socket.on('newmessage')
def newmessage(data):
    if data['event'] == 201:
        broadcast_message(data)


#frissen belépett felhasználó
@socket.on('req_username')
def newuser(data):
    pass


#szerver indítása
if __name__ == '__main__':
    app.run()