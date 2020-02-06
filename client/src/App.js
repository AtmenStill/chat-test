import React, { Component } from "react";

import "./App.css";
import Chat from "./Components/Chat";
import Form from "./Components/Form";

import { BrowserRouter as Router, Route} from "react-router-dom";

import socketTo from "socket.io-client";

// You can establish the socket connection to another server if you know the correct address
const socket = socketTo("localhost:4000");

export class App extends Component {
  state = {
    user: "",
    socket: socket
  };

  componentDidMount() {
    // Basically the main thing - adds user to state, which is heavily used in app
    socket.on('join', ({user}) => {
      this.setState({user})
    })
  }



  render() {
    return (
      <Router>
        <Route path="/" exact render={props => (<Form {...props} socket={this.state.socket}/>)}/>
        <Route path="/chat" render={props => (<Chat {...props} socket={this.state.socket} user={this.state.user}/>)}/>
      </Router>
    );
  }
}

export default App;
