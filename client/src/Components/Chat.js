import React, { Component } from 'react'
import queryString from 'querystring'
import getUserMedia from 'getusermedia'
import Peer from 'simple-peer'
import './style.css'






export class Chat extends Component {

    state = {
        windowMessages: [],
        textArea: "",
        username: "",
        userList: [],
        videoList: [],
        showVideo: false
      };


      scrollToBottom = () => {
        this.messagesEnd.scrollIntoView({ behavior: "smooth" });
      }


      // Function for entering the room from the chat component
      enterRoom(e) {
        e.preventDefault()
        const room = queryString.parse(this.props.location.search)["?room"]
        const username = this.state.username
        this.props.socket.emit('connectRoom', {room, username}, (error) => {
            alert(error)
        })
        this.setState({username: ""})
    }

    // Handling message sending
    handleMessage(e) {
        e.preventDefault();
        let message = this.state.textArea
        if (message.length > 4000) {
            message = message.slice(0, 4000)
        }
        const user = this.props.user
        this.props.socket.emit('sendMessage', ({user, message}))
        this.setState({textArea: ""})
        }


    handleChange(e) {
        this.setState({[e.target.name]: e.target.value})
    }


    // Handler for calling specific user
    callUser = (e) => {
        const target = e.target.getAttribute('name')
        const caller = this.props.user
        this.props.socket.emit('video', {target, caller})
    }


    // Special handler to end call for BOTH users
    endCall = ()  => {
        const caller = this.props.user
        this.props.socket.emit('endcall', {caller})
    }





    componentDidMount () {
            
        // Messages processing
            this.props.socket.on('message', (message) => {
                let messageList = [...this.state.windowMessages]
                messageList.push(message)
                this.setState({windowMessages: messageList})

                //This code decides whether it should automatically scroll the chat to bottom
                if((this.messagesWhole.scrollHeight - this.messagesWhole.scrollTop) * 0.8 < this.messagesWhole.clientHeight) {
                    this.scrollToBottom();
                }

            })


            // The connection to the room from the chat component itself (when ?room=x)
            this.props.socket.on('connectRoom', ({user}) => {
                this.props.socket.emit('join', {user})
            })


            // Getting data on users in room
            this.props.socket.on('roomData', ({users}) => {
                let userList = users
                userList = userList.map((data) => {
                    return data.username
                })
                this.setState({userList})
            })



            // The video streaming part
            this.props.socket.on('video', ({target, caller}) => {


                    // In case the video call is already in process
                    if (this.state.showVideo === true) {
                        return
                    }

                    const caller1 = caller.username
                    const caller2 = target
                    const socket = this.props.socket

                    if(caller1 === caller2) {
                        console.log("You can't call yourself")
                        return
                    } else if (this.props.user.username === caller2 || this.props.user.username === caller1) {
                    this.setState({showVideo: true})




                    // Starting to use the camera and microphone; after that the p2p connection is established
                    getUserMedia({ video: true, audio: true }, (err, stream) => {
                        if (err) return console.error(err)

                        const peer = new Peer({
                            initiator: this.props.user.username === caller1,
                            trickle: false,
                            stream: stream
                        })

                        // Start\continue peer connection exchange
                        peer.on('signal', (data) => {
                            data = JSON.stringify(data)
                            if(this.props.user.username === caller2) {
                                socket.emit('exchange', ({ data, username: caller1 }))
                            } else {
                                socket.emit('exchange', ({data, username: caller2}))
                            }
                        })


                        // Exchanging peer data with sockets
                        socket.on('exchange', (data) => {
                            peer.signal(JSON.parse(data))
                        })


                        // Processing video data
                        peer.on('stream', (stream) => {
                            let video = this.videoChat
                            video.srcObject = stream;
                            video.play()
                        })



                        // In case other peer just closed the tab, the video should end
                        peer.on('error', () => {
                            console.log("Other peer is out")
                            const caller = this.props.user
                            socket.emit('endcall', {caller})
                        })


                        // Ending the call with the use of websockets (one hangs, both calls end)
                        socket.on('endcall', ({caller}) => {
                            if (caller === caller1 || caller === caller2) {
                                stream.getVideoTracks()[0].stop();
                                stream.getAudioTracks()[0].stop();
                                this.setState({showVideo: false})
                                peer.destroy()
                            }
                        })
                      })
                    } else {
                        return
                    }
            })
    }



    render() {
        return (
            <div>
                {/* if you get to the room without giving off your nickname, you will go through authorisation first */}
            { (this.props.user === "") ?
                <div className="centered-form">
                <div className="centered-form__box">
                    <h1>Enter name first</h1>
                    <form onSubmit={(e) => this.enterRoom(e)}>
                        <label>Display name</label>
                        <input type="text" name="username" placeholder="Display name"
                        value={this.state.username} onChange={(e) => this.handleChange(e)} required/>
                        <button>Join</button>
                    </form>
                </div>
            </div>
            :
            <div className="chat">
                <div className="chat__sidebar" id="sidebar">
                <h2 className="room-title">{this.props.user.room}</h2>
                <h3 className="list-title">Users</h3>
                <ul className="users">
                    {this.state.userList.map((data) => {
                        return(
                            <li className="users_call" title={`Call ${data}`} onClick={(e) => this.callUser(e)} name={data}>{data}</li>
                        )
                    })}
                </ul>
                <div className="bottomScroll" onClick={this.scrollToBottom}>

                </div>
                </div>
                <div className="chat__main">
                    <p>Chat application</p>
                    <div id="messages" className="chat__messages"
                    ref={(el) => { this.messagesWhole = el; }}>
                        {this.state.windowMessages.map((data) => {
                            return (
                                <div className="message__wrapper">
                                    <div className={this.props.user.username === data.username ? "message personal_message" : "message"}>
                                        <p>
                                            <span className="message__name">{data.username}</span>
                                            <span className="message__meta">{data.time}</span>
                                        </p>
                                        <p>{data.text}</p>
                                    </div>
                                </div>
                            )
                        })}
                        <div style={{ float:"left", clear: "both" }}
                            ref={(el) => { this.messagesEnd = el; }}>
                        </div>
                    </div>
                    <div className="compose">
                        <form id="message-form" onSubmit={(e) => this.handleMessage(e)}>
                                <input name="textArea" placeholder="Message"
                                 value={this.state.textArea} id="text" onChange={(e) => this.handleChange(e)}
                                 required autoComplete="off"/>
                                <button id="button">Send</button>
                        </form>
                    </div>
                    { (this.state.showVideo === true) ?
                    <div className="video__panel">
                        <video ref={(el) => { this.videoChat = el; }} className="video__window"></video>
                        <button onClick={this.endCall}>End call</button>
                    </div>
                    : null}
                </div>
            </div>}
            </div>
        )
    }
}

export default Chat
