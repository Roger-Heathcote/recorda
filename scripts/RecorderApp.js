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
    dataDisplayElement=false
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

  bufferState.handleWaveformClick = function bufferStateHandleWaveformClick(code) {
    GLOBALS.inPoint = code;
    console.log("inPoint set:", GLOBALS.inPoint);
    GLOBALS.state = "record";
    this.record();
  }.bind(this);

  recordState.handleWaveformClick = function recordStateHandleWaveformClick(code) {
    if(code >= GLOBALS.inPoint)
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
      name: "Untitled " + GLOBALS.recordings.length, // " :: " + humanReadableLocalDatetime(dateNow),
      data: WAVFileBlob,
      UCTTimestamp: dateNow,
      localTimestamp: datestampToSystemLocalDatestamp(dateNow), // need to get adjustment from humanReadableDatetime and refactor / write dateLocal(dateNow)!
      sampleRate: this.audEng.sampleRate,
      size: WAVFileBlob.size, // 16 bit
      color: randomColorCode(175,250),
      url: GLOBALS.win.URL.createObjectURL(WAVFileBlob)
    });
    this.redrawDataDisplay();
    this.buffer();
  }.bind(this);

  saveState.exit = function saveStateExit(arg){
    GLOBALS.inPoint = undefined;
    GLOBALS.outPoint = undefined;
  };

  this.init = function RecorderAppInit() {
    this.inPoint = undefined;
    this.outPoint = undefined;
    this.states.buffer.init(this);
    this.states.record.init(this);
    this.states.save.init(this);
    this.state = this.states.buffer;

    this.audEng = new AudioEngine(GLOBALS, loResWaveformParams);

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

  this.redrawDataDisplay = function redrawDataDisplay() {
    let out = [];
    out.push( '<div id="memory">', this.renderMemory(), '</div>' );
    out.push( '<div id="recordings">', this.renderRecordings(this.getRecordingsData()), '</div>' );
    dataDisplayElement.innerHTML = out.join("");
  }.bind(this);

  this.getRecordingsData = function getRecordingsData(){
    let list = [];
    let recordings = GLOBALS.recordings.slice();
    recordings.reverse();
    recordings.forEach(function recordingsForEach(recording) {
      let recObj = {
        id: recording.UCTTimestamp,
        color: recording.color,
        date: relativeDateTime( new Date(recording.localTimestamp) ),
        name: sanitize(recording.name),
        url: recording.url
      };
      list.push(recObj);
    });
    return list;
  }.bind(this);

  this.renderRecordings = function renderRecordings(recordings) {
    let out = [];
    out.push("<ul>");
    recordings.forEach(function viewForEach(recording) {
      out.push( "<li>" );
      out.push(   "<span class=\"recording_humanTime\" style=\"background:" + recording.color + "\">" );
      out.push(     recording.date );
      out.push(   "</span>" );
      out.push(   "<span class=\"recording_Name\">" );
      out.push(     recording.name );
      out.push(   "</span>" );
      out.push(   "<audio controls>");
      out.push(     "<source src=\""+recording.url+"\" type=\"audio/wav\">" );
      out.push(   "</audio>");
      out.push(   "<span>" );
      out.push(     "<button onclick=\"saveClicked("+ recording.id +")\">save</button>" );
      out.push(   "</span>" );
      out.push( "</li>" );
    });
    out.push("</ul>");
    return out.join("");
  }.bind(this);

  this.renderMemory = function renderMemory() {
    let out = [];
    out.push("Memory use...<br>");
    out.push("Recordings:", formatBytes(GLOBALS.recordings.reduce( function(t,r) {return t + r.size;}, 0)));
    out.push( "<br>" );
    out.push("Main buffers:", formatBytes(this.audEng.interleaved16BitAudio.length * this.audEng.scriptProcessorBuffer));
    return out.join("");
  }.bind(this);

  this.getRecordingByUCTTimestamp = function getRecordingByUCTTimestamp(id) {
    return GLOBALS.recordings.filter( (obj) => obj.UCTTimestamp === id )[0];
  }.bind(this);

};

function createStateObject(stateObject, stateName, stateIng) {
  newObject = Object.create(stateObject);
  newObject.name = stateName;
  newObject[stateName] = target => console.log(this.target.state.name+": already "+stateIng+".");
  return newObject;
}
