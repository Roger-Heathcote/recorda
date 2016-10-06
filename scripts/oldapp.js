/*jshint esversion: 6 */
/*jshint -W056 */

// TODO list
// Set max buffer recording time?
// Yes, no reliable way to query available storage of indexed_db until quota-api matures and amount can be v.small
// Also, no consistent way to query available RAM so fixed sensible time limit probably a good idea to avoid hanging system
// In the mean time, record to RAM and have two max recording times, one for mobile (v.low), one for desktop (2hrs?).
//   How to detect mobile/desktop? Is Screen size a useful proxy? Browser versions?

// Better way of hooking up audio nodes

// Send audio to server
//   live
//   at end of recording?

// Stop button
//   Save offered

// Display time recorded

// Detect start point and trim silence

// Autodetect ambient noise level

// Gate/VAR

// Bufferloid
// How might it work?
// So it def starts pre rolling

// Record button
//   when clicked
//     recording starts from the top of the buffer
//     button changes to stop
// when stop clicked
//   recording appears in list with save button next to it

// Click on waveform where you want recording to start
//   recording starts
//   click again where you want it to stop OR click stop button

// DEFUNCT
var appState = "awaitingInPoint"; // awaitingOutPoint, recording, saving
var recording = false;
const CANVASDIV = '#wrapper';
var recordingLength = 0;

const SAMPLESPERDATAPOINT = (this.audioContext.sampleRate * this.secondsToDisplay) / displayDataPoints;
var drawVisual;

// functions ------------------------------------------------------------------
// functions ------------------------------------------------------------------
// functions ------------------------------------------------------------------
// functions ------------------------------------------------------------------
// functions ------------------------------------------------------------------
