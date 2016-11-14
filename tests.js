/*jshint esversion: 6 */
/*jshint -W027 */
/*jshint -W067 */

var fs = require('fs');
var loadRawJS = function(fileName){ (1,eval)( fs.readFileSync(fileName,'utf8') ); }.bind(this);

loadRawJS('./scripts/OptionalAudioConstraints.js');
loadRawJS('./scripts/globalFunctions.js');
loadRawJS('./scripts/humane_dates.js');
loadRawJS('./scripts/AudioEngine.js');
loadRawJS('./scripts/RecorderApp.js');

( function () {
  return;
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

// function makeBufferTestFixture(inputString){
//   let buffer = new ArrayBuffer(inputString.length);
//   let view = new DataView(buffer);
//   for(i=0; i<inputString.length; i++){
//     view.setUint8(i, inputString.charCodeAt(i) );
//     // console.log( inputString.charCodeAt(i) );
//   }
//   return buffer;
// }



// BIG UGLY AUDIO ENGINE TO RECORDING END TO END TEST
// BIG UGLY AUDIO ENGINE TO RECORDING END TO END TEST
// BIG UGLY AUDIO ENGINE TO RECORDING END TO END TEST
// BIG UGLY AUDIO ENGINE TO RECORDING END TO END TEST
// BIG UGLY AUDIO ENGINE TO RECORDING END TO END TEST
// BIG UGLY AUDIO ENGINE TO RECORDING END TO END TEST
// BIG UGLY AUDIO ENGINE TO RECORDING END TO END TEST
// BIG UGLY AUDIO ENGINE TO RECORDING END TO END TEST
// BIG UGLY AUDIO ENGINE TO RECORDING END TO END TEST
// BIG UGLY AUDIO ENGINE TO RECORDING END TO END TEST
// BIG UGLY AUDIO ENGINE TO RECORDING END TO END TEST
// BIG UGLY AUDIO ENGINE TO RECORDING END TO END TEST
// BIG UGLY AUDIO ENGINE TO RECORDING END TO END TEST
// BIG UGLY AUDIO ENGINE TO RECORDING END TO END TEST
// BIG UGLY AUDIO ENGINE TO RECORDING END TO END TEST

// FAKE WINDOW
// FAKE WINDOW
// FAKE WINDOW
// FAKE WINDOW
// FAKE WINDOW
// FAKE WINDOW
// FAKE WINDOW

function fakeWindow(){
  let window = {};
  window.AudioContext = function fakeAudioContext(){
    this.createGain = function fakeCreateGain(){
      let fakeGainNode = {
        connect: function(){ /*console.log("fakeCreateGainConnectMethod");*/ }
      };
      return fakeGainNode;
    };
    this.createScriptProcessor = function fakeCreateScriptProcessor(bufferSize,y,z){
      //console.log("fakeCreateScriptProcessor, size =", bufferSize);
      let scriptProcessor = {
        connect: function(){ /*console.log("fakeCreateScriptProcessor connect method.");*/ }
      };
      return scriptProcessor;
    };
    this.sampleRate = 44100;
    this.createMediaStreamSource = function createFakeMediaStreamSource(){
      //console.log("fakeCreateMediaStreamSource");
      let fakeMediaStreamSource = {
        connect: function fakeConnect(){ /*console.log("fakeCreateMediaStreamSource connect method");*/ }
      };
      return fakeMediaStreamSource;
    };
  };
  return window;
}

// FAKE NAVIGATOR
// FAKE NAVIGATOR
// FAKE NAVIGATOR
// FAKE NAVIGATOR
// FAKE NAVIGATOR
// FAKE NAVIGATOR

function fakeNavigator(){
  let navigator = {};
  navigator.mediaDevices = {};
  navigator.mediaDevices.getUserMedia = function fakeGetUserMedia(constraints){
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
  return navigator;
}




// THE MEAT OF THE MATTER
// THE MEAT OF THE MATTER
// THE MEAT OF THE MATTER
// THE MEAT OF THE MATTER
// THE MEAT OF THE MATTER
// THE MEAT OF THE MATTER
// THE MEAT OF THE MATTER

function* testFixtureGenerator(lenf, offset, source=false){
  // lets make this a generator that returns chunks of an actual test wav
  let cur = 0;
  let ofs = offset;  //0.01;
  let out = [];
  while(true){
    out = [];
    for(x=0; x<lenf; x++){
      cur = cur + ofs;
      out.push(cur);
      if (Math.abs(cur) > 0.9){
        ofs = -ofs;
      }
    }
    yield out;
  }
}
//wang
function BigUglyTestHarness(instanceName, numberOfChannels, options, callback){
  importProperties(options, this);
  let that = this;
  let window = fakeWindow();
  let navigator = fakeNavigator();

  this.instanceName = instanceName;
  this.bufferLength = this.bufferLength || 30;

  recorder = new RecorderApp(
    window,
    navigator,
    AudioEngine,
    this.bufferLength,
    { recordingsListChangedCallback: whenRecordingAdded }
  );
  console.log("recorder --->", recorder);
  recorder.init();
  recorder.record();

  let FakeInputStream = function FakeInputStream(blockSize, sourceFile=false){
    testFixtures = [];
    if(!sourceFile){
      for(channel=0; channel<recorder.audEng.channels; channel++){
        testFixtures.push( testFixtureGenerator(blockSize,0.01,sourceFile) );
      }
    }
    this.inputBuffer = {
      getChannelData: function fakeGetChannelDataForInputBuffer(index){
        let data = testFixtures[index].next();
        //debugger
        return data.value;
      }
    };
    this.outputBuffer = {
      getChannelData: function fakeGetChannelDataForOuputBuffer(index){
        return 1;
      }
    };
  };

  fakeInputStream = new FakeInputStream(recorder.audEng.scriptProcessorBufferLength); // why undefined?


  //console.log(this.instanceName, "yeah done");
  for(cnt=0; cnt<3; cnt++){
    console.log(this.instanceName, "Running scriptNode");
    recorder.audEng.scriptNode.onaudioprocess(fakeInputStream, true);
  }
  //
  // ASK DONT TELL!
  // Add a select all method to recorder
  let myindex = 0;
  while (recorder.audEng.codeChannel[myindex] === 0) {myindex++;}
  recorder.fullResInPoint=myindex;
  recorder.fullResOutPoint=recorder.fullResInPoint + recorder.audEng.codeNumber;

  // Also while were are it add a setInNow() and setOutNow()
  //
  // recorder.selectAll();
  recorder.save();

  //setTimeout( whenRecordingAdded, 2000, recorder ); // give async a couple of secs to complete
  function whenRecordingAdded() {
    blob = recorder.globals.recordings[0].data;
    blob2arrayBuffer(blob, callback);
  };
};

// Pre test test
// BigUglyTestHarness(2, function stereoTest1(data){
//   // console.log("Data is", typeof(data), data.byteLength, data);
//   // console.log( bytes2Hex(data) );
//   // console.log( bytes2AsciiAndNumbers(data) );
//   // let nodeBuffer = new Buffer(data, 'binary');
//   // fs.writeFileSync("testOut2.wav", nodeBuffer, {encoding:"binary"});
// });

// Test 1 - is anything returned at all
console.log("Starting tests");

new BigUglyTestHarness("test1", 2, {}, function(data){
  if(!data){ throw new Error("Nothing returned at all :/");}
  console.log("Test1 passed");
  console.log( bytes2AsciiAndNumbers(data) );

  // new BigUglyTestHarness("test2", 2, { bufferLength:128 }, function(data){
  //   console.log( bytes2AsciiAndNumbers(data) );
  //
  //   let nodeBuffer = new Buffer(data, 'binary');
  //   fs.writeFileSync("testOut2.wav", nodeBuffer, {encoding:"binary"});
  //
  // });

});
// //
// let test2 = new BigUglyTestHarness(2, function(data){
//   console.log( bytes2AsciiAndNumbers(data) );
// });
// Test 1 - is anything returned at all
