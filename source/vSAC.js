"use strict";

var vSAC = function verySimpleAudioControl(doc, id, audioElement){

  let mainDiv = doc.createElement("div");
  mainDiv.setAttribute("class", "vSAC");
    let buttonDiv = doc.createElement("div"); mainDiv.appendChild(buttonDiv);
    buttonDiv.setAttribute("class","playBtn");
      let outerSVG = doc.createElementNS("http://www.w3.org/2000/svg", "svg"); buttonDiv.appendChild(outerSVG);
      outerSVG.setAttribute("version", "1.1");
      outerSVG.setAttribute("class", 'svg-triangle');
      outerSVG.addEventListener("click", playClicked);
        let innerSVG = doc.createElementNS("http://www.w3.org/2000/svg", "svg"); outerSVG.appendChild(innerSVG);
        innerSVG.setAttribute("viewBox", "0 0 1 1");
        innerSVG.setAttribute("height", "1em");
        innerSVG.setAttribute("width", "1em");
          let polygon = doc.createElementNS("http://www.w3.org/2000/svg", "polygon"); innerSVG.appendChild(polygon);
          polygon.setAttribute("points", "0.1 0.1, 0.1 0.9, 0.9 0.5");

    let vsacOuter = doc.createElement("div"); mainDiv.appendChild(vsacOuter);
    vsacOuter.setAttribute("class","vSAC_outer");
      let vsac_timeline = doc.createElement("div"); vsacOuter.appendChild(vsac_timeline);
      vsac_timeline.setAttribute("class", "vSAC_timeline");
      vsac_timeline.addEventListener("click", timelineClicked);
        let vsac_cursor = doc.createElement("div"); vsac_timeline.appendChild(vsac_cursor);
        vsac_cursor.setAttribute("class", "vSAC_cursor");
        vsac_cursor.setAttribute("id", "cursor_" + id);

  return mainDiv;

  function playClicked(){
    if(audioElement.paused){
      console.log("play");
      audioElement.play();
    } else {
      console.log("pause");
      audioElement.pause();
    }
  }

  function timelineClicked(mouseEvent){
    let rect = vsac_timeline.getBoundingClientRect();
    let ratio = (mouseEvent.clientX - rect.left) / rect.width;
    console.log("ratio:", ratio);
    audioElement.currentTime = audioElement.duration * ratio;
  }

};

module.exports = vSAC;
