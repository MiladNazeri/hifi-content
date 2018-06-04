var id_SlideUrl = $("#slideUrl");
var id_update = $("#update");
var id_Next = $("#next");
var id_Prev = $("#prev");


var slideVal;
var url = "https://swanky-bangle.glitch.me/"

id_update.on("click", function() {
    slideVal = "https:" + id_SlideUrl.val();
    $.post(url + "slideUrl", { url: slideVal });
});

id_Next.on("click", function() {
    $.get(url + "fwd");
});

id_Prev.on("click", function() {
    $.get(url + "bwd");
});


/*
    var event = {
        type: "update",
        totalGridObjects: id_totalGridObjects.val(),
        numberOfRows: id_numberOfRows.val(),
        numberOfCol: id_numberOfCol.val(),
        depth: id_depth.val(),
        xoffset: id_xoffset.val(),
        yoffset: id_yoffset.val(),
        zoffset: id_zoffset.val(),
        dimx: id_dimx.val(),
        dimy: id_dimy.val(),
        dimz: id_dimz.val()
    };
    //slides.com/milfi/deck-2/embed
    EventBridge.emitWebEvent(JSON.stringify(event));
    <iframe src="//slides.com/milfi/deck-2/embed" width="576" height="420" scrolling="no" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
*/