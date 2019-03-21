/*

    Italian
    wordBuilder.js
    Created by Milad Nazeri on 2019-03-21
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    Build out the words from the google sheet/

*/

// Create the category
// Create the italian text
// Create the English text
// Parent those to the category
// Create a list of cateogries(should be done already but map to ids)
// Create a map of text (maybe)
// Alternate the colors of text
// Text Color 1
// Text color 2
// Text backgroun color 1
// Text background color 2
// Create the room
// Adjust the room for how long the category is
// adjust the category to how long the group of texts are
// bring in text builder and calculate the text size from that
// Position the rooms in rows
// Position the rooms in columns
// Add Audio if you step close to a card
// Distance between cards
// Distance between rooms
// Distance between columns
// Dynamically adjust the floor based on rows
// Should I make it a second story? 
// Give the rooms random materials for the walls
// Randomize the floor texture for the room?
// Rooms should be Floor, Ceiling, Wall1, Wall2, Wall3, DoorA, DoorB
// Minimum distance between doors

(function(){

    // bring in text builder
    var GOOGLE_SHEET = "https://script.google.com/macros/s/AKfycbwB58EOQcL-m44oc6-lXPTwnchIl1vC7HpylBNvwQgUQ2ODTy0/exec";
    var request = Script.require("request").request;
    var log = Script.require('https://hifi-content.s3.amazonaws.com/milad/ROLC/d/ROLC_High-Fidelity/02_Organize/O_Projects/Repos/hifi-content/developerTools/sharedLibraries/easyLog/easyLog.js')
    log("v3");
    
    var googleShetsWords = [];
    var transformedWords = {};

    var FLOOR_ORIGIN = [0,0,0];
    var CARD_HEIGHT = 1;
    var DISTANCE_FROM_GROUND = 1;
    var DISTANCE_BETWEEN_CARDS = 1;
    var MAXIUM_PER_ROW = 5;
    var DISTANCE_BETWEEN_ROWS = 2;

    function transformWords(words){
        words.forEach(function(word){
            if (!transformedWords[word.category]){
                transformedWords[word.category] = [];
            }
            transformedWords[word.category].push(word);
        });
    }
    function getGoogleShetWord(){
        request({
            uri: GOOGLE_SHEET
        }, function (error, response) {
            if (error || !response) {
                log("error")
                return;
            }
            if (response.status && response.status === "success") {
                log("success");
                if (response.words) {
                    googleShetsWords = response.words;
                    log("googleSheetWords", googleShetsWords);
                    transformWords(googleShetsWords);
                    log("transformedWords", transformedWords);
                }
            }
        });

    }

    function startUp(){
        getGoogleShetWord();
    }

    startUp();

})();