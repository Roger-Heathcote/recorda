/*jshint esversion: 6 */

// TODO: after a recording made app starts to leak memory quite profusely - investigate

let canvas = document.getElementById("waveform");
let canvasCtx = canvas.getContext("2d");
resizeCanvas();
window.addEventListener('resize', resizeCanvas, false);
let recordingsDiv = document.getElementById("recordings");
let dataDisplayElement = document.getElementById("dataDisplay");

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
  dataDisplayElement
);
recorder.init();

console.log( "Supported constraints are:", navigator.mediaDevices.getSupportedConstraints() );

function resizeCanvas() {
  canvas.width = document.getElementById("wrapper").offsetWidth;
}

function saveClicked(recordingID) {
  let recording = recorder.getRecordingByUCTTimestamp(recordingID);
  let url = window.URL.createObjectURL(recording.data);
  anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = recording.name + ".wav";
  document.body.appendChild(anchor);
  anchor.click();
}

function constraintToggleClicked(constraintName) {
  console.log("Constraint toggle", constraintName,"clicked");
  recorder.toggleOptionalConstraint(constraintName);
}

function audioPassthroughClicked(){
  console.log("audioPassthroughClicked");
  recorder.toggleAudioPassthrough();
}
