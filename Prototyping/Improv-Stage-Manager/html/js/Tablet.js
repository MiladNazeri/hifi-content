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
            CHANGE_ALWAYS_TRANSITION_SNAPS = "changeAlwaysTransitionSnaps",
            CHANGE_DEFAULT_TRANSITION_TIME = "CHANGE_DEFAULT_TRANSITION_TIME",
            UPDATE_UI = BUTTON_NAME + "_update_ui",
            
            EVENTBRIDGE_SETUP_DELAY = 100
        ;

    // Components
    // /////////////////////////////////////////////////////////////////////////
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
            template: /*html*/`
                <div class="card">
                    <div class="card-header" data-toggle="collapse" data-target="#snapshot-body">
                        <h5>Snapshots</h5>
                    </div>
                    <div  class="collapse card-body" id="snapshot-body">
                        <configuration :always_transition_snaps="always_transition_snaps" :default_transition_time="default_transition_time"></configuration>
                        <snapshot v-for="snapshot in snapshots" :snapshot="snapshot"></snapshot>
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

        Vue.component('new_snapshot', {
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

        Vue.component('snapshot', {
            props: ['snapshot'],
            methods: {

            },
            data: function () {
                return {

                }
            },
            template: /*html*/`
                <div class="card">
                    <div class="card-header" data-toggle="collapse" :data-target="'#' + snapshot.name">
                        <h5>{{snapshot.name}}</h5>
                        <span>Key: {{snapshot.key}}</span>
                    </div>
                    <div class="card-body collapse" :id="snapshot.name">
                        test
                    </div>
                </div>
            `
        })

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

        Vue.component('audio_library', {
            props: ['audio'],
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
                        <new_sound v-if="showNewSound"></new_sound>
                        <button v-if="!showNewSound" class="btn btn-primary" v-on:click="toggleShowNewSound">Add new Sound</button>
                    </div>
                </div>
            `
        });

        Vue.component('sound', {
            props: ['sound'],
            methods: {

            },
            data: function () {
                return {

                }
            },
            template: /*html*/`
                <div class="card">
                    <div class="card-header" data-toggle="collapse" :data-target="'#' + sound.name">
                        <h5>{{sound.name}}</h5>
                        <span>Key: {{sound.key}}</span>

                    </div>
                    <div class="card-body collapse" :id="sound.name">
                        test
                    </div>
                </div>
            `
        });

        Vue.component('new_sound', {
            props: [''],
            methods: {
                saveSound: function () {
                    this.$parent.showNewSound = false;
                }
            },
            data: function () {
                return {

                }
            },
            template: /*html*/`
                <div class="card">
                    <div class="card-header">
                        <h5>this is a new sound</h5>       
                    </div>
                    <div class="card-body">
                        Save Sound
                    <button class="btn btn-primary" v-on:click="saveSound">Save Sound</button>
                    </div>
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

