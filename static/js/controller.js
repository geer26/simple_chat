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

    data = JSON.parse(data);
    console.log(data);
    if(data[status] == 0){
        username = $('#uname').val();
        $('#uname').val('');
    }

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
        send_message('newmessage', {sender: username, message: $('#ac_message').val()})
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