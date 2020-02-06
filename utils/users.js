const users = []
const addUser = ({id, username, room}) => {
    if (!username || !room) {
        return {
            error: 'Username and room are required.'
        }
    } else {
        username = username.trim()
        room = room.trim()
    }
    //check for exitsting user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })


    //validate username
    if (existingUser) {
        return {
            error: 'Username is in use.'
        }
    }

    // Store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

// Remove user from backend
const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })
    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (username) => {
    const index = users.findIndex((user) => {
        // console.log(username)
        return user.username === username
    })
    user = users[index]
    if(!user) {
        return {}
    }
    return user
}


const getUsersInRoom = (room) => {
    room = room.trim()
    const UsersInRoom = users.filter((user) => 
        user.room == room
    )
    if(!UsersInRoom) {
        return {}
    }
    return UsersInRoom
}

const generateMessage = (username, text) => {
    let curtime = new Date().toLocaleString()
    return {
        username,
        text,
        time: curtime
    }
}





module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
    generateMessage
}