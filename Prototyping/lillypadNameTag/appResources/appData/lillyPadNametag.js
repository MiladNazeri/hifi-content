//
//    User Inspector
//    Created by Milad Nazeri on 2019-02-16
//    Additional code by Zach Foxx
//    Copyright 2019 High Fidelity, Inc.
//
//    Distributed under the Apache License, Version 2.0.
//    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
//    Click on someone to get a nametag for them
//    

(function () {
    
    var PickRayController = Script.require('./resources/modules/pickRayController.js?' + Date.now());
    var NameTagListManager = Script.require('./resources/modules/nameTagListManager.js?' + Date.now());
    var pickRayController = new PickRayController();
    var nameTagListManager = new NameTagListManager().create();

    // Handles avatar being solo'd
    pickRayController
        .registerEventHandler(selectAvatar)
        .setType("avatar")
        .setMapName("hifi_userInspector")
        .setShouldDoublePress(true)
        .create();


    function selectAvatar(uuid, intersection) {
        nameTagListManager.handleSelect(uuid, intersection);
    }


    // Handles reset of list if you change domains
    function onDomainChange() {
        nameTagListManager.reset();
    }


    // Handles removing an avatar from the list if they leave the domain
    function onAvatarRemoved(uuid) {
        nameTagListManager.maybeRemove(uuid);
    }

    function onAvatarAdded(uuid) {
        nameTagListManager.maybeAdd(uuid);
    }


    // Called when the script is closing
    function scriptEnding() {
        nameTagListManager.destroy();
        pickRayController.destroy();
        Window.domainChanged.disconnect(onDomainChange);
        AvatarManager.avatarRemovedEvent.disconnect(onAvatarRemoved);
    }


    // Updates the current user scale
    function updateCurrentUserScaler() {
        var currentUserScaler = Settings.getValue("nametag/enabled", false);
        ui.sendMessage({
            app: "userInspector",
            method: "updateCurrentUserScaler", 
            currentUserScaler: currentUserScaler
        });
    }


    // Run when the tablet is opened
    function onOpened() {
        updateCurrentUserScaler();
    }


    // Register the initial userScaler if it was saved in your settings
    var currentUserScaler = Settings.getValue("nameTag/userScaler", 1.0);
    nameTagListManager.registerInitialScaler(currentUserScaler);
    function updateUserScaler(newSize){
        nameTagListManager.updateUserScaler(newSize);
    }


    // Enables or disables the app's main functionality
    var nameTagEnabled = Settings.getValue("nametag/enabled", false);
    function enableOrDisableNameTag() {
        if (nameTagEnabled) {
            pickRayController.enable();
        } else {
            pickRayController.disable();
            nameTagListManager.reset();
        }
    }


    // chose which mode you want the nametags in.  On, off, or persistent.
    var mode = Settings.getValue("nametag/mode", "on");
    nameTagListManager.changeMode(mode);
    function handleMode(type){
        mode = type;
        nameTagListManager.changeMode(mode);
        Settings.setValue("nametag/mode", "on");
    }


    function onMessage(message) {
        if (message.app !== "userInspector") {
            return;
        }
        switch (message.method) {
            case "eventBridgeReady":
                ui.sendMessage({
                    app: "userInspector",
                    method: "updateUI",
                    nameTagEnabled: nameTagEnabled,
                    currentUserScaler: currentUserScaler,
                    mode: mode
                });
                break;
            case "nametagSwitchClicked":
                nameTagEnabled = message.nameTagEnabled;
                Settings.setValue("nametag/enabled", nameTagEnabled);
                enableOrDisableNameTag();
                break;
            case "updateUserScaler":
                currentUserScaler = +message.currentUserScaler;
                Settings.setValue("nameTag/userScaler", currentUserScaler);
                updateUserScaler(currentUserScaler);
                break;
            case "handleMode":
                mode = message.mode;
                Settings.setValue("nameTag/mode", mode);
                handleMode(mode);
                break;
            default:
                console.log("Unhandled message from userInspector_ui.js: " + JSON.stringify(message));
                break;
        }
    }

    
    var BUTTON_NAME = "INSPECTOR";
    var APP_UI_URL = Script.resolvePath('resources/userInspector_ui.html');
    var AppUI = Script.require('appUi');
    var ui;
    function startup() {
        ui = new AppUI({
            buttonName: BUTTON_NAME,
            home: APP_UI_URL,
            // User by Craig from the Noun Project
            graphicsDirectory: Script.resolvePath("./resources/images/icons/"),
            onOpened: onOpened,
            onMessage: onMessage
        });


        Window.domainChanged.connect(onDomainChange);
        AvatarManager.avatarRemovedEvent.connect(onAvatarRemoved);
        AvatarManager.avatarAddedEvent.connect(onAvatarAdded);

        enableOrDisableNameTag();
    }


    Script.scriptEnding.connect(scriptEnding);
    startup();

})();