(function () {
    var EVENT_BRIDGE_OPEN_MESSAGE = "eventBridgeOpen",
        BUTTON_NAME = "OWL-TALK",
        UPDATE_UI = BUTTON_NAME + "_update_ui",
        SAVE_JSON = "saveJSON",
        EVENTBRIDGE_SETUP_DELAY = 200,
        // connection = new WebSocket('ws://tan-cheetah.glitch.me/'),
        SEND_MESSAGE = BUTTON_NAME + "SEND_MESSAGE",
        TOGGLE_DISPLAY_NAMES = "toggleDisplayNames";

    // connection.onopen = function () {
    //     console.log("on open");
    //     // connection is opened and ready to use
    // };

    // connection.onerror = function (error) {
    //     // an error occurred when sending/receiving data
    // };

    // connection.onmessage = function (message) {
    //     try {
    //         var json = JSON.parse(message.data);
    //       } catch (e) {
    //         console.log('Invalid JSON: ', message.data);
    //         return;
    //       }
    //       app.settings.history = json.data;
    //     // handle incoming message
    // };

    Vue.component('chat', {
        props: ["history", "username", "showdisplaynames"],
        methods: {
            toggleDisplayNames: function () {

                EventBridge.emitWebEvent(JSON.stringify({
                    type: TOGGLE_DISPLAY_NAMES
                }));

            }
        },
        computed: {
            formatedMessage() {
                console.log("FORMATTED MESSAGES")
                var newMessage = JSON.stringify(this.message)
                    .replace(/\\n/g, "<br>")
                    .replace(/\"/g, "")
                    .replace(/\\t/g, "    ")
                    .split(",").join("<br>\   ")
                    .split("{").join("")
                    .split("}").join("<br>").replace(/"/g, "");
                return newMessage;
            },
            renderName() {
                return this.showdisplaynames ? "displayName" : "username";
            }
        },
        template: `
            <div class="card">
                <button class="btn-sm mt-2 mr-2" v-bind:class="{ 'btn-primary': !showdisplaynames, 'btn-warning': showdisplaynames }" v-on:click="toggleDisplayNames()">Toggle Display Names</button>
                <div class="card-body">
                    <div v-for="item in history">
                        {{ item.author[renderName] }} :: {{ item.text }}
                    </div>
                </div>
            </div>
        `
    })

    Vue.component('usernamelist', {
        props: ["users", "showdisplaynames"],
        methods: {

        },
        // computed: {
        //     formatedMessage() {
        //         console.log("FORMATTED MESSAGES")
        //         var newMessage = JSON.stringify(this.message)
        //             .replace(/\\n/g, "<br>")
        //             .replace(/\"/g, "")
        //             .replace(/\\t/g, "    ")
        //             .split(",").join("<br>\   ")
        //             .split("{").join("")
        //             .split("}").join("<br>").replace(/"/g, "");
        //         return newMessage;
        //     }
        // },
        template: `
            <div class="card">
                <div class="card-header">
                    Connected Users:
                </div>
                <div v-for="username in users">
                    <p>{{ username }}</p>
                </div>
            </div>
        `
    })

    Vue.component('input-text', {
        props: ["users", "showdisplaynames"],
        data: function(){
            return {
                input_text: "",
                checkedNames: []
            }
        },
        methods: {
            sendInput: function(text) {
                console.log("sendInput", text);

                if (text.length === 0) {
                    return;
                }

                var users = this.users;

                var toList = this.checkedNames.filter(function (username) {
                    return users.indexOf(username) !== -1;
                });

                this.checkedNames = toList;

                console.log("sendInput", text);
                
                var message = {
                    author: this.$parent.settings.me,
                    message: this.input_text,
                    to: this.checkedNames
                }

                EventBridge.emitWebEvent(JSON.stringify({
                    type: SEND_MESSAGE,
                    info: JSON.stringify(message),
                    text: this.input_text
                }));
    
                this.input_text = "";
            }
        },
        computed: {
            connectedUsers: function() {
                // for name in names

                var nameToShow = this.showdisplaynames ? "displayName" : "username";
                
                return this.users.map(function(user) {
                    user.nameToShow = user[nameToShow];
                    return user;
                });

            }
        },
        template: `
            <div class="pt-2">
                <input id="input" type="text" maxlength="40" class="form-control" v-model="input_text"  @keyup.enter="sendInput(input_text)" />
                <button class="btn-sm btn-primary mt-2 mr-2" v-on:click="sendInput(input_text)">Send Chat</button>
                <div class="pt-2">

                    <div class="card">

                        <div class="card-header">
                            Connected Users:
                        </div>
                        <div class="card-body">
                            <div v-for="user in connectedUsers">
                                <input type="checkbox" :id="user.username" :value="user.username" v-model="checkedNames">
                                <label :for="user.username">{{ user.nameToShow }}</label>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        `
    })

    var app = new Vue({
        el: '#app',
        data: {
            settings: {
                me: { username: "UN_me", displayName: "DN_me"},
                showDisplayNames: true,
                history: [
                    {to: [], author: "UN_cat", message: "test"}, 
                    {to: [], author: "UN_cat", message: "test2"} 
                ],
                connectedUsers: [
                    {username: "UN_hello", displayName: "DN_robin"}, 
                    {username: "UN_cat", displayName: "DN_cat"}, 
                    {username: "UN_dog", displayName: "DN_dog"}, 
                ]
            }
        }
    });

    function onScriptEventReceived(message) {
        console.log(message);
        var data;
        try {
            data = JSON.parse(message);
            switch (data.type) {
                case UPDATE_UI:
                    app.settings = data.value;
                    break;
                // case SAVE_JSON:
                //     saveJSON(data.value);
                //     break;
                default:
                    break;
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
