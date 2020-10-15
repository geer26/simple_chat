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


#ellenőrzi, hogy a 'users' tárolóban létezik-e a paraméterként kapott név - kész
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


#mindenkinek küld üzenetet a tárolóban (egyedileg!!!) - kész
#"nyers" függvény, a parmétert formázás nélkül küldi!
def send_broadcast(message):
    for user in users:
        socket.emit('newmessage', message,  room=user['sid'])
    return True


#elküldi a paraméterként kapott felhasználónévnek a felhasználók listáját - kész
def send_userlist(username):
    sid = None

    #megkeressük a felhasználó session id-ját
    for user in users:
        if username == user['username']:
            sid = user['sid']
            break

    #a szoba neve lesz legfelül
    row = 'Lobby:'

    #végigiteráljuk a felhasználókat
    for user in users:
        #rendereljün a felhasználónevet tartalmazó elemet
        minirow = render_template('user_temp.html', username=user['username'])
        #az elemet hozzáadluk a lista végéhez
        row += minirow

    #a kész üzenet összeállítása, 110-es eseménykóddal - ld. eseménykódok
    message = {'event': 110, 'htm': row}

    #az üzenet küldése csak a felhasználónak
    socket.emit('newmessage', message, room=sid)

    #függvény vége
    return True


#itt küldjük szét a szerverüzeneteket a beszélgetésfolyamba, egy szöveget kap paraméterként - kész
def send_broadcast_byserver(message):

    #időbélyeg létrehozása és formázása
    now = datetime.now()
    timestamp = now.strftime('%Y.%b-%d.,%H:%M')

    #a szerverüzenet elem renderelése
    row = render_template('message_temp.html', message=message, server=1, timestamp=timestamp)

    # az új elem a beszélgetés folyamba és az eseménydódja, ami 101 (ld. kódlista!)
    message = {'event': 101, 'htm': row}

    #végigmegyünk minden felhasználón (nem úúúúúgy!)
    for user in users:
        # üzenet küldése a felhasználónak
        socket.emit('newmessage', message,  room=user['sid'])

    #függvény vége
    return True


#a kliensek üzeneteit küldjük szét - 201-es kód - kész
def broadcast_message(message):
    #az eredeti üzenet feladója
    sender = message['sender']

    #az eredeti üzenet szövege
    m = message['message']

    # időbélyeg létrehozása és formázása
    now = datetime.now()
    timestamp = now.strftime('%Y.%b-%d.,%H:%M')

    #végigmegyünk minden felhasználón (nem úúúúúgy!)
    for user in users:

        #ha a felhasználó a küldő
        if user['username'] == sender:
            row = render_template('message_temp.html', message=m, timestamp=timestamp)

        #ha a felhasználó nem a küldő
        else:
            row = render_template('message_temp.html', message=m, username=sender, timestamp=timestamp)

        # az új elem a beszélgetés folyamba és az eseménydódja, ami 101 (ld. kódlista!)
        message = {'event': 101, 'htm': row}

        #üzenet küldése a felhasználónak
        socket.emit('newmessage', message,  room=user['sid'])

    #függvény vége
    return True


#indexoldal (kezdőlap) kérés kezelése - ez szinkron kérés-válasz! - kész
@app.route('/')
def index():
    return render_template('index.html')


#asszinkron kérések kezelése

#belépések kezelése - kész
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

        send_broadcast_byserver(uname + ' csatlakozott a beszélgetéshez')

        #hozzáadjuk a felhasználót a felhasználólistába
        row = render_template('user_temp.html', username=uname)
        message = {'event':102, 'htm':row}
        send_broadcast(message)

    #ha létezik
    else:
        #hibaüzenetet küldünk
        emit('error', render_template('errormessage.html', message='Válassz másik nevet!'))

    #függvény vége


#kilépés kezelése
@socket.on('logout')
def logout(data):
    uname = data['username']
    deluser(uname)

    #megjelenítjük a szobában az értesítést
    '''now = datetime.now()
    timestamp = now.strftime('%Y.%b-%d.,%H:%M')
    row = render_template('message_temp.html', message=uname + ' kilépett a beszélgetésből!', server=1,
                          timestamp=timestamp)
    message = {'event': 101, 'htm': row}
    send_broadcast(message)'''

    #eltávolítjuk a felhasználót a felhasználólistából
    '''message = {'event':103, 'username': uname}
    send_broadcast(message)'''


#hibaüzenet kérelmek kezelése - kész
@socket.on('req_error')
def error(data):
    #kinyerjük a hibaüzenetet
    message = data['message']
    #lerendereljünk a hibaüzenet html kódját
    page = render_template('errormessage.html', message=message)
    #elküldjük a kódot, a többit a kliens kezeli
    emit('error', page)
    #függvény vége
    return True


#eseménykódok
#1XX - szerveroldali események
#101 - új üzenet a beszélgetésfolyamba
#102 - felhasználóváltozás a felhasználóblokkban-belépés
#103 - felhasználóváltozás a felhasználóblokkban-kilépés
#110 - szerver elküldi a felhasználólistát
#2XX - kliensoldali események
#201 - új üzenet küldése mindenkinek
#203 - kliens kilépett
#210 - kliens lekéri a felhasználólistát


#új üzenetek kezelése - ide kellenek az eseménykódok - event dispatcher
@socket.on('newmessage')
def newmessage(data):
    print(data)
    if data['event'] == 201:  #egyik kliens üzenetet küldött
        broadcast_message(data)
        return
    if data['event'] == 210:  #Egy kliens lekéri a felhasználólistát
        send_userlist(data['username'])
        return


#szerver indítása
if __name__ == '__main__':
    app.run()