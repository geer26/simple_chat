socket = io();

$(document).ready(function(){

    socket.emit('greet');
    socket.on('greet', function(){
        console.log('SERVER ANSVERED!');
    });

});