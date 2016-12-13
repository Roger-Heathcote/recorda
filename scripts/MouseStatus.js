/*jshint esversion: 6 */

var MouseStatus = function MouseStatus(element){
  let instance = this;
  this.x = undefined;
  this.y = undefined;
  this.over = false;
  //console.log("This from MouseStatus constructor:", this);
  this.status = function MouseStatus_status() {
    //console.log("THIS FROM STATUS", this);
    return { x:this.x, y:this.y, over:this.over };
  };
  this.updateXY = function MouseStatus_updateXY(event) {
    var rect = element.getBoundingClientRect();
    this.x = event.clientX - rect.left; //top;
    this.y = event.clientY - rect.top; //left;
    //console.log( "THIS FROM UPDATEXY:", this );
  };
  this.isOver = function() { this.over = true; };
  this.notOver = function() { this.over = false; };
  element.addEventListener('mousemove', this.updateXY.bind(instance), false);
  element.addEventListener('mouseenter', this.updateXY.bind(instance), false);
  element.addEventListener('mouseover', this.isOver.bind(instance), false);
  element.addEventListener('mouseleave', this.notOver.bind(instance), false);
};
module.exports = MouseStatus;
