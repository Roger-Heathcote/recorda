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
  exit: target => console.log(this.target.state.name+": exiting.")
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
    inPoint: undefined,
    outPoint: undefined,
    recordings: new Array(0)
  };
  this.audEng = undefined;
  this.waveDisp = undefined;
  this.mouse = undefined;
  this.state = undefined;
  this.mouse = undefined;
  this.inPoint = undefined;
  this.outPoint = undefined;
  this.states = { buffer: bufferState, record: recordState, save: saveState };
  this.globals = GLOBALS;
  this.recordingsListChangedCallback = recordingsListChangedCallback;
  this.dataDisplayChangedCallback = dataDisplayChangedCallback;
  this.toggleAudioPassthrough = function toggleAudioPassthrough(){
    this.audEng.toggleAudioPassthrough();
  };

  bufferState.handleWaveformClick = function bufferStateHandleWaveformClick(code) {
    GLOBALS.inPoint = code;
    console.log("inPoint set:", GLOBALS.inPoint);
    GLOBALS.state = "record";
    this.record();
  }.bind(this);

  recordState.handleWaveformClick = function recordStateHandleWaveformClick(code) {
    if(code >= GLOBALS.inPoint) // outpoint must be after in point!
      {
        GLOBALS.outPoint = code;
        console.log("outPoint set:", GLOBALS.outPoint);
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
    let WAVFileBlob = makeWAVFileBlob(
      this.audEng.interleaved16BitAudio,
      this.audEng.codeChannel,
      GLOBALS.inPoint,
      GLOBALS.outPoint,
      this.audEng.sampleRate,
      this.audEng.channels,
      this.audEng.bitDepth
    );

    let dateNow = Date.now();

    GLOBALS.recordings.push({
      // TODO this should use monotonic counter rather than rec length as recs may be deleted at some point
      name: humanReadableLocalDate(dateNow) + " - Untitled " + GLOBALS.recordings.length,
      data: WAVFileBlob,
      UCTTimestamp: dateNow,
      localTimestamp: datestampToSystemLocalDatestamp(dateNow), // need to get adjustment from humanReadableDatetime and refactor / write dateLocal(dateNow)!
      sampleRate: this.audEng.sampleRate,
      size: WAVFileBlob.size, // 16 bit
      color: randomColorCode(175,250),
      url: GLOBALS.win.URL.createObjectURL(WAVFileBlob),
      uuid: randomUUID(8)
    });

    this.buffer();

    // TODO - figure out how to signal data display needs updating from here
    // do we accept a callback from above?
    // yup, think so!
    if(this.recordingsListChangedCallback !== false){
      console.log("Firing rec list change callback");
      this.recordingsListChangedCallback();
    }

  }.bind(this);

  saveState.exit = function saveStateExit(arg){
    GLOBALS.inPoint = undefined;
    GLOBALS.outPoint = undefined;
  };

  this.toggleOptionalAudioConstraint = function recorderToggleOptionalAudioConstraint(constraintName){
    // console.log("attempting to TOGGLE THE OPTIONAL CONSTRAINT:", constraintName);
    this.audEng.toggleOptionalAudioConstraint(constraintName);
  };

  this.init = function RecorderAppInit() {
    this.inPoint = undefined;
    this.outPoint = undefined;
    this.states.buffer.init(this);
    this.states.record.init(this);
    this.states.save.init(this);
    this.state = this.states.buffer;

    this.audEng = new AudioEngine(GLOBALS, loResWaveformParams, this.optionalMediaConstraints);

    if(MouseStatus) {
      this.mouse = new MouseStatus(canvas);
    }

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
        console.log( name, viewModel[name], idx);
        output.push( { name:name, status:viewModel[name] } );
      }
    );
    return output;
  }

  this.vm_recordings = function vm_recordings(){
    let list = [];
    let recordings = GLOBALS.recordings.slice();
    recordings.reverse();
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
    console.log("vm_OptionalAudioConstraints returns this:", this.audEng.currentAudioConstraints());
    return this.audEng.currentAudioConstraints();
  };

  // this.vm_recordings = function vm_recordings() {
  //   let out = [];
  //   this.GLOBALS.recordings.forEach(function viewForEach(recording) {
  //     out.push({
  //       color: recording.color,
  //       date: recording.date,
  //       name: recording.name,
  //       url: recording.url,
  //       id: recording.id
  //     });
  //   });
  //   return out;
  // }.bind(this);

  this.getMemory = function getMemory() {
    let out = {};
    out.recordings = formatBytes(GLOBALS.recordings.reduce( function(t,r) {return t + r.size;}, 0));
    out.buffers = formatBytes(this.audEng.interleaved16BitAudio.length * this.audEng.scriptProcessorBuffer);
    return out;
  }.bind(this);

  this.getRecordingByUuid = function getRecordingByUuid(id) {
    return GLOBALS.recordings.filter( (obj) => obj.uuid === id )[0];
  }.bind(this);

};

function createStateObject(stateObject, stateName, stateIng) {
  newObject = Object.create(stateObject);
  newObject.name = stateName;
  newObject[stateName] = target => console.log(this.target.state.name+": already "+stateIng+".");
  return newObject;
}
