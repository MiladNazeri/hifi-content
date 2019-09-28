//
//  Easy Status Updater
//  statusUpdate.js
//  Created by Milad Nazeri on 2019-04-02
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
//  Update Your Status
//



(function(){
    var textHelper = new (Script.require('./textHelper.js'));
    var lineHeight = 0.290;
    var textSizeBuffer = 1.09;
    var DEFAULT_HEIGHT = 0.275;
    var SECOND_MS = 1000;
    var MINUTES_MS = SECOND_MS * 60;
    var HOUR_MS = MINUTES_MS * 60;
    var CALI_TIME = HOUR_MS * 7;
    var props = {};
    var connected = false;

    function StatusUpdater(){

    }

        // Handle clicking on entity
        function handleNewStatus(){
            var newDate = Date.now();
            newDate = new Date(newDate - CALI_TIME);
    
            var month = ("" + newDate.getMonth()).length === 1 ? 
                "0" + (+newDate.getMonth() + 1) : (+newDate.getMonth() + 1);
            var day = ("" + newDate.getDay()).length === 1 ? 
                "0" + newDate.getDay() : newDate.getDay();
            var hour = ("" + newDate.getHours()).length === 1 ? 
                "0" + newDate.getHours() : newDate.getHours();
            var minutes = ("" + newDate.getMinutes()).length === 1 ? 
                "0" + newDate.getMinutes() : newDate.getMinutes();
    
            // var dateString = hour + ":" + minutes;
            // newStatusText = newStatusText ? newStatusText : ""
            // var finalStatus = dateString + "\n" + newStatusText;
            // console.log("dateString: ", dateString.length, "newStatusText", newStatusText.length);
            // var textToSet = dateString.length > newStatusText.length ? dateString : newStatusText;
            // console.log("text to set", textToSet);
            textHelper
                .setText(newStatusText)
                .setLineHeight(lineHeight);
            console.log("newStatusText", newStatusText)
            var textXDimension = textHelper.getTotalTextLength();
            var newDimensions = [textXDimension * textSizeBuffer, lineHeight * textSizeBuffer, 0];
                props.text = newStatusText;
                props.lineHeight = lineHeight;
                props.dimensions = newDimensions; 
                props.font = "Inconsolata";
                props.textEffectThickness = 5.5
            Entities.editEntity(textID, props);
        }

    var newStatusText = "";
    var promptText = "Enter your status.  Leave it blank to hide the status bar";
    function newStatus(){
        // if (connected) {
        //     Controller.keyPressEvent.disconnect(keyPressHandler);
        //     connected = false;
        // }
        newStatusText = Window.promptAsync(promptText, newStatusText);
    }


    function onPromptTextChanged(_newStatusText, _lineHeight) {
        console.log("_newStatusText: ", _newStatusText, "  _lineHeight: ", _lineHeight)
        if (!_newStatusText){
            Entities.editEntity(textID, {visible: false});
        } else {
            Entities.editEntity(textID, {visible: true});
        }
        newStatusText = _newStatusText;
        lineHeight = _lineHeight;
        handleNewStatus();
        // if (!connected) {
        //     Controller.keyPressEvent.connect(keyPressHandler);
        //     connected = true;
        // }
    }

    var messageChannel = "stuff";
    Messages.subscribe(messageChannel);
    function onMessageReceived(channel, message) {
        if (channel === messageChannel) {
            message = JSON.parse(message);
            console.log("message.message", message.message);
            if (!message.message){
                Entities.editEntity(textID, {visible: false});
            } else {
                newStatusText = message.message;                
                Entities.editEntity(textID, {visible: true});
                console.log("NewSTATUS TEXT\n\n", newStatusText);
            }
            if (!message.size) {
                lineHeight = DEFAULT_HEIGHT;
            } else {
                lineHeight = message.size;
            }
            handleNewStatus();
        }
    }
    Messages.messageReceived.connect(onMessageReceived);
    // Get the Button position and text entity ID
    var textID;
    function preload(id){
        textID = id;
        // Window.promptTextChanged.connect(onPromptTextChanged);
        // newStatus();
        // if (!connected) {
        //     Controller.keyPressEvent.connect(keyPressHandler);
        //     connected = true;
        // }
    }

    // function keyPressHandler(event) {
    //     if (event.text.toUpperCase() === "S" && event.isShifted && event.isControl){
    //         newStatus();
    //     }
    // }

    function unload() {
        Messages.messageReceived.disconnect(onMessageReceived);
    }

    StatusUpdater.prototype = {
        preload: preload,
        unload: unload
    };

    return new StatusUpdater();
})


//
//  Easy Status Updater
//  statusUpdate.js
//  Created by Milad Nazeri on 2019-04-02
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
//  Update Your Status
//
