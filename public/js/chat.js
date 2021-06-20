const clientSocket = io();

// clientSocket.on('countUpdated',(count)=>{
//     console.log("count has been updated", count)
// })

// document.querySelector('#increment').addEventListener('click',()=>{
//     console.log("count should be incremented")
//     clientSocket.emit('increment');
// })

//elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#sendLocation')
const $messages = document.querySelector('#messages');

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix : true})

const autoScroll = ()=>{
    //get lastest message
    const newMessage = $messages.lastElementChild;

    //get height of latest msg
    const newMessageStyle = getComputedStyle(newMessage);
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

    //Visible height
    const VisibleHeight = $messages.offsetHeight

    //height of messages container
    const containerHeight = $messages.scrollHeight; //total height from first msg to last

    //how far scrolled
    const scrollOffset = $messages.scrollTop + VisibleHeight;

    console.log(containerHeight + " " + newMessageHeight + " " +  scrollOffset)
    if(containerHeight - newMessageHeight < scrollOffset){ //new message arrived
        $messages.scrollTop = $messages.scrollHeight
    }

}

clientSocket.on('message',(msg)=>{
    console.log(msg)
    const html = Mustache.render(messageTemplate,{
        text: msg.text,
        createdAt : moment(msg.createdAt).format('MM-DD-YYYY hh:mm A'),
        username : msg.user
    });
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll();
})

clientSocket.on('locationURL',(location)=>{
    console.log(location.locationURL);
    const html = Mustache.render(locationTemplate,{
        locationURL : location.locationURL,
        createdAt : moment(location.createdAt).format('MM-DD-YYYY hh:mm A'),
        username : msg.user
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll();
})

clientSocket.on('roomData', ({room, users})=>{
    const html = Mustache.render(sidebarTemplate, {
        users,
        room
    })
    document.querySelector('#sidebar').innerHTML = html
})


$messageForm.addEventListener('submit',(event)=>{
    event.preventDefault();
    //disable form
    $messageFormButton.setAttribute('disabled','disabled')


    // let userMsg = document.querySelector('input').value
    let userMsg = event.target.elements.message.value;

    clientSocket.emit('sendMessage', userMsg, (err)=>{
        //re-enable form (after message sent)
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if(err){
            return alert(err)
        }
        console.log('Delivered!')
    }) //last arg is acknowledgment
})

$sendLocationButton.addEventListener('click', ()=>{
    if(!navigator.geolocation){
        return alert('GeoLocation is not supported by your browser!')
    }
    $sendLocationButton.setAttribute('disabled','disabled');
    navigator.geolocation.getCurrentPosition((position)=>{
        // console.log(position.coords.latitude)
        // console.log(position.coords.longitude)
        clientSocket.emit('sendLocation', {latitude : position.coords.latitude, longitude: position.coords.longitude}, (status)=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log(status)
        })
    })
})

clientSocket.emit('join',{username, room}, (error)=>{
    if(error){
        alert(error);
        location.href = '/'
    }
    console.log('Joined successfully!')
})