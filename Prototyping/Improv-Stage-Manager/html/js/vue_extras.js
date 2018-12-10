<config class="m-3" 
                : animations="dataStore.animations.animationGroup"
                : current_animation="dataStore.currentAnimation">
</config>

    <setting class="m-3"
        v-for="n in dataStore.animations.animationGroup[dataStore.currentAnimation]"
                : name="n.name"
                : to="n.to"
                : from="n.from"
                : duration="n.duration"
    >
    </setting>

    <light-add class="m-3"
        v-if="showLightAdd"
                : animations="dataStore.animations.animationGroup"
                : current_animation="dataStore.currentAnimation"
                : choices="dataStore.choices"
    >
    </light-add>

    <button id="new-light" v-if="!showLightAdd" v-on: click="toggleShowLightAdd" type="button" class="btn-sm btn-primary m-3">New light</button>
    <button id="animate" v-on: click="animate" type="button" class="btn-sm btn-primary m-3">Animate</button>

    
Vue.component('config', {
    props: ["current_animation", "animations"],
    data: function () {
        return {
            newName: "",
            editing: false,
            editingJSONURL: false,
            selectedAnimation: "",
            showAnimations: false
        }
    },
    methods: {
        toggleAnimations() {
            this.showAnimations = !this.showAnimations;
        },
        editName(name) {
            this.editing = true;
        },
        newAnimation() {
            EventBridge.emitWebEvent(JSON.stringify({
                type: NEW_ANIMATION
            }));
        },
        updateName(name) {
            this.editing = false;
            EventBridge.emitWebEvent(JSON.stringify({
                type: UPDATE_ANIMATION_NAME,
                value: {
                    newName: name,
                    oldName: this.current_animation
                }
            }));
            this.newName = "";
        },
        selectAnimation(animation) {
            this.selectedAnimation = animation;
            this.toggleAnimations();
            EventBridge.emitWebEvent(JSON.stringify({
                type: LOAD_ANIMATION,
                value: animation
            }));
        },
        loadAnimation() {

        }
    },
    template: /*html*/`
                <div class="card">
                    <div class="card-header">
                        <div>
                            <strong>Current Animation Name: {{current_animation}}</strong> 
                        </div>
                        <button class="btn-sm btn-primary mt-1 mr-1 float-left" v-on:click="newAnimation()">New Animation</button>
                        <button class="btn-sm btn-primary mt-1 mr-1 float-right" v-if="!editing" v-on:click="editName()">Edit Name</button>
                        <div v-if="editing">
                            <input id="new-name" type="text" class="form-control" v-model="newName">
                            <button class="btn-sm btn-primary mt-1 mr-1" v-on:click="updateName(newName)">Update Name</button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="dropdown">
                            <ul class="dropdown-type">
                                <button class="btn-sm btn-primary mt-1 mr-1 float-left" id="toggle_animation" v-on:click="toggleAnimations()">
                                    Animations
                                </button>
                                <div id="nameDropdown" class="dropdown-items" :class="{ show: showAnimations }">
                                    <li v-for="(animation, key) in animations" v-on:click="selectAnimation(key)">{{ key }}</li>
                                </div>
                            </ul>
                        </div>
                    </div>
                </div>
            `
})

Vue.component('setting', {
    props: ["name", "to", "from", "duration"],
    methods: {
        removeLight() {
            EventBridge.emitWebEvent(JSON.stringify({
                type: REMOVE_LIGHT,
                value: "name"
            }));
        }
    },
    template: /*html*/`
                <div class="list-complete-item p-2 main-font-size">
                    <div class="row">
                        <div class="col">
                            <span>Name::</span> {{name}}
                        </div>
                    </div>
                    <div class="row">
                        <div class="col">
                            <span>from:</span> {{from}}
                        </div>
                        <div class="col">
                            <span>to:</span> {{to}}
                        </div>

                        <div class="col">
                            <span>duration:</span> {{duration}}
                        </div>
                        <div class="col">
                            <span class="delete" v-on:click="removeLight">
                                <i class="float-right mr-2 fas fa-times"></i>
                            </span>
                        </div>
                    </div>
                </div>
            `
})

Vue.component('light-add', {
    props: ["animations", "current_animation", "choices"],
    data: function () {
        return {
            name: "",
            from: 0,
            to: 0,
            duration: 3000,
            showNames: false
        }
    },
    computed: {
        lightsLeft: function () {
            var current;
            console.log("this.animations:" + JSON.stringify(this.animations));
            console.log("this.current_animation:" + JSON.stringify(this.current_animation));

            if (!this.animations[this.current_animation]) {
                current = [];
            } else {
                current = this.animations[this.current_animation].map(function (light) { return light.name });
            }
            console.log("this.choices:" + JSON.stringify(this.choices))
            console.log("current:" + JSON.stringify(current))

            var keys = this.choices
                .filter(function (key) {
                    console.log("key:" + JSON.stringify(key))
                    console.log("index:" + current.indexOf(key) === -1);
                    return current.indexOf(key) === -1;
                }, this)
            return keys;
        }
    },
    methods: {
        toggleNames() {
            this.showNames = !this.showNames;
        },
        selectName(name) {
            this.name = name;
            this.toggleNames();
        },
        addLight() {
            EventBridge.emitWebEvent(JSON.stringify({
                type: ADD_LIGHT,
                value: {
                    name: this.name,
                    from: this.from,
                    to: this.to,
                    duration: this.duration
                }
            }));
            this.name = "";
            this.from = 0;
            this.to = 0;
            this.duration = 3000;
            this.showNames = false;
            this.$parent.showLightAdd = false;

        },
        removeDance() {
            EventBridge.emitWebEvent(JSON.stringify({
                type: REMOVE_DANCE,
                value: this.index
            }));
        },
        onBlur() {
            EventBridge.emitWebEvent(JSON.stringify({
                type: UPDATE_DANCE_ARRAY,
                value: {
                    dance: this.dance,
                    index: this.index
                }
            }));
        },
        onClicked() {
            this.clicked = !this.clicked;
        }
    },
    template: /*html*/`
                <div class="list-complete-item p-2 main-font-size">
                    <div class="card-header transparent">
                        <span class="font-weight-bold white-text"> Add Light </span>
                    </div>
                    <form class="form-inline" onsubmit="event.preventDefault()">
                        <div class="row">
                            <div class="col">
                                <div class="input-group mb-1 ">
                                    <div class="dropdown" style:="width: 100px;">
                                        <ul class="dropdown-type" style:="width: 100px;">
                                            <button class="btn-sm btn-primary mt-1 mr-1 float-left" id="selectedLightName" style:="width: 100px;" v-on:click="toggleNames()">
                                                Light Names
                                            </button>
                                            <div id="nameDropdown" class="dropdown-items" style:="width: 100px;" :class="{ show: showNames }">
                                                <li v-for="light in lightsLeft" style:="width: 100px;" v-on:click="selectName(light)">{{ light }}</li>
                                            </div>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col">
                                <span class="main-font-size font-weight-bold">{{name}}</span>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col">
                                <div class="input-group mb-1">
                                    <div class="input-group-prepend">
                                        <span class="input-group-text main-font-size font-weight-bold">From</span>
                                    </div>
                                    <input type="text" v-model="from" class="form-control main-font-size" placeholder="0">
                                </div>
                            </div>
                            <div class="col">
                                <div class="input-group mb-1">
                                    <div class="input-group-prepend">
                                        <span class="input-group-text font-weight-bold">To</span>
                                    </div>
                                    <input type="text" v-model="to" class="form-control main-font-size" placeholder="0">
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col">
                                <div class="input-group mb-1">
                                    <div class="input-group-prepend">
                                        <span class="input-group-text main-font-size font-weight-bold">Duration</span>
                                    </div>
                                    <input type="text" v-model="duration" class="form-control main-font-size" placeholder="0">
                                </div>
                            </div>
                        </div>
                    </form>
                    <button id="add-light" v-on:click="addLight" type="button" class="btn-sm btn-primary m-3">Add Light</button>
                </div>
            `
})
