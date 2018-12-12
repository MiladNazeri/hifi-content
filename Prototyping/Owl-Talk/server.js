"use strict";

process.title = 'node-chat';

// INIT
var webSocketServerPost = process.env.PORT,
    path = require('path'),
    fs = require('fs'),
    WebSocketServer = require('websocket').server,
    http = require('http');

// COLLECTION
var history = [],
    connectedUsers = [],
    clients = [];

// CONST
var HISTORY = 'history',
    MESSAGE = 'message';

// HELPERS
function htmlEntities(str) {
    return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

var server = http.createServer((request, response) => { });

server.listen(webSocketServerPost, () => {
    console.log((new Date()) + " Server is listening on port " + webSocketServerPost);
    console.log(server.address());
});

var wsServer = new WebSocketServer({ httpServer: server });

wsServer.on('request', (request) => {

    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');

    var connection = request.accept(null, request.origin);

    var index = clients.push(connection) - 1;

    console.log((new Date()) + ' Connection accepted.', request.origin, request.protocol, connection.protocol);

    if (history.length > 0) {
        connection.sendUTF(
            JSON.stringify({
                type: MESSAGE,
                data: history.slice(-10),
                connectedUsers: connectedUsers
            })
        )
    }

    // MESSAGE TYPES
    var TYPE = "type",
        NEW_USER = "newUser",
        REMOVE_USER = "removeUser",
        USERNAME = "username",
        DISPLAYNAME = "displayName",
        UPDATE_CONNECTED_USERS = "updateconnectedUsers";

    connection.on('message', (message) => {
        // var parseMessage = JSON.parse(message);
        if (message.type === 'utf8') {
            try {
                var parsedMessage = JSON.parse(message.utf8Data);
            } catch (e) {
                console.log(e);
            }
            console.log((new Date()) + ' Received Message from message.utf8Data');
            
            console.log("ROBIN", JSON.stringify(parsedMessage));

            var type = parsedMessage[TYPE] || "message";
            var json;

            switch (type) {
                case NEW_USER:

                    console.log("NEW USER or UPDATE DISPLAY NAME");
                    
                    var username = parsedMessage[USERNAME];
                    var displayName = parsedMessage[DISPLAYNAME];
                    addUserOrUpdateDisplayName(username, displayName);
              
                    json = JSON.stringify({
                        type: UPDATE_CONNECTED_USERS,
                        data: connectedUsers
                    });
                    
                    break;
                case REMOVE_USER:
                    var username = parsedMessage[USERNAME];
                    removeUser(username);
                
                    console.log("Remove user", username);
                
                    json = JSON.stringify({
                        type: UPDATE_CONNECTED_USERS,
                        data: connectedUsers
                    });
                    
                    break;
                default:
                    // regular message

                    var messageObj = {
                        time: (new Date()).getTime(),
                        to: parsedMessage.to,
                        text: parsedMessage.message,
                        author: parsedMessage.author || "default"
                    };
                    history.push(messageObj);
                    history = history.slice(-100);

                    // var sendHistory = history.slice(-10);
                    var sendHistory = history;
                    json = JSON.stringify({
                        type: MESSAGE,
                        data: sendHistory
                    });

                    break;

            }

            console.log(json);

            for (var i = 0; i < clients.length; i++) {
                clients[i].sendUTF(json);
            }
        }
    });

    function removeUser(username) {
        var index = getUserIndex(username); 
        
        connectedUsers.indexOf(username);
        if (index) {
            connectedUsers.splice(index, 1);
        }
    }

    function addUserOrUpdateDisplayName(username, displayName) {
        var index = getUserIndex(username);

        if (!index) {
            console.log("ADD USER", index);
            // add user to list
            var newUser = {};
            newUser[USERNAME] = username;
            newUser[DISPLAYNAME] = displayName;

            connectedUsers.push(newUser);
        } else {
            console.log("UPDATE DN", index, displayName);
            connectedUsers[index][DISPLAYNAME] = displayName;
        }
    }

    function getUserIndex(username) {
        var index;
        
        connectedUsers.map((user, idx) => {
            if (user.username === username) {
                index = idx;
            }
        });

        return index;
    }

    connection.on('close', (connection) => {
        console.log((new Date()) + " Peer " + connection.remoteAddresses + " disconnected.");
        clients.splice(index, 1);
    });
})