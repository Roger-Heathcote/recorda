/*jshint esversion: 6 */
/*jshint -W027 */
/*jshint -W067 */
var biguglyendtoendtest = function(){

  let OptionalAudioConstraints = require("../source/OptionalAudioConstraints.js");
  let AudioEngine = require("../source/AudioEngine.js");
  let RecorderApp = require("../source/RecorderApp.js");
  const audioOptions = require("../source/audioPresets.js").defaultPreset;

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

  function* testFixtureGenerator(lenf, velocity, maxAmp){

    let cur = 0;
    let vel = velocity;  //0.01;
    let out = [];
    while(true){
      out = [];
      for(x=0; x<lenf; x++){
        cur = cur + vel;
        out.push(cur);
        if (Math.abs(cur) > maxAmp){
          vel = -vel;
        }
      }
      yield out;
    }
  }
  //wang
  function BigUglyTestHarness(instanceName, bufferLength, numberOfChannels, callsScriptProcessorXTimes, velocity, maxAmp, recorderOptions, callback){
    //importProperties(options, this);
    let that = this;
    let window = fakeWindow();
    let navigator = fakeNavigator();
    recorderOptions.recordingsListChangedCallback = whenRecordingAdded;
    this.instanceName = instanceName;
    recorder = new RecorderApp(
      window,
      navigator,
      AudioEngine,
      bufferLength,
      audioOptions,
      recorderOptions );
    recorder.init();
    recorder.record();

    let FakeInputStream = function FakeInputStream(blockSize, velocity, maxAmp){
      testFixtures = [];
      for(channel=0; channel<recorder.audioOptions.channels; channel++){
        testFixtures.push( testFixtureGenerator(blockSize,0.01,0.9) );
      }
      this.inputBuffer = {
        getChannelData: function fakeGetChannelDataForInputBuffer(index){
          let data = testFixtures[index].next();
          return data.value;
        }
      };
      this.outputBuffer = {
        getChannelData: function fakeGetChannelDataForOuputBuffer(index){
          return 1;
        }
      };
    };

    fakeInputStream = new FakeInputStream(recorder.audEng.scriptProcessorBufferLength, velocity, maxAmp); // why undefined?


    for(cnt=0; cnt<callsScriptProcessorXTimes; cnt++){
      recorder.audEng.scriptNode.onaudioprocess(fakeInputStream, true);
    }

    // TODO - ASK DONT TELL! - Add a select all method to recorder
    // TODO Also while were are it add a setInNow() and setOutNow()
    let myindex = 0;
    while (recorder.audEng.codeChannel[myindex] === 0) {myindex++;}
    recorder.fullResInPoint=myindex;
    recorder.fullResOutPoint=recorder.fullResInPoint + recorder.audEng.codeNumber;
    recorder.save();

    function whenRecordingAdded() {
      blob = recorder.globals.recordings[0].data;
      blob2arrayBuffer(blob, callback);
    }
  }

  // Test 1 - is anything returned at all

  bigUglyTester = function bigUglyTester(){
    let bufferLength = 30;
    let scriptProcessorBufferLength = 4096;
    let callsScriptProcessorXTimes = 7;
    let textFixtureCursorVelocity = 0.1;
    let testFixtureMaximumAmplitude = 0.9;
    let numberOfChannels = 2;
    let bytesPerChannel = 2;
    let recorderConstructorOptions = {
      scriptProcessorBufferLength: scriptProcessorBufferLength
    };
    new BigUglyTestHarness(
      "test1",
      bufferLength,
      numberOfChannels,
      callsScriptProcessorXTimes,
      textFixtureCursorVelocity,
      testFixtureMaximumAmplitude,
      recorderConstructorOptions,
      function(data){
        if(!data){ throw new Error("Big Ugly Test 1 - Nothing returned at all :/");}
        console.log("Big Ugly Test 1 - passed");

        let blockSize = scriptProcessorBufferLength * numberOfChannels * bytesPerChannel;
        let targetSize = (blockSize * callsScriptProcessorXTimes) + 44;
        let actualSize = data.byteLength;
        if(targetSize !== actualSize){
          console.log("Size is supposed to be:", targetSize);
          console.log("Size actually is:", actualSize);
          throw new Error("Big Ugly Test 2 - Size don't match :/");
        }
        console.log("Big Ugly Test 2 - passed");

        let actualLastByte = getByteFromArrayBuffer(data,actualSize-1);
        let targetLastByte = 189;
        if(actualLastByte !== targetLastByte){
          console.log("Last bytes is suposed to be:", targetLastByte);
          console.log("Actual last byte is:", actualLastByte);
          throw new Error("Big Ugly Test 3 - Last byte not what we expected :/");
        }
        console.log("Big Ugly Test 3 - passed");
        debugger;
        process.exit();

      }
    );
  };
  bigUglyTester();
  console.log("Tests scheduled");
};


function blob2arrayBuffer(blob, callback){
  if(blob.hasOwnProperty("readme")){
    callback(blob.data);
  } else {
    let arrayBuffer;
    let fileReader = new FileReader();
    fileReader.onload = function() {
      callback(this.result);
    };
    fileReader.readAsArrayBuffer(blob);
  }
}

function getByteFromArrayBuffer(buffer, index){
  let view = new Uint8Array(buffer);
  return view[index];
}

module.exports = biguglyendtoendtest();
