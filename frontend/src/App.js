import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor() {
    super();

    //let usrnm = window.prompt("choose your username") // users are prompted to choose their username
    this.state = {
      messages: [],
      inputValue: "",
      inputUsernameValue: "",
      inputPasswordValue: "",
      invalidSessionID: false,
      inputUsernameCreate: "",
      inputPasswordCreate: ""
    }
  }

  handleChange = (e) => {
    this.setState({ inputValue: e.target.value }) //transforms the empty string to an event.target.value
    //happens when you type something into the input box
  }

  handleUsernameChange = (e) => {
    this.setState({ inputUsernameValue: e.target.value })
  }

  handlePasswordChange = (e) => {
    this.setState({ inputPasswordValue: e.target.value })
  }

  getMessages = () => {
    //fetching messages from the server
    let bod = JSON.stringify({ sessionID: this.state.sessionID })
    //console.log(bod);
    fetch('/messages', { method: "POST", body: bod })
      .then(response => response.text())
      .then((msg) => {
        //console.log(msg)
        this.setState({ messages: JSON.parse(msg) })

      })
  }

  handleSubmit = (e) => { //on Submit assigns username and content & requests it from the server
    e.preventDefault();
    let body = JSON.stringify({
      sessionID: this.state.sessionID,
      //username: this.state.inputUsernameValue,
      contents: this.state.inputValue
    })
    //console.log(body);
    fetch("/sendMsg", { method: "POST", body }) //fetch sends for the response
      //need a callback only if you want to process the response
      .then(response => response.text())
      .then(responseBody => {
        if (responseBody !== "success") {
          this.setState({ invalidSessionID: true })
        }
      })
    this.setState({ inputValue: "" }); //clear the msg after it's been entered
  }

  handleLoginSubmit = (e) => {
    e.preventDefault();
    let body = JSON.stringify({
      username: this.state.inputUsernameValue,
      password: this.state.inputPasswordValue
    })

    //console.log(JSON.parse(body).username);

    fetch('/login', { method: "POST", body: body })
      .then(response => response.text())
      .then(responseBody => {
        let parsed = JSON.parse(responseBody)
        let sessionID = parsed.sessionID
        //let username = parsed.username;
        //console.log(username);
        if (sessionID) {
          this.setState({ sessionID: sessionID })
          setInterval(this.getMessages, 250); //after login, fetch messages from the server, every 500s
        }
        else {
          this.setState({ loginFailed: "true" })
        }
      })
  }
  handleCreateAccount = (e) => {
    e.preventDefault();
    let body = JSON.stringify({
      username: this.state.inputUsernameCreate,
      password: this.state.inputPasswordCreate
    })
    fetch('/createAccount', { method: "POST", body: body })
      .then(response => response.text())
      .then(responseBody => {
        //console.log(responseBody);
        let parsed = JSON.parse(responseBody)
        if (typeof (parsed) === 'string') { //checking if the response is a string and if it is that means the message is error
          alert(parsed);
        } else {
          let username = parsed.username
          let password = parsed.password
          let sessionID = parsed.sessionID
          this.setState({ username, password, sessionID })
          setInterval(this.getMessages, 250);
        }
      })
  }

  handleUsernameCreate = (e) => {
    this.setState({ inputUsernameCreate: e.target.value })
  }

  handlePasswordCreate = (e) => {
    this.setState({ inputPasswordCreate: e.target.value })
  }

  renderLoginForm = () => {
    return (<div className="loginDiv"> login:
      <form onSubmit={this.handleLoginSubmit}>
        <div>username:
        <input type="text"
            onChange={this.handleUsernameChange}
            value={this.inputUsernameValue}>
          </input>
        </div>
        <div>
          password:
        <input type="text"
            onChange={this.handlePasswordChange}
            value={this.inputPasswordValue}>
          </input>
        </div>
        <input type="submit" ></input>
      </form>
    </div>)
  }

  renderActiveUsers = () => {
    fetch('/activeUsers')
      .then(response => response.text())
      .then(responseBody => {
        let parsed = JSON.parse(responseBody);
        console.log(parsed);
        this.setState({ username: parsed.username })
      })
  }

  renderCreateAccountForm = () => {
    return (<div className="accountDiv"> sign up:
    <form onSubmit={this.handleCreateAccount}>
        <div>new username:
          <input type="text"
            onChange={this.handleUsernameCreate}
            value={this.inputUsernameCreate}>
          </input>
        </div>
        <div>
          new password:
      <input type="text"
            onChange={this.handlePasswordCreate}
            value={this.inputPasswordCreate}>
          </input>
        </div>
        <input type="submit" ></input>
      </form>
    </div>)
  }

  render() {
    if (this.state.loginFailed) {
      return (<h1>Login Failed!</h1>)
    }
    if (!this.state.sessionID) {
      return (
        <div><h1>chat for bears</h1>
          <div className="accountPage">
            <div className="login">
              {this.renderLoginForm()}</div>
            <div className="create">
              {this.renderCreateAccountForm()}</div>
          </div>
        </div>
      );
    }


    //console.log(this.state)
    var sliceTen = Math.max(this.state.messages.length - 10, 0);
    var mapContents = msgs => <li>{msgs.username + ": " + msgs.contents}</li>
    var msgLst = this.state.messages.slice(sliceTen).map(mapContents);

    return (
      <div>
        <div className="topcontainer">
          <ul>
            {msgLst}
          </ul>
        </div>
        <div className="botcontainer">
          <form onSubmit={this.handleSubmit}>
            <div className="chat">
              <input className="inputBox"
                type="text"
                placeholder="bear say what"
                value={this.state.inputValue} //needed so that we could clear the input box whenever we wanted to 
                onChange={this.handleChange}>
              </input>
              <input type="submit" ></input>
            </div>
          </form>

        </div>
        <div className="activeUsers" onChange={this.renderActiveUsers}></div>

      </div>
    );
  }
}

export default App;
