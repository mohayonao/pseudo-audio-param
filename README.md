# pseudo-audio-param
[![Build Status](https://img.shields.io/travis/mohayonao/pseudo-audio-param.svg?style=flat-square)](https://travis-ci.org/mohayonao/pseudo-audio-param)
[![NPM Version](https://img.shields.io/npm/v/pseudo-audio-param.svg?style=flat-square)](https://www.npmjs.org/package/pseudo-audio-param)
[![License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](https://mohayonao.mit-license.org/)

> Simulate scheduled AudioParam values

## Installation

```
$ npm install pseudo-audio-param
```

## API

- `constructor(defaultValue: number)`
- `getValueAtTime(time: number): number`
  - return scheduled value at `time`
- `applyTo(audioParam: AudioParam, [ reset: boolean ]): self`
  - apply scheduled methods to the provided `audioParam`
  - if `reset` is true, cancel all events of AudioParam before applying
- `events: object[]`
  - `.type: string`
  - `.time: number`

compatible interfaces with [AudioParam](https://www.w3.org/TR/webaudio/#AudioParam)

- `setValueAtTime(value: number, time: number): self`
- `linearRampToValueAtTime(value: number, time: number): self`
- `exponentialRampToValueAtTime(value: number, time: number): self`
- `setTargetAtTime(value: number, time: number: timeConstant: number): self`
- `setValueCurveAtTime(values: Float32Array, time: number, duration: number): self`
- `cancelScheduledValues(time: number): self`
- `cancelAndHoldAtTime(time: number): self`

## Example
https://www.w3.org/TR/webaudio/#example1-AudioParam

```js
var PseudoAudioParam = require("pseudo-audio-param");
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
```

![automation-example](example/automation-example.png)

## License

MIT
