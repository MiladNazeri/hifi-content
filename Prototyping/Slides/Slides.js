var slideURL = "https://swanky-bangle.glitch.me/";

function XHR(url) {
    print("XHR: request url = " + url);
    this.req = new XMLHttpRequest();
    this.req.open("GET", url);
    this.req.send();
}

var MAPPING_NAME = 'Ctrl Mapping';

var mapping = Controller.newMapping(MAPPING_NAME);

var touched = false;

mapping.from(Controller.Standard.RX).to(function(value) {
    print(value);
    if (value > 0 && touched === false) {
        XHR(slideURL + "/fwd");
        touched = true;
    }
    if (value === 0) {
        console.log("0");
        touched = false;
    }
    if (value < 0 && touched === false) {
        XHR(slideURL + "/bwd");
        touched = true;
    }
    // 
});
Controller.enableMapping(MAPPING_NAME);

Script.scriptEnding.connect(function() {
    Controller.disableMapping(MAPPING_NAME);
});

// Tablet
var tablet = null;
var buttonName = "Layout";
var button = null;
var APP_URL = Script.resolvePath('./Tablet/Slides.html');

function onTabletButtonClicked() {
    tablet.gotoWebScreen(APP_URL);
}
tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");

button = tablet.addButton({
    text: buttonName,
    icon: "icons/tablet-icons/raise-hand-i.svg",
    activeIcon: "icons/tablet-icons/raise-hand-a.svg"
});

button.clicked.connect(onTabletButtonClicked);

function onWebEventReceived(data) {
    print("got message");
    print(data);
    var message;
    message = JSON.parse(data);
    switch (message.type) {
        default:
    }
}

tablet.webEventReceived.connect(onWebEventReceived);

// cleanup
function cleanup() {
    button.clicked.disconnect(onTabletButtonClicked);
    tablet.removeButton(button);
    tablet.webEventReceived.disconnect(onWebEventReceived);
}

Script.scriptEnding.connect(cleanup);