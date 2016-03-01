# pseudo-audio-param
[![Build Status](http://img.shields.io/travis/mohayonao/pseudo-audio-param.svg?style=flat-square)](https://travis-ci.org/mohayonao/pseudo-audio-param)
[![NPM Version](http://img.shields.io/npm/v/pseudo-audio-param.svg?style=flat-square)](https://www.npmjs.org/package/pseudo-audio-param)
[![License](http://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](http://mohayonao.mit-license.org/)

> Simulate scheduled AudioParam values

## Installation

```
$ npm install pseudo-audio-param
```

## API

- `constructor(defaultValue: number)`
- `getValueAtTime(time: number): number`
- `setValueAtTime(value: number, time: number): self`
- `linearRampToValueAtTime(value: number, time: number): self`
- `exponentialRampToValueAtTime(value: number, time: number): self`
- `setTargetAtTime(value: number, time: number: timeConstant: number): self`
- `setValueCurveAtTime(curve: Float32Array, time: number, duration: number): self`
- `cancelScheduledValues(time: number): self`
- `applyTo(audioParam: AudioParam): self`

## License

MIT
