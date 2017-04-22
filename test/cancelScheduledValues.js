"use strict";

const assert = require("assert");
const PseudoAudioParam = require("../lib");

describe("#cancelScheduledValues(time: number): self", () => {
  it("removes events from the schedule after time", () => {
    const param = new PseudoAudioParam()
      .setValueAtTime(0, 0)
      .setValueAtTime(1, 10)
      .cancelScheduledValues(5);

    assert(param instanceof PseudoAudioParam);
    assert.deepEqual(param.events, [
      { type: "setValueAtTime", time: 0, value: 0, args: [ 0, 0 ] }
    ]);
  });
});
