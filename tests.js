/*jshint esversion: 6 */
var fs = require('fs');
var loadRawJS = function(fileName){ (1,eval)( fs.readFileSync(fileName,'utf8') ); }.bind(this);

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
  window.URL = {};
  window.URL.createObjectURL = function fakeCreateObjectURL(blob){
    return "http://fake.url.for.testing";
  }

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
  recorder.record();

  let ScriptNodeTestFixture = function ScriptNodeTestFixture(){
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
  }.bind(this);

  scriptNodeTestFixture = new ScriptNodeTestFixture();
  console.log("yeah done");
  //setInterval( recorder.audEng.scriptNode.onaudioprocess, 1000, scriptNodeTestFixture, true );
  for(cnt=0; cnt<10; cnt++){
    recorder.audEng.scriptNode.onaudioprocess(scriptNodeTestFixture, true);
  }

  recorder.globals.inPoint=0;
  recorder.globals.outPoint=recorder.audEng.codeNumber;
  console.log("recorder.audEng", recorder.audEng);
  console.log("WAAAAAAAAAANNNNNNGGGGGGG", recorder.globals);
  recorder.save();

  setTimeout(
    nextstep,
    0,
    recorder
  );

})();

function nextstep(recorder) {
  console.log("YEah bwoy");
  blob = recorder.globals.recordings[0].data;
  blob2arrayBuffer(blob, function(data){
    console.log("Data is", typeof(data), data.byteLength, data);
    console.log( bytes2Hex(data) );
    console.log( bytes2AsciiAndNumbers(data) );
  });
}

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
