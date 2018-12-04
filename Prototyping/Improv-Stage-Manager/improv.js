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
    
    // Consts
    // /////////////////////////////////////////////////////////////////////////
        var 
            URL = Script.resolvePath("./html/Tablet.html"),
            BUTTON_NAME = "IMPROV", // !important update in Tablet.js as well, MUST match Example.js

            EXAMPLE_MESSAGE = "EXAMPLE_MESSAGE",
            
            EVENT_BRIDGE_OPEN_MESSAGE = BUTTON_NAME + "eventBridgeOpen",
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
            DEFAULT_LIGHTS_KEY_COLOR = [255, 191, 89]

        ;

    // Init
    // /////////////////////////////////////////////////////////////////////////
        var 
            ui,
            dataStore = {
                ui: {
                }
            }
        ;
    // Constructors
    // /////////////////////////////////////////////////////////////////////////
        function LIGHT(lightArray, currentValue, minIntensityValue, maxIntensityValue, transitionIntensityDuration, fromIntensity, toIntensity, color, transitionColorDuration, fromColor, toColor){
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
            this.editGroup = {};

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
        LIGHT.prototype.updateCurrentIntensity = function(newIntensity) {
            this.currentIntensity = newIntensity;
            this.editGroup = {
                intensity: this.currentIntensity
            };
            this.sendEdit();
        };
        Entities.editEntity("", {})
        LIGHT.prototype.updateIntensityDirection = function(newDirection) {
            this.currentIntensityDirection = newDirection;
        };
        LIGHT.prototype.startAnimation = function(){
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
            console.log("_this.currentIntensity", _this.currentIntensity);

            this.intensityAnimationTimer = Script.setInterval(function(){
                // console.log("new animation step")
                var newIntensity = 0;
                console.log("_this.currentIntensity", _this.currentIntensity);
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
        LIGHT.prototype.stopAnimation = function(){
            Script.clearInterval(this.intensityAnimationTimer);
            this.intensityAnimationTimer = null;
        };
        LIGHT.prototype.updateMaxIntensity = function(newMaxIntensity) {
            this.maxIntensityValue = newMaxIntensity;
        };
        LIGHT.prototype.updateMinIntensity = function(newMinIntensity) {
            this.minIntensityValue = newMinIntensity;
        };
        LIGHT.prototype.updateFromIntensity = function(newFromIntensity) {
            this.fromIntensity = newFromIntensity;
        };
        LIGHT.prototype.updateToIntensity = function(newToIntensity) {
            this.toIntensity = newToIntensity;
        };
        LIGHT.prototype.updateTransitionIntensityDuration = function(newTransitionDuration){
            this.transitionIntensityDuration = newTransitionDuration;
            this.updateIntensityChangeSteps();
        };
        LIGHT.prototype.updateIntensityChangeSteps = function(){
            this.intensityChangeSteps = Math.abs(this.fromIntensity - this.toIntensity) / this.transitionIntensityDuration;
            this.intensityDurationSteps = this.ransitionIntensityDuration / this.intensityChangeSteps;
        };
        LIGHT.prototype.sendEdit = function() {
            this.lightArray.forEach(function(light){
                // console.log("light:", light)
                Entities.editEntity(light, this.editGroup);
            }, this);
            this.editGroup = {};
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
                    lights[lightKey] = new LIGHT(lights[lightKey], DEFAULT_ACCENT_INTENSITY, DEFAULT_MIN_INTENSITY_VALUE, DEFAULT_MAX_INTENSITY_VALUE, DEFAULT_TRANSITION_TIME);
                }
                if (lightKey.indexOf(LIGHTS_ACCENT_SPOT_STAGE) > -1) {
                    lights[lightKey] = new LIGHT(lights[lightKey], DEFAULT_SPOT_STAGE_INTENSITY, DEFAULT_MIN_INTENSITY_VALUE, DEFAULT_MAX_INTENSITY_VALUE, DEFAULT_TRANSITION_TIME);
                } 
                if (lightKey.indexOf(LIGHTS_HOUSE) > -1) {
                    lights[lightKey] = new LIGHT(lights[lightKey], DEFAULT_LIGHTS_HOUSE_INTENSITY, DEFAULT_MIN_INTENSITY_VALUE, DEFAULT_MAX_INTENSITY_VALUE, DEFAULT_TRANSITION_TIME);
                } 
                if (lightKey.indexOf(LIGHTS_ZONE_STAGE) > -1) {
                    lights[lightKey] = new LIGHT(lights[lightKey], DEFAULT_LIGHTS_ZONE_STAGE, DEFAULT_MIN_INTENSITY_VALUE, DEFAULT_MAX_INTENSITY_VALUE, DEFAULT_TRANSITION_TIME);
                } 
                if (lightKey.indexOf("Lights_Stage_Spot_Main") > -1) {
                    lights[lightKey] = new LIGHT(lights[lightKey], DEFAULT_LIGHTS_STAGE_SPOT_INTENSITY, DEFAULT_MIN_INTENSITY_VALUE, DEFAULT_MAX_INTENSITY_VALUE, DEFAULT_TRANSITION_TIME);
                }
            })
        }

        function exampleFunctionToRun(){

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
            ui = new AppUi({
                buttonName: BUTTON_NAME,
                home: URL,
                onMessage: onMessage,
                updateUI: updateUI
            });

            registerLights();
            lights[LIGHTS_ACCENT_SPOT_HOUSE_LEFT].updateFromIntensity(1000);
            lights[LIGHTS_ACCENT_SPOT_HOUSE_LEFT].updateToIntensity(-1000);
            lights[LIGHTS_ACCENT_SPOT_HOUSE_LEFT].updateTransitionIntensityDuration(1000);
            console.log("about to run start animation")
            lights[LIGHTS_ACCENT_SPOT_HOUSE_LEFT].startAnimation();

            Script.scriptEnding.connect(scriptEnding);
        }

        function updateUI(dataStore) {
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
                    ui.updateUI(dataStore);
                    break;
                case EXAMPLE_MESSAGE:
                    exampleFunctionToRun();
                    break;
                default: 
            }
        }


    // Main
    // /////////////////////////////////////////////////////////////////////////
        startup();
}()); // END LOCAL_SCOPE