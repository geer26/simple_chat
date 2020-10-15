//websocket létrehozása és inicializálása - kész
socket = io();

//felhasználónév tárolása - kész
var username = '';

//lefut, amit az oldal betöltődött - ld.: jquery document events - kész
$( document ).ready(function(){
    // ha a felhasználónak nincs neve, elrejti a kilépés gombot - kész
    if (username == ''){
        $('#logout').hide();
        $('#uname').show();
        $('#login').show();
    } else {
    //ha van név, elrejti a belépésgombot és a név inputját - kész
        $('#uname').hide();
        $('#login').hide();
        $('#logout').show();
    }
});


//lefut a böngésző, vagy a böngészőablak bezárásakor
$(window).on('beforeunload', function(){
    var message = {event: 299, username:username};
    send_message('newmessage', message)
});


//eseménykódok

//1XX - szerveroldali események
//101 - új üzenet a beszélgetésfolyamba
//102 - felhasználóváltozás a felhasználóblokkban-belépés
//103 - felhasználóváltozás a felhasználóblokkban-kilépés
//110 - szerver elküldi a felhasználólistát

//2XX - kliensoldali események
//201 - új üzenet küldése mindenkinek
//210 - kliens lekéri a felhasználólistát
//299 - a kliens kilép (felhasználónévvel!)

//bejövő új üzenet, a 'newmessage' eseménynévvel azonosítjuk - kész
// ez a függvény lesz az event dispatcher - szétosztja a BEJÖVŐ!!! eseményeket
// azok eseménykódja alapján
socket.on('newmessage', function(data){
    switch (data['event']){
        case 101:
            showmessage(data);
            break;
        case 102:
            adduser(data);
            break;
        case 103:
            //console.log(data);
            deluser(data['username']);
            break;
        case 110:
            refresh_userlist(data);
            break;
    }
});


//gépeléskor ellenőrizzük az üzenethosszt - kész
$('#ac_message').keyup(function(){

    //az aktuális hossz deklarálása
    var l = 25-$('#ac_message').val().length;

    //ha az aktuális hoszs nagyobb, mint a megadott, csonkoljuk a végét
    if( l <= 0 ){
        var str = $('#ac_message').val();
        $('#ac_message').val(str.slice(0,25));
    }
    //frissítjük az üzenet hosszát
    l = 25-$('#ac_message').val().length;
    //felülírjuk a számláló tartalmát
    $('#counter').text("(" + l + ")");

});


//bejövő hibaüzenet, az 'error' eseménynévvel azonosítjuk - kész
socket.on('error', function(data){
    $('#if').children().hide();
    $('#if').append(data);
    $('#error_modal').show();
    $('#cancel_error').click(function(){
        $('#error_modal').remove();
        $('#if').children().show();
    });
});


//belépés kezelése - kész
socket.on('login', function(data){

    //a szerver által küldött adatok szerializálása
    data = JSON.parse(data);

    //ha minden rendben, akkor:
    if(data['status'] == 0 ){
        //a felhasználónév legyen az inputbox tartalma
        username = $('#uname').val();

        //inputbox ürítése, eltüntetése, a loginbutton eltüntetése, a logout button megjelenítése
        $('#uname').val('');
        $('#uname').hide();
        $('#login').hide();
        $('#logout').show();
        //üzenet az egész szobának! - ezt a szerver végzi, nem kell külön kérés!

        //lekérem a felhasználók listáját - itt jelennek meg először az eseménykódok!
        //eddig a pontig eseménynevekkel dolgoztunk, illetve a hibaüzenetek maradtak eseménynévvel hivatkozott elemek!
        send_message('newmessage', {event: 210, username: username})
    };

});


//kilépés kezelése
$('#logout').click(function(){

    //üzenet összeállítása és elküldése a szervernek
    var message = {event: 299, username:username};
    send_message('newmessage', message)

    //kérdés: kiürítsük a tárolókat?

    //belépésgomb és felhasználónév input megjelenítése
    username = '';
    $('#logout').hide();
    $('#uname').show();
    $('#uname').val('');
    $('#login').show();
});


//az üzenetküldés eseményvezérlője - kész
$('#send_icon').click(function(){

    //ha nincs bejelentkezve, hibaüzenetet kérünk
    if( !username){
        send_message('req_error', {message:'A hozzászóláshoz jelentkezz be!'});
    }

    //ha nincs szöveg a beviteli mezőben, hibaüzenetet kérünk
    else if( !$('#ac_message').val() ){
        send_message('req_error', {message:'HELLO ÜRES A MEZŐ, HE!'});
    }

    else{
        //ha van benne szöveg, be is vagyunk jelentkezve, elküldjük a szervernek a felhasználónévvel
        send_message('newmessage', {event:201 , sender:username, message: $('#ac_message').val()})
        //és kitöröljük az input tartalmát
        $('#ac_message').val('');
        $('#counter').text('(25)');
    }
});


// belépés a szobába - kész
$('#login').click(function(){
    //ha üres a név input, akkor hibaüzenet
    if (!$('#uname').val()){
        send_message('req_error', {message:'Adj meg egy egyedi felhasználónevet!'});
    } else{
    //ha nem üres, elküldjük a szervernek
        send_message('login', {username: $('#uname').val()})
    }
});


//univerzális függvény üzenetküldéshez
//a scriptben azonosított hiba esetén pl. send_message('req_error', hibaüzenet) - kész
function send_message(e_name,message){
    socket.emit(e_name,message);
};


//a paraméterként kapott elem hozzáadása a felhasználók blokkhoz - kész
function adduser(data){
    $('#users').append(data['htm']);
};


//a paraméterként kapott id-jű elem eltávolítása a felhasználók blokkból
function deluser(data){
    console.log('HELLO! ' + data + ' should be removed!');
    $('#users').remove($('#data'));
};


//üzenet elem megjelenítése az üzenetfolyamban - kész
function showmessage(data){
    $('#messages').append(data['htm']);
};


//felhasználólista frissítése a kapott elemre - kész
function refresh_userlist(data){
    $('#users').empty();
    $('#users').append(data['htm']);
};