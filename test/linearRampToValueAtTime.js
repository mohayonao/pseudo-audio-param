"use strict";

const assert = require("assert");
const PseudoAudioParam = require("../lib");

describe("#linearRampToValueAtTime(value: number, time: number): self", () => {
  it("inserts 'linearRampToValueAtTime' event into the schedule at time", () => {
    const param = new PseudoAudioParam()
      .setValueAtTime(0, 0)
      .linearRampToValueAtTime(2, 20)
      .linearRampToValueAtTime(1, 10)
      .linearRampToValueAtTime(3, 20);

    assert(param instanceof PseudoAudioParam);
    assert.deepEqual(param.events, [
      { type: "setValueAtTime", time: 0, value: 0, args: [ 0, 0 ] },
      { type: "linearRampToValueAtTime", time: 10, value: 1, args: [ 1, 10 ] },
      { type: "linearRampToValueAtTime", time: 20, value: 3, args: [ 3, 20 ] }
    ]);
    assert(param.getValueAtTime(0) === 0);
    assert(param.getValueAtTime(5) === 0.5);
    assert(param.getValueAtTime(10) === 1);
    assert(param.getValueAtTime(15) === 2);
    assert(param.getValueAtTime(20) === 3);
    assert(param.getValueAtTime(25) === 3);
  });

  it("with cancelAndHoldAtTime", () => {
    const param = new PseudoAudioParam()
      .setValueAtTime(0, 0)
      .linearRampToValueAtTime(1, 10)
      .cancelAndHoldAtTime(5)
      .linearRampToValueAtTime(0, 10);

      assert(param instanceof PseudoAudioParam);
      assert.deepEqual(param.events, [
        { type: "setValueAtTime", time: 0, value: 0, args: [ 0, 0 ] },
        { type: "linearRampToValueAtTime", time: 5, value: 0.5, args: [ 0.5, 5 ] },
        { type: "linearRampToValueAtTime", time: 10, value: 0, args: [ 0, 10 ] }
      ]);
      assert(param.getValueAtTime(0) === 0);
      assert(param.getValueAtTime(2.5) === 0.25);
      assert(param.getValueAtTime(5) === 0.5);
      assert(param.getValueAtTime(7.5) === 0.25);
      assert(param.getValueAtTime(10) === 0);
  });
});
