(function() {

    "use strict";

    // Consts
    // /////////////////////////////////////////////////////////////////////////
        var 
            BUTTON_NAME = "BUTTON_NAME", // !important update in Example.js as well, MUST match Example.js
            EVENT_BRIDGE_OPEN_MESSAGE = BUTTON_NAME + "eventBridgeOpen",
            UPDATE_UI = BUTTON_NAME + "_update_ui",
            
            EVENTBRIDGE_SETUP_DELAY = 200
        ;

    // Components
    // /////////////////////////////////////////////////////////////////////////

        Vue.component('config', {
            props: ["current_animation", "animations"],
            data: function(){
                return {
                    newName: "",
                    editing: false,
                    editingJSONURL: false,
                    selectedAnimation: ""
                }
            },
            methods: {
                editName(name){
                    this.editing = true;
                },
                updateName(name){
                    this.editing = false;
                    EventBridge.emitWebEvent(JSON.stringify({
                        type: UPDATE_ANIMATION_NAME,
                        value: {
                            newName: name,
                            animation: this.current_animation
                        }
                    }));
                    this.newName = "";
                },
                selectAnimation(animation){
                    this.selectedAnimation = animation;
                }
            },
            template: /*html*/`
                <div class="card">
                    <div class="card-header">
                    <strong>Animation Name: {{current_animation}}</strong> 
                    <button class="btn-sm btn-primary mt-1 mr-1 float-right" v-if="!editing" v-on:click="editName()">Edit Name</button> 
                        <div v-if="editing">
                            <input id="new-name" type="text" class="form-control" v-model="newName">
                            <button class="btn-sm btn-primary mt-1 mr-1" v-on:click="updateName(newName)">Update Name</button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="dropdown">
                            <ul class="dropdown-type">
                                <div id="typeDropdown" class="dropdown-items" :class="{ show: showDevices }">
                                    <li v-for="animation in animations" v-on:click="selectAnimation(animation)">{{ animation }}</li>
                                </div>
                            </ul>
                        </div>
                        <button class="btn-sm btn-primary mt-1 mr-1 float-right" v-if="!editing" v-on:click="editName()">Load Animations</button> 

                    </div>
                </div>
            `
        })

    // App
    // /////////////////////////////////////////////////////////////////////////
        var app = new Vue({
            el: '#app',
            data: {
                dataStore: {
                    example: [
                        {
                            name: "example"
                        }
                    ],
                    ui: {}
                }
            }
        });

    // Procedural
    // /////////////////////////////////////////////////////////////////////////
        function onScriptEventReceived(message) {
            var data;
            try {
                data = JSON.parse(message);
                switch (data.type) {
                    case UPDATE_UI:
                            app.dataStore = data.value;
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

    // Main
    // /////////////////////////////////////////////////////////////////////////    
        onLoad();

}());
