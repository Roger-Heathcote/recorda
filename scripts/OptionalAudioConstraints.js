//jshint esversion: 6

let OptionalAudioConstraints = function OptionalAudioConstraints(echo=true, noise=true, gain=true, high=true){
    this.__state = {
          echoCancellation: echo,
          noiseReduction: noise,
          autoGainControl: gain,
          highPassFilter: high
    };

    this.__mapToConstraintsList = function mapToConstrainsName(constraintName, truth){
      let map = {
        echoCancellation: [ {echoCancellation: truth}, {googEchoCancellation: truth} ],
        noiseReduction: [ {mozNoiseSuppression: truth}, {googNoiseSuppression: truth} ],
        autoGainControl: [ {mozAutoGainControl: truth}, {googAutoGainControl: truth} ],
        highPassFilter: [ {googHighpassFilter: truth} ]
      };
      return map[constraintName];
    };

    // compiles settings into a constraintsObject suitable for getUserMEdia
    this.asConstraintsObject = function compileConstraintsObject(){
      constraintList = [];
      let obj = { audio: { optional: constraintList } };
      Object.keys(this.__state).forEach(function itterateConstraints(constraintName){
        let toAdd = this.__mapToConstraintsList(constraintName,this.__state[constraintName]);
        constraintList.push(...toAdd);
      }.bind(this));
      return obj;
    };

    this.toggleConstraint = function toggleConstraint(constraintName){
      if(this.__state.hasOwnProperty(constraintName)){
        this.__state[constraintName] = !this.__state[constraintName];
      } else {
        console.log("invalid constraint name:", constraintName);
      }
    };

    // returns an deep copy of the current state
    this.state = function state(){
      return JSON.parse(JSON.stringify(this.__state));
    };
};

quickTests: {
  //break quickTests;
  console.log("Tests init...");

  c = new OptionalAudioConstraints(echo=false, gain=false);
  let cObj = c.asConstraintsObject();
  if (cObj.audio.optional.googEchoCancellation === true ) { throw new Error("googEcho Should be off"); }
  if (cObj.audio.optional.googHighpassFilter === false) { throw new Error("googHigh Should be on"); }
  c.toggleConstraint("echoCancellation");
  if (cObj.audio.optional.mozEchoCancellation === false) { throw new Error("mozEcho Should be on"); }

 console.log("Tests concluded");
}
