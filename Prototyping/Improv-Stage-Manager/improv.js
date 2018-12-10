/* eslint-disable camelcase */
"use strict";
/* eslint-disable indent */

//  Improv Stage Manager
//
//  Created by Milad Nazeri 
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
/* globals Tablet, Script, HMD, Controller, Menu */

(function () { // BEGIN LOCAL_SCOPE
    // NOTES
    // /////////////////////////////////////////////////////////////////////////
        /*
        */
    // Dependencies
    // /////////////////////////////////////////////////////////////////////////
        var 
            AppUi = Script.require('appUi'),
            defaults = Script.require('./defaults.js')
        ;

        Script.require(Script.resolvePath('./Polyfills.js'));

    // Consts
    // /////////////////////////////////////////////////////////////////////////
        var 
            URL = Script.resolvePath("./html/Tablet.html"),
            BUTTON_NAME = "IMPROV", // !important update in Tablet.js as well, MUST match Example.js
            
            EVENT_BRIDGE_OPEN_MESSAGE = BUTTON_NAME + "_eventBridgeOpen",

            // SNAPSHOT CONSTS
            TAKE_SNAPSHOT = "takeSnapshot",
            ADD_SNAPSHOT = "addSnapshot",
            LOAD_SNAPSHOT = "load_snapshot",
            ASSIGN_SNAPSHOT_TO_KEY = "assignSnapshotToKey",
            RENAME_SNAPSHOT = "renameSnapshot",
            REMOVE_SNAPSHOT = "REMOVE_SNAPSHOT",
            SAVE_SNAPSHOT_EDIT = "SAVE_SNAPSHOT_EDIT",
            SAVE_NEW_SNAPSHOT = "SAVE_NEW_SNAPSHOT",
            
            ADD_TRANSITION = "addTransition",
            EXECUTE_TRANSITION_BY_NAME = "executeTransitionByName",
            ASSIGN_TRANSITION_TO_KEY = "assignTransitionToKey",
            RENAME_TRANSITION = "RENAME_TRANSITION",
            REMOVE_TRANSITION = "REMOVE_TRANSITION",
            SAVE_NEW_TRANSITION = "SAVE_NEW_TRANSITION",
            SAVE_TRANSITION_EDIT = "SAVE_TRANSITION_EDIT",

            SAVE_SOUND_EDIT = "SAVE_SOUND_EDIT",
            ADD_SOUND = "ADD_SOUND",
            REMOVE_SOUND = "REMOVE_SOUND",
            UPDATE_POSITION = "UPDATE_POSITION",
            UPDATE_ORIENTATION = "UPDATE_ORIENTATION",

            CHANGE_DEFAULT_TRANSITION_TIME = "CHANGE_DEFAULT_TRANSITION_TIME",
            CHANGE_ALWAYS_TRANSITION_SNAPS = "changeAlwaysTransitionSnaps",
            

            UPDATE_UI = BUTTON_NAME + "_update_ui",

            LIGHTS_ACCENT_SPOT_HOUSE_LEFT = "Lights_Accent_Spot_House_Left",
            LIGHTS_ACCENT_SPOT_HOUSE_RIGHT = "Lights_Accent_Spot_House_Right",
            LIGHTS_ACCENT_SPOT_STAGE = "Lights_Accent_Spot_Stage",
            LIGHTS_HOUSE = "Lights_House",
            LIGHTS_MC_CENTER_SPOT = "Lights_MC-Center-Spot",
            LIGHTS_STAGE_ACCENT = "Lights_Stage-Accent",
            LIGHTS_STAGE_SPOT_MAIN_STAGE_RIGHT = "Lights_Stage_Spot_Main_Stage_Right",
            LIGHTS_STAGE_SPOT_MAIN_STAGE_LEFT = "Lights_Stage_Spot_Main_Stage_Left",
            LIGHTS_UPSTAGE_FILL_LEFT = "Lights_Upstage-Fill-Left",
            LIGHTS_UPSTAGE_FILL_RIGHT = "Lights_Upstage-Fill-Right",
            LIGHTS_ZONE_STAGE = "Lights_Zone_Stage",

            LIGHTS_ACCENT_SPOT_HOUSE = "Lights_Accent_Spot_House",
            LIGHTS_STAGE_SPOT_MAIN = "Lights_Stage_Spot_Main",
            LIGHTS_UPSTAGE_FILL = "Lights_Upstage-Fill",

            INTENSITY = "intensity",
            FALLOFF_RADIUS = "falloffRadius",
            VISIBLE = "visible",
            KEYLIGHT = "keyLight",
            AMBIENT_LIGHT = "ambientLight",
            AMBIENT_INTENSITY = "ambientIntensity",

            KEYLIGHT_INTENSITY = "keyLight.intensity",
            AMBIENT_LIGHT_INTENSITY = "ambientLight.ambientIntensity",

            DIRECTION_INCREASE = "direction_increase",
            DIRECTION_DECREASE = "direction_decrease",

            DEFAULT_TRANSITION_TIME = 2000,
            SETTINGS_STRING = "io.improv.settings",

            SNAPSHOT = "snapshot",
            TRANSITION = "transition",
            AUDIO = "audio"
        ;

    // Init
    // /////////////////////////////////////////////////////////////////////////
        var 
            ui,
            defaultDataStore = {
                snapshots: new Snapshots(),
                audio: new AudioLibrary(),
                defaultSnapshots: {
                    blackout: defaults.blackout,
                    improv_troop_full_wash: defaults.improv_troop_full_wash,
                    mc_wash: defaults.mc_wash,
                    mc_center: defaults.mc_center,
                    pre_post_show: defaults.pre_post_show,
                    workshop_wash: defaults.workshop_wash
                },
                defaultTransitions: {
                    blackout_to_mc_wash: {
                        name: "blackout_to_mc_wash",
                        from: "blackout",
                        to: "mc_wash",
                        duration: 3000,
                        key: "t"
                    },
                    mc_wash_to_blackout_: {
                        name: "mc_wash_to_blackout_",
                        from: "mc_wash",
                        to: "blackout",
                        duration: 3000,
                        key: "y"
                    }
                },
                currentPosition: [+MyAvatar.position.x.toFixed(3),+MyAvatar.position.y.toFixed(3),+MyAvatar.position.z.toFixed(3)],
                currentOrientation: [+MyAvatar.orientation.x.toFixed(3), +MyAvatar.orientation.y.toFixed(3), +MyAvatar.orientation.z.toFixed(3), +MyAvatar.orientation.w.toFixed(3)],
                choices: [
                    LIGHTS_ACCENT_SPOT_HOUSE,
                    LIGHTS_STAGE_SPOT_MAIN,
                    LIGHTS_UPSTAGE_FILL,

                    LIGHTS_ACCENT_SPOT_STAGE,
                    LIGHTS_HOUSE,
                    LIGHTS_ZONE_STAGE,
                    LIGHTS_MC_CENTER_SPOT,
                    LIGHTS_STAGE_ACCENT
                ],
                SnapshotProperties: [
                    INTENSITY,
                    FALLOFF_RADIUS,
                    [KEYLIGHT, INTENSITY],
                    [AMBIENT_LIGHT, AMBIENT_INTENSITY]
                ],
                mapping: {},
                currentAnimation: "",
                inTransition: false,
                ui: {
                    showLightAdd: false
                }
            },

            // oldSettings = Settings.getValue(SETTINGS_STRING),
            // dataStore = oldSettings === ""
            //     ? (Settings.setValue(SETTINGS_STRING, defaultDataStore), defaultDataStore)
            //     : oldSettings
            dataStore = defaultDataStore
        ;

    // Constructors
    // /////////////////////////////////////////////////////////////////////////
        function Mapping(name, key, type) {
            this.name = name;
            this.key = key;
            this.type = type;
        }   

        // Audio
        // ///////////////////////////////////////////////////////////////////////
            function Sound(url, name) {
                this.url = url;
                this.name = name;
                this.sound = SoundCache.getSound(url);
                console.log(this.sound);
                this.injector;
                this.SECS_TO_MS = 1000;
                this.fadeInTimer = null;
                this.fadeOutTimer = null;
                this.fadeInTime = 2000;
                this.fadeOutTime = 2000;
                this.percentChange = 0.01;
                this.fadeInDurationTimeStep = this.fadeInTime * this.percentChange;
                this.fadeOutDurationTimeStep = this.fadeOutTime * this.percentChange;
                this.fadeLevelStep = this.maxVolume * this.percentChange;
                this.fadeOutStarted = false;
                this.fadeOutStopped = false;
                this.fadeInStopped = false;
                this.fadeOutStopped = false;
                this.shouldFadeIn = true;
                this.shouldFadeOut = true;
                this.maxVolume = 1.0;
                this.minVolume = 0.0;
                this.currentVolume = 1.0;
                this.position = null;
                this.orientation = null;
                this.pitch = null;
                this.loop = false;
                this.secondOffset = null;
                this.localOnly = false;          
            }

            Sound.prototype = {
                changePosition: function(position) {
                    console.log("changing Position")
                    this.position = position;
                    if (this.injector) {
                        this.injector.setOptions({ position: this.position});
                    }
                },
                changeOrientation: function(orientation) {
                    console.log("changing Orientation")
                    this.orientation = orientation;
                    if (this.injector) {
                        this.injector.setOptions({ orientation: this.orientation });
                    }
                },
                changeSecondOffset: function(secondOffset) {
                    console.log("changing offset")

                    this.secondOffset = secondOffset;
                    if (this.injector) {
                        this.injector.setOptions({ secondOffset: this.secondOffset });
                    }
                },
                changeLoop: function(shouldLoop) {
                    console.log("changing loop")

                    this.loop = shouldLoop;
                    if (this.injector) {
                        this.injector.setOptions({ loop: this.loop });
                    }
                },
                changePitch: function(pitch) {
                    console.log("changing pitch")

                    this.pitch = pitch;
                    if (this.injector) {
                        this.injector.setOptions({ pitch: this.pitch });
                    }
                },
                changeFadeInTime: function(time) {
                    console.log("changing fadeintime")

                    this.fadeInTime = time;
                    this.fadeInTime * this.percentChange;
                },
                changeFadeOutTime: function(time){
                    console.log("changing fadeouttime")

                    this.fadeOutTime = time;
                    this.fadeOutTime * this.percentChange;
                },
                changeMaxVolume: function (volume) {
                    console.log("changing maxvolume")

                    this.maxVolume = Math.max(volume, 1.0);
                    this.fadeLevelStep = this.maxVolume * this.percentChange;
                },
                changeCurrentVolume: function (volume) {
                    console.log("changing currentvolume")
                    console.log("volume:", volume);
                    this.currentVolume = volume;
                    if (this.injector) {
                        console.log("setting options")
                        console.log("this.currentVolume", this.currentVolume);
                        this.injector.setOptions({ volume: this.currentVolume });
                    }
                },
                changeShouldFadeIn: function (shouldFadeIn) {
                    console.log("changeShouldFadeIn")

                    this.shouldFadeIn = shouldFadeIn;
                },
                changeShouldFadeOut: function (shouldFadeOut) {
                    console.log("changeShouldFadeOut")

                    this.shouldFadeOut = shouldFadeOut;
                },
                fadeIn: function () {
                    console.log("fadeIn")

                    var _this = this;
                    this.fadeInStarted = true;
                    if (this.injector && this.injector.isPlaying()){
                        this.fadeInTimer = Script.setInterval(function(){
                            console.log("Starting fade in")
                            console.log("_this.currentVolume", _this.currentVolume)

                            _this.currentVolume += _this.fadeLevelStep;
                            _this.currentVolume = Math.min(_this.maxVolume, _this.currentVolume);
                            _this.injector.setOptions({ volume: _this.currentVolume });
                            if (_this.currentVolume >= _this.maxVolume) {
                                _this.fadeInStarted = false;
                                Script.clearInterval(_this.fadeInTimer);
                            }
                        }, this.fadeInDurationTimeStep);
                    }
                },
                fadeOut: function () {
                    console.log("fadeOut")

                    var _this = this;
                    this.fadeOutStarted = true;
                    if (this.injector && this.injector.isPlaying()) {
                        console.log("_this.currentVolume", _this.currentVolume)
                        console.log("_this.minVolume", _this.minVolume);
                        console.log("_this.fadeLevelStep", _this.fadeLevelStep);
                        this.fadeOutTimer = Script.setInterval(function () {
                            console.log("stopping fade out");
                            _this.currentVolume -= _this.fadeLevelStep;
                            console.log(" _this.currentVolume After", _this.currentVolume)
                            _this.currentVolume = Math.max(_this.minVolume, _this.currentVolume);
                            _this.injector.setOptions({ volume: _this.currentVolume });
                            if (_this.currentVolume <= _this.minVolume) {
                                _this.fadeOutStarted = false;
                                _this.injector.stop();
                                _this.injector = null;
                                Script.clearInterval(_this.fadeOutTimer);
                            }
                        }, this.fadeOutDurationTimeStep);
                    }
                },
                getURL: function () {
                    return this.url;
                },
                getDurationSeconds: function () {
                    if (this.sound.downloaded) {
                        return this.sound.duration;
                    }
                },
                getDurationMS: function () {
                    if (this.sound.downloaded) {
                        return this.sound.duration * this.SECS_TO_MS;
                    }
                },
                play: function(restart) {
                    console.log("play")
                    if (this.fadeInStarted || this.fadeOutStarted) {
                        return;
                    }

                    if (this.injector && this.injector.isPlaying() && !restart) {
                        console.log("stop")

                        this.stop();
                        return;
                    }
                    if (this.injector && this.injector.isPlaying() && restart) {
                        console.log("restart")
                        this.unload();
                        this.play();
                        return;
                    }
                    this.playSoundStaticPosition();
                },
                playSoundStaticPosition: function (injectorOptions, bufferTime, onCompleteCallback, args) {
                    console.log("playSoundStaticPosition")
                    var _this = this;
                    var presetInjectorOptions = {};
                    this.position !== null && (presetInjectorOptions.position = this.position);
                    this.orientation !== null && (presetInjectorOptions.orientation = this.orientation);
                    this.volume !== null && (presetInjectorOptions.volume = this.maxVolume);
                    this.loop !== null && (presetInjectorOptions.loop = this.loop);
                    this.localOnly !== null && (presetInjectorOptions.localOnly = this.localOnly);
                    this.pitch !== null && (presetInjectorOptions.pitch = this.pitch);

                    this.injectorOptions = this.injectorOptions || presetInjectorOptions;
                    if (this.sound.downloaded) {

                        this.shouldFadeIn && this.changeCurrentVolume(this.minVolume);
                        this.injector = Audio.playSound(this.sound, injectorOptions);
                        this.shouldFadeIn && this.fadeIn();
                        var soundLength = this.getDurationMS();

                        if (bufferTime && typeof bufferTime === "number") {
                            soundLength = soundLength + bufferTime;
                        }
                        var injector = this.injector;

                        if (!this.loop && this.shouldFadeOut && !this.fadeOutStarted) {
                            var startFadeOutTime = soundLength - this.fadeOutTime;
                            Script.setTimeout(function(){
                                _this.fadeOut();
                            }, startFadeOutTime);
                        }

                        if (!this.loop) {
                            Script.setTimeout(function () {

                                if (injector) {
                                    injector.stop();
                                    injector = null;
                                }

                                if (onCompleteCallback) {
                                    onCompleteCallback(args);
                                }

                            }, soundLength);
                        }
                    }
                },
                stop: function(){
                    console.log("stop");
                    
                    if (this.shouldFadeOut && !this.fadeOutStarted) {
                        this.fadeOutStarted = true;
                        this.fadeOut();
                    } else {
                        this.unload();
                    }
                },
                isLoaded: function () {
                    console.log("isLoaded");

                    return this.sound.downloaded;
                },
                updateOptions: function(options){
                    var finalObject = {};
                    Object.keys(options).forEach(function(arg){
                        if (typeof options[arg] !== "undefined") {
                            finalObject[arg] = options[arg];
                        }
                    });
                    this.injector && this.injector.setOptions(finalObject);
                },
                unload: function () {
                    console.log("unload");

                    if (this.injector) {
                        this.injector.stop();
                        this.injector = null;
                    }
                }
            };
            
            function AudioLibrary() {
                this.audioStore = {};
            }
            
            AudioLibrary.prototype.addAudio = function(name, audioObject) {
                console.log("addAudio");

                this.audioStore[name] = new Sound(audioObject.url, name);
                this.audioStore[name].key = audioObject.key;
                audioObject.fadeInTime > 0 !== 'undefined' && this.audioStore[name].changeShouldFadeIn(true);
                audioObject.fadeOutTime > 0 !== 'undefined' && this.audioStore[name].changeShouldFadeOut(true);
                audioObject.fadeInTime !== 'undefined' && this.audioStore[name].changeFadeInTime(audioObject.fadeInTime);
                audioObject.fadeOutTime !== 'undefined' && this.audioStore[name].changeFadeOutTime(audioObject.fadeOutTime);
                audioObject.maxVolume !== 'undefined' && this.audioStore[name].changeMaxVolume(audioObject.maxVolume);
                audioObject.position !== 'undefined' && this.audioStore[name].changePosition(audioObject.position);
                audioObject.orientation !== 'undefined' && this.audioStore[name].changeOrientation(audioObject.orientation);
                audioObject.loop !== 'undefined' && this.audioStore[name].changeLoop(audioObject.loop);
                audioObject.pitch !== 'undefined' && this.audioStore[name].changePitch(audioObject.pitch);

                dataStore.mapping[audioObject.key] = new Mapping(name, audioObject.key, AUDIO);
            };

            AudioLibrary.prototype.renameAudio = function (oldName, newName) {
                console.log("renameAudio");

                this.audioStore[newName] = this.audioStore[oldName];
                this.audioStore[newName].name = newName;
                delete this.audioStore[oldName];
            };

            AudioLibrary.prototype.removeAudio = function (name) {
                console.log("removeAudio");

                if (this.audioStore[name]) {
                    this.audioStore[name].unload();
                }
                delete this.audioStore[name];
            };

            AudioLibrary.prototype.assignAudioToKey = function (name, key) {
                console.log("assignAudioToKey");

                this.audioStore[name].key = key;
                dataStore.mapping[key] = new Mapping(name, key, AUDIO);
            };

            AudioLibrary.prototype.playAudio = function (name) {
                console.log("playAudio");

                this.audioStore[name].play();
            };

            AudioLibrary.prototype.stopAudio = function (name) {
                console.log("stopAudio");

                this.audioStore[name].stop();
            };

            AudioLibrary.prototype.changeFadeOptions = function (name, fadeOptions) {
                console.log("changeFadeOptions");

                this.audioStore[name].changeShouldFadeIn(fadeOptions.fadeInTime > 0);
                this.audioStore[name].changeShouldFadeOut(fadeOptions.fadeOutTime > 0);
                this.audioStore[name].changeFadeInTime(fadeOptions.fadeInTime);
                this.audioStore[name].changeFadeOutTime(fadeOptions.fadeOutTime);
                this.audioStore[name].changeLoop(fadeOptions.loop);
            };

            AudioLibrary.prototype.changeVolumeOptions= function (name, volumeOptions) {
                console.log("changeVolumeOptions");

                this.audioStore[name].minVolume = volumeOptions.minVolume;
                this.audioStore[name].maxVolume = volumeOptions.maxVolume;
            };

            AudioLibrary.prototype.changePose = function(name, pose){
                console.log("changePose");
                pose.position && this.audioStore[name].changePosition(pose.position);
                pose.orientation && this.audioStore[name].changePosition(pose.orientation);
            };

        // Light
        // /////////////////////////////////////////////////////////////////////////
            function Light(lightArray,isZone, propsToWatch){
                this.lightArray = lightArray;
                
                this.from = {};
                this.to = {};
                this.current = {};
                this.running = {};
                this.isRunning = false;
                this.percentChange = 0.01;
                
                this.zoneExcludes = ["intensity", "falloffRadius"];
                propsToWatch.forEach(function(property){
                    if (isZone) {
                        if (this.zoneExcludes.indexOf(property) > -1){
                            return;
                        }
                    } else {
                        if (Array.isArray(property)){
                            return;
                        }
                    }
                    if (Array.isArray(property) && property.length === 2){
                        this.from[property[0]] = {};
                        this.from[property[0]][property[1]] = {
                            value: null
                        };
                        this.to[property[0]] = {};
                        this.to[property[0]][property[1]] = {
                            value: null
                        };
                        this.current[property[0]] = {};
                        this.current[property[0]][property[1]] = {
                            value: null,
                            changeStep: null,
                            direction: null,
                            timer: null
                        };
                    } else {
                        this.from[property] = {
                            value: null
                        };
                        this.to[property] = {
                            value: null
                        };
                        this.current[property] = {
                            value: null,
                            changeStep: null,
                            direction: null,
                            timer: null
                        };
                    }   
                }, this);
                
                this.transitionDuration = 0;
                this.transitionDurationStep = 0;

                this.animationTimer = null;
                this.isZone = isZone || false;
                this.editGroup = {};
            }

            Light.prototype.runningCheck = function(){
                var runningKeys = Object.keys(this.running).length;
                console.log("runningKeys", runningKeys);
                if (runningKeys > 0) {
                    this.isRunning = true;
                    return true;
                } else {
                    this.isRunning = false;
                    return false;
                }
            };

            Light.prototype.startAnimation = function(){
                console.log("STARTING LIGHT ANIMATION");
                var _this = this;
                Object.keys(this.from).forEach(function(property){
                    var fromValue = 0;
                    var toValue = 0;
                    var innerKey;
                    if (typeof this.from[property].value === 'undefined'){
                        innerKey = Object.keys(this.from[property])[0];
                        fromValue = this.from[property][innerKey].value;
                        toValue = this.to[property][innerKey].value;
                        _this.updateCurrentProperty(property, this.from[property], true);

                    } else {
                        fromValue = this.from[property].value;
                        toValue = this.to[property].value;
                        _this.updateCurrentProperty(property, this.from[property].value, true);
                    }

                    if (fromValue > toValue){
                        if (typeof this.from[property].value === 'undefined'){ 
                            innerKey = Object.keys(this.from[property])[0];
                            _this.current[property][innerKey].direction = DIRECTION_DECREASE; 
                        } else {
                            _this.current[property].direction = DIRECTION_DECREASE; 
                        }
                    } else if (fromValue < toValue){
                        if (typeof this.from[property].value === 'undefined'){  
                            _this.current[property][innerKey].direction = DIRECTION_INCREASE; 
                        } else {
                            _this.current[property].direction = DIRECTION_INCREASE; 
                        }
                    } else {
                        return;
                    }

                    innerKey = Object.keys(this.from[property])[0];

                    if (typeof this.from[property].value === 'undefined') {
                        _this.current[property][innerKey].timer = 
                            Script.setInterval(animationUpdate, this.transitionDurationStep);
                    } else {
                        _this.current[property].timer = 
                            Script.setInterval(animationUpdate, this.transitionDurationStep);
                    }
                    this.running[property] = true;
                    function animationUpdate(){
                        var newValue = 0;
                        var oldValue = 0;
                        var changeStep = 0;

                        if (typeof _this.from[property].value === 'undefined'){ 
                            innerKey = Object.keys(_this.from[property])[0];
                            if (_this.current[property][innerKey].direction === DIRECTION_INCREASE){
                                oldValue = _this.current[property][innerKey].value;
                                changeStep = _this.current[property][innerKey].changeStep;
                                newValue = oldValue + changeStep;
                            } else {
                                oldValue = _this.current[property][innerKey].value;
                                changeStep = _this.current[property][innerKey].changeStep;
                                newValue = oldValue - changeStep;
                            }
                            var transformedValue = {};
                            transformedValue[innerKey] = {};
                            transformedValue[innerKey].value = newValue;
                            _this.updateCurrentProperty(property, transformedValue, true);
                        } else {
                            if (_this.current[property].direction === DIRECTION_INCREASE) {
                                oldValue = _this.current[property].value;
                                changeStep = _this.current[property].changeStep;
                                newValue = oldValue + changeStep;
                            } else {
                                oldValue = _this.current[property].value;
                                changeStep = _this.current[property].changeStep;
                                newValue = oldValue - changeStep;
                            }
                            _this.updateCurrentProperty(property, newValue, true);
                        }
                        var current = 0;
                        var to = 0;
                        if (typeof _this.from[property].value === 'undefined'){ 
                            innerKey = Object.keys(_this.from[property])[0];
                            current = _this.current[property][innerKey].value;
                            to = _this.to[property][innerKey].value;
                            if (_this.current[property][innerKey].direction === DIRECTION_INCREASE &&
                                current >= to){
                                _this.stopAnimation(property, innerKey);
                                delete _this.running[property];
                            }
                            if (_this.current[property][innerKey].direction === DIRECTION_DECREASE &&
                                current <= to){
                                delete _this.running[property];
                                _this.stopAnimation(property, innerKey);
                            } 
                        } else {
                            current = _this.current[property].value;
                            to = _this.to[property].value;
                            if (_this.current[property].direction === DIRECTION_INCREASE &&
                                current >= to){
                                delete _this.running[property];
                                _this.stopAnimation(property);
                            }
                            if (_this.current[property].direction === DIRECTION_DECREASE &&
                               current <= to){
                                delete _this.running[property];
                                _this.stopAnimation(property);
                            } 
                        }
                    }
                }, this);
            };

            Light.prototype.stopAnimation = function(key, innerKey){
                if (typeof innerKey === "undefined"){
                    if (this.current[key].timer !== null) {
                        Script.clearInterval(this.current[key].timer);
                        this.current[key].timer = null;
                    }
                } else {
                    if (this.current[key][innerKey].timer !== null) {
                        Script.clearInterval(this.current[key][innerKey].timer);
                        this.current[key][innerKey].timer = null;
                    }
                }

            };

            Light.prototype.updateFromProperty = function(property, value) {
                if (typeof value !== "number"){
                    var innerKey = Object.keys(value)[0];
                    this.from[property][innerKey].value = value[innerKey];
                } else {
                    this.from[property].value = value;
                }
            };

            Light.prototype.updateToProperty = function(property, value) {
                if (typeof value !== "number"){
                    var innerKey = Object.keys(value)[0];
                    this.to[property][innerKey].value = value[innerKey];
                } else {
                    this.to[property].value = value;
                }
            };

            Light.prototype.updateCurrentProperty = function(property, value, sendEdit) {
                if (typeof value !== "number"){
                    var innerKey = Object.keys(value)[0];
                    var newValue;

                    if (typeof value[innerKey].value === 'undefined') {
                        newValue = value[innerKey];
                    } else {
                        newValue = value[innerKey].value;
                    }

                    this.current[property][innerKey].value = newValue;
                    this.editGroup[property] = {};
                    this.editGroup[property][innerKey] = newValue;
                } else {
                    this.current[property].value = value;
                    this.editGroup[property] = value;
                }
                if (sendEdit) {
                    this.sendEdit();
                }
            };

            Light.prototype.updateCurrentProperties = function(group) {
                var keysProperties = Object.keys(this[group]);
                keysProperties.forEach(function(property){
                    Light.prototype.updateCurrentProperty(property, group[property]);      
                });
                this.sendEdit();
            };

            Light.prototype.updateTransitionDuration = function(newTransitionDuration){
                this.transitionDuration = newTransitionDuration;
                this.transitionDurationStep = this.transitionDuration * this.percentChange;
                this.updateChange();
            };

            Light.prototype.updateChange = function(){
                Object.keys(this.current).forEach(function(key){
                    if (typeof this.current[key].value !== 'undefined') {
                        this.current[key].changeStep = 
                            Math.abs(this.from[key].value - this.to[key].value) * this.percentChange;
                    } else {
                        var innerKey = Object.keys(this.current[key]);
                        this.current[key][innerKey].changeStep = 
                            Math.abs(this.from[key][innerKey].value - this.to[key][innerKey].value) * this.percentChange;
                    }
                }, this);
            };

            Light.prototype.sendEdit = function() {
                this.lightArray.forEach(function(light){
                    Entities.editEntity(light, this.editGroup);
                }, this);
                this.editGroup = {};
            };
        
        // Snapshots
        // /////////////////////////////////////////////////////////////////////////
            function Snapshots(){
                this.currentSnap = null;
                this.snapshotStore = {};
                this.transitionStore = {};
                this.tempSnapshot = {};
                this.currentSnap = {};
                this.alwaysTransitionSnaps = true;
                this.defaultTransitionTime = 1000 ;
                this.previousTransition = null;
                this.nextTransition = null;
            }

            Snapshots.prototype.changeDefaultTransitionTime = function(newTransitionTime) {
                this.defaultTransitionTime = newTransitionTime;
            };

            Snapshots.prototype.changeAlwaysTransitionSnaps = function(shouldAlwaysTransitionSnaps) {
                this.alwaysTransitionSnaps = shouldAlwaysTransitionSnaps;
            };

            Snapshots.prototype.addSnapshot = function(name) {
                this.tempSnapshot.name = name;
                this.snapshotStore[name] = this.tempSnapshot;
                this.tempSnapshot = {};
            };

            Snapshots.prototype.forceAddSnapshot = function(name, snapshot){
                snapshot.name = name;
                this.snapshotStore[name] = snapshot;
            };

            Snapshots.prototype.renameSnapshot = function(oldName, newName){
                this.snapshotStore[newName] = this.snapshotStore[oldName];
                delete this.snapshotStore[oldName];
            };

            Snapshots.prototype.removeSnapshot = function(name) {
                console.log("reoving snapshot: ", name)
                delete this.snapshotStore[name];
            };

            Snapshots.prototype.assignSnapshotToKey = function(name, key) {
                this.snapshotStore[name].key = key;
                dataStore.mapping[key] = new Mapping(name, key, SNAPSHOT);
            };

            Snapshots.prototype.takeSnapshot = function(){
                dataStore.choices.forEach(function(light){
                    var properties = Entities.getEntityProperties(lights[light].lightArray[0]);
                    this.tempSnapshot[light] = {};
                    dataStore.SnapshotProperties.forEach(function(propertyToCopy){
                        if (Array.isArray(propertyToCopy) && propertyToCopy.length === 2){
                            if (properties.type !== "Zone") { 
                                    return; 
                            }
                            this.tempSnapshot[light][propertyToCopy[0]] = {};
                            this.tempSnapshot[light][propertyToCopy[0]][propertyToCopy[1]] = properties[propertyToCopy[0]][propertyToCopy[1]];
                        } else {
                            if (properties.type === "Zone" && (propertyToCopy === INTENSITY || propertyToCopy === FALLOFF_RADIUS )) {
                                    return;
                            }
                            this.tempSnapshot[light][propertyToCopy] = properties[propertyToCopy];
                        }
                    }, this);
                }, this);
            };
            
            Snapshots.prototype.loadSnapshot = function(snapshot){
                if (this.alwaysTransitionSnaps) {
                    this.takeSnapshot(); 
                    this.addSnapshot("alwaysTransition"); 
                    if (!runningCheck()) {
                        this.startTransition("alwaysTransition", snapshot, this.defaultTransitionTime);
                    }
                } else {
                    this.getSnapshotLightkeys(snapshot).forEach(function(light){
                        if (light === "key") {
                            return;
                        }
    
                        this.getSnapshotPropertyKeys(snapshot, light).forEach(function(property){
                            lights[light].updateCurrentProperty(
                                property, this.snapshotStore[snapshot][light][property], false
                            );
                        }, this);
                        lights[light].sendEdit();
                    }, this);
                }

            };

            Snapshots.prototype.getSnapshotLightkeys = function(snapshot){
                return Object.keys(this.snapshotStore[snapshot]).filter(function(key){
                    return key !== "name";
                });
            };

            Snapshots.prototype.getSnapshotPropertyKeys = function(snapshot, light){
                if (light === "key") {
                    return;
                }
                return Object.keys(this.snapshotStore[snapshot][light]);
            };

            Snapshots.prototype.addTransition = function(name, from, to, duration, key) {
                console.log("Adding Transition");
                this.transitionStore[name] = {
                    name: name,
                    from: from,
                    to: to,
                    duration: duration,
                    key: key
                };
                dataStore.mapping[key] = new Mapping(name, key, TRANSITION);
            };

            Snapshots.prototype.removeTransition = function(name){
                console.log("Removing Transition");
                delete this.transitionStore[name];
            };

            Snapshots.prototype.renameTransition = function(oldName, newName){
                console.log("renaming Transition");

                this.transitionStore[newName] = this.transitionStore[oldName];
                delete this.transitionStore[oldName];
            };

            Snapshots.prototype.assignTransitionToKey = function(name, key) {
                console.log("assigngg Transition to key")

                this.transitionStore[name].key = key;
                dataStore.mapping[key] = new Mapping(name, key, TRANSITION);
            };

            Snapshots.prototype.startTransition = function(from, to, duration) {
                console.log("Starting transition")

                console.log("starting transition");
                this.getSnapshotLightkeys(from).forEach(function(light){
                    if (light === "key") {
                        return;
                    }
                    this.getSnapshotPropertyKeys(from, light).forEach(function(property){
                        var zoneExcludes = ["intensity", "falloffRadius"];
                        if (light.toLowerCase().indexOf("zone") > -1 && zoneExcludes.indexOf(property) > -1){
                            return;
                        }
                        lights[light].updateFromProperty(
                            property, this.snapshotStore[from][light][property]
                        );
                    }, this);
                }, this);

                this.getSnapshotLightkeys(to).forEach(function(light){
                    if (light === "key") {
                        return;
                    }
                    this.getSnapshotPropertyKeys(to, light).forEach(function(property){
                        lights[light].updateToProperty(
                            property, this.snapshotStore[to][light][property]
                        );
                    }, this);
                }, this);
                
                this.getSnapshotLightkeys(from).forEach(function(light){
                    if (light === "key") {
                        return;
                    }
                    lights[light].updateTransitionDuration(duration);
                });

                this.getSnapshotLightkeys(from).forEach(function(light){
                    if (light === "key") {
                        return;
                    }
                    lights[light].startAnimation();
                });

            };

            Snapshots.prototype.executeTransitionByName = function(name){
                console.log("execute transition");

                var from = this.transitionStore[name].from;
                var to = this.transitionStore[name].to;
                var duration = this.transitionStore[name].duration;
                var check = runningCheck();
                console.log("check:", check)
                if (!runningCheck()) {
                    this.startTransition(from, to, duration);
                }
                console.log("CURRENTY RUNNING");
            };

    // Collections
    // /////////////////////////////////////////////////////////////////////////
        var 
            lights = {}
        ;

    // Helper Functions
    // /////////////////////////////////////////////////////////////////////////
        function findObjectIndexByKey(array, key, value) {
            for (var i = 0; i < array.length; i++) {
                if (array[i][key] === value) {
                    return i;
                }
            }
            return null;
        }

        function saveSettings(){
            Settings.setValue(SETTINGS_STRING, dataStore);
        }

        function loadSettings(){
            dataStore = Settings.getValue(SETTINGS_STRING);
        }

        function runningCheck(){
            var keys = Object.keys(lights);
            for (var i = 0; i < keys.length; i++) {
                var runningCheck = lights[keys[i]].runningCheck();
                console.log("running Check key", keys[i]);
                console.log("running Check", runningCheck);

                if (runningCheck === true) {
                    return true;
                }
            }
            return false;
        }

    // Procedural Functions
    // /////////////////////////////////////////////////////////////////////////
        
        function registerLights(){
            var SEARCH_DISTANCE = 25;
            lights[LIGHTS_MC_CENTER_SPOT] = 
                Entities.findEntitiesByName(LIGHTS_MC_CENTER_SPOT, MyAvatar.position, SEARCH_DISTANCE);
            lights[LIGHTS_STAGE_ACCENT] = 
                Entities.findEntitiesByName(LIGHTS_STAGE_ACCENT, MyAvatar.position, SEARCH_DISTANCE);
            lights[LIGHTS_ACCENT_SPOT_STAGE] = 
                Entities.findEntitiesByName(LIGHTS_ACCENT_SPOT_STAGE, MyAvatar.position, SEARCH_DISTANCE);
            lights[LIGHTS_HOUSE] = 
                Entities.findEntitiesByName(LIGHTS_HOUSE, MyAvatar.position, SEARCH_DISTANCE);
            lights[LIGHTS_ZONE_STAGE] = 
                Entities.findEntitiesByName(LIGHTS_ZONE_STAGE, MyAvatar.position, SEARCH_DISTANCE);

            lights[LIGHTS_ACCENT_SPOT_HOUSE_LEFT] = 
                Entities.findEntitiesByName(LIGHTS_ACCENT_SPOT_HOUSE_LEFT, MyAvatar.position, SEARCH_DISTANCE);
            lights[LIGHTS_ACCENT_SPOT_HOUSE_RIGHT] = 
                Entities.findEntitiesByName(LIGHTS_ACCENT_SPOT_HOUSE_RIGHT, MyAvatar.position, SEARCH_DISTANCE);
            lights[LIGHTS_ACCENT_SPOT_HOUSE] = 
                lights[LIGHTS_ACCENT_SPOT_HOUSE_LEFT].concat(lights[LIGHTS_ACCENT_SPOT_HOUSE_RIGHT]);

            lights[LIGHTS_STAGE_SPOT_MAIN_STAGE_RIGHT] = 
                Entities.findEntitiesByName(LIGHTS_STAGE_SPOT_MAIN_STAGE_RIGHT, MyAvatar.position, SEARCH_DISTANCE);
            lights[LIGHTS_STAGE_SPOT_MAIN_STAGE_LEFT] = 
                Entities.findEntitiesByName(LIGHTS_STAGE_SPOT_MAIN_STAGE_LEFT, MyAvatar.position, SEARCH_DISTANCE);
            lights[LIGHTS_STAGE_SPOT_MAIN] = 
                lights[LIGHTS_STAGE_SPOT_MAIN_STAGE_LEFT].concat(lights[LIGHTS_STAGE_SPOT_MAIN_STAGE_RIGHT]);

            lights[LIGHTS_UPSTAGE_FILL_LEFT] = 
                Entities.findEntitiesByName(LIGHTS_UPSTAGE_FILL_LEFT, MyAvatar.position, SEARCH_DISTANCE);
            lights[LIGHTS_UPSTAGE_FILL_RIGHT] = 
                Entities.findEntitiesByName(LIGHTS_UPSTAGE_FILL_RIGHT, MyAvatar.position, SEARCH_DISTANCE);
            lights[LIGHTS_UPSTAGE_FILL] = 
                lights[LIGHTS_UPSTAGE_FILL_LEFT].concat(lights[LIGHTS_UPSTAGE_FILL_RIGHT]);

            var lightKeys = Object.keys(lights);
            lightKeys.forEach(function(lightKey){
                if (lightKey.indexOf(LIGHTS_ACCENT_SPOT_HOUSE) > -1) {
                    lights[lightKey] = new Light(lights[lightKey], false, dataStore.SnapshotProperties);
                }
                if (lightKey.indexOf(LIGHTS_ACCENT_SPOT_STAGE) > -1) {
                    lights[lightKey] = new Light(lights[lightKey], false, dataStore.SnapshotProperties);
                } 
                if (lightKey.indexOf(LIGHTS_HOUSE) > -1) {
                    lights[lightKey] = new Light(lights[lightKey], false, dataStore.SnapshotProperties);
                } 
                if (lightKey.indexOf(LIGHTS_ZONE_STAGE) > -1) {
                    lights[lightKey] = new Light(lights[lightKey], true, dataStore.SnapshotProperties);
                } 
                if (lightKey.indexOf(LIGHTS_STAGE_SPOT_MAIN) > -1) {
                    lights[lightKey] = new Light(lights[lightKey], false, dataStore.SnapshotProperties);
                }
                if (lightKey.indexOf(LIGHTS_MC_CENTER_SPOT) > -1) {
                    lights[lightKey] = new Light(lights[lightKey], false, dataStore.SnapshotProperties);
                }
                if (lightKey.indexOf(LIGHTS_STAGE_ACCENT) > -1) {
                    lights[lightKey] = new Light(lights[lightKey], false, dataStore.SnapshotProperties);
                }
                if (lightKey.indexOf(LIGHTS_UPSTAGE_FILL) > -1) {
                    lights[lightKey] = new Light(lights[lightKey], false, dataStore.SnapshotProperties);
                }
            }, this);
        }

        function registerDefaults(){
            var defaultSnapshotKeys = Object.keys(dataStore.defaultSnapshots);

            defaultSnapshotKeys.forEach(function(key, index){
                var offset = 4;
                dataStore.snapshots.forceAddSnapshot(key, dataStore.defaultSnapshots[key]);
                dataStore.snapshots.assignSnapshotToKey(key, index + offset);
            });

            var defaultTransitionKeys = Object.keys(dataStore.defaultTransitions);

            defaultTransitionKeys.forEach(function(key){
                var transitionObject = dataStore.defaultTransitions[key];
                dataStore.snapshots.addTransition(
                    transitionObject.name,
                    transitionObject.from,
                    transitionObject.to,
                    transitionObject.duration,
                    transitionObject.key
                );
            });
        }

        function takeSnapshot(){
            //
        }

        function addSnapshot(){
            //
        }

        function loadSnapshot(snapshot){
            dataStore.currentAnimation = snapshot;
        

            ui.updateUI(dataStore);
        }

        function assignSnapshotToKey(){
            //
        }

        function renameSnapshot(){
            //
        }

        function removeSnapshot(name){
            dataStore.snapshots.removeSnapshot(name);
            ui.updateUI(dataStore);
        }

        function addTransition(){
            //
        }

        function executeTransitionByName(){
            dataStore.animations.startTransition(dataStore.currentAnimation);
        }

        function assignTransitionToKey(){
            //
        }

        function renameTransition(){
            //
        }

        function removeTransition(name){
            console.log("in removing transition");
            dataStore.snapshots.removeTransition(name);
            ui.updateUI(dataStore);
        }

        function changeDefaultTransitionTime(newTime){
            dataStore.snapshots.changeDefaultTransitionTime(newTime);
            ui.updateUI(dataStore);
        }

        function changeAlwaysTransitionSnaps(){
            dataStore.snapshots.alwaysTransitionSnaps = !dataStore.snapshots.alwaysTransitionSnaps;
            ui.updateUI(dataStore);
        }

        function addSound(newSound) {
            dataStore.audio.addAudio(newSound.name, newSound);
            ui.updateUI(dataStore);
        }

        function saveSoundEdit(oldSound, newSound){
            if (oldSound.key !== newSound.key){
                dataStore.audio.removeAudio(oldSound.name)
            }
            dataStore.audio.addAudio(newSound.name, newSound);
            ui.updateUI(dataStore);
        }

        function removeSound(sound){
            dataStore.audio.removeAudio(sound);
            ui.updateUI(dataStore);
        }

        function saveSnapshotEdit(oldSnapshot, newSnapshot){
            if (oldSnapshot.key !== newSnapshot.key) {
                dataStore.snapshot.removeSnapshot(oldSnapshot.name);
            }
            dataStore.snapshot.forceAddSnapshot(newSnapshot.name, newSnapshot);
            ui.updateUI(dataStore);
        }

        function saveNewSnapshot(newSnapshot){
            dataStore.snapshots.takeSnapshot();
            dataStore.snapshots.addSnapshot(newSnapshot.name);
            dataStore.snapshots.assignSnapshotToKey(newSnapshot.name, newSnapshot.key);
            ui.updateUI(dataStore);
        }

        function saveNewTransition(newTransition){
            dataStore.snapshots.addTransition(
                newTransition.name,
                newTransition.from,
                newTransition.to,
                newTransition.duration,
                newTransition.key);
            ui.updateUI(dataStore);
        }

        function saveTransitionEdit(oldTransition, newTransition){
            if (oldTransition.key !== newTransition.key) {
                dataStore.snapshots.removeTransition(oldTransition.name);
            }
            dataStore.snapshots.addTransition(
                newTransition.name,
                newTransition.from,
                newTransition.to,
                newTransition.duration,
                newTransition.key);
            ui.updateUI(dataStore);
        }

        function updatePosition(){
            dataStore.currentPosition = [+MyAvatar.position.x.toFixed(3),+MyAvatar.position.y.toFixed(3),+MyAvatar.position.z.toFixed(3)];
            ui.updateUI(dataStore);
        }

        function updateOrientation(){
            dataStore.currentOrientation = [+MyAvatar.orientation.x.toFixed(3), +MyAvatar.orientation.y.toFixed(3), +MyAvatar.orientation.z.toFixed(3), +MyAvatar.orientation.w.toFixed(3)];
            ui.updateUI(dataStore);
        }

        function scriptEnding(){
            Controller.keyPressEvent.disconnect(keyPressHandler);

            var lightKeys = Object.keys(lights);
            // ##TODO FIX THIS 
            // lightKeys.forEach(function(lightKey){
            //     if (lightKeys[lightKey].intensityAnimationTimer !== null && typeof lightKey === "string") {
            //         lightKeys[lightKey].clearTimers();
            //     }
            // });
        }

    function keyPressHandler(event) {
        if (dataStore.mapping[event.text]) {
            switch (dataStore.mapping[event.text].type){
                case SNAPSHOT:
                    dataStore.snapshots.loadSnapshot(dataStore.mapping[event.text].name);
                    break;
                case TRANSITION:
                    dataStore.snapshots.executeTransitionByName(dataStore.mapping[event.text].name);
                    break;
                case AUDIO:
                    dataStore.audio.playAudio(dataStore.mapping[event.text].name);
                    break;

            }
        }
    }

    // Tablet
    // /////////////////////////////////////////////////////////////////////////
        function startup() {
            console.log("startUP");
            ui = new AppUi({
                buttonName: BUTTON_NAME,
                home: URL,
                onMessage: onMessage,
                updateUI: updateUI
            });

            Controller.keyPressEvent.connect(keyPressHandler);

            registerLights();
            registerDefaults();

            var audio_url = "https://hifi-content.s3.amazonaws.com/milad/ROLC/Reference/Sounds/SdDrop17-MP3.mp3";
            var audio_key = "o";
            var audio_name = "Dope Song";
            var audio_test_object = {
                url: audio_url,
                name: audio_name,
                key: audio_key,
                shouldFadeIn: false,
                shouldFadeOut: false,
                fadeInTime: 3000,
                fadeOutTime: 3000,
                maxVolume: 1.0,
                position: [+MyAvatar.position.x.toFixed(3),+MyAvatar.position.y.toFixed(3),+MyAvatar.position.z.toFixed(3)],
                orientation: [+MyAvatar.orientation.x.toFixed(3), +MyAvatar.orientation.y.toFixed(3), +MyAvatar.orientation.z.toFixed(3), +MyAvatar.orientation.w.toFixed(3)],
                loop: false,
                pitch: 2
            }

            dataStore.audio.addAudio(audio_name, audio_test_object);
            Script.scriptEnding.connect(scriptEnding);
        }

        function updateUI(dataStore) {
            console.log("UPDATE UI");
            var messageObject = {
                type: UPDATE_UI,
                value: dataStore  
            };
            ui.sendToHtml(messageObject);
        }

        function onMessage(data) {
            console.log(JSON.stringify(data));
            // EventBridge message from HTML script.
            switch (data.type) {
                case EVENT_BRIDGE_OPEN_MESSAGE:
                    console.log("EVENT BRIDGE");
                    ui.updateUI(dataStore);
                    break;
                case TAKE_SNAPSHOT:
                    takeSnapshot();
                    break;
                case ADD_SNAPSHOT:
                    addSnapshot();
                    break;
                case LOAD_SNAPSHOT:
                    loadSnapshot();
                    break;
                case ASSIGN_SNAPSHOT_TO_KEY:
                    assignSnapshotToKey();
                    break;
                case RENAME_SNAPSHOT:
                    renameSnapshot();
                    break;
                case REMOVE_SNAPSHOT:
                    removeSnapshot(data.value);
                    break;
                case ADD_TRANSITION:
                    addTransition();
                    break;
                case EXECUTE_TRANSITION_BY_NAME:
                    executeTransitionByName();
                    break;
                case ASSIGN_TRANSITION_TO_KEY:
                    assignTransitionToKey();
                    break;
                case RENAME_TRANSITION:
                    renameTransition();
                    break;
                case REMOVE_TRANSITION:
                    console.log("removing transition received");
                    removeTransition(data.value);
                    break;
                case CHANGE_DEFAULT_TRANSITION_TIME:
                    changeDefaultTransitionTime(data.value);
                    break;
                case CHANGE_ALWAYS_TRANSITION_SNAPS:
                    changeAlwaysTransitionSnaps();
                    break;
                case SAVE_SOUND_EDIT: 
                    saveSoundEdit(data.value.oldSound, data.value.newSound);
                    break;
                case ADD_SOUND:
                    addSound(data.value);
                    break;
                case REMOVE_SOUND:
                    removeSound(data.value);
                    break;
                case SAVE_SNAPSHOT_EDIT:
                    saveSnapshotEdit(data.value.oldSnapshot, data.value.newSnapshot);
                    break;
                case SAVE_NEW_SNAPSHOT:
                    saveNewSnapshot(data.value);
                    break;
                case SAVE_NEW_TRANSITION:
                    saveNewTransition(data.value);
                    break;
                case SAVE_TRANSITION_EDIT:
                    saveTransitionEdit(data.value.oldTransition, data.value.newTransition);
                    break;
                case UPDATE_POSITION:
                    updatePosition();
                    break;
                case UPDATE_ORIENTATION:
                    updateOrientation();

            }
        }


    // Main
    // /////////////////////////////////////////////////////////////////////////
        startup();
})(); // END LOCAL_SCOPE

/*

    var messageChannel = "improv";
    Messages.subscribe(messageChannel);

    function messageHandler(channel, message){
        if (channel === messageChannel) {
            var data = JSON.parse(message);
            switch (data.type) {
                case "takesnapshot":
                    dataStore.snapshots.takeSnapshot();
                    break;
                case "savesnapshot":
                    dataStore.snapshots.addSnapshot(data.value);
                    break;
                case "loadsnapshot":
                    dataStore.snapshots.loadSnapshot(data.value);
                    break;
                case "animation":
                    dataStore.snapshots.startTransition(data.value[0], data.value[1], data.value[2])
                    break;
                case "addtransition":
                    console.log("addtrasition");
                    dataStore.snapshots.addTransition(data.value.name,data.value.from,data.value.to,data.value.duration,data.value.key);
                    // console.log(JSON.stringify(dataStore.snapshots.transitionStore));
                    break;
                case "executeTransitionByName":
                    console.log("got execute transition");
                    dataStore.snapshots.executeTransitionByName(data.value);
                    break;
                case "saveSettings": 
                    saveSettings();
                    break;
                case "loadSettings": 
                    saveSettings();
                    break;
            }
        }
    }

    Messages.messageReceived.connect(messageHandler);

*/