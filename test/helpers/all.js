"use strict";

var chai = require('chai');
chai.config.includeStack = true;
global.expect = chai.expect;
global.AssertionError = chai.AssertionError;
global.Assertion = chai.Assertion;
global.assert = chai.assert;

function array2GenFunc(arr){
  let pointer = 0;
  let myGen = function* generatorConstructor(){
    while(true){
      if(pointer === arr.length){ throw Error("Ran out of elements!"); }
      if(!Array.isArray(arr)){ throw Error("Arrays only buddy!"); }
      yield arr[pointer];
      pointer++;
    }
  };
  let theGen = myGen();
  let myFunc = function(){
    return theGen.next().value;
  };
  return myFunc;
}
global.array2GenFunc = array2GenFunc;
