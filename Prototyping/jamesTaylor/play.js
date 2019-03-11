(function(){
    // probably should change this password
    var baseAddress="http://:milad@127.0.0.1:8080/requests/playlist.xml?";
    var NEXT = baseAddress + "command=pl_next";
    var PREVIOUS = baseAddress + "command=pl_previous";
    var PLAY = baseAddress + "command=pl_play";
    var PAUSE = baseAddress + "command=pl_forcepause";
    var request = Script.require('https://raw.githubusercontent.com/highfidelity/hifi-content/44a10a3fb07f3271307ef0a2c28429d51f696326/DomainContent/Hub/domainStars/modules/request.js').request;
    var type = null;
    var MESSAGE_CHANNEL = "JAMES_TAYLER";
    // Adding this in case we need a display of what file we are currently on.  Not sure if needed juyst yet.
    var fileMap = {
        "4": {
            name: "01-TTM-ShowOPEN.mov",
            id: "4",
            duration: "98"
        },
        "5": {
            name: "02-TTM-TheSOUND.mov",
            id: "5",
            duration: "90"
        },
        "6": {
            name: "03-TTM-History-VO.mov",
            id: "6",
            duration: "203"
        },
        "7": {
            name: "04-TTM-LooneyJAT.mov",
            id: "7",
            duration: "58"
        },
        "8": {
            name: "05-TTM-Kermit.mov",
            id: "8",
            duration: "49"
        },
        "9": {
            name: "06-TTM-TeenageTivo.mov",
            id: "9",
            duration: "119"
        },
        "10": {
            name: "07-TTM-JurassicJames.mov",
            id: "10",
            duration: "22"
        },
        "11": {
            name: "08-TTM-Use_As_Directed.mov",
            id: "11",
            duration: "109"
        },
        "12": {
            name: "09-TTM-ClassicVideoGames.mov",
            id: "12",
            duration: "34"
        },
        "13": {
            name: "10-TTM-GameMontage.mov",
            id: "13",
            duration: "29"
        },
        "14": {
            name: "11-TTM-Day_In_The_Life.mov",
            id: "14",
            duration: "99"
        },
        "15": {
            name: "12-TTM-Silhouettes.mov",
            id: "15",
            duration: "154"
        },
        "16": {
            name: "13-TTM-JohnnyTest.mov",
            id: "16",
            duration: "69"
        },
        "17": {
            name: "14-TTM-Being_Ob1-P1.mov",
            id: "17",
            duration: "45"
        },
        "18": {
            name: "15-TTM-Ob1-SoundBoard.mov",
            id: "18",
            duration: "15"
        },
        "19": {
            name: "16-TTM-Revenge_Of_Sith.mov",
            id: "19",
            duration: "29"
        },
        "20": {
            name: "17-TTM-Being_Ob1-P2.mov",
            id: "20",
            duration: "74"
        },
        "21": {

            name: "18-TTM-Tone_Wars.mov",
            id: "21",
            duration: "156"
        },
        "22": {
            name: "19-TTM-SimilarVoices.mov",
            id: "22",
            duration: "356"
        },
        "23": {
            name: "20-TTM-ShowEND.mov",
            id: "23",
            duration: "444"
        }
    };



    var TIMEOUT_INTERVAL_MS = 250;
    function callback(error, success) {
        if (error) {
            console.log(JSON.stringify(error));
        }
        
        if (success) {
            console.log(JSON.stringify(success));
        }
    }

    function messageReceived(channel, data){
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

    function Control(){

    }

    Control.prototype = {
        preload: function(id){
            var userData = JSON.parse(Entities.getEntityProperties(id,'userData').userData);
            type = userData.type;
            Messages.subscribe(MESSAGE_CHANNEL);
            Messages.messageReceived.connect(messageReceived);
        },
        mousePressOnEntity: function(){
            console.log("mouse pressed")
            switch(type){
                case "next":
                    Messages.sendMessage(MESSAGE_CHANNEL, 'next');
                break;
                case "previous":
                    Messages.sendMessage(MESSAGE_CHANNEL, 'previous');
                break;
                case "play":
                    Messages.sendMessage(MESSAGE_CHANNEL, 'play');
                break;
                case "pause":
                    Messages.sendMessage(MESSAGE_CHANNEL, 'pause');
                break;
            }
        },
        unload: function(){
            Messages.messageReceived.disconnect(messageReceived);
        }
    };

    return new Control();
});