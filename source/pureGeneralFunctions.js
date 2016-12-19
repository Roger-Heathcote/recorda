/*jshint esversion: 6 */

function importProperties(sourceObject, destinationScope){
  if(!sourceObject) return;
  Object.keys(sourceObject).forEach(function(property){
    destinationScope[property] = sourceObject[property];
  });
}

function immute(simple_object){
  // pass by value for simple objects
  // returns a "deep" copy of original Object
  return JSON.parse(JSON.stringify(simple_object));
}

function formatBytes(bytes,decimals) {
   if(bytes === 0) return '0 Byte';
   var k = 1000; // or 1024 for binary
   var dm = decimals + 1 || 3;
   var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
   var i = Math.floor(Math.log(bytes) / Math.log(k));
   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

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

function writeUTFBytes(view, offset, string){
  var lng = string.length;
  for (var i = 0; i < lng; i++){
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function pureHumanReadableLocalDate (DateConstructor, dateStamp) {
  let dateObject = new DateConstructor();
  dateObject.setTime(dateStamp);
  return dateObject.toDateString() + " at " + dateObject.toTimeString().substring(0,8);
}

function pureUTCToSystemLocalTimestamp(DateConstructor, dateStamp) {
  let rawDate = new DateConstructor();
  rawDate.setTime(dateStamp);
  offset = rawDate.getTimezoneOffset();
  var offsetTime = rawDate.getTime() + offset;
  return offsetTime;
}

function pureRandomColorCode(randomFunction,floorFunction, min=0, max=255){
  let color = ["#"];
  while(color.length < 4){
    color.push(
      ("00"+
        parseInt(floorFunction(randomFunction()*(max-min+1))+min,10).
        toString(16).toUpperCase())
      .slice(-2)); }
  return color.join("");
}

function pureRandomUUID(randomFunction, floorFunction, UUIDLength){
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

function monoFloat32ToInt16(float32Array) {
  let length = float32Array.length;
  let int16Array = new Int16Array(length);
  while (length--) {
      s = Math.max(-1, Math.min(1, float32Array[length]));
      int16Array[length] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return int16Array;
}

//http://stackoverflow.com/questions/24048547/checking-if-an-object-is-array-like
function isArrayLike(item) {
  return (
    Array.isArray(item) ||
    (!!item &&
      typeof item === "object" &&
      typeof (item.length) === "number" &&
      (item.length === 0 ||
         (item.length > 0 &&
         (item.length - 1) in item)
      )
    )
  );
}

function allMembersAreOfSameType(array){
  firstElementType = Object.prototype.toString.call(array[0]);
  return allMembersOfXAreY(array, firstElementType);
}

function allMembersOfXAreY(array,type){
  return array.every(function(each){
     return (Object.prototype.toString.call(each) === type);
  });
}

function allMembersAreOfEqualLength(array){
  let len = array[0].length;
  return array.every(function(each){
     return(each.length === len);
  });
}

function resampleAndInterleave(bitDepth,interleave,channels){

  if(!Array.isArray(channels)){ throw new Error("I only take arrays!"); }
  if(channels.length<1){ throw new Error("Yv given mi now ft wuk wi ere!"); }
  if(!allMembersAreOfSameType(channels)){ throw new Error("All array members must be of same type"); }
  if(!isArrayLike(channels[0])){ throw new Error("Array like objects only please!"); }
  if(!allMembersAreOfEqualLength(channels)){ throw new Error("All sub arrays must have equal length"); }
  if(channels.length<1){ throw new Error("mono or stereo only for now thanks"); }
  if(typeof(bitDepth)!=="number" || bitDepth < 1 || bitDepth > 32){ throw new Error("bitDepth must be between 1 and 32"); }

  // note no native 24bit in JS so use 32bit int instead
  let ArrayConstructors = [Int8Array,Int16Array,Int32Array,Int32Array];
  ArrayConstructor = ArrayConstructors[Math.ceil(bitDepth/8)-1];

  let rMax = Math.pow(2,bitDepth-1);
  let rMin = rMax -1;

  let chunkLength = channels[0].length;
  let numberOfChannels = channels.length;

  if(interleave || numberOfChannels===1){
    let outputArrayLength = chunkLength * numberOfChannels;
    let outputArray = new ArrayConstructor(outputArrayLength);
    let idx, sX;
    for(ch=0; ch<numberOfChannels; ch++){
      for(idx=0; idx<chunkLength; idx++){
        sX = Math.max(-1, Math.min(1, channels[ch][idx]));
        outputArray[(idx*numberOfChannels)+ch] = sX < 0 ? sX * rMax : sX * rMin;
      }
    }
    return outputArray;
  } else {
    // if interleave is off we need to return more than one array!
    throw new Error("Not handled this case yet");
  }
}





module.exports = {
  importProperties,
  stereoFloat32ToInterleavedInt16,
  monoFloat32ToInt16,
  resampleAndInterleave,
  immute,
  formatBytes,
  binarySearch,
  writeUTFBytes,
  pureHumanReadableLocalDate,
  pureUTCToSystemLocalTimestamp,
  pureRandomColorCode,
  pureRandomUUID,
  sanitize
};
