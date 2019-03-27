(function(){
    var botCount = 1;

    function findValue(index, array, offset) {
        offset = offset || 0;
        return array[(index + offset) % array.length];
    }

    var jenaUrls = [];
    for (var i = 1; i < 161; i++) {
        jenaUrls.push(
            "https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/Projects/Testing/Flow/out/Jene_5_" +
            i +
            "/Jene_5_" +
            i +
            ".fst"
        );
    }

    function changeJena(){
        var jena = findValue(botCount, jenaUrls);
        MyAvatar.skeletonModelURL = jena;
        botCount++;
    }

    var CHANGE_INTERVAL = 10000;

    var jenaChange = Script.setInterval(changeJena, CHANGE_INTERVAL);

    Script.scriptEnding.connect(function(){
        Script.clearInterval(jenaChange);
    });

})();
