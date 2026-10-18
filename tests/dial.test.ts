import assert from "node:assert/strict";
import test from "node:test";
import {
  DESIGN,
  layouts,
  geometry,
  labelPose,
  distance,
  dragPosition,
  scrubTarget,
  displayName,
  rowAt,
  zoneAt,
} from "../src/dial/reference.ts";
import { stepMotion, type MotionState } from "../src/dial/physics.ts";

test("reference geometry scales from 412 units and mirrors the selected label", () => {
  assert.equal(layouts.length, 5);
  const g = geometry(412, 892, 330);
  assert.equal(g.cy, 470);
  assert.equal(g.step, 54 / 330);
  assert.equal(g.span, 6.5);
  const right = labelPose(0, 8, 330, "double", g.cy, false);
  const left = labelPose(0, 8, 330, "double", g.cy, true);
  assert.equal(right.x, 260);
  assert.equal(left.x, 152);
  assert.equal(right.scale, 1.45);
  assert.equal(geometry(824, 1784, 330).cy, g.cy);
  assert.equal(displayName("ABCDEFGHIJKLMNOPQRST"), "ABCDEFGHIJKLMNOP…");
});
test("hold-to-letter transition rebases cumulative drag without a jump", () => {
  const letterIndex = 3,
    translationAtHold = 4;
  assert.equal(
    dragPosition(letterIndex, translationAtHold, translationAtHold, 1),
    letterIndex,
  );
  assert.equal(
    dragPosition(
      letterIndex,
      translationAtHold + DESIGN.gap,
      translationAtHold,
      1,
    ),
    2,
  );
  assert.equal(
    dragPosition(
      letterIndex,
      translationAtHold + DESIGN.gap * 2,
      translationAtHold,
      2,
    ),
    2,
  );
  assert.equal(scrubTarget(19, 0, 20), 20);
  assert.equal(scrubTarget(20, 19, 20), 19);
  assert.equal(distance(0, 19, 20), 1);
});
test("reference hold zones distinguish app menu, letter scrub, and settings", () => {
  assert.equal(zoneAt(280, 470, 0, 330, 470, 892, false), "selected");
  assert.equal(zoneAt(280, 570, 0, 330, 470, 892, false), "dial");
  assert.equal(zoneAt(24, 90, 0, 330, 470, 892, false), "empty");
  assert.equal(rowAt(280, 470, 0, 330, 470, 892, false), 0);
  assert.equal(rowAt(132, 470, 0, 330, 470, 892, true), 0);
});
test("reference fling decays and settles precisely with bounded long-frame integration", () => {
  const state: MotionState = {
    current: 0,
    velocity: 0.02,
    target: 0,
    fling: true,
    timestamp: 0,
  };
  stepMotion(state, 16);
  assert.equal(state.current, 0.32);
  assert.equal(state.velocity, 0.02 * 0.9965 ** 16);
  let done = false;
  for (let i = 0; i < 1000 && !done; i++) done = stepMotion(state, 16);
  assert.equal(done, true);
  assert.equal(state.current, state.target);
  assert.equal(Number.isInteger(state.current), true);
  const a = {
      current: 0,
      velocity: 0.02,
      target: 0,
      fling: true,
      timestamp: 0,
    },
    b = { ...a };
  stepMotion(a, 1000);
  stepMotion(b, 40);
  assert.deepEqual(a, b);
});
