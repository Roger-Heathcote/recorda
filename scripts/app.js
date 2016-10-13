/*jshint esversion: 6 */

// TODO: after a recording made app starts to leak memory quite profusely - investigate

let canvas = document.getElementById("waveform");
let canvasCtx = canvas.getContext("2d");
resizeCanvas();
window.addEventListener('resize', resizeCanvas, false);
let recordingsDiv = document.getElementById("recordings");
let dataDisplayElement = document.getElementById("dataDisplay");

const bufferLength = 30;
const loResWaveformParams = { dataPoints: 300, secondsToDisplay: bufferLength };

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


function resizeCanvas() {
  canvas.width = document.getElementById("wrapper").offsetWidth;
  //console.log("resizing");
}

function playClicked(recordingID) {
  let recording = recorder.getRecordingByUCTTimestamp(recordingID);
  audioElement = document.getElementById("audiotest");
  let dataView = new DataView(recording.data);
  var blob = new Blob([recording.data], {type: "audio/wav"});
  var url = URL.createObjectURL(blob);
  audioElement.src = url;
}
