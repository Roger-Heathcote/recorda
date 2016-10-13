//jshint esversion: 6

var stateObject = {
  name: "Name not set",
  init: target => this.target = target,
  reset: target => this.target.init(),
  enter: target => console.log(this.target.state.name+": setting up state."),
  execute: target => console.log(this.target.state.name+": executing."),
  buffer: target => this.target.changeState(this.target.states.buffer),
  record: target => this.target.changeState(this.target.states.record),
  save: target => this.target.changeState(this.target.states.save),
  exit: target => console.log(this.target.state.name+": exiting.")
};

var bufferState = createStateObject(stateObject, "buffer", "buffering");
var recordState = createStateObject(stateObject, "record", "recording");
var saveState = createStateObject(stateObject, "save", "saving");







var RecorderApp = function(
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
  console.log("DDE in RecorderApp constructor is:", dataDisplayElement);
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

  bufferState.handleWaveformClick = function(code) {
    console.log("buffer state is taking care of business!");
    GLOBALS.inPoint = code;
    console.log("inPoint set:", GLOBALS.inPoint);
    GLOBALS.state = "record";
    this.record();
  }.bind(this);

  recordState.handleWaveformClick = function(code) {
    console.log("record state is taking care of business!");
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

  saveState.handleWaveformClick = function(code) {
    console.log("save state is taking care of business!");
    console.log("code is:", code);

    GLOBALS.state = "buffer";
    this.buffer();
  };

  saveState.execute = function(arg) {
    let WAVFile = makeWAVFile(
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
      data: WAVFile,
      UCTTimestamp: dateNow,
      localTimestamp: datestampToSystemLocalDatestamp(dateNow), // need to get adjustment from humanReadableDatetime and refactor / write dateLocal(dateNow)!
      sampleRate: this.audEng.sampleRate,
      size: WAVFile.byteLength, // 16 bit
      color: randomColorCode(175,250)
    });
    this.redrawDataDisplay();
    this.buffer();
  }.bind(this);

  saveState.exit = function(arg){
    console.log("In save.exit, resetting in/out points");
    GLOBALS.inPoint = undefined;
    GLOBALS.outPoint = undefined;
  };

  this.init = function() {
    console.log("SO INIT THE SHIT OUT OF THIS!");
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
  this.buffer = function() { this.state.buffer(); };
  this.record =  function() { this.state.record(); };
  this.save =  function() { this.state.save(); };
  this.changeState = function(state) {
    if (this.state !== state) {
      this.state.exit();
      this.state = state;
      this.state.enter();
      this.state.execute();
    }
  };


  this.waveformClicked = function(code) {
    console.log("Waveform clicked");
    this.state.handleWaveformClick(code);
  }.bind(this);

  this.redrawDataDisplay = function() {
    let out = [];
    out.push( '<div id="memory">', this.renderMemory(), '</div>' );
    out.push( '<div id="recordings">', this.renderRecordings(), '</div>' );
    dataDisplayElement.innerHTML = out.join("");
  }.bind(this);

  this.renderRecordings = function() {
    let out = [];
    out.push("<ul>");
    let recordings = GLOBALS.recordings.slice();
    recordings.reverse();
    recordings.forEach(function(recording) {
      // console.log(recording);
      console.log("recording object", recording);
      // let timeStamp = new Date(recording.localTimestamp);
      // console.log("date object", timestamp);
      out.push( "<li>" );
      //out.push(   "<span class='recording_humanTime'>" );
      out.push(   "<span class='recording_humanTime' style='background:" + recording.color + "'>" );
      out.push(     humanifyDatestamp( new Date(recording.localTimestamp) ) );
      out.push(   "</span>" );
      out.push(   "<span class='recording_Name'>" );
      out.push(     sanitize(recording.name) );
      out.push(   "</span>" );
      out.push(   "<span>" );
      out.push(     "<button id=\"recordingID_" );
      out.push(     recording.UCTTimestamp + "\" ");
      out.push(     "onclick=\"playClicked("+ recording.UCTTimestamp +")\">play</button>" );
      out.push(   "</span>" );
      out.push( "</li>" );
    });
    out.push("</ul>");
    return out.join("");
  }.bind(this);

  this.renderMemory = function() {
    let out = [];
    out.push("Memory use...<br>");
    out.push("Recordings:", formatBytes(GLOBALS.recordings.reduce( function(t,r) {return t + r.size;}, 0)));
    out.push( "<br>" );
    out.push("Main buffers:", formatBytes(this.audEng.interleaved16BitAudio.length * this.audEng.scriptProcessorBuffer));
    return out.join("");
  }.bind(this);

  this.getRecordingByUCTTimestamp = function(id) {
    return GLOBALS.recordings.filter( (obj) => obj.UCTTimestamp === id )[0];
  }.bind(this);

};

function createStateObject(stateObject, stateName, stateIng) {
  newObject = Object.create(stateObject);
  newObject.name = stateName;
  newObject[stateName] = target => console.log(this.target.state.name+": already "+stateIng+".");
  return newObject;
}

// function makeWAVFile(
//   audio,
//   code,
//   inPoint,
//   outPoint
// ){
//   properInFrame = binarySearch(code, inPoint);
//   properOutFrame = binarySearch(code, outPoint);
//   frameSize = audio[audio.length-1].length;
//   numFrames = outPoint - inPoint;
//   let merged = new Int16Array(frameSize * numFrames);
//   let frameOffset = 0;
//   for(index = properInFrame; index < (properInFrame + numFrames); index++){
//     merged.set(audio[index], frameOffset);
//     frameOffset = frameOffset + frameSize;
//   }
//   return merged;
// }
