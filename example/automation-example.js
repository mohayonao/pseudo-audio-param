var PseudoAudioParam = require("../");
var param = new PseudoAudioParam();

var curveLength = 44100;
var curve = new Float32Array(curveLength);
for (var i = 0; i < curveLength; i++)
  curve[i] = Math.sin(Math.PI * i / curveLength);

var t0 = 0;
var t1 = 0.1;
var t2 = 0.2;
var t3 = 0.3;
var t4 = 0.325;
var t5 = 0.5;
var t6 = 0.6;
var t7 = 0.7;
var t8 = 1.0;
var timeConstant = 0.1;

param.setValueAtTime(0.2, t0);
param.setValueAtTime(0.3, t1);
param.setValueAtTime(0.4, t2);
param.linearRampToValueAtTime(1, t3);
param.linearRampToValueAtTime(0.8, t4);
param.setTargetAtTime(0.5, t4, timeConstant);
param.setValueAtTime(param.getValueAtTime(t5), t5);
param.exponentialRampToValueAtTime(0.75, t6);
param.exponentialRampToValueAtTime(0.05, t7);
param.setValueCurveAtTime(curve, t7, t8 - t7);

for (var j = 0; j < 1000; j++) {
  console.log(param.getValueAtTime(j / 1000));
}
