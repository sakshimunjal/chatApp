const users = [];

const addUser = ({id, username, room})=>{
    //clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    //validate data
    if(!username || !room){
        return {
            error: 'Username and room are required'
        }
    }

    //check for existing user
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })

    //validate username
    if(existingUser){
        return {
            error: 'Username already taken'
        }
    }

    //store user
    let user = {id,username,room}
    users.push(user);
    return {user}
}


const removeUser = (id)=>{
    console.log(users)
    let index = users.findIndex((user)=>{
        return user.id === id;
    })

    if(index !== -1){
        return users.splice(index, 1)[0];
    }
}

const getUser = (id)=>{
    let index = users.findIndex(user => user.id === id);
    if(index !== -1){
        return users[index]
    }
    return {
        error: 'User not found!'
    }
}

const getUsersInRoom = (room)=>{
    let usersInRoom = users.filter(user => {
        return user.room === room.trim().toLowerCase()
    });
    if(usersInRoom.length > 0){
        return usersInRoom;
    }
    return {
        error: 'Room does not exist!'
    }
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}