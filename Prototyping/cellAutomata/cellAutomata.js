Entities.findEntitiesByName("Cell", MyAvatar.position, 20000).forEach(function(cell){
    Entities.deletingEntity(cell);
});

var GRID_X = 5;
var GRID_Y = 5;
var GRID_Z = 7;

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

var PADDING = 1.5;
function CELL_MAKER(id){
    this.id = id;
    this.lifeMeter = Math.random();
    // this.lifeMeter = false;
    this.previousState = this.lifeMeter;
    this.nextState = this.lifeMeter;
    this.neighborhood = [];
    this.neighborhoodStateArray = [];
    this.history = [];
    this.currentNeighborsDead;
    this.currentNeighborsAlive;
    this.generation = 0;
}


var LIFE_STAGE_0 = 0.00;
var LIFE_STAGE_1 = 0.20;
var LIFE_STAGE_2 = 0.40;
var LIFE_STAGE_3 = 0.80;
var LIFE_STAGE_4 = 1.00;

CELL_MAKER.prototype = {
    toggleVisible: function(){
        var shouldBeDead = this.lifeMeter <= LIFE_STAGE_0;
        var props = {
            alpha: this.lifeMeter
        };
        Entities.editEntity(this.id, props);
    },
    toggleAlive: function(){
        this.lifeMeter = shouldBeDead;
    },
    saveState: function(){
        this.previousState = this.lifeMeter;
    },
    getNeighbors: function(){
        _this = this;
        var searchRange = CELL_DIMENSIONS + (PADDING * 2);
        var position = Entities.getEntityProperties(this.id, "position").position;
        this.neighborhood = Entities.findEntities(position, searchRange).filter(function(cell){
            var name = Entities.getEntityProperties(cell, "name").name;
            return name.indexOf("Cell") > -1 && cell !== _this.id;
        });
    },
    getNeighborhoodStateArray: function(){
        var _this = this;
        this.neighborhoodStateArray = [];
        this.currentNeighborsDead = 0;
        this.currentNeighborsAlive = 0;
        // console.log("*************************\ncellMap", JSON.stringify(cellMap))
        this.neighborhood.forEach(function(neighbor){
            _this.neighborhoodStateArray.push(neighbor.lifeMeter);
        })
        this.neighborhoodStateArray.forEach(function(neighbor){
            if (neighbor > this.LIFE_STAGE_2) {
                _this.currentNeighborsAlive++;
            } else {
                _this.currentNeighborsDead++;
            }
        })
    },
    getNextState: function(){
        this.history.push(this.lifeMeter);
        this.generation++;
        if (this.currentNeighborsAlive < NEIGHBORS_LESS_THAN_BEFORE_DYING || this.currentNeighborsAlive < NEIGHBORS_LESS_THAN_BEFORE_DYING) {
            this.lifeMeter = this.lifeMeter - this.LIFE_CHANGE;
        } else if (this.currentNeighborsAlive > NEIGHBORS_LESS_THAN_BEFORE_DYING && this.currentNeighborsAlive < NEIGHBORS_GREATER_THAN_BEFORE_DYING) {
            this.lifeMeter = this.lifeMeter + this.LIFE_CHANGE
        }
        this.lifeMeter = this.getAdjustedLifeMeter();
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
    }
};
var LIFE_CHANGE = .15;
var NEIGHBORS_LESS_THAN_BEFORE_DYING = 1;
var NEIGHBORS_GREATER_THAN_BEFORE_DYING = 4;



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
            for (var k = 1; k <= GRID_Y; k++) {
                var cellPosition = Vec3.sum(position, {x: (CELL_DIMENSIONS + PADDING) * i, y: (CELL_DIMENSIONS + PADDING) * k, z: (CELL_DIMENSIONS + PADDING)* j});
                CELL_PROPS.name = "Cell: " + i + "-" + j;
                CELL_PROPS.position = cellPosition;
                var cellID = Entities.addEntity(CELL_PROPS);
                var newCell = new CELL_MAKER(cellID);
                // var shouldBeOn = false;
                // var randomOffset = Math.floor(Math.random() * NUMBER_OF_CELLS);
                // if (currentCell === Math.floor(NUMBER_OF_CELLS / 2 - randomOffset)) {
                //     shouldBeOn = true;
                // };
                // if (currentCell % 2 === 0) {
                //     shouldBeOn = true;
                // };
                // newCell.lifeMeter = shouldBeOn;
                newCell.toggleVisible();
                currentCell++;
                cellGrid.push(newCell);
            }
        }
    }
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

var GENEARTION_TIMER_INTERVAL_MS = 100;
function startAnimation(){
    nextGenerationTimer = Script.setInterval(nextGeneration, GENEARTION_TIMER_INTERVAL_MS)
}

function nextGeneration(){
    saveState();
    getNextState();
}

function getNextState(){
    worldSum = 0;
    populateNeighborhoodStateArray();
    cellGrid.forEach(function(cell){
        cell.getNextState();
    })
    cellGrid.forEach(function(cell, i){
        var RANDOM_MODULUS = Math.floor(Math.random() * NUMBER_OF_CELLS);
        // console.log(RANDOM_MODULUS);
        // console.log(i % RANDOM_MODULUS === 0);m
        // if (i % RANDOM_MODULUS === 0) {
        // if (i % 4 === 0) {

            cell.applyNextState();
        //     worldSum += cell.lifeMeter;
        // }
    })
    // console.log("worldSum:", worldSum);
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
})

// cells.forEach(function(cell){ var props = Entities.getEntityProperties(cell); if (props.name.indexOf("Cell") > - 1) { Entities.deleteEntity(cell) } });