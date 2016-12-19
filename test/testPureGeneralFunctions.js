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

  it("Should throw on non-array input", function(){
    expect(x => resampleAndInterleave(16, false, false)).to.throw();
    expect(x => resampleAndInterleave(16, false, "bananas")).to.throw();
    expect(x => resampleAndInterleave(16, false, 123)).to.throw();
    expect(x => resampleAndInterleave(16, false, {})).to.throw();
  });

  it("Should throw on unsupported bitLength", function(){
    let validArr = [Float32Array.from([])];
    expect(x => resampleAndInterleave(34, false, validArr)).to.throw();
    expect(x => resampleAndInterleave(0, false, validArr)).to.throw();
    expect(x => resampleAndInterleave("fudge", false, validArr)).to.throw();
    expect(x => resampleAndInterleave({}, false, validArr)).to.throw();
  });

  it("Should throw on array with non-Float32 elements", function(){
    expect(x => resampleAndInterleave(16, false, [false])).to.throw();
    expect(x => resampleAndInterleave(16, false, ["bananas","bananas"])).to.throw();
  });

  it("Should throw on array with Float32 elements of differing length", function(){
    let e1 = Float32Array.from([1,2,3,4]);
    let e2 = Float32Array.from([1,2,3]);
    expect(x => resampleAndInterleave(16, false, [e1,e2])).to.throw();
  });

  it("Should return empty 16 bit arr", function(){
    let chans = [Float32Array.from([])];
    let expected = Int16Array.from([]);
    let expectedType = Object.prototype.toString.call(expected);
    let actual = resampleAndInterleave(16, false, chans);
    let actualType = Object.prototype.toString.call(actual);
    expect(actual).to.deep.equal(expected);
    expect(actualType).to.equal(expectedType);
  });

  it("Should return empty 8 bit arr", function(){
    let chans = [Float32Array.from([])];
    let expected = Int8Array.from([]);
    let expectedType = Object.prototype.toString.call(expected);
    let actual = resampleAndInterleave(8, false, chans);
    let actualType = Object.prototype.toString.call(actual);
    // console.log("Type of actual is", typeof(actual));
    // console.log("Type of expected is", typeof(expected));
    expect(actual).to.deep.equal(expected);
    expect(actualType).to.equal(expectedType);
  });

  it("Should correctly downsample supplied mono float32 arr to 16bit", function(){
    let channel0 = Float32Array.from([1,0.5,0,-0.5]);
    let chans = [channel0];
    let expected = Int16Array.from([ 32767, 16383, 0, -16384 ]);
    expect(resampleAndInterleave(16, false, chans)).to.deep.equal( expected );
  });

  it("Should correctly downsample and interleave supplied stereo float32 arr to 16bit", function(){
    let channel0 = Float32Array.from([1,0.5,0,-0.5]);
    let channel1 = Float32Array.from([-1,-0.5,0,0.5]);
    let chans = [channel0,channel1];
    let expected = Int16Array.from([ 32767, -32768, 16383, -16384, 0, 0, -16384, 16383 ]);
    expect(resampleAndInterleave(16, true, chans)).to.deep.equal( expected );
  });

  it("Should correctly downsample and interleave supplied triple float32 arr to 16bit", function(){
    let channel0 = Float32Array.from([1,0.5,0,-0.5]);
    let channel1 = Float32Array.from([-1,-0.5,0,0.5]);
    let channel2 = Float32Array.from([0.5,0,-0.5,-1]); // 16383, 0 , -16384, -32768
    let chans = [channel0,channel1,channel2];
    let expected = Int16Array.from([ 32767, -32768, 16383, 16383, -16384, 0, 0, 0, -16384, -16384, 16383, -32768 ]);
    expect(resampleAndInterleave(16, true, chans)).to.deep.equal( expected );
  });

  it("Should correctly downsample supplied mono float32 arr to 8bit", function(){
    let channel0 = Float32Array.from([1,0.5,0,-0.5]);
    let chans = [channel0];
    let expected = Int16Array.from([ 127, 63, 0, -64 ]);
    expect(resampleAndInterleave(8, false, chans)).to.deep.equal( expected );
  });

});
