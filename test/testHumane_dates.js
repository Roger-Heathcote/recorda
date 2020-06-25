"use strict";

require("./helpers/all.js");

let humaneDate = require("../source/humane_dates").humaneDate;
describe("Let's test humane dates", function () {
    it("Should throw when passed nothing", function () {
        expect(() => humaneDate("justone")).to.throw();
    });

    it("Should say '<1m ago' if time diff is under 60s", function () {
        expect(humaneDate(0, 59 * 1000)).to.equal("<1m ago");
    });

    it("Should say '1m ago' if difference is 61s", function () {
        expect(humaneDate(60 * 1000, 121 * 1000)).to.equal("1m ago");
    });

    it("Should say '1m ago' if difference is 119s", function () {
        expect(humaneDate(0, 119 * 1000)).to.equal("1m ago");
    });

    it("Should say '2m ago' if difference is 120s", function () {
        expect(humaneDate(0, 120 * 1000)).to.equal("2m ago");
    });

    it("Should say '59m ago' if diff is 1ms shy of 1hr", function () {
        expect(humaneDate(0, 59 * 60 * 1000 + 59 * 1000 + 999)).to.equal("59m ago");
    });

    it("Should say '1h ago' if called with 1hr diff", function () {
        expect(humaneDate(0, 60 * 60 * 1000)).to.equal("1h ago");
    });

    it("Should say '23h ago' if diff is 1ms shy of 24hrs", function () {
        expect(humaneDate(0, 24 * 60 * 60 * 1000 - 1)).to.equal("23h ago");
    });

    it("Should say '3d ago' if called with exactly 3 days diff", function () {
        expect(humaneDate(0, 3 * 24 * 60 * 60 * 1000)).to.equal("3d ago");
    });

    it("Should say '1w ago' if called with 1w diff", function () {
        expect(humaneDate(0, 7 * 24 * 60 * 60 * 1000)).to.equal("1w ago");
    });

    it("Should say '51w ago' if called with 1y - 1ms diff", function () {
        expect(humaneDate(0, 52 * 7 * 24 * 60 * 60 * 1000 - 1)).to.equal("51w ago");
    });

    it("Should say '1y ago' if called with 1y", function () {
        expect(humaneDate(0, 52 * 7 * 24 * 60 * 60 * 1000)).to.equal("1y ago");
    });

    it("Should say '1234y ago' if called with 1234y difference", function () {
        expect(humaneDate(0, 1234 * 52 * 7 * 24 * 60 * 60 * 1000)).to.equal("1234y ago");
    });
});
