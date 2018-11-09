// Kayla-Camera.js
//
// Created by Milad Nazeri on 2018-06-19
//
// Copyright 2018 High Fidelity, Inc.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
// Helper for live events to capture camera positions

(function() {
    // Polyfills
    Script.require(Script.resolvePath('./Polyfills.js'));

    // Init
    var isAppActive = false,
        isTabletUIOpen = false,
        invisibleAvatarURL = "http://hifi-content.s3.amazonaws.com/ozan/dev/avatars/invisible_avatar/invisible_avatar.fst",
        cameraAvatarURL = "https://hifi-content.s3.amazonaws.com/jimi/avatar/camera/fst/camera.fst",
        SETTINGS_STRING = "io.td.settings",
        LOAD_JSON = "loadJSON",
        AUDIO_LISTENER_MODE_HEAD = 0,
        AUDIO_LISTENER_MODE_CAMERA = 1,
        AUDIO_LISTENER_MODE_CUSTOM = 2,
        UPDATE_CONFIG_NAME = "updateConfigName",
        ENABLE_CUSTOM_LISTENER = "enableCustomListener",
        DISABLE_CUSTOM_LISTENER = "disableCustomListener",
        UPDATE_CUSTOM_LISTENER = "updateCustomListener",
        ADD_CAMERA_POSITION = "addCameraPosition",
        EDIT_CAMERA_POSITION_KEY = "editCameraPositionKey",
        REMOVE_CAMERA_POSITION = "removeCameraPosition",
        EDIT_CAMERA_POSITION_NAME = "editCameraPositionName",
        CHANGE_AVATAR_TO_CAMERA = "changeAvatarToCamera",
        CHANGE_AVATAR_TO_INVISIBLE = "changeAvatarToInvisible",
        TOGGLE_AVATAR_COLLISIONS = "toggleAvatarCollisions",

        CHANGE_MIDI_DEVICE = "changeMidiDevice",
        CHANGE_MIDI_CHANNEL = "changeMidiChannel",
        
        START_LISTEN_TO_MIDI_KEY = "startListenToMidiKEy",
        STOP_LISTEN_TO_MIDI_KEY = "stopListenToMidiKEy",


        INPUT = false,
        OUTPUT = true,
        ENABLE = true,
        DISABLE = false,
        UPDATE_UI = "update_ui";

    // Collections
    var defaultSettings = {
        configName: "Rename config",
        mapping: {},
        midi: {
            currentMidiNote: 0,
            isListening: false,
            midiInDevice: "test",
            midiInDeviceId: "test2",
            midiChannel: "test3",
            midiInDeviceList: ["A", "b"],
            midiChannelList: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]
        },
        listener: {
            isCustomListening: false,
            currentMode: getCurrentListener(),
            customPosition: {
                x: 0,
                y: 0,
                z: 0
            },
            customOrientation: {
                x: 0,
                y: 0,
                z: 0,
                w: 0
            }
        }
    };
    var settings;
    var oldSettings = Settings.getValue(SETTINGS_STRING);
    console.log("oldSettings", JSON.stringify(oldSettings));
    if (oldSettings === "") {
        settings = defaultSettings;
        Settings.setValue(SETTINGS_STRING, settings);
    } else {
        settings = oldSettings;
    }
    
    // Helper Functions
    function setAppActive(active) {
        // Start/stop application activity.
        if (active) {
            console.log("Start app");
            // TODO: Start app activity.
        } else {
            console.log("Stop app");
            // TODO: Stop app activity.
        }
        isAppActive = active;
    }

    function getPose() {
        return [MyAvatar.position, MyAvatar.headOrientation];
    }

    // Constructor Functions
    function Mapping(name, key, position, orientation) {
        this.name = name;
        this.key = key;
        this.position = position;
        this.orientation = orientation;
    }

    // Procedural Functions
    function midiConfig(){
        Midi.thruModeEnable(DISABLE);
        Midi.broadcastEnable(DISABLE);
        Midi.typeNoteOffEnable(ENABLE);
        Midi.typeNoteOnEnable(ENABLE);
        Midi.typePolyKeyPressureEnable(DISABLE);
        Midi.typeControlChangeEnable(ENABLE);
        Midi.typeProgramChangeEnable(ENABLE);
        Midi.typeChanPressureEnable(DISABLE);
        Midi.typePitchBendEnable(ENABLE);
        Midi.typeSystemMessageEnable(DISABLE);
        getMidiInputs();
        getMidiDeviceId();
        unblockMidiDevice();

        settings.midi.midiInDevice = "test";
        settings.midi.midiInDeviceId = "test2";
        settings.midi.midiChannel = "test3";
        settings.midi.midiChannelList = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16];
    }
    
    function getMidiInputs(){
        var midiInDevices = Midi.listMidiDevices(INPUT);
        settings.midi.midiInDeviceList = midiInDevices;
        console.log(JSON.stringify(midiInDevices));
        doUIUpdate();
    }
    
    function getMidiDeviceId(){
        for (var i = 0; i < settings.midi.midiInDeviceList.length; i++){
            if (settings.midi.midiInDeviceList[i] == settings.midi.midiInDevice){
                settings.midi.midiInDeviceId = i;
            }
        }
    }
    
    function midiHardwareResetReceieved(){
        console.log("MIDI RESET")
        getMidiInputs();
        getMidiDeviceId();
        unblockMidiDevice();
        doUIUpdate();
    }

    function midiEventReceived(eventData) {
        console.log("EventData:", JSON.stringify(eventData));
        if (settings.midi.isListening) {
            console.log(eventData.note);
            settings.midi.currentMidiNote = eventData.note;
            doUIUpdate();
        }

        if (eventData.device !== settings.midi.midiInDeviceId || eventData.channel !== settings.midi.midiChannel){
            return;
        }
        var midiMappingKeys = Object.keys(settings.mapping).filter(function(key){
            return key !== "";
        });
        console.log(JSON.stringify(settings.mapping));
        console.log("KEYS: ", JSON.stringify(midiMappingKeys));
        midiMappingKeys.forEach(function(midiData) {
            console.log("midiData", midiData)
            console.log("checking notes:")
            console.log("settings:", settings.mapping[midiData].key);
            console.log("eventdata:", eventData.note);
            if (settings.mapping[midiData].key === eventData.note){
                print("Hitting note", eventData.note);
                var position = settings.mapping[midiData].position;
                var orientation = settings.mapping[midiData].orientation;
                MyAvatar.headOrientation = orientation;
                MyAvatar.position = position;
                return;
            }
        });
    }
    
    function unblockMidiDevice(){
        Midi.unblockMidiDevice(settings.midi.midiInDevice, INPUT);
    }

    function loadJSON(newSettings) {
        settings = newSettings;
    }

    function updateConfigName(name) {
        settings.configName = name;
    }

    function enableCustomListener() {
        settings.listener.isCustomListening = true;
        MyAvatar.audioListenerMode = MyAvatar.audioListenerModeCustom;
    }

    function disableCustomListener() {
        settings.listener.isCustomListening = false;
        MyAvatar.audioListenerMode = MyAvatar.audioListenerModeHead;
    }

    function updateCustomListener() {
        var pose = getPose();
        var listeningPosition = pose[0];
        var listeningOrientation = pose[1];
        MyAvatar.customListenPosition = listeningPosition;
        MyAvatar.customListenOrientation = listeningOrientation;
        settings.listener.customPosition = listeningPosition;
        settings.listener.customOrientation = listeningOrientation;
    }

    function addCameraPosition(name, key) {
        var pose = getPose();
        var mapping = new Mapping(name, key, pose[0], pose[1]);
        settings.mapping[key] = mapping;
    }

    function editCameraPositionKey(key, newKey) {
        var temp = settings.mapping[key];
        delete settings.mapping[key];
        settings.mapping[newKey] = temp;
        settings.mapping[newKey].key = newKey;
    }

    function getCurrentListener() {
        var currentListenerMode = MyAvatar.audioListenerMode;
        var returnedModeString = "";
        switch (currentListenerMode) {
            case AUDIO_LISTENER_MODE_HEAD:
                returnedModeString = "Head";
                break;
            case AUDIO_LISTENER_MODE_CAMERA:
                returnedModeString = "Camera";
                break;
            case AUDIO_LISTENER_MODE_CUSTOM:
                returnedModeString = "Custom";
                break;
            default:
        }
        return returnedModeString;
    }

    function removeCameraPosition(key) {
        if (settings.mapping[key]) {
            delete settings.mapping[key];
        }
    }

    function editCameraPositionName(key, name) {
        settings.mapping[key].name = name;
    }

    function changeAvatarToCamera() {
        MyAvatar.skeletonModelURL = cameraAvatarURL;
    }

    function changeAvatarToInvisible() {
        MyAvatar.skeletonModelURL = invisibleAvatarURL;
    }

    function toggleAvatarCollisions() {
        MyAvatar.collisionsEnabled = !MyAvatar.collisionsEnabled;
    }

    function keyPressHandler(event) {
        if (settings.mapping[event.text]) {
            var position = settings.mapping[event.text].position;
            var orientation = settings.mapping[event.text].orientation;
            MyAvatar.headOrientation = orientation;
            MyAvatar.position = position;
        }
    }
    
    function updateSettings() {
        Settings.setValue(SETTINGS_STRING, settings);
    }

    function changeMidiChannel(channel){
        settings.midi.midiChannel = channel;
        doUIUpdate();
    }

    function changeMidiDevice(device){
        settings.midi.midiInDevice = device;
        getMidiDeviceId();
        doUIUpdate();
    }

    function setMidiListening(isListening){
        settings.midi.isListening = isListening;
        doUIUpdate();
    }

    function setup() {
        tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
        tabletButton = tablet.addButton({
            text: buttonName,
            icon: "icons/tablet-icons/raise-hand-i.svg",
            activeIcon: "icons/tablet-icons/raise-hand-a.svg",
            isActive: isAppActive
        });
        if (tabletButton) {
            tabletButton.clicked.connect(onTabletButtonClicked);
        } else {
            console.error("ERROR: Tablet button not created! App not started.");
            tablet = null;
            return;
        }
        tablet.gotoHomeScreen();
        tablet.screenChanged.connect(onTabletScreenChanged);

        Controller.keyPressEvent.connect(keyPressHandler);

        Midi.midiMessage.connect(midiEventReceived);
        Midi.midiReset.connect(midiHardwareResetReceieved);

        midiConfig();
    }

    function doUIUpdate() {
        console.log("SETTINGs", JSON.stringify(settings));
        settings.listener.currentMode = getCurrentListener();
        tablet.emitScriptEvent(JSON.stringify({
            type: UPDATE_UI,
            value: settings
        }));
    }
    
    // Tablet
    var tablet = null,
        buttonName = "TD",
        tabletButton = null,
        APP_URL = Script.resolvePath('./Tablet/TD-Tablet.html'),
        EVENT_BRIDGE_OPEN_MESSAGE = "eventBridgeOpen",
        SET_ACTIVE_MESSAGE = "setActive",
        CLOSE_DIALOG_MESSAGE = "closeDialog";


    function onTabletButtonClicked() {
        // Application tablet/toolbar button clicked.
        if (isTabletUIOpen) {
            tablet.gotoHomeScreen();
        } else {
            // Initial button active state is communicated via URL parameter so that active state is set immediately without 
            // waiting for the event bridge to be established.
            tablet.gotoWebScreen(APP_URL + "?active=" + isAppActive);
        }
    }

    function onTabletScreenChanged(type, url) {
        // Tablet screen changed / desktop dialog changed.
        var wasTabletUIOpen = isTabletUIOpen;

        isTabletUIOpen = url.substring(0, APP_URL.length) === APP_URL; // Ignore URL parameter.
        if (isTabletUIOpen === wasTabletUIOpen) {
            return;
        }

        if (isTabletUIOpen) {
            tablet.webEventReceived.connect(onTabletWebEventReceived);
        } else {
            // setUIUpdating(false);
            tablet.webEventReceived.disconnect(onTabletWebEventReceived);
        }
    }

    function onTabletWebEventReceived(data) {
        // EventBridge message from HTML script.
        var message;
        try {
            message = JSON.parse(data);
        } catch (e) {
            return;
        }

        switch (message.type) {
            case EVENT_BRIDGE_OPEN_MESSAGE:
                doUIUpdate();
                break;
            case SET_ACTIVE_MESSAGE:
                if (isAppActive !== message.value) {
                    tabletButton.editProperties({
                        isActive: message.value
                    });
                    setAppActive(message.value);
                }
                tablet.gotoHomeScreen(); // Automatically close app.
                break;
            case LOAD_JSON:
                var settings = message.value;
                loadJSON(settings);
                updateSettings();
                doUIUpdate();
                break;
            case UPDATE_CONFIG_NAME:
                var name = message.value;
                updateConfigName(name);
                updateSettings();
                doUIUpdate();
                break;
            case ENABLE_CUSTOM_LISTENER:
                enableCustomListener();
                updateSettings();
                doUIUpdate();
                break;
            case DISABLE_CUSTOM_LISTENER:
                disableCustomListener();
                updateSettings();
                doUIUpdate();
                break;
            case UPDATE_CUSTOM_LISTENER:
                updateCustomListener();
                updateSettings();
                doUIUpdate();
                break;
            case ADD_CAMERA_POSITION:
                var name = message.value.name;
                var key = message.value.key;
                addCameraPosition(name, key);
                updateSettings();
                doUIUpdate();
                break;
            case EDIT_CAMERA_POSITION_KEY:
                var key = message.value.key;
                var newKey = message.value.newKey;
                editCameraPositionKey(key, newKey);
                updateSettings();
                doUIUpdate();
                break;
            case REMOVE_CAMERA_POSITION:
                var key = message.value;
                removeCameraPosition(key);
                updateSettings();
                doUIUpdate();
                break;
            case EDIT_CAMERA_POSITION_NAME:
                var name = message.value.name;
                var key = message.value.key;
                editCameraPositionName(key, name);
                updateSettings();
                doUIUpdate();
                break;
            case CHANGE_AVATAR_TO_CAMERA:
                changeAvatarToCamera();
                break;
            case CHANGE_AVATAR_TO_INVISIBLE:
                changeAvatarToInvisible();
                break;
            case CHANGE_MIDI_CHANNEL:
                var channel = message.value;
                changeMidiChannel(channel);
                break;
            case CHANGE_MIDI_DEVICE:
                var device = message.value;
                changeMidiDevice(device);
                break;
            case START_LISTEN_TO_MIDI_KEY:
                console.log("START LISTENING");
                console.log(JSON.stringify(settings));
                setMidiListening(true);
                // settings.midi.isListening = true;
                break;        
            case STOP_LISTEN_TO_MIDI_KEY:
                console.log("STOP LISTENING");
                setMidiListening(false);
                // settings.midi.isListening = false;
                break;
            case TOGGLE_AVATAR_COLLISIONS:
                toggleAvatarCollisions();
                break;
            case CLOSE_DIALOG_MESSAGE:
                tablet.gotoHomeScreen();
                break;
        }
    }

    // Main
    setup();

    // Cleanup
    function scriptEnding() {
        console.log("### in script ending");
        if (isAppActive) {
            setAppActive(false);
        }
        if (isTabletUIOpen) {
            tablet.webEventReceived.disconnect(onTabletWebEventReceived);
        }
        if (tabletButton) {
            tabletButton.clicked.disconnect(onTabletButtonClicked);
            tablet.removeButton(tabletButton);
            tabletButton = null;
        }
        tablet = null;
        Controller.keyPressEvent.disconnect(keyPressHandler);
        Midi.midiMessage.disconnect(midiEventReceived);
        Midi.midiReset.disconnect(midiHardwareResetReceieved);
    }

    Script.scriptEnding.connect(scriptEnding);
}());
