"use strict";

var expr = require("./expr");
var AVLTree = require("./avl-tree");

var getLinearRampToValueAtTime = expr.getLinearRampToValueAtTime;
var getExponentialRampToValueAtTime = expr.getExponentialRampToValueAtTime;
var getTargetValueAtTime = expr.getTargetValueAtTime;
var getValueCurveAtTime = expr.getValueCurveAtTime;

/*
  Event specification:
    <> type  (String, required): one of ["setValueCurveAtTime","setTargetAtTime","exponentialRampToValueAtTime","linearRampToValueAtTime","setValueAtTime"].
    <> time  (Number, required)
    <> value (Number): not required if type === "setValueCurveAtTime"
    <> timeConstant (Number): required if type === "setTargetAtTime"
    <> duration (Number): required if type === "setValueCurveAtTime"
    <> curve (Array): required if type === "setValueCurveAtTime"
    <> args (Array): TODO
 */



function PseudoAudioParam(defaultValue) {
  this.events = new AVLTree(function(a, b) { return a.time - b.time; }, function(a, b) { return a.time === b.time; });

  this.default = {
    time: 0, 
    value: defaultValue || 0, 
    type: "setValueAtTime"
  };
}

PseudoAudioParam.prototype.setValueAtTime = function(value, time) {
  this._insertEvent({
    type: "setValueAtTime",
    time: time,
    value: value, 
    args: [ value, time ]
  });
  return this;
};

PseudoAudioParam.prototype.linearRampToValueAtTime = function(value, time) {
  this._insertEvent({
    type: "linearRampToValueAtTime", 
    time: time, 
    value: value, 
    args: [ value, time ]
  });
  return this;
};

PseudoAudioParam.prototype.exponentialRampToValueAtTime = function(value, time) {
  this._insertEvent({
    type: "exponentialRampToValueAtTime", 
    time: time, 
    value: value, 
    args: [ value, time ]
  });
  return this;
};

PseudoAudioParam.prototype.setTargetAtTime = function(value, time, timeConstant) {
  this._insertEvent({
    type: "setTargetAtTime", 
    time: time, 
    value: value, 
    timeConstant: timeConstant, 
    args: [ value, time, timeConstant ]
  });
  return this;
};

PseudoAudioParam.prototype.setValueCurveAtTime = function(curve, time, duration) {
  this._insertEvent({
    type: "setValueCurveAtTime",
    time: time,
    curve: curve, 
    duration: duration, 
    args: [ curve, time, duration ]
  });
  return this;
};

PseudoAudioParam.prototype.cancelScheduledValues = function(time) {
  var node = this.events.search_closest({ time: time });

  while (node) {
    var eventItem = node.val;
    if (eventItem.time >= time) {
      this.events.remove(eventItem);
    }
    node = node.next;
  }

  return this;
};

PseudoAudioParam.prototype.getValueAtTime = function(time) {
  var events = this.events;
  var value = this.default.value;
  var i, imax;
  var e0, e1, t0;

  var obj = { time: time };
  var node = this.events.search_closest({ time: time });

  // Se fôr o nó exacto, não faz nada.
  // Se houver um nós com chave menor, usa esse nó.
  //  Senão Se existir um nó seguinte, usa esse nó.

  if (!this.events.equality(obj, node.val)) {
    var prevNode, nextNode;
    if (this.events.comparison(obj, node.val) < 0) {
      prevNode = node.previous;
      nextNode = node;
    } else {
      prevNode = node;
      nextNode = node.next;
    }
    if (prevNode) {
      node = prevNode;
    } else if (nextNode) {
      node = nextNode;
    }
  }

  node = (node.previous)? node.previous : node;

  while (node) {

    e0 = node.val;
    e1 = (node.next)? node.next.val : undefined;

    t0 = Math.min(time, e1 ? e1.time : time);

    if (time < e0.time) {
      break;
    }

    switch (e0.type) {
      case "setValueAtTime":
      case "linearRampToValueAtTime":
      case "exponentialRampToValueAtTime":
        value = e0.value;
        break;
      case "setTargetAtTime":
        value = getTargetValueAtTime(t0, value, e0.value, e0.time, e0.timeConstant);
        break;
      case "setValueCurveAtTime":
        value = getValueCurveAtTime(t0, e0.curve, e0.time, e0.duration);
        break;
    }
    if (e1) {
      switch (e1.type) {
        case "linearRampToValueAtTime":
          value = getLinearRampToValueAtTime(t0, value, e1.value, e0.time, e1.time);
          break;
        case "exponentialRampToValueAtTime":
          value = getExponentialRampToValueAtTime(t0, value, e1.value, e0.time, e1.time);
          break;
      }
    }

    node = node.next;
  }

  return value;
};

PseudoAudioParam.prototype.applyTo = function(audioParam, reset) {
  if (reset) {
    audioParam.cancelScheduledValues(0);
  }

  var node = this.events.minNode;

  while (node) {
    var eventItem = node.val;
    audioParam[eventItem.type].apply(audioParam, eventItem.args);
    node = node.next;
  }

  return this;
};

PseudoAudioParam.prototype._removeEvent = function(time) {
  this.events.remove({ time: time });
};

PseudoAudioParam.prototype._insertEvent = function(eventItem) {
  var node = this.events.search(eventItem);
  if (node === null) {
    this.events.add(eventItem);
  } else {
    node.val = eventItem;
  }
};

module.exports = PseudoAudioParam;
