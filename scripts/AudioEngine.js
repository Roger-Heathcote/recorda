/*jshint esversion: 6 */
/*jshint -W056 */

var AudioEngine = function AudioEngine(GLOBALS, loResWaveformParams=false) {

  this.totalBlocksHandled = 0;
  this.updateBlockTotal = function updateBlockTotal() {
    this.totalBlocksHandled++;
    if(this.totalBlocksHandled % 1000 === 0){
      console.log( "Total audio blocks handled so far:", this.totalBlocksHandled + ". Audio array length is", this.interleaved16BitAudio.length );
     }
  };

  this.scriptProcessorBuffer = 16384 / 4; //64;
  this.channels = 2;
  this.bitDepth = 16;
  this.audioContext = new (GLOBALS.win.AudioContext || GLOBALS.win.webkitAudioContext)();
  this.sampleRate = this.audioContext.sampleRate;
  this.gainNode = this.audioContext.createGain(); // Master volume, just in case we need it!
  this.scriptNode = this.audioContext.createScriptProcessor(this.scriptProcessorBuffer, 2, 2);
  this.recBufArrayLength = Math.ceil((GLOBALS.secondsToBuffer * this.sampleRate) / this.scriptProcessorBuffer);
  this.codeChannel = new Array(this.recBufArrayLength).fill(0);
  this.interleaved16BitAudio = new Array(this.recBufArrayLength).fill(0);
  this.codeNumber = 0;
  this.maxAmplitude = 0;
  this.mediaStreamTrack = false;
  this.passthrough = false;
  this.toggleAudioPassthrough = function toggleAudioPassthrough(){
    this.passthrough = !this.passthrough;
    console.log("passthrough is now:", this.passthrough);
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
  this.optionalAudioConstraints = new OptionalAudioConstraints(this.reapplyConstraints, echo=false, noise=false, gain=false, high=false);
  this.currentAudioConstraints = function(){ return this.optionalAudioConstraints.state(); };
  this.toggleOptionalAudioConstraint = function audioToggleAudioConstraint(constraintName){
    this.optionalAudioConstraints.toggleConstraint(constraintName);
  };
  this.loResWaveformParams = loResWaveformParams;
  if(loResWaveformParams){
    this.loResWaveformDataPoints = loResWaveformParams.dataPoints;
    this.loResWaveformSecondsToDisplay = loResWaveformParams.secondsToDisplay;
    this.loResWaveform = new Array(this.loResWaveformDataPoints).fill(0);
    this.loResCodeChannel = new Array(this.loResWaveformDataPoints).fill(0);
    this.loResOffset = undefined;
    this.samplesPerDataPoint = (
      this.sampleRate *
      loResWaveformParams.secondsToDisplay) /
      loResWaveformParams.dataPoints;
    this.dispCount = this.samplesPerDataPoint;
  }



  // // TODO Check if these are all needed - mid 2016
  // // Oh, navigator.getUserMedia is dprecated according to mozilla
  // // we should be using MediaDevices.getUserMedia
  // GLOBALS.nav.getUserMedia = (GLOBALS.nav.getUserMedia ||
  //                           GLOBALS.nav.webkitGetUserMedia ||
  //                           GLOBALS.nav.mozGetUserMedia ||
  //                           GLOBALS.nav.msGetUserMedia);
  //
  // if (GLOBALS.nav.getUserMedia) {
  //   GLOBALS.nav.getUserMedia (
  //     // { audio: true },
  //     { audio: true },
  //     function didGetUserMedia(audioStream) {
  //       var source = this.audioContext.createMediaStreamSource(audioStream);
  //       source.connect(this.scriptNode);
  //       this.scriptNode.connect(this.gainNode);
  //       this.gainNode.connect(this.audioContext.destination);
  //     }.bind(this),
  //     function didNotGetUserMedia(streamError) { throw( new Error("The following gUM Error occured: " + streamError) ); }
  //   );
  // } else {
  //    throw( new Error("getUserMedia not supported on your browser!") );
  // }

  // let this.mediaConstraints = { audio: { optional: [{echoCancellation:false}] } };
  //



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

  let scriptProcessor = function scriptProcessor(audioProcessingEvent) {
    this.codeNumber++;
    let left = audioProcessingEvent.inputBuffer.getChannelData (0);
    let right = audioProcessingEvent.inputBuffer.getChannelData (1);
    this.interleaved16BitAudio.push ( stereoFloat32ToInterleavedInt16(left, right) );
    let leftout = audioProcessingEvent.outputBuffer.getChannelData (0);
    let rightout = audioProcessingEvent.outputBuffer.getChannelData (1);
    this.codeChannel.push (this.codeNumber);

    for (let sample = 0; sample < this.scriptProcessorBuffer; sample++) {

      // enable pass through option
      if(this.passthrough) {
        leftout[sample] = left[sample]; rightout[sample] = right[sample];
      } else {
        leftout[sample] = 0.0; rightout[sample] = 0.0;
      }

      // track max amplitude encountered
      if (left[sample] > this.maxAmplitude) { this.maxAmplitude = left[sample]; }
      if (left[sample] < -this.maxAmplitude) { this.maxAmplitude = -left[sample]; } // TODO check both
      if(loResWaveformParams){ // TODO move this check to block above, don't need maxamp if no waveform display!
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

    while ((GLOBALS.state === "buffer") && (this.interleaved16BitAudio.length > this.recBufArrayLength)) {
      let trimLength = this.interleaved16BitAudio.length - this.recBufArrayLength;
      if(trimLength>1) { console.log("trimLength =", trimLength); }
      this.interleaved16BitAudio.splice(0, trimLength);
      this.codeChannel.splice(0, trimLength);
    }

    this.updateBlockTotal();

  }.bind(this);

  this.scriptNode.onaudioprocess = scriptProcessor;

};
