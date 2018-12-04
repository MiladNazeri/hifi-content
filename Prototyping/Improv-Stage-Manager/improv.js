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

            EXAMPLE_MESSAGE = "EXAMPLE_MESSAGE",
            
            EVENT_BRIDGE_OPEN_MESSAGE = BUTTON_NAME + "_eventBridgeOpen",
            LOAD_ANIMATION = "load_animation",
            START_ANIMATION = "start_animation",
            ADD_LIGHT = "add_light",
            NEW_ANIMATION = "new_animation",
            UPDATE_ANIMATION_NAME = "update_animation_name",
            UPDATE_CONFIG_NAME = "updateConfigName",
            ADD_CAMERA_POSITION = "addCameraPosition",
            REMOVE_CAMERA_POSITION = "removeCameraPosition",
            CREATE_LIGHT_ANIMATION = "create_light_animation",
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
            LIGHTS_UPSTAGE_FILL_LEFT = "Lights_Update-Fill-Left",
            LIGHTS_UPSTAGE_FILL_RIGHT = "Lights_Update-Fill-Right",
            LIGHTS_ZONE_STAGE = "Lights_Zone_Stage",

            INTENSITY = "intensity",
            FALLOFF_RADIUS = "falloffRadius",
            VISIBLE = "visible",
            KEYLIGHT = "keyLight",
            AMBIENT_LIGHT = "ambientLight",
            AMBIENT_INTENSITY = "ambientIntensity",

            DIRECTION_INCREASE = "direction_increase",
            DIRECTION_DECREASE = "direction_decrease",

            DEFAULT_MAX_INTENSITY_VALUE = 100,
            DEFAULT_MIN_INTENSITY_VALUE = -1,
            DEFAULT_TRANSITION_TIME = 2000

            DEFAULT_ACCENT_INTENSITY = 4.0,
            DEFAULT_ACCENT_COLOR = [203, 61, 255],

            DEFAULT_SPOT_STAGE_INTENSITY = 3.0,
            DEFAULT_SPOT_STAGE_COLOR = [203, 61, 255],

            DEFAULT_LIGHTS_HOUSE_INTENSITY = 4.0,
            DEFAULT_LIGHTS_HOUSE_COLOR = [105, 6, 32],

            DEFAULT_LIGHTS_STAGE_SPOT_INTENSITY = 5.0,
            DEFAULT_LIGHTS_STAGE_SPOT_COLOR = [255, 164, 125],

            DEFAULT_LIGHTS_ZONE_STAGE = 0.70,
            DEFAULT_LIGHTS_KEY_COLOR = [255, 191, 89],

            SETTINGS_STRING = "io.improv.settings"


        ;

    // Init
    // /////////////////////////////////////////////////////////////////////////
        var 
            ui,
            defaultDataStore = {
                animations: new Snapshots(),
                // animations: {
                //     "test1": [
                //         {
                //             name: "Lights_House",
                //             from: 24,
                //             to: 100,
                //             duration: 5000
                //         },
                //         {
                //             name: "Lights_Zone_Stage",
                //             from: 24,
                //             to: 100,
                //             duration: 5000
                //         }
                //     ],
                //     "test2": [
                //         {
                //             name: "Lights_House",
                //             from: 0,
                //             to: 100,
                //             duration: 15000
                //         }
                //     ]
                // },
                choices: [
                    LIGHTS_ACCENT_SPOT_HOUSE_LEFT, 
                    LIGHTS_ACCENT_SPOT_HOUSE_RIGHT,
                    LIGHTS_ACCENT_SPOT_STAGE,
                    LIGHTS_HOUSE,
                    LIGHTS_ZONE_STAGE,
                    LIGHTS_STAGE_SPOT_MAIN_STAGE_RIGHT,
                    LIGHTS_STAGE_SPOT_MAIN_STAGE_LEFT,
                    LIGHTS_MC_CENTER_SPOT,
                    LIGHTS_STAGE_ACCENT,
                    LIGHTS_UPSTAGE_FILL_LEFT,
                    LIGHTS_UPSTAGE_FILL_RIGHT
                ],
                SnapshotProperties: [
                    INTENSITY,
                    FALLOFF_RADIUS,
                    VISIBLE,
                    [KEYLIGHT, INTENSITY],
                    [AMBIENT_LIGHT, AMBIENT_INTENSITY]
                ],
                currentAnimation: "",
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
        function Light(
            lightArray, 
            currentValue, minIntensityValue, maxIntensityValue, 
            transitionIntensityDuration, 
            isZone, 
            fromIntensity, toIntensity, 
            color, transitionColorDuration, fromColor, toColor){

            this.lightArray = lightArray;
            this.currentIntensity = currentValue || 0;
            this.currentIntensityDirection = DIRECTION_INCREASE;
            this.maxIntensityValue = maxIntensityValue;
            this.minIntensityValue = minIntensityValue;
            this.DEFAULT_INTENSITY = currentValue;
            this.DEFAULT_MAX_INTENSITY_VALUE = maxIntensityValue;
            this.DEFAULT_MIN_INTENSITY_VALUE = minIntensityValue;
            this.fromIntensity = fromIntensity || minIntensityValue;
            this.toIntensity = toIntensity || maxIntensityValue;
            this.transitionIntensityDuration = transitionIntensityDuration;
            this.intensityChangeSteps = Math.abs(maxIntensityValue - minIntensityValue) / transitionIntensityDuration;
            this.intensityDurationSteps = transitionIntensityDuration / this.intensityChangeSteps;
            this.intensityAnimationTimer = null;
            this.isZone = isZone || false;
            this.editGroup = {};
            
            if (isZone){
                Entities.editEntity(lightArray[0], {keyLight: { intensity: currentValue } });
            }
            this.lightArray.forEach(function(light){
                // console.log("currentValue", currentValue);
                Entities.editEntity(light, {intensity: currentValue});
            });
            this.editGroup = {};
            // this.transitionColorDuration = transitionColorDuration;
            // this.fromColor = fromColor;
            // this.toColor = toColor;
            // this.currentColor = color || [255,255,255];
            // this.currentPosition = [0,0,0];
            // this.currentRotation = [0,0,0,0];
            // this.colorSteps = (maxIntensityValue - minIntensityValue) / transitionIntensityDuration;
        }
        Light.prototype.updateCurrentIntensity = function(newIntensity) {
            this.currentIntensity = newIntensity;
            if (this.isZone) {
                this.editGroup = {
                    keyLight: {
                        intensity: this.currentIntensity
                    }
                };
            } else {
                this.editGroup = {
                    intensity: this.currentIntensity
                };
            }

            this.sendEdit();
        };
        Light.prototype.updateIntensityDirection = function(newDirection) {
            this.currentIntensityDirection = newDirection;
        };
        Light.prototype.startAnimation = function(){
            var _this = this;
            console.log("toIntensity", _this.toIntensity)


            // var newIntensity = Math.min(_this.toIntensity, _this.currentIntensity += _this.intensityChangeSteps);
            
            if (_this.fromIntensity === _this.toIntensity) {
                return;
            }
            _this.updateCurrentIntensity(_this.fromIntensity);
            if (_this.fromIntensity > _this.toIntensity){
                _this.currentIntensityDirection = DIRECTION_DECREASE;   
            } else {
                _this.currentIntensityDirection = DIRECTION_INCREASE;   
            }

            console.log("_this.intensityChangeSteps", _this.intensityChangeSteps);
            console.log("_this.intensityDurationSteps", _this.intensityDurationSteps);
            console.log("_this.fromIntensity", _this.fromIntensity);
            console.log("_this.toIntensity", _this.toIntensity);
            console.log("_this.toIntensity", _this.currentIntensity);


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
        Light.prototype.updateMaxIntensity = function(newMaxIntensity) {
            this.maxIntensityValue = newMaxIntensity;
        };
        Light.prototype.updateMinIntensity = function(newMinIntensity) {
            this.minIntensityValue = newMinIntensity;
        };
        Light.prototype.updateFromIntensity = function(newFromIntensity) {
            this.fromIntensity = newFromIntensity;
        };
        Light.prototype.updateToIntensity = function(newToIntensity) {
            this.toIntensity = newToIntensity;
        };
        Light.prototype.updateTransitionIntensityDuration = function(newTransitionDuration){
            this.transitionIntensityDuration = newTransitionDuration;
            this.updateIntensityChangeSteps();
        };
        Light.prototype.updateIntensityChangeSteps = function(){
            this.intensityChangeSteps =  Math.abs(this.fromIntensity - this.toIntensity) * 0.01;
            this.intensityDurationSteps = this.transitionIntensityDuration * 0.01;
        };
        Light.prototype.sendEdit = function() {
            this.lightArray.forEach(function(light){
                // console.log("light:", light)
                Entities.editEntity(light, this.editGroup);
            }, this);
            this.editGroup = {};
        };
        Light.prototype.resetToDefault = function() {
            this.updateCurrentIntensity(this.DEFAULT_INTENSITY);
        };
        // LIGHT.prototype.updateCurrentColor = function(newColor) {
        //     this.currentColor = newColor;
        //     this.editGroup = {
        //         color: this.currentColor
        //     };
        //     this.sendEdit();
        // };
        // LIGHT.prototype.updateFromColor = function(newFromColor) {
        //     this.fromColor = newFromColor;
        // };
        // LIGHT.prototype.updateToColor = function(newToColor) {
        //     this.toItensity = newToColor;
        // };

        function Snapshots(){
            this.snapshotStore = {};
        }

        Snapshots.prototype.addSnapshot = function(snapshot) {
            this.snapshotStore[snapshot.name] = snapshot;
        };

        Snapshots.prototype.addNewSnapshot = function(name) {
            this.snapshotStore[name] = [];
            // ## Not sure if I need this
            // dataStore.currentAnimation = name;  
        }

        // Snapshots.prototype.addLightToAnimation = function(animation, light){
        //     console.log("IN ADD LIGHT TO ANIMATION");
        //     this.snapshotStore[animation].push(light);
        //     console.log("snapshotStore: ", JSON.stringify(this.snapshotStore));
        // };

        Snapshots.prototype.removeSnapshot = function(snapshot) {
            delete this.snapshotStore[snapshot.name];
        };

        Snapshots.prototype.updateSnapshotName = function(newName, oldName){
            console.log(JSON.stringify(this.snapshotStore));
            this.snapshotStore[newName] = this.snapshotStore[oldName];
            // dataStore.currentAnimation = newName;
            delete this.snapshotStore[oldName];
        };

        // Snapshots.prototype.removeLight = function(animation, light){
        //     var index = findObjectIndexByKey(this.snapshotStore[animation], "name", light);
        //     this.snapshotStore[animation].splice(index, 1);
        // };

        Snapshots.prototype.startTransition = function(from, to, duration) {
            // this.snapshotStore[animation].forEach(function(light){
            //     lights[light.name].updateFromIntensity(light.from);
            //     lights[light.name].updateToIntensity(light.to);
            //     lights[light.name].updateTransitionIntensityDuration(light.duration);
            //     lights[light.name].startAnimation();
            // });
        };

        Snapshots.prototype.resetToDefault = function(animation){
            this.snapshotStore[animation.name].forEach(function(light){
                lights[light.name].resetToDefault();
            });
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
    // Procedural Functions
    // /////////////////////////////////////////////////////////////////////////
        
        function registerLights(){
            lights[LIGHTS_ACCENT_SPOT_HOUSE_LEFT] = Entities.findEntitiesByName(LIGHTS_ACCENT_SPOT_HOUSE_LEFT, MyAvatar.position, 25);
            lights[LIGHTS_ACCENT_SPOT_HOUSE_RIGHT] = Entities.findEntitiesByName(LIGHTS_ACCENT_SPOT_HOUSE_RIGHT, MyAvatar.position, 25);
            lights[LIGHTS_ACCENT_SPOT_STAGE] = Entities.findEntitiesByName(LIGHTS_ACCENT_SPOT_STAGE, MyAvatar.position, 25);
            lights[LIGHTS_HOUSE] = Entities.findEntitiesByName(LIGHTS_HOUSE, MyAvatar.position, 25);
            lights[LIGHTS_STAGE_SPOT_MAIN_STAGE_RIGHT] = Entities.findEntitiesByName(LIGHTS_STAGE_SPOT_MAIN_STAGE_RIGHT, MyAvatar.position, 25);
            lights[LIGHTS_STAGE_SPOT_MAIN_STAGE_LEFT] = Entities.findEntitiesByName(LIGHTS_STAGE_SPOT_MAIN_STAGE_LEFT, MyAvatar.position, 25);
            lights[LIGHTS_ZONE_STAGE] = Entities.findEntitiesByName(LIGHTS_ZONE_STAGE, MyAvatar.position, 25);

            var lightKeys = Object.keys(lights);
            lightKeys.forEach(function(lightKey){
                if (lightKey.indexOf("Lights_Accent_Spot_House") > -1) {
                    lights[lightKey] = new Light(lights[lightKey], DEFAULT_ACCENT_INTENSITY, DEFAULT_MIN_INTENSITY_VALUE, DEFAULT_MAX_INTENSITY_VALUE, DEFAULT_TRANSITION_TIME);
                }
                if (lightKey.indexOf(LIGHTS_ACCENT_SPOT_STAGE) > -1) {
                    lights[lightKey] = new Light(lights[lightKey], DEFAULT_SPOT_STAGE_INTENSITY, DEFAULT_MIN_INTENSITY_VALUE, DEFAULT_MAX_INTENSITY_VALUE, DEFAULT_TRANSITION_TIME);
                } 
                if (lightKey.indexOf(LIGHTS_HOUSE) > -1) {
                    lights[lightKey] = new Light(lights[lightKey], DEFAULT_LIGHTS_HOUSE_INTENSITY, DEFAULT_MIN_INTENSITY_VALUE, DEFAULT_MAX_INTENSITY_VALUE, DEFAULT_TRANSITION_TIME);
                } 
                if (lightKey.indexOf(LIGHTS_ZONE_STAGE) > -1) {
                    lights[lightKey] = new Light(lights[lightKey], DEFAULT_LIGHTS_ZONE_STAGE, DEFAULT_MIN_INTENSITY_VALUE, DEFAULT_MAX_INTENSITY_VALUE, DEFAULT_TRANSITION_TIME, true);
                } 
                if (lightKey.indexOf("Lights_Stage_Spot_Main") > -1) {
                    lights[lightKey] = new Light(lights[lightKey], DEFAULT_LIGHTS_STAGE_SPOT_INTENSITY, DEFAULT_MIN_INTENSITY_VALUE, DEFAULT_MAX_INTENSITY_VALUE, DEFAULT_TRANSITION_TIME);
                }
            })
        }

        function exampleFunctionToRun(){

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
                if (lightKeys[lightKey].intensityAnimationTimer) {
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