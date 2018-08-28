// NeuroSpanwer.js
//
// Created by Milad Nazeri and Liv Erikson on 2018-07-16
//
// Copyright 2018 High Fidelity, Inc.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html


// Dependencies 
Script.require("../../../Utilities/Polyfills.js")();

var Helper = Script.require("../../../Utilities/Helper.js?" + Date.now()),
    inFrontOf = Helper.Avatar.inFrontOf,
    makeColor = Helper.Color.makeColor,
    vec = Helper.Maths.vec;

// Log Setup
var LOG_CONFIG = {},
    LOG_ENTER = Helper.Debug.LOG_ENTER,
    LOG_UPDATE = Helper.Debug.LOG_UPDATE,
    LOG_ERROR = Helper.Debug.LOG_ERROR,
    LOG_VALUE = Helper.Debug.LOG_VALUE,
    LOG_ARCHIVE = Helper.Debug.LOG_ARCHIVE;

LOG_CONFIG[LOG_ENTER] = false;
LOG_CONFIG[LOG_UPDATE] = false;
LOG_CONFIG[LOG_ERROR] = false;
LOG_CONFIG[LOG_VALUE] = false;
LOG_CONFIG[LOG_ARCHIVE] = false;
var log = Helper.Debug.log(LOG_CONFIG);

// Consts
var baseURL = "https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/Prototyping/Neuroscape/Neuroscape_Main.js",
    DEBUG = false,
    DISTANCE_IN_FRONT = 2.0,
    LEFT = "Left",
    RIGHT = "Right",
    drumPadModelURL = "http://hifi-content.s3-us-west-1.amazonaws.com/rebecca/DrumKit/Models/Drum_Stick.obj",
    BASE_NAME = "Neuroscape_",
    ORB = BASE_NAME + "Orb",
    STICK_LEFT = BASE_NAME + "Drum_Stick_Left",
    STICK_LEFT_HEAD = BASE_NAME + "Drum_Stick_Left_Head",
    STICK_RIGHT = BASE_NAME + "Drum_Stick_Right",
    STICK_RIGHT_HEAD = BASE_NAME + "Drum_Stick_Right_Head",
    PAD_LEFT = BASE_NAME + "Drum_Pad_Right",
    PAD_RIGHT = BASE_NAME + "Drum_Pad_Right",
    BOUNDARY_LEFT = BASE_NAME + "Boundary_Left",
    BOUNDARY_LEFT_TOP = BASE_NAME + "Boundary_Left_Top",
    BOUNDARY_LEFT_BOTTOM = BASE_NAME + "Boundary_Left_Bottom",
    BOUNDARY_RIGHT = BASE_NAME + "Boundary_Right",
    BOUNDARY_RIGHT_TOP = BASE_NAME + "Boundary_Right_Top",
    BOUNDARY_RIGHT_BOTTOM = BASE_NAME + "Boundary_Right_Bottom",
    DATA_WINDOW = BASE_NAME + "Data_Window",
    GAME_TYPE_WINDOW = BASE_NAME + "Game_Type_Window";

// Init

// Collections
var allOverlays = {},
    centerPlacement = inFrontOf(DISTANCE_IN_FRONT),
    avatarPosition = MyAvatar.position,
    avatarOrientation = MyAvatar.orientation,
    RED = makeColor(255, 0, 0),
    GREEN = makeColor(0, 255, 0),
    BLUE = makeColor(0, 0, 255);

// Procedural Functions
function createBoundaryBoxes() {
    // Consts
    var BOUNDARY_WIDTH = 0.025,
        BOUNDARY_HEIGHT = 1,
        BOUNDARY_DEPTH = 0.4,
        DISTANCE_RIGHT = 0.65;

    // Init
    var name,
        overlayID,
        boundaryPosition,
        color,
        localOffset = {},
        worldOffset = {};

    // Main
    [LEFT, RIGHT].forEach(function (side) {
        if (side === RIGHT) {
            localOffset = vec(DISTANCE_RIGHT, 0, 0);
            worldOffset = Vec3.multiplyQbyV(avatarOrientation, localOffset);
            boundaryPosition = Vec3.sum(
                worldOffset,
                centerPlacement
            );
        } else {
            localOffset = vec(-DISTANCE_RIGHT, 0, 0);
            worldOffset = Vec3.multiplyQbyV(avatarOrientation, localOffset);
            boundaryPosition = Vec3.sum(
                worldOffset,
                centerPlacement
            );
        }
        name = BASE_NAME + "Boundary_" + side;
        color = BLUE;
        overlayID = createBoxOverlay(
            name,
            boundaryPosition,
            avatarOrientation,
            vec(BOUNDARY_WIDTH, BOUNDARY_HEIGHT, BOUNDARY_DEPTH),
            color,
            true
        );
        allOverlays[name] = overlayID;
    });
}

function createBoundaryDecoratorBoxes() {
    // Consts
    var ORB_DIAMATER = 0.3,
        BOUNDARY_WIDTH = 0.025,
        BOUNDARY_HEIGHT = (1 - ORB_DIAMATER) / 2,
        BOUNDARY_DEPTH = 0.4,
        DISTANCE_RIGHT = 0.65;

    // Init
    var name,
        name2,
        overlayID,
        overlayID2,
        boundaryPosition,
        boundaryPosition2,
        color,
        localOffset = {},
        worldOffset = {},
        adjustedCenterPlacement = {},
        adjustedRight = {};

    // Main
    [LEFT, RIGHT].forEach(function (side) {
        if (side === RIGHT) {
            adjustedRight = DISTANCE_RIGHT - (BOUNDARY_WIDTH / 2) - (ORB_DIAMATER / 2);
            localOffset = vec(adjustedRight, 0, 0);
            worldOffset = Vec3.multiplyQbyV(avatarOrientation, localOffset);

            adjustedCenterPlacement = Object.assign({}, centerPlacement);
            adjustedCenterPlacement.y =
                adjustedCenterPlacement.y - (ORB_DIAMATER / 2) - (BOUNDARY_HEIGHT / 2);
            boundaryPosition = Vec3.sum(
                worldOffset,
                adjustedCenterPlacement
            );

            adjustedCenterPlacement = Object.assign({}, centerPlacement);
            adjustedCenterPlacement.y =
                adjustedCenterPlacement.y + (ORB_DIAMATER / 2) + (BOUNDARY_HEIGHT / 2);
            boundaryPosition2 = Vec3.sum(
                worldOffset,
                adjustedCenterPlacement
            );
        } else {
            adjustedRight = -DISTANCE_RIGHT + (BOUNDARY_WIDTH / 2) + (ORB_DIAMATER / 2);
            localOffset = vec(adjustedRight, 0, 0);
            worldOffset = Vec3.multiplyQbyV(avatarOrientation, localOffset);

            adjustedCenterPlacement = Object.assign({}, centerPlacement);
            adjustedCenterPlacement.y =
                adjustedCenterPlacement.y - (ORB_DIAMATER / 2) - (BOUNDARY_HEIGHT / 2);
            boundaryPosition = Vec3.sum(
                worldOffset,
                adjustedCenterPlacement
            );

            adjustedCenterPlacement = Object.assign({}, centerPlacement);
            adjustedCenterPlacement.y =
                adjustedCenterPlacement.y + (ORB_DIAMATER / 2) + (BOUNDARY_HEIGHT / 2);
            boundaryPosition2 = Vec3.sum(
                worldOffset,
                adjustedCenterPlacement
            );
        }

        name = BASE_NAME + "Boundary_" + side + "_Top";
        name2 = BASE_NAME + "Boundary_" + side + "_Bottom";
        color = BLUE;

        overlayID = createBoxOverlay(
            name,
            boundaryPosition,
            avatarOrientation,
            vec(BOUNDARY_WIDTH, BOUNDARY_HEIGHT, BOUNDARY_DEPTH),
            color,
            false
        );
        overlayID2 = createBoxOverlay(
            name2,
            boundaryPosition2,
            avatarOrientation,
            vec(BOUNDARY_WIDTH, BOUNDARY_HEIGHT, BOUNDARY_DEPTH),
            color,
            false
        );

        allOverlays[name] = overlayID;
        allOverlays[name2] = overlayID2;
    });
}

function createBoxOverlay(name, position, rotation, dimensions, color, isSolid) {
    var properties = {
        name: name,
        position: position,
        rotation: rotation,
        dimensions: dimensions,
        color: color,
        visible: true,
        isSolid: isSolid
    };
    var id = Overlays.addOverlay("cube", properties);
    return id;
}

function createOrb() {
    // Consts
    var ORB_WIDTH = 0.3,
        ORB_HEIGHT = 0.3,
        ORB_DEPTH = 0.3,
        DISTANCE_LEFT = 0,
        DISTANCE_HEIGHT = 0,
        DISTANCE_BACK = 0;

    // Init
    var name,
        overlayID,
        orbPosition,
        color;

    // Main

    orbPosition = Vec3.sum(
        centerPlacement,
        vec(DISTANCE_LEFT, DISTANCE_HEIGHT, DISTANCE_BACK)
    );
    name = BASE_NAME + "Orb";
    color = RED;
    overlayID = createSphereOverlay(
        name,
        orbPosition,
        avatarOrientation,
        vec(ORB_WIDTH, ORB_HEIGHT, ORB_DEPTH),
        color
    );
    allOverlays[name] = overlayID;
}

function createDrumSticks() {
    // Consts
    var DISTANCE_RIGHT = 0.52,
        DISTANCE_FORWARD = -0.85,
        MODEL_WIDTH = 0.0131,
        MODEL_HEIGHT = 0.4544,
        MODEL_DEPTH = 0.0131,
        SPHERE_WIDTH = MODEL_WIDTH * 2.0,
        GRABBABLE = true;

    // Init
    var name,
        nameHead,
        overlayID,
        overlayIDHead,
        stickPosition,
        headPosition,
        rotation,
        localOffset = {},
        worldOffset = {},
        leftHandPosition = {
            "x": -MODEL_HEIGHT / 2,
            "y": 0.06,
            "z": 0.03
        },
        leftHandRotation = Quat.fromPitchYawRollDegrees(90, 90, 0),
        rightHandPosition = Vec3.multiplyVbyV(leftHandPosition, { x: -1, y: 1, z: 1 }),
        rightHandRotation = Quat.fromPitchYawRollDegrees(90, 90, 0);
    // Main
    [LEFT, RIGHT].forEach(function (side) {
        if (side === RIGHT) {
            localOffset = vec(DISTANCE_RIGHT, 0, DISTANCE_FORWARD);
            worldOffset = Vec3.multiplyQbyV(avatarOrientation, localOffset);
            stickPosition = Vec3.sum(
                worldOffset,
                avatarPosition
            );
            headPosition = Vec3.sum(
                stickPosition,
                vec(0, -MODEL_HEIGHT / 2, 0)
            )
        } else {
            localOffset = vec(-DISTANCE_RIGHT, 0, DISTANCE_FORWARD);
            worldOffset = Vec3.multiplyQbyV(avatarOrientation, localOffset);
            stickPosition = Vec3.sum(
                worldOffset,
                avatarPosition
            );
            headPosition = Vec3.sum(
                stickPosition,
                vec(0, -MODEL_HEIGHT / 2, 0)
            );
        }

        name = BASE_NAME + "Drum_Stick_" + side;
        nameHead = BASE_NAME + "Drum_Stick_Head" + side;
        rotation = Quat.fromPitchYawRollDegrees(0, 0, 0);
        overlayID = createSphereOverlay(
            name,
            stickPosition,
            rotation,
            vec(MODEL_WIDTH, MODEL_HEIGHT, MODEL_DEPTH),
            makeColor(255, 255, 255),
            GRABBABLE
        );
        overlayIDHead = createSphereOverlay(
            name,
            headPosition,
            rotation,
            vec(SPHERE_WIDTH, SPHERE_WIDTH, SPHERE_WIDTH),
            makeColor(255, 255, 255),
            GRABBABLE,
            overlayID
        );
        allOverlays[name] = overlayID;
        allOverlays[nameHead] = overlayIDHead;
    });
    /* Scratch
        userData.equipHotspots = [{
            position: { x: 0, y: +MODEL_HEIGHT / 2, z: 0 },
            radius: 0.25,
            joints: {
                RightHand: [
                    rightHandPosition,
                    rightHandRotation
                ],
                LeftHand: [
                    leftHandPosition,
                    leftHandRotation
                ]
            }
        }];
    */
}

function createSphereOverlay(name, position, rotation, dimensions, color, grabbable, parentID) {
    var properties = {
        name: name,
        position: position,
        rotation: rotation,
        dimensions: dimensions,
        color: color,
        visible: true,
        grabbable: true,
        alpha: 1.0,
        parentID: parentID
    };
    var id = Overlays.addOverlay("sphere", properties);
    return id;
}

function createDrumPads() {
    // Const
    var DISTANCE_RIGHT = 0.20,
        DISTANCE_FORWARD = -0.85,
        MODEL_WIDTH = 0.3,
        MODEL_HEIGHT = 0.2,
        MODEL_DEPTH = 0.3;

    // Init
    var name,
        overlayID,
        modelPosition,
        localOffset = {},
        worldOffset = {};

    // Main
    [LEFT, RIGHT].forEach(function (side) {
        if (side === RIGHT) {
            localOffset = vec(DISTANCE_RIGHT, 0, DISTANCE_FORWARD);
            worldOffset = Vec3.multiplyQbyV(avatarOrientation, localOffset);
            modelPosition = Vec3.sum(
                avatarPosition,
                worldOffset
            );
        } else {
            localOffset = vec(-DISTANCE_RIGHT, 0, DISTANCE_FORWARD);
            worldOffset = Vec3.multiplyQbyV(avatarOrientation, localOffset);
            modelPosition = Vec3.sum(
                avatarPosition,
                worldOffset
            );
        }

        name = BASE_NAME + "Drum_Pad_" + side;
        overlayID = createDrumPadOverlay(
            name,
            modelPosition,
            vec(MODEL_WIDTH, MODEL_HEIGHT, MODEL_DEPTH),
            avatarOrientation,
            drumPadModelURL
        );
        allOverlays[name] = overlayID;
    });
}

function createDrumPadOverlay(name, position, dimensions, rotation, url) {
    var properties = {
        name: name,
        url: url,
        position: position,
        rotation: rotation,
        dimensions: dimensions
    };
    var id = Overlays.addOverlay("model", properties);
    return id;
}

function createDataWindow(){
    // Consts
    var WINDOW_WIDTH = 1.5,
        WINDOW_HEIGHT = 1,
        WINDOW_DEPTH = 0.3,
        DISTANCE_LEFT = 0,
        DISTANCE_HEIGHT = 0.15,
        DISTANCE_BACK = -1.0,
        OVERLAY_LINE_HEIGHT = 0.075,
        OVERLAY_BACKGROUND_ALPHA = 0.85,
        DEFAULT_TEXT = "LOADING!";

    // Init
    var name,
        overlayID,
        windowPosition,
        localOffset = {},
        worldOffset = {};

    // Main
    localOffset = {x: DISTANCE_LEFT, y: DISTANCE_HEIGHT, z: DISTANCE_BACK};
    worldOffset = Vec3.multiplyQbyV(avatarOrientation, localOffset);
    windowPosition = Vec3.sum(
        centerPlacement,
        worldOffset
    );
    name = DATA_WINDOW;
    overlayID = createText3dOverlay(
        name,
        windowPosition,
        avatarOrientation,
        vec(WINDOW_WIDTH, WINDOW_HEIGHT, WINDOW_DEPTH),
        OVERLAY_LINE_HEIGHT,
        OVERLAY_BACKGROUND_ALPHA,
        DEFAULT_TEXT
    );
    allOverlays[name] = overlayID;
}

function createGameTypeWindow(){
    // Consts
    var WINDOW_WIDTH = 2.0,
        WINDOW_HEIGHT = 0.3,
        WINDOW_DEPTH = 0.3,
        DISTANCE_LEFT = 0,
        DISTANCE_HEIGHT = 1,
        DISTANCE_BACK = -1.0,
        OVERLAY_LINE_HEIGHT = 0.1,
        OVERLAY_BACKGROUND_ALPHA = 0.85,
        DEFAULT_TEXT = "NEUROSCAPE RHYTHM DIAGNOSTIC";

    // Init
    var name,
        overlayID,
        windowPosition,
        localOffset = {},
        worldOffset = {};

    // Main
    localOffset = {x: DISTANCE_LEFT, y: DISTANCE_HEIGHT, z: DISTANCE_BACK};
    worldOffset = Vec3.multiplyQbyV(avatarOrientation, localOffset);
    windowPosition = Vec3.sum(
        centerPlacement,
        worldOffset
    );
    name = GAME_TYPE_WINDOW;
    overlayID = createText3dOverlay(
        name,
        windowPosition,
        avatarOrientation,
        vec(WINDOW_WIDTH, WINDOW_HEIGHT, WINDOW_DEPTH),
        OVERLAY_LINE_HEIGHT,
        OVERLAY_BACKGROUND_ALPHA,
        DEFAULT_TEXT
    );
    allOverlays[name] = overlayID;
}

function createText3dOverlay(name, position, rotation, dimensions, lineHeight, backgroundAlpha, defaultText){
    var properties = {
        name: name,
        position: position,
        rotation: rotation,
        dimensions: dimensions,
        isFacingAvatar: false,
        lineHeight: lineHeight,
        backgroundAlpha: backgroundAlpha,
        text: defaultText
    };
    var id = Overlays.addOverlay("text3d", properties);
    return id;
}

// Main
createBoundaryBoxes();
createBoundaryDecoratorBoxes();
createOrb();
createDrumSticks();
createDrumPads();
createDataWindow();
createGameTypeWindow();

// Cleanup
function scriptEnding() {
    Object.keys(allOverlays).forEach(function (overlay) {
        Overlays.deleteOverlay(allOverlays[overlay]);
    });
}

Script.scriptEnding.connect(scriptEnding);

module.exports = allOverlays;