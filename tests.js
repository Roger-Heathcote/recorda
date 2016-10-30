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
( function() {
  return;
  require("web-audio-test-api");

  let navigator = {};
    // This program is licensed under the MIT License.
  navigator.getUserMedia = function(opt, ok, ng) {
    console.log("Sure I'm GetUserMedia, come on over.");
    console.log("THIS IS: ", this, ok);
    let audioStream = this.audioContext.createMediaStreamSource();
    ok(audioStream);
    //ok(null);
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
  //b = new window.AudioContext;
  //console.log(b);

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

  // (function stayAliveFor(i) {
  //   setTimeout(function () {
  //     recorder.audEng.scriptNode.__process();
  //     console.log("left Channel Length:", recorder.audEng.leftChannel.length);
  //     console.log("left Channel [0]:", recorder.audEng.leftChannel[0]);
  //     console.log("Code number:", recorder.audEng.codeNumber);
  //     if (--i) {          // If i > 0, keep going
  //       stayAliveFor(i);       // Call the loop again, and pass it the current value of i
  //     }
  //   }, 2000);
  // })(5);
}());


( function () {
  let testName = "Test stereoFloat32ToInterleavedInt16";
  loadRawJS('./scripts/globalFunctions.js');
  left = Float32Array.from([1,0.5,0,-0.5]);
  right = Float32Array.from([-1,-0.5,0,0.5]);
  let result = stereoFloat32ToInterleavedInt16(left, right);
  let expected = Int16Array.from([ 32767, -32768, 16383, -16384, 0, 0, -16384, 16383 ]);
  if (JSON.stringify(result) !== JSON.stringify(expected)) {
    console.log(result);
    console.log(expected);
    throw new Error( testName );
  }
}());


( function () {
  let testName = "Test stereoFloat32ToInterleavedInt16 empty";
  loadRawJS('./scripts/globalFunctions.js');
  left = Float32Array.from([]);
  right = Float32Array.from([]);
  let result = stereoFloat32ToInterleavedInt16(left, right);
  let expected = Int16Array.from([]);
  if (JSON.stringify(result) !== JSON.stringify(expected)) {
    console.log(result);
    console.log(expected);
    throw new Error( testName );
  }
}());



function makeBufferTestFixture(inputString){
  let buffer = new ArrayBuffer(inputString.length);
  let view = new DataView(buffer);
  for(i=0; i<inputString.length; i++){
    view.setUint8(i, inputString.charCodeAt(i) );
    // console.log( inputString.charCodeAt(i) );
  }
  return buffer;
}




( function(){

  let window = {};
  window.AudioContext = function fakeAudioContext(){
    this.fakePropery1 = "fake";
    console.log("I'm not real!");
    this.createGain = function fakeCreateGain(){
      console.log("fakeCreateGain");
      let fakeGainNode = {
        connect: function(){ console.log("fakeCreateGainConnectMethod");}
      };
      return fakeGainNode;
    };
    this.createScriptProcessor = function fakeCreateScriptProcessor(bufferSize,y,z){
      console.log("fakeCreateScriptProcessor, size =", bufferSize);
      let scriptProcessor = {
        connect: function(){ console.log("fakeCreateScriptProcessor connect method.");}
      };

      return scriptProcessor;
    };
    this.sampleRate = 44100;
    this.createMediaStreamSource = function createFakeMediaStreamSource(){
      console.log("fakeCreateMediaStreamSource");
      let fakeMediaStreamSource = {
        connect: function fakeConnect(){ console.log("Arse pipes akimbo"); }
      };
      return fakeMediaStreamSource;
    };
  };

  let navigator = {};
  navigator.mediaDevices = {};
  navigator.mediaDevices.getUserMedia = function fakeGetUserMedia(constraints){
    console.log("Sure I'm GetUserMedia, come on over.");
    console.log("THIS IS: ", this);
    console.log("CONSTRAINTS ARE:", constraints);

    return new Promise(
      function(resolve, reject) {
        if ( true ) {
          let fakeAudioStream = {};
          fakeAudioStream.getAudioTracks = function fakeGetAudioTracks(){
            return [{
              applyConstraints: function fakeApplyConstraints(constraint){
                console.log("applying fake constraint:", constraint);
              }
            }];
          };
          resolve(fakeAudioStream); // this should return an audio stream
        }
        else {
          reject(Error("It broke"));
        }
      }
    );

  };






  // function(opt, ok, ng) {
  //   console.log("Sure I'm GetUserMedia, come on over.");
  //   console.log("THIS IS: ", this, ok);
  //   //let audioStream = this.audioContext.createMediaStreamSource();
  //   //ok(audioStream);
  //   //ok(null);
  // };


  loadRawJS('./scripts/OptionalAudioConstraints.js');
  loadRawJS('./scripts/globalFunctions.js');
  loadRawJS('./scripts/humane_dates.js');
  loadRawJS('./scripts/AudioEngine.js');
  loadRawJS('./scripts/RecorderApp.js');

  const bufferLength = 30;
  console.log("Constructing new RecorderApp");
  recorder = new RecorderApp(
    window,
    navigator,
    AudioEngine,
    bufferLength
  );
  recorder.init();
  // recorder.globals.inPoint = recorder.audEng.codeChannel[0];
  // console.log("recGLOBS:", recorder.globals);
  recorder.record();

  console.log("Borls");

  var ScriptNodeTestFixture = function ScriptNodeTestFixture(){
      this.data = Float32Array.from(createScriptProcessorTestFixture(4096));
      this.inputBuffer = {
        getChannelData: function(index){
          return 1;
        }
      };
      this.outputBuffer = {
        getChannelData: function(index){
          return 1;
        }
      };
  };

  scriptNodeTestFixture = new ScriptNodeTestFixture();
  recorder.audEng.scriptNode.onaudioprocess( scriptNodeTestFixture, true );
  recorder.audEng.scriptNode.onaudioprocess( scriptNodeTestFixture, true );
  console.log("yeah done");
  setInterval( recorder.audEng.scriptNode.onaudioprocess, 1000, scriptNodeTestFixture, true );

})();



function createScriptProcessorTestFixture(lenf){
  out = [];
  cur = 0;
  ofs = 0.01;
  for(x=0; x<lenf; x++){
    cur = cur + ofs;
    out.push(cur);
    if (Math.abs(cur) > 0.9){
      ofs = -ofs;
    }
  }
  return out;
}
