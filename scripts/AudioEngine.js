/*jshint esversion: 6 */
/*jshint -W056 */

var AudioEngine = function (GLOBALS, loResWaveformParams=false) {

  let temp = this; // this feels antipatterny, kosher???

  if(typeof GLOBALS.secondsToBuffer !== "number"){throw new Error("GLOBALS.secondsToBuffer should be a number");}

  this.totalBlocksHandled = 0;
  this.updateBlockTotal = function() {
    this.totalBlocksHandled++;
    if(this.totalBlocksHandled % 1000 === 0){
      console.log( "Total audio blocks handled so far:", this.totalBlocksHandled );
     }
  };

  this.scriptProcessorBuffer = 16384 / 4; //64;
  this.channels = 2;
  this.audioContext = new (GLOBALS.win.AudioContext || GLOBALS.win.webkitAudioContext)();
  this.sampleRate = this.audioContext.sampleRate;
  this.gainNode = this.audioContext.createGain();
  this.gainNode.gain.value = 0; // Mute the output / Don't output sound - otherwise feedback!
  this.scriptNode = this.audioContext.createScriptProcessor(this.scriptProcessorBuffer, 2, 2);

  console.log("samplerate:", this.samplerate);
  console.log("sec2buff:", GLOBALS.secondsToBuffer);
  console.log("scriptProcBuf:", this.scriptProcessorBuffer);
  this.recBufArrayLength = Math.ceil((GLOBALS.secondsToBuffer * this.sampleRate) / this.scriptProcessorBuffer);
  console.log("recBufArrayLength:", this.recBufArrayLength );

  this.leftChannel = new Array(this.recBufArrayLength).fill(0);
  this.rightChannel = new Array(this.recBufArrayLength).fill(0);
  this.codeChannel = new Array(this.recBufArrayLength).fill(0);

  console.log("Should have:", this.leftChannel.length * 60 * this.scriptProcessorBuffer, "");

  this.codeNumber = 0;
  this.dispPeak = 0;
  this.loResWaveformParams = loResWaveformParams;
  if(loResWaveformParams){
    console.log("loResWaveform generation enabled");
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

  // TODO Check if these are all needed - mid 2016
  GLOBALS.nav.getUserMedia = (GLOBALS.nav.getUserMedia ||
                            GLOBALS.nav.webkitGetUserMedia ||
                            GLOBALS.nav.mozGetUserMedia ||
                            GLOBALS.nav.msGetUserMedia);

  if (GLOBALS.nav.getUserMedia) {
    console.log('getUserMedia supported.');
    GLOBALS.nav.getUserMedia (
      { audio: true },
      function(audioStream) {
        var source = this.audioContext.createMediaStreamSource(audioStream);
        source.connect(this.scriptNode);
        this.scriptNode.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);
      }.bind(this),
      function(streamError) {
        throw( new Error("The following gUM Error occured: " + streamError) );
      }
    );
  } else {
     throw( new Error("getUserMedia not supported on your browser!") );
  }

  this.scriptNode.onaudioprocess = function(audioProcessingEvent) {
    this.codeNumber++;
    let left = audioProcessingEvent.inputBuffer.getChannelData (0);
    let right = audioProcessingEvent.inputBuffer.getChannelData (1);
    let leftout = audioProcessingEvent.outputBuffer.getChannelData (0);
    let rightout = audioProcessingEvent.outputBuffer.getChannelData (1);
    this.leftChannel.push (new Float32Array (left));
    this.rightChannel.push (new Float32Array (right));
    this.codeChannel.push (this.codeNumber);

    for (let sample = 0; sample < this.scriptProcessorBuffer; sample++) {
      // track max amplitude encountered
      if (left[sample] > this.dispPeak) { this.dispPeak = left[sample]; }
      if (left[sample] < -this.dispPeak) { this.dispPeak = -left[sample]; } // TODO check both
      if(loResWaveformParams){
        // if enough samples have elapsed push a display data point & reset counter
        this.dispCount--;
        if (this.dispCount < 0) {
          this.dispCount = this.samplesPerDataPoint;
          this.loResWaveform.push(this.dispPeak);
          this.loResWaveform.shift();
          this.loResCodeChannel.push(this.codeNumber);
          this.loResCodeChannel.shift();
          this.dispPeak = 0;
          if(!this.loResOffset) {
            this.loResOffset = this.codeNumber - 1;
          }
        }
      } //end if
    } // end for

    while ((GLOBALS.state === "buffer") && (this.leftChannel.length > this.recBufArrayLength)) {
      let trimLength = this.leftChannel.length - this.recBufArrayLength;
      console.log(trimLength," to trim");
      this.leftChannel.splice(0, trimLength);
      this.rightChannel.splice(0, trimLength);
      this.codeChannel.splice(0, trimLength);
    }

    this.updateBlockTotal();

  }.bind(this);


};
