Entities.findEntities(MyAvatar.position, 20000).forEach(function(cell){
    var props = Entities.getEntityProperties(cell);
    if (props.name.indexOf("Cell") > -1){
        Entities.deleteEntity(cell);
    }
});
/*

velocity.add(acceleration)
location.add(velocity)

*/
var GRID_X = 3;
var GRID_Y = 3;
var GRID_Z = 3;

var CELL_DIMENSIONS = 0.5;

var NUMBER_OF_CELLS = GRID_X * GRID_Z; 
var NUMBER_DEAD_AROUND_TO_DIE = 2;
var NUMBER_ALIVE_AROUND_TO_LIVE = 2;

var cellGrid = [];
var position = {x: 0, y: 0, z: 0};
var worldSum = 0;

var CELL_PROPS = {
    type: "Box",
    dimensions: {x: CELL_DIMENSIONS, y: CELL_DIMENSIONS, z: CELL_DIMENSIONS},
    registrationPoint: {x: 0.5, y: 0.5, z: 0.5}
}

var PADDING = 1.9;
var LIFE_STAGE_0 = 0.00;
var LIFE_STAGE_1 = 0.45;
var LIFE_STAGE_2 = 0.65;
var LIFE_STAGE_3 = 0.80;
var LIFE_STAGE_4 = 1.00;

var LIFE_STAGE_0_COLOR = [0,0,0];
var LIFE_STAGE_1_COLOR = [20,75,5];
var LIFE_STAGE_2_COLOR = [100,150,75];
var LIFE_STAGE_3_COLOR = [175,200,125];
var LIFE_STAGE_4_COLOR = [255,255,255];

function setVecLimits(vector, limitsMax, limitsMin){
    limitsMax = limitsMax || {x: 0, y: 0, z: 0};
    limitsMin = limitsMin || {x: 0.0, y: 0.0, z: 0.0};
    vector.x = Math.min(vector.x, limitsMax.x);
    vector.x = Math.max(vector.x, limitsMin.x);
    vector.x = Math.min(vector.x, limitsMax.x);
    vector.x = Math.max(vector.x, limitsMin.x);
    vector.z = Math.min(vector.z, limitsMax.z);
    vector.z = Math.max(vector.z, limitsMin.z);
    return vector;
}

var targetCell = null;
function CELL_MAKER(id){
    this.id = id;
    // this.lifeMeter = Math.round(Math.random());
    // this.lifeMeter = 0;
    this.lifeMeter = Math.random();
    this.history = [];
    this.previousState = this.lifeMeter;
    this.nextState = this.lifeMeter;
    this.neighborhood = [];
    this.neighborhoodStateArray = [];
    this.currentNeighborsDead;
    this.currentNeighborsAlive;
    this.generation = 0;
    this.color = LIFE_STAGE_0_COLOR;
    this.isTarget = false;

    this.position = {x: 0, y: 0, z: 0};
    this.velocity = {x: 0, y: 0, z: 0};
    this.acceleration = {x: 0.0, y: 0.1, z: 0.0};
    this.maxSpeed = 1;
}

var triesBeforeNewTarget = 0;
var MAX_TRIES_BEFORE_NEW_TARGET = 20;

function maybeChooseNewRandomTarget(){
    if (triesBeforeNewTarget >= MAX_TRIES_BEFORE_NEW_TARGET) {
        var index = Math.floor(Math.random() * NUMBER_OF_CELLS);
        cellMap[targetCell].isTarget = false;
        cellGrid[index].makeTarget();
        triesBeforeNewTarget = 0;
    }
}

var DISTANCE_TO_STOP = PADDING / 2;
CELL_MAKER.prototype = {
    updatePosition: function(){
        if (this.lifeMeter <= LIFE_STAGE_0 || this.lifeMeter >= LIFE_STAGE_4) { return };
        this.position = Entities.getEntityProperties(this.id, "position").position;

        if (!this.isTarget) {
            var targetPosition = Entities.getEntityProperties(targetCell, 'position').position;
            var direction = Vec3.subtract(targetPosition, this.position);
            if (Vec3.distance(targetPosition, direction) <= DISTANCE_TO_STOP ) {
                return;
            }
            // console.log("DIRECTION:", JSON.stringify(direction));
            var normalizedDirection = Vec3.normalize(direction);
            var speed = 0.01;
            var scaledDirection = Vec3.multiply(normalizedDirection, speed);
            this.velocity = setVecLimits(
                // Vec3.sum(this.velocity, this.acceleration), 
                Vec3.sum(this.velocity, scaledDirection), 
                {x: this.maxSpeed, y: this.maxSpeed, z: this.maxSpeed}
            );
            
            this.position = Vec3.sum(this.position, this.velocity);
            Entities.editEntity(this.id, {position: this.position});
        }
    },
    toggleVisible: function(){
        var shouldBeDead = this.lifeMeter <= LIFE_STAGE_0;
        this.getLifeStageColor();
        var props = {
            alpha: this.lifeMeter,
            color: this.color
        };
        Entities.editEntity(this.id, props);
    },
    getLifeStageColor: function(){
        if (this.isTarget) { return };
        // console.log ("this.lifeState\n", this.lifeMeter)
        if (this.lifeMeter === LIFE_STAGE_0) {
            this.color = LIFE_STAGE_0_COLOR;
        } else if (this.lifeMeter < LIFE_STAGE_1) {
            this.color = LIFE_STAGE_1_COLOR;
        } else if (this.lifeMeter < LIFE_STAGE_2) {
            this.color = LIFE_STAGE_2_COLOR;
        } else if (this.lifeMeter < LIFE_STAGE_3) {
            this.color = LIFE_STAGE_3_COLOR;
        } else {
            this.color = LIFE_STAGE_4_COLOR;
        }
    },
    toggleAlive: function(){
        this.lifeMeter = shouldBeDead;
    },
    saveState: function(){
        this.previousState = this.lifeMeter;
        this.history.push({
            position: this.position,
            velocity: this.veloicty,
            acceleration: this.acceleration,
            generation: this.generation,
            lifeMeter: this.lifeMeter,
            isTarget: this.isTarget,
            color: this.color
    })},
    getNeighbors: function(){
        _this = this;
        var searchRange = CELL_DIMENSIONS + (PADDING * 2);
        var position = Entities.getEntityProperties(this.id, "position").position;
        this.neighborhood = Entities.findEntities(position, searchRange).filter(function(cell){
            // console.log("cell:", cell)
            var name = Entities.getEntityProperties(cell, "name").name;
            return name.indexOf("Cell") > -1 && cell !== _this.id;
        });
        // console.log("this.neighborhood", JSON.stringify(this.neighborhood));
    },
    getNeighborhoodStateArray: function(){
        var _this = this;
        this.neighborhoodStateArray = [];
        this.currentNeighborsDead = 0;
        this.currentNeighborsAlive = 0;
        // console.log("*************************\ncellMap", JSON.stringify(cellMap))
        // console.log("cellMap", JSON.stringify(cellMap, null, 4));
        // console.log("CellMap:", JSON.stringify(cellMap));
        this.neighborhood.forEach(function(neighbor){
            // console.log("neighbor", neighbor);
            neighbor = cellMap[neighbor];
            // console.log("life meter", neighbor.lifeMeter);
            _this.neighborhoodStateArray.push(neighbor.lifeMeter);
        })
        // console.log("neighbor state array", _this.neighborhoodStateArray);
        this.neighborhoodStateArray.forEach(function(neighbor){
            if (neighbor > LIFE_STAGE_0) {
                _this.currentNeighborsAlive++;
            } else {
                _this.currentNeighborsDead++;
            }
        })
        // console.log(_this.currentNeighborsAlive)
        // console.log(_this.currentNeighborsDead)

    },
    getNextState: function(){
        this.history.push(this.lifeMeter);
        this.generation++;
        if (this.lifeMeter >= LIFE_STAGE_0 && this.currentNeighborsAlive >= NEIGHBORS_GREATER_THAN_BEFORE_DYING || this.currentNeighborsAlive <= NEIGHBORS_LESS_THAN_BEFORE_DYING) {
            this.lifeMeter = this.lifeMeter - LIFE_CHANGE;
        } else if (this.lifeMeter <= LIFE_STAGE_4 && this.currentNeighborsAlive > NEIGHBORS_LESS_THAN_BEFORE_DYING && this.currentNeighborsAlive < NEIGHBORS_GREATER_THAN_BEFORE_DYING) {
            this.lifeMeter = this.lifeMeter + LIFE_CHANGE
        }
        this.getAdjustedLifeMeter();
        this.nextState = this.lifeMeter;
    },
    getAdjustedLifeMeter: function(){   
        this.lifeMeter = Math.max(this.lifeMeter, LIFE_STAGE_0);
        this.lifeMeter = Math.min(this.lifeMeter, LIFE_STAGE_4);
    },
    applyNextState: function(){
        this.saveState();
        this.lifeMeter = this.nextState;
        this.toggleVisible();
    },
    makeTarget: function(){
        this.isTarget = true;
        this.lifeMeter = LIFE_STAGE_4;
        this.color = [255,0,0];
        targetCell = this.id;
    }
};
var LIFE_CHANGE = 0.45;
// var NEIGHBORS_LESS_THAN_BEFORE_DYING = 10;
// var NEIGHBORS_TO_BE_ALIVE = 3;
// var NEIGHBORS_GREATER_THAN_BEFORE_DYING = 15;
// var NEIGHBORS_LESS_THAN_BEFORE_DYING = NUMBER_OF_CELLS * 0.25;
var NEIGHBORS_LESS_THAN_BEFORE_DYING = 1;
var NEIGHBORS_TO_BE_ALIVE = 3;
// var NEIGHBORS_GREATER_THAN_BEFORE_DYING = NUMBER_OF_CELLS * 0.30;
var NEIGHBORS_GREATER_THAN_BEFORE_DYING = 3;


var cellMap = {};
function makeCellMap(){
    cellGrid.forEach(function(cell){
        cellMap[cell.id] = cell;
    })
};

var currentCell = 0;
function makeCells(){
    for (var i = 1; i <= GRID_X; i++) {
        for (var j = 1; j <= GRID_Z; j++) {
            // var cellPosition = Vec3.sum(position, {x: (CELL_DIMENSIONS + PADDING) * i, y: (CELL_DIMENSIONS + PADDING) * 0, z: (CELL_DIMENSIONS + PADDING)* j});
            // CELL_PROPS.name = "Cell: " + i + "-" + j;
            // CELL_PROPS.position = cellPosition;
            // var cellID = Entities.addEntity(CELL_PROPS);
            // var newCell = new CELL_MAKER(cellID);
            // newCell.toggleVisible();
            // currentCell++;
            // cellGrid.push(newCell);
            for (var k = 1; k <= GRID_Y; k++) {
                // if (currentCell > 1) break;
                var cellPosition = Vec3.sum(position, {x: (CELL_DIMENSIONS + PADDING) * i, y: (CELL_DIMENSIONS + PADDING) * k, z: (CELL_DIMENSIONS + PADDING)* j});
                CELL_PROPS.name = "Cell: " + i + "-" + j;
                CELL_PROPS.position = cellPosition;
                CELL_PROPS.collisionless = true;
                var cellID = Entities.addEntity(CELL_PROPS);
                var newCell = new CELL_MAKER(cellID);

                // var shouldBeOn = 0;
                // var randomOffset = Math.floor(Math.random() * NUMBER_OF_CELLS);
                if (currentCell === Math.floor(NUMBER_OF_CELLS / 2)) {
                    newCell.makeTarget();
                };
                newCell.toggleVisible();
                currentCell++;
                cellGrid.push(newCell);
                // if (currentCell % 10 === 0) {
                //     shouldBeOn = 1;
                // };
                // newCell.lifeMeter = shouldBeOn;

            }
        }
    }
    // console.log("cellGrid", JSON.stringify(cellGrid, null, 4));
    // console.log("cellGrid Length: " , cellGrid.length);
}

function getAllNeighbors(){
    cellGrid.forEach(function(cell){
        cell.getNeighbors();
    })
}

function saveState(){
    cellGrid.forEach(function(cell){
        cell.saveState();
    })
}

function populateNeighborhoodStateArray(){
    cellGrid.forEach(function(cell){
        cell.getNeighborhoodStateArray();
    })
}

var GENEARTION_TIMER_INTERVAL_MS = 17;
function startAnimation(){
    nextGenerationTimer = Script.setInterval(nextGeneration, GENEARTION_TIMER_INTERVAL_MS)
}

var currentGeneration = 0;
var lastGeneration = 0;
function nextGeneration(){
    lastGeneration++;
    currentGeneration++;
    triesBeforeNewTarget++;
    saveState();
    getNextState();
    animateParticle();
    maybeChooseNewRandomTarget();
}

function previousGeneration(){

}

function gotoGeneration(number){
    cellGrid.forEach(function(cell){
        cell.restoreGeneration(number);
    })
}

function getNextState(){
    getAllNeighbors();
    worldSum = 0;
    populateNeighborhoodStateArray();
    cellGrid.forEach(function(cell){
        cell.getNextState();
    })
    cellGrid.forEach(function(cell, i){
        // var RANDOM_MODULUS = Math.floor(Math.random() * NUMBER_OF_CELLS);
        // console.log(RANDOM_MODULUS);
        // console.log(i % RANDOM_MODULUS === 0);
        // if (i % RANDOM_MODULUS === 0) {
        // if (i % 2 === 0) {

            cell.applyNextState();
            cell.updatePosition();
        // }
        worldSum += cell.lifeMeter;
    })
    // console.log("worldSum:", Math.log(worldSum) * 4.5);
}

function lerp(inMin, inMax, outMin, outMax, value){
    var position = (value - inMin) % (inMax - inMin);
    var lerpedValue = (outMax - outMin) * position;
    return lerpedValue;
}

var particle_id = "{6547c2f9-7222-4bfd-a27c-ff68d54e6e63}";
var currentMin = Number.POSITIVE_INFINITY;
var currentMax = Number.NEGATIVE_INFINITY;
var MIN_PARTICLE_RADIUS = 0.1;
var MAX_PARTICLE_RADIUS = 2;
var MIN_COLOR = 0;
var MAX_COLOR = 255;
function animateParticle(){
    var loggedWorldSum = Math.log(worldSum);
    currentMin = Math.min(currentMin, loggedWorldSum);
    currentMax = Math.max(currentMax, loggedWorldSum);
    // console.log("currentMin", currentMin);
    // console.log("currentMax", currentMax);
    // console.log("loggedowrldsum", loggedWorldSum);
    var particleRadius = Math.min(lerp(currentMin, currentMax, MIN_PARTICLE_RADIUS, MAX_PARTICLE_RADIUS, worldSum), MAX_PARTICLE_RADIUS);
    var color = Math.min(lerp(currentMin, currentMax, MIN_COLOR, MAX_COLOR, worldSum), MAX_COLOR);
    // console.log("particleRadius", particleRadius);
    // console.log("color", color);

    var props = {
        particleRadius: particleRadius,
        color: [0, color, 0]
    }
    Entities.editEntity(particle_id, props);

}

makeCells();
makeCellMap();
getAllNeighbors();
saveState();
populateNeighborhoodStateArray();
startAnimation();

var nextGenerationTimer = null;

function maybeClearNextGenerationTimer(){
    if (nextGenerationTimer) {
        Script.clearTimeout(nextGenerationTimer);
        nextGenerationTimer = null;
    }
}

Script.scriptEnding.connect(function(){
    cellGrid.forEach(function(cell){
        Entities.deleteEntity(cell.id);
    })
    maybeClearNextGenerationTimer();
    Controller.keyPressEvent.disconnect(keyPressHandler);
})

function keyPressHandler(event) {
    if (event.text === "m") {
        nextGeneration();
    };
    if (event.text === "n") {

    };
}

Controller.keyPressEvent.connect(keyPressHandler);