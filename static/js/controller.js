socket = io();

var username = '';

//the greeting message returns
socket.on('greet', function(data){
    console.log('SERVER ANSVERED!');
});

//send a greeting to the server
$('#greet').click(function(){
    socket.emit('greet', {message:'greeting from client'});
});