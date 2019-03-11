
// probably should change this password
var baseAddress = "http://:milad@127.0.0.1:8080/requests/playlist.xml?";
var NEXT = baseAddress + "command=pl_next";
var PREVIOUS = baseAddress + "command=pl_previous";
var PLAY = baseAddress + "command=pl_play";
var PAUSE = baseAddress + "command=pl_forcepause";
var request = Script.require('https://raw.githubusercontent.com/highfidelity/hifi-content/44a10a3fb07f3271307ef0a2c28429d51f696326/DomainContent/Hub/domainStars/modules/request.js').request;
var type = null;
var MESSAGE_CHANNEL = "JAMES_TAYLER";

var TIMEOUT_INTERVAL_MS = 250;
function callback(error, success) {
    if (error) {
        console.log(JSON.stringify(error));
    }

    if (success) {
        // console.log(JSON.stringify(success));
    }
}

function messageReceived(channel, data) {
    console.log("messages")
    console.log("channel", channel)
    console.log("data", data)
    if (channel !== MESSAGE_CHANNEL) {
        return;
    }

    switch (data) {
        case "next":
            request(NEXT, callback);
            Script.setTimeout(function () {
                request(PAUSE, callback);
            }, TIMEOUT_INTERVAL_MS);
            break;
        case "previous":
            request(PREVIOUS, callback);
            Script.setTimeout(function () {
                request(PAUSE, callback);
            }, TIMEOUT_INTERVAL_MS);
            break;
        case "play":
            request(PLAY, callback);
            break;
        case "pause":
            request(PAUSE, callback);
            break;
    }
}


Messages.subscribe(MESSAGE_CHANNEL);
Messages.messageReceived.connect(messageReceived);

