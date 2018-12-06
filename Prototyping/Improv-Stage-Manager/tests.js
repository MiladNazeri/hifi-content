var zoneId = "{55108fad-107e-4c59-b9ea-dd70e6307de9}";

var edit = {"keyLight": { intensity: 1}};
Entities.editEntity(zoneId, edit);

Script.setTimeout(function(){
    var message = JSON.stringify({ type: "takesnapshot", value: ""});
    Messages.sendMessage(messageChannel, message);
}, 500)

Script.setTimeout(function(){
    var message = JSON.stringify({ type: "savesnapshot", value: "test1"});
    Messages.sendMessage(messageChannel, message);
}, 1000)

Script.setTimeout(function(){
    var edit = {"keyLight": { intensity: 20}};
    Entities.editEntity(zoneId, edit);
}, 1500)


Script.setTimeout(function(){
    var message = JSON.stringify({ type: "takesnapshot", value: ""});
    Messages.sendMessage(messageChannel, message);
}, 2000)

Script.setTimeout(function(){
    var message = JSON.stringify({ type: "savesnapshot", value: "test2"});
    Messages.sendMessage(messageChannel, message);
}, 2500)

Script.setTimeout(function(){
    var message = JSON.stringify({ type: "loadsnapshot", value: "test1"});
    Messages.sendMessage(messageChannel, message);
}, 3000)

// Script.setTimeout(function(){
//     var message = JSON.stringify({ type: "animation", value: ["test1", "test2", "3000"]});
//     Messages.sendMessage(messageChannel, message);
// }, 3500)




// var message = JSON.stringify({ type: "loadsnapshot", value: "test2"});
// Messages.sendMessage(messageChannel, message);









