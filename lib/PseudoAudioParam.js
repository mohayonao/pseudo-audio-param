"use strict";

var expr = require("./expr");

var getLinearRampToValueAtTime = expr.getLinearRampToValueAtTime;
var getExponentialRampToValueAtTime = expr.getExponentialRampToValueAtTime;
var getTargetValueAtTime = expr.getTargetValueAtTime;
var getValueCurveAtTime = expr.getValueCurveAtTime;

function PseudoAudioParam(defaultValue) {
  this._defaultValue = defaultValue || 0;
  this._eventIndex = 0;
  this._prevGotTime = 0;
  this.events = [];
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
  this.events = this.events.filter(function(eventItem) {
    return eventItem.time < time;
  });
  return this;
};

PseudoAudioParam.prototype.getValueAtTime = function(time) {
  var events = this.events;
  var value = this._defaultValue;
  var eventIndex = this._eventIndex;
  var i, imax;
  var e0, e1, t0;

  if (time < this._prevGotTime) {
    eventIndex = 0;
  }

  for (i = eventIndex, imax = events.length; i < imax; i++) {
    e0 = events[i];
    e1 = events[i + 1];
    t0 = Math.min(time, e1 ? e1.time : time);

    if (time < e0.time) {
      break;
    }

    switch (e0.type) {
    case "setValueAtTime":
    case "linearRampToValueAtTime":
    case "exponentialRampToValueAtTime":
      value = e0.args[0];
      eventIndex = i;
      break;
    case "setTargetAtTime":
      value = getTargetValueAtTime(t0, value, e0.args[0], e0.args[1], e0.args[2]);
      break;
    case "setValueCurveAtTime":
      value = getValueCurveAtTime(t0, e0.args[0], e0.args[1], e0.args[2]);
      eventIndex = i;
      break;
    }
    if (e1) {
      switch (e1.type) {
      case "linearRampToValueAtTime":
        value = getLinearRampToValueAtTime(t0, value, e1.args[0], e0.time, e1.args[1]);
        break;
      case "exponentialRampToValueAtTime":
        value = getExponentialRampToValueAtTime(t0, value, e1.args[0], e0.time, e1.args[1]);
        break;
      }
    }
  }

  this._prevGotTime = time;
  this._eventIndex = eventIndex;

  return value;
};

PseudoAudioParam.prototype.applyTo = function(audioParam, reset) {
  if (reset) {
    audioParam.cancelScheduledValues(0);
  }
  this.events.forEach(function(eventItem) {
    audioParam[eventItem.type].apply(audioParam, eventItem.args);
  });
  return this;
};

PseudoAudioParam.prototype._insertEvent = function(eventItem) {
  var time = eventItem.time;
  var events = this.events;
  var replace = 0;
  var i, imax;

  if (events.length === 0 || events[events.length - 1].time < time) {
    events.push(eventItem);
  } else {
    for (i = 0, imax = events.length; i < imax; i++) {
      if (events[i].time === time && events[i].type === eventItem.type) {
        replace = 1;
        break;
      }
      if (time < events[i].time) {
        break;
      }
    }
    this._eventIndex = 0;
    events.splice(i, replace, eventItem);
  }
};

module.exports = PseudoAudioParam;
