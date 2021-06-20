const express = require('express');
const path = require('path')
const http = require('http');
const socketio = require('socket.io');
const badWords = require('bad-words');
const {generateMessageFormat, generateLocationFormat} = require('./utils/messages')
const {addUser,removeUser, getUser, getUsersInRoom} = require('./utils/users')

const PORT = process.env.PORT||3000;

const app = express();
const server = http.createServer(app)
const io = socketio(server);

const publicPath = path.join(__dirname, '../public')
app.use(express.static(publicPath));

// let count = 0

//io.on only used for connection
io.on('connection',(serverSocket)=>{
    console.log("new web serverSocket")

    // serverSocket.emit('message', generateMessageFormat('Welcome!'));

    // //broadcast -> send to everyone except the current socket
    // serverSocket.broadcast.emit('message',generateMessageFormat('A new user has joined the chat!'))

    serverSocket.on('join', ({username, room}, callback)=>{
        let {error, user} = addUser({
            id: serverSocket.id,
            username,
            room
        })

        console.log("error ", error)
        console.log("user ", user)

        if(error){
            return callback(error);
        }
        serverSocket.join(user.room);
        serverSocket.emit('message', generateMessageFormat({}, 'Welcome!')); //to current session

        console.log(`room ${user.room} username ${user.username}`)
        //broadcast -> send to everyone except the current socket
        serverSocket.broadcast.to(user.room).emit('message',generateMessageFormat({},`${user.username} has joined the chat!`)) //everyone is current room except self
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        }) //to everyone in current room
        
        callback();
    })

    serverSocket.on('sendMessage',(msg, callback)=>{
        const filter = new badWords();
        if(filter.isProfane(msg)){
            return callback('Rejected! Profane words not allowed')
        }
        let user = getUser(serverSocket.id);
        console.log(msg)
        io.to(user.room).emit('message',generateMessageFormat(user, msg));
        callback();
    })

    serverSocket.on('sendLocation',(coordinates, callback)=>{
        let user = getUser(serverSocket.id);
        io.to(user.room).emit('locationURL', generateLocationFormat(user, coordinates.latitude,coordinates.longitude))
        callback('Location Shared!')
    })

    //event name - disconnect - built in
    serverSocket.on('disconnect',()=>{
        console.log("A user disconnected ", serverSocket.id)
        let user = removeUser(serverSocket.id)
        
        if(user){
            io.to(user.room).emit('message',generateMessageFormat({}, `${user.username} left the chat!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            }) //to everyone in current room
        }
    })
    // socket.emit('countUpdated', count);

    // socket.on('increment',()=>{
    //     count++;
    //     // socket.emit('countUpdated', count) //emit to single connection
    //     io.emit('countUpdated', count) //to all the connections
    // })
})

server.listen(PORT,()=>{
    console.log(`server started at ${PORT}`)
})