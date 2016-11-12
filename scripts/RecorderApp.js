//jshint esversion: 6

var stateObject = {
  name: "Name not set",
  init: target => this.target = target,
  reset: target => this.target.init(),
  enter: target => {
    console.log("Setting global state to", this.target.state.name);
    this.target.globals.state = this.target.state.name;
  },
  execute: target => console.log(this.target.state.name+": executing."),
  buffer: target => this.target.changeState(this.target.states.buffer),
  record: target => this.target.changeState(this.target.states.record),
  save: target => this.target.changeState(this.target.states.save),
  exit: target => null //console.log(this.target.state.name+": exiting.")
};

var bufferState = createStateObject(stateObject, "buffer", "buffering");
var recordState = createStateObject(stateObject, "record", "recording");
var saveState = createStateObject(stateObject, "save", "saving");

var RecorderApp = function RecorderApp(
    window,
    navigator,
    AudioEngine,
    bufferLength,
    canvas=false,
    MouseStatus=false,
    WaveformDisplay=false,
    loResWaveformParams=false,
    recordingsListChangedCallback=false,
    dataDisplayChangedCallback=false
  ){
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
      console.log("GLOBALS:", GLOBALS);
    },
    setLoResOutPoint: function(v){
      this.loResOutPoint = v;
      instance.fullResOutPoint = binarySearch(instance.audEng.codeChannel, v);
    },
    recordings: new Array(0)
  };
  this.fullResInPoint = undefined;
  this.fullResOutPoint = undefined;
  this.audEng = undefined;
  this.waveDisp = undefined;
  this.mouse = undefined;
  this.state = undefined;
  this.mouse = undefined;
  this.states = { buffer: bufferState, record: recordState, save: saveState };
  this.globals = GLOBALS;
  this.recordingsListChangedCallback = recordingsListChangedCallback;
  this.dataDisplayChangedCallback = dataDisplayChangedCallback;
  this.toggleAudioPassthrough = function toggleAudioPassthrough(){
    this.audEng.toggleAudioPassthrough();
  };
  this.saveEngineFiresEveryXMs = 100;
  this.saveEngineRunsForAboutXMs = 33;
  this.saveEngine = function(){
    if(this.currentSave){
      let timeOut = Date.now() + this.saveEngineRunsForAboutXMs;
      let blocksProcessed = 0;
      do {
        blocksProcessed++;
        this.currentSave.next();
      }
      while ( this.currentSave && Date.now() < timeOut );
      console.log(blocksProcessed, "blocks processed by save engine");
    }
  }.bind(this);
  // Moved to init... setInterval(this.saveEngine, this.saveEngineFiresEveryXMs);

  bufferState.handleWaveformClick = function bufferStateHandleWaveformClick(code) {
    // GLOBALS.loResInPoint = code; // relative to loResCodeChannel
    GLOBALS.setLoResInPoint(code);
    console.log("inPoint set as:", GLOBALS.loResInPoint);
    GLOBALS.state = "record";
    this.record();
  }.bind(this);

  recordState.handleWaveformClick = function recordStateHandleWaveformClick(code) {
    if(code >= GLOBALS.loResInPoint) // outpoint must be after in point!
      {
        // GLOBALS.loResOutPoint = code;
        GLOBALS.setLoResOutPoint(code);
        console.log("outPoint set as:", GLOBALS.loResOutPoint);
        GLOBALS.state = "save";
        this.save();
      } else {
        console.log("Outpoint must be after in point doofus!");
      }
  };

  saveState.handleWaveformClick = function saveStateHandleWaveformClick(code) {
    // GLOBALS.state = "buffer";
    // this.buffer();
  };


  saveState.execute = function saveStateExecute(arg) {

    let addRecording = function addRecording(WAVFileBlob){
      console.log("Adding recording, blob is:", WAVFileBlob);
      let dateNow = Date.now();
      GLOBALS.recordings.push({
        name: humanReadableLocalDate(dateNow),
        data: WAVFileBlob,
        UCTTimestamp: dateNow,
        localTimestamp: datestampToSystemLocalDatestamp(dateNow), // need to get adjustment from humanReadableDatetime and refactor / write dateLocal(dateNow)!
        sampleRate: this.audEng.sampleRate,
        size: WAVFileBlob.size, // 16 bit
        color: randomColorCode(175,250),
        url: getURLOrDont(GLOBALS.win,WAVFileBlob),
        uuid: randomUUID(8)
      });
      // Move to next state when complete
      if(this.recordingsListChangedCallback !== false){
        // console.log("Firing rec list change callback");
        this.recordingsListChangedCallback();
      }
      this.currentSave = undefined;
      this.buffer();
    }.bind(this);

    this.currentSave = makeWAVFileBlobGenerator(
      this.audEng.interleaved16BitAudio,
      this.audEng.codeChannel, // Erm, why this all zeros?
      this.fullResInPoint,
      this.fullResOutPoint,
      this.audEng.sampleRate,
      this.audEng.channels,
      this.audEng.bitDepth,
      addRecording
    );

    console.log("this.currentSave is", this.currentSave);

  }.bind(this);

  saveState.exit = function saveStateExit(arg){
    GLOBALS.setLoResInPoint(undefined);
    GLOBALS.setLoResOutPoint(undefined);
  };

  this.toggleOptionalAudioConstraint = function recorderToggleOptionalAudioConstraint(constraintName){
    this.audEng.toggleOptionalAudioConstraint(constraintName);
  };

  this.init = function RecorderAppInit() {
    this.states.buffer.init(this);
    this.states.record.init(this);
    this.states.save.init(this);
    this.state = this.states.buffer;
    this.audEng = new AudioEngine(GLOBALS, loResWaveformParams, this.optionalMediaConstraints);
    if(MouseStatus) { this.mouse = new MouseStatus(canvas); }
    if(WaveformDisplay){
      this.waveDisp = new WaveformDisplay(
        GLOBALS,
        window,
        canvas,
        this.mouse,
        this.audEng.loResWaveform,
        this.audEng.loResCodeChannel,
        this.waveformClicked);
    }
    setInterval(this.saveEngine, this.saveEngineFiresEveryXMs);
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

  this.vm_dataDisplayBlock = function vm_dataDisplayBlock(){
    let out = {};
    out.memory = this.getMemory();
    return out;
  };

  this.vm_options = function vm_options(){
    let viewModel = this.vm_OptionalAudioConstraints();
    let output = [];
    Object.keys(viewModel).forEach(
      function(name, idx){
        // console.log( name, viewModel[name], idx);
        output.push( { name:name, status:viewModel[name] } );
      }
    );
    return output;
  };

  this.vm_recordings = function vm_recordings(){
    let list = [];
    let recordings = GLOBALS.recordings.slice();
    //recordings.reverse();
    recordings.forEach(function recordingsForEach(recording) {
      let recObj = {
        id: recording.uuid,
        color: recording.color,
        date: relativeDateTime( new Date(recording.localTimestamp) ),
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
    out.recordings = formatBytes(GLOBALS.recordings.reduce( function(t,r) {return t + r.size;}, 0));
    out.buffers = formatBytes(this.audEng.interleaved16BitAudio.length * this.audEng.scriptProcessorBuffer);
    return out;
  }.bind(this);

  this.getRecordingByUuid = function getRecordingByUuid(id) {
    return GLOBALS.recordings.filter( (obj) => obj.uuid === id )[0];
  }.bind(this);

  this.deleteRecordingByUuid = function deleteRecordingByUuid(id) {
    let recording = this.getRecordingByUuid(id);
    let idx =  GLOBALS.recordings.indexOf(recording);
    GLOBALS.recordings.splice(idx, 1 );
    recordingsListChangedCallback();
  }.bind(this);

};

function createStateObject(stateObject, stateName, stateIng) {
  newObject = Object.create(stateObject);
  newObject.name = stateName;
  newObject[stateName] = target => console.log(this.target.state.name+": already "+stateIng+".");
  return newObject;
}

function getURLOrDont(win, blob){
  if(win.URL){ return win.URL.createObjectURL(blob); }
  return "http://no.URL.on.window.object.probably.running.headless";
}
