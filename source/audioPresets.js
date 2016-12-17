//jshint esversion:6

let presets = {
  "mono 16bit wav": {
    inChans: 1,
    resample: 16,
    interleave: false,
    conversion: false
  },
  "stereo 16bit wav": {
    inChans: 2,
    resample: 16,
    interleave: true,
    conversion: false
  },
  "mono 24bit wav": {
    inChans: 1,
    resample: 24,
    interleave: false,
    conversion: false
  },
  "stereo 24bit wav": {
    inChans: 2,
    resample: 24,
    interleave: true,
    conversion: false
  },
  "mono mp4 (small file)": {
    inChans: 1,
    resample: 16,
    interleave: false,
    conversion: "mp4"
  },
  "mono mp4 (high quality)": {
    inChans: 1,
    resample: 16,
    interleave: false,
    conversion: "mp4"
  },
  "stereo mp4 (high quality)": {
    inChans: 2,
    resample: 24,
    interleave: true,
    conversion: "mp4" // gonna use sox I presume
  }
};

let defaultPreset = presets["stereo 16bit wav"];

module.exports = {
  presets,
  defaultPreset
};
