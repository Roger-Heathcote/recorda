/*jshint esversion: 6 */
/*jshint -W056 */

var AudioEngine = function AudioEngine(GLOBALS, loResWaveformParams=false, optionalMediaConstraints=false) {

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
  this.leftChannel = new Array(this.recBufArrayLength).fill(0);
  this.rightChannel = new Array(this.recBufArrayLength).fill(0);
  this.codeChannel = new Array(this.recBufArrayLength).fill(0);
  this.interleaved16BitAudio = new Array(this.recBufArrayLength).fill(0);
  this.codeNumber = 0;
  this.maxAmplitude = 0;
  this.loResWaveformParams = loResWaveformParams;
  this.optionalMediaConstraints = optionalMediaConstraints;
  this.audioStream = false;
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
  this.dressOptionalConstraint = function dressOptionalConstraint(constraintList){
    return { audio: { optional: constraintList } };
  };

  this.__toggleMediaConstraint =
    function __toggleMediaConstraint(constraintList,constraintName){
      console.log("constraintList:", constraintList);
      console.log("constraintName:", constraintName);
      let idx = constraintList.findIndex( element => element.hasOwnProperty(constraintName) );
      console.log("findIndexResult:", idx);
      console.log( "constraintList[idx][constraintName]:", constraintList[idx][constraintName]);
      console.log( "constraintList[idx].constraintName is now:", constraintList[idx][constraintName] );
      if(constraintList[idx]){ constraintList[idx][constraintName] = !constraintList[idx][constraintName] }
      console.log( "constraintList[idx].constraintName is now:", constraintList[idx][constraintName] );
    };

  this.toggleOptionalConstraint =
    function toggleOptionalConstraint(constraintName){
      console.log("In audEng's toggleOptionalConstraint now, constraintName is:", constraintName);
      this.__toggleMediaConstraint(this.optionalMediaConstraints, constraintName);
      console.log("Done in __toggleMediaConstraint now, moving on.");
      console.log("this.mediaStreamTrack = ", this.mediaStreamTrack);
      this.mediaStreamTrack.applyConstraints(this.dressOptionalConstraint(this.optionalMediaConstraints));
      console.log("Asked mediaStreamTrack to applyConstraints! Is it listening? Who knows?");
      console.log("IT says it's constraints are:", this.mediaStreamTrack.getConstraints );
      console.log("IT says it's settings are:", this.mediaStreamTrack.getSettings );
    };

  this.mediaConstraints = { audio: true };
  if(optionalMediaConstraints){
    console.log("Constraints actively passed to AudioEngine constructor");
    this.mediaConstraints = this.dressOptionalConstraint( this.optionalMediaConstraints ); // firefox only atm
    console.log("HERE!!!", this.mediaConstraints);
  }

  if (navigator.mediaDevices.getUserMedia){
    let audioInput = navigator.mediaDevices.getUserMedia( this.mediaConstraints );
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


//
// {
//         mandatory: {
//           googEchoCancellation: false,
//           googAutoGainControl: false,
//           googNoiseSuppression: false,
//           googHighpassFilter: false
//         }


  let scriptProcessor = function scriptProcessor(audioProcessingEvent) {
    this.codeNumber++;
    let left = audioProcessingEvent.inputBuffer.getChannelData (0);
    let right = audioProcessingEvent.inputBuffer.getChannelData (1);
    this.interleaved16BitAudio.push ( stereoFloat32ToInterleavedInt16(left, right) );
    this.codeChannel.push (this.codeNumber);

    for (let sample = 0; sample < this.scriptProcessorBuffer; sample++) {
      // track max amplitude encountered
      // waveform display can handle clipping detection itself, it has the data
      // Do we also trigger an action here? Fire an event, toggle a status
      // clipping detection might still be desirable even when running headless
      // And there's the opportunity to be more precisely forgiving
      //   how best then, pass a callback to clipping detection function?
      //  do simple waveform only case first!

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
