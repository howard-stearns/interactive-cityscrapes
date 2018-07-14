var returnButton;
var debugLabel = 'hrs6';
var browserID = '{bb521a02-3d14-480c-809c-bc7c89375891}'; // Entity Id of the browser's Web Entity.
var home = 'black-microchip-7727';

var script = Script.resolvePath('')
print(debugLabel, 'loading', script);
var lockedMapping = Controller.newMapping(script + 'locked');
var touchMapping = Controller.newMapping(script + 'touch');

// Inherited:
// Keyboard.A/D => Actions.Yaw
// Touchscreen.DragLeft/Right => Actions.Yaw w/scale
//
// Keyboard.W => Actions.LONGITUDINAL_FORWARD
//
// Keyboard.TouchpadUp/Down => Actions.PITCH_UP/DOWN
// Touchscreen.DragUp/Down => Actions.Pitch w/scale
//
// Keyboard.MouseWheelLeft/Right => Actions.BOOM_OUT/IN
// Touchscreen.GesturePinchOut/In => Actions.BoomOut/In w/scale

var keyboard = Controller.Hardware.Keyboard;
if (keyboard) {
    lockedMapping.from(keyboard.MouseWheelLeft).to(function () { print('HRS IGNORE MouseWheelLeft BOOM_OUT'); });
    lockedMapping.from(keyboard.MouseWheelRight).to(function () { print('HRS IGNORE MouseWheelRight BOOM_IN'); })
    lockedMapping.from(keyboard.TouchpadUp).to(function () { print('HRS IGNORE TouchpadUp PITCH_UP'); });
    lockedMapping.from(keyboard.TouchpadDown).to(function () { print('HRS IGNORE TouchpadDown PITCH_DOWN'); });
    lockedMapping.from(keyboard.MouseMoveUp).when(keyboard.RightMouseButton).to(function () { print('HRS IGNORE MouseMoveLeft PITCH_UP'); });
    lockedMapping.from(keyboard.MouseMoveDown).when(keyboard.RightMouseButton).to(function () { print('HRS IGNORE MouseMoveDown PITCH_DOWN'); });
    lockedMapping.from(keyboard.MouseMoveUp).when(keyboard.RightMouseButton).to(function () { print('HRS IGNORE MouseMoveLeft PITCH_UP'); });
    lockedMapping.from(keyboard.MouseMoveLeft).when(keyboard.RightMouseButton).to(function () { print('HRS IGNORE MouseMoveLeft Yaw'); });
    lockedMapping.from(keyboard.MouseMoveRight).when(keyboard.RightMouseButton).to(function () { print('HRS IGNORE MouseMoveRight Yaw'); });
}
var touchscreen = Controller.Hardware.Touchscreen;
if (touchscreen) {
    lockedMapping.from(touchscreen.GesturePinchOut).to(function () { print('HRS IGNORE GesturePinchOut BoomOut'); });
    lockedMapping.from(touchscreen.GesturePinchIn).to(function () { print('HRS IGNORE GesturePinchIn BoomIn'); });
    lockedMapping.from(touchscreen.DragLeft).to(function () { print('HRS IGNORE DragLeft Yaw'); });
    lockedMapping.from(touchscreen.DragRight).to(function () { print('HRS IGNORE DragRight Yaw'); });
    lockedMapping.from(touchscreen.DragUp).to(function () { print('HRS IGNORE DragUp Pitch'); });
    lockedMapping.from(touchscreen.DragDown).to(function () { print('HRS IGNORE DragDown Pitch'); });
}

var lockedEnabled = false;
function enableLocked(isEnabled) {
    if (lockedEnabled === isEnabled) { return; }
    if (isEnabled) {
        lockedMapping.enable();

    } else {
        lockedMapping.disable();
    }
    lockedEnabled = isEnabled;
}
var touchEnabled = false;
function enableTouch(isEnabled) {
    if (touchEnabled === isEnabled) { return; }
    if (isEnabled) {
        touchMapping.enable();
    } else {
        touchMapping.disable();
    }
    touchEnabled = isEnabled;
}

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
    enableTouch(true);
    enableLocked(false);
}
function unwireButton() {
    if (!returnButton) { return; }
    Overlays.deleteOverlay(returnButton);
    returnButton = null;
    enableTouch(false);
    enableLocked(true);
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
    Camera.setModeString("first person");
    location.handleLookupString(home, false);
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
            if (location.hostname === home) { // If we're already here, we won't be reloading, which resets the url.
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
    wireButtonUnless(host === home);
}

// Fancier version to handle easel and chappel being in the same domain.
// Needed when home is 'localhost', but not needed when home and chappel are different names (like 'black-microchip-7727' and 'localhost').
// function onLocationChangeRequired(position, hasOrientationChange, orientation, shouldFaceLocation) {
//     print(debugLabel, 'locationChangeRequired', JSON.stringify(position), hasOrientationChange, JSON.stringify(orientation), shouldFaceLocation);
//     if (location.hostname !== home) { return; }
//     wireButtonUnless(Vec3.distance(position, {"x":0,"y":0,"z":-10}) > 0.5);
// }

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
    enableLocked(false);
    Controller.mousePressEvent.disconnect(mousePressEvent);
    location.hostChanged.disconnect(onHostChange);
    //location.locationChangeRequired.disconnect(onLocationChangeRequired);
// debugging
//location.pathChangeRequired.disconnect(onPathChangeRequired);
//location.possibleDomainChangeRequired.disconnect(onPossibleDomainChangeRequired);
//location.possibleDomainChangeRequiredViaICEForID.disconnect(onPossibleDomainChangeRequiredViaICEForID);
}

setButton();
Script.scriptEnding.connect(cleanup);
Controller.mousePressEvent.connect(mousePressEvent);
location.hostChanged.connect(onHostChange);
//location.locationChangeRequired.connect(onLocationChangeRequired);
print(debugLabel, 'loaded');
