"use strict";

var expr = require("./expr");

var getLinearRampToValueAtTime = expr.getLinearRampToValueAtTime;
var getExponentialRampToValueAtTime = expr.getExponentialRampToValueAtTime;
var getTargetValueAtTime = expr.getTargetValueAtTime;
var getValueCurveAtTime = expr.getValueCurveAtTime;

/***************************************************************/
/******************* BINARY SEARCH FUNCTIONS *******************/
/***************************************************************/
function find_index(values, target, compareFn) {
  if (values.length == 0 || compareFn(target, values[0]) < 0) {
    return [undefined, 0];
  }
  if (compareFn(target, values[values.length-1]) > 0 ) {
    return [values.length-1, undefined];
  }
  return modified_binary_search(values, 0, values.length - 1, target, compareFn);
}

function modified_binary_search(values, start, end, target, compareFn) {
  // if the target is bigger than the last of the provided values.
  if (start > end) { return [end, undefined]; }

  var middle = Math.floor((start + end) / 2);
  var middleValue = values[middle];

  if (compareFn(middleValue, target) < 0 && values[middle+1] && compareFn(values[middle+1], target) > 0) {
    // if the target is in between the two halfs.
    // console.log('middle: ' + middle);
    return [middle, middle+1];
  }
  else if (compareFn(middleValue, target) > 0)
    return modified_binary_search(values, start, middle-1, target, compareFn);
  else if (compareFn(middleValue, target) < 0)
    return modified_binary_search(values, middle+1, end, target, compareFn);
  else
    return [middle]; //found!
}
/***************************************************************/
/***************************************************************/
/***************************************************************/

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
  this._defaultValue = defaultValue || 0;
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
  var i, imax;
  var e0, e1, t0;

  // TODO: initialize 'target' and 'compareFn' in the constructor to avoid the garbage collector.
  var idx = find_index(events, { time: time }, function(a, b) { return a.time - b.time; });
  var pIdx = idx[0];
  var nIdx = idx[1];

  if (idx.length === 1 || pIdx !== undefined) {
    i = pIdx;
  } else if (nIdx !== undefined) {
    i = nIdx;
  }

  for (i = Math.max(0, i-1), imax = events.length; i < imax; i++) {
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
  }

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
    events.splice(i, replace, eventItem);
  }
};

module.exports = PseudoAudioParam;
