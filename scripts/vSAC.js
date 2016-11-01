var vSAC = function verySimpleAudioControl(id){
  control = [];
  control.push(   '<div class="vSAC">' );
  control.push(     '<div class="playBtn">' );
  control.push(       '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" class="svg-triangle">' );
  control.push(         '<svg viewBox="0 0 1 1" height="1em" width="1em" >' );
  control.push(             '<polygon points="0.1 0.1, 0.1 0.9, 0.9 0.5" />' );
  control.push(         '</svg>' );
  control.push(       '</svg>' );
  control.push(     '</div>' );
  control.push(     '<div class="vSAC_outer">' );
  control.push(       '<div class="vSAC_timeline">' );
  control.push(         '<div class="vSAC_cursor">' );
  control.push(         '</div>' );
  control.push(       '</div>' );
  control.push(     '</div>' );
  control.push(   '</div>' );
  return control.join("");
};
