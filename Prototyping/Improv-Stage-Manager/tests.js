console.log('\n\n\n\n\n\n\n\n\n\n')


var zoneId = "{55108fad-107e-4c59-b9ea-dd70e6307de9}";

var edit = {"keyLight": { intensity: 1}};
Entities.editEntity(zoneId, edit);

var messageChannel = "improv";

Script.setTimeout(function(){
    var message = JSON.stringify({ type: "takesnapshot", value: ""});
    Messages.sendMessage(messageChannel, message);
}, 500)

Script.setTimeout(function(){
    var message = JSON.stringify({ type: "savesnapshot", value: "blackout"});
    Messages.sendMessage(messageChannel, message);
}, 1000)

var message = JSON.stringify({ type: "savesnapshot", value: "improv-troop_full-wash"});
Messages.sendMessage(messageChannel, message);

var message = JSON.stringify({ type: "loadsnapshot", value: "blackout"});
Messages.sendMessage(messageChannel, message);

var message = JSON.stringify({ type: "loadsnapshot", value: "improv-troop_full-wash"});
Messages.sendMessage(messageChannel, message);

Script.setTimeout(function(){
    var edit = {"keyLight": { intensity: 20}};
    Entities.editEntity(zoneId, edit);
}, 1500)

Script.setTimeout(function(){
    var message = JSON.stringify({ type: "addtransition", value: { name: "black_to_improv-troop", from: "blackout", to: "improv-troop_full-wash", duration: 5000, key: "x"}});
    Messages.sendMessage(messageChannel, message);
}, 4000)

Script.setTimeout(function(){
    var message = JSON.stringify({ type: "addtransition", value: { name: "improv-troop_to_black", from: "improv-troop_full-wash", to: "blackout", duration: 1000, key: "x"}});
    Messages.sendMessage(messageChannel, message);
}, 4000)

var message = JSON.stringify({ type: "executeTransitionByName", value: "black_to_improv-troop"});
Messages.sendMessage(messageChannel, message);

var message = JSON.stringify({ type: "executeTransitionByName", value: "improv-troop_to_black"});
Messages.sendMessage(messageChannel, message);

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
//     var message = JSON.stringify({ type: "loadsnapshot", value: "test2"});
//     Messages.sendMessage(messageChannel, message);
// }, 3500)

Script.setTimeout(function(){
    var message = JSON.stringify({ type: "addtransition", value: { name: "test3", from: "test1", to: "test2", duration: 10000, key: "x"}});
    Messages.sendMessage(messageChannel, message);
}, 4000)

Script.setTimeout(function(){
    var message = JSON.stringify({ type: "executeTransitionByName", value: "test3"});
    Messages.sendMessage(messageChannel, message);
}, 4500)


// Script.setTimeout(function(){
//     var message = JSON.stringify({ type: "animation", value: ["test1", "test2", "3000"]});
//     Messages.sendMessage(messageChannel, message);
// }, 3500)

// var message = JSON.stringify({ type: "loadsnapshot", value: "test2"});
// Messages.sendMessage(messageChannel, message);
