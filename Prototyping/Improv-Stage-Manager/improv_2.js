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
                    // VISIBLE,
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
        function Mapping(name, key) {
            this.name = name;
            this.key = key;
        }   

        // Light
        // /////////////////////////////////////////////////////////////////////////
            function Light(lightArray,isZone, propsToWatch){
                this.lightArray = lightArray;
                
                this.from = {};
                this.to = {};
                this.current = {};
                
                this.zoneExcludes = ["intensity", "falloffRadius"]
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
                
                // console.log("THIS.CURRNET AT init", JSON.stringify(this.current));
                this.transitionDuration = 0;
                this.transitionDurationStep = 0;

                this.animationTimer = null;
                this.isZone = isZone || false;
                this.editGroup = {};
            }

            Light.prototype.startAnimation = function(){
                console.log("STARTING LIGHT ANIMATION")
                var _this = this;
                // _this.updateCurrentIntensity(_this.fromIntensity);
                // console.log("\n\n ALL OF THIS.FROM \n\n" ,JSON.stringify(this.from));
                Object.keys(this.from).forEach(function(property){
                    console.log(property);
                    console.log("this.from[property])", JSON.stringify(this.from[property]));
                    console.log("typeof this.from[property].value !== 'undefined'", typeof this.from[property].value !== 'undefined'); 
                    var fromValue = 0;
                    var toValue = 0;
                    var innerKey;
                    if (typeof this.from[property].value === 'undefined'){
                        console.log("nested property 5");
                        innerKey = Object.keys(this.from[property])[0];
                        console.log("innerKey", innerKey);
                        fromValue = this.from[property][innerKey].value;
                        console.log("nested fromValue", fromValue);
                        toValue = this.to[property][innerKey].value;
                        console.log("nested toValue", toValue);
                        console.log("ABOUT TO UPDATE TO FROM VALUES");
                        _this.updateCurrentProperty(property, this.from[property][innerKey].value, true);

                    } else {
                        console.log("single property")
                        fromValue = this.from[property].value;
                        console.log("single fromValue", fromValue)

                        toValue = this.to[property].value;
                        console.log("single toValue", toValue);
                        console.log("ABOUT TO UPDATE TO FROM VALUES");
                        _this.updateCurrentProperty(property, this.from[property].value, true);

                    }

                    if (fromValue > toValue){
                        console.log("direction decrease")
                        if (typeof this.from[property].value === 'undefined'){ 
                            console.log("nested property 1")
                            innerKey = Object.keys(this.from[property])[0];
                            _this.current[property][innerKey].direction = DIRECTION_DECREASE; 
                        } else {
                            console.log("single property")
                            _this.current[property].direction = DIRECTION_DECREASE; 
                        }
                    } else if (fromValue < toValue){
                        console.log("direction increase")
                        if (typeof this.from[property].value === 'undefined'){  
                            console.log("nested property 2")
                            _this.current[property][innerKey].direction = DIRECTION_INCREASE; 
                        } else {
                            console.log("single property");
                            _this.current[property].direction = DIRECTION_INCREASE; 
                        }
                    } else {
                        return;
                    }
                    
                    if (typeof this.from[property].value === 'undefined') {
                        innerKey = Object.keys(this.from[property])[0];
                        _this.current[property][innerKey].timer = Script.setInterval(animationUpdate, this.transitionDurationStep);
                    } else {
                        _this.current[property][innerKey].timer = Script.setInterval(animationUpdate, this.transitionDurationStep);
                    }

                    console.log("STARTING ANIMATION");
                    function animationUpdate(){
                        var newValue = 0;
                        var oldValue = 0;
                        var changeStep = 0;

                        if (typeof _this.from[property].value === 'undefined'){ 
                            console.log("nested property check again");
                            innerKey = Object.keys(_this.from[property])[0];
                            console.log("@@ innerkey", innerKey);
                            console.log("@@ property", property);
                            if (_this.current[property][innerKey].direction === DIRECTION_INCREASE){
                                console.log("JSON.stringify(_this.current[property]", JSON.stringify(_this.current[property]));
                                console.log("_this.current[property][innerKey]", JSON.stringify(_this.current[property][innerKey]));
                                oldValue = _this.current[property][innerKey].value[innerKey];
                                changeStep = _this.current[property][innerKey].changeStep;
                                console.log("1 oldValue", oldValue);
                                console.log("1 changeStep", changeStep);

                                newValue = oldValue + changeStep;
                                console.log("1 newValue", newValue);
                            } else {
                                oldValue = _this.current[property][innerKey].value[innerKey];
                                changeStep = _this.current[property][innerKey].changeStep;

                                newValue = oldValue - changeStep;
                                console.log("2 newValue", newValue);
                            }
                            var transformedValue = {};
                            transformedValue[innerKey] = newValue;
                            console.log("ABOUT TO UPDATE!!! NESTED")
                            _this.updateCurrentProperty(property, transformedValue, true);
                        } else {
                            console.log("single property")
                            if (_this.current[property].direction === DIRECTION_INCREASE) {
                                oldValue = _this.current[property].value;
                                changeStep = _this.current[property].changeStep;

                                newValue = oldValue + changeStep;
                                // console.log("3 newValue", newValue);

                            } else {
                                oldValue = _this.current[property].value;
                                changeStep = _this.current[property].changeStep;

                                newValue = oldValue - changeStep;
                                console.log("4 newValue", newValue);
                            }
                            _this.updateCurrentProperty(property, newValue, true);
                        }

                        if (typeof _this.from[property].value === 'undefined'){ 
                            console.log("nested property 4");
                            innerKey = Object.keys(_this.from[property])[0];
                            console.log("4 inner key", JSON.stringify(innerKey));
                            var current = _this.current[property][innerKey].value[innerKey];
                            var to = _this.to[property][innerKey].value;
                            console.log("$$$ current value: ", JSON.stringify(current));
                            console.log("$$$", JSON.stringify(to));
                            console.log("current >= to", current >= to);
                            if (_this.current[property][innerKey].direction === DIRECTION_INCREASE &&
                                current >= to){
                                console.log("A STOPPING ANIMATION");
                                _this.stopAnimation(property, innerKey);
                            }
                            if (_this.current[property][innerKey].direction === DIRECTION_DECREASE &&
                                current <= to){
                                console.log("B STOPPING ANIMATION");

                                _this.stopAnimation(property, innerKey);
                            } 
                        } else {
                            console.log("single property")
                            var current = _this.current[property].value;
                            var to = _this.to[property].value;
                            if (_this.current[property].direction === DIRECTION_INCREASE &&
                                current >= to){
                                console.log("STOPPING ANIMATION")

                                _this.stopAnimation(property);
                            }
                            if (_this.current[property].direction === DIRECTION_DECREASE &&
                               current <= to){
                                console.log("STOPPING ANIMATION")

                                _this.stopAnimation(property);
                            } 
                        }
                    }
                    
                }, this);
            };

            Light.prototype.stopAnimation = function(key, innerKey){
                if (typeof innerKey === "undefined"){
                    console.log("inner key undefined");
                    console.log(JSON.stringify(this.current[key]));
                    if (this.current[key].timer !== null) {
                        console.log("single timer is there going null");
                        Script.clearInterval(this.current[key].timer);
                        this.current[key].timer = null;
                    }
                } else {
                    console.log("inner key is there", JSON.stringify(innerKey));
                    console.log(JSON.stringify(this.current[key][innerKey]));
                    if (this.current[key][innerKey].timer !== null) {
                        console.log("nested timer is there going null")
                        Script.clearInterval(this.current[key][innerKey].timer);
                        this.current[key][innerKey].timer = null;
                    }
                }

            };

            Light.prototype.updateFromProperty = function(property, value) {
                // console.log("\n\n** UPDATE FROM PROPERTY** \n\n");
                // console.log("updateFromProperty: ", JSON.stringify(property));
                // console.log("updateFromValue: ",JSON.stringify(value));

                if (typeof value !== "number"){
                    console.log("this is not a number")
                    var innerKey = Object.keys(value)[0];
                    console.log("\n FROM \n VALUE AT INNER KEY\n", JSON.stringify(value[innerKey]));
                    this.from[property][innerKey].value = value[innerKey];
                    // this.from[property][innerKey].value = value;

                    // console.log("\n final from value E \n", JSON.stringify(this.from[property][innerKey]));
                    // console.log("\n final from with value \n", JSON.stringify(this.from[property][innerKey].value));

                } else {
                    this.from[property].value = value;
                }
            };

            Light.prototype.updateToProperty = function(property, value) {
                // console.log("\n\n** UPDATE TO PROPERTY** \n\n");
                // console.log("updateToProperty: ", JSON.stringify(property));
                // console.log("updateTpValue: ",JSON.stringify(value));
                if (typeof value !== "number"){
                    console.log("this is not a number")
                    var innerKey = Object.keys(value)[0];
                    console.log("\n TO \n VALUE AT INNER KEY\n", JSON.stringify(value[innerKey]));
                    this.to[property][innerKey].value = value[innerKey]
                    // this.to[property][innerKey].value = value;

                } else {
                    this.to[property].value = value;
                }
            };

            Light.prototype.updateCurrentProperty = function(property, value, sendEdit) {
                // console.log("\n\n** UPDATE CURRENT PROPERTY** \n\n");
                // console.log("updateCurrentProperty: ", JSON.stringify(property));
                // console.log("updateCurrentValue: ",JSON.stringify(value));

                if (typeof value !== "number"){
                    var innerKey = Object.keys(value)[0];
                    // console.log("INNER KEY FOR CURRENT:", innerKey);
                    // console.log("\n cURRENT \n VALUE AT INNER KEY\n", JSON.stringify(value[innerKey]));
                    // this.current[property][innerKey].value = value[innerKey];
                    this.current[property][innerKey].value = value[innerKey];
                    this.editGroup[property] = {};
                    this.editGroup[property] = this.current[property][innerKey].value = value;

                } else {
                    this.current[property].value = value;

                    this.editGroup[property] = value;
                }
                console.log(JSON.stringify(this.editGroup));
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
                    // console.log(JSON.stringify(this.current));
                    // console.log("key", key);
                    if (typeof this.current[key].value !== 'undefined') {
                        // console.log("regular property");
                        this.current[key].changeStep = Math.abs(this.from[key].value - this.to[key].value) * 0.01;
                    } else {
                        // console.log("nested property");
                        var innerKey = Object.keys(this.current[key]);
                        // console.log("innerKey:", JSON.stringify(innerKey));
                        this.current[key][innerKey].changeStep = Math.abs(this.from[key][innerKey].value - this.to[key][innerKey].value) * 0.01;
                    }
                }, this);
            };

            Light.prototype.sendEdit = function() {
                // console.log("sending over: ", JSON.stringify(this.editGroup))
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
            }

            Snapshots.prototype.addSnapshot = function(name) {
                console.log("adding snapshot: ", name)
                this.tempSnapshot.name = name;
                this.snapshotStore[name] = this.tempSnapshot;
                this.tempSnapshot = {};
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
            };

            Snapshots.prototype.takeSnapshot = function(){
                console.log("taking snapshot");
                dataStore.choices.forEach(function(light){
                    // console.log("light", light);
                    // console.log(JSON.stringify(lights));
                    var properties = Entities.getEntityProperties(lights[light].lightArray[0]);
                    this.tempSnapshot[light] = {};
                    // console.log("### properties", JSON.stringify(properties));
                    dataStore.SnapshotProperties.forEach(function(propertyToCopy){
                        if (Array.isArray(propertyToCopy) && propertyToCopy.length === 2){
                            // console.log("propertyToCopy", propertyToCopy)
                            if (properties.type !== "Zone") { 
                                    return; 
                            }
                            this.tempSnapshot[light][propertyToCopy[0]] = {};
                            // console.log("### propertyToCopy", JSON.stringify(propertyToCopy));
                            // console.log("propertyToCopy", JSON.stringify(propertyToCopy));
                            // console.log("### properties[propertyToCopy[0]]", JSON.stringify(properties[propertyToCopy[0]]));
                            this.tempSnapshot[light][propertyToCopy[0]][propertyToCopy[1]] = properties[propertyToCopy[0]][propertyToCopy[1]];
                        } else {
                            if (properties.type === "Zone" && (propertyToCopy === INTENSITY || propertyToCopy === FALLOFF_RADIUS )) {
                                    return;
                            }
                            if (light === LIGHTS_ZONE_STAGE);{
                                // console.log("propertyToCopy", propertyToCopy)
                                // console.log("properties[propertyToCopy]", properties[propertyToCopy])
                            }
                            this.tempSnapshot[light][propertyToCopy] = properties[propertyToCopy];
                        }
                    }, this);
                }, this);

                // console.log("tempSnapshot: ", JSON.stringify( this.tempSnapshot));
            }; 
            
            Snapshots.prototype.loadSnapshot = function(snapshot){
                console.log("Loading snapshot: ", snapshot);
                this.getSnapshotLightkeys(snapshot).forEach(function(light){
                    // console.log("light", light)
                    this.getSnapshotPropertyKeys(snapshot, light).forEach(function(property){
                        if (light === LIGHTS_ZONE_STAGE){
                            // console.log("property", property)
                            // console.log("this.snapshotStore[snapshot][light][property]", JSON.stringify(this.snapshotStore[snapshot][light][property]));
                        }
                        
                        lights[light].updateCurrentProperty(
                            property, this.snapshotStore[snapshot][light][property], false
                        );
                    }, this);
                    lights[light].sendEdit();
                }, this);
            };

            Snapshots.prototype.getSnapshotLightkeys = function(snapshot){
                console.log("### snapshot", snapshot);     
                console.log("SNAPSHOT");
                console.log(JSON.stringify(this.snapshotStore));
                return Object.keys(this.snapshotStore[snapshot]).filter(function(key){
                    return key !== "name";
                });
            };

            Snapshots.prototype.getSnapshotPropertyKeys = function(snapshot, light){
                // console.log("### snapshot", snapshot);                
                // console.log("### light", light);
                // console.log("Object.keys(this.snapshotStore[snapshot][light]:", Object.keys(this.snapshotStore[snapshot][light]))
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
                this.getSnapshotLightkeys(from).forEach(function(light){
                    this.getSnapshotPropertyKeys(from, light).forEach(function(property){
                        console.log("\n\n\n *** CHECKING UPDATE FROM PROPERTY *** \n\n\n");
                        console.log("PROPERTY GOING INTO FROM PROPERTY", JSON.stringify(property));
                        console.log(" this.snapshotStore[from][light][property]", JSON.stringify(this.snapshotStore[from][light][property]));
                        
                        console.log("light and property: ", light," : " , property);
                        
                        var zoneExcludes = ["intensity", "falloffRadius"];
                        if (light.toLowerCase().indexOf("zone") > -1 && zoneExcludes.indexOf(property) > -1){
                            console.log("\n\n\n *** RETURNING FROM UPDATE FROM PROPERTY *** \n\n\n");
                            console.log("FOUND ZONE", light);
                            console.log("FOUND bad property", property);

                            return;
                        }
                        lights[light].updateFromProperty(
                            property, this.snapshotStore[from][light][property]
                        );
                    }, this);
                }, this);

                this.getSnapshotLightkeys(to).forEach(function(light){
                    this.getSnapshotPropertyKeys(to, light).forEach(function(property){
                        lights[light].updateToProperty(
                            property, this.snapshotStore[to][light][property]
                        );
                    }, this);
                }, this);
                
                this.getSnapshotLightkeys(from).forEach(function(light){
                    lights[light].updateTransitionDuration(duration);
                });

                this.getSnapshotLightkeys(from).forEach(function(light){
                    lights[light].startAnimation();
                });

            };

            Snapshots.prototype.executeTransitionByName = function(name){
                var from = this.transitionStore[name].from;
                var to = this.transitionStore[name].to;
                var duration = this.transitionStore[name].duration;

                this.startTransition(from, to, duration);
            };

            Snapshots.prototype.removeTransition = function(name){
                delete this.transitionStore[name];
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

        function saveSettings(){
            Settings.setValue(SETTINGS_STRING, dataStore);
        }

        function loadSettings(){
            dataStore = Settings.getValue(SETTINGS_STRING);
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

        function loadSnapshot(animation){
            dataStore.currentAnimation = animation;
            ui.updateUI(dataStore);
        }

        // function addLight(light){
        //     console.log("IN ADD LIGHT TO ANIMATION HANDLER");
        //     // console.log(JSON.stringify(light));
        //     dataStore.animations.addLightToAnimation(dataStore.currentAnimation, light);
        //     ui.updateUI(dataStore);

        // }

        function removeLight(light){
            dataStore.animations.removeLight(dataStore.currentAnimation, light);
            ui.updateUI(dataStore);
        }

        function newSnapshot(){
            console.log("in new animation")
            dataStore.animations.addNewAnimation("New");
            ui.updateUI(dataStore);
        }

        function renameSnapshot(nameInfo){
            console.log("in update animation name");

            dataStore.animations.updateSnapshotName(nameInfo.newName, nameInfo.oldName);
            ui.updateUI(dataStore);
        }

        function startAnimation(){
            dataStore.animations.startTransition(dataStore.currentAnimation);
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
        // if (dataStore.mapping[event.text]) {
          
        // }
    }
    
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
            
            // Tests
            // /////////////////////////////////////////////////////////////////////////// 
            /*
                var testSnapshotName ="SNAPTEST";
                var updatedSnapshotname = "UPDATED_SNAPTEST";
                var snapKey = "X";
                var transitionKey = "C";
                var newTransitionKey = "D";
                var snapTestTwo = "SnapTestTwo";
                var transitionName = "oneToTwo";
                var updatedTransitionName = "UPDATED_TRANSITION";
                var duration = 2000;
                console.log("\n\n\nSTARTING TESTS\n\n\n");
                
                console.log("\n\nTesting take snapshot\n");
                
                dataStore.snapshots.takeSnapshot();
                console.log("Tempsnapshot Object.keys > 0 : ", Object.keys(dataStore.snapshots.tempSnapshot).length > 0);
                console.log("snap shot has every light in choices: ", Object.keys(dataStore.snapshots.tempSnapshot).length === dataStore.choices.length);
                
                console.log("\n\nTesting add snapshot\n");
                
                // console.log(JSON.stringify(dataStore.snapshots.tempSnapshot));
                dataStore.snapshots.addSnapshot(testSnapshotName);
                console.log("Snapshot exists in snapshot store : ", dataStore.snapshots.snapshotStore[testSnapshotName].name === testSnapshotName);
                console.log("temp snapshot is empty : ", Object.keys(dataStore.snapshots.tempSnapshot).length === 0);
                
                console.log("\n\nTesting rename snapshot\n");         
                
                dataStore.snapshots.renameSnapshot(testSnapshotName, updatedSnapshotname);
                console.log("Snapshot name updated and exists: ", Object.keys(dataStore.snapshots.snapshotStore).indexOf(updatedSnapshotname) > -1);
                console.log("old Snapshot name doesnt exist: ", Object.keys(dataStore.snapshots.snapshotStore).indexOf(testSnapshotName) === -1);
                
                console.log("\n\nTesting Assign snapshot to key\n"); 

                dataStore.snapshots.assignSnapshotToKey(updatedSnapshotname, snapKey);
                console.log("X assigned to snapshot: ", dataStore.snapshots.snapshotStore[updatedSnapshotname].key === snapKey);
                // console.log(JSON.stringify(dataStore.snapshots.snapshotStore));            
                
                console.log("\n\nTesting Adding transition\n");

                dataStore.snapshots.takeSnapshot();
                dataStore.snapshots.addSnapshot(snapTestTwo);
                dataStore.snapshots.addTransition(transitionName, updatedSnapshotname, snapTestTwo, duration, transitionKey);
                console.log("Transition exits: ", Object.keys(dataStore.snapshots.transitionStore).indexOf(transitionName) > -1);
                console.log("Transition correct name : ", dataStore.snapshots.transitionStore[transitionName].name === transitionName);
                console.log("Transition correct from : ", dataStore.snapshots.transitionStore[transitionName].from === updatedSnapshotname);               
                console.log("Transition correct to : ", dataStore.snapshots.transitionStore[transitionName].to === snapTestTwo);                              
                console.log("Transition correct duration : ", dataStore.snapshots.transitionStore[transitionName].duration === duration);              
                console.log("Transition correct key : ", dataStore.snapshots.transitionStore[transitionName].key === transitionKey);               
                
                console.log("\n\nTesting updateTransitionName \n");         
                
                dataStore.snapshots.renameTransition(transitionName, updatedTransitionName);
                console.log("TRANSITION name updated and exists: ", Object.keys(dataStore.snapshots.transitionStore).indexOf(updatedTransitionName) > -1);
                console.log("old transition name doesnt exist: ", Object.keys(dataStore.snapshots.transitionStore).indexOf(transitionName) === -1);
                
                console.log("\n\nTesting Assign snapshot to key\n"); 

                dataStore.snapshots.assignTransitionToKey(updatedTransitionName, newTransitionKey);
                console.log("D assigned to snapshot: ", dataStore.snapshots.transitionStore[updatedTransitionName].key === newTransitionKey);
                // console.log(JSON.stringify(dataStore.snapshots.snapshotStore));            
                
                console.log("\n\nTesting getSnapshotLightkeys \n");         
                console.log("dataStore.snapshots.getSnapshotLightkeys(updatedSnapshotname); ", dataStore.snapshots.getSnapshotLightkeys(updatedSnapshotname));                
                
                console.log("\n\nTesting getSnapshotPropertyKeys \n");         
                console.log("dataStore.snapshots.getSnapshotPropertyKeys(updatedSnapshotname); ", dataStore.snapshots.getSnapshotPropertyKeys(updatedSnapshotname, LIGHTS_ACCENT_SPOT_HOUSE));                
                
                console.log("old transition name doesnt exist: ", Object.keys(dataStore.snapshots.transitionStore).indexOf(transitionName) === -1);
                
                */
            
                // NOT COVERED
                /*
                    dataStore.snapshots.loadSnapshot
                    dataStore.snapshots.getSnapshotLightkeys
                    dataStore.snapshots.getSnapshotPropertyKeys
                    dataStore.snapshots.startTransition

                // CLEAN UP
                console.log("\n\nTesting remove transition\n");         

                dataStore.snapshots.removeTransition(updatedTransitionName);
                console.log("Transition no longer exists: ", Object.keys(dataStore.snapshots.transitionStore).indexOf(transitionName) === -1);

                console.log("\n\nTesting remove snapshot\n");         

                dataStore.snapshots.removeSnapshot(updatedSnapshotname);
                console.log("Snapshot no longer exists: ", Object.keys(dataStore.snapshots.snapshotStore).indexOf(updatedSnapshotname) === -1);
                
                console.log("\n\n\nENDING TESTS TESTS\n\n\n");
                */

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
            // console.log("dataStore: ", JSON.stringify(dataStore));
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
                    loadSnapshot(data.value);
                    break;
                case NEW_ANIMATION:
                    newSnapshot();
                    Settings.setValue(SETTINGS_STRING, dataStore);
                    break;
                case UPDATE_ANIMATION_NAME:
                    renameSnapshot(data.value);
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