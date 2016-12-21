"use strict";

const MouseStatus = function MouseStatus(element){
  let instance = this;
  this.x = undefined;
  this.y = undefined;
  this.over = false;
  this.status = function MouseStatus_status() {
    return { x:this.x, y:this.y, over:this.over };
  };
  this.updateXY = function MouseStatus_updateXY(event) {
    let rect = element.getBoundingClientRect();
    this.x = event.clientX - rect.left; //top;
    this.y = event.clientY - rect.top; //left;
  };
  this.isOver = function() { this.over = true; };
  this.notOver = function() { this.over = false; };
  element.addEventListener('mousemove', this.updateXY.bind(instance), false);
  element.addEventListener('mouseenter', this.updateXY.bind(instance), false);
  element.addEventListener('mouseover', this.isOver.bind(instance), false);
  element.addEventListener('mouseleave', this.notOver.bind(instance), false);
};
module.exports = MouseStatus;
