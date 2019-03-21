/*

    italian
    buttonSwitch.js
    Created by Milad Nazeri on 2019-03-20
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    toggle button types

*/


(function(){
    var ENGLISH = "english";
    var ITALIAN = "italian";
    var _entityID = null;
    var userData = null;
    var type = null;
    var iSearch = /_i$/g;
    var eSearch = /_e$/g;
    var searchTerm = null;
    var RADIUS = 1000;
    var log = Script.require('https://hifi-content.s3.amazonaws.com/milad/ROLC/d/ROLC_High-Fidelity/02_Organize/O_Projects/Repos/hifi-content/developerTools/sharedLibraries/easyLog/easyLog.js')
    log("v5");
    function preload(id){
        _entityID = id;
        userData = JSON.parse(Entities.getEntityProperties(id).userData);
        type = userData.type;
        searchTerm = type === ITALIAN ? iSearch : eSearch;
        log("searchTerm", searchTerm);
    }

    
    function onClick(){
        log("running on click");
        Entities.findEntities(MyAvatar.position, RADIUS)
            .forEach(function(entity){
                // log("enity", entity);
                var props = Entities.getEntityProperties(entity);
                var name = props.name;
                log("search", name.search(searchTerm));
                if (name.search(searchTerm) > -1) {
                    log("name", name);
                    var visible = props.visible;
                    log("visible", visible);
                    Entities.editEntity(entity, {visible: !visible});
                }
            });
    }

    function mousePressOnEntity(){
        console.log("clicked");
        onClick();
    }

    function ButtonSwitch(){
        
    }


    ButtonSwitch.prototype = {
        preload: preload,
        mousePressOnEntity: mousePressOnEntity
    };

    return new ButtonSwitch();
});