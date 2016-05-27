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
      const param = new PseudoAudioParam(1);

      assert(param instanceof PseudoAudioParam);
    });
  });

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
  });

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
  });

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
  });

  describe("#setValueCurveAtTime(curve: Float32Array, time: number, duration: number): self", () => {
    it("inserts 'setValueCurveAtTime' event into the schedule at time", () => {
      const curve = new Float32Array(128).map((_, i) => Math.sin(Math.PI * i / 128));
      const param = new PseudoAudioParam()
        .setValueAtTime(0, 0)
        .setValueCurveAtTime(curve, 20, 10)
        .setValueCurveAtTime(curve, 10, 10)
        .setValueCurveAtTime(curve, 20, 20);

      assert(param instanceof PseudoAudioParam);
      assert.deepEqual(param.events, [
        { type: "setValueAtTime", time: 0, value: 0, args: [ 0, 0 ] },
        { type: "setValueCurveAtTime", time: 10, curve: curve, duration: 10, args: [ curve, 10, 10 ] },
        { type: "setValueCurveAtTime", time: 20, curve: curve, duration: 20, args: [ curve, 20, 20 ] }
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

  describe("#getValueAtTime(time: number): number", () => {
    it("returns value at time", () => {
      let param = new PseudoAudioParam()
      let curveLength = 44100;
      let curve = new Float32Array(curveLength).map((_, i) => Math.sin(Math.PI * i / curveLength));
      let t0 = 0;
      let t1 = 0.1;
      let t2 = 0.2;
      let t3 = 0.3;
      let t4 = 0.325;
      let t5 = 0.5;
      let t6 = 0.6;
      let t7 = 0.7;
      let t8 = 1.0;
      let timeConstant = 0.1;

      param.setValueAtTime(0.2, t0);
      param.setValueAtTime(0.3, t1);
      param.setValueAtTime(0.4, t2);
      param.linearRampToValueAtTime(1, t3);
      param.linearRampToValueAtTime(0.8, t4);
      param.setTargetAtTime(0.5, t4, timeConstant);
      param.setValueAtTime(param.getValueAtTime(t5), t5);
      param.exponentialRampToValueAtTime(0.75, t6);
      param.exponentialRampToValueAtTime(0.05, t7);
      param.setValueCurveAtTime(curve, t7, t8 - t7);

      // These values are evaluated from the Web Audio API on Google Chrome 50.
      let expectedValues = [
        0.20000000298023224, 0.20000000298023224, 0.20000000298023224, 0.20000000298023224, 0.20000000298023224,
        0.20000000298023224, 0.20000000298023224, 0.20000000298023224, 0.20000000298023224, 0.20000000298023224,
        0.30000001192092896, 0.30000001192092896, 0.30000001192092896, 0.30000001192092896, 0.30000001192092896,
        0.30000001192092896, 0.30000001192092896, 0.30000001192092896, 0.30000001192092896, 0.30000001192092896,
        0.40000000596046450, 0.46000003814697266, 0.51999932527542110, 0.57999980449676510, 0.63999938964843750,
        0.69999992847442630, 0.75999951362609860, 0.82000005245208740, 0.87999963760375980, 0.93999922275543210,
        1.00000000000000000, 0.91999989748001100, 0.83999997377395630, 0.78545516729354860, 0.75829035043716430,
        0.73371100425720210, 0.71147066354751590, 0.69134658575057980, 0.67313748598098750, 0.65666145086288450,
        0.64175271987915040, 0.62826311588287350, 0.61605715751647950, 0.60501307249069210, 0.59501981735229490,
        0.58597767353057860, 0.57779580354690550, 0.57039290666580200, 0.56369405984878540, 0.55763274431228640,
        0.55213218927383420, 0.56930714845657350, 0.58701223134994510, 0.60527116060256960, 0.62409466505050660,
        0.64350712299346920, 0.66352343559265140, 0.68415856361389160, 0.70543926954269410, 0.72737789154052730,
        0.75000000000000000, 0.57207411527633670, 0.43635854125022890, 0.33283880352973940, 0.25387796759605410,
        0.19364950060844420, 0.14770893752574920, 0.11266735941171646, 0.08593863993883133, 0.06555107235908508,
        0.00000000000000000, 0.10452610254287720, 0.20790703594684600, 0.30901020765304565, 0.40672793984413147,
        0.49998971819877625, 0.58777374029159550, 0.66911828517913820, 0.74313211441040040, 0.80900442600250240,
        0.86601352691650390, 0.91353482007980350, 0.95104771852493290, 0.97814118862152100, 0.99451845884323120,
        1.00000000000000000, 0.99452590942382810, 0.97815597057342530, 0.95106971263885500, 0.91356378793716430,
        0.86604917049407960, 0.80904626846313480, 0.74317973852157590, 0.66917115449905400, 0.58783119916915890,
        0.50005155801773070, 0.40679308772087097, 0.30907785892486570, 0.20797674357891083, 0.10459709912538528,
      ];

      for (let i = 0; i < 100; i++) {
        let actual = param.getValueAtTime(i * 0.01);
        let expected = expectedValues[i];

        assert(closeTo(actual, expected, 1e-4), `[${i} ${i*0.01}sec] actual=${ actual }, expected=${ expected }`);
      }
    });
  });

  describe("#applyTo(audioParam: AudioParam): self", () => {
    it("call scheduled api methods to the audioParam", () => {
      const audioParam = createAudioParamMock();
      const param = new PseudoAudioParam()
        .setValueAtTime(0, 0)
        .setValueAtTime(1, 10)
        .applyTo(audioParam);

      assert(audioParam.setValueAtTime.callCount === 2);
      assert.deepEqual(audioParam.setValueAtTime.args[0], [ 0, 0 ]);
      assert.deepEqual(audioParam.setValueAtTime.args[1], [ 1, 10 ]);
    });
  });

});
