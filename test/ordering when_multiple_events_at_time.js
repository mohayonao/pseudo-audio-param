"use strict";

const assert = require("assert");
const PseudoAudioParam = require("../lib");

describe("ordering when multiple events at time (#10)", () => {
  it("works", () => {
    const param = new PseudoAudioParam()
      .linearRampToValueAtTime(1, 7)
      .setValueAtTime(1, 7)
      .setTargetAtTime(0, 7, 0.825);

    assert.deepEqual(param.events, [
      { type: "linearRampToValueAtTime", time: 7, value: 1, args: [ 1, 7 ] },
      { type: "setValueAtTime", time: 7, value: 1, args: [ 1, 7 ] },
      { type: "setTargetAtTime", time: 7, value: 0, timeConstant: 0.825, args: [ 0, 7, 0.825 ] }
    ]);
  });
});
