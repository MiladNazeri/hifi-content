// Dependencies
// ////////////////////////////////////////////////////////////////////////////
Script.require("../../../Utilities/Polyfills.js")();

var Helper = Script.require("../../../Utilities/Helper.js?" + Date.now()),
    clamp = Helper.Maths.clamp,
    getProps = Helper.Entity.getProps,
    lerp = Helper.Maths.lerp,
    vec = Helper.Maths.vec;

// Log Setup
// ////////////////////////////////////////////////////////////////////////////
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
// ////////////////////////////////////////////////////////////////////////////
var BASE_NAME = "Neuroscape_",
    ORB = BASE_NAME + "Orb",
    STICK_LEFT = BASE_NAME + "Drum_Stick_Left",
    STICK_RIGHT = BASE_NAME + "Drum_Stick_Right",
    PAD = BASE_NAME + "Drum_Pad",
    BOUNDARY_LEFT = BASE_NAME + "Boundary_Left",
    BOUNDARY_LEFT_TOP = BASE_NAME + "Boundary_Left_Top",
    BOUNDARY_LEFT_BOTTOM = BASE_NAME + "Boundary_Left_Bottom",
    BOUNDARY_RIGHT = BASE_NAME + "Boundary_Right",
    BOUNDARY_RIGHT_TOP = BASE_NAME + "Boundary_Right_Top",
    BOUNDARY_RIGHT_BOTTOM = BASE_NAME + "Boundary_Right_Bottom",
    DATA_WINDOW = BASE_NAME + "Data_Window",
    GAME_TYPE_WINDOW = BASE_NAME + "Game_Type_Window",
    LATENCY_WINDOW = BASE_NAME + "Latency_Window",
    MOUSE_PRESS = "Mouse_Press",
    DIRECTION_ONE = "directionOne",
    DIRECTION_TWO = "directionTwo",
    STARTING_MESSAGE = "Hit the drum pad to start",
    ENTER_NAME = "Please enter name\nin the Neuroscape tablet app",
    CONTINUE_MESSAGE = "Hit the drum pad to continue\n",
    DONE_MESSAGE = "Thanks for playing",
    GET_READY_MESSAGE = "GET READY IN: ",
    PLAY_MESSAGE = "Play the beat back\n",
    LISTEN_MESSAGE = "Observe the beat\n",
    GAME_TYPE_MESSAGE = "Current Game Type: \n",
    LATENCY_MESSAGE = "Last Latency: \n",
    ORB_ID = "orb",
    PLAYER_ID = "player",
    ON = "on",
    OFF = "off",
    LEFT = "LEFT",
    RIGHT = "RIGHT",
    CONTINUOUS = "continuous",
    AUDIO = "audio",
    VISUAL = "visual",
    AUDIOVISUAL = "audiovisual",
    LISTEN = "listen",
    PLAY = "play",
    NULL = "NULL",
    DEFAULT_AV = AUDIOVISUAL,
    DEFAULT_GAME_TYPE = ON,
    MESSAGE_CHANNEL = "messages.neuroscape",
    UPDATE_MESSAGE = "updateMessage",
    UPDATE_PLAYER_NAME = "update_player_name",
    RESTART_GAME = "restart_game",
    SAVE_JSON = "saveJSON",
    BELL_SOUND_URL = "https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/Neuroscape/bell.wav?3",
    STICK_SOUND_URL = "https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/Neuroscape/drumstick.wav",
    SLOW = 750,
    MEDIUM = 525,
    FAST = 350,
    PI = Math.PI,
    UNIT_SCALAR = 1.0,
    COLOR_STEPS = 20,
    COLOR_CHANGE_INTERVAL = 40,
    LINEHEIGHT = 2,
    LINE_WIDTH = 2,
    OVERLAY_DELETE_TIME = 200,
    HAPTIC_STRENGTH = 1.0,
    HAPTIC_DURATION = 100,
    LEFT_HAND = 0,
    RIGHT_HAND = 1,
    HIT_TIME = 100,
    DRUM_HIT_TIMEOUT = 150,
    VISIBILE = true;

// Init
// ////////////////////////////////////////////////////////////////////////////
var DEBUG = false,
    isAllowedToUnPause = false,
    isGameRunning = false,
    isGamePaused = false,
    isListenMode = false,
    isNameEntered = false,
    canPlayAV = true,
    canHitDrum = true,
    nextLevel = null,
    currentPlayerName = null,
    continuousBeatCounter = 0,
    currentBeat = 0,
    currentMSSpeed = 0,
    currentDuration = 30000,
    currentAV = null,
    currentGameType = null,
    currentLevel = 1,
    currentLatency = 0,
    currentLevelStartTime = 0,
    currentRoundLatency = [],
    tempAV = null,
    tempGameType = null,
    prevLatency = 0,
    finalLatency = 0,
    previousTotalDelta = 0,
    totalDelta = 0, // The total running gameclock every time Script.update is called
    sphereRadius = null,
    COUNT_IN = 4,
    distance = 0,
    milisecondsPerBeat = 0,
    milisecondsPerMeter = 0,
    metersPerSecond = 0,
    previousTargetTime = 0,
    targetTime = 0,
    ALLOW_HIT_TO_UNPAUSE_TIME = 1000,
    soundBell = SoundCache.getSound(BELL_SOUND_URL),
    soundStick = SoundCache.getSound(STICK_SOUND_URL),
    radius = 1,
    drumPadRadius = 0,
    // We get the current normalized position for the cos on a unit circle by taking 
    // the radius and multiplying it by the radius of the ball
    // this scales the position of the vector from the full normalized 
    // distance to the edge of where the sphere would hit on a "wall"
    totalMargin = radius * sphereRadius,
    // We use PI as our reference as it represents going from +1 to -1.  0 is the midway point between the walls.  
    // since our unit is in miliseconds, we divide pi by the number of miliseconds every time we change the speed
    msInPI = null,
    self;

// Collections
// ////////////////////////////////////////////////////////////////////////////
var allOverlays = {},
    rotation = {},
    position = {},
    gameData = {},
    levelMap = {},
    levelData = {},
    orbProperties = {},
    boundryLeftProperties = {},
    boundryRightProperties = {},
    drumPadProperties = {},
    drumPadPointOnPlane = {},
    previousStickLeftPoint = {},
    currentStickLeftPoint = {},
    previousStickRightPoint = {},
    currentStickRightPoint = {},
    currentBeatRecord = {},
    nameMap = {
        Neuroscape_Drum_Stick_Left: "Stick_Left",
        Neuroscape_Drum_Stick_Right: "Stick_Right",
        Neuroscape_Orb: "Orb"
    },
    status = {
        latency: currentLatency
    },
    collisionCollection = [],
    allLevelsData = [],
    levels = [];
// testLevels = ["Level_1", "Level_2", "Level_3", "Level_10"];
// testLevels = ["Level_1"];
// testLevels = ["Level_1", "Level_2", "Level_3", "Level_10", "Level_11", "Level_12", "Level_19", "Level_20", "Level_21"];
// testLevels = ["Level_1", "Level_2"];;

// Constructor Functions

function CollisionRecord(duringBeat, collisionTime) {
    this.duringBeat = duringBeat;
    this.collisionTime = collisionTime;
}

function Level(level, speed, gameType, av) {
    this.level = level;
    this.speed = speed;
    this.gameType = gameType;
    this.av = av;
}

// Helper functions
// ////////////////////////////////////////////////////////////////////////////

function calculateLatency(collisionTime) {
    if (currentGameType === ON || currentGameType === CONTINUOUS) {
        log(LOG_ENTER, "IN ON || CONTINUOUS");
        currentLatency = Math.abs(collisionTime - ((currentBeat + COUNT_IN) * currentMSSpeed));
        prevLatency = Math.abs(collisionTime - ((currentBeat + COUNT_IN - 1) * currentMSSpeed));
        finalLatency = Math.min(currentLatency, prevLatency).toFixed(0);
        currentRoundLatency.push(+finalLatency);
    } else {
        log(LOG_ENTER, "IN OFF");
        currentLatency = Math.abs(collisionTime - ((currentBeat + COUNT_IN) * (currentMSSpeed) + currentMSSpeed / 2));
        prevLatency = Math.abs(collisionTime - ((currentBeat + COUNT_IN - 1) * (currentMSSpeed) + currentMSSpeed / 2));
        finalLatency = Math.min(currentLatency, prevLatency).toFixed(0);
        currentRoundLatency.push(+finalLatency);
    }

    log(LOG_VALUE, "collisionTime", collisionTime);
    log(LOG_VALUE, "(currentBeat + coutin)", currentBeat + COUNT_IN);
    log(LOG_VALUE, "(currentBeat * currentMSSpeed)", ((currentBeat + COUNT_IN) * currentMSSpeed));
    log(LOG_VALUE, "currentLatency", currentLatency);
    log(LOG_VALUE, "prevLatency", prevLatency);
    log(LOG_VALUE, "finalLatency", finalLatency);
}

function changeOrbVisibility(boolState) {
    var properties = {
        visible: boolState
    };

    Overlays.editOverlay(allOverlays[ORB], properties);
}

function editColor(stick) {
    var inMin = 0,
        inMax = currentMSSpeed,
        currentPoint = finalLatency,
        outColorMin = 0,
        outColorMax = 255,
        colorChangeRed,
        colorChangeBlue,
        properties = {};

    colorChangeRed = lerp(
        inMin, inMax, outColorMin, outColorMax, currentPoint
    );
    colorChangeBlue = lerp(
        inMin, inMax, outColorMax, outColorMin, currentPoint
    );

    properties = {
        color: {
            red: clamp(0, 255, parseInt(colorChangeRed)),
            blue: clamp(0, 255, parseInt(colorChangeBlue)),
            green: 0
        }
    };

    Overlays.editOverlay(allOverlays[stick], properties);
    getToWhite(stick, properties);
}

function findSphereHit(point, sphereRadius) {
    var EPSILON = 0.000001;	// smallish positive number - used as margin of error for some computations
    var vectorLength = VEC3.length(point);
    if (vectorLength < EPSILON) {
        return true;
    }
    var distance = vectorLength - sphereRadius;
    if (distance < 0.0) {
        return true;
    }
    return false;
}

function findSpherePointHit(sphereCenter, sphereRadius, point) {
    return findSphereHit(VEC3.subtract(point, sphereCenter), sphereRadius);
}

function findLinePlaneIntersectionCoords(L0, L1, P0, N) {
    // Line is L0, L1
    // Plane is point P0 with normal N
    // The equation of a plane 
    //     N dot (P0 - P) = 0
    // Equation of the line 
    //     L = L0 + u (L1 - L0)
    // The intersection of these two occurs when L = P
    //     L0 + u ( L1 - L0) = P
    // Subtrac both sides from P0 and dot with N:
    //     N dot (L0 - P0 + u(L1 - L0)) = N dot (P0 - P) = 0
    // Solve for u:
    //     u (N dot (L1 - L0)) = N dot (P0 - L0)
    //     u = (N dot (P0 - L0)) / (N dot (L1 - L0))
    log(LOG_ARCHIVE, "L0", L0, 500);
    log(LOG_ARCHIVE, "L1", L1, 500);
    log(LOG_ARCHIVE, "P0", P0, 500);
    log(LOG_ARCHIVE, "N", N, 500);

    var denominator = VEC3.dot(N, VEC3.subtract(L1, L0));
    log(LOG_ARCHIVE, "denominator", denominator, 50);

    if (denominator !== 0.0) {
        var numerator = VEC3.dot(N, VEC3.subtract(P0, L0));
        log(LOG_ARCHIVE, "numerator", numerator, 50);

        return numerator / denominator;
    }
    return NULL; // or some other invalid value that can signal failure
}

function getDrumStickPoint() {
    var propertiesLeft = Overlays.getProperties(allOverlays[STICK_LEFT], ["position", "dimensions", "rotation"]),
        propertiesRight = Overlays.getProperties(allOverlays[STICK_RIGHT], ["position", "dimensions", "rotation"]),
        offset = vec(0, -propertiesLeft.dimensions.y / 2, 0), // same for both
        worldSpaceLeft = VEC3.multiplyQbyV(propertiesLeft.rotation, offset),
        worldSpaceRight = VEC3.multiplyQbyV(propertiesRight.rotation, offset),
        worldSpacePointLeft = VEC3.sum(worldSpaceLeft, propertiesLeft.position),
        worldSpacePointRight = VEC3.sum(worldSpaceRight, propertiesRight.position);

    previousStickLeftPoint = currentStickLeftPoint;
    previousStickRightPoint = currentStickRightPoint;
    currentStickLeftPoint = worldSpacePointLeft;
    currentStickRightPoint = worldSpacePointRight;
}

function getToWhite(stick, properties) {
    var perStep = {
        red: (255 - properties.color.red) / COLOR_STEPS,
        green: (255 - properties.color.green) / COLOR_STEPS,
        blue: (255 - properties.color.blue) / COLOR_STEPS
    };

    var stepsLeft = COLOR_STEPS;
    var colorInterval;
    colorInterval = Script.setInterval(function () {
        var currentRed = properties.color.red;
        var currentBlue = properties.color.blue;
        var currentGreen = properties.color.green;
        properties.color.red = clamp(0, 255, parseInt(perStep.red + currentRed));
        properties.color.green = clamp(0, 255, parseInt(perStep.green + currentGreen));
        properties.color.blue = clamp(0, 255, parseInt(perStep.blue + currentBlue));

        Overlays.editOverlay(allOverlays[stick], properties);
        --stepsLeft;
        if (stepsLeft === 0) {
            Script.clearInterval(colorInterval);
        }
    }, COLOR_CHANGE_INTERVAL);
}

function initGame() {
    gameData = {};
    self.reset();
    updateDataText(ENTER_NAME);
}

function makeOverlay(position) {
    var start = Object.assign({}, position, { y: position.y - LINEHEIGHT });
    var end = Object.assign({}, position, { y: position.y + LINEHEIGHT });
    var lineProps = {
        lineWidth: LINE_WIDTH,
        isDashedLine: true,
        start: start,
        end: end
    };
    var lineOverlay = Overlays.addOverlay("line3d", lineProps);
    Script.setTimeout(function () {
        Overlays.deleteOverlay(lineOverlay);
    }, OVERLAY_DELETE_TIME);
}

function playHaptic(strength, duration, hand) {
    Controller.triggerHapticPulse(strength, duration, hand);
}

function playSound(position, object) {
    if (typeof position === "string") {
        position = JSON.parse(position);
    }
    Audio.playSound(object, {
        position: position,
        volume: 0.5,
        localOnly: true
    });
}

function playVisual(boundary) {
    var properties = {
        color: {
            red: 80,
            blue: 120,
            green: 255
        },
        isSolid: false
    };

    Overlays.editOverlay(allOverlays[boundary], properties);

    properties = {
        color: boundryLeftProperties.color,
        isSolid: true
    };

    Script.setTimeout(function () {
        Overlays.editOverlay(allOverlays[boundary], properties);

    }, HIT_TIME);
}

function prepNextLevel() {
    nextLevel = levelMap[nextLevel];
    currentLevel = nextLevel.level;
    currentMSSpeed = nextLevel.speed;
    currentGameType = nextLevel.gameType;
    updateGameTypeText(currentGameType);
    log(LOG_ARCHIVE, "PReP LEVEL BEFOrE CurrenTAV", currentAV);
    currentAV = nextLevel.av;
    log(LOG_ARCHIVE, "PReP LEVEL AFTER CurrenTAV", currentAV);

    msInPI = PI / currentMSSpeed;
}

function reset() {
    isListenMode = true;
    totalDelta = 0;
    currentBeat = 0 - COUNT_IN;
    currentLatency = 0;
    prevLatency = 0;
    continuousBeatCounter = 0;
    changeOrbVisibility(VISIBILE);
    currentRoundLatency = [];

}

function restartGame() {
    isNameEntered = false;
    currentPlayerName = null;
    updateDataText(ENTER_NAME);
}

function startGame() {
    log(LOG_ENTER, "STARTING GAME");

    self.initGame();
    gameData.name = currentPlayerName;
    gameData.date = new Date();
    gameData.start = new Date();

    self.createLevelMap();

    isGameRunning = true;

    nextLevel = levels.shift();
    // nextLevel = testLevels.shift();
    self.prepNextLevel();
    self.reset();
    self.startLevel();
}

function startLevel() {
    updateLatencyText(0);
    log(LOG_ENTER, "START LEVEL");
    self.storeTempTypes();

    currentLevelStartTime = new Date();

    isGameRunning = true;
    // Entities.callEntityClientMethod(activeClientID, childrenIDS[ORB], "moveDirection", [DIRECTION_ONE]);
    totalDelta = 0;
    Script.setTimeout(self.stopLevel, currentDuration);
}

function startUpdate() {
    Script.update.connect(onUpdate);
}

function stopGame() {
    log(LOG_ENTER, "STOPPING GAME");
    gameData.stop = new Date();
    gameData.levels = allLevelsData;
    isGameRunning = false;
    isNameEntered = false;
    finalLatency = 0;

    var sendMessage = DONE_MESSAGE + " " + currentPlayerName + "!";

    updateDataText(sendMessage);
    var gameDataMessage = JSON.stringify({
        type: SAVE_JSON,
        value: gameData
    });
    Messages.sendMessage(MESSAGE_CHANNEL, gameDataMessage, true);

    currentPlayerName = null;
    // log(LOG_VALUE, "FINAL GAMEDATA", gameDataMessage);
}

function stopLevel() {
    log(LOG_ENTER, "STOP LEVEL");
    updateOrbPosition(orbProperties.position);

    var sum = 0;
    var sumLatency = currentRoundLatency.reduce(function(prev, curr){
        prev += curr;
        return prev;
    }, sum);
    var averageLatency = (sumLatency / currentRoundLatency.length).toFixed(2);

    levelData = {
        level: currentLevel,
        speed: currentMSSpeed,
        gameType: currentGameType,
        av: currentAV,
        startTime: currentLevelStartTime,
        stopTime: new Date(),
        collisionData: collisionCollection,
        averageLatency: averageLatency
    };
    log(LOG_ARCHIVE, "levelData", levelData);
    allLevelsData.push(levelData);
    collisionCollection = [];

    nextLevel = levels.shift();
    // nextLevel = testLevels.shift();
    if (!nextLevel) {
        self.stopGame();
    } else {
        isGamePaused = true;
        isAllowedToUnPause = false;
        Script.setTimeout(function () {
            isAllowedToUnPause = true;
        }, ALLOW_HIT_TO_UNPAUSE_TIME);

        self.prepNextLevel();

        var sendMessage = "Average Latency for the round " + averageLatency + "\n";
        sendMessage += CONTINUE_MESSAGE;
        sendMessage += "\nNext Level:  \t" + currentLevel;
        sendMessage += "\nNext Speed:  \t" + currentMSSpeed + "ms";
        sendMessage += "\nNext Game Type:  \t" + currentGameType;
        sendMessage += "\nNext AV type:  \t" + currentAV + "\n";
        updateDataText(sendMessage);
        self.reset();

    }
}

function stopUpdate() {
    Script.update.disconnect(onUpdate);
}

function storeTempTypes() {
    tempGameType = currentGameType;
    log(LOG_ARCHIVE, "storeTempTypes BEFOrE CurrenTAV", tempAV);
    tempAV = currentAV;
    log(LOG_ARCHIVE, "storeTempTypes AFTER CurrenTAV", tempAV);

    currentGameType = DEFAULT_GAME_TYPE;
    currentAV = DEFAULT_AV;
}

function updateDataText(message) {
    // #Todo Sendback to the tablet through this
    var text = message;
    try {
        text = JSON.parse(text);
        text = JSON.stringify(text)
            .split(",").join("\n\t")
            .split("{").join("\n")
            .split("}").join("\n").replace(/"/g, "");

    } catch (e) {
        log(LOG_ERROR, "CAN NOT PARSE OBJECT");
    }

    var properties = {
        text: text
    };

    Overlays.editOverlay(allOverlays[DATA_WINDOW], properties);
    var tabletMessage = JSON.stringify({
        type: UPDATE_MESSAGE,
        value: text
    });
    if (message !== ENTER_NAME) {
        Messages.sendMessage(MESSAGE_CHANNEL, tabletMessage, true);
    }
}

function updateGameTypeText(gameType) {
    var text = GAME_TYPE_MESSAGE + gameType;

    var properties = {
        text: text
    };

    Overlays.editOverlay(allOverlays[GAME_TYPE_WINDOW], properties);
}

function updateLatencyText(latency) {
    var text = LATENCY_MESSAGE + latency;

    var properties = {
        text: text
    };

    Overlays.editOverlay(allOverlays[LATENCY_WINDOW], properties);
}

function updateOrbPosition(position) {
    var properties = {
        position: position
    };

    Overlays.editOverlay(allOverlays[ORB], properties);
}

function updatePlayerName(playerName) {
    log(LOG_ENTER, "UPDATING PLAYER NAME");
    currentPlayerName = playerName;
    isNameEntered = true;
    var sendMessage = "Hi " + currentPlayerName + "!\n\n";
    sendMessage += STARTING_MESSAGE;
    sendMessage += "\nNext Level:  \t" + currentLevel;
    sendMessage += "\nNext Speed:  \t" + currentMSSpeed + "ms";
    sendMessage += "\nNext Game Type:  \t" + currentGameType;
    sendMessage += "\nNext AV type:  \t" + currentAV + "\n";
    updateDataText(sendMessage);
    updateGameTypeText(currentGameType);
}

function updateStatus() {
    status = {
        // speed: currentMSSpeed,
        // level: currentLevel,
        // type: currentGameType,
        // av: currentAV,
        // beat: currentBeat,
        latency: finalLatency
    };
}

// Procedural Functions
// ////////////////////////////////////////////////////////////////////////////

function createLevelMap() {
    var levelCounter = 1,
        BASENAME = "Level_",
        gameTypes = [ON, OFF, CONTINUOUS],
        // gameTypes = [ON, OFF],
        // gameTypes = [ON],
        // gameTypes = [CONTINUOUS],

        speeds = [SLOW, MEDIUM, FAST],
        // speeds = [SLOW],

        avs = [AUDIOVISUAL, AUDIO, VISUAL];
    // avs = [AUDIOVISUAL];

    speeds.forEach(function (speed) {
        gameTypes.forEach(function (gameType) {
            avs.forEach(function (av) {
                var name = BASENAME + levelCounter;
                levelMap[name] = new Level(name, speed, gameType, av);
                levelCounter++;
            });
        });
    });
    levels = Object.keys(levelMap);
}

function handleCollision(collisionObject, orbPosition) {
    log(LOG_ARCHIVE, "HANDLE COLLISION ");

    log(LOG_ARCHIVE, "isNameEntered", isNameEntered);

    makeOverlay(orbPosition);

    if (!isNameEntered) {
        return;
    }

    log(LOG_ARCHIVE, "isGameRunning", isGameRunning);
    if (!isGameRunning) {
        self.startGame();
        return;
    }

    log(LOG_ARCHIVE, "isGamePaused", isGamePaused);
    log(LOG_ARCHIVE, "isAllowedToUnPause", isAllowedToUnPause);
    if (isGamePaused && isAllowedToUnPause) {
        self.startLevel();
        isGamePaused = false;
        isAllowedToUnPause = false;
        return;
    }

    log(LOG_ARCHIVE, "ABOUT TO CHECK CURRENT BEAT", currentBeat);
    log(LOG_ARCHIVE, "isListenMode", isListenMode);

    if (currentBeat < 0 || (currentGameType === CONTINUOUS && isListenMode)) {
        log(LOG_ARCHIVE, "CURRENT BEAT BELOW 0", currentBeat);
        return;
    } else {
        log(LOG_ARCHIVE, "About to record stick collision ");
        self.recordCollision(collisionObject);
    }
}

function incrementBeat() {
    log(LOG_ARCHIVE, "CURRENT BEAT IN START OF INCREMENT", currentBeat);
    // this is called whenenver the orb collides with a wall 
    var sendMessage = "";

    if (currentBeat >= 0) {
        updateDataText("Go!");
        // handles the post countdown period
        if (currentGameType === ON || currentGameType === OFF) {
            // self.updateStatus();
            // updateDataText(JSON.stringify(status));
            updateLatencyText(finalLatency);
        } else {
            continuousBeatCounter++;
            if (isListenMode) {
                log(LOG_ARCHIVE, "isListen Mode before CurrentAv", currentAV);
                currentAV = tempAV;
                log(LOG_ARCHIVE, "isListen Mode after CurrentAv", currentAV);

                changeOrbVisibility(VISIBILE);
                sendMessage = "";
                sendMessage += LISTEN_MESSAGE;
                updateDataText(sendMessage);
            } else {
                log(LOG_ARCHIVE, "is notListen mode Mode before CurrentAv", currentAV);
                currentAV = null;
                log(LOG_ARCHIVE, "is notListen mode Mode after CurrentAv", currentAV);

                changeOrbVisibility(!VISIBILE);
                sendMessage = "";
                sendMessage += PLAY_MESSAGE;
                updateDataText(sendMessage);
                updateLatencyText(finalLatency);
            }

            if (continuousBeatCounter === 4) {
                isListenMode = !isListenMode;
                continuousBeatCounter = 0;
            }
        }
    } else {
        // This is handeling our Count Down Period
        sendMessage += GET_READY_MESSAGE + Math.abs(currentBeat);
        updateDataText(sendMessage);
        log(LOG_ARCHIVE, "current Beat in Count down", currentBeat);
        if (currentBeat === -1) {
            currentGameType = tempGameType;
            log(LOG_ARCHIVE, "currentBeat === 0 before CurrentAv", currentAV);
            currentAV = tempAV;
            log(LOG_ARCHIVE, "currentBeat === 0 after CurrentAv", currentAV);
        }
    }
}

function init() {
    self = this;
    updateDataText(ENTER_NAME);
    orbProperties = Overlays.getProperties(allOverlays[ORB], ["dimensions", "position"]);
    boundryLeftProperties = Overlays.getProperties(allOverlays[BOUNDARY_LEFT], ["color", "position", "dimensions"]);
    boundryRightProperties = Overlays.getProperties(allOverlays[BOUNDARY_RIGHT], ["color", "position", "dimensions"]);
    drumPadProperties = Overlays.getProperties(allOverlays[PAD], ["position", "dimensions"]);
    log(LOG_VALUE, "Drum pad", drumPadProperties);
    drumPadPointOnPlane = Object.assign(
        {}, drumPadProperties.position, { y: drumPadProperties.position.y + drumPadProperties.dimensions.y / 2 });
    drumPadRadius = drumPadProperties.dimensions.x / 2;
    var distance = VEC3.distance(boundryRightProperties.position, boundryLeftProperties.position);
    log(LOG_ARCHIVE, "boundryRightProperties", boundryRightProperties);

    UNIT_SCALAR = (distance) / 2 - boundryRightProperties.dimensions.x * 2;

    log(LOG_ARCHIVE, "UNIT_SCALAR", UNIT_SCALAR);
    sphereRadius = orbProperties.dimensions.x;
    totalMargin = UNIT_SCALAR * sphereRadius;
    position = orbProperties.position;
    rotation = MyAvatar.orientation;

    currentMSSpeed = SLOW;
    currentAV = AUDIOVISUAL;
    currentGameType = ON;
    currentLevel = 1;
    msInPI = PI / currentMSSpeed;
    this.createLevelMap();
    startUpdate();
    Overlays.mousePressOnOverlay.connect(onOverlayMousePress);
}

function onOverlayMousePress(id, event) {
    if (id === allOverlays[PAD]) {
        var orbPosition,
            newCollision;

        orbPosition = Overlays.getProperty(allOverlays[ORB], "position");
        newCollision = {
            time: totalDelta,
            id: MOUSE_PRESS
        };

        self.handleCollision(newCollision, orbPosition);
    }
}

function recordCollision(collisionObject) {
    log(LOG_ENTER, "recordCollision");

    var collisionRecord = new CollisionRecord(
        currentBeat,
        collisionObject.time
    );

    if (collisionObject.id === MOUSE_PRESS) {
        log(LOG_ENTER, "IN RECORD COLLISION about to record mouse press collision ");
        self.calculateLatency(collisionRecord.collisionTime);
        collisionCollection.push({
            id: MOUSE_PRESS,
            collisionRecord: collisionRecord,
            latency: finalLatency
        });

    }

    if (collisionObject.id === STICK_LEFT) {
        self.calculateLatency(collisionRecord.collisionTime);
        collisionCollection.push({
            id: nameMap[STICK_LEFT],
            collisionRecord: collisionRecord,
            latency: finalLatency
        });
        editColor(STICK_LEFT);
    }

    if (collisionObject.id === STICK_RIGHT) {
        self.calculateLatency(collisionRecord.collisionTime);
        collisionCollection.push({
            id: nameMap[STICK_RIGHT],
            collisionRecord: collisionRecord,
            latency: finalLatency
        });
        editColor(STICK_RIGHT);
    }

    self.updateStatus();
    // if (currentGameType !== CONTINUOUS && isListenMode !== true) {
    if (currentGameType !== CONTINUOUS) {
        updateLatencyText(finalLatency);
    }
}

function runHandCheck() {
    var planeIntersectionLeft,
        planeIntersectionRight,
        correctCollisionTime,
        newCollision,
        orbPosition;

    planeIntersectionLeft = findLinePlaneIntersectionCoords(
        previousStickLeftPoint, currentStickLeftPoint, drumPadPointOnPlane, vec(0, 1, 0));
    planeIntersectionRight = findLinePlaneIntersectionCoords(
        previousStickRightPoint, currentStickRightPoint, drumPadPointOnPlane, vec(0, 1, 0));

    // TODO - Generalize this more
    if (planeIntersectionRight !== NULL && planeIntersectionRight <= 1 && planeIntersectionRight >= 0 && canHitDrum) {
        log(LOG_ARCHIVE, "R planeIntersection", planeIntersectionRight);
        log(LOG_ARCHIVE, "currentStickRightPoint", currentStickRightPoint);
        log(LOG_ARCHIVE, "drumPadRightPointOnPlane", drumPadPointOnPlane);
        if (currentStickRightPoint.y > drumPadPointOnPlane.y) {
            return;
        }

        if (findSpherePointHit(drumPadPointOnPlane, drumPadRadius, currentStickRightPoint)) {
            log(LOG_ARCHIVE, "previousTotalDelta", previousTotalDelta);
            log(LOG_ARCHIVE, "totalDelta", totalDelta);
            log(LOG_ARCHIVE, "planeIntersection", planeIntersectionRight);
            correctCollisionTime = lerp(0, 1, previousTotalDelta, totalDelta, planeIntersectionRight);
            newCollision = {
                time: correctCollisionTime,
                id: STICK_RIGHT
            };
            log(LOG_ARCHIVE, "newCollision", newCollision);
            orbPosition = Overlays.getProperty(allOverlays[ORB], "position");
            self.handleCollision(newCollision, orbPosition);
            playHaptic(HAPTIC_STRENGTH, HAPTIC_DURATION, RIGHT_HAND);
            playSound(drumPadPointOnPlane, soundStick);

            canHitDrum = false;
            Script.setTimeout(function () {
                canHitDrum = true;
            }, DRUM_HIT_TIMEOUT);
        }
    }

    if (planeIntersectionLeft !== NULL && planeIntersectionLeft <= 1 && planeIntersectionLeft >= 0 && canHitDrum) {
        log(LOG_ARCHIVE, "R planeIntersection", planeIntersectionLeft);
        log(LOG_ARCHIVE, "currentStickRightPoint", currentStickLeftPoint);
        log(LOG_ARCHIVE, "drumPadRightPointOnPlane", drumPadPointOnPlane);
        if (currentStickLeftPoint.y > drumPadPointOnPlane.y) {
            return;
        }

        if (findSpherePointHit(drumPadPointOnPlane, drumPadRadius, currentStickLeftPoint)) {
            log(LOG_ARCHIVE, "previousTotalDelta", previousTotalDelta);
            log(LOG_ARCHIVE, "totalDelta", totalDelta);
            log(LOG_ARCHIVE, "planeIntersectionLeft", planeIntersectionLeft);
            correctCollisionTime = lerp(0, 1, previousTotalDelta, totalDelta, planeIntersectionLeft);
            newCollision = {
                time: correctCollisionTime,
                id: STICK_LEFT
            };
            log(LOG_ARCHIVE, "newCollision", newCollision);
            orbPosition = Overlays.getProperty(allOverlays[ORB], "position");
            self.handleCollision(newCollision, orbPosition);
            playHaptic(HAPTIC_STRENGTH, HAPTIC_DURATION, RIGHT_HAND);
            playSound(drumPadPointOnPlane, soundStick);

            canHitDrum = false;
            Script.setTimeout(function () {
                canHitDrum = true;
            }, DRUM_HIT_TIMEOUT);
        }
    }
}

function test() {
    startUpdate();
    Script.setTimeout(stopUpdate, 40000);
    // var testBox = Entities.addEntity({type: "Box", position: MyAvatar.position});

}

function onUpdate(delta) {
    // Turn the delta we received from seconds to miliseconds
    // var overlayText = Overlays.getProperty(allOverlays[DATA_WINDOW],"text");
    // overlayText += "\nTotalDelta: " + totalDelta;
    // updateDataText(overlayText);

    var deltaInMs = delta * 1000;

    getDrumStickPoint();

    log(LOG_ARCHIVE, "previousStickLeftPoint", previousStickLeftPoint, 1000);
    log(LOG_ARCHIVE, "previousStickRightPoint", previousStickRightPoint, 1000);
    log(LOG_ARCHIVE, "currentStickLeftPoint", currentStickLeftPoint, 1000);
    log(LOG_ARCHIVE, "currentStickRightPoint", currentStickRightPoint, 1000);

    runHandCheck();

    if (!isGameRunning || isGamePaused) {
        return;
    }
    // Entities.editEntity(testBox, {position: currentStickRightPoint});
    // Take the total delta count and divide it by the total time between beats, get that value rounded down
    var floorTotalDeltaByTotalms = Math.floor(totalDelta / currentMSSpeed);
    log(LOG_ARCHIVE, "floorTotalDeltaByTotalms", floorTotalDeltaByTotalms);

    // Take the total delta count and divide it by the total time between beats, get that value rounded up
    // These basically gives you the group number to multiply the bpm to get a position
    var ceilTotalDeltaByTotalms = Math.ceil(totalDelta / currentMSSpeed);

    // log(LOG_VALUE, "currentBeat", currentBeat)
    // log(LOG_VALUE, "ceilTotalDeltaByTotalms - COUNT_IN", ceilTotalDeltaByTotalms - COUNT_IN)
    if (currentBeat !== ceilTotalDeltaByTotalms - COUNT_IN) {
        currentBeat = ceilTotalDeltaByTotalms - COUNT_IN;
        self.incrementBeat();
    }

    log(LOG_ARCHIVE, "ceilTotalDeltaByTotalms", ceilTotalDeltaByTotalms);
    // This will give you back the value of the expected beat before the current point in time
    var totalMsFloor = currentMSSpeed * floorTotalDeltaByTotalms;
    // This will give you back the value of the expected beat after the current point in time
    var totalMsCeil = currentMSSpeed * ceilTotalDeltaByTotalms;
    // Take the totalDelta clock and subtract from the before time to get the distance away from the previous beat
    var totalDeltaMinusFloor = totalDelta - totalMsFloor;
    // Take the totalDelta clock and subtract from the after time to get the distance away from the next possible beat
    var totalDeltaMinusCeil = totalDelta - totalMsCeil;
    // We are trying to get an aggregate length to find an acceptable frame to call "the preceived current beat"
    // Employing a length operation with the dimensions of the distance away from the previous beat, 
    // and the distance away from the next beat,
    var tdMinusFloorSquared = Math.pow(totalDeltaMinusFloor, 2);
    var tdMinusCeilSquared = Math.pow(totalDeltaMinusCeil, 2);
    var length = Math.sqrt(tdMinusFloorSquared + tdMinusCeilSquared);
    // we get a number we can use a heuristic for how close we can be 
    // by subtracting the total time between beats and this new length
    var distanceAway = currentMSSpeed - length;

    // the theta to input into Math.cos comes from multiplying the current totalDelta, which is the running miliseconds, 
    // by what each milisecond is worth in radians.  every loop of the beat will produce -1 to 1 numbers.
    var cosTheta = totalDelta * msInPI;
    // var sinAmount = totalDelta * msInPI;  // In case you want to play with a different shaped meteronome

    // the x value on the cos of a unit circle
    var xCos = Math.cos(cosTheta);
    // var yCos = Math.sin(sinAmount);

    // adjust for the length of the ball being used by taking the cos and subtracting from it the margin to account for, 
    // decreases to 0 to make sure it hits middle when multiplied
    // var xCosAdjusted = -1 - -1 * totalMargin;
    var xCosAdjusted = xCos - xCos * totalMargin;
    // var ySinAdjusted = yCos - yCos * totalMargin;

    // create a vector that is one meter in front of where your avatar currently is, with the x direction 
    // going towards where it should be at this point in time
    // Multiply this with adjusted cos amount to get a larger distance to travel

    var localPos = { x: xCosAdjusted * UNIT_SCALAR, y: 0, z: 0 };
    // print(JSON.stringify((1 / Math.cos(cosAmount)))); 

    // rotate that vector by the direction the avatar is first facing 
    // var multiplied = VEC3.multiplyQbyV(MyAvatar.orientation, localPos);
    var multiplied = VEC3.multiplyQbyV(rotation, localPos);

    // print(JSON.stringify(multiplied)); 
    // create a temp position that takes in an anchor point and travels to the point from the rotated vector above
    var temporaryPosition = VEC3.sum(position, multiplied);
    // position.z = position.z + ((Math.sin(cosAmount)) * 1);

    // amount that our chosen length designation for the beat can be either before or after
    var withInMargin = 15;
    // if the current distance away is smaller then the acceptable range, and if you can play it becaues you aren't debounced, go for it
    // Lean towards being before the beat.  Don't allow another play sound check until a decent margin that is 90% of the current 
    // miliseconds per beat is at
    if (distanceAway < withInMargin) {
        if (canPlayAV) {
            log(LOG_VALUE, "distanceAway: ", distanceAway);
            log(LOG_ARCHIVE, "currentAv", currentAV);
            if (currentAV === AUDIO) {
                playSound(temporaryPosition, soundBell);
            }
            if (currentAV === VISUAL) {
                Math.sign(xCos) >= 0 ? playVisual(BOUNDARY_RIGHT) : playVisual(BOUNDARY_LEFT);
            }
            if (currentAV === AUDIOVISUAL) {
                playSound(temporaryPosition, soundBell);
                Math.sign(xCos) >= 0 ? playVisual(BOUNDARY_RIGHT) : playVisual(BOUNDARY_LEFT);
            }
            canPlayAV = false;
            Script.setTimeout(function () {
                canPlayAV = true;
            }, currentMSSpeed * 0.90);
        }
    }

    previousTotalDelta = totalDelta;
    totalDelta += deltaInMs;
    updateOrbPosition(temporaryPosition);
}

function NeuroscapeManager(overlayList, context) {
    allOverlays = overlayList;
    return {
        calculateLatency: calculateLatency,
        createLevelMap: createLevelMap,
        handleCollision: handleCollision,
        incrementBeat: incrementBeat,
        init: init,
        initGame: initGame,
        prepNextLevel: prepNextLevel,
        recordCollision: recordCollision,
        reset: reset,
        restartGame: restartGame,
        startGame: startGame,
        stopGame: stopGame,
        startLevel: startLevel,
        stopLevel: stopLevel,
        storeTempTypes: storeTempTypes,
        test: test,
        updatePlayerName: updatePlayerName,
        updateStatus: updateStatus
    };
}

Script.scriptEnding.connect(function () {
    stopUpdate();
    Overlays.mousePressOnOverlay.disconnect(onOverlayMousePress);
});

module.exports = NeuroscapeManager;
