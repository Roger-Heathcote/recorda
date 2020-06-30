"use strict";

function main() {
    const RecorderApp = require("./RecorderApp.js");
    const AudioEngine = require("./AudioEngine.js");
    const MouseStatus = require("./MouseStatus.js");
    const WaveformDisplay = require("./WaveformDisplay.js");
    const views = require("./views.js");
    const audioPresets = require("./audioPresets.js");

    let bufferLengthSelector = document.getElementById("bufferLengthSelector");
    let initialBufferLength = Number(bufferLengthSelector.value);
    let audioQualitySelector = document.getElementById("audioQualitySelector");
    let audioOptions = audioPresets[audioQualitySelector.value];
    let theCanvas = document.getElementById("waveform");
    let theOverlay = false;

    const loResWaveformParams = {dataPoints: 1000};
    const overlayResizeListenerFunction = function overlayResizeListener() {
        let rect = theCanvas.getBoundingClientRect();
        let pos = getPosition(theCanvas);
        theOverlay.style.left = pos.x + "px";
        theOverlay.style.top = pos.y + "px";
        theOverlay.style.width = rect.right - rect.left + "px";
        theOverlay.style.height = rect.bottom - rect.top + "px";
    };

    // INIT RECORDER
    let recorder = new RecorderApp(
        window,
        navigator,
        AudioEngine,
        initialBufferLength,
        audioOptions,
        {
            canvas: theCanvas,
            MouseStatus: MouseStatus,
            WaveformDisplay: WaveformDisplay,
            loResWaveformParams: loResWaveformParams,
            recordingsListChangedCallback: recordingsListChangedCallback,
            enteringSaveModeCallback: enteringSaveModeCallback,
            exitingSaveModeCallback: exitingSaveModeCallback,
            saveModeUpdateCallback: saveModeUpdateCallback,
            dataDisplayChangedCallback: dataDisplayChangedCallback,
            scriptProcessorBufferLength: 4096,
            saveEngineFiresEveryXMs: 15,
            saveEngineRunsForAboutXMs: 8
        }
    );

    recorder.init(); //

    // VIEWS, DRAW YOURSELVES ONCE
    resizeCanvas();
    refreshOptionsView();
    refreshDataDisplay();
    refreshTimeline();
    setInterval(refreshDataDisplay, 5 * 1000); // and then every 5 seconds
    setInterval(refreshRecordings, 60 * 1000); // and then every 60 seconds

    // ADD IN EVENT LISTENERS
    window.addEventListener("resize", resizeCanvas, false);

    // KEYDOWN DELEGATOR
    window.addEventListener("keydown", keyClickDelegator, true);
    let keyHandlers = {
        73: recorder.setPointAt.bind(null, 0), // I
        49: recorder.setPointAt.bind(null, 0.1), // 1
        50: recorder.setPointAt.bind(null, 0.2), // 2
        51: recorder.setPointAt.bind(null, 0.3), // 3
        52: recorder.setPointAt.bind(null, 0.4), // 4
        53: recorder.setPointAt.bind(null, 0.5), // 5
        54: recorder.setPointAt.bind(null, 0.6), // 6
        55: recorder.setPointAt.bind(null, 0.7), // 7
        56: recorder.setPointAt.bind(null, 0.8), // 8
        57: recorder.setPointAt.bind(null, 0.9), // 9
        65: recorder.setPointAt.bind(null, 1), // A
        79: recorder.setPointAt.bind(null, 0), // O
        27: recorder.cancel, // ESC
        83: savePressed, // S
        68: deletePressed, // D
        80: playPausePressed, // P
        89: yesPressed, // Y
        38: upPressed, // UP
        40: downPressed // DOWN
    };
    function keyClickDelegator(event) {
        let key = event.keyCode;
        // console.log("KEYCODE:", key);
        if (keyHandlers.hasOwnProperty(key)) {
            keyHandlers[key]();
        }
    }

    function savePressed() {
        console.log("Not implemented yet");
    }
    function deletePressed() {
        console.log("Not implemented yet");
    }
    function playPausePressed() {
        console.log("Not implemented yet");
    }
    function yesPressed() {
        console.log("Not implemented yet");
    }
    function upPressed() {
        console.log("Not implemented yet");
    }
    function downPressed() {
        console.log("Not implemented yet");
    }

    // CLICK DELEGATOR - TODO, refactor this, don't need object lookup, just name functions and buttonvals the same
    let stuffBlock = document.getElementById("stuff");
    stuffBlock.addEventListener("click", recordingsBlockClickDelegator, true);
    let clickHandlers = {
        save: saveClicked,
        delete: deleteClicked,
        options: optionsButtonClicked,
        audioPassthrough: audioPassthroughClicked,
        optionToggle: optionToggleClicked
    };
    function recordingsBlockClickDelegator(event) {
        let name = event.target.name;
        let value = event.target.value;
        if (!name) {
            return;
        }
        if (clickHandlers.hasOwnProperty(name)) {
            clickHandlers[name](value);
        }
    }

    bufferLengthSelector.addEventListener("change", bufferLengthOrQualityChanged);
    audioQualitySelector.addEventListener("change", bufferLengthOrQualityChanged);

    function bufferLengthOrQualityChanged() {
        recorder.changeLengthOrQuality(
            bufferLengthSelector.value,
            audioPresets[audioQualitySelector.value]
        );
        refreshTimeline(bufferLengthSelector.value);
    }

    function saveClicked(recordingID) {
        let recording = recorder.getRecordingByUuid(recordingID);
        let anchor = document.createElement("a");
        anchor.href = recording.url;
        anchor.download = recording.name + ".wav";
        document.body.appendChild(anchor);
        anchor.click();
    }
    function deleteClicked(recordingID) {
        recorder.deleteRecordingByUuid(recordingID);
    }
    function optionsButtonClicked() {
        console.log("Options button pressed");
    }
    function audioPassthroughClicked() {
        console.log("Passthrough toggled");
        recorder.toggleAudioPassthrough();
    }
    function optionToggleClicked(name) {
        console.log("Constraint toggled");
        recorder.toggleOptionalAudioConstraint(name);
    }

    // CANVAS RESIZE HANDLER. Make canvas responsive to scale changes
    function resizeCanvas() {
        theCanvas.width = document.getElementById("wrapper").offsetWidth;
    }

    // VIEW REFRESHERS
    function refreshOptionsView() {
        let block = document.getElementById("optionsBlock");
        block.innerHTML = views.optionsBlock(recorder.vmOptions());
    }
    function refreshDataDisplay() {
        let block = document.getElementById("dataDisplayBlock");
        block.innerHTML = views.dataDisplayBlock(recorder.vmDataDisplayBlock());
    }
    function refreshRecordings() {
        //let block = document.getElementById("recordingsBlock");
        let listElement = document.getElementById("recordingsList");
        let recordingsList = recorder.vmRecordings();
        views.recordingsBlock(document, listElement, recordingsList);
    }

    function refreshTimeline(t) {
        let tMax = t || initialBufferLength;
        let timelineMax = document.getElementById("timelineMax");
        timelineMax.innerHTML = tMax + "s ago";
    }

    // RECORDER NOTIFICATION CALLBACK HANDLERS
    function recordingsListChangedCallback() {
        refreshRecordings();
        refreshDataDisplay();
    }
    function dataDisplayChangedCallback() {
        refreshDataDisplay();
    }

    function enteringSaveModeCallback() {
        theCanvas.setAttribute("aria-disabled", "true");
        theOverlay = document.createElement("div");
        theOverlay.innerHTML = "Saving 00%";
        let rect = theCanvas.getBoundingClientRect();
        let pos = getPosition(theCanvas);
        theOverlay.setAttribute("class", "saveOverlayDiv");
        theOverlay.setAttribute("role", "progressbar");
        theOverlay.setAttribute("aria-valuemin", 0);
        theOverlay.setAttribute("aria-valuemax", 100);
        theOverlay.setAttribute("aria-valuenow", 0);
        theOverlay.setAttribute("aria-valuetext", "Saving");
        theOverlay.style.left = pos.x + "px";
        theOverlay.style.top = pos.y + "px";
        theOverlay.style.width = rect.right - rect.left + "px";
        theOverlay.style.height = rect.bottom - rect.top + "px";
        theOverlay.style.fontSize = (rect.bottom - rect.top) / 6 + "px";
        theOverlay.style.lineHeight = rect.bottom - rect.top + "px";
        window.addEventListener("resize", overlayResizeListenerFunction);
        document.body.appendChild(theOverlay);
    }

    function exitingSaveModeCallback() {
        window.removeEventListener("resize", overlayResizeListenerFunction);
        document.body.removeChild(theOverlay);
        theCanvas.setAttribute("aria-disabled", "false");
        theOverlay = undefined;
    }

    function saveModeUpdateCallback(val) {
        let percentage = val * 100;
        let paddedPercentage = ("00" + parseInt(percentage, 10)).substr(-2, 2);
        theOverlay.innerHTML = "Saving " + paddedPercentage + "%";
        theOverlay.setAttribute("aria-valuenow", percentage);
    }

    function getPosition(el) {
        // https://www.kirupa.com/html5/get_element_position_using_javascript.htm
        let xPos = 0;
        let yPos = 0;
        while (el) {
            if (el.tagName === "BODY") {
                // deal with browser quirks with body/window/document and page scroll
                let xScroll = el.scrollLeft || document.documentElement.scrollLeft;
                let yScroll = el.scrollTop || document.documentElement.scrollTop;
                xPos += el.offsetLeft - xScroll + el.clientLeft;
                yPos += el.offsetTop - yScroll + el.clientTop;
            } else {
                // for all other non-BODY elements
                xPos += el.offsetLeft - el.scrollLeft + el.clientLeft;
                yPos += el.offsetTop - el.scrollTop + el.clientTop;
            }
            el = el.offsetParent;
        }
        return {x: xPos, y: yPos};
    }
}

const settingsButton = document.getElementById("settingsButton");
const settingsArea = document.getElementById("settings");
settingsButton.addEventListener("click", () => {
    settingsButton.textContent === "Show Settings" ? "Hide Settings" : "Show Setttings";
    settingsArea.classList.toggle("invisible");
});

const mainPage = document.getElementById("main");
const startPage = document.getElementById("startPage");
const startButton = document.getElementById("startButton");
startButton.addEventListener("click", event => {
    event.preventDefault();
    mainPage.classList.toggle("invisible");
    startPage.classList.toggle("invisible");
    main();
});
