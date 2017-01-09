"use strict";

require("./helpers/all.js");

describe("Let's write a more flexible downsampler & interleaver! ", function(){

  let resampleAndInterleave = require("../source/pureGeneralFunctions").resampleAndInterleave;

  it("Should throw on non-array input", function(){
    expect( () => resampleAndInterleave(16, false, false)).to.throw();
    expect( () => resampleAndInterleave(16, false, "bananas")).to.throw();
    expect( () => resampleAndInterleave(16, false, 123)).to.throw();
    expect( () => resampleAndInterleave(16, false, {})).to.throw();
  });

  it("Should throw on unsupported bitLength", function(){
    let validArr = [Float32Array.from([])];
    expect( () => resampleAndInterleave(34, false, validArr)).to.throw();
    expect( () => resampleAndInterleave(0, false, validArr)).to.throw();
    expect( () => resampleAndInterleave("fudge", false, validArr)).to.throw();
    expect( () => resampleAndInterleave({}, false, validArr)).to.throw();
  });

  it("Should throw on array with non-Float32 elements", function(){
    expect( () => resampleAndInterleave(16, false, [false])).to.throw();
    expect( () => resampleAndInterleave(16, false, ["bananas","bananas"])).to.throw();
  });

  it("Should throw on array with Float32 elements of differing length", function(){
    let e1 = Float32Array.from([1,2,3,4]);
    let e2 = Float32Array.from([1,2,3]);
    expect( () => resampleAndInterleave(16, false, [e1,e2])).to.throw();
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
    let expected = Uint8Array.from([]);
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
    let expected = Uint8Array.from([ 255, 191, 128, 64 ]);
    let expectedType = Object.prototype.toString.call(expected);
    let actual = resampleAndInterleave(8, false, chans);
    let actualType = Object.prototype.toString.call(actual);
    expect(actual).to.deep.equal( expected );
    expect(actualType).to.equal(expectedType);
  });

});

describe("Binary search", function(){

  const binarySearch = require("../source/pureGeneralFunctions").binarySearch;

  let testArray1 = [1,4,7,10,13];

  it("Should return the correct index when the search term exists in the array", function(){
    expect(binarySearch(testArray1, 7)).to.equal(2);
  });

  it("Should throw if exact match isn't found and exactOnly flag is true (default)", function(){
    expect( () => binarySearch(testArray1, 9) ).to.throw();
    expect( () => binarySearch(testArray1, [] ) ).to.throw();
    expect( () => binarySearch(testArray1, "squelf") ).to.throw();
  });

  it("Should return the index of the closest match if the search term isn't found and the exactOnly flag is false", function(){
    expect( binarySearch(testArray1, 9, false) ).to.equal(3);
    expect( binarySearch(testArray1, 99, false) ).to.equal(4);
    expect( binarySearch(testArray1, -10, false) ).to.equal(0);
    expect( binarySearch(testArray1, 8, false) ).to.equal(2);
  });

  let testArray2 = [null, null, null, null, null, 2, 8, 22];

  it("Should return the correct index when the search term exists in the array despite leading nulls", function(){
    expect(binarySearch(testArray2, 8)).to.equal(6);
  });

  it("Should throw if exact match isn't found and exactOnly flag is true (default) despite leading nulls", function(){
    expect( () => binarySearch(testArray2, 9) ).to.throw();
    expect( () => binarySearch(testArray2, [] ) ).to.throw();
    expect( () => binarySearch(testArray2, "squelf") ).to.throw();
  });

  it("Should return the index of the closest match if the search term isn't found and the exactOnly flag is false even if the array starts with nulls", function(){
    expect( binarySearch(testArray2, 9, false) ).to.equal(6);
    expect( binarySearch(testArray2, 99, false) ).to.equal(7);
    expect( binarySearch(testArray2, -10, false) ).to.equal(5);
    expect( binarySearch(testArray2, 1, false) ).to.equal(5);
    expect( binarySearch(testArray2, 0, false) ).to.equal(5);
  });

});
