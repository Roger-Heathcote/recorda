// //jshint esversion: 6
// //jshint -W027
//
//
//
//
//
//
//
//
//
// function addTimezoneOffsetTo(dateObject) {
//     let offset = dateObject.getTimezoneOffset() * 6000;
//     var offsetTime = dateObject.getTime() - offset;
//     let output = new Date( offsetTime );
// }
//
//
//
// function monoFloat32ToInt16(float32Array) {
//   let length = float32Array.length;
//   let int16Array = new Int16Array(length);
//   while (length--) {
//       s = Math.max(-1, Math.min(1, float32Array[length]));
//       int16Array[length] = s < 0 ? s * 0x8000 : s * 0x7FFF;
//   }
//   return int16Array;
// }
//
//
//
//

// function bytes2Hex(bytes){
//   console.log("typeof(bytes)", typeof(bytes), bytes);
//   let hexArray = [];
//   let dataView = new DataView(bytes);
//   for(i=0; i<bytes.byteLength; i++){
//     currentInt = dataView.getUint8(i);
//     hexOfChar = ("00" + parseInt(currentInt, 10).toString(16)).slice(-2);
//     hexArray.push(hexOfChar);
//   }
//   return hexArray;
// }
//
// function bytes2Ascii(bytes){
//   let asciiArray = [];
//   let dataView = new DataView(bytes);
//   for(i=0; i<bytes.byteLength; i++){
//     currentInt = dataView.getUint8(i);
//     asciiOfChar = ".";
//     if ((currentInt > 31) && (currentInt < 127)){
//       asciiOfChar = String.fromCharCode( currentInt );
//     }
//     asciiArray.push(asciiOfChar);
//   }
//   return asciiArray;
// }
//
// function bytes2AsciiAndNumbers(bytes){
//   let asciiArray = [];
//   let dataView = new DataView(bytes);
//   for(i=0; i<bytes.byteLength; i++){
//     currentInt = dataView.getUint8(i);
//     asciiOfChar = currentInt;
//     if ((currentInt > 31) && (currentInt < 127)){
//       asciiOfChar = String.fromCharCode( currentInt );
//     }
//     asciiArray.push(asciiOfChar);
//   }
//   return asciiArray;
// }
//
//
//
// // TODO inPoint and outPoint are relative to loResCodeChannel
// // This doesn't even exist when we're runnig headless!
// // Fuuuuuuuuu
//

//
//
// function runTests(){
//
//   console.log("Running tests");
//
//   test1: {
//     //break test1;
//     let uuid = randomUUID(16);
//     if (uuid.length !== 16) { throw new Error("randomUUID (length should be 16) :", uuid); }
//   }
//
//   test2: {
//     //break test2;
//     let Schwang = function SchwangConstructor(a,opt=false){
//       importProperties(opt, this);
//       this.a = a;
//     };
//     schwang = new Schwang("paste",{b:"flange"});
//     if(schwang.b !== "flange"){ throw new Error("importProperties test fail"); }
//   }
//
//   console.log("Done.");
//
// }
//
// module.exports = {
//   binarySearch,
//   sanitize,
//   datestampToSystemLocalDatestamp,
//   humanReadableLocalDate,
//   addTimezoneOffsetTo,
//   randomColorCode,
//   monoFloat32ToInt16,
//   stereoFloat32ToInterleavedInt16,
//   writeUTFBytes,
//   blob2arrayBuffer,
//   bytes2Hex,
//   bytes2Ascii,
//   bytes2AsciiAndNumbers,
//   makeWAVFileBlob,
//   randomUUID,
//   getByteFromArrayBuffer,
//   makeWAVFileBlobGenerator,
//   importProperties
// };
// //runTests();
