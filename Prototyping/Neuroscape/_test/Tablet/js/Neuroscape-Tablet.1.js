(function() {

    "use strict";
    
    var EVENT_BRIDGE_OPEN_MESSAGE = "eventBridgeOpen",
        UPDATE_UI = "update_ui",
        SAVE_JSON = "saveJSON",
        UPDATE_PLAYER_NAME = "update_player_name",
        RESTART_GAME = "restart_game",
        STOP_GAME = "stop_game",
        EVENTBRIDGE_SETUP_DELAY = 50,
        username;

    Vue.component('instructions', {
        template:`
            <div class="card">
                <div class="card-body">
                    <p>To interact with the game, grab the drum sticks and hit the drum pad with the spherical drumstick hit.  
                        You will be presented with 27 levels where you must hit the drum pad to the beat. The different levels are a combination of the following configurations:</p>
                    <p>
                        Speed:
                        <ul>
                        <li>Slow</li>
                        <li>Medium</li>
                        <li>Fast</li>
                        </ul>
                    </p>
                    <p>
                        Audio-Visual Cues indicating where the beat is: 
                        <ul>
                        <li>Audio</li>
                        <li>Video</li>
                        <li>AudioVideo</li>
                        </ul>
                    </p>
                    <p>
                        Game Type:
                        <ul>
                        <li>On - Hit the pad on the beat when the ball hits the edge of a wall</li>
                        <li>Off - Hit the pad on syncopated eight note off beat when the ball is in the middle</li>
                        <li>Continuous - First listen to the beat with a cue, and then play it back without the cue where you think the ball hit a wall</li>
                        </ul>
                    </p>
                </div>
            </div>
        `
    })

    Vue.component('restart-game', {
        methods: {
            restartGame(){
                EventBridge.emitWebEvent(JSON.stringify({
                    type: RESTART_GAME
                    // username: username
                }));
            }
        },
        template:`
            <div class="card">
                <div class="card-body">
                    <button class="btn-sm btn-primary mt-1 mr-1" v-on:click="restartGame()">Restart Game</button>
                </div>
            </div>
        `
    })

    Vue.component('stop-game', {
        methods: {
            stopGame(){
                EventBridge.emitWebEvent(JSON.stringify({
                    type: STOP_GAME
                    // username: username
                }));
            }
        },
        template:`
            <div class="card">
                <div class="card-body">
                    <button class="btn-sm btn-primary mt-1 mr-1" v-on:click="stopGame()">Stop Game</button>
                </div>
            </div>
        `
    })

    Vue.component('enter-player-name', {
        data: function(){
            return {
                newPlayerName: "",
                editing: false,
                editingJSONURL: false,
            }
        },
        methods: {
            updateName(name){
                this.editing = false;
                EventBridge.emitWebEvent(JSON.stringify({
                    type: UPDATE_PLAYER_NAME,
                    value: name
                    // username: username
                }));
                this.newPlayerName = "";
            }
        },
        template:`
            <div class="card">
                <div class="card-body">
                        Please Enter Your Name
                        <input id="enter-player-name" type="text" class="form-control" v-model="newPlayerName">
                        <button class="btn-sm btn-primary mt-1 mr-1" v-on:click="updateName(newPlayerName)">Save Player Name</button>
                </div>
            </div>
        `
    })

    Vue.component('show-message', {
        props: ["message"],
        methods: {
            updateName(name){
                this.editing = false;
                EventBridge.emitWebEvent(JSON.stringify({
                    type: UPDATE_PLAYER_NAME,
                    value: name
                    // username: username
                }));
                this.newPlayerName = "";
            }
        },
        computed: {
            formatedMessage() {
                var newMessage = JSON.stringify(this.message)
                .replace(/\\n/g, "<br>")
                .replace(/\"/g, "")
                .replace(/\\t/g, "    ")
                .split(",").join("<br>\   ")
                .split("{").join("")
                .split("}").join("<br>").replace(/"/g,"");
                return newMessage;
            }
        },
        template:`
            <div class="card">
                <div class="card-body" v-html="formatedMessage">
                        {{formatedMessage}}
                </div>
            </div>
        `
    })

    var app = new Vue({
        el: '#app',
        data: {
            settings: {
                playerName: "",
                gameRunning: false,
                message: null,
                gameData: null,
                ui: {
                    enterPlayerName: true,
                    showMessage: true,
                    gameRunning: false,
                    gameEnding: false
                }
            }
        }
    });

    var test = {
        array: {
            test: [],
            test: ["1", 2]
        }
    }

    function removeEmpty(obj) {
        Object.keys(obj).forEach(function(key) {
            (obj[key] && Array.isArray(obj[key])) && obj[key].forEach(function(item){removeEmpty(item)}) ||
            (obj[key] && typeof obj[key] === 'object') && removeEmpty(obj[key]) ||
            (obj[key] === '' || obj[key] === null || obj[key].length === 0) && delete obj[key]
        });
        return obj;
    };

    function saveJSON(gameData){
        var gameDataBase = Object.assign({}, gameData),
            levels = gameDataBase.levels,
            POST_URL = "https://neuroscape.glitch.me/json/";

            var jqxhr = $.post(POST_URL, gameData, function(data){
                console.log("### POST TEST: Data Returned: " + data)
            })
                .done(function(data, textStatus){
                    console.log("### POST TEST: finished on success")
                    console.log("### POST TEST: finished on success - data: " + data)
                    console.log("### POST TEST: finished on success - textStatus: " + textStatus)

                })
                .fail(function(data, textStatus){
                    console.log("### POST TEST: finished on FAIL")
                    console.log("### POST TEST: finished on fail - data: " + data)
                    console.log("### POST TEST: finished on fail - textStatus: " + textStatus)
                })
            
        // if (levels.length < 3) {
        //     $.post(POST_URL, gameData);
        // } else {
        //     var splitAmount = Math.ceil(levels.length / 4),
        //         levels_part1 = levels.slice(0, splitAmount),
        //         levels_part2 = levels.slice(splitAmount, splitAmount * 2),
        //         levels_part3 = levels.slice(splitAmount * 2, splitAmount * 3),
        //         levels_part4 = levels.slice(splitAmount * 3, levels.length - 1),
        //         gameData_part1 = Object.assign({}, gameData, {playerName: gameData.playerName + "_" + "part1", part: 1, levelsData: levels_part1}),
        //         gameData_part2 = Object.assign({}, gameData, {playerName: gameData.playerName + "_" + "part2", part: 2, levelsData: levels_part2}),
        //         gameData_part3 = Object.assign({}, gameData, {playerName: gameData.playerName + "_" + "part3", part: 3, levelsData: levels_part3});
        //         gameData_part4 = Object.assign({}, gameData, {playerName: gameData.playerName + "_" + "part4", part: 4, levelsData: levels_part4});
            
        //     $.post(POST_URL, gameData_part1);
        //     $.post(POST_URL, gameData_part2);
        //     $.post(POST_URL, gameData_part3);
        //     $.post(POST_URL, gameData_part4);

        // }
        
    }

    function onScriptEventReceived(message) {
        var data;
        try {
            data = JSON.parse(message);
            switch (data.type) {
                case UPDATE_UI:
                    app.settings = data.value;
                    break;
                case SAVE_JSON:
                    saveJSON(data.value);
                    break;
                default:
            }
        } catch (e) {
            console.log(e)
            return;
        }
    }
    
    function onLoad() {
        
        // Initial button active state is communicated via URL parameter.
        // isActive = location.search.replace("?active=", "") === "true";

        setTimeout(function () {
            // Open the EventBridge to communicate with the main script.
            // Allow time for EventBridge to become ready.
            EventBridge.scriptEventReceived.connect(onScriptEventReceived);
            EventBridge.emitWebEvent(JSON.stringify({
                type: EVENT_BRIDGE_OPEN_MESSAGE
            }));
        }, EVENTBRIDGE_SETUP_DELAY);
    }

    onLoad();

}());
