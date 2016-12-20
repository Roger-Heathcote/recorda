/*jshint esversion: 6 */

let binarySearch = require("./pureGeneralFunctions.js").binarySearch;

let WaveformDisplay = function WaveformDisplay(GLOBALS, the_window, canvas, mouse, loResWaveform, loResCodeChannel, clickHandler) {
  instance = this;
  //this.state = "buffer";
  this.minRefreshTime = 100;
  // this.secondsToDisplay = GLOBALS.secondsToBuffer;
  this.window = the_window;
  this.canvas = canvas;
  this.waveform = loResWaveform;
  this.codeChan = loResCodeChannel;
  this.canvasCtx = canvas.getContext("2d");
  this.lastRedraw = 0;
  this.mouse = mouse;
  this.dontquit = true; // twim

  this.quit = function quit(){
    canvas.removeEventListener('mouseup', this.waveformClicked);
    console.log("Setting quit bit in waveform engine");
    this.dontquit = false;
    this.blankDisplay();
  }.bind(this);

  this.waveformClicked = function waveformClickedInWaveformDisplay(event) {
    let rect = this.canvas.getBoundingClientRect();
    let ratio = (event.clientX - rect.left) / rect.width;
    let index = Math.floor(this.codeChan.length * ratio);
    while (this.codeChan[index] === 0) {index++;}
    if (this.codeChan[index]) { clickHandler(this.codeChan[index]); }
  }.bind(this);
  canvas.addEventListener('mouseup', this.waveformClicked, false);

  this.updateDisplay = function updateDisplay() {
    if(instance.dontquit){
      requestAnimationFrame(instance.updateDisplay);
      if (Date.now() > (instance.lastRedraw + instance.minRefreshTime)) {
        instance.drawWave();
        instance.lastRedraw = Date.now();
        // stopped here for some reason
      }
    }
  };

  this.waveDrawStates = {
    buffer: function waveDrawStates_buffer(GLOBALS, mouse, canvas, canvasCtx, codeChan) {
      let mouseStatus = mouse.status();
      if (mouseStatus.over) {
        canvasCtx.fillStyle = 'rgb(255, 255, 255)';
        canvasCtx.fillRect(0, 0, mouseStatus.x, canvas.height);
        canvasCtx.fillStyle = 'rgb(150, 250, 150)';
        canvasCtx.fillRect(mouseStatus.x, 0, canvas.width-mouseStatus.x, canvas.height);
      } else {
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      }
    },

    record: function waveDrawStates_record(GLOBALS, mouse, canvas, canvasCtx, codeChan) {
      let mouseStatus = mouse.status();
      let inPointX = ratio(codeChan, GLOBALS.loResInPoint, canvas.width);
      //console.log(mouseStatus.x, inPointX);
      if (mouseStatus.over && (mouseStatus.x>inPointX)) {
        //console.log("happenin!");
        canvasCtx.fillStyle = 'rgb(255, 255, 255)';
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
        canvasCtx.fillStyle = 'rgb(150, 250, 150)';
        canvasCtx.fillRect(inPointX, 0, mouseStatus.x-inPointX, canvas.height);
      } else {
        canvasCtx.fillStyle = 'rgb(255, 255, 255)';
        canvasCtx.fillRect(0, 0, inPointX, canvas.height);
        canvasCtx.fillStyle = 'rgb(150, 250, 150)';
        canvasCtx.fillRect(inPointX, 0, canvas.width, canvas.height);
      }
    },

    save: function waveDrawStates_save(GLOBALS, mouse, canvas, canvasCtx, codeChan) {
      let mouseStatus = mouse.status();
      let inPointX = ratio(codeChan, GLOBALS.loResInPoint, canvas.width);
      let outPointX = ratio(codeChan, GLOBALS.loResOutPoint, canvas.width);
      canvasCtx.fillStyle = 'rgb(255, 255, 255)';
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      canvasCtx.fillStyle = 'rgb(150, 150, 150)';
      canvasCtx.fillRect(inPointX, 0, outPointX-inPointX, canvas.height);
    }
  };

  this.drawWave = function drawWave() {

    // draw background
    this.waveDrawStates[GLOBALS.state](GLOBALS, this.mouse, this.canvas, this.canvasCtx, instance.codeChan);

    // draw waveform
    instance.canvasCtx.fillStyle = 'rgb(0, 0, 0)';
    let sliceWidth = instance.canvas.width / instance.waveform.length;
    for(let i = 0; i < instance.waveform.length; i++) {
      if(instance.waveform[i] > 0.9999){
        instance.canvasCtx.fillStyle = 'rgb(255, 0, 0)';
      } else {
        instance.canvasCtx.fillStyle = 'rgb(0, 0, 0)';
      }
      let y = instance.waveform[i] * instance.canvas.height;
      instance.canvasCtx.fillRect(i*sliceWidth, canvas.height-y, sliceWidth+1, y);
    }
  };

  this.blankDisplay = function blankDisplay(){
    this.canvasCtx.fillStyle = 'rgb(255, 255, 255)';
    this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };

  this.updateDisplay();

};

function ratio(array, key, width, dfault=0) {
  if (key <= array[0]) { return 0; }
  if (key >= array[array.length-1]) { return width; }
  let result = binarySearch(array, key);
  if (result === -1) { return dfault; }
  return Math.floor( width * (result/array.length) );
}

module.exports = WaveformDisplay;
