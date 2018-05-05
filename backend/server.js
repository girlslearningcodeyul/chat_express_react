const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const fs = require('fs')

app.use(bodyParser.raw({ type: "*/*" }))


// const server = require('http').createServer(app); //npm install http
// const io = require('socket.io')(server); //npm install socket.io --save
// io.on('connection', function () { /* … */ });

// io.on('connection', function (socket) {
//     console.log('a user connected');
// });

let serverState = {
    messages: []
}

let sessionInfo = {}; //store session IDs in the sessionInfo class

let info = {}; //store the accounts here

try {
    info = JSON.parse(fs.readFileSync('../data/info.json').toString());//JSON.parse to turn into a javascript object
} catch (err) {
}

app.post("/messages", (req, res) => { //get messages
    let parsed = JSON.parse(req.body.toString());
    let sessionID = parsed.sessionID;
    //console.log(sessionID)
    //console.log(sessionInfo)
    if (!(sessionInfo[sessionID])) {
        res.send(JSON.stringify("STOP YOU HACKER!"))
    } else {

        res.send(JSON.stringify(serverState.messages));
    }
})

app.post("/sendMsg", (req, res) => { //receiving a msg and adding it to the messages aray
    let body = JSON.parse(req.body.toString());
    let sessionID = body.sessionID;
    let contents = body.contents; //content is a property of body being sent from the frontend
    let username = sessionInfo[sessionID];
    if (!username) {
        res.send("stop hacker you")
    } else {
        serverState.messages.push({ username, contents }); //parsing the inputs and adding them to the messages array
        res.send("sent messages to the front");
    }
})

app.post("/createAccount", (req, res) => {
    let parsed = JSON.parse(req.body.toString());
    let username = parsed.username;
    let password = parsed.password;

    if (info[username]) {
        //console.log(parsed);
        return res.send(JSON.stringify('account already exists'));
    }
    let sessionID = Math.floor(Math.random() * 10000000);
    sessionInfo[sessionID] = username;
    info[username] = password; //additing username and password to the associative map and storing it
    fs.writeFileSync('../data/info.json', JSON.stringify(info)); //write to file whenever the file changes
    // console.log(JSON.stringify({ username, password }));
    serverState.messages.push({ username, contents: ' has logged in' });
    res.send(JSON.stringify({ username, password, sessionID }));
})

app.post('/activeUsers', (req, res) => {
    info = JSON.parse(fs.readFileSync('../data/info.json').toString());
    res.send(info)
    console.log(info);
})

app.post("/login", (req, res) => {
    let parsed = JSON.parse(req.body.toString());
    let username = parsed.username;
    let password = parsed.password;
    let sessionID = Math.floor(Math.random() * 10000000); //generate session ID only at login
    if (info[username] === password) { //checks whether the password for the user matches the entered password
        sessionInfo[sessionID] = username;
        serverState.messages.push({ username, contents: 'just logged in' });
        res.send(JSON.stringify({ sessionID, username }));
    }
    else
        res.send(JSON.stringify("failure"));
})

app.listen(4000, () => console.log("App listening on port 4000!"));
