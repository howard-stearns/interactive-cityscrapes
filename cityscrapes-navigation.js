var returnButton;
var debugLabel = 'hrs6';
var browserID = '{bb521a02-3d14-480c-809c-bc7c89375891}';
print(debugLabel, 'loading');

function setButton() {
    print(debugLabel, 'button creation');
    returnButton = Overlays.addOverlay("image", {
        x: 100,
        y: 350,
        width: 100,
        height: 100,
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
function wireButtonUnless(toBeUnwired) {
    if (toBeUnwired) {
        unwireButton();
    } else {
        wireButton();
    }
}

function goHome() {
    MyAvatar.resetSensorsAndBody(); // Is there a better way?
    location.handleLookupString("localhost/0,0,0/0,0,0,1.0", false);
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
            if (location.hostname === 'localhost') { // If we're already here, we won't be reloading, which resets the url.
                Entities.editEntity(browserID, {"sourceUrl": "http://aubreyhaase.com/wp-content/uploads/2016/12/blog-3-pic.jpg"});
                print(debugLabel, 'set url to', Entities.getEntityProperties(browserID, ["sourceUrl"]).sourceUrl);
                Script.setTimeout(function () {
                    Entities.editEntity(browserID, {"sourceUrl": "file:///C:/Users/howar_000/Desktop/interactive-cityscrapes/studio.html"});
                    print(debugLabel, 'set url to', Entities.getEntityProperties(browserID, ["sourceUrl"]).sourceUrl);
                    Script.setTimeout(goHome, 1000);
                }, 100);
            } else {
                goHome();
            }
        }
        return;
    }
}

function onHostChange(host) {
    print(debugLabel, 'host change', host);
    wireButtonUnless(host === 'localhost');
}
// Fancier version to handle easel and chappel being in the same domain.
function onLocationChangeRequired(position, hasOrientationChange, orientation, shouldFaceLocation) {
    print(debugLabel, 'locationChangeRequired', JSON.stringify(position), hasOrientationChange, JSON.stringify(orientation), shouldFaceLocation);
    if (location.hostname !== 'localhost') { return; }
    wireButtonUnless(Vec3.distance(position, {"x":0,"y":0,"z":-10}) > 0.5);
}
// These are for debugging.
//function onPathChangeRequired(path) { print(debugLabel, 'pathChangeRequired', JSON.stringify(path)); }
//function onPossibleDomainChangeRequired(domainUrl, domainID) { print(debugLabel, 'possibleDomainChangeRequired', domainUrl, domainID); }
//function onPossibleDomainChangeRequiredViaICEForID(hostName, domainID) { print(debugLabel, 'possibleDomainChangeRequiredViaICEForID', hostName, domainID); }
//location.pathChangeRequired.connect(onPathChangeRequired);
//location.possibleDomainChangeRequired.connect(onPossibleDomainChangeRequired);
//location.possibleDomainChangeRequiredViaICEForID.connect(onPossibleDomainChangeRequiredViaICEForID);

function cleanup() {
    print(debugLabel, 'cleanup');
    unwireButton();
    Controller.mousePressEvent.disconnect(mousePressEvent);
    location.hostChanged.disconnect(onHostChange);
    location.locationChangeRequired.disconnect(onLocationChangeRequired);
// debugging
//location.pathChangeRequired.disconnect(onPathChangeRequired);
//location.possibleDomainChangeRequired.disconnect(onPossibleDomainChangeRequired);
//location.possibleDomainChangeRequiredViaICEForID.disconnect(onPossibleDomainChangeRequiredViaICEForID);
}

setButton();
Script.scriptEnding.connect(cleanup);
Controller.mousePressEvent.connect(mousePressEvent);
location.hostChanged.connect(onHostChange);
location.locationChangeRequired.connect(onLocationChangeRequired);
print(debugLabel, 'loaded');
