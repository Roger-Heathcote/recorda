/*jshint esversion:6*/

require("./helpers/all.js");

let expected, actual;

let humaneDate = require("../scripts/humaneDates").humaneDate;
describe("Let's test humane dates", function(){

  let localCurrentDateObject = function(secondsAgo=0){
    let dateObj = new Date();
    let tzOffset = dateObj.getTimezoneOffset() * 6000;
    let dn = new Date((Date.now() - tzOffset) - (secondsAgo*1000));
    return dn;
  };

  it("Should throw when passed nothing", function(){
    expected = undefined;
    expect(humaneDate).to.throw();
  });

  it("Should say '<1m ago' if called with current time", function(){
    dn = localCurrentDateObject();
    expect(humaneDate(dn)).to.equal("<1m ago");
  });

  it("Should say '<1m ago' if called with current time - 30 seconds", function(){
    dn = localCurrentDateObject(30);
    expect(humaneDate(dn)).to.equal("<1m ago");
  });

  it("Should say '1m ago' if called with current time - 65 seconds", function(){
    let dn = localCurrentDateObject(65);
    expect(humaneDate(dn)).to.equal("1m ago");
  });

  it("Should say '59m ago' if called with current time - 59m + 59s seconds", function(){
    let dn = localCurrentDateObject((60*58)+59);
    expect(humaneDate(dn)).to.equal("59m ago");
  });

  it("Should say '1hr ago' if called with current time - 1hr 5s", function(){
    let dn = localCurrentDateObject((60*60)+5);
    expect(humaneDate(dn)).to.equal("1hr ago");
  });

  it("Should say '1hr ago' if called with current time - 1hr 5m", function(){
    let dn = localCurrentDateObject((60*60)+(5*60));
    expect(humaneDate(dn)).to.equal("1hr ago");
  });

  it("Should say '1hr ago' if called with current time - 1hr 6m", function(){
    let dn = localCurrentDateObject((60*60)+(6*60));
    expect(humaneDate(dn)).to.equal("1hr ago");
  });

  it("Should say '1hr ago' if called with current time - 1hr 10m", function(){
    let dn = localCurrentDateObject((60*60)+(10*60));
    expect(humaneDate(dn)).to.equal("1hr ago");
  });

  it("Should say '1hr ago' if called with current time - 1hr 15m", function(){
    let dn = localCurrentDateObject((60*60)+(15*60));
    expect(humaneDate(dn)).to.equal("1hr ago");
  });

  it("Should say '1hr ago' if called with current time - 1hr 25m", function(){
    let dn = localCurrentDateObject((60*60)+(25*60));
    expect(humaneDate(dn)).to.equal("1hr ago");
  });

  it("Should say '1hr ago' if called with current time - 2hrs -1s", function(){
    let dn = localCurrentDateObject((2*60*60)-1);
    expect(humaneDate(dn)).to.equal("1hr ago");
  });

  // TODO these are wrong, replace this damn module!

  // it("Should say '2hrs ago' if called with current time - 3hrs -1s", function(){
  //   let dn = localCurrentDateObject((3*60*60)-1);
  //   expect(humaneDate(dn)).to.equal(" ago");
  // });

  // it("Should say '3hrs ago' if called with current time - 3hr 5s", function(){
  //   let dn = localCurrentDateObject((3*60*60)+5);
  //   expect(humaneDate(dn)).to.equal("3hrs ago");
  // });

  // it("Should say '23day ago' if called with current time - 25hrs", function(){
  //   let dn = localCurrentDateObject((23*60*60));
  //   expect(humaneDate(dn)).to.equal("1day ago");
  // });

  it("Should say '1day ago' if called with current time - 25hrs", function(){
    let dn = localCurrentDateObject((25*60*60));
    expect(humaneDate(dn)).to.equal("1day ago");
  });
});
