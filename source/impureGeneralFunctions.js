"use strict";

let pureHumanReadableLocalDate = require("./pureGeneralFunctions.js").pureHumanReadableLocalDate;
let pureutcToSystemLocalTimestamp = require("./pureGeneralFunctions.js").pureutcToSystemLocalTimestamp;
let pureRandomColorCode = require("./pureGeneralFunctions.js").pureRandomColorCode;
let pureRandomUUID = require("./pureGeneralFunctions.js").pureRandomUUID;

let humanReadableLocalDate = pureHumanReadableLocalDate.bind(null, Date);
let utcToSystemLocalTimestamp = pureutcToSystemLocalTimestamp.bind(null, Date);
let randomColorCode = pureRandomColorCode.bind(null, Math.random, Math.floor);
let randomUUID = pureRandomUUID.bind(null, Math.random, Math.floor);

module.exports = {
  humanReadableLocalDate,
  utcToSystemLocalTimestamp,
  randomColorCode,
  randomUUID
};
