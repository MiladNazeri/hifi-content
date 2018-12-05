"use strict";
/* eslint-disable indent */

//
//  Example Vue App
//
//  Created by Milad Nazeri and Robin Wilson on 2018-10-11
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
            Fading in Lights in and out
                Direction - Up or Down
                amount to change by
        */
    // Dependencies
    // /////////////////////////////////////////////////////////////////////////
        var 
            AppUi = Script.require('appUi')
        ;

        Script.require(Script.resolvePath('./Polyfills.js'));

    // Consts
    // /////////////////////////////////////////////////////////////////////////
        var 
            URL = Script.resolvePath("./html/Tablet.html"),
            BUTTON_NAME = "IMPROV", // !important update in Tablet.js as well, MUST match Example.js
            
            EVENT_BRIDGE_OPEN_MESSAGE = BUTTON_NAME + "_eventBridgeOpen",
            LOAD_SNAPSHOT = "load_snapshot",
            START_SNAPSHOT = "start_snapshot",
            // ADD_LIGHT = "add_light",
            NEW_SNAPSHOT = "new_snapshot",
            UPDATE_SNAPSHOT_NAME = "update_snapshot_name",
            CREATE_LIGHT_SNAPSHOT = "create_light_snapshot",
            REMOVE_LIGHT = "remove_light",

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
            SETTINGS_STRING = "io.improv.settings"
        ;

    // Init
    // /////////////////////////////////////////////////////////////////////////
        var 
            ui,
            defaultDataStore = {
                snapshots: new Snapshots(),
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
                    VISIBLE,
                    [KEYLIGHT, INTENSITY],
                    [AMBIENT_LIGHT, AMBIENT_INTENSITY]
                ],
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
            
        // Light
        // /////////////////////////////////////////////////////////////////////////
            function Light(lightArray,isZone, propsToWatch){
                this.lightArray = lightArray;
                
                this.from = {};
                this.to = {};
                this.current = {};
                
                propsToWatch.forEach(function(property){
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
                            changeStep: null
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
                            changeStep: null
                        };
                    }   
                }, this);
                
                this.transitionDuration = 0;
                this.transitionDurationStep = 0;

                this.animationTimer = null;
                this.isZone = isZone || false;
                this.editGroup = {};
            }

            Light.prototype.startAnimation = function(){
                var _this = this;

                if (_this.fromIntensity === _this.toIntensity) {
                    return;
                }
                _this.updateCurrentIntensity(_this.fromIntensity);
                if (_this.fromIntensity > _this.toIntensity){
                    _this.currentIntensityDirection = DIRECTION_DECREASE;   
                } else {
                    _this.currentIntensityDirection = DIRECTION_INCREASE;   
                }

                this.intensityAnimationTimer = Script.setInterval(function(){
                    var newIntensity = 0;
                    if (_this.currentIntensityDirection === DIRECTION_INCREASE) {
                        newIntensity = _this.currentIntensity += _this.intensityChangeSteps;
                    } else {
                        newIntensity = _this.currentIntensity -= _this.intensityChangeSteps;
                    }
                    _this.updateCurrentIntensity(newIntensity);
                    if (_this.currentIntensityDirection === DIRECTION_INCREASE && _this.currentIntensity >= _this.toIntensity) {
                        _this.stopAnimation();
                    }
                    if (_this.currentIntensityDirection === DIRECTION_DECREASE && _this.currentIntensity <= _this.toIntensity) {
                        _this.stopAnimation();
                    }
                }, this.intensityDurationSteps);
            };

            Light.prototype.stopAnimation = function(){
                Script.clearInterval(this.intensityAnimationTimer);
                this.intensityAnimationTimer = null;
            };

            Light.prototype.updateFromProperty = function(property, value) {
                if (Array.isArray(property) && property.length === 2){
                    this.from[property[0]][property[1]] = value;
                } else {
                    this.from[property] = value;
                }
            };

            Light.prototype.updateToProperty = function(property, value) {
                if (Array.isArray(property) && property.length === 2){
                    this.to[property[0]][property[1]] = value;
                } else {
                    this.to[property] = value;
                }
            };

            Light.prototype.updateCurrentProperty = function(property, value) {
                if (Array.isArray(property) && property.length === 2){
                    this.current[property[0]][property[1]] = value;
                } else {
                    this.current[property] = value;
                }
            };

            Light.prototype.transitionDuration = function(newTransitionDuration){
                this.transitionDuration = newTransitionDuration;
                this.updateChange();
            };

            Light.prototype.updateChange = function(){
                var keys = Object.keys(this.current).forEach(function(key){
                    if ('value' in this.current[key]) {
                        this.current[key].changeStep = Math.abs(this.from[key].value - this.to[key].value) * 0.01;
                    } else {
                        var innerKey = Object.keys(this.current[key]);
                        this.current[key][innerKey].changeStep = Math.abs(this.from[key].value - this.to[key].value) * 0.01;
                    }
                }, this);
                this.transitionDurationStep = this.transitionDuration * 0.01;
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
                this.snapshotStore = {};
                this.transitionStore = {};
                this.tempSnapshot = {};
            }

            Snapshots.prototype.addSnapshot = function(snapshot) {
                this.snapshotStore[snapshot.name] = snapshot;
            };

            Snapshots.prototype.addNewSnapshot = function(name) {
                this.snapshotStore[name] = [];
                // ## Not sure if I need this
                // dataStore.currentAnimation = name;  
            };

            Snapshots.prototype.removeSnapshot = function(snapshot) {
                delete this.snapshotStore[snapshot.name];
            };

            Snapshots.prototype.updateSnapshotName = function(newName, oldName){
                console.log(JSON.stringify(this.snapshotStore));
                this.snapshotStore[newName] = this.snapshotStore[oldName];
                // dataStore.currentAnimation = newName;
                delete this.snapshotStore[oldName];
            };

            Snapshots.prototype.startTransition = function(from, to, duration) {
                // this.snapshotStore[animation].forEach(function(light){
                //     lights[light.name].updateFromIntensity(light.from);
                //     lights[light.name].updateToIntensity(light.to);
                //     lights[light.name].updateTransitionIntensityDuration(light.duration);
                //     lights[light.name].startAnimation();
            };

            Snapshots.prototype.assignToKey = function(snapshot, key) {
                // ## TODO
            };
            
            Snapshots.prototype.addTransition = function(name, from, to, duration, key) {
                this.transitionStore[name] = {
                    name: name,
                    from: from,
                    to: to,
                    duration: duration,
                    key: key
                };
            };

            Snapshots.prototype.removeTransition = function(name){
                delete this.transitionStore[name];
            }

            Snapshots.prototype.updateTransitionName = function(newName, oldName){
                this.transitionStore[newName] = this.transitionStore[oldName];
                delete this.transitionStore[oldName];
            } 

            Snapshots.prototype.takeSnapshot = function(){
                
                dataStore.choices.forEach(function(light){
                    console.log("light", light);
                    console.log(JSON.stringify(lights));
                    var properties = Entities.getEntityProperties(lights[light].lightArray[0]);
                    this.tempSnapshot[light] = {};
                    console.log("### properties", JSON.stringify(properties));
                    dataStore.SnapshotProperties.forEach(function(propertyToCopy){
                        if (Array.isArray(propertyToCopy) && propertyToCopy.length === 2){
                            if (properties.type !== "Zone") { 
                                    return; 
                            }
                            this.tempSnapshot[light][propertyToCopy[0]] = {};
                            console.log("### propertyToCopy", JSON.stringify(propertyToCopy));
                            console.log("propertyToCopy", JSON.stringify(propertyToCopy));
                            console.log("### properties[propertyToCopy[0]]", JSON.stringify(properties[propertyToCopy[0]]));
                            this.tempSnapshot[light][propertyToCopy[0]][propertyToCopy[1]] = properties[propertyToCopy[0]][propertyToCopy[1]];
                        } else {
                            this.tempSnapshot[light][propertyToCopy] = properties[propertyToCopy];
                        }
                    }, this);
                }, this);

                console.log("tempSnapshot: ", JSON.stringify( this.tempSnapshot));
            }; 
            
            // ## Don't think I need this since snapshots are a default
            // Snapshots.prototype.resetToDefault = function(snapshot){
            //     this.snapshotStore[animation.name].forEach(function(light){
            //         lights[light.name].resetToDefault();
            //     });
            // };


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

        function createLightAnimation(){

        }

        function loadAnimation(animation){
            dataStore.currentAnimation = animation;
            ui.updateUI(dataStore);
        }

        function addLight(light){
            console.log("IN ADD LIGHT TO ANIMATION HANDLER");
            console.log(JSON.stringify(light));
            dataStore.animations.addLightToAnimation(dataStore.currentAnimation, light);
            ui.updateUI(dataStore);

        }

        function newAnimation(){
            console.log("in new animation")
            dataStore.animations.addNewAnimation("New");
            ui.updateUI(dataStore);
        }

        function updateAnimationName(nameInfo){
            console.log("in update animation name");

            dataStore.animations.updateSnapshotName(nameInfo.newName, nameInfo.oldName);
            ui.updateUI(dataStore);
        }

        function startAnimation(){
            dataStore.animations.startTransition(dataStore.currentAnimation);
        }

        function removeLight(light){
            dataStore.animations.removeLight(dataStore.currentAnimation, light);
            ui.updateUI(dataStore);
        }

        function scriptEnding(){
            var lightKeys = Object.keys(lights);
            lightKeys.forEach(function(lightKey){
                if (lightKeys[lightKey].intensityAnimationTimer !== null) {
                    Script.clearTimeout(lightKeys[lightKey].intensityAnimationTime);
                }
            })
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

            registerLights();
            dataStore.snapshots.takeSnapshot();
            // lights[LIGHTS_ACCENT_SPOT_HOUSE_LEFT].updateFromIntensity(1000);
            // lights[LIGHTS_ACCENT_SPOT_HOUSE_LEFT].updateToIntensity(-1000);
            // lights[LIGHTS_ACCENT_SPOT_HOUSE_LEFT].updateTransitionIntensityDuration(1000);
            // lights[LIGHTS_ACCENT_SPOT_HOUSE_LEFT].startAnimation();

            // lights[LIGHTS_ZONE_STAGE].updateFromIntensity(10);
            // lights[LIGHTS_ZONE_STAGE].updateToIntensity(-1);
            // lights[LIGHTS_ZONE_STAGE].updateTransitionIntensityDuration(20000);
            // lights[LIGHTS_ZONE_STAGE].startAnimation();

            Script.scriptEnding.connect(scriptEnding);
        }

        function updateUI(dataStore) {
            console.log("UPDATE UI");
            var messageObject = {
                type: UPDATE_UI,
                value: dataStore  
            };
            console.log("dataStore: ", JSON.stringify(dataStore));
            ui.sendToHtml(messageObject);
        }

        function onMessage(data) {
            // EventBridge message from HTML script.
            switch (data.type) {
                case EVENT_BRIDGE_OPEN_MESSAGE:
                    console.log("EVENT BRIDGE");
                    ui.updateUI(dataStore);
                    break;
                case EXAMPLE_MESSAGE:
                    exampleFunctionToRun();
                    break;
                case LOAD_ANIMATION:
                    loadAnimation(data.value);
                    break;
                case NEW_ANIMATION:
                    newAnimation();
                    Settings.setValue(SETTINGS_STRING, dataStore);
                    break;
                case UPDATE_ANIMATION_NAME:
                    updateAnimationName(data.value);
                    Settings.setValue(SETTINGS_STRING, dataStore);
                    break;
                case ADD_LIGHT:
                    addLight(data.value);
                    Settings.setValue(SETTINGS_STRING, dataStore);
                    break;
                case REMOVE_LIGHT:
                    removeLight(data.value);
                    Settings.setValue(SETTINGS_STRING, dataStore);
                    break;
                case CREATE_LIGHT_ANIMATION:
                    createLightAnimation();
                    Settings.setValue(SETTINGS_STRING, dataStore);
                    break;
                case START_ANIMATION:
                    startAnimation();
                    break;
                default: 
            }
        }


    // Main
    // /////////////////////////////////////////////////////////////////////////
        startup();
}()); // END LOCAL_SCOPE