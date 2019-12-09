
/* NOTES
    Direction = Object1Vec - Object2Vec
    Normalize Distance
    Scale Distance
    Acceleration = scaledDistance

    velocity.add(acceleration)
    location.add(velocity)

    Force = Mass * Acceleration
    Force / Mass = Acceleration

    Friction = 
        -1(the opposite direction of velocity) * 
        mew(The friction coefficient dependent on surface ) * 
        NoramlizedDirectionOfVelocity *
        NormalForce (Force perpindicular to the object's motion along a surface)

    NormalForce = Newton's 3rd law of every action has opposite action. EX.  Gravity pushing down, road pushing up

    body passing through liquid or gas = viscous force || drag force || fluid resistance
    F(d)(drag force) = 
        -0.5 Constant (opposite direction of velocity) <-- constants will change
        * rho (density of the liquid) (make constant)
        * v^2 Speed of the object moving - The magnitude of the velocity vector - v * v
        * A - the frontal area of the object pushing through liquid - constant here
        * C(d) - coefficient of drag - Changes depending on if drag force is strong or weak
        * velocity unit vector
    Simplified -
        speed ^ 2
        * Coefficient of drag
    c = 0.1
    speed = length(velocity)
    dragMagnitude = c * speed * speed
    velocity = velocity * -1
    normalize(velocity)
    * dragMagnitude

    -> Applies force
*/


// Helper Functions
    var DEBUG = true;
    function log(){
        var args = Array.prototype.slice.call(arguments);
        // var type = args[args.length - 1];
        // var nonArgs = args.slice(0, args.length - 1);
        // var debug = DEBUG || true;
        // if (!debug) {
        //     if (type !== "ON") {
        //         return;
        //     }
        // } else {
        //     if (type === "OFF") {
        //         return;
        //     }
        // }
        var string = [];
        args.forEach(function (data) {
            data = typeof data === "string" ? data : "\n" + JSON.stringify(data, null, 2);
            string.push(data);
        });
        console.log("***********\n" + string.join(" | "));
    }
    function deleteCurrentCellEntities(){
        Entities.findEntities(MyAvatar.position, 20000).forEach(function(cell){
            var props = Entities.getEntityProperties(cell);
            if (props.name.indexOf("Cell") > -1){
                Entities.deleteEntity(cell);
            }
        });
    }

    function checkIfIn(currentPosition, minMaxObj, margin) {
        margin = margin || 0.05;
        // log("currentPosition", currentPosition);
        // log("minMaxObj", minMaxObj);
        return (
            (currentPosition.x >= minMaxObj.xMin - margin && currentPosition.x <= minMaxObj.xMax + margin) &&
            (currentPosition.y >= minMaxObj.yMin - margin && currentPosition.y <= minMaxObj.yMax + margin) &&
            (currentPosition.z >= minMaxObj.zMin - margin && currentPosition.z <= minMaxObj.zMax + margin)
        );
    }

    // Check if a point is in a non axis aligned space
    function checkIfInNonAligned(pointToCheck, position, orientation, minMaxObj, margin) {
        var worldOffset = VEC3.subtract(pointToCheck, position),
        pointToCheck = VEC3.multiplyQbyV(QUAT.inverse(orientation), worldOffset);
        margin = margin || 0.03;

        return (
            (pointToCheck.x >= minMaxObj.xMin - margin && pointToCheck.x <= minMaxObj.xMax + margin) &&
            (pointToCheck.y >= minMaxObj.yMin - margin && pointToCheck.y <= minMaxObj.yMax + margin) &&
            (pointToCheck.z >= minMaxObj.zMin - margin && pointToCheck.z <= minMaxObj.zMax + margin)
        );
    }

    function lerp(inMin, inMax, outMin, outMax, value){
        var position = (value - inMin) % (inMax - inMin);
        var lerpedValue = (outMax - outMin) * position;
        return lerpedValue;
    }

    function setVecLimits(vector, limitsMax, limitsMin){
        limitsMax = limitsMax || {x: 0, y: 0, z: 0};
        limitsMin = limitsMin || {x: 0.0, y: 0.0, z: 0.0};
        vector.x = Math.min(vector.x, limitsMax.x);
        vector.x = Math.max(vector.x, limitsMin.x);
        vector.y = Math.min(vector.y, limitsMax.y);
        vector.y = Math.max(vector.y, limitsMin.y);
        vector.z = Math.min(vector.z, limitsMax.z);
        vector.z = Math.max(vector.z, limitsMin.z);
        return vector;
    }

    function collectMinMax(position){
        minMaxObject.x = Math.min(minMaxObject.x, position.x);
        minMaxObject.x = Math.max(minMaxObject.x, position.x);
        minMaxObject.x = Math.min(minMaxObject.x, position.x);
        maxMaxObject.x = Math.max(maxMaxObject.x, position.x);
        maxMaxObject.z = Math.max(maxMaxObject.z, position.z);
        maxMaxObject.z = Math.max(maxMaxObject.z, position.z);
    }

// Cell
    var CELL_DIMENSIONS = 0.05;
    var triesBeforeNewTarget = 0;
    var MAX_TRIES_BEFORE_NEW_TARGET = 20;
    var targetCell = null;
    function maybeChooseNewRandomTarget(){
        if (triesBeforeNewTarget >= MAX_TRIES_BEFORE_NEW_TARGET) {
            var index = Math.floor(Math.random() * NUMBER_OF_CELLS);
            cellMap[targetCell].isTarget = false;
            cellGrid[index].makeTarget();
            triesBeforeNewTarget = 0;
        }
    }

    var DISTANCE_TO_STOP = PADDING / 2;
    var LIFE_STAGE_0_COLOR = [0,0,0];
    var LIFE_STAGE_1_COLOR = [20,75,5];
    var LIFE_STAGE_2_COLOR = [100,150,75];
    var LIFE_STAGE_3_COLOR = [175,200,125];
    var LIFE_STAGE_4_COLOR = [255,255,255];
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
        this.mass = 5;
        this.gravity = Vec3.multiply({x: 0, y: -9.8, z: 0}, 0.1 * this.mass)
    }

    var WIND_FORCE = {x: 0.15, y: 0, z: 0.01}
    var FRICTION_CONSTANT = 0.01;
    var NORMAL_FORCE = 1;

    var LIFE_STAGE_0 = 0.30;
    var LIFE_STAGE_1 = 0.45;
    var LIFE_STAGE_2 = 0.65;
    var LIFE_STAGE_3 = 0.80;
    var LIFE_STAGE_4 = 1.00;

    CELL_MAKER.prototype = {
        updatePosition: function(){
            // Don't move if we are dead are at full life
            // if (this.lifeMeter <= LIFE_STAGE_0 || this.lifeMeter >= LIFE_STAGE_4) { return };
            this.position = Entities.getEntityProperties(this.id, "position").position;
            
            // move if we aren't the target
            if (!this.isTarget) {
                // Get the direction of the target
                var targetPosition = Entities.getEntityProperties(targetCell, 'position').position;
                // Find the vector from the cell to the target
                var direction = Vec3.subtract(targetPosition, this.position);
                if (Vec3.distance(targetPosition, direction) <= DISTANCE_TO_STOP ) {
                    return;
                }
                // Normalize the direction we are looking at
                var normalizedDirection = Vec3.normalize(direction);
                // Make a constant speed
                var speed = 0.21;
                // Get a new acceleration amount
                var scaledDirection = Vec3.multiply(normalizedDirection, speed);
                // Add the force with Mass
                var normalizedMassToDivide = 0.1 * this.mass;
                // Add the Mass
                var newForce = Vec3.multiply(WIND_FORCE,normalizedMassToDivide)
                scaledDirection = Vec3.sum(scaledDirection, newForce);
                // Get the magnitude of friction
                var frictionMag = FRICTION_CONSTANT * NORMAL_FORCE;
                // Reverse direction of friction
                var frictionDirection = Vec3.multiply(scaledDirection, -1);
                // normalize friction
                frictionDirection = Vec3.normalize(frictionDirection);
                // Multiply the direction by the magnitude
                var finalFriction = Vec3.multiply(frictionDirection, frictionMag);
                // Add friction to the force
                scaledDirection = Vec3.sum(scaledDirection, finalFriction);
                // Add up the current velocity with the scaled acceleration
                this.velocity = setVecLimits(
                    // Vec3.sum(this.velocity, this.acceleration), 
                    Vec3.sum(this.velocity, scaledDirection), 
                    {x: this.maxSpeed, y: this.maxSpeed, z: this.maxSpeed}
                );
                // log("checking isInside");
                if (this.isInside(liquid)) {
                    this.drag(liquid);
                }
                // Add the velocity and the current position
                this.position = Vec3.sum(this.position, this.velocity);
                Entities.editEntity(this.id, {position: this.position});
                this.velocity = Vec3.ZERO;
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
            this.neighborhood.forEach(function(neighbor){
                // console.log("neighbor", neighbor);
                neighbor = cellMap[neighbor];
                // console.log("life meter", neighbor.lifeMeter);
                _this.neighborhoodStateArray.push(neighbor.lifeMeter);
            })
            this.neighborhoodStateArray.forEach(function(neighbor){
                if (neighbor > LIFE_STAGE_0) {
                    _this.currentNeighborsAlive++;
                } else {
                    _this.currentNeighborsDead++;
                }
            })
        },
        getNextState: function(){
            this.history.push(this.lifeMeter);
            this.generation++;
            if (this.lifeMeter >= LIFE_STAGE_0 && (this.currentNeighborsAlive >= NEIGHBORS_GREATER_THAN_BEFORE_DYING || this.currentNeighborsAlive <= NEIGHBORS_LESS_THAN_BEFORE_DYING)) {
                this.lifeMeter = this.lifeMeter - LIFE_CHANGE;
            } else if (this.lifeMeter <= LIFE_STAGE_4 && (this.currentNeighborsAlive > NEIGHBORS_LESS_THAN_BEFORE_DYING && this.currentNeighborsAlive < NEIGHBORS_GREATER_THAN_BEFORE_DYING)) {
                this.lifeMeter = this.lifeMeter + LIFE_CHANGE
            }
            // this.getAdjustedLifeMeter();
            // this.nextState = this.lifeMeter;
            this.nextState = LIFE_STAGE_4;
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
        },
        isInside: function(liquid){
            var currentPosition = Entities.getEntityProperties(this.id, 'position').position
            // log(liquid);
            var dimensionsX = liquid.dimensions.x;
            var dimensionsY = liquid.dimensions.y;
            var dimensionsZ = liquid.dimensions.z;
            var positionX = liquid.position.x;
            var positionY = liquid.position.y;
            var positionZ = liquid.position.z;
            var minMaxObject = {
                xMin: positionX - dimensionsX,
                yMin: positionY - dimensionsY,
                zMin: positionZ - dimensionsZ,
                xMax: positionX + dimensionsX,
                yMax: positionY + dimensionsY,
                zMax: positionZ + dimensionsZ
            }
            // log(minMaxObject);
            return checkIfIn(currentPosition, minMaxObject);
        }, 
        drag: function(liquid){
            var speed = Vec3.length(this.velocity);
            var dragMagnitude = liquid.dragCoefficient * speed * speed; 
            var direction = Vec3.multiply(this.velocity, -1);
            var normalizedDirection = Vec3.normalize(direction);
            var finalDrag = Vec3.multiply(normalizedDirection, dragMagnitude);
            this.velocity = Vec3.sum(this.velocity, finalDrag);
        }
    };
    var LIFE_CHANGE = 0.15;
    var NEIGHBORS_LESS_THAN_BEFORE_DYING = 1;
    var NEIGHBORS_TO_BE_ALIVE = 3;
    var NEIGHBORS_GREATER_THAN_BEFORE_DYING = 10;

// Liquid
    function Liquid(position, dimensions, dragCoefficient){
        this.position = position;
        this.dimensions = dimensions;
        this.dragCoefficient = dragCoefficient;
    }

    var LIQUID_POSITION = {x: 0, y: 0, z: 0};
    var LIQUID_DIMENSIONS_SCALER = 100;
    var LIQUID_DIMENSIONS = {
        x: CELL_DIMENSIONS * LIQUID_DIMENSIONS_SCALER, 
        y: CELL_DIMENSIONS * LIQUID_DIMENSIONS_SCALER, 
        z: CELL_DIMENSIONS * LIQUID_DIMENSIONS_SCALER
    };

    DRAG_COEFFICIENT = 0.5;
    var liquid = new Liquid(LIQUID_POSITION, LIQUID_DIMENSIONS, DRAG_COEFFICIENT);

// Controls
    var CELL_PROPS = {
        type: "Box",
        dimensions: {x: CELL_DIMENSIONS, y: CELL_DIMENSIONS, z: CELL_DIMENSIONS},
        registrationPoint: {x: 0.5, y: 0.5, z: 0.5}
    }

    var cellGrid = [];
    var currentCell = 0;
    var position = {x: 0, y: 0, z: 0};
    var GRID_X = 3;
    var GRID_Y = 3;
    var GRID_Z = 3;
    var NUMBER_OF_CELLS = GRID_X * GRID_Z; 
    var PADDING = 2.35;
    var minMaxObject = {
        xMin: Number.POSITIVE_INFINITY,
        yMin: Number.POSITIVE_INFINITY,
        zMin: Number.POSITIVE_INFINITY,
        xMax: Number.NEGATIVE_INFINITY,
        yMax: Number.NEGATIVE_INFINITY,
        zMax: Number.NEGATIVE_INFINITY
    }
    function makeCells(){
        for (var i = 1; i <= GRID_X; i++) {
            for (var j = 1; j <= GRID_Z; j++) {
                for (var k = 1; k <= GRID_Y; k++) {
                    // if (currentCell > 1) break;
                    var cellPosition = Vec3.sum(position, {x: (CELL_DIMENSIONS + PADDING) * i, y: (CELL_DIMENSIONS + PADDING) * k, z: (CELL_DIMENSIONS + PADDING)* j});
                    CELL_PROPS.name = "Cell: " + i + "-" + j;
                    CELL_PROPS.position = cellPosition;
                    CELL_PROPS.collisionless = true;
                    CELL_PROPS.dynamic = false;
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

    var cellMap = {};
    function makeCellMap(){
        cellGrid.forEach(function(cell){
            cellMap[cell.id] = cell;
        })
    };


    function saveState(){
        cellGrid.forEach(function(cell){
            cell.saveState();
        })
    }

    function getAllNeighbors(){
        cellGrid.forEach(function(cell){
            cell.getNeighbors();
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

    var nextGenerationTimer = null;
    function maybeClearNextGenerationTimer(){
        if (nextGenerationTimer) {
            Script.clearTimeout(nextGenerationTimer);
            nextGenerationTimer = null;
        }
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


    var worldSum = 0;
    function getNextState(){
        getAllNeighbors();
        worldSum = 0;
        populateNeighborhoodStateArray();
        cellGrid.forEach(function(cell){
            cell.getNextState();
        })
        cellGrid.forEach(function(cell, i){
            var RANDOM_MODULUS = Math.floor(Math.random() * NUMBER_OF_CELLS);
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


// Particle
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



// Event Handlers
    function keyPressHandler(event) {
        if (event.text === "m") {
            nextGeneration();
        };
        if (event.text === "n") {

        };
    }


// Startup
    function startup(){
        Script.scriptEnding.connect(function(){
            cellGrid.forEach(function(cell){
                Entities.deleteEntity(cell.id);
            })
            maybeClearNextGenerationTimer();
            Controller.keyPressEvent.disconnect(keyPressHandler);
        })
        Controller.keyPressEvent.connect(keyPressHandler);
        deleteCurrentCellEntities();
        makeCells();
        makeCellMap();
        getAllNeighbors();
        saveState();
        populateNeighborhoodStateArray();
        startAnimation();
    }

    startup();