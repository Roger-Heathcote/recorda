"use strict";
/*jshint -W056 */

let importProperties = require("./pureGeneralFunctions.js").importProperties;
let OptionalAudioConstraints = require("./OptionalAudioConstraints.js");
let resampleAndInterleave = require("./pureGeneralFunctions.js").resampleAndInterleave;
let bypass = require("./pureGeneralFunctions.js").cloneArrayOfFloat32Arrays;
let binarySearch = require("./pureGeneralFunctions.js").binarySearch;

let AudioEngine = function AudioEngine(GLOBALS, aOpt, options) {
    //loResWaveformParams=false
    // ADD/OVERWRITE PROPERTIES FROM OPTIONS OBJECT
    importProperties(options, this);
    this.totalBlocksHandled = 0;
    this.updateBlockTotal = function updateBlockTotal() {
        this.totalBlocksHandled++;
        if (this.totalBlocksHandled % 10000 === 0) {
            console.log(
                "Total audio blocks handled so far:",
                this.totalBlocksHandled + ". Audio array length is",
                this.audioData.length
            );
        }
    };

    // console.log("Need to apply aOpt in Audio Engine now", aOpt);

    this.scriptProcessorBufferLength = this.scriptProcessorBufferLength || 16384 / 4; // In units NOT bytes!
    this.audioContext = new (GLOBALS.win.AudioContext || GLOBALS.win.webkitAudioContext)();
    this.sampleRate = this.audioContext.sampleRate;
    this.gainNode = this.audioContext.createGain(); // Master volume, just in case we need it!
    this.scriptNode = this.audioContext.createScriptProcessor(
        this.scriptProcessorBufferLength,
        aOpt.channels,
        aOpt.channels
    );
    this.recBufArrayLength = Math.ceil(
        (GLOBALS.secondsToBuffer * this.sampleRate) / this.scriptProcessorBufferLength
    );
    this.codeChannel = new Array(this.recBufArrayLength).fill(null);
    this.audioData = new Array(this.recBufArrayLength).fill(0);
    this.codeNumber = 0;
    this.maxAmplitude = 0;
    this.mediaStreamTrack = false;
    this.passthrough = this.passthrough || false;
    this.toggleAudioPassthrough = function toggleAudioPassthrough() {
        this.passthrough = !this.passthrough;
    };
    this.reapplyConstraints = function reapplyConstraints(constraintsObject) {
        console.log("Here is where we will try to re-apply the constraints to the audioTrack");
        if (this.mediaStreamTrack) {
            let appliedPromise = this.mediaStreamTrack.applyConstraints(constraintsObject);
            appliedPromise
                .then(function (value) {
                    console.log("Applied OK, or so is implied by my being in the .then however...");
                    console.log(
                        "The value receivedby my function in .then is",
                        value,
                        " wutwut???"
                    );
                })
                .catch(function (presumablyAnError) {
                    // how test this code path?
                    console.log("Didnae apply itsel", presumablyAnError);
                });
        } else {
            console.log("NoMST");
        }
    }.bind(this);
    this.optionalAudioConstraints =
        this.optionalAudioConstraints ||
        new OptionalAudioConstraints(this.reapplyConstraints, false, false, false, false);
    this.currentAudioConstraints = function () {
        return this.optionalAudioConstraints.state();
    };
    this.toggleOptionalAudioConstraint = function audioToggleAudioConstraint(constraintName) {
        this.optionalAudioConstraints.toggleConstraint(constraintName);
    };

    // If we need the low res waveform to display then setup it up
    if (this.loResWaveformParams) {
        this.loResWaveformDataPoints = this.loResWaveformParams.dataPoints;
        // this.loResWaveformSecondsToDisplay = this.loResWaveformParams.secondsToDisplay;
        this.loResWaveform = new Array(this.loResWaveformDataPoints).fill(null);
        this.loResCodeChannel = new Array(this.loResWaveformDataPoints).fill(null);
        this.samplesPerDataPoint =
            (this.sampleRate * GLOBALS.secondsToBuffer) / this.loResWaveformParams.dataPoints;
        this.dispCount = this.samplesPerDataPoint;
    }
    let processor = resampleAndInterleave.bind(null, aOpt.bitDepth, aOpt.interleave);
    if (aOpt.hasOwnProperty("raw")) {
        processor = bypass;
    }
    console.log("PROCESSOR IS", processor);

    this.getPointsAt = function getPointsAt(bufferRatio) {
        let loResCode = false,
            fullResCode = false,
            fullResInPoint = false;
        if (bufferRatio === 0) {
            fullResCode = this.codeChannel[this.codeChannel.length - 1];
            fullResInPoint = this.codeChannel.length - 1;
        } else {
            let indexUpperBound = Math.round((this.recBufArrayLength - 1) * bufferRatio);
            let index = this.codeChannel.length - indexUpperBound;
            while (this.codeChannel[index] === null) {
                index++;
            } // chase to first actual data point
            fullResCode = this.codeChannel[index];
            fullResInPoint = index;
        }
        if (fullResCode && this.hasOwnProperty("loResCodeChannel")) {
            // Get the nearest loRes code to the fullRes code (for waveform gen)
            let lRCidx = binarySearch(this.loResCodeChannel, fullResCode, false);
            loResCode = this.loResCodeChannel[lRCidx];
        }
        let output = {lo: loResCode, hi: fullResInPoint};
        return output;
    };

    this.quit = function quit() {
        this.audioContext.close();
    };

    // WIRE UP THE INPUT TO OUR SCRIPTPROCESSOR NODE
    if (GLOBALS.nav.mediaDevices.getUserMedia) {
        let audioInput = GLOBALS.nav.mediaDevices.getUserMedia(
            this.optionalAudioConstraints.asConstraintsObject()
        );
        audioInput.catch(err => console.log("gUM ERROR:", err.name));
        audioInput.then(
            function connectUpTheAudioStream(audioStream) {
                this.mediaStreamTrack = audioStream.getAudioTracks()[0];
                let source = this.audioContext.createMediaStreamSource(audioStream);
                source.connect(this.scriptNode);
                this.scriptNode.connect(this.gainNode);
                this.gainNode.connect(this.audioContext.destination);
            }.bind(this)
        );
    }

    // let scriptProcessor = function scriptProcessor(audioProcessingEvent) {
    let scriptProcessor = function scriptProcessor(audioProcessingEvent) {
        // console.time("script processor");

        this.codeNumber++;
        this.codeChannel.push(this.codeNumber);

        let channels = getChannels(aOpt.channels, audioProcessingEvent);
        let array2Push = [];
        let channelIndex;
        for (channelIndex = 0; channelIndex < aOpt.channels; channelIndex++) {
            array2Push.push(channels[channelIndex].in);
        }

        this.audioData.push(processor(array2Push));

        let sample;
        for (sample = 0; sample < this.scriptProcessorBufferLength; sample++) {
            // enable pass through option
            for (channelIndex = 0; channelIndex < aOpt.channels; channelIndex++) {
                if (this.passthrough) {
                    channels[channelIndex].out[sample] = channels[channelIndex].in[sample];
                } else {
                    // debugger;
                    channels[channelIndex].out[sample] = 0.0;
                }
            }

            // track max amplitude encountered
            if (channels[0].in[sample] > this.maxAmplitude) {
                this.maxAmplitude = channels[0].in[sample];
            }
            if (channels[0].in[sample] < -this.maxAmplitude) {
                this.maxAmplitude = -channels[0].in[sample];
            } // TODO check both
            if (this.loResWaveformParams) {
                // TODO move this check to block above, don't need maxamp if no waveform display!
                // if enough samples have elapsed push a display data point & reset counter
                this.dispCount--;
                if (this.dispCount < 0) {
                    this.dispCount = this.samplesPerDataPoint;
                    this.loResWaveform.push(this.maxAmplitude);
                    this.loResWaveform.shift();
                    this.loResCodeChannel.push(this.codeNumber);
                    this.loResCodeChannel.shift();
                    this.maxAmplitude = 0;
                    if (!this.loResOffset) {
                        this.loResOffset = this.codeNumber - 1;
                    }
                }
            } //end if
        } // end for

        // Trim element from the fron of the audio array
        while (GLOBALS.state === "buffer" && this.audioData.length > this.recBufArrayLength) {
            let trimLength = this.audioData.length - this.recBufArrayLength;
            this.audioData.splice(0, trimLength);
            this.codeChannel.splice(0, trimLength);
        }

        this.updateBlockTotal();

        // console.timeEnd("script processor");
    }.bind(this);

    this.scriptNode.onaudioprocess = scriptProcessor;
};

function getChannels(numberOfChannels, scriptProcessorEvent) {
    let channelIndex,
        channels = [];
    for (channelIndex = 0; channelIndex < numberOfChannels; channelIndex++) {
        channels.push({
            in: scriptProcessorEvent.inputBuffer.getChannelData(channelIndex),
            out: scriptProcessorEvent.outputBuffer.getChannelData(channelIndex)
        });
    }
    return channels;
}

module.exports = AudioEngine;
