"use strict";

require("./helpers/all.js");

const makeWAVFileBlobGenerator = require("../source/makeAudioFile.js").makeWAVFileBlobGenerator;
const audioPresets = require("../source/audioPresets.js");

describe("Testing audio file creation", function(){

  let expected, actual, audioData, c;
  beforeEach(function(){
    expected = false;
    actual = false;
    audioData = [];
    c = 0;
  });

  it("Should make a valid stereo 16bit WAV blob from subset of source array", function(){
    audioData = [ [7500, -7500], [6500, -6500], [5500, -5500], [4500, -4500], [3500, -3500], [2500, -2500] ];
    let fG = makeWAVFileBlobGenerator(
      audioData, 5, 6, 44100, audioPresets["stereo 16bit WAV"],
      function callback(blob){ actual = bytes2AsciiAndNumbers(blob.data).join(); }
    );
    fG.next(); fG.next(); fG.next();
    expected = "R,I,F,F,0,0,0,0,W,A,V,E,f,m,t, ,16,0,0,0,1,0,2,0,D,172,0,0,16,177,2,0,4,0,16,0,d,a,t,a,4,0,0,0,196,9,<,246";
    expect(expected).not.equals(false);
    expect(actual).not.equals(false);
    expect(expected).equals(actual);
  });

  it("Should make a valid stereo 16bit WAV blob from the whole source array", function(){
    audioData = [ [1, -1], [2, -2], [3, -3], [4, -4], [5, -5] ];
    let fG = makeWAVFileBlobGenerator(
      audioData, 0, audioData.length-1, 44100, audioPresets["stereo 16bit WAV"],
      function callback(blob){ actual = bytes2AsciiAndNumbers(blob.data).join(); }
    );
    for(c=0;c<=audioData.length;c++){ fG.next(); }
    expected = "R,I,F,F,<,0,0,0,W,A,V,E,f,m,t, ,16,0,0,0,1,0,2,0,D,172,0,0,16,177,2,0,4,0,16,0,d,a,t,a,16,0,0,0,1,0,255,255,2,0,254,255,3,0,253,255,4,0,252,255";
    expect(expected).not.equals(false);
    expect(actual).not.equals(false);
    expect(expected).equals(actual);
  });

  it("Should make a valid mono 8bit WAV blob", function(){
    audioData = [ [75, 175, 32], [65, 165, 11], [55, 155, 82], [45, 145, 187], [35, 135, 94], [25, 125, 178] ];
    let fG = makeWAVFileBlobGenerator(
      audioData, 5, 6, 44100, audioPresets["mono 8bit WAV"],
      function callback(blob){ actual = bytes2AsciiAndNumbers(blob.data).join(); }
    );
    for(c=0;c<=audioData.length;c++){ fG.next(); }
    expected = "R,I,F,F,/,0,0,0,W,A,V,E,f,m,t, ,16,0,0,0,1,0,1,0,D,172,0,0,D,172,0,0,1,0,8,0,d,a,t,a,3,0,0,0,25,},178";
    expect(actual).not.equals(false);
    expect(expected).equals(actual);
  });

  it("Should make a valid mono 16bit WAV blob", function(){
    for(c=0;c<10;c++){ audioData.push([c+1, c+1, c+1, c+1, c+1]); }
    let fG = makeWAVFileBlobGenerator(
      audioData, 0, audioData.length-1, 44100, audioPresets["mono 16bit WAV"],
      function callback(blob){ actual = bytes2AsciiAndNumbers(blob.data).join(); }
    );
    for(c=0;c<=audioData.length;c++){ fG.next(); }
    expected = "R,I,F,F,134,0,0,0,W,A,V,E,f,m,t, ,16,0,0,0,1,0,1,0,D,172,0,0,136,X,1,0,2,0,16,0,d,a,t,a,Z,0,0,0,1,0,1,0,1,0,1,0,1,0,2,0,2,0,2,0,2,0,2,0,3,0,3,0,3,0,3,0,3,0,4,0,4,0,4,0,4,0,4,0,5,0,5,0,5,0,5,0,5,0,6,0,6,0,6,0,6,0,6,0,7,0,7,0,7,0,7,0,7,0,8,0,8,0,8,0,8,0,8,0,9,0,9,0,9,0,9,0,9,0";
    expect(actual).not.equals(false);
    expect(expected).equals(actual);
  });

});


function bytes2AsciiAndNumbers(bytes){
  let asciiArray = [];
  let dataView = new DataView(bytes);
  let i, currentInt, asciiOfChar;
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
