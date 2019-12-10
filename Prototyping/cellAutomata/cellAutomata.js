
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
        margin = margin || CELL_DIMENSIONS / 2;
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
        limitsMax = limitsMax || {
            x: Number.NEGATIVE_INFINITY, 
            y: Number.NEGATIVE_INFINITY, 
            z: Number.NEGATIVE_INFINITY
        };
        limitsMin = limitsMin || {
            x: Number.POSITIVE_INFINITY, 
            y: Number.POSITIVE_INFINITY, 
            z: Number.POSITIVE_INFINITY
        };
        // log("vector", vector)
        // log("limitsMax", limitsMax)
        // log("limitsMin", limitsMin)

        vector.x = Math.min(vector.x, limitsMax.x);
        vector.x = Math.max(vector.x, limitsMin.x);
        vector.y = Math.min(vector.y, limitsMax.y);
        vector.y = Math.max(vector.y, limitsMin.y);
        vector.z = Math.min(vector.z, limitsMax.z);
        vector.z = Math.max(vector.z, limitsMin.z);
        // log('veclimit vector', vector);
        return vector;
    }

    function collectMinMax(position, padding){
        padding = 0;
        cellGridMinMaxObject.xMin = Math.min(cellGridMinMaxObject.xMin, position.x) - padding;
        cellGridMinMaxObject.xMax = Math.max(cellGridMinMaxObject.xMax, position.x) + padding;
        cellGridMinMaxObject.yMin = Math.min(cellGridMinMaxObject.yMin, position.y) - padding;
        cellGridMinMaxObject.yMax = Math.max(cellGridMinMaxObject.yMax, position.y) + padding;
        cellGridMinMaxObject.zMin = Math.min(cellGridMinMaxObject.zMin, position.z) - padding;
        cellGridMinMaxObject.zMax = Math.max(cellGridMinMaxObject.zMax, position.z) + padding;
    }

// Cell
    var PADDING = 0.9;

    var CELL_DIMENSIONS = 0.2;
    var triesBeforeNewTarget = 0;
    var MAX_TRIES_BEFORE_NEW_TARGET = 100;
    var targetCell = null;
    function maybeChooseNewRandomTarget(){
        if (triesBeforeNewTarget >= MAX_TRIES_BEFORE_NEW_TARGET) {
            var index = Math.floor(Math.random() * NUMBER_OF_CELLS);
            cellMap[targetCell].isTarget = false;
            cellGrid[index].makeTarget();
            triesBeforeNewTarget = 0;
        }
    }

    var DISTANCE_TO_STOP = CELL_DIMENSIONS / 2;
    var LIFE_STAGE_0_COLOR = [0,0,0];
    var LIFE_STAGE_1_COLOR = [20,75,5];
    var LIFE_STAGE_2_COLOR = [100,150,75];
    var LIFE_STAGE_3_COLOR = [175,200,125];
    var LIFE_STAGE_4_COLOR = [255,255,255];
    function CELL_MAKER(id){
        this.id = id;
        // this.lifeMeter = Math.round(Math.random());
        this.lifeMeter = LIFE_STAGE_4;
        // this.lifeMeter = Math.random();
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
        this.targetAnimation = null;
        this.position = {x: 0, y: 0, z: 0};
        this.velocity = {x: 0, y: 0, z: 0};
        this.acceleration = {x: 0.0, y: 0.1, z: 0.0};
        this.maxSpeed = 0.1;
        this.mass = 5;
        this.gravity = Vec3.multiply({x: 0, y: -9.8, z: 0}, 0.1 * this.mass)
        this.currentSlice = 1;
    }

    var WIND_FORCE = {x: 0.15, y: 0, z: 0.01}
    var FRICTION_CONSTANT = 0.01;
    var NORMAL_FORCE = 1;

    var LIFE_STAGE_0 = 0.30;
    var LIFE_STAGE_1 = 0.45;
    var LIFE_STAGE_2 = 0.65;
    var LIFE_STAGE_3 = 0.80;
    var LIFE_STAGE_4 = 1.00;
    var VISIBLE_AMOUNT_CAN_SEE = CELL_DIMENSIONS * 20;
    CELL_MAKER.prototype = {
        nearHittingNeighbors: function(){
            var _this = this;
            for (var i = 0; i < this.neighborhood.length; i++){
                var neighbor = cellMap[this.neighborhood[i]];
                if (neighbor) {
                    var vec3Distance = Vec3.distance(neighbor.position, _this.position);
                    if (vec3Distance < CELL_DIMENSIONS * 2) {
                        return true;
                    } 
                }
            }

            return false
        },
        updatePosition: function(){
            // Don't move if we are dead are at full life
            // if (this.lifeMeter <= LIFE_STAGE_0 || this.lifeMeter >= LIFE_STAGE_4) { return };
            this.position = Entities.getEntityProperties(this.id, "position").position;
            
            // move if we aren't the target
            if (!this.isTarget) {
                this.currentSlice = 1;

                // Get the direction of the target
                var targetPosition = Entities.getEntityProperties(targetCell, 'position').position;
                // Find the vector from the cell to the target
                var direction = Vec3.subtract(targetPosition, this.position);
                var distanceFromTarget = Vec3.distance(targetPosition, this.position);
                if (distanceFromTarget > VISIBLE_AMOUNT_CAN_SEE) {
                    return;
                }
                var adjustedDistanceFromTarget = distanceFromTarget - (CELL_DIMENSIONS);
                // log("adjustedDistanceFromTarget", adjustedDistanceFromTarget)
                if (adjustedDistanceFromTarget <= DISTANCE_TO_STOP) {
                    // log("returning too close")
                    return;
                }
                if (this.nearHittingNeighbors()) {
                    return;
                    // log("near hitting neighbords");
                }
                // Normalize the direction we are looking at
                var normalizedDirection = Vec3.normalize(direction);

                // Make a constant speed
                var speed = 0.1;
                // Get a new acceleration amount
                var scaledDirection = Vec3.multiply(normalizedDirection, speed);

                // Add the force with Mass
                //  var normalizedMassToDivide = 0.1 * this.mass;
                // Add the Mass
                // var newForce = Vec3.multiply(WIND_FORCE,normalizedMassToDivide)
                // scaledDirection = Vec3.sum(scaledDirection, newForce);
                // Get the magnitude of friction
                // var frictionMag = FRICTION_CONSTANT * NORMAL_FORCE;
                // Reverse direction of friction
                // var frictionDirection = Vec3.multiply(scaledDirection, -1);
                // normalize friction
                // frictionDirection = Vec3.normalize(frictionDirection);
                // Multiply the direction by the magnitude
                // var finalFriction = Vec3.multiply(frictionDirection, frictionMag);
                // Add friction to the force
                // scaledDirection = Vec3.sum(scaledDirection, finalFriction);
                // Add up the current velocity with the scaled acceleration
                this.velocity = setVecLimits(
                    // Vec3.sum(this.velocity, this.acceleration), 
                    Vec3.sum(this.velocity, scaledDirection),
                    {x: this.maxSpeed, y: this.maxSpeed, z: this.maxSpeed},
                    {x: -this.maxSpeed, y: -this.maxSpeed, z: -this.maxSpeed}
                );
                this.velocity = Vec3.sum(this.velocity, scaledDirection);
                // log("velocity", this.velocity);
                // log("checking isInside");
                if (this.isInside(liquid)) {
                    this.drag(liquid);
                }
                if (!checkIfIn(this.position, cellGridMinMaxObject)){
                    // log("not inside");
                    this.velocity = Vec3.multiply(this.velocity, -1);
                }
                this.velocity = setVecLimits(
                    // Vec3.sum(this.velocity, this.acceleration), 
                    this.velocity,
                    {x: this.maxSpeed, y: this.maxSpeed, z: this.maxSpeed},
                    {x: -this.maxSpeed, y: -this.maxSpeed, z: -this.maxSpeed}
                );
                // Add the velocity and the current position
                this.position = Vec3.sum(this.position, this.velocity);
                Entities.editEntity(this.id, {position: this.position});
                // this.velocity = Vec3.ZERO;
                // log("position", this.position);
            } else {
                var normal = Math.sin(this.currentSlice * SLICE_TIME);
                // log("normal", normal)
                // log("this.currentSlice", this.currentSlice)


                var adjustedVector = {
                    x: normal * Math.random(),
                    y: normal * Math.random(),
                    z: normal * Math.random()
                }
                // log("adjustedVector", adjustedVector)
                var scaledVector = Vec3.multiply(adjustedVector, CELL_DIMENSIONS * 1)                
                var newPosition = Vec3.sum(scaledVector, this.position);
                // log("newPosition:", newPosition);
                Entities.editEntity(this.id, {position: newPosition});
                this.currentSlice++;
                if (!checkIfIn(this.position, cellGridMinMaxObject)){
                    // log("not inside");
                    this.velocity = Vec3.multiply(this.velocity, -1);
                }
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
                neighbor = cellMap[neighbor];
                if (!neighbor) {
                    // console.log("neighbor", neighbor);
                    return; 
                }
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

    var SLICES = 30;
    var SLICE_TIME = (Math.PI * 2) / SLICES;
    var currentSlice = 0;
    function targetAnimationHandler(){
        var normal = Math.sin(currentSlice * SLICE_TIME);
        var adjustedVector = {
            x: normal * Math.random(),
            y: normal * Math.random(),
            z: normal * Math.random()
        }
        Math.pie = CELL_DIMENSIONS * 2;
        var cell = cellMap[targetCell];
        var newPosition = cell.position
    }
    var TARGET_ANIMATION_INTERVAL_MS = 100;

    function targetAnimationStart(){
        Script.setInterval(_this.targetAnimationHandler, TARGET_ANIMATION_INTERVAL_MS);
    }
    function maybeTurnOffTargetAnimation(){
        if (_this.targetAnimation) {
            Script.clearInterval(_this.targetAnimation);
            _this.targetAnimation = null;
        }
    }
// Controls
    var CELL_PROPS = {
        type: "Box",
        dimensions: {x: CELL_DIMENSIONS, y: CELL_DIMENSIONS, z: CELL_DIMENSIONS},
        registrationPoint: {x: 0.5, y: 0.5, z: 0.5}
    }

    var cellGrid = [];
    var currentCell = 0;
    var position = {x: 0, y: 0, z: 0};
    var GRID_X = 5;
    var GRID_Y = 5;
    var GRID_Z = 5;
    var NUMBER_OF_CELLS = GRID_X * GRID_Z; 
    var DIMENSION_MARGIN = PADDING * 1.0;
    // var DIMENSION_MARGIN = PADDING * 0.25;
    var cellGridMinMaxObject = {
        xMin: Number.POSITIVE_INFINITY,
        yMin: Number.POSITIVE_INFINITY,
        zMin: Number.POSITIVE_INFINITY,
        xMax: Number.NEGATIVE_INFINITY,
        yMax: Number.NEGATIVE_INFINITY,
        zMax: Number.NEGATIVE_INFINITY
    }
    var gridBox;
    function makeCells(){
        for (var i = 1; i <= GRID_X; i++) {
            for (var j = 1; j <= GRID_Z; j++) {
                for (var k = 1; k <= GRID_Y; k++) {
                    // if (currentCell > 1) break;
                    var cellPosition = Vec3.sum(position, {x: (CELL_DIMENSIONS + PADDING) * i, y: (CELL_DIMENSIONS + PADDING) * k, z: (CELL_DIMENSIONS + PADDING)* j});
                    collectMinMax(cellPosition, CELL_DIMENSIONS * 0.5);
                    CELL_PROPS.name = "Cell: " + i + "-" + j + "-" + k;
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
        // log("cellGridMinMAx", cellGridMinMaxObject)
        // var props = {
        //     type: "Box",
        //     name: "Cell_bounds",
        //     alpha: 0.3,
        //     color: [50,75,190],
        //     position: getGridMiddle(),
        //     dimensions: getGridDimensions()
        // }
        // gridBox = Entities.addEntity(props);
    }

    var cellMap = {};
    function makeCellMap(){
        cellGrid.forEach(function(cell){
            cellMap[cell.id] = cell;
        })
        // log("Make cell map", cellMap);
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
        // animateParticle();
        maybeChooseNewRandomTarget();
    }

    function previousGeneration(){
        //
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
        Script.scriptEnding.connect(tearDown);
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

// Liquid
    function getGridMiddle(){
        // log("cellGridMinMaxObject22", cellGridMinMaxObject);
        var gridPosition = {
            x: (cellGridMinMaxObject.xMax - cellGridMinMaxObject.xMin) / 2 + cellGridMinMaxObject.xMin,
            y: (cellGridMinMaxObject.yMax - cellGridMinMaxObject.yMin) / 2 + cellGridMinMaxObject.yMin,
            z: (cellGridMinMaxObject.zMax - cellGridMinMaxObject.zMin) / 2 + cellGridMinMaxObject.zMin,
        }
        // log("gridPosition", gridPosition);
        return gridPosition;
    }
    function getGridDimensions(){
        // log("cellGridMinMaxObject22", cellGridMinMaxObject);
        // log("DIMENSIONS_MARGIN", DIMENSION_MARGIN);
        var gridDimensions = {
            x: (cellGridMinMaxObject.xMax - cellGridMinMaxObject.xMin) + DIMENSION_MARGIN,
            y: (cellGridMinMaxObject.yMax - cellGridMinMaxObject.yMin) + DIMENSION_MARGIN,
            z: (cellGridMinMaxObject.zMax - cellGridMinMaxObject.zMin) + DIMENSION_MARGIN,
        }
        // log("gridDimensions", gridDimensions)
        return gridDimensions;
    }
    function Liquid(position, dimensions, dragCoefficient){
        this.position = position;
        this.dimensions = dimensions;
        this.dragCoefficient = dragCoefficient;
    }

    var LIQUID_POSITION = getGridMiddle();
    // log("liquidPosition", LIQUID_POSITION);
    var LIQUID_DIMENSIONS_SCALER = 1.5;
    var LIQUID_DIMENSIONS = {
        x: CELL_DIMENSIONS * LIQUID_DIMENSIONS_SCALER, 
        y: CELL_DIMENSIONS * LIQUID_DIMENSIONS_SCALER, 
        z: CELL_DIMENSIONS * LIQUID_DIMENSIONS_SCALER
    };
    var testBox;
    testBox = Entities.addEntity({
        type: "Box",
        dimensions: LIQUID_DIMENSIONS,
        position: LIQUID_POSITION,
        color: [0,255,0],
        alpha: 0.8,
        collisionless: true
    })
    DRAG_COEFFICIENT = 10;
    var liquid = new Liquid(LIQUID_POSITION, LIQUID_DIMENSIONS, DRAG_COEFFICIENT);

    function tearDown(){
        cellGrid.forEach(function(cell){
            Entities.deleteEntity(cell.id)
        })
        if (testBox) {
            Entities.deleteEntity(testBox);
        }
        if (gridBox) {
            Entities.deleteEntity(gridBox);
        }
        maybeClearNextGenerationTimer();
        Controller.keyPressEvent.disconnect(keyPressHandler);
    }