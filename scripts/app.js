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
}

function playClicked(recordingID) {
  audioElement = document.getElementById("audiotest");
  let recording = recorder.getRecordingByUCTTimestamp(recordingID);
  console.log("Recording is:",recording);
  var url = URL.createObjectURL(recording.data);
  audioElement.src = url;
}
