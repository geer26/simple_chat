//websocket létrehozása és inicializálása
socket = io();

//felhasználónév tárolása
var username = '';

//lefut, amit az oldal betöltődött - ld.: jquery document events
$( document ).ready(function(){
    // ha a felhasználónak nincs neve, elrejti a kilépés bombot
    if (username == ''){
        $('#logout').hide();
        $('#uname').show();
        $('#login').show();
    } else {
    //ha van név, elrejti a belépésgombot és a név inputját
        $('#uname').hide();
        $('#login').hide();
        $('#logout').show();
    }
});


//bejövő új üzenet, a 'newmessage' eseménynévvel azonosítjuk
//eseménykódok!!!
// 1XX - szerveroldali események
// 101 - új üzenet a beszélgetésfolyamba
// 102 - felhasználóváltozás a felhasználóblokkban-belépés
// 103 - felhasználóváltozás a felhasználóblokkban-kilépés
// 2XX - kliensoldali események
// 201 - új üzenet küldése mindenkinek
socket.on('newmessage', function(data){
    console.log('SERVER SENT NEWMESSAGE: ' + data);
    switch (data['event']){
        case 101:
            showmessage(data);
            break;
        case 102:
            adduser(data);
            break;
        case 103:
            deluser(data);
            break;
    }
});


//bejövő hibaüzenet, az 'error' eseménynévvel azonosítjuk
socket.on('error', function(data){
    $('#if').children().hide();
    $('#if').append(data);
    $('#error_modal').show();
    $('#cancel_error').click(function(){
        $('#error_modal').remove();
        $('#if').children().show();
    });
});


//belépés kezelése
socket.on('login', function(data){

    //a stzerver által küldött adatok szerializálása
    data = JSON.parse(data);

    //ha minden rendben, akkor:
    if(data['status'] == 0 ){
        //a felhasználónév legyen az inputbox tartalma
        username = $('#uname').val();

        //inputbox ürítése, eltüntetése, a loginbutton eltüntetése, a logout button megjelenítése
        //majd üzenet a szobának
        $('#uname').val('');
        $('#uname').hide();
        $('#login').hide();
        $('#logout').show();
        //üzenet az egész szobának!
    };

});


//kilépés kezelése
$('#logout').click(function(){

    console.log('LOGOUT');
    send_message('logout', {username:username});
});

//az üzenetküldés eseményvezérlője
$('#send_icon').click(function(){

    //ha nem vagyunk bejelentkezve, hibaüzenetet kérünk
    if( !username){
        send_message('req_error', {message:'A hozzászóláshoz jelentkezz be!'});
    }

    //ha nincs szöveg a beviteli mezőben, hibaüzenetet kérünk
    else if( !$('#ac_message').val() ){
        send_message('req_error', {message:'HELLO ÜRES A MEZŐ, HE!'});
    }

    else{
        //ha van benne szöveg, be is vagyunk jelentkezve, elküldjük a szervernek a felhasználónévvel
        send_message('newmessage', {event:201 ,sender: username, message: $('#ac_message').val()})
        //és kitöröljük az input tartalmát
        $('#ac_message').val('');
    }
});


// belépés a szobába
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
//a scriptben azonosított hiba esetén pl. send_message('req_error', hibaüzenet)
function send_message(e_name,message){
    socket.emit(e_name,message);
};

//másik felhasználó belép, hozzáadás a felhasználói blokkba
function adduser(data){

};


//másik felhasználó kilép, eltávolítás a felhasználói blokkból
function deluser(data){
};


//üzenet megjelenítése az üzenetfolyamban
function showmessage(data){
};