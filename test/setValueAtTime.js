"use strict";

const assert = require("assert");
const PseudoAudioParam = require("../lib");

describe("#setValueAtTime(value: number, time: number): self", () => {
  it("inserts 'setValueAtTime' event into the schedule at time", () => {
    const param = new PseudoAudioParam()
      .setValueAtTime(0, 0)
      .setValueAtTime(2, 20)
      .setValueAtTime(1, 10)
      .setValueAtTime(3, 20);

    assert(param instanceof PseudoAudioParam);
    assert.deepEqual(param.events, [
      { type: "setValueAtTime", time: 0, value: 0, args: [ 0, 0 ] },
      { type: "setValueAtTime", time: 10, value: 1, args: [ 1, 10 ] },
      { type: "setValueAtTime", time: 20, value: 3, args: [ 3, 20 ] }
    ]);
    assert(param.getValueAtTime(0) === 0);
    assert(param.getValueAtTime(5) === 0);
    assert(param.getValueAtTime(10) === 1);
    assert(param.getValueAtTime(15) === 1);
    assert(param.getValueAtTime(20) === 3);
    assert(param.getValueAtTime(25) === 3);
  });
});
