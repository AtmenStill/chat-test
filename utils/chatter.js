const socketio = require('socket.io')
const {addUser, removeUser, getUser, getUsersInRoom, generateMessage} = require('./users')


class Chatter {
    constructor(server) {
        this.motd = "Welcome to the Super Ultimate Websocket Chat!"
        this.io = socketio(server)
        this.limited = []

        // Starting the new connection
        this.io.on('connection', (socket) => {

            // Creating user instance in certain room on the backend
            socket.on('connectRoom', ({room, username}, callback) => {
                const {error, user} = addUser({ id: socket.id, username, room })
                if (error) {
                    return callback(error)
                } else {
                    socket.emit('connectRoom', {user})
                }
            })

            // Adding user to the room on the frontend
            socket.on('join', ({user}) => {
                socket.emit('join', {user})
                socket.join(user.room)
        
                socket.emit('message', generateMessage("Admin", "Welcome! You can call any user in this room by clicking their nickname"))
                socket.broadcast.to(user.room).emit('message', generateMessage("Admin", `${user.username} has joined!`))
                this.io.to(user.room).emit('roomData', {
                    users: getUsersInRoom(user.room)
                })
            })

            // Message processing
            socket.on('sendMessage', ({user, message}) => {
                const criminal = this.limited.find((data) => data === user.username)
                if(!criminal) {
                    this.io.to(user.room).emit('message', generateMessage(user.username, message))
                }
                this.limited.push(user.username)
                setTimeout(() => this.limited.splice(this.limited.indexOf(user.username)), 1000)

            })


            // Special signal to establish connection between peers
            socket.on('video', ({target, caller}) => {
                this.io.to(caller.room).emit('message', generateMessage("Admin", `${caller.username} is trying to call ${target}`))
                this.io.to(caller.room).emit('video', {target, caller})

            })

            // Special signal to end call on both ends
            socket.on('endcall', ({caller}) => {
                const username = caller.username
                this.io.to(caller.room).emit('message', generateMessage("Admin", `${username} have ended the call`))
                this.io.to(caller.room).emit('endcall', {caller: username})
                
            })

            // Exchange between two peers
            socket.on('exchange', ({data, username}) => {
                const id = getUser(username).id
                socket.broadcast.to(id).emit('exchange', (data))
            })





            // Deleting user from both frontend and backend on disconnect
            socket.on('disconnect', () => {
                const user = removeUser(socket.id)
        
                if (user) {
                    this.io.to(user.room).emit('message', generateMessage("Admin", `${user.username} left the chat. Hope they'll be back.`))
                    this.io.to(user.room).emit('roomData', {
                        users: getUsersInRoom(user.room)
                    })
                }
        
                
            })



        
        })
    }
}



module.exports = Chatter