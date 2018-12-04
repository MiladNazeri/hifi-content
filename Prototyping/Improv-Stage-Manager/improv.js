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

            UPDATE_UI = BUTTON_NAME + "_update_ui",

            LIGHTS_ACCENT_SPOT_HOUSE_LEFT = "Lights_Accent_Spot_House_Left",
            LIGHTS_ACCENT_SPOT_HOUSE_RIGHT = "Lights_Accent_Spot_House_Right",
            LIGHTS_ACCENT_SPOT_STAGE = "Lights_Accent_Spot_Stage",
            LIGHTS_HOUSE = "Lights_House",
            LIGHTS_ZONE_STAGE = "Lights_Zone_Stage",
            LIGHTS_STAGE_SPOT_MAIN_STAGE_RIGHT = "Lights_Stage_Spot_Main_Stage_Right",
            LIGHTS_STAGE_SPOT_MAIN_STAGE_LEFT = "Lights_Stage_Spot_Main_Stage_Left",

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
                animations: new Animations(),
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
                    LIGHTS_STAGE_SPOT_MAIN_STAGE_LEFT
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
            // console.log("toIntensity", _this.toIntensity)


            // var newIntensity = Math.min(_this.toIntensity, _this.currentIntensity += _this.intensityChangeSteps);
            
            // console.log("newIntensity", newIntensity);
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
                // console.log("new animation step")
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
            this.intensityChangeSteps = Math.abs(this.fromIntensity - this.toIntensity) / this.transitionIntensityDuration;
            this.intensityDurationSteps = this.ransitionIntensityDuration / this.intensityChangeSteps;
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

        function Animations(){
            this.animationGroup = {};
        }

        Animations.prototype.addAnimationConfig = function(animation) {
            this.animationGroup[animation.name] = animation;
        };

        Animations.prototype.addNewAnimation = function(name) {
            this.animationGroup[name] = [];
            dataStore.currentAnimation = name;
        }

        Animations.prototype.addLightToAnimation = function(animation, light){
            console.log("IN ADD LIGHT TO ANIMATION");
            this.animationGroup[animation].push(light);
            console.log("animationGroup: ", JSON.stringify(this.animationGroup));
        };

        Animations.prototype.removeAnimationConfig = function(animation) {
            delete this.animationGroup[animation.name];
        };

        Animations.prototype.updateAnimationName = function(newName, oldName){
            console.log("newName", newName)
            console.log("oldName", oldName)

            console.log(JSON.stringify(this.animationGroup));
            this.animationGroup[newName] = this.animationGroup[oldName];
            dataStore.currentAnimation = newName;
            delete this.animationGroup[oldName];
        }

        Animations.prototype.startAnimation = function(animation) {
            this.animationGroup[animation.name].forEach(function(light){
                lights[light.type].updateFromIntensity(light.from);
                lights[light.type].updateToIntensity(light.to);
                lights[light.type].updateTransitionIntensityDuration(light.duration);
                lights[light.type].startAnimation();
            });
        };

        Animations.prototype.resetToDefault = function(animation){
            this.animationGroup[animation.name].forEach(function(light){
                lights[light.type].resetToDefault();
            });
        }


    // Collections
    // /////////////////////////////////////////////////////////////////////////
        var 
            lights = {}
        ;

    // Helper Functions
    // /////////////////////////////////////////////////////////////////////////
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

            dataStore.animations.updateAnimationName(nameInfo.newName, nameInfo.oldName);
            ui.updateUI(dataStore);
        }

        function startAnimation(){
            dataStore.animations[dataStore.currentAnimation].startAnimation();
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
                    break;
                case UPDATE_ANIMATION_NAME:
                    updateAnimationName(data.value);
                    break;
                case ADD_LIGHT:
                    addLight(data.value);
                    break;
                case CREATE_LIGHT_ANIMATION:
                    createLightAnimation();
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