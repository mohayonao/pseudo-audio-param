"use strict";

const assert = require("assert");
const sinon = require("sinon");
const PseudoAudioParam = require("../lib/PseudoAudioParam");

function closeTo(actual, expected, delta) {
  return Math.abs(actual - expected) <= delta;
}

function createAudioParamMock() {
  return {
    setValueAtTime: sinon.spy(),
    linearRampToValueAtTime: sinon.spy(),
    exponentialRampToValueAtTime: sinon.spy(),
    setTargetAtTime: sinon.spy(),
    setValueCurveAtTime: sinon.spy(),
    cancelScheduledValues: sinon.spy()
  };
}

describe("PseudoAudioParam", () => {
  describe("constructor(defaultValue: number): PseudoAudioParam", () => {
    it("creates a PseudoAudioParam instance", () => {
      let param = new PseudoAudioParam(1);

      assert(param instanceof PseudoAudioParam);
    });
  });
  describe("#setValueAtTime(value: number, time: number): self", () => {
    it("inserts 'setValueAtTime' event into the schedule at time", () => {
      let param = new PseudoAudioParam()
        .setValueAtTime(0, 0)
        .setValueAtTime(2, 20)
        .setValueAtTime(1, 10)
        .setValueAtTime(3, 20);

      assert(param instanceof PseudoAudioParam);
      assert.deepEqual(param.events, [
        { type: "setValueAtTime", time: 0, args: [ 0, 0 ] },
        { type: "setValueAtTime", time: 10, args: [ 1, 10 ] },
        { type: "setValueAtTime", time: 20, args: [ 3, 20 ] }
      ]);
      assert(param.getValueAtTime(0) === 0);
      assert(param.getValueAtTime(5) === 0);
      assert(param.getValueAtTime(10) === 1);
      assert(param.getValueAtTime(15) === 1);
      assert(param.getValueAtTime(20) === 3);
      assert(param.getValueAtTime(25) === 3);
    });
  });
  describe("#linearRampToValueAtTime(value: number, time: number): self", () => {
    it("inserts 'linearRampToValueAtTime' event into the schedule at time", () => {
      let param = new PseudoAudioParam()
        .setValueAtTime(0, 0)
        .linearRampToValueAtTime(2, 20)
        .linearRampToValueAtTime(1, 10)
        .linearRampToValueAtTime(3, 20);

      assert(param instanceof PseudoAudioParam);
      assert.deepEqual(param.events, [
        { type: "setValueAtTime", time: 0, args: [ 0, 0 ] },
        { type: "linearRampToValueAtTime", time: 10, args: [ 1, 10 ] },
        { type: "linearRampToValueAtTime", time: 20, args: [ 3, 20 ] }
      ]);
      assert(param.getValueAtTime(0) === 0);
      assert(param.getValueAtTime(5) === 0.5);
      assert(param.getValueAtTime(10) === 1);
      assert(param.getValueAtTime(15) === 2);
      assert(param.getValueAtTime(20) === 3);
      assert(param.getValueAtTime(25) === 3);
    });
  });
  describe("#exponentialRampToValueAtTime(value: number, time: number): self", () => {
    it("inserts 'exponentialRampToValueAtTime' event into the schedule at time", () => {
      let param = new PseudoAudioParam()
        .setValueAtTime(1e-4, 0)
        .exponentialRampToValueAtTime(2, 20)
        .exponentialRampToValueAtTime(1, 10)
        .exponentialRampToValueAtTime(3, 20);

      assert(param instanceof PseudoAudioParam);
      assert.deepEqual(param.events, [
        { type: "setValueAtTime", time: 0, args: [ 1e-4, 0 ] },
        { type: "exponentialRampToValueAtTime", time: 10, args: [ 1, 10 ] },
        { type: "exponentialRampToValueAtTime", time: 20, args: [ 3, 20 ] }
      ]);
      assert(param.getValueAtTime(0) === 1e-4);
      assert(closeTo(param.getValueAtTime(5), 0.01, 1e-4));
      assert(param.getValueAtTime(10) === 1);
      assert(closeTo(param.getValueAtTime(15), 1.73205108, 1e-4));
      assert(param.getValueAtTime(20) === 3);
      assert(param.getValueAtTime(25) === 3);
    });
  });
  describe("#setTargetAtTime(value: number, time: number, timeConstant: number): self", () => {
    it("inserts 'setTargetAtTime' event into the schedule at time", () => {
      let param = new PseudoAudioParam()
        .setValueAtTime(0, 0)
        .setTargetAtTime(2, 20, 2)
        .setTargetAtTime(1, 10, 2)
        .setTargetAtTime(3, 20, 2);

      assert(param instanceof PseudoAudioParam);
      assert.deepEqual(param.events, [
        { type: "setValueAtTime", time: 0, args: [ 0, 0 ] },
        { type: "setTargetAtTime", time: 10, args: [ 1, 10, 2 ] },
        { type: "setTargetAtTime", time: 20, args: [ 3, 20, 2 ] }
      ]);
      assert(param.getValueAtTime(0) === 0);
      assert(param.getValueAtTime(5) === 0);
      assert(param.getValueAtTime(10) === 0);
      assert(closeTo(param.getValueAtTime(15), 0.917915, 1e-4));
      assert(closeTo(param.getValueAtTime(20), 0.993262, 1e-4));
      assert(closeTo(param.getValueAtTime(25), 2.835276, 1e-4));
    });
  });
  describe("#setValueCurveAtTime(curve: Float32Array, time: number, duration: number): self", () => {
    it("inserts 'setValueCurveAtTime' event into the schedule at time", () => {
      let curve = (() => {
        let curve = new Float32Array(128);

        for (let i = 0; i < curve.length; i++) {
          curve[i] = Math.sin(Math.PI * i / curve.length);
        }

        return curve;
      })();
      let param = new PseudoAudioParam()
        .setValueAtTime(0, 0)
        .setValueCurveAtTime(curve, 20, 10)
        .setValueCurveAtTime(curve, 10, 10)
        .setValueCurveAtTime(curve, 20, 20);

      assert(param instanceof PseudoAudioParam);
      assert.deepEqual(param.events, [
        { type: "setValueAtTime", time: 0, args: [ 0, 0 ] },
        { type: "setValueCurveAtTime", time: 10, args: [ curve, 10, 10 ] },
        { type: "setValueCurveAtTime", time: 20, args: [ curve, 20, 20 ] }
      ]);
      assert(param.getValueAtTime(0) === 0);
      assert(param.getValueAtTime(5) === 0);
      assert(param.getValueAtTime(10) === 0);
      assert(closeTo(param.getValueAtTime(15), 0.999849, 1e-4));
      assert(param.getValueAtTime(20) === 0);
      assert(closeTo(param.getValueAtTime(25), 0.702715, 1e-4));
    });
  });
  describe("#cancelScheduledValues(time: number): self", () => {
    it("removes events from the schedule after time", () => {
      let param = new PseudoAudioParam()
        .setValueAtTime(0, 0)
        .setValueAtTime(1, 10)
        .cancelScheduledValues(5);

      assert(param instanceof PseudoAudioParam);
      assert.deepEqual(param.events, [
        { type: "setValueAtTime", time: 0, args: [ 0, 0 ] }
      ]);
    });
  });
  describe("#getValueAtTime(time: number): number", () => {
    it("returns value at time", () => {

    });
  });
  describe("#applyTo(audioParam: AudioParam): self", () => {
    it("call scheduled api methods to the audioParam", () => {
      let audioParam = createAudioParamMock();
      let param = new PseudoAudioParam()
        .setValueAtTime(0, 0)
        .setValueAtTime(1, 10)
        .applyTo(audioParam);

      assert(audioParam.setValueAtTime.callCount === 2);
      assert.deepEqual(audioParam.setValueAtTime.args[0], [ 0, 0 ]);
      assert.deepEqual(audioParam.setValueAtTime.args[1], [ 1, 10 ]);
    });
  });
});
