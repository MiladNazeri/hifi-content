/* eslint-disable indent */
(function() {

    "use strict";

    // Consts
    // /////////////////////////////////////////////////////////////////////////
        var 
            BUTTON_NAME = "IMPROV", // !important update in Example.js as well, MUST match Example.js
            EVENT_BRIDGE_OPEN_MESSAGE = BUTTON_NAME + "_eventBridgeOpen",
            LOAD_ANIMATION = "load_animation",
            CREATE_LIGHT_ANIMATION = "create_light_animation",
            REMOVE_LIGHT = "remove_light",
            START_ANIMATION = "start_animation",
            NEW_ANIMATION = "new_animation",
            UPDATE_ANIMATION_NAME = "update_animation_name",
            ADD_LIGHT = "add_light",

            REMOVE_SNAPSHOT = "REMOVE_SNAPSHOT",
            SAVE_SNAPSHOT_EDIT = "SAVE_SNAPSHOT_EDIT",
            SAVE_NEW_SNAPSHOT = "SAVE_NEW_SNAPSHOT",


            SAVE_SOUND_EDIT = "SAVE_SOUND_EDIT",
            ADD_SOUND = "ADD_SOUND",
            REMOVE_SOUND = "REMOVE_SOUND",

            CHANGE_ALWAYS_TRANSITION_SNAPS = "changeAlwaysTransitionSnaps",
            CHANGE_DEFAULT_TRANSITION_TIME = "CHANGE_DEFAULT_TRANSITION_TIME",
            UPDATE_UI = BUTTON_NAME + "_update_ui",
            
            EVENTBRIDGE_SETUP_DELAY = 100
        ;

    // Components
    // /////////////////////////////////////////////////////////////////////////
        // Snapshots
        // ////////////////////////////////////////////////////////////////////
            Vue.component('snapshots', {
                props: ['snapshots', "always_transition_snaps", "default_transition_time"],
                methods: {
                    toggleShowNewSnap: function(){
                        this.showNewSnapshot = !this.showNewSnapshot;
                    }
                },
                data: function(){
                    return {
                        showNewSnapshot: false
                    }
                },
                computed: {
                    filteredSnapshots: function(){
                        delete this.snapshots["alwaysTransition"];
                        return this.snapshots;
                    }
                },
                template: /*html*/`
                    <div class="card">
                        <div class="card-header" data-toggle="collapse" data-target="#snapshot-body">
                            <h5>Snapshots</h5>
                        </div>
                        <div  class="collapse card-body" id="snapshot-body">
                            <configuration :always_transition_snaps="always_transition_snaps" :default_transition_time="default_transition_time"></configuration>
                            <snapshot v-for="snapshot in filteredSnapshots" :snapshot="snapshot"></snapshot>
                            <new_snapshot v-if="showNewSnapshot"></new_snapshot>
                            <button v-if="!showNewSnapshot" class="btn btn-primary" v-on:click="toggleShowNewSnap">Add new snapshot</button>
                        </div>
                    </div>
                `
            });

            Vue.component('configuration', {
                props: ['snapshots', "always_transition_snaps", "default_transition_time"],
                methods: {
                    alwaysTransitionSnaps: function(){
                        EventBridge.emitWebEvent(JSON.stringify({
                            type: CHANGE_ALWAYS_TRANSITION_SNAPS
                        }));
                    },
                    onBlur: function(){
                        EventBridge.emitWebEvent(JSON.stringify({
                            type: CHANGE_DEFAULT_TRANSITION_TIME,
                            value: this.newTransitionTime
                        }));
                    }

                },
                data: function () {
                    return {
                        newTransitionTime: this.default_transition_time
                    }
                },
                template: /*html*/`
                    <div class="card">
                        <div class="card-header" data-toggle="collapse" data-target="#configuration-body">
                            <h5>Snapshot Configuration</h5>
                        </div>
                        <div class="card-body collapse" id="configuration-body">
                            <span class="form-check mt-3">
                                <input type="checkbox" class="form-check-input" id="checkbox" :checked="always_transition_snaps" v-on:click="alwaysTransitionSnaps()">
                                <label class="form-check-label" for="checkbox">Transition Snapshots</label>
                            </span>
                            <div class="input-group mb-1 ">
                                <div class="input-group-prepend">
                                    <span class="input-group-text font-weight-bold">Default Transition Time</span>
                                </div>
                                <input type="number" min="0" v-on:blur="onBlur" v-model="newTransitionTime" class="form-control">
                            </div>
                        </div>
                    </div>
                `
            })

            Vue.component('snapshot', {
                props: ['snapshot'],
                methods: {
                    removeSnapshot: function () {
                        console.log(JSON.stringify(this.snapshot));
                        EventBridge.emitWebEvent(JSON.stringify({
                            type: REMOVE_SNAPSHOT,
                            value: this.snapshot.name
                        }));
                    }
                },
                data: function () {
                    return {
                        editMode: false
                    }
                },
                template: /*html*/`
                    <div class="card">
                        <div class="card-header" data-toggle="collapse" :data-target="'#' + snapshot.name">
                            <h5>{{snapshot.name}}</h5>
                            <span>Key: {{snapshot.key}}</span> <span class="icon icon-close float-right" @click="removeSnapshot"></span>
                        </div>
                        <div class="card-body collapse" :id="snapshot.name">
                            <display_snapshot v-if="!editMode" :snapshot="snapshot"></display_snapshot>
                            <edit_snapshot v-if="editMode" :snapshot="snapshot"></edit_snapshot>
                        </div>
                    </div>
                `
            })

            Vue.component('display_snapshot', {
                props: ['snapshot'],
                methods: {
                    edit: function () {
                        this.$parent.editMode = true;
                    }
                },
                data: function () {
                    return {
                        editMode: false
                    }
                },
                template: /*html*/`
                    <div>
                        <div class="icon icon-edit-pencil" v-on:click="edit">
                        </div>
                        <div>
                            <h5>name: </h5>
                            <p>{{snapshot.name}}</p>
                        </div>
                        <div>
                            <h5>key: </h5>
                            <p>{{snapshot.key}}</p>
                        </div>
                    </div>
                `
            })

            Vue.component('edit_snapshot', {
                props: ['snapshot', "new"],
                methods: {
                    saveEdit: function () {
                        this.$parent.editMode = false;
                        if (this.new){
                            EventBridge.emitWebEvent(JSON.stringify({
                                type: SAVE_NEW_SNAPSHOT,
                                value: this.newSnapshot
                            }));
                        } else {
                            EventBridge.emitWebEvent(JSON.stringify({
                                type: SAVE_SNAPSHOT_EDIT,
                                value: {
                                    oldSnapshot: this.snapshot,
                                    newSnapshot: this.newSnapshot
                                }
                            }));
                        }
                    },
                    cancelEdit: function () {
                        this.newSnapshot = Object.assign({}, this.snapshot);
                        this.$parent.editMode = false;
                    }
                },
                data: function () {
                    return {
                        newSnapshot: Object.assign({}, this.snapshot)
                    }
                },
                template: /*html*/`
                    <div>
                        <div>
                            <h5>name: </h5>
                            <input type="text" class="form-control" v-model="newSnapshot.name">
                        </div>
                        <div>
                            <h5>key: </h5>
                            <input type="text" class="form-control" v-model="newSnapshot.key">
                        </div>
                            <button class="btn btn-primary" v-on:click="saveEdit">Save Edit</button>
                            <button class="btn btn-warning" v-on:click="cancelEdit">Cancel Edit</button>
                        </div>
                    </div>
                `
            })

            Vue.component('new_snapshot', {
                props: [],
                methods: {
                    saveSnapshot: function () {
                        this.$parent.showNewSnapshot = false;
                    }
                },
                watch: {
                    editMode: function (oldProp, newProp) {
                        if (oldProp !== newProp) {
                            this.$parent.showNewSnapshot = false;
                        }
                    }
                },
                data: function () {
                    return {
                        editMode: true,
                        newSnapshot: {
                            name: "",
                            key: "",
                        }
                    }
                },
                template: /*html*/`
                    <div class="card">
                        <edit_snapshot v-if="editMode" :new="true" :snapshot="newSnapshot" ></edit_snapshot>
                    </div>
                `
            })
        
         // Transitions
        // ////////////////////////////////////////////////////////////////////
            Vue.component('transitions', {
                props: ['transitions'],
                methods: {
                    toggleShowNewTransition: function () {
                        this.showNewTransition = !this.showNewTransition;
                    }
                },
                data: function () {
                    return {
                        showNewTransition: false

                    }
                },
                template: /*html*/`
                    <div class="card">
                        <div class="card-header" data-toggle="collapse" data-target="#transitions-body">
                            <h5>Transitions</h5>
                        </div>
                        <div class="card-body collapse" id="transitions-body">
                            <transition v-for="transition in transitions" :transition="transition"></transition>
                            <new_transition v-if="showNewTransition"></new_transition>
                            <button v-if="!showNewTransition" class="btn btn-primary" v-on:click="toggleShowNewTransition">Add new transition</button>
                        </div>
                    </div>
                `
            });

            Vue.component('transition', {
                props: ['transition'],
                methods: {

                },
                data: function () {
                    return {

                    }
                },
                template: /*html*/`
                    <div class="card">
                        <div class="card-header" data-toggle="collapse" :data-target="'#' + transition.name">
                            <h5>{{transition.name}}</h5>
                            <span>Key: {{transition.key}}</span>
                        </div>
                        <div class="card-body collapse" :id="transition.name">
                            test
                        </div>
                    </div>
                `
            })

            Vue.component('edit_transition', {
                
            })

            Vue.component('new_transition', {
                props: [],
                methods: {
                    saveSnapShot: function () {
                        this.$parent.showNewSnapshot = false;
                    }
                },
                data: function () {
                    return {

                    }
                },
                template: /*html*/`
                            <div class="card">
                                <div class="card-header">
                                    <h5>New Snapshot</h5>
                                </div>
                                <div class="card-body">
                                    test
                                    <button class="btn btn-primary" v-on:click="saveSnapShot">Save Snapshot</button>
                                </div>
                            </div>
                        `
            })

            Vue.component('new_transition', {
                props: [],
                methods: {
                    saveTransition: function () {
                        this.$parent.showNewTransition = false;
                    }
                },
                data: function () {
                    return {

                    }
                },
                template: /*html*/`
                    <div class="card">
                        <div class="card-header">
                            <h5>this is a new transition</h5>
                        </div>
                        <div class="card-body">
                            test
                            <button class="btn btn-primary" v-on:click="saveTransition">Save Transition</button>
                        </div>
                    </div>
                `
            })

        // Audio
        // ////////////////////////////////////////////////////////////////////
            Vue.component('audio_library', {
                props: ['audio', 'current_position', 'current_orientation'],
                methods: {
                    toggleShowNewSound: function () {
                        this.showNewSound = !this.showNewSound;
                    }
                },
                data: function () {
                    return {
                        showNewSound: false
                    }
                },
                template: /*html*/`
                    <div class="card">
                        <div class="card-header" data-toggle="collapse" data-target="#audio_library-body">
                            <h5>Audio</h5>
                        </div>
                        <div class="card-body collapse" id="audio_library-body">
                            <sound v-for="sound in audio" :sound="sound"></sound>
                            <new_sound v-if="showNewSound" :current_position="current_position" :current_orientation="current_orientation"></new_sound>
                            <button v-if="!showNewSound" class="btn btn-primary" v-on:click="toggleShowNewSound">Add new Sound</button>
                        </div>
                    </div>
                `
            });

            
            Vue.component('sound', {
                props: ['sound', 'current_position', 'current_orientation'],
                methods: {
                    removeSound: function(){
                        EventBridge.emitWebEvent(JSON.stringify({
                            type: REMOVE_SOUND,
                            value: this.sound.name
                        }));
                    }
                },
                data: function () {
                    return {
                        editMode: false
                    }
                },
                template: /*html*/`
                    <div class="card">
                        <div class="card-header" data-toggle="collapse" :data-target="'#' + sound.name">
                            <h5>{{sound.name}}</h5>
                            <span>Key: {{sound.key}}</span> <span class="icon icon-close float-right" @click="removeSound"></span>
                        </div>
                        <div class="card-body collapse" :id="sound.name">
                            <display_sound v-if="!editMode" :sound="sound" :current_position="current_position" :current_orientation="current_orientation"></display_sound>
                            <edit_sound v-if="editMode" :sound="sound" :current_position="current_position" :current_orientation="current_orientation"></edit_sound>
                        </div>
                    </div>
                `
            });

            Vue.component('display_sound', {
                props: ['sound', 'current_position', 'current_orientation'],
                methods: {
                    edit: function(){
                        this.$parent.editMode = true;
                    }
                },
                data: function () {
                    return {
                        editMode: false
                    }
                },
                template: /*html*/`
                    <div>
                        <div class="icon icon-edit-pencil" v-on:click="edit">
                        </div>
                        <div>
                            <h5>name: </h5>
                            <p>{{sound.name}}</p>
                        </div>
                        <div>
                            <h5>url: </h5>
                            <p>{{sound.url}}</p>
                        </div>
                        <div>
                            <h5>key: </h5>
                            <p>{{sound.key}}</p>
                        </div>
                        <div>
                            <h5>max volume: </h5>
                            <p>{{sound.maxVolume}}</p>
                        </div>
                        <div>
                            <h5>fade in time: </h5>
                            <p>{{sound.fadeInTime}}</p>
                        </div>
                        <div>
                            <h5>fade out time: </h5>
                            <p>{{sound.fadeOutTime}}</p>
                        </div>
                        <div>
                            <h5>loop: </h5>
                            <p>{{sound.loop}}</p>
                        </div>
                        <div>
                            <h5>Position </h5>
                            <p>{{sound.position}}</p>
                        </div>
                        <div>
                            <h5>Orientation </h5>
                            <p>{{sound.orientation}}</p>
                        </div>
                    </div>
                `
            })

            Vue.component('edit_sound', {
                props: ['sound', 'current_position', 'current_orientation'],
                methods: {
                    saveEdit: function(){ 
                        this.$parent.editMode = false;
                        EventBridge.emitWebEvent(JSON.stringify({
                            type: SAVE_SOUND_EDIT,
                            value: {
                                oldSound: this.sound,
                                newSound: this.newSound
                            }
                        }));
                    },
                    cancelEdit: function(){
                        this.newSound = Object.assign({}, this.sound);
                        this.$parent.editMode = false;
                    }
                },
                data: function () {
                    return {
                        newSound: Object.assign({}, this.sound)
                    }
                },
                template: /*html*/`
                    <div>
                        <div>
                            <h5>name: </h5>
                            <input type="text" class="form-control" v-model="newSound.name">
                        </div>
                        <div>
                            <h5>url: </h5>
                            <input type="http" class="form-control" v-model="newSound.url">
                        </div>
                        <div>
                            <h5>key: </h5>
                            <input type="text" class="form-control" v-model="newSound.key">
                        </div>
                        <div>
                            <h5>max volume: </h5>
                            <input type="number" min="0" max="1.0" class="form-control" v-model="newSound.maxVolume">
                        </div>
                        <div>
                            <h5>fade in time: </h5>
                            <input type="number" class="form-control" v-model="newSound.fadeInTime">
                        </div>
                        <div>
                            <h5>fade out time: </h5>
                            <input type="number" class="form-control" v-model="newSound.fadeOutTime">
                        </div>
                        <div>
                            <h5>loop </h5>
                            <input type="checkbox" :checked="newSound.loop">
                        </div>
                        <div>
                            <h5>Position ([0,0,0])</h5>
                            <input type="text" class="form-control" v-model="newSound.position">
                        </div>
                        <div>
                            <h5>Orientation ([0,0,0,0])</h5>
                            <input type="text" class="form-control" v-model="newSound.orientation">
                        </div>
                        <div class="mt-2">
                            <button class="btn btn-primary" v-on:click="saveEdit">Save Edit</button>
                            <button class="btn btn-warning" v-on:click="cancelEdit">Cancel Edit</button>
                        </div>
                    </div>
                `
            })

            Vue.component('new_sound', {
                props: ['current_position', 'current_orientation'],
                methods: {
                    saveSound: function () {
                        this.$parent.showNewSound = false;
                    }
                },
                watch: {
                    editMode: function(oldProp, newProp){
                        if (oldProp !== newProp) {
                            this.$parent.showNewSound = false;
                        }
                    }
                },
                data: function () {
                    return {
                        editMode: true,
                        newSound: {
                            name: "",
                            position: this.current_position,
                            orientation: this.current_orientation,
                            maxVolume: 1.0,
                            loop: false,
                            fadeInTime: 0,
                            fadeOutTime: 0,
                            key: "",
                            url: ""
                        }
                    }
                },
                template: /*html*/`
                    <div class="card">
                        <edit_sound v-if="editMode" :sound="newSound" :current_position="current_position" :current_orientation="current_orientation"></edit_sound>
                    </div>
                `
            });


    // App
    // /////////////////////////////////////////////////////////////////////////
        var app = new Vue({
            el: '#app',
            methods: {
                toggleShowLightAdd: function(){
                    this.showLightAdd = !this.showLightAdd
                },
                createLight: function(){
                    EventBridge.emitWebEvent(JSON.stringify({
                        type: CREATE_LIGHT_ANIMATION
                    }));
                },
                animate: function(){
                    EventBridge.emitWebEvent(JSON.stringify({
                        type: START_ANIMATION
                    }));
                }
            },
            data: {
                showLightAdd: false,
                dataStore: {

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

