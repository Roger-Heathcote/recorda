//jshint esversion: 6
//jshint -W027

function binarySearch(array, key, zeroOrThrow=0) {
  if(!key){ return undefined; }
  let lo = 0,
    hi = array.length - 1,
    mid,
    element;
  while (lo <= hi) {
    mid = ((lo + hi) >> 1);
    element = array[mid];
    if (element < key) {
      lo = mid + 1;
    } else if (element > key) {
      hi = mid - 1;
    } else {
      return mid;
    }
  }
  if (zeroOrThrow)
    {
      throw( new Error("Not Found!") );
    } else {
      return 0;
    }
}

function sanitize( dirty ){
  var ESC_MAP = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  function escapeHTML(s, forAttribute) {
      return s.replace(forAttribute ? /[&<>'"]/g : /[&<>]/g, function escMap(c) {
          return ESC_MAP[c];
      });
  }
  return escapeHTML(dirty, true);
}


function datestampToSystemLocalDatestamp(dateStamp) {
  let rawDate = new Date();
  rawDate.setTime(dateStamp);
  offset = rawDate.getTimezoneOffset();
  var offsetTime = rawDate.getTime() + offset;
  return offsetTime;
}

function humanReadableLocalDate (dateStamp) {
  let dateObject = new Date();
  dateObject.setTime(dateStamp);
  //var newDateObject = addTimezoneOffsetTo(dateObject);
  return dateObject.toDateString() + " at " + dateObject.toTimeString().substring(0,8);
}

function addTimezoneOffsetTo(dateObject) {
    let offset = dateObject.getTimezoneOffset() * 6000;
    var offsetTime = dateObject.getTime() - offset;
    let output = new Date( offsetTime );
}

function formatBytes(bytes,decimals) {
   if(bytes === 0) return '0 Byte';
   var k = 1000; // or 1024 for binary
   var dm = decimals + 1 || 3;
   var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
   var i = Math.floor(Math.log(bytes) / Math.log(k));
   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function randomColorCode(min=0, max=255){
  let color = ["#"];
  while(color.length < 4)
    { color.push(("00"+parseInt(Math.floor(Math.random()*(max-min+1))+min,10).toString(16).toUpperCase()).slice(-2)); }
  return color.join("");
}

function monoFloat32ToInt16(float32Array) {
  let length = float32Array.length;
  let int16Array = new Int16Array(length);
  while (length--) {
      s = Math.max(-1, Math.min(1, float32Array[length]));
      int16Array[length] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return int16Array;
}

function stereoFloat32ToInterleavedInt16(left, right) {
  let sourceLength = left.length;
  let int16Array = new Int16Array(sourceLength*2);
  for(idx=0; idx<sourceLength; idx++)
    {
      l = Math.max(-1, Math.min(1, left[idx]));
      r = Math.max(-1, Math.min(1, right[idx]));
      int16Array[idx*2] = l < 0 ? l * 0x8000 : l * 0x7FFF;
      int16Array[(idx*2)+1] = r < 0 ? r * 0x8000 : r * 0x7FFF;
    }
  return int16Array;
}

function writeUTFBytes(view, offset, string){
  var lng = string.length;
  for (var i = 0; i < lng; i++){
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function blob2arrayBuffer(blob, callback){
  let arrayBuffer;
  let fileReader = new FileReader();
  fileReader.onload = function() {
    callback(this.result);
  };
  fileReader.readAsArrayBuffer(blob);
}

function bytes2Hex(bytes){
  console.log("typeof(bytes)", typeof(bytes), bytes);
  let hexArray = [];
  let dataView = new DataView(bytes);
  for(i=0; i<bytes.byteLength; i++){
    currentInt = dataView.getUint8(i);
    hexOfChar = ("00" + parseInt(currentInt, 10).toString(16)).slice(-2);
    hexArray.push(hexOfChar);
  }
  return hexArray;
}

function bytes2Ascii(bytes){
  let asciiArray = [];
  let dataView = new DataView(bytes);
  for(i=0; i<bytes.byteLength; i++){
    currentInt = dataView.getUint8(i);
    asciiOfChar = ".";
    if ((currentInt > 31) && (currentInt < 127)){
      asciiOfChar = String.fromCharCode( currentInt );
    }
    asciiArray.push(asciiOfChar);
  }
  return asciiArray;
}

function bytes2AsciiAndNumbers(bytes){
  let asciiArray = [];
  let dataView = new DataView(bytes);
  for(i=0; i<bytes.byteLength; i++){
    currentInt = dataView.getUint8(i);
    asciiOfChar = currentInt;
    if ((currentInt > 31) && (currentInt < 127)){
      asciiOfChar = String.fromCharCode( currentInt );
    }
    asciiArray.push(asciiOfChar);
  }
  return asciiArray;
}

function makeWAVFileBlob(
  audioChunks,
  code,
  inPoint,
  outPoint,
  sampleRate,
  channels,
  bitDepth
){
  properInFrame = binarySearch(code, inPoint);
  properOutFrame = binarySearch(code, outPoint);
  frameSize = audioChunks[audioChunks.length-1].length;
  frameSizeInBytes = audioChunks[audioChunks.length-1].length * 2;
  numFrames = outPoint - inPoint;

  let fileBuffer = new ArrayBuffer( 44 + frameSize * numFrames * 2 ); // size is in bytes and we have Int16s

  // Write audio data
  let audioSection = new DataView( fileBuffer, 44 );
  let frameOffset = 0;
  for(sourceIndex = properInFrame; sourceIndex < (properInFrame + numFrames); sourceIndex++){
    for(destIndex = 0; destIndex < (frameSize); destIndex++){
      audioSection.setInt16(frameOffset + (destIndex*2), audioChunks[sourceIndex][destIndex],true);
    }
    frameOffset = frameOffset + frameSizeInBytes;
  }

  // Write header
  let headerSection = new DataView( fileBuffer, 0 );
  //addWAVHeader(headerSection, audioChunks, channels, sampleRate, bitDepth);
  writeUTFBytes(headerSection, 0, 'RIFF');
  headerSection.setUint32(4, fileBuffer.byteLength, true);
  writeUTFBytes(headerSection, 8, 'WAVE');
  // FMT sub-chunk
  writeUTFBytes(headerSection, 12, 'fmt ');
  headerSection.setUint32(16, 16, true);  // bitDepth?
  headerSection.setUint16(20, 1, true);
  // stereo (2 channels)
  headerSection.setUint16(22, channels, true);
  headerSection.setUint32(24, sampleRate, true);
  headerSection.setUint32(28, sampleRate * 4, true);
  headerSection.setUint16(32, 4, true);
  headerSection.setUint16(34, 16, true); // bitDepth?
  // data sub-chunk
  writeUTFBytes(headerSection, 36, 'data');
  headerSection.setUint32(40, audioSection.byteLength, true);

  // Return file blob
  return new Blob([fileBuffer], {type: "audio/wav"});

}

function immute(simple_object){
  // pass by value for simple objects
  // returns a "deep" copy of original Object
  return JSON.parse(JSON.stringify(simple_object));
}

function randomUUID(UUIDLength){
  let allowedChars = "abcdefghijklmnopqstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let uuid = [];
  let min = 1;
  let max = allowedChars.length-1;
  while(uuid.length < UUIDLength){
    let randCharIdx = Math.floor(Math.random()*(max-min+1))+min;
    uuid.push( allowedChars.charAt(randCharIdx));
  }
  return uuid.join("");
}


// TODO inPoint and outPoint are relative to loResCodeChannel
// This doesn't even exist when we're runnig headless!
// Fuuuuuuuuu

function getByteFromArrayBuffer(buffer, index){
  let view = new Uint8Array(buffer);
  return view[index];
}

function* makeWAVFileBlobGenerator(
  audioChunks,
  code,
  inPoint,
  outPoint,
  sampleRate,
  channels,
  bitDepth,
  callback
){

  properInFrame = inPoint; //binarySearch(code, inPoint);
  properOutFrame = inPoint; //binarySearch(code, outPoint);
  frameSize = audioChunks[audioChunks.length-1].length;
  frameSizeInBytes = audioChunks[audioChunks.length-1].length * 2;
  numFrames = outPoint - inPoint;

  let fileBuffer = new ArrayBuffer( 44 + frameSize * numFrames * 2 ); // size is in bytes and we have Int16s

  // Write audio data
  let audioSection = new DataView( fileBuffer, 44 );
  let frameOffset = 0;

  for(sourceIndex = properInFrame; sourceIndex < (properInFrame + numFrames); sourceIndex++){
    // console.log("Copying block:", sourceIndex);
    for(destIndex = 0; destIndex < (frameSize); destIndex++){
      audioSection.setInt16(frameOffset + (destIndex*2), audioChunks[sourceIndex][destIndex],true);
    }
    frameOffset = frameOffset + frameSizeInBytes;
    yield (sourceIndex - properInFrame) / numFrames; // % progress
  }
  // Write header
  let headerSection = new DataView( fileBuffer, 0 );
  //addWAVHeader(headerSection, audioChunks, channels, sampleRate, bitDepth);
  writeUTFBytes(headerSection, 0, 'RIFF');
  headerSection.setUint32(4, fileBuffer.byteLength, true);
  writeUTFBytes(headerSection, 8, 'WAVE');
  // FMT sub-chunk
  writeUTFBytes(headerSection, 12, 'fmt ');
  headerSection.setUint32(16, 16, true);  // bitDepth?
  headerSection.setUint16(20, 1, true);
  // stereo (2 channels)
  headerSection.setUint16(22, channels, true);
  headerSection.setUint32(24, sampleRate, true);
  headerSection.setUint32(28, sampleRate * 4, true);
  headerSection.setUint16(32, 4, true);
  headerSection.setUint16(34, 16, true); // bitDepth?
  // data sub-chunk
  writeUTFBytes(headerSection, 36, 'data');
  headerSection.setUint32(40, audioSection.byteLength, true);

  yield 1; // e.g. 100% progress
  callback( new Blob([fileBuffer], {type: "audio/wav"}) );

}

function importProperties(sourceObject, destinationScope){
  if(!sourceObject) return;
  Object.keys(sourceObject).forEach(function(property){
    destinationScope[property] = sourceObject[property];
  });
}

function runTests(){

  console.log("Running tests");

  test1: {
    //break test1;
    let uuid = randomUUID(16);
    if (uuid.length !== 16) { throw new Error("randomUUID (length should be 16) :", uuid); }
  }

  test2: {
    //break test2;
    let Schwang = function SchwangConstructor(a,opt=false){
      importProperties(opt, this);
      this.a = a;
    };
    schwang = new Schwang("paste",{b:"flange"});
    if(schwang.b !== "flange"){ throw new Error("importProperties test fail"); }
  }

  console.log("Done.");

}

module.exports = {
  binarySearch,
  sanitize,
  datestampToSystemLocalDatestamp,
  humanReadableLocalDate,
  addTimezoneOffsetTo,
  formatBytes,
  randomColorCode,
  monoFloat32ToInt16,
  stereoFloat32ToInterleavedInt16,
  writeUTFBytes,
  blob2arrayBuffer,
  bytes2Hex,
  bytes2Ascii,
  bytes2AsciiAndNumbers,
  makeWAVFileBlob,
  immute,
  randomUUID,
  getByteFromArrayBuffer,
  makeWAVFileBlobGenerator,
  importProperties
};
//runTests();
