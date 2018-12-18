/* eslint-disable indent */
(function() {

    "use strict";

    // Consts
    // /////////////////////////////////////////////////////////////////////////
        var 
            BUTTON_NAME = "IMPROV", // !important update in Example.js as well, MUST match Example.js
            EVENT_BRIDGE_OPEN_MESSAGE = BUTTON_NAME + "_eventBridgeOpen",
            SAVE_JSON = "SAVE_JSON",

            CREATE_LIGHT_ANIMATION = "create_light_animation",
            START_ANIMATION = "start_animation",

            SAVE_SETTINGS = "SAVE_SETTINGS",

            REMOVE_SNAPSHOT = "REMOVE_SNAPSHOT",
            SAVE_SNAPSHOT_EDIT = "SAVE_SNAPSHOT_EDIT",
            SAVE_NEW_SNAPSHOT = "SAVE_NEW_SNAPSHOT",

            SAVE_NEW_TRANSITION = "SAVE_NEW_TRANSITION",
            SAVE_TRANSITION_EDIT = "SAVE_TRANSITION_EDIT",
            REMOVE_TRANSITION = "REMOVE_TRANSITION",

            SAVE_SOUND_EDIT = "SAVE_SOUND_EDIT",
            SAVE_NEW_SOUND = "SAVE_NEW_SOUND",
            ADD_SOUND = "ADD_SOUND",
            REMOVE_SOUND = "REMOVE_SOUND",
            UPDATE_POSITION = "UPDATE_POSITION",
            UPDATE_ORIENTATION = "UPDATE_ORIENTATION",

            CHANGE_ALWAYS_TRANSITION_SNAPS = "changeAlwaysTransitionSnaps",
            CHANGE_DEFAULT_TRANSITION_TIME = "CHANGE_DEFAULT_TRANSITION_TIME",
            UPDATE_UI = BUTTON_NAME + "_update_ui",
            
            EVENTBRIDGE_SETUP_DELAY = 500;
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
                            <!-- <div class="input-group mb-1 ">
                                <div class="input-group-prepend">
                                    <span class="input-group-text font-weight-bold">Default Transition Time</span>
                                </div>
                                <input type="number" min="0" v-on:blur="onBlur" v-model="newTransitionTime" class="form-control"> -->
                            </div>
                        </div>
                    </div>
                `
            })

            Vue.component('snapshot', {
                props: ['snapshot'],
                methods: {
                    removeSnapshot: function () {
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
                            <span>Key: {{snapshot.key}}</span> <span class="icon icon-close pencil float-right" @click="removeSnapshot"></span>
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
                        <div class="icon icon-edit-pencil pencil" v-on:click="edit">
                        </div>
                        <div>
                            <h5>name: </h5>
                            <p>{{snapshot.name}}</p>
                        </div>
                        <div>
                            <h5>key: </h5>
                            <p>{{snapshot.key}}</p>
                        </div>
                        <div>
                            <h5>Transition Duration: </h5>
                            <p>{{snapshot.transitionTime}}</p>
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
                        <div>
                            <h5>transition time: </h5>
                            <input type="text" class="form-control" v-model="newSnapshot.transitionTime">
                        </div>
                        <div>
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
                            transitionTime: 0
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
                props: ['snapshots', 'transitions'],
                methods: {
                    toggleShowNewTransition: function(){
                        this.showNewTransition = !this.showNewTransition;
                    }
                },
                data: function(){
                    return {
                        showNewTransition: false
                    }
                },
                template: /*html*/`
                    <div class="card">
                        <div class="card-header" data-toggle="collapse" data-target="#transitions-body">
                            <h5>Transitions</h5>
                        </div>
                        <div class="collapse card-body" id="transitions-body">
                            <transition v-for="transition in transitions" :transition="transition" :snapshots="snapshots"></transition>
                            <new_transition v-if="showNewTransition" :snapshots="snapshots"></new_transition>
                            <button v-if="!showNewTransition" class="btn btn-primary" v-on:click="toggleShowNewTransition">Add new transition</button>
                        </div>
                    </div>
                `
            });

            Vue.component('transition', {
                props: ['transition','snapshots'],
                methods: {
                    removeTransition: function () {
                        EventBridge.emitWebEvent(JSON.stringify({
                            type: REMOVE_TRANSITION,
                            value: this.transition.name
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
                        <div class="card-header" data-toggle="collapse" :data-target="'#' + transition.name">
                            <h5>{{transition.name}}</h5>
                            <span>Key: {{transition.key}}</span> <span class="icon icon-close pencil float-right" @click="removeTransition"></span>
                        </div>
                        <div class="card-body collapse" :id="transition.name">
                            <display_transition v-if="!editMode" :transition="transition"></display_transition>
                            <edit_transition v-if="editMode" :transition="transition" :snapshots="snapshots"></edit_transition>
                        </div>
                    </div>
                `
            })

            Vue.component('display_transition', {
                props: ['transition'],
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
                        <div class="icon icon-edit-pencil pencil" v-on:click="edit">
                        </div>
                        <div>
                            <h5>name: </h5>
                            <p>{{transition.name}}</p>
                        </div>
                        <div>
                            <h5>key: </h5>
                            <p>{{transition.key}}</p>
                        </div>
                        <div>
                            <h5>from: </h5>
                            <p>{{transition.from}}</p>
                        </div>
                        <div>
                            <h5>to: </h5>
                            <p>{{transition.to}}</p>
                        </div>
                        <div>
                            <h5>duration (ms): </h5>
                            <p>{{transition.duration}}</p>
                        </div>
                        
                    </div>
                `
            })

            Vue.component('edit_transition', {
                props: ['snapshots', "new", 'transition'],
                methods: {
                    saveEdit: function () {
                        this.$parent.editMode = false;
                        if (this.new){
                            EventBridge.emitWebEvent(JSON.stringify({
                                type: SAVE_NEW_TRANSITION,
                                value: this.newTransition
                            }));
                        } else {
                            EventBridge.emitWebEvent(JSON.stringify({
                                type: SAVE_TRANSITION_EDIT,
                                value: {
                                    oldTransition: this.transition,
                                    newTransition: this.newTransition
                                }
                            }));
                        }
                    },
                    cancelEdit: function () {
                        this.newTransition = Object.assign({}, this.transition);
                        this.$parent.editMode = false;
                    },
                    selectFrom: function (name) {
                        this.newTransition.from = name;
                        this.toggleFrom();
                    },
                    selectTo: function (name) {
                        this.newTransition.to = name;
                        this.toggleTo();
                    },
                    toggleFrom: function(){
                        this.toggle_from = !this.toggle_from;
                    },
                    toggleTo: function(){
                        this.toggle_to = !this.toggle_to;
                    },
                },
                data: function () {
                    return {
                        newTransition: Object.assign({}, this.transition),
                        toggle_from: false,
                        toggle_to: false
                    }
                },
                template: /*html*/`
                    <div>
                        <div>
                            <h5>name: </h5>
                            <input type="text" class="form-control" v-model="newTransition.name">
                        </div>
                        <div>
                            <h5>key: </h5>
                            <input type="text" class="form-control" v-model="newTransition.key">
                        </div>
                        <div>
                            <div class="dropdown">
                                <ul class="dropdown-type">
                                    <button class="btn-sm btn-primary mt-1 mr-1" id="toggle_from" v-on:click="toggleFrom()">
                                        From
                                    </button>
                                    <div id="fromDropdown" class="dropdown-items" :class="{ show: toggle_from }">
                                        <li v-for="snapshot in snapshots" v-on:click="selectFrom(snapshot.name)">{{ snapshot.name }}</li>
                                    </div>
                                </ul>
                            </div>
                        </div>
                        <div>
                            <p>Selected From: {{newTransition.from}}</p>                    
                        </div>
                        <div>
                            <div class="dropdown">
                                <ul class="dropdown-type">
                                    <button class="btn-sm btn-primary mt-1 mr-1" id="toggle_to" v-on:click="toggleTo()">
                                        To
                                    </button>
                                    <div id="toDropdown" class="dropdown-items" :class="{ show: toggle_to }">
                                        <li v-for="snapshot in snapshots" v-on:click="selectTo(snapshot.name)">{{ snapshot.name }}</li>
                                    </div>
                                </ul>
                            </div>
                        </div>
                        <div>
                            <p>Selected To: {{newTransition.to}}</p>                     
                        </div>
                        <div>
                            <h5>duration (ms): </h5>
                            <input type="number" class="form-control" min="0" v-model="newTransition.duration">
                        </div>
                        <div>
                            <button class="btn btn-primary" v-on:click="saveEdit">Save Edit</button>
                            <button class="btn btn-warning" v-on:click="cancelEdit">Cancel Edit</button>
                        </div>
                    </div>
                `
            })

            Vue.component('new_transition', {
                props: ['snapshots'],
                methods: {
                    saveTransition: function () {
                        this.$parent.showNewTransition = false;
                    }
                },
                watch: {
                    editMode: function (oldProp, newProp) {
                        if (oldProp !== newProp) {
                            this.$parent.showNewTransition = false;
                        }
                    }
                },
                data: function () {
                    return {
                        editMode: true,
                        newTransition: {
                            name: "",
                            key: "",
                            from: "",
                            to: "",
                            duration: 0
                        }
                    }
                },
                template: /*html*/`
                    <div class="card">
                        <edit_transition v-if="editMode" :new="true" :transition="newTransition" :snapshots="snapshots"></edit_transition>
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
                            <sound v-for="sound in audio" :sound="sound" :current_position="current_position" :current_orientation="current_orientation"></sound>
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
                            <span>Key: {{sound.key}}</span> <span class="icon icon-close pencil float-right" @click="removeSound"></span>
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
                        <div class="icon icon-edit-pencil pencil" v-on:click="edit">
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
                            <p>{{sound.position[0] + ', ' + sound.position[1] + ', ' + sound.position[2]}}</p>
                        </div>
                        <div>
                            <h5>Orientation </h5>
                            <p>{{+sound.orientation[0] + ', ' + +sound.orientation[1] + ', ' + +sound.orientation[2] + +sound.orientation[3]}}</p>
                        </div>
                    </div>
                `
            })

            Vue.component('edit_sound', {
                props: ['sound', 'current_position', 'current_orientation', 'new'],
                methods: {
                    saveEdit: function(){ 
                        console.log("THIS.NEW_Sound " + JSON.stringify(this.newSound));
                        this.$parent.editMode = false;
                        if (this.new){
                            EventBridge.emitWebEvent(JSON.stringify({
                                type: SAVE_NEW_SOUND,
                                value: this.newSound
                            }));
                        } else {
                            EventBridge.emitWebEvent(JSON.stringify({
                                type: SAVE_SOUND_EDIT,
                                value: {
                                    oldSound: this.sound,
                                    newSound: this.newSound
                                }
                            }));
                        }
                    },
                    cancelEdit: function(){
                        this.newSound = Object.assign({}, this.sound);
                        this.$parent.editMode = false;
                    },
                    updatePosition: function(){
                        EventBridge.emitWebEvent(JSON.stringify({
                            type: UPDATE_POSITION
                        }));
                        // this.newSound.position = [+this.current_position.x.toFixed(3), +this.current_position.y.toFixed(3), +this.current_position.z.toFixed(3)];
                    },
                    updateOrientation: function(){
                        EventBridge.emitWebEvent(JSON.stringify({
                            type: UPDATE_ORIENTATION
                        }));
                        // this.newSound.orientation = [+this.current_orientation.x.toFixed(3), +this.current_orientation.y.toFixed(3), +this.current_orientation.z.toFixed(3), +this.current_orientation.w.toFixed(3)];
                    }
                },
                data: function () {
                    return {
                        newSound: Object.assign(
                            {}, 
                            this.sound, 
                            {
                                position: [this.sound.position[0], this.sound.position[1], this.sound.position[2]], 
                                orientation: [this.sound.orientation[0], this.sound.orientation[1], this.sound.orientation[2], this.sound.orientation[3]]
                            })
                    }
                },
                watch: {
                    current_position: function (oldProp, newProp){
                        console.log("current position changed")
                        console.log(JSON.stringify(oldProp));
                        console.log(JSON.stringify(newProp));
                        if (oldProp !== newProp){
                            this.newSound.position = [newProp[0], newProp[1], newProp[2]];
                            this.$forceUpdate();
                        }
                    },
                    current_orientation: function (oldProp, newProp){
                        console.log("current current_orientation changed")
                        console.log(JSON.stringify(oldProp));
                        console.log(JSON.stringify(newProp));
                        if (oldProp !== newProp){
                            this.newSound.orientation = [newProp[0], newProp[1], newProp[2], newProp[3]];
                            this.$forceUpdate();
                        }
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
                            <input type="number" class="form-control" max="1.0" min="0.0" v-model="newSound.maxVolume">
                        </div>
                        <div>
                            <h5>fade in time (ms): </h5>
                            <input type="number" class="form-control" min="0.0" v-model="newSound.fadeInTime">
                        </div>
                        <div>
                            <h5>fade out time (ms): </h5>
                            <input type="number" class="form-control" min="0.0" v-model="newSound.fadeOutTime">
                        </div>
                        <div>
                            <h5>loop </h5>
                            <input type="checkbox" :checked="newSound.loop" v-model="newSound.loop">
                        </div>
                        <div>
                            <h5>Position (0,0,0)</h5>
                            <button class="btn btn-primary" @click="updatePosition">Update with Current Position</button>
                            <input type="text" class="form-control" v-model="newSound.position">
                        </div>
                        <div>
                            <h5>Orientation (0,0,0,0)</h5>
                            <button class="btn btn-primary" @click="updateOrientation">Update with Current Orientation</button>
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
                        <edit_sound v-if="editMode" :sound="newSound" :new="true" :current_position="current_position" :current_orientation="current_orientation"></edit_sound>
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
                        type: SAVE_JSON
                    }));
                },
                animate: function(){
                    EventBridge.emitWebEvent(JSON.stringify({
                        type: START_ANIMATION
                    }));
                },
                saveSettings: function(){
                    EventBridge.emitWebEvent(JSON.stringify({
                        type: SAVE_JSON
                    }));
                }
            },
            data: {
                showLightAdd: false,
                dataStore: {

                }
            }
        });

        // function saveJSON(){
        //     console.log("\n\n\n!!!!SAVING JSON!!!")
        //     var url = "https://script.google.com/macros/s/AKfycbwEULyFTHC04hXdGpIt1iHKQse5qOwuQDEKTeT3pg6XCJt7NXlF/exec";
        //         var settings = {};
                
        //         settings.snapshots = app.dataStore.snapshots
        //         settings.audio = app.dataStore.audio;
        //         settings.mapping = app.dataStore.mapping;
        //         settings.time = Date.now();
        //         function success() {
        //             console.log("SUCCESS");
        //         }
        //         function error() {
        //             console.log("ERROR");
        //         }

        //         $.ajax({
        //             type: "POST",
        //             url: url,
        //             traditional: true,
        //             processData: false, 
        //             data: JSON.stringify(settings),
        //             success: success,
        //             error: error
        //         });
        // }
    // Procedural
    // /////////////////////////////////////////////////////////////////////////
        function onScriptEventReceived(message) {
            var data;
            try {
                data = JSON.parse(message);
                switch (data.type) {
                    case SAVE_JSON:
                        console.log("\n\n\n!!!!SAVING JSON!!!")
                        var url = "https://script.google.com/macros/s/AKfycbwEULyFTHC04hXdGpIt1iHKQse5qOwuQDEKTeT3pg6XCJt7NXlF/exec";
                            var settings = {};
                            
                            console.log("\n\nAUDIO:\n\n " + Object.keys(app.dataStore.audio.audioObjects));
                            settings.snapshots = app.dataStore.snapshots
                            settings.audio = app.dataStore.audio;
                            settings.mapping = app.dataStore.mapping;
                            settings.time = Date.now();
                            function success() {
                                console.log("SUCCESS");
                            }
                            function error() {
                                console.log("ERROR");
                            }

                            $.ajax({
                                type: "POST",
                                url: url,
                                traditional: true,
                                processData: false, 
                                data: JSON.stringify(settings),
                                success: success,
                                error: error
                            });
                        break;
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

