"use strict";

let importProperties = require("./pureGeneralFunctions.js").importProperties;
let formatBytes = require("./pureGeneralFunctions.js").formatBytes;
let binarySearch = require("./pureGeneralFunctions.js").binarySearch;
let sanitize = require("./pureGeneralFunctions.js").sanitize;

let makeWAVFileBlobGenerator = require("./makeAudioFile.js").makeWAVFileBlobGenerator;
let humaneDate = require("./humane_dates.js").humaneDate;

let humanReadableLocalDate = require("./impureGeneralFunctions.js").humanReadableLocalDate;
let utcToSystemLocalTimestamp = require("./impureGeneralFunctions.js").utcToSystemLocalTimestamp;
let randomColorCode = require("./impureGeneralFunctions.js").randomColorCode;
let randomUUID = require("./impureGeneralFunctions.js").randomUUID;

var RecorderApp = function RecorderApp(
  window,
  navigator,
  AudioEngine,
  bufferLength,
  audioOptions,
  options=false
){
  importProperties(options, this);

  var stateObject = {
    name: "Name not set",
    init: target => this.target = target,
    reset: () => this.target.init(),
    enter: () => {
      //console.log("Setting global state to", this.target.state.name);
      this.target.globals.state = this.target.state.name;
    },
    execute: () => null, //console.log(this.target.state.name+": executing."),
    buffer: () => this.target.changeState(this.target.states.buffer),
    record: () => this.target.changeState(this.target.states.record),
    save: () => this.target.changeState(this.target.states.save),
    exit: () => null //console.log(this.target.state.name+": exiting.")
  };

  var bufferState = createStateObject(stateObject, "buffer", "buffering");
  var recordState = createStateObject(stateObject, "record", "recording");
  var saveState = createStateObject(stateObject, "save", "saving");

  let instance = this;
  let GLOBALS = {
    win:window,
    nav:navigator,
    state:"buffer",
    secondsToBuffer: bufferLength,
    loResInPoint: undefined,
    loResOutPoint: undefined,
    setLoResInPoint: function(v){
      this.loResInPoint = v;
      instance.fullResInPoint = binarySearch(instance.audEng.codeChannel, v);
      //console.log("GLOBALS:", GLOBALS);
    },
    setLoResOutPoint: function(v){
      this.loResOutPoint = v;
      instance.fullResOutPoint = binarySearch(instance.audEng.codeChannel, v);
    },
    recordings: new Array(0)
  };
  this.audioOptions = audioOptions;
  this.states = { buffer: bufferState, record: recordState, save: saveState };
  this.globals = GLOBALS;
  this.toggleAudioPassthrough = function toggleAudioPassthrough(){
    this.audEng.toggleAudioPassthrough();
  };
  this.saveEngineFiresEveryXMs = this.saveEngineFiresEveryXMs || 100;
  this.saveEngineRunsForAboutXMs = this.saveEngineRunsForAboutXMs || 33;
  this.saveEngine = function(){
    if(this.currentSave){
      let timeOut = Date.now() + this.saveEngineRunsForAboutXMs;
      do {
        let progress = this.currentSave.next();
        if(!progress.done){
          if(this.saveModeUpdateCallback){ this.saveModeUpdateCallback(progress.value);}
          // console.log("this.saveModeUpdateCallback:", this.saveModeUpdateCallback);
        }
      }
      while ( this.currentSave && Date.now() < timeOut );
    }
  }.bind(this);

  bufferState.handleWaveformClick = function bufferStateHandleWaveformClick(code) {
    console.log("inPoint code we just got is:", code);
    GLOBALS.setLoResInPoint(code);
    console.log("inPoint set as:", GLOBALS.loResInPoint);
    GLOBALS.state = "record";
    this.record();
  }.bind(this);

  recordState.handleWaveformClick = function recordStateHandleWaveformClick(code) {
    console.log("outPoint code we just got is:", code);
    if(code >= GLOBALS.loResInPoint) // outpoint must be after in point!
      {
        GLOBALS.setLoResOutPoint(code);
        console.log("outPoint set as:", GLOBALS.loResOutPoint);
        GLOBALS.state = "save";
        this.save();
      } else {
        console.log("Outpoint must be after in point doofus!");
      }
  };

  saveState.handleWaveformClick = function saveStateHandleWaveformClick() {
  };


  saveState.execute = function saveStateExecute() {

    let saveCompleteCallback = function saveCompleteCallback(WAVFileBlob){
      // Push recording onto recordings list
      let dateNow = Date.now();
      GLOBALS.recordings.push({
        name: humanReadableLocalDate(dateNow),
        data: WAVFileBlob,
        UCTTimestamp: dateNow,
        localTimestamp: utcToSystemLocalTimestamp(dateNow), // need to get adjustment from humanReadableDatetime and refactor / write dateLocal(dateNow)!
        // sampleRate: this.audEng.sampleRate,
        size: WAVFileBlob.size, // 16 bit
        color: randomColorCode(175,250),
        url: getURLOrDont(GLOBALS.win,WAVFileBlob),
        uuid: randomUUID(8)
      });
      if(this.recordingsListChangedCallback){this.recordingsListChangedCallback();}
      this.currentSave = undefined;
      this.buffer();
    }.bind(this);

    this.currentSave = makeWAVFileBlobGenerator(
      this.audEng.audioData,
      this.fullResInPoint,
      this.fullResOutPoint,
      this.audEng.sampleRate,
      this.audioOptions,
      saveCompleteCallback
    );

    //console.log("this.currentSave is", this.currentSave);

  }.bind(this);

  saveState.enter = function saveStateEnter(){
    if(this.enteringSaveModeCallback){this.enteringSaveModeCallback();}
  }.bind(this);

  saveState.exit = function saveStateExit(){
    GLOBALS.setLoResInPoint(undefined);
    GLOBALS.setLoResOutPoint(undefined);
    if(this.exitingSaveModeCallback){this.exitingSaveModeCallback();}
  }.bind(this);

  this.toggleOptionalAudioConstraint = function recorderToggleOptionalAudioConstraint(constraintName){
    this.audEng.toggleOptionalAudioConstraint(constraintName);
  };

  this.init = function RecorderAppInit() {
    this.states.buffer.init(this);
    this.states.record.init(this);
    this.states.save.init(this);
    this.state = this.states.buffer;
    this.audEng = new AudioEngine(
      GLOBALS,
      audioOptions,
      {
        loResWaveformParams: this.loResWaveformParams,
        optionalMediaConstraints: this.optionalMediaConstraints,
        scriptProcessorBufferLength: this.scriptProcessorBufferLength
      }
    );
    if(this.MouseStatus) { this.mouse = new this.MouseStatus(this.canvas); }
    if(this.WaveformDisplay){
      this.waveDisp = new this.WaveformDisplay(
        GLOBALS,
        window,
        this.canvas,
        this.mouse,
        this.audEng.loResWaveform,
        this.audEng.loResCodeChannel,
        this.waveformClicked);
    }
    this.saveEngineTimer = setInterval(this.saveEngine, this.saveEngineFiresEveryXMs);
    this.state.enter();
    this.state.execute();
  };

  this.buffer = function buffer() { this.state.buffer(); };
  this.record =  function record() { this.state.record(); };
  this.save =  function save() { this.state.save(); };
  this.changeState = function changeState(state) {
    if (this.state !== state) {
      this.state.exit();
      this.state = state;
      this.state.enter();
      this.state.execute();
    }
  };

  this.waveformClicked = function waveformClicked(code) {
    this.state.handleWaveformClick(code);
  }.bind(this);

  this.vmDataDisplayBlock = function vmDataDisplayBlock(){
    let out = {};
    out.memory = this.getMemory();
    return out;
  };

  this.vmOptions = function vmOptions(){
    let viewModel = this.vm_OptionalAudioConstraints();
    let output = [];
    Object.keys(viewModel).forEach(
      function(name){
        output.push( { name:name, status:viewModel[name] } );
      }
    );
    return output;
  };

  this.vmRecordings = function vmRecordings(){
    let list = [];
    let recordings = GLOBALS.recordings.slice();
    //recordings.reverse();
    recordings.forEach(function recordingsForEach(recording) {
      let recObj = {
        id: recording.uuid,
        color: recording.color,
        date: humaneDate( new Date(recording.localTimestamp) ),
        name: sanitize(recording.name),
        url: recording.url
      };
      list.push(recObj);
    });
    return list;
  }.bind(this);

  this.vm_OptionalAudioConstraints = function vm_OptionalAudioConstraints(){
    return this.audEng.currentAudioConstraints();
  };

  this.getMemory = function getMemory() {
    let out = {};
    out.recordings = formatBytes(GLOBALS.recordings.reduce( (t,r) => t + r.size, 0));
    out.buffers = formatBytes(this.audEng.audioData.length * this.audEng.scriptProcessorBufferLength);
    return out;
  }.bind(this);

  this.getRecordingByUuid = function getRecordingByUuid(id) {
    return GLOBALS.recordings.filter( (obj) => obj.uuid === id )[0];
  }.bind(this);

  this.deleteRecordingByUuid = function deleteRecordingByUuid(id) {
    let recording = this.getRecordingByUuid(id);
    let idx =  GLOBALS.recordings.indexOf(recording);
    GLOBALS.recordings.splice(idx, 1 );
    if(this.recordingsListChangedCallback) {this.recordingsListChangedCallback();}
  }.bind(this);

  this.changeLengthOrQuality = function changeLengthOrQuality(bufferLength, audioOptions){
    console.log("Changywangywoowah:", bufferLength, audioOptions);
    if(GLOBALS.state === "save"){
      console.log("Can't change buffer length mid save");
    } else {
      console.log("Setting buffer length to", bufferLength);

      GLOBALS.state = "reset";
      this.audEng.quit(); // = undefined;
      this.waveDisp.quit(); // = undefined;
      this.audEng = undefined;
      this.waveDisp = undefined;
      this.audioOptions = audioOptions;
      clearInterval(this.saveEngineTimer);

      //hmm we're doubling up on click handlers, let's not!

      setTimeout(function resettingBufferLength(){
        console.log("GOGOGOOOOOO!");
        this.state = this.states.buffer;
        GLOBALS.state = "buffer";
        console.log("Set GLOBALS secondsToBuffer to", bufferLength);
        GLOBALS.secondsToBuffer = bufferLength;
        // this.loResWaveformParams.secondsToDisplay = len;
        console.log("GLOBALS secondsToBuffer is now", GLOBALS.secondsToBuffer);
        GLOBALS.loResInPoint = undefined;
        GLOBALS.loResOutPoint = undefined; //
        this.audEng = new AudioEngine(
          GLOBALS,
          this.audioOptions,
          {
            loResWaveformParams: this.loResWaveformParams,
            optionalMediaConstraints: this.optionalMediaConstraints,
            scriptProcessorBufferLength: this.scriptProcessorBufferLength
          }
        );
        if(this.WaveformDisplay){
          this.waveDisp = new this.WaveformDisplay(
            GLOBALS,
            window,
            this.canvas,
            this.mouse,
            this.audEng.loResWaveform,
            this.audEng.loResCodeChannel,
            this.waveformClicked);
        }
        this.saveEngineTimer = setInterval(this.saveEngine, this.saveEngineFiresEveryXMs);
        this.state.enter();
        this.state.execute();

        console.log("So yeah, did that.");

      }.bind(this), 0);
    }

  }.bind(this);

  function createStateObject(stateObject, stateName, stateIng) {
    let newObject = Object.create(stateObject);
    newObject.name = stateName;
    newObject[stateName] = () => console.log(this.target.state.name+": already "+stateIng+".");
    return newObject;
  }

  function getURLOrDont(win, blob){
    if(win.URL){ return win.URL.createObjectURL(blob); }
    return "http://no.URL.on.window.object.probably.running.headless";
  }

};

module.exports = RecorderApp;
