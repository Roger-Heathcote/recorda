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
  //this.state = "buffer";
  this.scriptProcessorBuffer = 16384 / 4; //64;
  this.channels = 2;
  this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
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

let samples =
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
      // Ask for audio input
      { audio: true },
      // If we get it...
      function(stream) {
        console.log("IN THE STREAM FUNCTION");
        var source = temp.audioContext.createMediaStreamSource(stream);
        source.connect(temp.scriptNode);
        temp.scriptNode.connect(temp.gainNode);
        temp.gainNode.connect(temp.audioContext.destination);
        //updateDisplay();
      },
      // If we don't
      function(err) {
        console.log('The following gUM error occured: ' + err);
      }
    );
  } else {
     console.log('getUserMedia not supported on your browser!');
  }

  this.scriptNode.onaudioprocess = function(audioProcessingEvent) {
    this.codeNumber++;
    //console.log(this.codeNumber);
    let left = audioProcessingEvent.inputBuffer.getChannelData (0);
    let right = audioProcessingEvent.inputBuffer.getChannelData (1);
    let leftout = audioProcessingEvent.outputBuffer.getChannelData (0);
    let rightout = audioProcessingEvent.outputBuffer.getChannelData (1);

    // we clone the samples
    // TOD
    this.leftChannel.push (new Float32Array (left));
    this.rightChannel.push (new Float32Array (right));
    this.codeChannel.push (this.codeNumber);

    for (let sample = 0; sample < this.scriptProcessorBuffer; sample++) {

      // Looks like we didn't have to do this :)
      // leftout[sample] = left[sample];
      // rightout[sample] = right[sample];

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
    //if not this.recording drop block from front of buffer
    while ((GLOBALS.state === "buffer") && (this.leftChannel.length > this.recBufArrayLength)) {
      let trimLength = this.leftChannel.length - this.recBufArrayLength;
      console.log(trimLength," to trim");
      //this.leftChannel.shift(trimLength); this.rightChannel.shift(trimLength); this.codeChannel.shift(trimLength);
      this.leftChannel.splice(0, trimLength);
      this.rightChannel.splice(0, trimLength);
      this.codeChannel.splice(0, trimLength);
    }

    temp.updateBlockTotal();
  }.bind(this);


};
