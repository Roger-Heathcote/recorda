/*jshint esversion: 6 */
/*jshint -W056 */

// TODO list
// Set max buffer recording time?
// Yes, no reliable way to query available storage of indexed_db until quota-api matures and amount can be v.small
// Also, no consistent way to query available RAM so fixed sensible time limit probably a good idea to avoid hanging system
// In the mean time, record to RAM and have two max recording times, one for mobile (v.low), one for desktop (2hrs?).
//   How to detect mobile/desktop? Is Screen size a useful proxy? Browser versions?

// Better way of hooking up audio nodes

// Send audio to server
//   live
//   at end of recording?

// Stop button
//   Save offered

// Display time recorded

// Detect start point and trim silence

// Autodetect ambient noise level

// Gate/VAR

// Bufferloid
// How might it work?
// So it def starts pre rolling

// Record button
//   when clicked
//     recording starts from the top of the buffer
//     button changes to stop
// when stop clicked
//   recording appears in list with save button next to it

// Click on waveform where you want recording to start
//   recording starts
//   click again where you want it to stop OR click stop button


const MINFRAMETIME = 100; //90; // minimum time between redraws
const SCRIPTPROCESSORBUFFER = 16384 / 4; //64;
const TRIGGERTHRESHOLD = 0.5; // set to over 1 to disable automatic record start
const SECONDSTOBUFFER = 60;
const CANVASDIV = '#wrapper';
const WFSECSTODISPLAY = SECONDSTOBUFFER; // can be set differently, no use case yet but hey flexibility!
const WFDATAPOINTS = 500; // number of data points to display

var appState = "awaitingInPoint"; // awaitingOutPoint, recording, saving

var audioContext = new (window.AudioContext || window.webkitAudioContext)();
var sampleRate = audioContext.sampleRate;
const SAMPLESPERDATAPOINT = (audioContext.sampleRate * WFSECSTODISPLAY) / WFDATAPOINTS;
var dispCount = SAMPLESPERDATAPOINT;
var dispPeak = 0;
var gainNode = audioContext.createGain();
gainNode.gain.value = 0; // Mute the output / Don't output sound - feedback!
var scriptNode = audioContext.createScriptProcessor(SCRIPTPROCESSORBUFFER, 2, 2);

var RECBUFARRAYLENGTH = Math.ceil((SECONDSTOBUFFER * sampleRate) / SCRIPTPROCESSORBUFFER);

var canvas = document.querySelector('#waveform');
var canvasCtx = canvas.getContext("2d");


var mouseX, mouseY;
//function updateMouseXY(e) { mouseX = e.pageX; mouseY = e.pageY;}
function updateMouseXY(e) {
   var rect = canvas.getBoundingClientRect();
   mouseX = e.clientX - rect.top;
   mouseY = e.clientY - rect.left;
}
canvas.addEventListener('mousemove', updateMouseXY, false);
canvas.addEventListener('mouseenter', updateMouseXY, false);

var mouseOver;
function mouseIsOver(e) { mouseOver = true; }
function mouseNotOver(e) { mouseOver = false; }
canvas.addEventListener('mouseover', mouseIsOver, false);
canvas.addEventListener('mouseleave', mouseNotOver, false);

var drawVisual;

var frames = document.querySelector('#frames');
frames.innerHTML = "Ready";
var frameCounter = 0;

var audioProcessingEventDiv = document.querySelector('#audProcEnv');
var audioProcessingEventCounter = 0;

var lastRedraw = 0;
var recording = false;

var leftchannel = new Array(RECBUFARRAYLENGTH).fill([0]);
var rightchannel = new Array(RECBUFARRAYLENGTH).fill([0]);
var waveform = Array(WFDATAPOINTS).fill(0);
var recordingLength = 0;
resizeCanvas();

// TODO Check if these are all needed - mid 2016
navigator.getUserMedia = (navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia);

if (navigator.getUserMedia) {
  // console.log('getUserMedia supported.');
  navigator.getUserMedia (
    // Ask for audio input
    { audio: true },
    // If we get it...
    function(stream) {
      console.log("IN THE STREAM FUNCTION");
      var source = audioContext.createMediaStreamSource(stream);
      source.connect(scriptNode);
      scriptNode.connect(gainNode);
      gainNode.connect(audioContext.destination);
      updateDisplay();
    },
    // If we don't
    function(err) {
      console.log('The following gUM error occured: ' + err);
    }
  );
} else {
   console.log('getUserMedia not supported on your browser!');
}

window.addEventListener('resize', resizeCanvas, false);

// functions ------------------------------------------------------------------
// functions ------------------------------------------------------------------
// functions ------------------------------------------------------------------
// functions ------------------------------------------------------------------
// functions ------------------------------------------------------------------

scriptNode.onaudioprocess = function(audioProcessingEvent) {
  audioProcessingEventCounter++;
  var left = audioProcessingEvent.inputBuffer.getChannelData (0);
  var right = audioProcessingEvent.inputBuffer.getChannelData (1);
  var leftout = audioProcessingEvent.outputBuffer.getChannelData (0);
  var rightout = audioProcessingEvent.outputBuffer.getChannelData (1);
  // we clone the samples
  leftchannel.push (new Float32Array (left));
  rightchannel.push (new Float32Array (right));
  recordingLength += SCRIPTPROCESSORBUFFER;
  // console.log("LCBB1:", leftchannel[leftchannel.length-1][0]);
  // console.log("samples recorded", recordingLength);
  for (var sample = 0; sample < SCRIPTPROCESSORBUFFER; sample++) {
    // clone input to output
    leftout[sample] = left[sample];
    rightout[sample] = right[sample];
    // track max amplitude encountered
    if (left[sample] > dispPeak) { dispPeak = left[sample]; }
    if (left[sample] < -dispPeak) { dispPeak = -left[sample]; } // TODO check both
    // trigger recording if VAR is enabled
    if (!recording && dispPeak > TRIGGERTHRESHOLD) {
      console.log("TRIGGER");
      recording = true; // stop shifting
    }
    // if enough samples have elapsed push a display data point & reset counter
    dispCount--;
    if (dispCount < 0) {
      dispCount = SAMPLESPERDATAPOINT;
      waveform.push(dispPeak);
      // console.log("MENG!", dispPeak);
      waveform.shift();
      dispPeak = 0;
    }
  }
  // if not recording drop block from front of buffer
  if (!recording && leftchannel.length > RECBUFARRAYLENGTH) {
    leftchannel.shift(); rightchannel.shift();
  }
};

function updateDisplay() {
  requestAnimationFrame(updateDisplay);
  if (Date.now() > (lastRedraw + MINFRAMETIME)) {
    drawWave();
    updateStats();
    lastRedraw = Date.now();
  }
}

function drawWave() {
  // clear canvas
  switch(appState){
    case "awaitingInPoint":
      if (mouseOver) {
        // do cool color stuff
        canvasCtx.fillStyle = 'rgb(255, 255, 255)';
        canvasCtx.fillRect(0, 0, mouseX, canvas.height);
        canvasCtx.fillStyle = 'rgb(200, 250, 200)';
        canvasCtx.fillRect(mouseX, 0, canvas.width, canvas.height);
      } else {
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      }
      break;
    case "awaitingOutPoint":
      console.log("Not implemented yet"); break;
    case "recording":
      console.log("Not implemented yet"); break;
    case "saving":
      console.log("Not implemented yet"); break;
  }

  // draw waveform
  canvasCtx.fillStyle = 'rgb(0, 0, 0)';
  var sliceWidth = canvas.width / waveform.length;
  for(var i = 0; i < waveform.length; i++) {
    var y = waveform[i] * canvas.height;
    canvasCtx.fillRect(i*sliceWidth, canvas.height-y, sliceWidth+1, y);
  }
}

function updateStats() {
  frames.innerHTML = frameCounter;
  frameCounter++;
  audioProcessingEventDiv.innerHTML = audioProcessingEventCounter + " (" + leftchannel.length + ")";
  mouseLocationDiv.innerHTML = "MouseXY: " + mouseX +","+mouseY+","+mouseOver;

}

function resizeCanvas() {
  canvas.width = document.getElementById("wrapper").offsetWidth;
  console.log("resizing");
}

// state machine! TODO: implement state pattern
class StateBaseClass{
	constructor(){
    this.exampleProperty = "foo";
  }
  method1() {
    console.log(this.exampleProperty);
  }
};

class State1 extends StateBaseClass {
  method2() {
    console.log("method2!");
  }
}
