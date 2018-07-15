var returnButton;
var debugLabel = 'hrs8';
var browserID = '{bb521a02-3d14-480c-809c-bc7c89375891}'; // Entity Id of the browser's Web Entity.
var home = 'black-microchip-7727';

var script = Script.resolvePath('')
print(debugLabel, 'loading', script);
var lockedMapping = Controller.newMapping(script + 'locked');
var touchMapping = Controller.newMapping(script + 'touch');

var FIRST_PERSON = "first person";
function isFirstPerson() {
    return Camera.mode === FIRST_PERSON;
}
function isNotFirstPerson() {
    return Camera.mode !== FIRST_PERSON;
}

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

var actions = Controller.Actions;
var keyboard = Controller.Hardware.Keyboard;
var vscale = 0.05;
var hscale = 0.05;
if (keyboard) {
    lockedMapping.from(keyboard.MouseWheelLeft).to(function () { print(debugLabel, 'IGNORE MouseWheelLeft BOOM_OUT'); });
    lockedMapping.from(keyboard.MouseWheelRight).to(function () { print(debugLabel, 'IGNORE MouseWheelRight BOOM_IN'); });
    lockedMapping.from(keyboard.TouchpadUp).to(function () { print(debugLabel, 'IGNORE TouchpadUp PITCH_UP'); });
    lockedMapping.from(keyboard.TouchpadDown).to(function () { print(debugLabel, 'IGNORE TouchpadDown PITCH_DOWN'); });
    lockedMapping.from(keyboard.MouseMoveUp).when(keyboard.RightMouseButton).to(function () { print(debugLabel, 'IGNORE MouseMoveLeft PITCH_UP'); });
    lockedMapping.from(keyboard.MouseMoveDown).when(keyboard.RightMouseButton).to(function () { print(debugLabel, 'IGNORE MouseMoveDown PITCH_DOWN'); });
    lockedMapping.from(keyboard.MouseMoveUp).when(keyboard.RightMouseButton).to(function () { print(debugLabel, 'IGNORE MouseMoveLeft PITCH_UP'); });
    lockedMapping.from(keyboard.MouseMoveLeft).when(keyboard.RightMouseButton).to(function () { print(debugLabel, 'IGNORE MouseMoveLeft Yaw'); });
    lockedMapping.from(keyboard.MouseMoveRight).when(keyboard.RightMouseButton).to(function () { print(debugLabel, 'IGNORE MouseMoveRight Yaw'); });

    //touchMapping.from(keyboard.MouseWheelRight).when(isNotFirstPerson).to(actions.BOOM_IN);
    //touchMapping.from(keyboard.MouseWheelRight).when(isFirstPerson).scale(200).to(function (n) { print(debugLabel, 'zoom', n); }); //actions.LONGITUDINAL_FORWARD);
    touchMapping.from(keyboard.MouseMoveUp).when(keyboard.RightMouseButton).scale(vscale).to(actions.PITCH_DOWN);
    touchMapping.from(keyboard.MouseMoveDown).when(keyboard.RightMouseButton).scale(vscale).to(actions.PITCH_UP);
    touchMapping.from(keyboard.MouseMoveLeft).when(keyboard.RightMouseButton).scale(hscale).to(actions.YAW_RIGHT);
    touchMapping.from(keyboard.MouseMoveRight).when(keyboard.RightMouseButton).scale(hscale).to(actions.YAW_LEFT);
}
var touchscreen = Controller.Hardware.Touchscreen;
if (touchscreen) {
    lockedMapping.from(touchscreen.GesturePinchOut).to(function () { print(debugLabel, 'IGNORE GesturePinchOut BoomOut'); });
    lockedMapping.from(touchscreen.GesturePinchIn).to(function () { print(debugLabel, 'IGNORE GesturePinchIn BoomIn'); });
    lockedMapping.from(touchscreen.DragUp).to(function () { print(debugLabel, 'IGNORE DragUp Pitch'); });
    lockedMapping.from(touchscreen.DragDown).to(function () { print(debugLabel, 'IGNORE DragDown Pitch'); });
    lockedMapping.from(touchscreen.DragLeft).to(function () { print(debugLabel, 'IGNORE DragLeft Yaw'); });
    lockedMapping.from(touchscreen.DragRight).to(function () { print(debugLabel, 'IGNORE DragRight Yaw'); });

    touchMapping.from(touchscreen.DragUp).scale(vscale).to(actions.PITCH_DOWN);
    touchMapping.from(touchscreen.DragDown).scale(vscale).to(actions.PITCH_UP);
    touchMapping.from(touchscreen.DragLeft).scale(hscale).to(actions.YAW_RIGHT);
    touchMapping.from(touchscreen.DragRight).scale(hscale).to(actions.YAW_LEFT);
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

var toolbar = Toolbars.getToolbar("com.highfidelity.interface.toolbar.system");
function goHome() {
    print(debugLabel, 'goHome');
    MyAvatar.resetSensorsAndBody(); // Is there a better way?
    Camera.setModeString(FIRST_PERSON);
    AvatarInputs.showAudioTools = false;  // defaults after reset settings to true
    toolbar.writeProperty("x", 0 - toolbar.readProperty("width") + 5); // slide it out of the way
    location.handleLookupString(home, false);
    Menu.setIsOptionChecked("Fullscreen", true);
    Script.setTimeout(function () {
        toolbar.writeProperty("y", Controller.getViewportDimensions().y - 5) // slide below (so as to avoid menu)
        if (!Settings.getValue("toolbar/constrainToolbarToCenterX")) { // I couldn't find a way to unset this by script
            toolbar.writeProperty("x", 0 - toolbar.readProperty("width") + 5); // slide left, too
        }
    }, 100); // Can't be while going to fullscreen.
}
function resetUrlIfNeededAndGoHome() {
    if (location.hostname === home) { // If we're already here, we won't be reloading, which resets the url.
        // WebEntity doesn't really reset when you change to what it was last EXTERNALLY set to, even if now on a different page.
        Entities.editEntity(browserID, {"sourceUrl": "http://aubreyhaase.com/wp-content/uploads/2016/12/blog-3-pic.jpg"});
        print(debugLabel, 'first set url to', Entities.getEntityProperties(browserID, ["sourceUrl"]).sourceUrl);
        Script.setTimeout(function () {
            Entities.editEntity(browserID, {"sourceUrl": "file:///C:/Users/howar_000/Desktop/interactive-cityscrapes/studio.html"});
            print(debugLabel, 'set url to', Entities.getEntityProperties(browserID, ["sourceUrl"]).sourceUrl);
            Script.setTimeout(goHome, 100);
        }, 100);
    } else {
        goHome();
    }
}

var inactivityTimeout;
function cancelTimeout() {
    print(debugLabel, 'cancelTimeout');
    if (inactivityTimeout) {
        Script.clearInterval(inactivityTimeout);
        inactivityTimeout = null;
    }
}
function resetInactivityTimeout() {
    cancelTimeout();
    inactivityTimeout = Script.setTimeout(function () {
        resetUrlIfNeededAndGoHome();
        resetInactivityTimeout();
    }, 1000 * 60 * 3);
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
            resetUrlIfNeededAndGoHome();
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
    cancelTimeout();
    Controller.mousePressEvent.disconnect(resetInactivityTimeout);
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

Script.scriptEnding.connect(cleanup);
Controller.mousePressEvent.connect(mousePressEvent);
location.hostChanged.connect(onHostChange);
//location.locationChangeRequired.connect(onLocationChangeRequired);
if (location.hostname === '') {
    wireButton();
} else {
    enableLocked(true);
}
Controller.mousePressEvent.connect(resetInactivityTimeout);
print(debugLabel, 'loaded');
