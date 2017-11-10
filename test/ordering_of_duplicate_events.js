"use strict";

const assert = require("assert");
const PseudoAudioParam = require("../lib");

describe("ordering of duplicate events (#7)", () => {
  it("already an event of the exact same type, then the new event will replace the old one", () => {
    const param = new PseudoAudioParam()
      .setValueAtTime(0, 0)
      .linearRampToValueAtTime(2, 20)
      .linearRampToValueAtTime(1, 10)
      .linearRampToValueAtTime(3, 20);

    assert.deepEqual(param.events, [
      { type: "setValueAtTime", time: 0, value: 0, args: [ 0, 0 ] },
      { type: "linearRampToValueAtTime", time: 10, value: 1, args: [ 1, 10 ] },
      { type: "linearRampToValueAtTime", time: 20, value: 3, args: [ 3, 20 ] }
    ]);
  });

  it("is already one or more events of a different type, then it will be placed in the list after them", () => {
    const param = new PseudoAudioParam()
      .setValueAtTime(0, 0)
      .linearRampToValueAtTime(2, 20)
      .linearRampToValueAtTime(1, 10)
      .setValueAtTime(3, 20);

    assert.deepEqual(param.events, [
      { type: "setValueAtTime", time: 0, value: 0, args: [ 0, 0 ] },
      { type: "linearRampToValueAtTime", time: 10, value: 1, args: [ 1, 10 ] },
      { type: "linearRampToValueAtTime", time: 20, value: 2, args: [ 2, 20 ] },
      { type: "setValueAtTime", time: 20, value: 3, args: [ 3, 20 ] }
    ]);
  });
});
