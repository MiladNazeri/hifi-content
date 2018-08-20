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
var BASE_NAME = "Neuroscape_",
    baseURL = "https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/Neuroscape/",
    DEBUG = false,
    DISTANCE_IN_FRONT = 1,
    LEFT = "Left",
    RIGHT = "Right",
    drumPadModelURL = "http://hifi-content.s3-us-west-1.amazonaws.com/rebecca/DrumKit/Models/Drum_Stick.obj";

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
            color
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
            color
        );
        overlayID2 = createBoxOverlay(
            name2,
            boundaryPosition2,
            avatarOrientation,
            vec(BOUNDARY_WIDTH, BOUNDARY_HEIGHT, BOUNDARY_DEPTH),
            color
        );

        allOverlays[name] = overlayID;
        allOverlays[name2] = overlayID2;
    });
}

function createBoxOverlay(name, position, rotation, dimensions, color) {
    var properties = {
        name: name,
        position: position,
        rotation: rotation,
        dimensions: dimensions,
        color: color,
        visible: true
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
        MODEL_WIDTH = 0.0131,
        MODEL_HEIGHT = 0.4544,
        MODEL_DEPTH = 0.0131,
        GRABBABLE = true;

    // Init
    var name,
        overlayID,
        stickPosition,
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
            localOffset = vec(DISTANCE_RIGHT, 0, 0);
            worldOffset = Vec3.multiplyQbyV(avatarOrientation, localOffset);
            stickPosition = Vec3.sum(
                worldOffset,
                avatarPosition
            );
        } else {
            localOffset = vec(-DISTANCE_RIGHT, 0, 0);
            worldOffset = Vec3.multiplyQbyV(avatarOrientation, localOffset);
            stickPosition = Vec3.sum(
                worldOffset,
                avatarPosition
            );
        }

        name = BASE_NAME + "Drum_Stick_" + side;
        rotation = Quat.fromPitchYawRollDegrees(0, 0, 0);
        overlayID = createSphereOverlay(
            name,
            stickPosition,
            rotation,
            vec(MODEL_WIDTH, MODEL_HEIGHT, MODEL_DEPTH),
            makeColor(255, 255, 255),
            GRABBABLE
        );
        allOverlays[name] = overlayID;
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

function createSphereOverlay(name, position, rotation, dimensions, color, grabbable) {
    var properties = {
        name: name,
        position: position,
        rotation: rotation,
        dimensions: dimensions,
        color: color,
        visible: true,
        grabbable: true
    };
    var id = Overlays.addOverlay("sphere", properties);
    return id;
}

function createDrumPads() {
    // Const
    var DISTANCE_RIGHT = 0.20,
        DISTANCE_FORWARD = 0.30,
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

// Main
createBoundaryBoxes();
createBoundaryDecoratorBoxes();
createOrb();
createDrumSticks();
createDrumPads();

// Cleanup
function scriptEnding() {
    Object.keys(allOverlays).forEach(function (overlay) {
        Overlays.deleteOverlay(allOverlays[overlay]);
    });
}

Script.scriptEnding.connect(scriptEnding);

module.exports = {
    allOverlays: allOverlays
};