"use strict";

const assert = require("assert");
const PseudoAudioParam = require("../lib");

function closeTo(actual, expected, delta) {
  return Math.abs(actual - expected) <= delta;
}

describe("#exponentialRampToValueAtTime(value: number, time: number): self", () => {
  it("inserts 'exponentialRampToValueAtTime' event into the schedule at time", () => {
    const param = new PseudoAudioParam()
      .setValueAtTime(1e-4, 0)
      .exponentialRampToValueAtTime(2, 20)
      .exponentialRampToValueAtTime(1, 10)
      .exponentialRampToValueAtTime(3, 20);

    assert(param instanceof PseudoAudioParam);
    assert.deepEqual(param.events, [
      { type: "setValueAtTime", time: 0, value: 1e-4, args: [ 1e-4, 0 ] },
      { type: "exponentialRampToValueAtTime", time: 10, value: 1, args: [ 1, 10 ] },
      { type: "exponentialRampToValueAtTime", time: 20, value: 3, args: [ 3, 20 ] }
    ]);
    assert(param.getValueAtTime(0) === 1e-4);
    assert(closeTo(param.getValueAtTime(5), 0.01, 1e-4));
    assert(param.getValueAtTime(10) === 1);
    assert(closeTo(param.getValueAtTime(15), 1.73205108, 1e-4));
    assert(param.getValueAtTime(20) === 3);
    assert(param.getValueAtTime(25) === 3);
  });

  it("with cancelAndHoldAtTime", () => {
    const param = new PseudoAudioParam()
      .setValueAtTime(1e-4, 0)
      .exponentialRampToValueAtTime(1, 10)
      .cancelAndHoldAtTime(5)
      .exponentialRampToValueAtTime(1e-4, 10);

      assert(param instanceof PseudoAudioParam);
      assert.deepEqual(param.events, [
        { type: "setValueAtTime", time: 0, value: 1e-4, args: [ 1e-4, 0 ] },
        { type: "exponentialRampToValueAtTime", time: 5, value: 0.01, args: [ 0.01, 5 ] },
        { type: "exponentialRampToValueAtTime", time: 10, value: 1e-4, args: [ 1e-4, 10 ] }
      ]);
      assert(param.getValueAtTime(0) === 1e-4);
      assert(param.getValueAtTime(2.5) === 1e-3);
      assert(param.getValueAtTime(5) === 1e-2);
      assert(param.getValueAtTime(7.5) === 1e-3);
      assert(param.getValueAtTime(10) === 1e-4);
  });
});
