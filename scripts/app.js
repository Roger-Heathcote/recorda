/*jshint esversion: 6 */

// INIT RECORDER
let canvas = document.getElementById("waveform");
const bufferLength = 60;
const loResWaveformParams = { dataPoints: 900, secondsToDisplay: bufferLength };
recorder = new RecorderApp(
  window,
  navigator,
  AudioEngine,
  bufferLength,
  canvas,
  MouseStatus,
  WaveformDisplay,
  loResWaveformParams,
  recordingsListChangedCallback,
  dataDisplayChangedCallback
);
recorder.init();

// VIEWS, DRAW YOURSELVES ONCE
resizeCanvas();
refreshOptionsView();
refreshDataDisplay();
setInterval( refreshDataDisplay, 5 * 1000 ); // and then every 5 seconds

// console.log( "Supported constraints are:", navigator.mediaDevices.getSupportedConstraints() );

// ADD IN EVENT LISTENERS

window.addEventListener('resize', resizeCanvas, false);

// AND DEFINE CLICK HANDLERS

function audioPassthroughClicked(){ recorder.toggleAudioPassthrough(); }
function optionToggleClicked(name){ this.recorder.toggleOptionalAudioConstraint(name); }
function constraintToggleClicked(constraintName) {
  // CONSTRAINTS TICKBOX TICKED HANDLER: constraint name => tell model to toggle that constraint
  // Fire and forget right now. Model currently tries to reapply but does not handle errors when it can't
  console.log("Constraint toggle", constraintName,"clicked");
  recorder.toggleOptionalConstraint(constraintName);
}
function saveClicked(recordingID) {
  // SAVE BUTTONS HANDLER: recording_id => browser download
  let recording = recorder.getRecordingByUuid(recordingID);
  let url = window.URL.createObjectURL(recording.data);
  anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = recording.name + ".wav";
  document.body.appendChild(anchor);
  anchor.click();
}

function deleteClicked(recordingID) {
  // DELETE BUTTONS HANDLER: recording_id => recording deleted
  recorder.deleteRecordingByUuid(recordingID);
}
// OTHER EVENT HANDLERS

// CANVAS RESIZE HANDLER. Make canvas responsive to scale changes
function resizeCanvas() { canvas.width = document.getElementById("wrapper").offsetWidth; }

// VIEW REFRESHERS
function refreshOptionsView(){
  let block = document.getElementById("optionsBlock");
  block.innerHTML = views.optionsBlock(recorder.vm_options());
}
function refreshDataDisplayClicked(){
  refreshDataDisplay();
}
function refreshDataDisplay(){
  console.log("refreshing data display");
  let block = document.getElementById("dataDisplayBlock");
  block.innerHTML = views.dataDisplayBlock(recorder.vm_dataDisplayBlock());
  //console.log("Should have updated optionsBlock with contents", recorder.vm_dataDisplayBlock() );
}
function refreshRecordings(){
  //console.log("refreshing recordings");
  let block = document.getElementById("recordingsBlock");
  block.innerHTML = views.recordingsBlock(recorder.vm_recordings());
}

// RECORDER NOTIFICATION CALLBACK HANDLERS
function recordingsListChangedCallback(){ console.log("refRecs!"); refreshRecordings(); refreshDataDisplay(); }
function dataDisplayChangedCallback(){ refreshDataDisplay(); }
