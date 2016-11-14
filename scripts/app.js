/*jshint esversion: 6 */

// INIT RECORDER
let theCanvas = document.getElementById("waveform");
const bufferLength = 60;
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
    dataDisplayChangedCallback: dataDisplayChangedCallback,
    scriptProcessorBufferLength: 16384
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
  let block = document.getElementById("recordingsBlock");
  let listInner = document.getElementById("recordingsListInner");
  let recordingsList = recorder.vm_recordings();
  views.recordingsBlock( document, listInner, recordingsList );
}

// RECORDER NOTIFICATION CALLBACK HANDLERS
function recordingsListChangedCallback(){ refreshRecordings(); refreshDataDisplay(); }
function dataDisplayChangedCallback(){ refreshDataDisplay(); }
