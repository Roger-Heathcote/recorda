/*jshint esversion:6*/

require("./helpers/all.js");

let expected, actual;


describe("Let's test mono downsample & interleave! ", function(){

  let mf2i = require("../source/pureGeneralFunctions").monoFloat32ToInt16;

  it("Should return empty arr when passed empty arr", function(){
    let chan = Float32Array.from([]);
    expect(mf2i(chan)).to.deep.equal( Int16Array.from([]) );
  });

  it("Should correctly downsample supplied float32 arr", function(){
    let chan = Float32Array.from([1,0.5,0,-0.5]);
    let expected = Int16Array.from([ 32767, 16383, 0, -16384 ]);
    expect(mf2i(chan)).to.deep.equal( expected );
  });

});

describe("Let's test stereo downsample & interleave!! ", function(){

  let sf2ii = require("../source/pureGeneralFunctions").stereoFloat32ToInterleavedInt16;


  it("Should return empty arr when passed empty arr", function(){
    let left = Float32Array.from([]);
    let right = Float32Array.from([]);
    expect(sf2ii(left, right)).to.deep.equal( Int16Array.from([]) );
  });

  it("Should correctly interleave and downsample supplied float32 arr", function(){
    let left = Float32Array.from([1,0.5,0,-0.5]);
    let right = Float32Array.from([-1,-0.5,0,0.5]);
    let expected = Int16Array.from([ 32767, -32768, 16383, -16384, 0, 0, -16384, 16383 ]);
    expect(sf2ii(left,right)).to.deep.equal( expected );
  });

});

describe("Let's write a more flexible downsampler & interleaver! ", function(){

  let resampleAndInterleave = require("../source/pureGeneralFunctions").resampleAndInterleave;

  it("Should return empty 16 bit arr", function(){
    let chan = Float32Array.from([]);
    let expected = Int16Array.from([]);
    let expectedType = Object.prototype.toString.call(expected);
    let actual = resampleAndInterleave(16, false, chan);
    let actualType = Object.prototype.toString.call(actual);
    expect(actual).to.deep.equal(expected);
    expect(actualType).to.equal(expectedType);
  });


  it("Should return empty 8 bit arr", function(){
    let chan = Float32Array.from([]);
    let expected = Int8Array.from([]);
    let expectedType = Object.prototype.toString.call(expected);
    let actual = resampleAndInterleave(8, false, chan);
    let actualType = Object.prototype.toString.call(actual);
    console.log("Type of actual is", typeof(actual));
    console.log("Type of expected is", typeof(expected));
    expect(actual).to.deep.equal(expected);
    expect(actualType).to.equal(expectedType);
  });

  it("Should correctly downsample supplied float32 arr", function(){
    let chan = Float32Array.from([1,0.5,0,-0.5]);
    let expected = Int16Array.from([ 32767, 16383, 0, -16384 ]);
    expect(resampleAndInterleave(16, false, chan)).to.deep.equal( expected );
  });

});


  //
  // it("Should throw when passed an empty list", function(){
  //   expect(array2GenFunc([])).to.throw();
  // });
  //
  //
  //
  // ( function () {
  //   return;
  //   let testName = "Test stereoFloat32ToInterleavedInt16";
  //   left = Float32Array.from([1,0.5,0,-0.5]);
  //   right = Float32Array.from([-1,-0.5,0,0.5]);
  //   let result = stereoFloat32ToInterleavedInt16(left, right);
  //   let expected = Int16Array.from([ 32767, -32768, 16383, -16384, 0, 0, -16384, 16383 ]);
  //   if (JSON.stringify(result) !== JSON.stringify(expected)) {
  //     console.log(result);
  //     console.log(expected);
  //     throw new Error( testName );
  //   }
  // }());
  //
  // ( function () {
  //   let testName = "Test stereoFloat32ToInterleavedInt16 empty";
  //   left = Float32Array.from([]);
  //   right = Float32Array.from([]);
  //   let result = stereoFloat32ToInterleavedInt16(left, right);
  //   let expected = Int16Array.from([]);
  //   if (JSON.stringify(result) !== JSON.stringify(expected)) {
  //     console.log(result);
  //     console.log(expected);
  //     throw new Error( testName );
  //   }
  // }());
