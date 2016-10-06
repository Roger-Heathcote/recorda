//jshint esversion: 6

function binarySearch(array, key, zeroOrThrow=0) {
    var lo = 0,
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
    console.log("Search array:", array);
    if (zeroOrThrow)
      {
        throw( new Error("Not Found!") );
      } else {
        return 0;
      }
    //return -1;
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
      return s.replace(forAttribute ? /[&<>'"]/g : /[&<>]/g, function(c) {
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

function humanReadableLocalDatetime (dateStamp) {
  let dateObject = new Date();
  dateObject.setTime(dateStamp);
  var newDateObject = addTimezoneOffsetTo(dateObject);
  return dateObject.toTimeString();
}

function addTimezoneOffsetTo(dateObject) {
    console.log("source date:", dateObject.getTime());
    let offset = dateObject.getTimezoneOffset() * 6000;
    console.log("offset is:", offset);
    var offsetTime = dateObject.getTime() - offset;
    console.log("the offset time is:", offsetTime);
    let output = new Date( offsetTime );
    console.log("return value is", output);
}


function humanifyDatestamp(date) {
  console.log("Oh the humanity!", date);
  //console.log(humaneDate);
  //console.log(humaneDate(date));
  return humaneDate(date);
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




function float32ToInt16(float32Array) {
  let length = float32Array.length;
  let int16Array = new Int16Array(length);
  while (length--) {
      s = Math.max(-1, Math.min(1, float32Array[length]));
      int16Array[length] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return int16Array;
}
