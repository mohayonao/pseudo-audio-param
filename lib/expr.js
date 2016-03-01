"use strict";

function getLinearRampToValueAtTime(t, v0, v1, t0, t1) {
  var a;

  if (t <= t0) {
    return v0;
  }
  if (t1 <= t) {
    return v1;
  }

  a = (t - t0) / (t1 - t0);

  return v0 + a * (v1 - v0);
}

function getExponentialRampToValueAtTime(t, v0, v1, t0, t1) {
  var a;

  if (t <= t0) {
    return v0;
  }
  if (t1 <= t) {
    return v1;
  }
  if (v0 === v1) {
    return v0;
  }

  a = (t - t0) / (t1 - t0);

  if ((0 < v0 && 0 < v1) || (v0 < 0 && v1 < 0)) {
    return v0 * Math.pow(v1 / v0, a);
  }

  return 0;
}

function getTargetValueAtTime(t, v0, v1, t0, timeConstant) {
  if (t <= t0) {
    return v0;
  }
  return v1 + (v0 - v1) * Math.exp((t0 - t) / timeConstant);
}

function getValueCurveAtTime(t, curve, t0, duration) {
  var x, ix, i0, i1;
  var y0, y1, a;

  if (curve.length === 0) {
    return 0;
  }

  x = (t - t0) / duration;
  ix = x * (curve.length - 1);
  i0 = ix|0;
  i1 = i0 + 1;

  if (curve.length <= i1) {
    return curve[curve.length - 1];
  }

  y0 = curve[i0];
  y1 = curve[i1];
  a = ix % 1;

  return y0 + a * (y1 - y0);
}

module.exports = {
  getLinearRampToValueAtTime,
  getExponentialRampToValueAtTime,
  getTargetValueAtTime,
  getValueCurveAtTime
};
