var returnButton;
var debugLabel = 'hrs6';
var browserID = '{3cad459f-fce0-43e2-b71a-59c8597ed483}';

// Notes:
// Laptop fullscreen display is 1920 x 1080
// Browser 800 x 600

function wireButton() {
  if (returnButton) { return; }
  returnButton = Overlays.addOverlay("image", {
    x: 100,
    y: 350,
    width: 50,
    height: 50,
    imageURL: "http://s3.amazonaws.com/hifi-public/images/close.png",
    color: {
        red: 255,
        green: 255,
        blue: 255
    },
    alpha: 1
  });
}
function unwireButton() {
    if (!returnButton) { return; }
    Overlays.deleteOverlay(returnButton);
    returnButton = null;
}

var hackcount = 0;
function mousePressEvent(event) {
    var clickedOverlay = Overlays.getOverlayAtPoint({
        x: event.x,
        y: event.y
    });

    // returnButton is only present when we're travelling.
    if (returnButton) {
        if (clickedOverlay === returnButton) {
            print(debugLabel, hackcount, 'return button');
            location.handleLookupString("localhost/4.43,-10.5154,27/0,1.0,0,0", false)
        }
        return;
    }
    
    // A click on the web entity: Find out what we're zoomed into.
    var data = Entities.getEntityProperties(browserID, 'sourceUrl');
    print(debugLabel, hackcount, 'data', data);
    if (!data) { return; }
    var sourceUrl = data.sourceUrl;
    var base = sourceUrl.slice(sourceUrl.lastIndexOf('/') + 1, -5)
    print(debugLabel, hackcount, 'sourceUrl', sourceUrl, 'base', base);
    if (hackcount++ > 0) base = 'national-park';

    if (base === 'studio') { return; } // If we're on the studio picture, do nothing.
    location.handleLookupString(base, false);  // Else, go to the place that matches the picture name.
}

function onLocationChange(host) {
    hackcount = 0;
    print(debugLabel, hackcount, 'location change', host);
    if (host === 'localhost') {
        unwireButton();
        print(debugLabel, 'set hackcount', hackcount);
    } else {
        wireButton();
    }
}

function cleanup() {
    unwireButton();
    Controller.mousePressEvent.disconnect(mousePressEvent);
    location.hostChanged.disconnect(onLocationChange);
}

Script.scriptEnding.connect(cleanup);
Controller.mousePressEvent.connect(mousePressEvent);
location.hostChanged.connect(onLocationChange);
