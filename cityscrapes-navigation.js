var returnButton;
var debugLabel = 'hrs6';
//var browserID = '{3cad459f-fce0-43e2-b71a-59c8597ed483}';
var browserID = '{bb521a02-3d14-480c-809c-bc7c89375891}';
print(debugLabel, 'loading');

function setButton() {
    print(debugLabel, 'button creation');
    returnButton = Overlays.addOverlay("image", {
        x: 100,
        y: 350,
        width: 100,
        height: 100,
        // imageURL: "http://s3.amazonaws.com/hifi-public/images/close.png",
        imageURL: "file:///C:/Users/howar_000/Desktop/interactive-cityscrapes/back to studio button.black.png"
    });
}

function wireButton() {
    print(debugLabel, 'wireButton existing:', returnButton);
    if (returnButton) { return; }
    setButton();
}
function unwireButton() {
    if (!returnButton) { return; }
    Overlays.deleteOverlay(returnButton);
    returnButton = null;
}

function mousePressEvent(event) {
    // returnButton is only present when we're travelling.
    print(debugLabel, 'mousePressEvent existing:', returnButton);
    if (returnButton) {
        var clickedOverlay = Overlays.getOverlayAtPoint({
            x: event.x,
            y: event.y
        });
        print(debugLabel, 'clicked:', clickedOverlay, 'button:', returnButton);
        if (clickedOverlay === returnButton) {
            location.handleLookupString("localhost/0,0,0/0,0,0,1.0", false);
            Script.setTimeout(function () {
                Entities.editEntity(browserID, {"sourceUrl": "http://aubreyhaase.com/wp-content/uploads/2016/12/blog-3-pic.jpg"});
                print(debugLabel, 'set url to', Entities.getEntityProperties(browserID, ["sourceUrl"]).sourceUrl);
                Script.setTimeout(function () {
                    Entities.editEntity(browserID, {"sourceUrl": "file:///C:/Users/howar_000/Desktop/interactive-cityscrapes/studio.html"});
                    print(debugLabel, 'set url to', Entities.getEntityProperties(browserID, ["sourceUrl"]).sourceUrl);
                }, 100);
            }, 100);
        }
        return;
    }
}

function onLocationChangeRequired(position, hasOrientationChange, orientation, shouldFaceLocation) {
    print(debugLabel, 'locationChangeRequired', JSON.stringify(position), hasOrientationChange, JSON.stringify(orientation), shouldFaceLocation);
    if (location.hostname !== 'localhost') { return; }
    if (Vec3.distance(position, {"x":0,"y":0,"z":-10}) > 0.5) { 
        unwireButton();
    } else {
        wireButton();
    }
}
function onPathChangeRequired(path) { print(debugLabel, 'pathChangeRequired', JSON.stringify(path)); }
function onPossibleDomainChangeRequired(domainUrl, domainID) {
    print(debugLabel, 'possibleDomainChangeRequired', domainUrl, domainID);
}
function onPossibleDomainChangeRequiredViaICEForID(hostName, domainID) {
    print(debugLabel, 'possibleDomainChangeRequiredViaICEForID', hostName, domainID);
}
location.locationChangeRequired.connect(onLocationChangeRequired);
location.pathChangeRequired.connect(onPathChangeRequired);
location.possibleDomainChangeRequired.connect(onPossibleDomainChangeRequired);
location.possibleDomainChangeRequiredViaICEForID.connect(onPossibleDomainChangeRequiredViaICEForID);

function onLocationChange(host) {
    print(debugLabel, 'location change', host);
    if (host === 'localhost') {
        unwireButton();
    } else {
        wireButton();
    }
}

setButton();
function cleanup() {
    print(debugLabel, 'cleanup');
    unwireButton();
    Controller.mousePressEvent.disconnect(mousePressEvent);
    location.hostChanged.disconnect(onLocationChange);
location.locationChangeRequired.disconnect(onLocationChangeRequired);
location.pathChangeRequired.disconnect(onPathChangeRequired);
location.possibleDomainChangeRequired.disconnect(onPossibleDomainChangeRequired);
location.possibleDomainChangeRequiredViaICEForID.disconnect(onPossibleDomainChangeRequiredViaICEForID);

}

Script.scriptEnding.connect(cleanup);
Controller.mousePressEvent.connect(mousePressEvent);
location.hostChanged.connect(onLocationChange);
print(debugLabel, 'loaded');
