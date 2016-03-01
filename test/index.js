"use strict";

const assert = require("assert");
const index = require("../lib");
const PseudoAudioParam = require("../lib/PseudoAudioParam");

describe("index", () => {
  it("exports", () => {
    assert(index === PseudoAudioParam);
  });
});
