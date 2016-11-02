/*jshint esversion: 6 */

// INIT RECORDER
let canvas = document.getElementById("waveform");
const bufferLength = 60;
const loResWaveformParams = { dataPoints: 500, secondsToDisplay: bufferLength };
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
setInterval( refreshRecordings, 60 * 1000 ); // and then every 5 seconds
//refreshvSACtest();

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
function vSACPlayClicked(recordingID) {
  console.log("Got play click");
  audioElement = document.getElementById("audio_"+recordingID);
  console.log("AudElem:", audioElement);
  audioElement.play();
}



function deleteClicked(recordingID) {
  // DELETE BUTTONS HANDLER: recording_id => recording deleted
  recorder.deleteRecordingByUuid(recordingID);
}
// OTHER EVENT HANDLERS

// CANVAS RESIZE HANDLER. Make canvas responsive to scale changes
function resizeCanvas() { canvas.width = document.getElementById("wrapper").offsetWidth; }

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
  let recordingsList = recorder.vm_recordings();
  // Render HTML
  block.innerHTML = views.recordingsBlock( recordingsList );
  console.log("Adding event handlers now...");
  // Add event handlers
  recordingsList.forEach(function viewForEach(recording) {
    audioElement = document.getElementById("audio_"+recording.id);
    audioElement.addEventListener("timeupdate", function(event) {
        audioCursor = document.getElementById("cursor_"+recording.id);
        let pos = parseInt(((audioElement.currentTime / audioElement.duration) * 100), 10) + "%";
        audioCursor.style.marginLeft = pos;
    });
  });

}

// RECORDER NOTIFICATION CALLBACK HANDLERS
function recordingsListChangedCallback(){ console.log("refRecs!"); refreshRecordings(); refreshDataDisplay(); }
function dataDisplayChangedCallback(){ refreshDataDisplay(); }
