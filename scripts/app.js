/*jshint esversion: 6 */

let canvas = document.getElementById("waveform");
let canvasCtx = canvas.getContext("2d");
resizeCanvas();
window.addEventListener('resize', resizeCanvas, false);
let recordingsDiv = document.getElementById("recordings");
let dataDisplayElement = document.getElementById("dataDisplay");

const bufferLength = 30;
const loResWaveformParams = { dataPoints: 300, secondsToDisplay: bufferLength };

recorder = new RecorderApp(
  navigator,
  canvas,
  AudioEngine,
  bufferLength,
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
  console.log("Yep, play was clicked.", recordingID);
  let recording = recorder.getRecordingByUCTTimestamp(recordingID);
  console.log("recObj:", recording);

  let sixteenBitLeft = float32ToInt16( recording.data[0] );
  let sixteenBitRight = float32ToInt16( recording.data[1] );

  console.log("LEFT:", sixteenBitLeft);
  console.log("RIGHT:", sixteenBitRight);

  // audioElement = document.getElementById("audiotest");
  // var blob = new Blob(decodedData, {type: "correct-mimetype/here"});
  // var url = URL.createObjectURL(blob);
  // audioElement.src = url;



}
