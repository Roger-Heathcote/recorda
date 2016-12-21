"use strict";

let presets = {
  "mono 8bit wav": {
    channels: 1,
    bitDepth: 8,
    interleave: false,
    conversion: false
  },
  "mono 16bit wav": {
    channels: 1,
    bitDepth: 16,
    interleave: false,
    conversion: false
  },
  "stereo 16bit wav": {
    channels: 2,
    bitDepth: 16,
    interleave: true,
    conversion: false
  },
  "mono 24bit wav": {
    channels: 1,
    bitDepth: 24,
    interleave: false,
    conversion: false
  },
  "stereo 24bit wav": {
    channels: 2,
    bitDepth: 24,
    interleave: true,
    conversion: false
  },
  "mono mp4 (small file)": {
    channels: 1,
    bitDepth: 16,
    interleave: false,
    conversion: "mp4"
  },
  "mono mp4 (high quality)": {
    channels: 1,
    bitDepth: 16,
    interleave: false,
    conversion: "mp4"
  },
  "stereo mp4 (high quality)": {
    channels: 2,
    bitDepth: 24,
    interleave: true,
    conversion: "mp4" // gonna use sox I presume
  }
};

let defaultPreset = presets["mono 8bit wav"];
// let defaultPreset = presets["stereo 16bit wav"];

module.exports = {
  presets,
  defaultPreset
};
