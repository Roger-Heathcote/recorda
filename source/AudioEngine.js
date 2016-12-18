/*jshint esversion: 6 */
/*jshint -W056 */

let importProperties = require("./pureGeneralFunctions.js").importProperties;
let OptionalAudioConstraints = require("./OptionalAudioConstraints.js");
stereoFloat32ToInterleavedInt16 = require("./pureGeneralFunctions.js").stereoFloat32ToInterleavedInt16;

var AudioEngine = function AudioEngine(GLOBALS, audioOptions, options) { //loResWaveformParams=false
  // ADD/OVERWRITE PROPERTIES FROM OPTIONS OBJECT
  importProperties(options, this);
  this.totalBlocksHandled = 0;
  this.updateBlockTotal = function updateBlockTotal() {
    this.totalBlocksHandled++;
    if(this.totalBlocksHandled % 10000 === 0){
      console.log( "Total audio blocks handled so far:", this.totalBlocksHandled + ". Audio array length is", this.audioData.length );
     }
  };

  console.log("Need to apply audioOptions in Audio Engine now", audioOptions);

  this.scriptProcessorBufferLength = this.scriptProcessorBufferLength || 16384 / 4; // In units NOT bytes!
  this.audioContext = new (GLOBALS.win.AudioContext || GLOBALS.win.webkitAudioContext)();
  this.sampleRate = this.audioContext.sampleRate;
  this.gainNode = this.audioContext.createGain(); // Master volume, just in case we need it!
  this.scriptNode = this.audioContext.createScriptProcessor(
    this.scriptProcessorBufferLength,
    audioOptions.channels,
    audioOptions.channels
  );
  this.recBufArrayLength = Math.ceil((GLOBALS.secondsToBuffer * this.sampleRate) / this.scriptProcessorBufferLength);
  this.codeChannel = new Array(this.recBufArrayLength).fill(0);
  this.audioData = new Array(this.recBufArrayLength).fill(0);
  this.codeNumber = 0;
  this.maxAmplitude = 0;
  this.mediaStreamTrack = false;
  this.passthrough = this.passthrough || false;
  this.toggleAudioPassthrough = function toggleAudioPassthrough(){
    this.passthrough = !this.passthrough;
  };
  this.reapplyConstraints = function reapplyConstraints(constraintsObject){
    console.log("Here is where we will try to re-apply the constraints to the audioTrack");
    if(this.mediaStreamTrack){
      let appliedPromise = this.mediaStreamTrack.applyConstraints(constraintsObject);
      appliedPromise
        .then( function(value){
          console.log("Applied OK, or so is implied by my being in the .then however..." );
          console.log("The value receivedby my function in .then is", value," wutwut???");
        } )
        .catch( function(presumably_an_error){ // how test this code path?
          console.log("Didnae apply itsel", presumably_an_error);
        } );
    } else {
      console.log("NoMST");
    }
  }.bind(this);
  this.optionalAudioConstraints = this.optionalAudioConstraints || new OptionalAudioConstraints(this.reapplyConstraints, echo=false, noise=false, gain=false, high=false);
  this.currentAudioConstraints = function(){ return this.optionalAudioConstraints.state(); };
  this.toggleOptionalAudioConstraint = function audioToggleAudioConstraint(constraintName){
    this.optionalAudioConstraints.toggleConstraint(constraintName);
  };
  if(this.loResWaveformParams){
    this.loResWaveformDataPoints = this.loResWaveformParams.dataPoints;
    this.loResWaveformSecondsToDisplay = this.loResWaveformParams.secondsToDisplay;
    this.loResWaveform = new Array(this.loResWaveformDataPoints).fill(0);
    this.loResCodeChannel = new Array(this.loResWaveformDataPoints).fill(0);
    this.samplesPerDataPoint = (
      this.sampleRate *
      this.loResWaveformParams.secondsToDisplay) /
      this.loResWaveformParams.dataPoints;
    this.dispCount = this.samplesPerDataPoint;
  }

  // WIRE UP THE INPUT TO OUR SCRIPTPROCESSOR NODE
  if (GLOBALS.nav.mediaDevices.getUserMedia){
    let audioInput = GLOBALS.nav.mediaDevices.getUserMedia( this.optionalAudioConstraints.asConstraintsObject() );
    audioInput.catch( err => console.log("gUM ERROR:",err.name) );
    audioInput.then(
      function connectUpTheAudioStream(audioStream){
        this.mediaStreamTrack = audioStream.getAudioTracks()[0];
        let source = this.audioContext.createMediaStreamSource(audioStream);
        source.connect(this.scriptNode);
        this.scriptNode.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);
      }.bind(this)
    );
  }

  // let scriptProcessor = function scriptProcessor(audioProcessingEvent) {
  let scriptProcessor = function scriptProcessor(audioProcessingEvent) {

    this.codeNumber++;
    this.codeChannel.push (this.codeNumber);

    channels = getChannels(audioOptions.channels, audioProcessingEvent);
    this.audioData.push ( stereoFloat32ToInterleavedInt16(channels[0].in, channels[1].in) );

    // this.audioData.push ( resampleAndInterleave(
    //   audioOptions.bitDepth,
    //   audioOptions.interleave,
    //   channels
    // ) );

    let channelIndex;
    for (let sample = 0; sample < this.scriptProcessorBufferLength; sample++) {

      // enable pass through option
      for(channelIndex=0; channelIndex<audioOptions.channels; channelIndex++){
        if(this.passthrough) {
          channels[channelIndex].out[sample] = channels[channelIndex].in[sample];
        } else {
          channels[channelIndex].out[sample] = 0.0;
        }
      }

      // track max amplitude encountered
      if (channels[0].in[sample] > this.maxAmplitude) { this.maxAmplitude = channels[0].in[sample]; }
      if (channels[0].in[sample] < -this.maxAmplitude) { this.maxAmplitude = -channels[0].in[sample]; } // TODO check both
      if(this.loResWaveformParams){ // TODO move this check to block above, don't need maxamp if no waveform display!
        // if enough samples have elapsed push a display data point & reset counter
        this.dispCount--;
        if (this.dispCount < 0) {
          this.dispCount = this.samplesPerDataPoint;
          this.loResWaveform.push(this.maxAmplitude);
          this.loResWaveform.shift();
          this.loResCodeChannel.push(this.codeNumber);
          this.loResCodeChannel.shift();
          this.maxAmplitude = 0;
          if(!this.loResOffset) {
            this.loResOffset = this.codeNumber - 1;
          }
        }
      } //end if
    } // end for

    // Trim element from the fron of the audio array
    while ((GLOBALS.state === "buffer") && (this.audioData.length > this.recBufArrayLength)) {
      let trimLength = this.audioData.length - this.recBufArrayLength;
      if(trimLength>1) { console.log("trimLength =", trimLength); }
      this.audioData.splice(0, trimLength);
      this.codeChannel.splice(0, trimLength);
    }

    this.updateBlockTotal();

  }.bind(this);

  this.scriptNode.onaudioprocess = scriptProcessor;

};

function getChannels(numberOfChannels,scriptProcessorEvent){
  let channelIndex, channels=[];
  for(channelIndex=0; channelIndex<numberOfChannels; channelIndex++){
    channels.push({
      in:scriptProcessorEvent.inputBuffer.getChannelData(channelIndex),
      out:scriptProcessorEvent.outputBuffer.getChannelData(channelIndex)
    });
  }
  return channels;
}

module.exports = AudioEngine;
