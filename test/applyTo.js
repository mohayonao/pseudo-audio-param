"use strict";

const assert = require("assert");
const PseudoAudioParam = require("../lib");

function createAudioParamMock() {
  const called = [];

  return {
    called,
    setValueAtTime(...args) {
      called.push([ "setValueAtTime", ...args ]);
    },
    linearRampToValueAtTime(...args) {
      called.push([ "linearRampToValueAtTime", ...args ]);
    },
    exponentialRampToValueAtTime(...args) {
      called.push([ "exponentialRampToValueAtTime", ...args ]);
    },
    setTargetAtTime(...args) {
      called.push([ "setTargetAtTime", ...args ]);
    },
    setValueCurveAtTime(...args) {
      called.push([ "setValueCurveAtTime", ...args ]);
    },
    cancelScheduledValues(...args) {
      called.push([ "cancelScheduledValues", ...args ]);
    },
    cancelAndHoldAtTime(...args) {
      called.push([ "cancelAndHoldAtTime", ...args ]);
    },
  };
}

describe("#applyTo(audioParam: AudioParam, reset: boolean): self", () => {
  it("call scheduled api methods to the audioParam", () => {
    const audioParam = createAudioParamMock();
    const param = new PseudoAudioParam()
      .setValueAtTime(0, 0)
      .setValueAtTime(1, 10)
      .applyTo(audioParam);

    assert.deepEqual(audioParam.called, [
      [ "setValueAtTime", 0, 0 ],
      [ "setValueAtTime", 1, 10 ],
    ]);
  });

  it("call scheduled api methods to the audioParam after cancel all events", () => {
    const audioParam = createAudioParamMock();
    const param = new PseudoAudioParam()
      .setValueAtTime(0, 0)
      .setValueAtTime(1, 10)
      .applyTo(audioParam, true);

      assert.deepEqual(audioParam.called, [
        [ "cancelScheduledValues", 0 ],
        [ "setValueAtTime", 0, 0 ],
        [ "setValueAtTime", 1, 10 ],
      ]);
  });

  it("with cancelAndHoldAtTime", () => {
    const audioParam = createAudioParamMock();
    const param = new PseudoAudioParam()
      .setValueAtTime(0, 0)
      .setTargetAtTime(2, 20, 2)
      .setTargetAtTime(1, 10, 2)
      .cancelAndHoldAtTime(15)
      .setTargetAtTime(3, 20, 2)
      .applyTo(audioParam);

    assert.deepEqual(audioParam.called, [
      [ "setValueAtTime", 0, 0 ],
      [ "setTargetAtTime", 1, 10, 2 ],
      [ "cancelAndHoldAtTime", 15 ],
      [ "setTargetAtTime", 3, 20, 2 ],
    ]);
  });
});
