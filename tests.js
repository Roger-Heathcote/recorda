/*jshint esversion: 6 */
var fs = require('fs');
var loadRawJS = function(fileName){ (1,eval)( fs.readFileSync(fileName,'utf8') ); }.bind(this);

// //eval(fs.readFileSync('./scripts/globalFunctions.js','utf8'));
// loadRawJS('./scripts/globalFunctions.js');
//
// //console.log(hslToRgb(327.0,0.91,0.71));
// //randomColorCode
//
// console.log(randomColorCode(90,100));
test1: {
  require("web-audio-test-api");

  let navigator = {};
    // This program is licensed under the MIT License.
  navigator.getUserMedia = function(opt, ok, ng) {
    console.log("Sure I'm GetUserMedia, come on over.")
    ok(null);
  };
  AudioContext.prototype.createMediaStreamSource = function() {
      var osc = this.createOscillator();
      osc.type = 'sine';
      var gain = this.createGain();
      gain.gain.value = 0.0;
      osc.connect(gain);
      osc.start(0);
      setInterval(function() {
          gain.gain.value = 0.5;
          setTimeout(function() { gain.gain.value = 0.0; }, 800);
      }, 1000);
      return gain;
  };

  a = new AudioContext();
  console.log(a);

  let window = {};
  window.AudioContext = AudioContext;

  loadRawJS('./scripts/globalFunctions.js');
  loadRawJS('./scripts/humane_dates.js');
  loadRawJS('./scripts/AudioEngine.js');
  loadRawJS('./scripts/RecorderApp.js');
  //loadRawJS('./scripts/.js');
  //sloadRawJS('./scripts/.js');

  const bufferLength = 30;
  const loResWaveformParams = { dataPoints: 300, secondsToDisplay: bufferLength };
  console.log("Constructing new RecorderApp");
  recorder = new RecorderApp(
    window,
    navigator,
    AudioEngine,
    bufferLength
  );
  recorder.init();
  recorder.globals.inPoint = recorder.audEng.codeChannel[0];
  console.log("recGLOBS:", recorder.globals);
  recorder.record();

  (function stayAliveFor(i) {
    setTimeout(function () {
      console.log("left Channel Length:", recorder.audEng.leftChannel.length);
      console.log("left Channel [0]:", recorder.audEng.leftChannel[0]);
      console.log("Code number:", recorder.audEng.codeNumber);
      if (--i) {          // If i > 0, keep going
        stayAliveFor(i);       // Call the loop again, and pass it the current value of i
      }
    }, 2000);
  })(5);
}
