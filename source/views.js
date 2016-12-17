//jshint esversion: 6

let vSAC = require("./vSAC.js");

views = {

  recordingsBlock : function recordingsBlock(doc, rootNode, viewModel) {
  let items = [].slice.call(rootNode.getElementsByTagName("li"));
  let currentlyDisplayed = items.map( x => x.getAttribute("id") );
  viewModel.forEach(
    function viewForEach(recording) {
      if( currentlyDisplayed.includes("recording_"+recording.id) ) {
        // update the time on existing recordings
        theLine = doc.getElementById("recording_"+recording.id);
        theDate = theLine.getElementsByClassName("recording_humanTime")[0];
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
                audioElement.addEventListener("timeupdate", function(event) {
                  audioCursor = document.getElementById("cursor_"+recording.id);
                  audioCursor.style.marginLeft = parseInt(((audioElement.currentTime / audioElement.duration) * 100), 10) + "%";
                });
                audioElement.addEventListener("ended", function(event) {
                  audioCursor = document.getElementById("cursor_"+recording.id);
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
      if(idx!=-1){ currentlyDisplayed.splice(idx, 1); }

    });
    // only deleted ids remain in the list so remove them
    currentlyDisplayed.forEach(function(each){
      let node = doc.getElementById(each);
      rootNode.removeChild(node);
    });
  },

  recordingsBlock_old : function recordingsBlock(doc, rootNode, viewModel) {
  let items = [].slice.call(rootNode.getElementsByTagName("li"));
  let currentlyDisplayed = items.map( x => x.getAttribute("id") );
  viewModel.forEach(
    function viewForEach(recording) {
      if( currentlyDisplayed.includes("recording_"+recording.id) ) {
        theLine = doc.getElementById("recording_"+recording.id);
        theDate = theLine.getElementsByClassName("recording_humanTime")[0];
        theDate.innerHTML = recording.date;
      } else {
        let li = doc.createElement("li");
        li.setAttribute("class", "recordingListItem");
        li.setAttribute("id", "recording_" + recording.id);
        li.style.background = recording.color;

          let date = doc.createElement("span");
          date.setAttribute("class", "recording_humanTime");
          date.innerHTML = recording.date;
          li.appendChild(date);

          let name = doc.createElement("span");
          name.setAttribute("class", "recording_Name");
          name.innerHTML = recording.name;
          li.appendChild(name);

          let audio_span = doc.createElement("span");
            let audioElement = doc.createElement("audio");
            audioElement.setAttribute("id", "audio_" + recording.id);
              audioElement.addEventListener("timeupdate", function(event) {
                audioCursor = document.getElementById("cursor_"+recording.id);
                audioCursor.style.marginLeft = parseInt(((audioElement.currentTime / audioElement.duration) * 100), 10) + "%";
              });
              audioElement.addEventListener("ended", function(event) {
                audioCursor = document.getElementById("cursor_"+recording.id);
                audioCursor.style.marginLeft = "0%";
              });
            audio_span.appendChild(audioElement);
              let source_tag = doc.createElement("source");
              source_tag.setAttribute("src", recording.url);
              source_tag.setAttribute("type", "audio/wav");
              audioElement.appendChild(source_tag);

          li.appendChild(audio_span);

          let audioControl = doc.createElement("span");
          audioControl.appendChild( vSAC(doc, recording.id, audioElement) );
          li.appendChild(audioControl);

          let saveSpan = doc.createElement("span");
          let saveButton = doc.createElement("button");
          saveButton.setAttribute("onclick", 'saveClicked("'+recording.id+'")');
          saveButton.innerHTML = "save";
          saveSpan.appendChild(saveButton);
          li.appendChild(saveSpan);

          let deleteSpan = doc.createElement("span");
          let deleteButton = doc.createElement("button");
          deleteButton.setAttribute("onclick", 'deleteClicked("'+recording.id+'")');
          deleteButton.innerHTML = "delete";
          deleteSpan.appendChild(deleteButton);
          li.appendChild(deleteSpan);

        // add list item to the front of the list (most recent first)
        rootNode.insertBefore(li, rootNode.firstChild);
      }
      // remove recording ids from this list as they are dealt with
      let idx = currentlyDisplayed.indexOf("recording_"+recording.id);
      if(idx!=-1){ currentlyDisplayed.splice(idx, 1); }

    });
    // any recording ids left in the list must have been deleted so remove them
    currentlyDisplayed.forEach(function(each){
      let node = doc.getElementById(each);
      rootNode.removeChild(node);
    });
  },


  dataDisplayBlock: function dataDisplayBlock(viewModel){
    out = [];
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
