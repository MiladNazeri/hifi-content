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

// Tests
            // /////////////////////////////////////////////////////////////////////////// 
            /*
                var testSnapshotName ="SNAPTEST";
                var updatedSnapshotname = "UPDATED_SNAPTEST";
                var snapKey = "X";
                var transitionKey = "C";
                var newTransitionKey = "D";
                var snapTestTwo = "SnapTestTwo";
                var transitionName = "oneToTwo";
                var updatedTransitionName = "UPDATED_TRANSITION";
                var duration = 2000;
                console.log("\n\n\nSTARTING TESTS\n\n\n");
                
                console.log("\n\nTesting take snapshot\n");
                
                dataStore.snapshots.takeSnapshot();
                console.log("Tempsnapshot Object.keys > 0 : ", Object.keys(dataStore.snapshots.tempSnapshot).length > 0);
                console.log("snap shot has every light in choices: ", Object.keys(dataStore.snapshots.tempSnapshot).length === dataStore.choices.length);
                
                console.log("\n\nTesting add snapshot\n");
                
                // console.log(JSON.stringify(dataStore.snapshots.tempSnapshot));
                dataStore.snapshots.addSnapshot(testSnapshotName);
                console.log("Snapshot exists in snapshot store : ", dataStore.snapshots.snapshotStore[testSnapshotName].name === testSnapshotName);
                console.log("temp snapshot is empty : ", Object.keys(dataStore.snapshots.tempSnapshot).length === 0);
                
                console.log("\n\nTesting rename snapshot\n");         
                
                dataStore.snapshots.renameSnapshot(testSnapshotName, updatedSnapshotname);
                console.log("Snapshot name updated and exists: ", Object.keys(dataStore.snapshots.snapshotStore).indexOf(updatedSnapshotname) > -1);
                console.log("old Snapshot name doesnt exist: ", Object.keys(dataStore.snapshots.snapshotStore).indexOf(testSnapshotName) === -1);
                
                console.log("\n\nTesting Assign snapshot to key\n"); 

                dataStore.snapshots.assignSnapshotToKey(updatedSnapshotname, snapKey);
                console.log("X assigned to snapshot: ", dataStore.snapshots.snapshotStore[updatedSnapshotname].key === snapKey);
                // console.log(JSON.stringify(dataStore.snapshots.snapshotStore));            
                
                console.log("\n\nTesting Adding transition\n");

                dataStore.snapshots.takeSnapshot();
                dataStore.snapshots.addSnapshot(snapTestTwo);
                dataStore.snapshots.addTransition(transitionName, updatedSnapshotname, snapTestTwo, duration, transitionKey);
                console.log("Transition exits: ", Object.keys(dataStore.snapshots.transitionStore).indexOf(transitionName) > -1);
                console.log("Transition correct name : ", dataStore.snapshots.transitionStore[transitionName].name === transitionName);
                console.log("Transition correct from : ", dataStore.snapshots.transitionStore[transitionName].from === updatedSnapshotname);               
                console.log("Transition correct to : ", dataStore.snapshots.transitionStore[transitionName].to === snapTestTwo);                              
                console.log("Transition correct duration : ", dataStore.snapshots.transitionStore[transitionName].duration === duration);              
                console.log("Transition correct key : ", dataStore.snapshots.transitionStore[transitionName].key === transitionKey);               
                
                console.log("\n\nTesting updateTransitionName \n");         
                
                dataStore.snapshots.renameTransition(transitionName, updatedTransitionName);
                console.log("TRANSITION name updated and exists: ", Object.keys(dataStore.snapshots.transitionStore).indexOf(updatedTransitionName) > -1);
                console.log("old transition name doesnt exist: ", Object.keys(dataStore.snapshots.transitionStore).indexOf(transitionName) === -1);
                
                console.log("\n\nTesting Assign snapshot to key\n"); 

                dataStore.snapshots.assignTransitionToKey(updatedTransitionName, newTransitionKey);
                console.log("D assigned to snapshot: ", dataStore.snapshots.transitionStore[updatedTransitionName].key === newTransitionKey);
                // console.log(JSON.stringify(dataStore.snapshots.snapshotStore));            
                
                console.log("\n\nTesting getSnapshotLightkeys \n");         
                console.log("dataStore.snapshots.getSnapshotLightkeys(updatedSnapshotname); ", dataStore.snapshots.getSnapshotLightkeys(updatedSnapshotname));                
                
                console.log("\n\nTesting getSnapshotPropertyKeys \n");         
                console.log("dataStore.snapshots.getSnapshotPropertyKeys(updatedSnapshotname); ", dataStore.snapshots.getSnapshotPropertyKeys(updatedSnapshotname, LIGHTS_ACCENT_SPOT_HOUSE));                
                
                console.log("old transition name doesnt exist: ", Object.keys(dataStore.snapshots.transitionStore).indexOf(transitionName) === -1);
                
                */
            
                // NOT COVERED
                /*
                    dataStore.snapshots.loadSnapshot
                    dataStore.snapshots.getSnapshotLightkeys
                    dataStore.snapshots.getSnapshotPropertyKeys
                    dataStore.snapshots.startTransition

                // CLEAN UP
                console.log("\n\nTesting remove transition\n");         

                dataStore.snapshots.removeTransition(updatedTransitionName);
                console.log("Transition no longer exists: ", Object.keys(dataStore.snapshots.transitionStore).indexOf(transitionName) === -1);

                console.log("\n\nTesting remove snapshot\n");         

                dataStore.snapshots.removeSnapshot(updatedSnapshotname);
                console.log("Snapshot no longer exists: ", Object.keys(dataStore.snapshots.snapshotStore).indexOf(updatedSnapshotname) === -1);
                
                console.log("\n\n\nENDING TESTS TESTS\n\n\n");
                */

                // lights[LIGHTS_ACCENT_SPOT_HOUSE_LEFT].updateFromIntensity(1000);
                // lights[LIGHTS_ACCENT_SPOT_HOUSE_LEFT].updateToIntensity(-1000);
                // lights[LIGHTS_ACCENT_SPOT_HOUSE_LEFT].updateTransitionIntensityDuration(1000);
                // lights[LIGHTS_ACCENT_SPOT_HOUSE_LEFT].startAnimation();

                // lights[LIGHTS_ZONE_STAGE].updateFromIntensity(10);
                // lights[LIGHTS_ZONE_STAGE].updateToIntensity(-1);
                // lights[LIGHTS_ZONE_STAGE].updateTransitionIntensityDuration(20000);
                // lights[LIGHTS_ZONE_STAGE].startAnimation();