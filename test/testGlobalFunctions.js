/*jshint esversion:6*/

require("./helpers/all.js");

let expected, actual;

describe("Let's test some global functions! ", function(){

  it("Should throw when passed nothing", function(){
    expect(array2GenFunc()).to.throw();
  });

  it("Should throw when passed an empty list", function(){
    expect(array2GenFunc([])).to.throw();
  });

  it("Should throw when passed a string", function(){
    expect(array2GenFunc("schmoo")).to.throw();
  });

  it("Should throw when passed a number", function(){
    expect(array2GenFunc(12345)).to.throw();
  });

  it("Should throw when passed an empty object", function(){
    expect(array2GenFunc({})).to.throw();
  });

  it("Call X should return array element X", function(){
    expected = 123;
    let myFunc = array2GenFunc([123]);
    actual = myFunc();
    expect(expected).to.equal(actual);
  });

  it("Call X'3 should return array element X'3", function(){
    expected = "bananas";
    let myFunc = array2GenFunc([123,234,"bananas"]);
    actual = myFunc();
    actual = myFunc();
    actual = myFunc();
    expect(expected).to.equal(actual);
  });

  it("Call X'4 when array len only 3 should throw", function(){
    let myFunc = array2GenFunc([123,234,"bananas"]);
    actual = myFunc();
    actual = myFunc();
    actual = myFunc();
    expect(myFunc).to.throw();
  });

});
