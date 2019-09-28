var id = "";
var message = "";

var script = Script.resolvePath('./ezStatusUpdate_Client_milad.js?' + Date.now());

var textProps = {
    type: "Text",
    visible: true,
    text: "",
    dimensions: [1, 0.1, 0],
    localPosition: [0,1.2,0],
    script: script,
    parentID: MyAvatar.sessionUUID,
    textColor: "#000000",
    textAlpha: 1.0,
    backgroundColor: "#ffffff",
    backgroundAlpha: 1,
    localRotation: Quat.fromPitchYawRollDegrees(0,180,0)
};

id = Entities.addEntity(textProps, true);

console.log("\n\n\n\n\n\nid",id);
var props = Entities.getEntityProperties(id);
Script.scriptEnding.connect(function(){
    Entities.deleteEntity(id);
})