"use strict";

let writeUTFBytes = require("./pureGeneralFunctions.js").writeUTFBytes;

let BlobConstructor;
if(typeof(window) === "undefined"){
  BlobConstructor = function fakeBlob(ArrayOfBlobParts, blobPropertyBag){
    this.readme = "Note, I'm not a real blob, just a wee mock!";
    this.data = ArrayOfBlobParts[0];
    this.size = 123;
    this.type = blobPropertyBag;
    this.slice = function( /*start, end, contentType*/ ){ throw new Error("Not implemented"); };
  };
} else {
  BlobConstructor = Blob;
  console.log("Found a window object, using Blob from that", BlobConstructor);
}

let makeWAVFileBlobGenerator = pureMakeWAVFileBlobGenerator.bind(null, BlobConstructor, writeUTFBytes);

function* pureMakeWAVFileBlobGenerator(
  BlobConstructor,
  writeUTFBytes,
  audioChunks,
  inPoint,
  outPoint,
  sampleRate,
  audioOptions,
  callback
){

  let bytesPerSample = Math.ceil(audioOptions.bitDepth/8);
  let frameSize = audioChunks[audioChunks.length-1].length;
  let frameOffsetAmmount = audioChunks[audioChunks.length-1].length * (bytesPerSample);
  let numFrames = outPoint - inPoint;
  let fileBuffer = new ArrayBuffer( 0 + 44 + frameSize * numFrames * bytesPerSample );

  // Write audio chunks to one big arrayBuffer
  let audioSection = new DataView( fileBuffer, 44 );
  let frameOffset = 0;
  let numberOfChannels = audioOptions.channels;
  let setter = { "8":"setInt8", "16":"setInt16" }[audioOptions.bitDepth];
  let sourceIndex, destIndex, whereToSet, whatToSet;
  for(sourceIndex = inPoint; sourceIndex < (inPoint + numFrames); sourceIndex++){
    for(destIndex = 0; destIndex < (frameSize); destIndex++){
      whatToSet = audioChunks[sourceIndex][destIndex];
      whereToSet = frameOffset + (destIndex*bytesPerSample);
      audioSection[setter](whereToSet, whatToSet,true);
    }
    frameOffset = frameOffset + frameOffsetAmmount;
    yield (sourceIndex - inPoint) / numFrames; // % progress
  }

  // Write header
  let headerSection = new DataView( fileBuffer, 0 );
  //addWAVHeader(headerSection, audioChunks, channels, sampleRate, bitDepth);
  writeUTFBytes(headerSection, 0, 'RIFF');
  headerSection.setUint32(4, fileBuffer.byteLength, true);
  writeUTFBytes(headerSection, 8, 'WAVE');
  // FMT sub-chunk
  writeUTFBytes(headerSection, 12, 'fmt '); // shouldn't this be "fmt" + chr(0) ??? TODO
  headerSection.setUint32(16, 16, true);  // subchunk length - not bit depth!
  headerSection.setUint16(20, 1, true);
  headerSection.setUint16(22, numberOfChannels, true);
  headerSection.setUint32(24, sampleRate, true);
  headerSection.setUint32(28, sampleRate * numberOfChannels * (bytesPerSample), true);
  headerSection.setUint16(32, numberOfChannels * (bytesPerSample), true);
  headerSection.setUint16(34, audioOptions.bitDepth, true);
  // data sub-chunk
  writeUTFBytes(headerSection, 36, 'data');
  headerSection.setUint32(40, audioSection.byteLength, true);

  yield 1; // 100% progress
  callback( new BlobConstructor([fileBuffer], {type: "audio/wav"}) );

}

module.exports = {
  makeWAVFileBlobGenerator,
  pureMakeWAVFileBlobGenerator
};
