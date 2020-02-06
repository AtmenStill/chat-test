import React, { Component } from 'react'
import './style.css'




export class Form extends Component {

    state = {
        room: "",
        username: ""
    }


    handleSubmit(e) {
        e.preventDefault()
        const room = this.state.room
        const username = this.state.username
        this.props.socket.emit('connectRoom', {room, username}, (error) => {
            alert(error)
        })
        this.setState({room: "", username: ""})
    }

    handleChange(e) {
        const fieldName = e.target.name
        this.setState({ [fieldName]: e.target.value })
    }



    componentDidMount = async () =>  {

        // In case you pass, change location to another react component
        this.props.socket.on('connectRoom', ({user}) => {
            this.props.history.push(`/chat?room=${user.room}`)
            this.props.socket.emit('join', {user})
            })
        }
        




    render() {
        return (
            <div className="centered-form">
                <div className="centered-form__box">
                    <h1>Join</h1>
                    <form onSubmit={(e) => this.handleSubmit(e)}>
                        <label>Display name</label>
                        <input type="text" name="username" placeholder="Display name"
                        value={this.state.username} onChange={(e) => this.handleChange(e)} required/>
                        <label>Room</label>
                        <input type="text" name="room" placeholder="Room"
                        value={this.state.room} onChange={(e) => this.handleChange(e)} required/>
                        <button>Join</button>
                    </form>
                </div>
            </div>
        )
    }
}

export default Form
