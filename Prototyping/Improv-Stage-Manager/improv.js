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
            REMOVE_SNAPSHOT = "removeSnapshot",
            
            ADD_TRANSITION = "addTransition",
            EXECUTE_TRANSITION_BY_NAME = "executeTransitionByName",
            ASSIGN_TRANSITION_TO_KEY = "assignTransitionToKey",
            RENAME_TRANSITION = "renameTransition",
            REMOVE_TRANSITION = "removeTransition",

            CHANGE_DEFAULT_TRANSITION_TIME = "changeDefaultTransitionTime",
            CHANGE_ALWAYS_TRANSITION = "changeAlwaysTransition",
            

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
        // /////////////////////////////////////////////////////////////////////////
            // function Sound(url) {
            //     this.url = url;
            //     this.sound = SoundCache.getSound(url);
            //     this.injector;
            //     this.SECS_TO_MS = 1000;
            //     this.fadeInTime = 2000;
            //     this.fadeOutTime = 2000;
            //     this.maxVolume = 1.0;
            //     this.minVolume = 0.0;
                                
            // }

            // Sound.prototype = {

            //     changeFadeInTime: function(time) {
            //         this.fadeInTime = time;
            //     },
            //     changeFadeOutTime: function(time){
            //         this.fadeOutTime = time;
            //     },
            //     fadeIn: function () {

            //     },
            //     fadeOut: function () {

            //     },
            //     getURL: function () {
            //         return this.url;
            //     },
            //     isLoaded: function () {
            //         return this.sound.downloaded;
            //     },
            //     getDurationSeconds: function () {
            //         if (this.sound.downloaded) {
            //             return this.sound.duration;
            //         }
            //     },
            //     getDurationMS: function () {
            //         if (this.sound.downloaded) {
            //             return this.sound.duration * this.SECS_TO_MS;
            //         }
            //     },
            //     playSoundStaticPosition: function (injectorOptions, bufferTime, onCompleteCallback, args) {

            //         if (this.sound.downloaded) {

            //             this.injector = Audio.playSound(this.sound, injectorOptions);

            //             var soundLength = this.getDurationMS();

            //             if (bufferTime && typeof bufferTime === "number") {
            //                 soundLength = soundLength + bufferTime;
            //             }
            //             var injector = this.injector;

            //             Script.setTimeout(function () {

            //                 if (injector) {
            //                     injector.stop();
            //                     injector = null;
            //                 }

            //                 if (onCompleteCallback) {
            //                     onCompleteCallback(args);
            //                 }

            //             }, soundLength);
            //         }
            //     },
            //     updateOptions: function(options){
            //         var finalObject = {};
            //         Object.keys(options).forEach(function(arg){
            //             if(typeof options[arg] !== "undefined") {
            //                 finalObject[arg] = options[arg];
            //             }
            //         })
            //         this.injector.setOptions(finalObject);
            //     },
            //     unload: function () {
            //         if (this.injector) {
            //             this.injector.stop();
            //             this.injector = null;
            //         }
            //     },
            // };
            
            // function Audio(){
            //     this.audioStore = {};

            // }

            // Audio.prototype.addAudio = function() {

            // };

            // Audio.prototype.renameAudio = function () {

            // };

            // Audio.prototype.removeAudio = function () {

            // };

            // Audio.prototype.assignAudioToKey = function () {

            // };

            // Audio.prototype.playAudio = function () {

            // };

            // Audio.prototype.startFadeIn = function () {

            // };

            // Audio.prototype.startFadeOut = function () {

            // };



        // Light
        // /////////////////////////////////////////////////////////////////////////
            function Light(lightArray,isZone, propsToWatch){
                this.lightArray = lightArray;
                
                this.from = {};
                this.to = {};
                this.current = {};
                this.running = {};
                this.isRunning = false;
                
                this.zoneExcludes = ["intensity", "falloffRadius"]
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
                if (runningKeys > 0) {
                    this.isRunning = true;
                    return true;
                } else {
                    this.isRunning = false;
                    return false;
                }
            };

            Light.prototype.startAnimation = function(){
                console.log("STARTING LIGHT ANIMATION")
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
                        _this.current[property][innerKey].timer = Script.setInterval(animationUpdate, this.transitionDurationStep);
                    } else {
                        _this.current[property].timer = Script.setInterval(animationUpdate, this.transitionDurationStep);
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
                        if (typeof _this.from[property].value === 'undefined'){ 
                            innerKey = Object.keys(_this.from[property])[0];
                            var current = _this.current[property][innerKey].value;
                            var to = _this.to[property][innerKey].value;
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
                            var current = _this.current[property].value;
                            var to = _this.to[property].value;
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

                    if (typeof value[innerKey].value === 'undefined')  {
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
                this.transitionDurationStep = this.transitionDuration * 0.01;
                this.updateChange();
            };

            Light.prototype.updateChange = function(){
                var keys = Object.keys(this.current).forEach(function(key){
                    if (typeof this.current[key].value !== 'undefined') {
                        this.current[key].changeStep = Math.abs(this.from[key].value - this.to[key].value) * 0.01;
                    } else {
                        var innerKey = Object.keys(this.current[key]);
                        this.current[key][innerKey].changeStep = Math.abs(this.from[key][innerKey].value - this.to[key][innerKey].value) * 0.01;
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
                this.alwaysTransition = true;
                this.defaultTransitionTime = 10000 ;
                this.previousTransition = null;
                this.nextTransition = null;
            }

            Snapshots.prototype.changeDefaultTransitionTime = function(newTransitionTime) {
                this.defaultTransitionTime = newTransitionTime;
            }

            Snapshots.prototype.changeAlwaysTransition = function(shouldAlwaysTransition) {
                this.alwaysTransition = shouldAlwaysTransition;
            }

            Snapshots.prototype.addSnapshot = function(name) {
                this.tempSnapshot.name = name;
                this.snapshotStore[name] = this.tempSnapshot;
                this.tempSnapshot = {};
            };

            Snapshots.prototype.forceAddSnapshot = function(name, snapshot){
                this.snapshotStore[name] = snapshot;
            };

            Snapshots.prototype.renameSnapshot = function(oldName, newName){
                this.snapshotStore[newName] = this.snapshotStore[oldName];
                delete this.snapshotStore[oldName];
            };

            Snapshots.prototype.removeSnapshot = function(name) {
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
            }
            
            Snapshots.prototype.loadSnapshot = function(snapshot){
                if (this.alwaysTransition) {
                    this.takeSnapshot(); 
                    this.addSnapshot("alwaysTransition"); 
                    this.startTransition("alwaysTransition", snapshot, this.defaultTransitionTime);
                } else {
                    this.getSnapshotLightkeys(snapshot).forEach(function(light){
                        if (light === "key") return;
    
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
                if (light === "key") return;
                return Object.keys(this.snapshotStore[snapshot][light]);
            };

            Snapshots.prototype.addTransition = function(name, from, to, duration, key) {
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
                delete this.transitionStore[name];
            };

            Snapshots.prototype.renameTransition = function(oldName, newName){
                this.transitionStore[newName] = this.transitionStore[oldName];
                delete this.transitionStore[oldName];
            };

            Snapshots.prototype.assignTransitionToKey = function(name, key) {
                this.transitionStore[name].key = key;
            };

            Snapshots.prototype.startTransition = function(from, to, duration) {
                console.log("starting transition")
                this.getSnapshotLightkeys(from).forEach(function(light){
                    if (light === "key") return;
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
                    if (light === "key") return;
                    this.getSnapshotPropertyKeys(to, light).forEach(function(property){
                        lights[light].updateToProperty(
                            property, this.snapshotStore[to][light][property]
                        );
                    }, this);
                }, this);
                
                this.getSnapshotLightkeys(from).forEach(function(light){
                    if (light === "key") return;
                    lights[light].updateTransitionDuration(duration);
                });

                this.getSnapshotLightkeys(from).forEach(function(light){
                    if (light === "key") return;
                    lights[light].startAnimation();
                });

            };

            Snapshots.prototype.executeTransitionByName = function(name){
                console.log("execute transition")

                var from = this.transitionStore[name].from;
                var to = this.transitionStore[name].to;
                var duration = this.transitionStore[name].duration;
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
                if (runningCheck === true) {
                    return true;
                }
            }
            return false;
        }

    // Procedural Functions
    // /////////////////////////////////////////////////////////////////////////
        
        function registerLights(){
            lights[LIGHTS_MC_CENTER_SPOT] = Entities.findEntitiesByName(LIGHTS_MC_CENTER_SPOT, MyAvatar.position, 25);
            lights[LIGHTS_STAGE_ACCENT] = Entities.findEntitiesByName(LIGHTS_STAGE_ACCENT, MyAvatar.position, 25);
            lights[LIGHTS_ACCENT_SPOT_STAGE] = Entities.findEntitiesByName(LIGHTS_ACCENT_SPOT_STAGE, MyAvatar.position, 25);
            lights[LIGHTS_HOUSE] = Entities.findEntitiesByName(LIGHTS_HOUSE, MyAvatar.position, 25);
            lights[LIGHTS_ZONE_STAGE] = Entities.findEntitiesByName(LIGHTS_ZONE_STAGE, MyAvatar.position, 25);

            lights[LIGHTS_ACCENT_SPOT_HOUSE_LEFT] = Entities.findEntitiesByName(LIGHTS_ACCENT_SPOT_HOUSE_LEFT, MyAvatar.position, 25);
            lights[LIGHTS_ACCENT_SPOT_HOUSE_RIGHT] = Entities.findEntitiesByName(LIGHTS_ACCENT_SPOT_HOUSE_RIGHT, MyAvatar.position, 25);
            lights[LIGHTS_ACCENT_SPOT_HOUSE] = lights[LIGHTS_ACCENT_SPOT_HOUSE_LEFT].concat(lights[LIGHTS_ACCENT_SPOT_HOUSE_RIGHT]);

            lights[LIGHTS_STAGE_SPOT_MAIN_STAGE_RIGHT] = Entities.findEntitiesByName(LIGHTS_STAGE_SPOT_MAIN_STAGE_RIGHT, MyAvatar.position, 25);
            lights[LIGHTS_STAGE_SPOT_MAIN_STAGE_LEFT] = Entities.findEntitiesByName(LIGHTS_STAGE_SPOT_MAIN_STAGE_LEFT, MyAvatar.position, 25);
            lights[LIGHTS_STAGE_SPOT_MAIN] = lights[LIGHTS_STAGE_SPOT_MAIN_STAGE_LEFT].concat(lights[LIGHTS_STAGE_SPOT_MAIN_STAGE_RIGHT]);

            lights[LIGHTS_UPSTAGE_FILL_LEFT] = Entities.findEntitiesByName(LIGHTS_UPSTAGE_FILL_LEFT, MyAvatar.position, 25);
            lights[LIGHTS_UPSTAGE_FILL_RIGHT] = Entities.findEntitiesByName(LIGHTS_UPSTAGE_FILL_RIGHT, MyAvatar.position, 25);
            lights[LIGHTS_UPSTAGE_FILL] = lights[LIGHTS_UPSTAGE_FILL_LEFT].concat(lights[LIGHTS_UPSTAGE_FILL_RIGHT]);

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
        }{

        function removeSnapshot(){
            //
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

        function removeTransition(){
            //
        }

        function scriptEnding(){
            Controller.keyPressEvent.connect(keyPressHandler);

            var lightKeys = Object.keys(lights);
            lightKeys.forEach(function(lightKey){
                if (lightKeys[lightKey].intensityAnimationTimer !== null) {
                    Script.clearTimeout(lightKeys[lightKey].intensityAnimationTime);
                }
            })
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
                    removeSnapshot();
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
                    removeTransition();
                    break;
                case CHANGE_DEFAULT_TRANSITION_TIME:
                    changeDefaultTransitionTime();
                    break;
                case CHANGE_ALWAYS_TRANSITION:
                    changeAlwaysTransition();
                    break;
                default: 
            }
        }


    // Main
    // /////////////////////////////////////////////////////////////////////////
        startup();
}()); // END LOCAL_SCOPE

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