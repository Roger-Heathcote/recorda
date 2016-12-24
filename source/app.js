"use strict";

function main(){

  const RecorderApp = require("./RecorderApp.js");
  const AudioEngine = require("./AudioEngine.js");
  const MouseStatus = require("./MouseStatus.js");
  const WaveformDisplay = require("./WaveformDisplay.js");
  const views = require("./views.js");
  let audioOptions = require("./audioPresets.js").defaultPreset;

  // INIT RECORDER
  // let theWrapper = document.getElementById("wrapper");
  let theCanvas = document.getElementById("waveform");
  let theOverlay = false;

  let bufferLength = 500;
  const loResWaveformParams = { dataPoints: 1000 };
  const overlayResizeListenerFunction = function overlayResizeListener() {
    let rect = theCanvas.getBoundingClientRect();
    let pos = getPosition(theCanvas);
    theOverlay.style.left = pos.x + "px";
    theOverlay.style.top = pos.y + "px";
    theOverlay.style.width = rect.right - rect.left + "px";
    theOverlay.style.height = rect.bottom - rect.top + "px";
    // }.bind(this);
  };


  let recorder = new RecorderApp(
    window,
    navigator,
    AudioEngine,
    bufferLength,
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
      scriptProcessorBufferLength: 4096 //
    }
  );

  recorder.init();

  // VIEWS, DRAW YOURSELVES ONCE
  resizeCanvas();
  refreshOptionsView();
  refreshDataDisplay();
  setInterval( refreshDataDisplay, 5 * 1000 ); // and then every 5 seconds
  setInterval( refreshRecordings, 60 * 1000 ); // and then every 60 seconds

  // ADD IN EVENT LISTENERS
  window.addEventListener('resize', resizeCanvas, false);

  // AND DEFINE CLICK HANDLERS
  let stuffBlock = document.getElementById("stuff");
  stuffBlock.addEventListener('click', recordingsBlockClickDelegator, true);
  let handlers = {
    "save": saveClicked,
    "delete": deleteClicked,
    "options": optionsButtonClicked,
    "audioPassthrough": audioPassthroughClicked,
    "optionToggle": optionToggleClicked,
    "reset": reset
  };
  function recordingsBlockClickDelegator(event){
    if(!event.target.name){ return; }
    if(handlers.hasOwnProperty(event.target.name)){
      handlers[event.target.name](event.target.value);
    }
  }

  function reset(){
    let newBufferLength = 120;
    recorder.setBufferLength(newBufferLength);
    let timelineMax = document.getElementById("timelineMax");
    console.log("tLM:", timelineMax);
    // timelineMax.innerHTML = humaneDate(new Date(1), new Date((newBufferLength*1000)+0.1));
    timelineMax.innerHTML = newBufferLength + "s ago";
  }

  function saveClicked(recordingID) {
    // SAVE BUTTONS HANDLER: recording_id => browser download
    let recording = recorder.getRecordingByUuid(recordingID);
    let anchor = document.createElement("a");
    anchor.href = recording.url;
    anchor.download = recording.name + ".wav";
    document.body.appendChild(anchor);
    anchor.click();
  }
  function deleteClicked(recordingID) {
    // DELETE BUTTONS HANDLER: recording_id => recording deleted
    recorder.deleteRecordingByUuid(recordingID);
  }
  function optionsButtonClicked() {
    console.log("Options button pressed");
  }
  function audioPassthroughClicked(){ recorder.toggleAudioPassthrough(); }
  function optionToggleClicked(name){ recorder.toggleOptionalAudioConstraint(name); }

  // CANVAS RESIZE HANDLER. Make canvas responsive to scale changes
  function resizeCanvas() { theCanvas.width = document.getElementById("wrapper").offsetWidth; }

  // VIEW REFRESHERS
  function refreshOptionsView(){
    let block = document.getElementById("optionsBlock");
    block.innerHTML = views.optionsBlock(recorder.vmOptions());
  }
  function refreshDataDisplay(){
    let block = document.getElementById("dataDisplayBlock");
    block.innerHTML = views.dataDisplayBlock(recorder.vmDataDisplayBlock());
  }
  function refreshRecordings(){
    //let block = document.getElementById("recordingsBlock");
    let listElement = document.getElementById("recordingsList");
    let recordingsList = recorder.vmRecordings();
    views.recordingsBlock( document, listElement, recordingsList );
  }

  // RECORDER NOTIFICATION CALLBACK HANDLERS
  function recordingsListChangedCallback(){ refreshRecordings(); refreshDataDisplay(); }
  function dataDisplayChangedCallback(){ refreshDataDisplay(); }

  function enteringSaveModeCallback(){
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
    theOverlay.style.fontSize = (rect.bottom - rect.top)/6 + "px";
    theOverlay.style.lineHeight = rect.bottom - rect.top + "px";
    // TODO!!!
    // Why is this firing AFTER save mode has been exited?
    // Just not GC'd yet?
    // Manually detactch this listener?
    console.log("Overlay present so adding this listener", overlayResizeListenerFunction);
    window.addEventListener("resize", overlayResizeListenerFunction);
    document.body.appendChild(theOverlay);
  }

  function exitingSaveModeCallback(){
    window.removeEventListener("resize", overlayResizeListenerFunction);
    console.log("Getting rid of overlay resize listener");
    document.body.removeChild(theOverlay);
    theCanvas.setAttribute("aria-disabled", "false");
    theOverlay = undefined;
  }

  function saveModeUpdateCallback(val){
    let percentage = val*100;
    let paddedPercentage = ("00" + parseInt(percentage,10)).substr(-2,2);
    theOverlay.innerHTML = "Saving "+paddedPercentage+"%";
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
        xPos += (el.offsetLeft - xScroll + el.clientLeft);
        yPos += (el.offsetTop - yScroll + el.clientTop);
      } else {
        // for all other non-BODY elements
        xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
        yPos += (el.offsetTop - el.scrollTop + el.clientTop);
      }
      el = el.offsetParent;
    }
    return { x: xPos, y: yPos };

  }
}

main();
