/*jshint esversion: 6 */

// INIT RECORDER
let theCanvas = document.getElementById("waveform");
const bufferLength = 120;
const loResWaveformParams = { dataPoints: 500, secondsToDisplay: bufferLength };
recorder = new RecorderApp(
  window,
  navigator,
  AudioEngine,
  bufferLength,
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
    scriptProcessorBufferLength: 4096
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
function audioPassthroughClicked(){ recorder.toggleAudioPassthrough(); }
function optionToggleClicked(name){ this.recorder.toggleOptionalAudioConstraint(name); }
function saveClicked(recordingID) {
  // SAVE BUTTONS HANDLER: recording_id => browser download
  let recording = recorder.getRecordingByUuid(recordingID);
  anchor = document.createElement("a");
  anchor.href = recording.url;
  anchor.download = recording.name + ".wav";
  document.body.appendChild(anchor);
  anchor.click();
}
function deleteClicked(recordingID) {
  // DELETE BUTTONS HANDLER: recording_id => recording deleted
  recorder.deleteRecordingByUuid(recordingID);
}

// CANVAS RESIZE HANDLER. Make canvas responsive to scale changes
function resizeCanvas() { theCanvas.width = document.getElementById("wrapper").offsetWidth; }

// VIEW REFRESHERS
function refreshvSACtest(){
  let block = document.getElementById("vSACtest");
  block.innerHTML = "<span>"+vSAC(1234)+"</span>";
}

function refreshOptionsView(){
  let block = document.getElementById("optionsBlock");
  block.innerHTML = views.optionsBlock(recorder.vm_options());
}
function refreshDataDisplayClicked(){
  refreshDataDisplay();
}
function refreshDataDisplay(){
  let block = document.getElementById("dataDisplayBlock");
  block.innerHTML = views.dataDisplayBlock(recorder.vm_dataDisplayBlock());
}
function refreshRecordings(){
  //let block = document.getElementById("recordingsBlock");
  let listElement = document.getElementById("recordingsList");
  let recordingsList = recorder.vm_recordings();
  views.recordingsBlock( document, listElement, recordingsList );
}

// RECORDER NOTIFICATION CALLBACK HANDLERS
function recordingsListChangedCallback(){ refreshRecordings(); refreshDataDisplay(); }
function dataDisplayChangedCallback(){ refreshDataDisplay(); }

function enteringSaveModeCallback(){
  theCanvas.setAttribute("aria-disabled", "true");
  this.overlay = document.createElement("div");
  this.overlay.innerHTML = "Saving 00%";
  let rect = theCanvas.getBoundingClientRect();
  let pos = getPosition(theCanvas);
  this.overlay.setAttribute("class", "saveOverlayDiv");
  this.overlay.setAttribute("role", "progressbar");
  this.overlay.setAttribute("aria-valuemin", 0);
  this.overlay.setAttribute("aria-valuemax", 100);
  this.overlay.setAttribute("aria-valuenow", 0);
  this.overlay.setAttribute("aria-valuetext", "Saving");
  this.overlay.style.left = pos.x + "px";
  this.overlay.style.top = pos.y + "px";
  this.overlay.style.width = rect.right - rect.left + "px";
  this.overlay.style.height = rect.bottom - rect.top + "px";
  this.overlay.style.fontSize = (rect.bottom - rect.top)/6 + "px";
  this.overlay.style.lineHeight = rect.bottom - rect.top + "px";
  // TODO!!!
  // Why is this firing AFTER save mode has been exited?
  // Just not GC'd yet?
  // Manually detactch this listener?
  window.addEventListener("resize", function(event) {
    let rect = theCanvas.getBoundingClientRect();
    this.overlay.style.width = rect.right - rect.left + "px";
    this.overlay.style.height = rect.bottom - rect.top + "px";
  }.bind(this));
  document.body.appendChild(this.overlay);
}

function exitingSaveModeCallback(){
  document.body.removeChild(this.overlay);
  theCanvas.setAttribute("aria-disabled", "false");
  this.overlay = undefined;
}

function saveModeUpdateCallback(val){
  //console.log("save mode update callback", val);
  let percentage = val*100;
  let paddedPercentage = ("00" + parseInt(percentage,10)).substr(-2,2);
  this.overlay.innerHTML = "Saving "+paddedPercentage+"%";
  this.overlay.setAttribute("aria-valuenow", percentage);
}

function getPosition(el) {
  // https://www.kirupa.com/html5/get_element_position_using_javascript.htm
  let xPos = 0;
  let yPos = 0;
  while (el) {
    if (el.tagName == "BODY") {
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
