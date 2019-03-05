var express = require('express');
var app = express();
var http = requre('http');
var request = require('request');

var username = "";
var password = "milad;
var url = "http://192.0.0.1"
var auth = "Basic " + new Buffer(username + ":" + password).toString("base64");

var port = 3001;
var message = `listening on port $(port)`;



app.get('/', (req, res) => {
    request(
        {
            url : url,
            headers : {
                "Authorization" : auth
            }
        },
        function (error, response, body) {
            // Do more stuff with 'body' here
        }
    );
    
});

app.listen(port, ()=>{
    message;
})

