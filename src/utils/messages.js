
const generateMessageFormat = (user, message)=>{
    return ({
        text : message,
        createdAt : new Date().getTime(),
        user : user.username? user.username : "Admin"
    })
}

const generateLocationFormat = (user, latitude, longitude)=>{
    return ({
        locationURL: `https://google.com/maps?q=${latitude},${longitude}`,
        createdAt: new Date().getTime(),
        user : user.username? user.username : "Admin"
    })
}

module.exports = {generateMessageFormat, generateLocationFormat}