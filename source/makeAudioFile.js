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
  code,
  inPoint,
  outPoint,
  sampleRate,
  audioOptions,
  callback
){

  // debugger;
  // console.log("in/out:", inPoint, outPoint);
  // console.log("aud 1", audioChunks);

  let bytesPerSample = Math.ceil(audioOptions.bitDepth/8);
  let frameSize = audioChunks[audioChunks.length-1].length;
  let frameOffsetAmmount = audioChunks[audioChunks.length-1].length * (bytesPerSample);  // was 2, guessing this is bytes per sample
  let numFrames = outPoint - inPoint;

  // TODO - OFF BY ONE ERROR SOMEWHERE!!!!
  // console.log("Arraybuffer = 44 +", (frameSize * numFrames * bytesPerSample) );
  let fileBuffer = new ArrayBuffer( 0 + 44 + frameSize * numFrames * bytesPerSample ); // again guessing this is bytes/smp

  // console.log("filebuffer", fileBuffer);
  // console.log("filebuffer size is:", 44 + frameSize * numFrames * (bytesPerSample) );
  // debugger;

  // Write audio data
  let audioSection = new DataView( fileBuffer, 44 );
  let frameOffset = 0;
  let numberOfChannels = audioOptions.channels;

  let setter = { "8":"setInt8", "16":"setInt16" }[audioOptions.bitDepth];

  let sourceIndex, destIndex; let whereToSet, whatToSet;
  for(sourceIndex = inPoint; sourceIndex < (inPoint + numFrames); sourceIndex++){
    for(destIndex = 0; destIndex < (frameSize); destIndex++){
      // before - audioSection[setter](frameOffset + (destIndex*2), audioChunks[sourceIndex][destIndex],true);
      // audioSection[setter](frameOffset + (destIndex*numberOfChannels), audioChunks[sourceIndex][destIndex],true);
      whatToSet = audioChunks[sourceIndex][destIndex];
      whereToSet = frameOffset + (destIndex*bytesPerSample);
      // console.log("Where:", whereToSet," What:", whatToSet);
      audioSection[setter](whereToSet, whatToSet,true);
      // debugger;
    }
    frameOffset = frameOffset + frameOffsetAmmount; // should be just plain old frameSize????
    // debugger;
    yield (sourceIndex - inPoint) / numFrames; // % progress
  }

  // Write header
  let headerSection = new DataView( fileBuffer, 0 );
  //addWAVHeader(headerSection, audioChunks, channels, sampleRate, bitDepth);
  writeUTFBytes(headerSection, 0, 'RIFF');
  headerSection.setUint32(4, fileBuffer.byteLength, true);
  writeUTFBytes(headerSection, 8, 'WAVE');
  // FMT sub-chunk
  writeUTFBytes(headerSection, 12, 'fmt ');
  headerSection.setUint32(16, 16, true);  // subchunk - not bit depth!
  headerSection.setUint16(20, 1, true);
  // stereo (2 channels)
  headerSection.setUint16(22, numberOfChannels, true);
  headerSection.setUint32(24, sampleRate, true);
  headerSection.setUint32(28, sampleRate * numberOfChannels * (bytesPerSample), true);
  headerSection.setUint16(32, numberOfChannels * (bytesPerSample), true);
  headerSection.setUint16(34, audioOptions.bitDepth, true); // bitDepth?
  // data sub-chunk
  writeUTFBytes(headerSection, 36, 'data');
  headerSection.setUint32(40, audioSection.byteLength, true);

  // console.log("WAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANG");
  // debugger;

  yield 1; // e.g. 100% progress
  callback( new BlobConstructor([fileBuffer], {type: "audio/wav"}) );

}

module.exports = {
  makeWAVFileBlobGenerator,
  pureMakeWAVFileBlobGenerator
};
