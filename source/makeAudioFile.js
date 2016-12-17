/*jshint esversion:6*/

let writeUTFBytes = require("./pureGeneralFunctions.js").writeUTFBytes;

let makeWAVFileBlobGenerator = pureMakeWAVFileBlobGenerator.bind(null, Blob, writeUTFBytes);

function* pureMakeWAVFileBlobGenerator(
  BlobConstructor,
  writeUTFBytes,
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
  callback( new BlobConstructor([fileBuffer], {type: "audio/wav"}) );

}

module.exports = {
  makeWAVFileBlobGenerator,
  pureMakeWAVFileBlobGenerator
};
