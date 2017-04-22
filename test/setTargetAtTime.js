"use strict";

const assert = require("assert");
const PseudoAudioParam = require("../lib");

function closeTo(actual, expected, delta) {
  return Math.abs(actual - expected) <= delta;
}

describe("#setTargetAtTime(value: number, time: number, timeConstant: number): self", () => {
  it("inserts 'setTargetAtTime' event into the schedule at time", () => {
    const param = new PseudoAudioParam()
      .setValueAtTime(0, 0)
      .setTargetAtTime(2, 20, 2)
      .setTargetAtTime(1, 10, 2)
      .setTargetAtTime(3, 20, 2);

    assert(param instanceof PseudoAudioParam);
    assert.deepEqual(param.events, [
      { type: "setValueAtTime", time: 0, value: 0, args: [ 0, 0 ] },
      { type: "setTargetAtTime", time: 10, value: 1, timeConstant: 2, args: [ 1, 10, 2 ] },
      { type: "setTargetAtTime", time: 20, value: 3, timeConstant: 2, args: [ 3, 20, 2 ] }
    ]);

    assert(param.getValueAtTime(0) === 0);
    assert(param.getValueAtTime(5) === 0);
    assert(param.getValueAtTime(10) === 0);
    assert(closeTo(param.getValueAtTime(15), 0.917915, 1e-4));
    assert(closeTo(param.getValueAtTime(20), 0.993262, 1e-4));
    assert(closeTo(param.getValueAtTime(25), 2.835276, 1e-4));
  });

  it("inserts 'setTargetAtTime' event into the schedule at time", () => {
    const param = new PseudoAudioParam()
      .setValueAtTime(0, 0)
      .setTargetAtTime(2, 20, 2)
      .setTargetAtTime(1, 10, 2)
      .cancelAndHoldAtTime(15)
      .setTargetAtTime(3, 20, 2);

    assert(param instanceof PseudoAudioParam);
    assert.deepEqual(param.events, [
      { type: "setValueAtTime", time: 0, value: 0, args: [ 0, 0 ] },
      { type: "setTargetAtTime", time: 10, value: 1, timeConstant: 2, args: [ 1, 10, 2 ], cancelTime: 15 },
      { type: "setTargetAtTime", time: 20, value: 3, timeConstant: 2, args: [ 3, 20, 2 ] }
    ]);

    assert(param.getValueAtTime(0) === 0);
    assert(param.getValueAtTime(5) === 0);
    assert(param.getValueAtTime(10) === 0);
    assert(closeTo(param.getValueAtTime(15), 0.917915, 1e-4));
    assert(closeTo(param.getValueAtTime(20), 0.917915, 1e-4));
    assert(closeTo(param.getValueAtTime(25), 2.829092, 1e-4));
  });
});
