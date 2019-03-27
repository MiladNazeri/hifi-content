/*

    Italian
    wordBuilder.js
    Created by Milad Nazeri on 2019-03-21
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    Build out the words from the google sheet/

*/

// Create the category
// Create the italian text
// Create the English text
// Parent those to the category
// Create a list of cateogries(should be done already but map to ids)
// Create a map of text (maybe)
// Alternate the colors of text
// Text Color 1
// Text color 2
// Text backgroun color 1
// Text background color 2
// Create the room
// Adjust the room for how long the category is
// adjust the category to how long the group of texts are
// bring in text builder and calculate the text size from that
// Position the rooms in rows
// Position the rooms in columns
// Add Audio if you step close to a card
// Distance between cards
// Distance between rooms
// Distance between columns
// Dynamically adjust the floor based on rows
// Should I make it a second story? 
// Give the rooms random materials for the walls
// Randomize the floor texture for the room?
// Rooms should be Floor, Ceiling, Wall1, Wall2, Wall3, DoorA, DoorB
// Minimum distance between doors

(function(){
    // taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign

    if (typeof Object.assign != 'function') {
        // Must be writable: true, enumerable: false, configurable: true
        Object.defineProperty(Object, "assign", {
            value: function assign(target, varArgs) { // .length of function is 2
                'use strict';
                if (target == null) { // TypeError if undefined or null
                    throw new TypeError('Cannot convert undefined or null to object');
                }

                var to = Object(target);

                for (var index = 1; index < arguments.length; index++) {
                    var nextSource = arguments[index];

                    if (nextSource != null) { // Skip over if undefined or null
                        for (var nextKey in nextSource) {
                            // Avoid bugs when hasOwnProperty is shadowed
                            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                                to[nextKey] = nextSource[nextKey];
                            }
                        }
                    }
                }
                return to;
            },
            writable: true,
            configurable: true
        });
    }


    // bring in text builder
    var GOOGLE_SHEET = "https://script.google.com/macros/s/AKfycbwB58EOQcL-m44oc6-lXPTwnchIl1vC7HpylBNvwQgUQ2ODTy0/exec";
    var request = Script.require("request").request;
    var log = Script.require('https://hifi-content.s3.amazonaws.com/milad/ROLC/d/ROLC_High-Fidelity/02_Organize/O_Projects/Repos/hifi-content/developerTools/sharedLibraries/easyLog/easyLog.js')
    
    var materials = Script.require('./materials.json?' + Date.now());
    var colors = Script.require('./brandColors.js');
    var colorKeys = Object.keys(colors);

    var textHelper = new (Script.require('./textHelper.js'));

    var materialKeys = Object.keys(materials);

    function getRandom(min, max){
        return Math.floor(Math.random() * (max - min) + min)
    }

    var googleShetsWords = [];
    var transformedWords = {};

    var FLOOR_ORIGIN = [0,0,0];
    var CARD_HEIGHT = 1;
    var DISTANCE_FROM_GROUND = 1;
    var DISTANCE_BETWEEN_CARDS = 1;
    var MAXIMUM_PER_ROW = 5;
    var DISTANCE_BETWEEN_ROWS = 10;
    var DISTANCE_BETWEEN_COLUMNS = 10;
    var DOOR_WIDTH = 0.25;

    var TEST_POSITION = [0,0,0];
    var WALL_SIZE = 1;

    var FLOOR = 'FLOOR';
    var CEILING = 'CEILING';
    var WALL_LEFT = 'WALL_LEFT';
    var WALL_RIGHT = 'WALL_RIGHT';
    var WALL_CENTER = 'WALL_CENTER';
    var DOOR_LEFT = 'DOOR_LEFT';
    var DOOR_RIGHT = 'DOOR_RIGHT';

    var roomArray = [FLOOR, CEILING, WALL_CENTER, WALL_LEFT, WALL_RIGHT, DOOR_LEFT, DOOR_RIGHT];

    var X = 0;
    var Y = 1;
    var Z = 2; 

    var roomsToDelete = [];
    var lights = [];
    var lightProps = {
        "type": "Light",
        "dimensions": {
            "x": 10.49194880065918,
            "y": 10.49194880065918,
            "z": 10.043134880065918
        },
        "grab": {
            "grabbable": false,
            "equippableLeftRotation": {
                "x": -0.0000152587890625,
                "y": -0.0000152587890625,
                "z": -0.0000152587890625,
                "w": 1
            },
            "equippableRightRotation": {
                "x": -0.0000152587890625,
                "y": -0.0000152587890625,
                "z": -0.0000152587890625,
                "w": 1
            }
        },
        "damping": 0,
        "angularDamping": 0,
        "color": {
            "red": 97,
            "green": 15,
            "blue": 97
        },
        "intensity": 1.6,
        "exponent": 0,
        "cutoff": 0,
        "falloffRadius": 500.200000762939453,
    };
    

    // *************************************
    // START GET_WORDS
    // *************************************
    // #region GET_WORDS

    
    function transformWords(words){
        words.forEach(function(word){
            if (!transformedWords[word.category]){
                transformedWords[word.category] = [];
            }
            transformedWords[word.category].push(word);
        });
    }
    function getGoogleShetWord(){
        request({
            uri: GOOGLE_SHEET
        }, function (error, response) {
            if (error || !response) {
                log("error")
                return;
            }
            if (response.status && response.status === "success") {
                log("success");
                if (response.words) {
                    googleShetsWords = response.words;
                    log("googleSheetWords", googleShetsWords);
                    transformWords(googleShetsWords);
                    log("transformedWords", transformedWords);
                }
            }

            for (var key in transformedWords){
                testRooms
                    .addRoom(parentProps1, props1)
            }
        });

    }
    
    
    // #endregion
    // *************************************
    // END GET_WORDS
    // *************************************


    // *************************************
    // START ROOM
    // *************************************
    // #region ROOM
    
    
    function Room(){
        this.parentID = null;
        this.FLOOR = {};
        this.CEILING = {};
        this.WALL_LEFT = {};
        this.WALL_RIGHT = {};
        this.WALL_CENTER = {};
        this.DOOR_LEFT = {};
        this.DOOR_RIGHT = {};
        this.rotation = null;
        this.position = null;
        this.roomArray = roomArray;
    }


    function registerSide(type, props){
        var uniqueProps = JSON.parse(JSON.stringify(props));
        switch (type) {
            case FLOOR:
                var floorProps = uniqueProps;
                var FLOOR_OFFSET = [0, 0.1, 0];
                floorProps.localPosition = [0, -floorProps.localDimensions[Y], 0];
                floorProps.localPosition = Vec3.sum(floorProps.localPosition, FLOOR_OFFSET);
                floorProps.localDimensions[Y] = floorProps.localDimensions[X];
                floorProps.localRotation = Quat.fromPitchYawRollDegrees(90, 0, 0);
                floorProps.name = FLOOR;
                floorProps.color = [100, 100, 100];
                this.FLOOR.props = floorProps;
                break;
            case CEILING:
                var ceilingProps = uniqueProps;
                ceilingProps.localPosition = [0, ceilingProps.localDimensions[Y], 0];
                ceilingProps.localDimensions[Y] = ceilingProps.localDimensions[X];
                ceilingProps.localRotation = Quat.fromPitchYawRollDegrees(90, 0, 0);
                ceilingProps.name = CEILING;
                ceilingProps.color = [200, 100, 200];
                this.CEILING.props = ceilingProps;
                break;
            case WALL_LEFT:
                var wallLeftProps = uniqueProps;
                wallLeftProps.localPosition = [this.CEILING.props.localDimensions[X] * 0.5, 0, 0];
                wallLeftProps.localDimensions[Y] = this.CEILING.props.localPosition[Y] - this.FLOOR.props.localPosition[Y];
                wallLeftProps.localRotation = Quat.fromPitchYawRollDegrees(0, 90, 0);
                wallLeftProps.name = WALL_LEFT;
                wallLeftProps.color = [0, 200, 100];
                this.WALL_LEFT.props = wallLeftProps;
                break;
            case WALL_RIGHT:
                var wallRightProps = uniqueProps;
                wallRightProps.localPosition = [-this.CEILING.props.localDimensions[X] * 0.5, 0, 0];
                wallRightProps.localDimensions[Y] = this.CEILING.props.localPosition[Y] - this.FLOOR.props.localPosition[Y];
                wallRightProps.localRotation = Quat.fromPitchYawRollDegrees(0, 90, 0);
                wallRightProps.name = WALL_RIGHT;
                wallRightProps.color = [0, 100, 200];
                this.WALL_RIGHT.props = wallRightProps;
                break;
            case WALL_CENTER:
                var wallCenterProps = uniqueProps;       
                wallCenterProps.localPosition = [0, 0, -wallCenterProps.localDimensions[X] * 0.5];
                wallCenterProps.localDimensions[Y] = this.CEILING.props.localPosition[Y] - this.FLOOR.props.localPosition[Y];
                wallCenterProps.localRotation = Quat.fromPitchYawRollDegrees(0, 0, 0);
                wallCenterProps.name = WALL_CENTER;
                wallCenterProps.color = [100, 100, 200];
                this.WALL_CENTER.props = wallCenterProps;
                break;
            case DOOR_LEFT:
                var doorLeftProps = uniqueProps;       
                doorLeftProps.localDimensions[Y] = this.CEILING.props.localPosition[Y] - this.FLOOR.props.localPosition[Y];
                doorLeftProps.localDimensions[X] = (this.CEILING.props.localDimensions[Y] * (1.0 - DOOR_WIDTH)) * 0.5;
                doorLeftProps.localRotation = Quat.fromPitchYawRollDegrees(0, 0, 0);
                doorLeftProps.localPosition = [
                    (this.CEILING.props.localDimensions[Y] * DOOR_WIDTH) * 0.5 + (doorLeftProps.localDimensions[X] * 0.5), 
                    0,
                    this.CEILING.props.localDimensions[X] * 0.5
                ];
                doorLeftProps.name = DOOR_LEFT;
                doorLeftProps.color = [20, 100, 75];
                this.DOOR_LEFT.props = doorLeftProps;
                break;
            case DOOR_RIGHT:
                var doorRightProps = uniqueProps;       
                doorRightProps.localDimensions[Y] = this.CEILING.props.localPosition[Y] - this.FLOOR.props.localPosition[Y];
                doorRightProps.localDimensions[X] = (this.CEILING.props.localDimensions[Y] * (1.0 - DOOR_WIDTH)) * 0.5;
                doorRightProps.localRotation = Quat.fromPitchYawRollDegrees(0, 0, 0);
                doorRightProps.localPosition = [
                    -((this.CEILING.props.localDimensions[Y] * DOOR_WIDTH) * 0.5 + (doorRightProps.localDimensions[X] * 0.5)), 
                    0,
                    this.CEILING.props.localDimensions[X] * 0.5
                ];
                doorRightProps.name = DOOR_RIGHT;
                doorRightProps.color = [200, 100, 75];
                this.DOOR_RIGHT.props = doorRightProps;
                break;
        }
        return this;
    }


    function createParent(parentProps){
        this.parentID = Entities.addEntity(parentProps);
        
        return this;

    }


    function createWalls(){
        var _this = this;
        var wallMaterialEntityProps = {
            type: "Material",
            name: "floor material",
            materialURL: "materialData",
            materialMappingMode: "uv",
            priority: 1,
            materialMappingScale: [5, 5],
            materialData: {}
        };
        wallMaterialEntityProps.materialData = JSON.stringify(materials["glass"]);
        // wallMaterialEntityProps.materialData = JSON.stringify(materials[
        //     materialKeys[getRandom(0, materialKeys.length)]
        // ]);


        this.roomArray.forEach(function(room){
            var newProps = this[room].props;
            newProps.parentID = this.parentID;
            this[room].id = Entities.addEntity(newProps);

            this[room].materials = {};
            this[room].materials.props = wallMaterialEntityProps;
            this[room].materials.props.parentID = this[room].id;
            this[room].materials.id = Entities.addEntity(this[room].materials.props);
        }, _this);

        this.roomDimensions = [
            Math.abs(this.WALL_LEFT.props.localPosition[X] - this.WALL_RIGHT.props.localPosition[X]),
            Math.abs(this.CEILING.props.localPosition[Y] - this.FLOOR.props.localPosition[Y]),
            Math.abs(this.WALL_CENTER.props.localPosition[Z] - this.DOOR_RIGHT.props.localPosition[Z])
        ];
        // log("room dimensions", this.roomDimensions)
        return this;
    }


    function registerSides(props){
        var _this = this;
        this.roomArray.forEach(function (room) {
            this.registerSide(room, props);
            // log("register props", props)
        }, _this);
        return this;
    }


    function deleteRoom(){
        Entities.deleteEntity(this.parentID);
    }


    Room.prototype = {
        registerSide: registerSide,
        // registerParent: registerParent,
        createParent: createParent,
        createWalls: createWalls,
        registerSides: registerSides,
        deleteRoom: deleteRoom
    };
    
    var props1 = {
        localDimensions: [9.5, 2.0, 0.01],
        type: "Box"
    };

    var props2 = {
        localDimensions: [5.5, 2.0, 0.01],
        type: "Box"
    };

    var props3 = {
        localDimensions: [10.5, 2.5, 0.01],
        type: "Box"
    };

    var props4 = {
        localDimensions: [10.5, 1.5, 0.01],
        type: "Box"
    };

    var parentProps1 = {
        type: "Box",
        dimensions: [0.1, 0.1, 0.1],
        position: [0, props1.localDimensions[Y], 0],
        name: "BOX NAME",
        visible: false
    };

    var parentProps2 = {
        type: "Box",
        dimensions: [0.1, 0.1, 0.1],
        position: [0, props2.localDimensions[Y], 0],
        name: "BOX NAME",
        visible: false
    };

    var parentProps3 = {
        type: "Box",
        dimensions: [0.1, 0.1, 0.1],
        position: [0, props3.localDimensions[Y], 0],
        name: "BOX NAME",
        visible: false
    };

    var parentProps4 = {
        type: "Box",
        dimensions: [0.1, 0.1, 0.1],
        position: [0, props4.localDimensions[Y], 0],
        name: "BOX NAME",
        visible: false
    };
    
    function Rooms(){
        this.rooms = [];
        this.numberOfRooms = 0;
        this.currentRoom = 0;
        this.lastPosition = null;
        this.originPosition = null;

        this.floorMin = [0, 0, 0];
        this.floorMax = [0, 0, 0];
        this.floorDimensions = [0, 0.25, 0];
        this.floor = {};
    }
    

    function setNumberOfRooms(rooms){
        this.numberOfRooms = rooms;

        return this;
    }


    function addRoom(parentProps, roomProps){
        if (this.lastPosition){
            this.lastPosition[X] = 
                this.lastPosition[X] + 
                this.rooms[this.rooms.length - 1].roomDimensions[X] * 0.5 + 
                DISTANCE_BETWEEN_ROWS + roomProps.localDimensions[X] * 0.5;
            
            this.lastPosition[Y] =
                roomProps.localDimensions[Y];

        } else {
            this.originPosition = JSON.parse(JSON.stringify(parentProps.position));
            this.lastPosition = JSON.parse(JSON.stringify(parentProps.position));
            // log("this.originPosition", this.originPosition)
        }
        var count = this.rooms.length || 0;
        
        // go to the next row after the set amount is reached
        if (count !== 0 && count % MAXIMUM_PER_ROW === 0) {
            this.lastPosition[Z] = 
                -(Math.abs(this.lastPosition[Z]) + 
                DISTANCE_BETWEEN_COLUMNS + 
                this.rooms[this.rooms.length - 1].roomDimensions[Z] * 0.5);
            this.lastPosition[X] = this.originPosition[X];
        }
        // log("this.lastPosition", this.lastPosition)
        parentProps.position = this.lastPosition;
        // log("parentprops.position", parentProps.position)
        

        var newRoom = new Room();
        newRoom
            .registerSides(roomProps)
            .createParent(parentProps)
            .createWalls();

        var light = Object.assign({}, lightProps);
        light.color = colors[
            colorKeys[getRandom(0, colorKeys.length)]
        ];
        light.position = Vec3.sum(
            [ -((newRoom.roomDimensions[X] * 0.5) + (DISTANCE_BETWEEN_ROWS * 0.5)),
            1, 0], 
            parentProps.position)
        lights.push(Entities.addEntity(light))

        this.rooms.push(newRoom);

        var roomCheck = this.rooms[this.rooms.length - 1];

        var minX = this.lastPosition[X] - (roomCheck.roomDimensions[X] * 0.5);
        this.floorMin[X] = Math.min(minX, this.floorMin[X]);
        var maxX = this.lastPosition[X] + (roomCheck.roomDimensions[X] * 0.5);
        this.floorMax[X] = Math.max(maxX, this.floorMax[X]);

        var minZ = this.lastPosition[Z] - (roomCheck.roomDimensions[Z] * 0.5);
        // log("minZ", minZ)
        this.floorMin[Z] = Math.min(minZ, this.floorMin[Z]);
        var maxZ = this.lastPosition[Z] + (roomCheck.roomDimensions[Z] * 0.5);
        // log("maxZ", maxZ)
        this.floorMax[Z] = Math.max(maxZ, this.floorMax[Z]);

        // this.lastPosition = this.lastPosition;

        // log("this.floorMin", this.floorMin);
        // log("this.floorMax", this.floorMax);
        this.floorDimensions = Vec3.subtract(this.floorMax, this.floorMin);
        this.floorDimensions[Y] = 0.25;
        this.floorPosition = Vec3.sum(this.floorMin, Vec3.multiply(this.floorDimensions, 0.5));

        var props = {
            type: "Box",
            name: "ALL-FLOOR",
            dimensions: this.floorDimensions,
            position: this.floorPosition,
            color: [20, 40, 150]
        };
        
        
        var floorMaterialEntityProps = {
            type: "Material",
            name: "floor material",
            materialURL: "materialData",
            materialMappingMode: "uv",
            priority: 1,
            materialMappingScale: [6, 6],
            materialData: {}
        };


        if (!this.floor.id) {
            this.floor.id = Entities.addEntity(props);
            this.floor.materials = {};
            floorMaterialEntityProps.materialData = JSON.stringify(materials[
                materialKeys[getRandom(0, materialKeys.length)]
            ]);
            this.floor.materials.props = floorMaterialEntityProps;
            log("this.floor.material.props", this.floor.materials.props)
            this.floor.materials.props.parentID = this.floor.id;
            this.floor.materials.id = Entities.addEntity(this.floor.materials.props);
        } else {
            Entities.editEntity(this.floor.id, props);
        }
        return this;
    }


    function deleteRooms(){
        this.rooms.forEach(function(room){
            // log("room", room)
            room.deleteRoom();
        });
        Entities.deleteEntity(this.floor.id);
    }

    Rooms.prototype = {
        setNumberOfRooms: setNumberOfRooms,
        addRoom: addRoom,
        deleteRooms: deleteRooms
    };


    // #endregion
    // *************************************
    // END ROOM
    // *************************************

    // *************************************
    // START CARD_MAKER
    // *************************************
    // #region CARD_MAKER


    function CardMaker(text, type, lineHeight){
        // this.text = text;
        // this.type = type;
        // this.lineHeight = lineHeight;
        // textHelper
        //     .setText("text")
        //     .setLineHeight(lineHeight)

        // this.dimensions = [
        //     textHelper.getTotalTextLength(),
        //     lineHeight,
        //     0.1
        // ];

        this.backgroundColor = [0, 0, 0];
        this.textColor = [255, 255, 255];
        this.id = null;
        this.position = null;
        this.rotation = null;
    }

    function setText(text){
        this.text = text;

        return this;
    }
    
    function setType(type){
        this.type = type;

        return this;
    }

    function setLineHeight(lineHeight){
        this.lineHeight = lineHeight;

        textHelper
            .setText(this.text)
            .setLineHeight(this.lineHeight);

        this.dimensions = [
            textHelper.getTotalTextLength(),
            this.lineHeight,
            0.1
        ];

        log("this.dimensions", this.dimensions);

        return this;
    }
    
    function setPosition(position){
        this.position = position

        return this;
    }

    function setRotation(rotation){
        this.rotation = rotation;
        
        return this;
    }
    
    function makeCard(){
        var props = {
            type: "Text",
            name: "TEXT CARD",
            lineHeight: this.lineHeight,
            text: this.text,
            backgroundColor: this.backgroundColor,
            textColor: this.textColor,
            position: this.position,
            rotation: this.rotation,
            dimensions: this.dimensions
        };

        this.id = Entities.addEntity(props);

        return this;
    }

    function deleteCard(){
        Entities.deleteEntity(this.id);

        return this;
    }

    CardMaker.prototype = {
        setText: setText,
        setType: setType,
        setLineHeight: setLineHeight,
        setPosition: setPosition,
        setRotation: setRotation,
        makeCard: makeCard,
        deleteCard: deleteCard
    }

    // #endregion
    // *************************************
    // END CARD_MAKER
    // *************************************

    var testRooms = new Rooms();
    var testCard = new CardMaker();
    function startUp(){
        getGoogleShetWord();


        // testRooms
        //     .addRoom(parentProps1, props1)
        //     .addRoom(parentProps2, props2)
        //     .addRoom(parentProps3, props3)
        //     .addRoom(parentProps4, props4)
        //     .addRoom(parentProps1, props1)
        //     .addRoom(parentProps2, props2)
        //     .addRoom(parentProps3, props3)
        //     .addRoom(parentProps4, props4)
        //     .addRoom(parentProps1, props1)
        //     .addRoom(parentProps2, props2)
        //     .addRoom(parentProps3, props3)
        //     .addRoom(parentProps4, props4)
        //     .addRoom(parentProps1, props1)
        //     .addRoom(parentProps2, props2)
        //     .addRoom(parentProps3, props3)
        //     .addRoom(parentProps4, props4)
        //     .addRoom(parentProps1, props1)
            // .addRoom(parentProps2, props2)
            // .addRoom(parentProps3, props3)
            // .addRoom(parentProps, props)
            // .addRoom(parentProps, props)
            // .addRoom(parentProps, props);
        
        testCard
            .setText("testing card maker")
            .setType("CATEGORY")
            .setLineHeight(0.5)
            .setPosition([0,5,0])
            .setRotation([0,0,0])
            .makeCard();
    }

    startUp();

    function onScriptEnding(){
        testRooms.deleteRooms();
        lights.forEach(function(light){
            Entities.deleteEntity(light);
        });

        testCard.deleteCard();
    }
    Script.scriptEnding.connect(onScriptEnding);

})();


// var testRoom = new Room();
// testRoom
// .registerPosition(TEST_POSITION)
// .registerSides(props)
// .createParent()
// .createWalls();
// roomsToDelete.push(testRoom);