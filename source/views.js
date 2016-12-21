"use strict";

let vSAC = require("./vSAC.js");

let views = {

  recordingsBlock : function recordingsBlock(doc, rootNode, viewModel) {
  let items = [].slice.call(rootNode.getElementsByTagName("li"));
  let currentlyDisplayed = items.map( x => x.getAttribute("id") );
  viewModel.forEach(
    function viewForEach(recording) {
      if( currentlyDisplayed.includes("recording_"+recording.id) ) {
        // update the time on existing recordings
        let theLine = doc.getElementById("recording_"+recording.id);
        let theDate = theLine.getElementsByClassName("recording_humanTime")[0];
        theDate.innerHTML = recording.date;
      } else {
        // create new recordings
        let outerLi = doc.createElement("li");
        outerLi.setAttribute("class", "recordingListItem");
        outerLi.setAttribute("id", "recording_" + recording.id);
        outerLi.style.background = recording.color;
        rootNode.insertBefore(outerLi, rootNode.firstChild); // most recent at the top

          let innerLi = doc.createElement("div");
          innerLi.setAttribute("class", "recordingListItemFlexbox");
          innerLi.style.background = recording.color;
          outerLi.appendChild(innerLi);

            let date = doc.createElement("div");
            date.setAttribute("class", "recording_humanTime");
            date.innerHTML = recording.date;
            innerLi.appendChild(date);

            let name = doc.createElement("div");
            name.setAttribute("class", "recording_Name");
            name.innerHTML = recording.name;
            innerLi.appendChild(name);

            let audio_span = doc.createElement("div");
              let audioElement = doc.createElement("audio");
              audioElement.setAttribute("id", "audio_" + recording.id);
                audioElement.addEventListener("timeupdate", function() {
                  let audioCursor = document.getElementById("cursor_"+recording.id);
                  audioCursor.style.marginLeft = parseInt(((audioElement.currentTime / audioElement.duration) * 100), 10) + "%";
                });
                audioElement.addEventListener("ended", function() {
                  let audioCursor = document.getElementById("cursor_"+recording.id);
                  audioCursor.style.marginLeft = "0%";
                });
              audio_span.appendChild(audioElement);
                let source_tag = doc.createElement("source");
                source_tag.setAttribute("src", recording.url);
                source_tag.setAttribute("type", "audio/wav");
                audioElement.appendChild(source_tag);

            innerLi.appendChild(audio_span);

            innerLi.appendChild( vSAC(doc, recording.id, audioElement) );

            let saveButton = doc.createElement("button");
            saveButton.setAttribute("class", "saveButton");
            saveButton.setAttribute("name", "save");
            saveButton.setAttribute("value", recording.id);
            // saveButton.setAttribute("onclick", 'saveClicked("'+recording.id+'")');
            saveButton.innerHTML = "save";
            innerLi.appendChild(saveButton);

            let deleteButton = doc.createElement("button");
            deleteButton.setAttribute("class", "deleteButton");
            deleteButton.setAttribute("name", "delete");
            deleteButton.setAttribute("value", recording.id);
            // deleteButton.setAttribute("onclick", 'deleteClicked("'+recording.id+'")');
            deleteButton.innerHTML = "delete";
            innerLi.appendChild(deleteButton);

      }
      // remove recording ids from this list as they are dealt with
      let idx = currentlyDisplayed.indexOf("recording_"+recording.id);
      if(idx!==-1){ currentlyDisplayed.splice(idx, 1); }

    });
    // only deleted ids remain in the list so remove them
    currentlyDisplayed.forEach(function(each){
      let node = doc.getElementById(each);
      rootNode.removeChild(node);
    });
  },


  dataDisplayBlock: function dataDisplayBlock(viewModel){
    let out = [];
    out.push( "<ul class=\"tabloid\">" );
    out.push(   "<li>Recordings: " );
    out.push(     viewModel.memory.recordings );
    out.push(   "</li>" );
    out.push(   "<li>Buffers: " );
    out.push(     viewModel.memory.buffers );
    out.push(   "</li>" );
    out.push( "</ul>" );
    return out.join("");
  },

  optionsBlock: function optionsBlock(optionsArray){
    let output = [];
    optionsArray.forEach(
      function itterateViewOptions(optionObject){
        output.push( "<li class=\"cellular\">" );
        output.push(   "<span>" );
        output.push(   "<input type=\"checkbox\" " );
        output.push(     "name=\"optionToggle\"" );
        output.push(     "value=\""+optionObject.name+"\"" );
        output.push(     optionObject.status ? " checked": "" );
        output.push(   ">" );
        output.push(   "</span>" );
        output.push(   "<span>" );
        output.push(     optionObject.name );
        output.push(   "</span>" );
        output.push( "</li>" );
      }
    );
    return ["<ul class=\"tabloid\">", ...output, "</ul>"].join("");
  }

};

module.exports = views;
