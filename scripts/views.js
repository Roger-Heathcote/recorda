//jshint esversion: 6

views = {

  recordingsBlock: function recordingsBlock(recordingsList) {
    let out = [];
    out.push("<ul>");
    recordingsList.forEach(function viewForEach(recording) {
      out.push( "<li class=\"recordingListItem\" style=\"background:" + recording.color + "\">" );
      out.push(   "<span class=\"recording_humanTime\" style=\"background:" + recording.color + "\">" );
      out.push(     recording.date );
      out.push(   "</span>" );
      out.push(   "<span class=\"recording_Name\">" );
      out.push(     recording.name );
      out.push(   "</span>" );

      out.push( "<span>" );

      out.push(   "<audio controls>");
      out.push(     "<source src=\""+recording.url+"\" type=\"audio/wav\">" );
      out.push(   "</audio>");

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
    console.log("supplied options array is:", optionsArray);
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
