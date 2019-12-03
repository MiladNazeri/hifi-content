Entities.findEntitiesByName("Cell", MyAvatar.position, 20000).forEach(function(cell){
    Entities.deletingEntity(cell);
});

var GRID_X = 10;
var GRID_Y = 5;
var GRID_Z = 10;

var CELL_DIMENSIONS = 0.5;

var NUMBER_OF_CELLS = GRID_X * GRID_Z; 
var NUMBER_DEAD_AROUND_TO_DIE = 2;
var NUMBER_ALIVE_AROUND_TO_LIVE = 1;

var cellGrid = [];
var position = {x: 0, y: 0, z: 0};

var CELL_PROPS = {
    type: "Box",
    dimensions: {x: CELL_DIMENSIONS, y: CELL_DIMENSIONS, z: CELL_DIMENSIONS},
    registrationPoint: {x: 0.5, y: 0.5, z: 0.5}
}

var PADDING = 0.5;
function CELL_MAKER(id){
    this.id = id;
    // this.isAlive = Math.round(Math.random());
    this.isAlive = false;
    this.previousState = this.isAlive;
    this.nextState = this.isAlive;
    this.neighborhood = [];
    this.neighborhoodStateArray = [];
    this.currentNeighborsDead;
    this.currentNeighborsAlive;
}

CELL_MAKER.prototype = {
    toggleVisible: function(){
        var props = {visible: this.isAlive};
        Entities.editEntity(this.id, props);
    },
    toggleAlive: function(){
        this.isAlive = !this.isAlive;
    },
    saveState: function(){
        this.previousState = this.isAlive;
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
        this.neighborhood.forEach(function(neighbor){
            var cell = cellMap[neighbor];
            _this.neighborhoodStateArray.push(cell.isAlive);
        })
        this.neighborhoodStateArray.forEach(function(neighbor){
            if (neighbor) {
                _this.currentNeighborsAlive++;
            } else {
                _this.currentNeighborsDead++;
            }
        })
    },
    getNextState: function(){
        if (this.currentNeighborsDead >= NUMBER_DEAD_AROUND_TO_DIE) {
            this.nextState = 0;
        }
        if (this.currentNeighborsAlive >= NUMBER_ALIVE_AROUND_TO_LIVE) {
            this.nextState = 1;
        }
    },
    applyNextState: function(){
        this.saveState();
        this.isAlive = this.nextState;
        this.toggleVisible();
    }
};

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
            var cellPosition = Vec3.sum(position, {x: (CELL_DIMENSIONS + PADDING) * i, y: CELL_DIMENSIONS / 2, z: (CELL_DIMENSIONS + PADDING)* j});
            CELL_PROPS.name = "Cell: " + i + "-" + j;
            CELL_PROPS.position = cellPosition;
            var cellID = Entities.addEntity(CELL_PROPS);
            var newCell = new CELL_MAKER(cellID);
            var shouldBeOn = false;
            var randomOffset = Math.floor(Math.random() * NUMBER_OF_CELLS);
            if (currentCell === Math.floor(NUMBER_OF_CELLS / 2 - randomOffset)) {
                shouldBeOn = true;
            };
            newCell.isAlive = shouldBeOn;
            newCell.toggleVisible();
            currentCell++;
            cellGrid.push(newCell);
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

var GENEARTION_TIMER_INTERVAL_MS = 120;
function startAnimation(){
    nextGenerationTimer = Script.setInterval(nextGeneration, GENEARTION_TIMER_INTERVAL_MS)
}

function nextGeneration(){
    saveState();
    getNextState();
}

function getNextState(){
    populateNeighborhoodStateArray();
    cellGrid.forEach(function(cell){
        cell.getNextState();
    })
    cellGrid.forEach(function(cell){
        cell.applyNextState();
    })
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