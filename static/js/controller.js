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
socket.on('newmessage', function(data){
    console.log('SERVER SENT NEWMESSAGE');
});


//bejövő hibaüzenet, az 'error' eseménynévvel azonosítjuk
socket.on('error', function(data){
    console.log('SERVER SENT ERROR');
});


//send a greeting to the server
$('#greet').click(function(){
    socket.emit('greet', {message:'greeting from client'});
});


//univerzális függvény üzenetküldéshez
function send_message(e_name,message){
    socket.emit(e_name,message);
};