/*jshint esversion: 6 */

// TODO: after a recording made app starts to leak memory quite profusely - investigate

let canvas = document.getElementById("waveform");
let canvasCtx = canvas.getContext("2d");
resizeCanvas();
window.addEventListener('resize', resizeCanvas, false);
let recordingsDiv = document.getElementById("recordings");
let dataDisplayElement = document.getElementById("dataDisplay");

const bufferLength = 60;
const loResWaveformParams = { dataPoints: 900, secondsToDisplay: bufferLength };

recorder = new RecorderApp(
  window,
  navigator,
  AudioEngine,
  bufferLength,
  canvas,
  MouseStatus,
  WaveformDisplay,
  loResWaveformParams,
  recordingsListChangedCallback,
  dataDisplayChangedCallback
);
recorder.init();

console.log( "Supported constraints are:", navigator.mediaDevices.getSupportedConstraints() );

function resizeCanvas() {
  canvas.width = document.getElementById("wrapper").offsetWidth;
}

function saveClicked(recordingID) {
  let recording = recorder.getRecordingByUCTTimestamp(recordingID);
  let url = window.URL.createObjectURL(recording.data);
  anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = recording.name + ".wav";
  document.body.appendChild(anchor);
  anchor.click();
}

function constraintToggleClicked(constraintName) {
  console.log("Constraint toggle", constraintName,"clicked");
  recorder.toggleOptionalConstraint(constraintName);
  let viewModel = this.recorder.vm_OptionalAudioConstraints();
  console.log("constraints viewmodel is:", viewModel);
}

function audioPassthroughClicked(){
  console.log("audioPassthroughClicked");
  recorder.toggleAudioPassthrough();
}

function v_optionsBlock(optionsArray){
  console.log("supplied options array is:", optionsArray);
  let output = [];
  optionsArray.forEach(
    function itterateViewOptions(optionObject){
      output.push( "<li>" );
      output.push(   "<span>" );
      output.push(   "<input type=\"checkbox\" " );
      output.push(     "onclick=\"toggleOption('"+optionObject.name+"')\"" );
      output.push(     optionObject.status ? " checked": "" );
      output.push(   ">" );
      output.push(   "</span>" );
      output.push(   "<span>" );
      output.push(     optionObject.name );
      output.push(   "</span>" );
      output.push( "</li>" );
    }
  );
  return ["<ul>", ...output, "</ul>"].join("");
}
function refreshOptionsView(){
  let block = document.getElementById("optionsBlock");
  //console.log("This is what I have for a block", block);
  block.innerHTML = v_optionsBlock(recorder.vm_options());
  //console.log("Should have updated optionsBlock with contents");
}
function toggleOption(name){
  // console.log("Attempting toggle!");
  this.recorder.toggleOptionalAudioConstraint(name);
}
refreshOptionsView();




function v_dataDisplayBlock(viewModel){
  out = [];
  out.push( "<ul>" );
  out.push(   "<li>Recordings: " );
  out.push(     viewModel.memory.recordings );
  out.push(   "</li>" );
  out.push(   "<li>Buffers: " );
  out.push(     viewModel.memory.buffers );
  out.push(   "</li>" );
  out.push( "</ul>" );
  return out.join("");
}
function refreshDataDisplay(){
  let block = document.getElementById("dataDisplayBlock");
  // console.log("This is what I have for a block", block);
  block.innerHTML = v_dataDisplayBlock(recorder.vm_dataDisplayBlock());
  console.log("Should have updated optionsBlock with contents", recorder.vm_dataDisplayBlock() );
}
function dataDisplayChangedCallback(){
  refreshDataDisplay();
}
setInterval( refreshDataDisplay(), 5 * 1000 );



function v_recordingsBlock(recordingsList) {
  let out = [];
  out.push("<ul>");
  recordingsList.forEach(function viewForEach(recording) {
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
};
function recordingsListChangedCallback(){ refreshRecordings(); }
function refreshRecordings(){
  let block = document.getElementById("recordingsBlock");
  block.innerHTML = v_recordingsBlock(recorder.vm_recordings());
}
