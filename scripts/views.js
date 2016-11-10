//jshint esversion: 6

views = {

  recordingsBlock2 : function recordingsBlock2(doc, rootNode, viewModel) {
  let items = [].slice.call(rootNode.getElementsByTagName("li"));
  // console.log("current li elements:", items);
  // let currentlyDisplayed = items.map( x => x.getAttribute("data-recording-id") );
  let currentlyDisplayed = items.map( x => x.getAttribute("id") );
  // console.log( "Ids of currently displayed recordings:", currentlyDisplayed );

  viewModel.forEach(
    function viewForEach(recording) {
      // console.log("currentlyDisplayed:", currentlyDisplayed);
      // console.log("recording.id:", recording.id);
      //console.log("currentlyDisplayed.includes(recording.id):", currentlyDisplayed.includes(recording.id));
      if( currentlyDisplayed.includes("recording_"+recording.id) ) {
        // if line already exists
        //console.log("Updating time for", recording.id);
        theLine = doc.getElementById("recording_"+recording.id);
        //console.log("theLine:", theLine);
        theDate = theLine.getElementsByClassName("recording_humanTime")[0];
        //console.log("theDate:", theDate);
        theDate.innerHTML = recording.date;
      } else {
        //console.log("We don't have:", recording.id);
        let li = doc.createElement("li");
        li.setAttribute("class", "recordingListItem");
        // li.setAttribute("data-recording-id", recording.id);
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
              //console.log("Adding event handlers now...");
              // Add event handlers
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
          //audioControl.innerHTML = vSAC(doc, recording.id).body();
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

        // rootNode.appendChild(li);
        rootNode.insertBefore(li, rootNode.firstChild);
      }
      let idx = currentlyDisplayed.indexOf("recording_"+recording.id);
      if(idx!=-1){ currentlyDisplayed.splice(idx, 1); }


  });

  // console.log("Delete these left over id's:", currentlyDisplayed);

  currentlyDisplayed.forEach(function(each){
    let node = doc.getElementById(each);
    rootNode.removeChild(node);
  });

  // let items2 = [].slice.call(rootNode.getElementsByTagName("li"));
  // let toDelete = items2.filter( function(each){
  //   if(currentlyDisplayed.includes("recording_"+each.getAttribute("id"))){
  //     return each;
  //   } else {
  //     return;
  //   }
  // });
  // console.log( "Nodes to delete:", toDelete );
  //
  //
  // toDelete.forEach(
  //   function(each){
  //     console.log("Deleting:", each);
  //     //let node = doc.getElementById(each);
  //     //console.log("Deleting:", node);
  //     rootNode.removeChild(each);
  //   }
  // );

  // console.log("Adding event handlers now...");
  // // Add event handlers
  // recordingsList.forEach(function viewForEach(recording) {
  //   audioElement = document.getElementById("audio_"+recording.id);
  //   audioElement.addEventListener("timeupdate", function(event) {
  //       audioCursor = document.getElementById("cursor_"+recording.id);
  //       let pos = parseInt(((audioElement.currentTime / audioElement.duration) * 100), 10) + "%";
  //       audioCursor.style.marginLeft = pos;
  //   });
  // });

},

  recordingsBlock: function recordingsBlock(recordingsList) {
    let out = [];
    out.push("<ul>");
    recordingsList.forEach(function viewForEach(recording) {
      out.push( "<li class=\"recordingListItem\" data-recording-id=\""+recording.id+"\" vstyle=\"background:" + recording.color + "\">" );
      out.push(   "<span class=\"recording_humanTime\" style=\"background:" + recording.color + "\">" );
      out.push(     recording.date );
      out.push(   "</span>" );
      out.push(   "<span class=\"recording_Name\">" );
      out.push(     recording.name );
      out.push(   "</span>" );

      // out.push( "<span>" );
      // out.push(   "<audio controls>");
      // out.push(     "<source src=\""+recording.url+"\" type=\"audio/wav\">" );
      // out.push(   "</audio>");
      // out.push( "</span>" );

      out.push( "<span>" );
      out.push(   "<audio id=\"audio_"+recording.id+"\">");
      out.push(     "<source src=\""+recording.url+"\" type=\"audio/wav\">" );
      out.push(   "</audio>");
      out.push( "</span>" );

      out.push( "<span>" );
      out.push(   vSAC(recording.id).body() );
      out.push( "</span>" );


      out.push(   "<span>" );
      out.push(     '<button onclick=\'saveClicked("'+recording.id+'")\'>save</button>' );
      out.push(   "</span>" );

      out.push(   "<span>" );
      out.push(     '<button onclick=\'deleteClicked("'+recording.id+'")\'>delete</button>' );
      out.push(   "</span>" );


      out.push( "</li>" );
    });
    out.push("</ul>");
    //out.push("</div>");
    //out.push("</div>");
    return out.join("");
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
    // console.log("supplied options array is:", optionsArray);
    let output = [];
    optionsArray.forEach(
      function itterateViewOptions(optionObject){
        output.push( "<li class=\"cellular\">" );
        output.push(   "<span>" );
        output.push(   "<input type=\"checkbox\" " );
        output.push(     "onclick=\"optionToggleClicked('"+optionObject.name+"')\"" );
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
