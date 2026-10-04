import test from "node:test";
import assert from "node:assert/strict";
import {
  CALENDAR_STYLES,
  DEFAULT_STYLE,
  getStyleDefinition,
  isValidStyle,
} from "../styles.js";

test("styles: defines warm-sunshine as default style", () => {
  assert.equal(DEFAULT_STYLE, "warm-sunshine");
  assert.equal(isValidStyle(DEFAULT_STYLE), true);
  const def = getStyleDefinition(DEFAULT_STYLE);
  assert.equal(def.id, "warm-sunshine");
  assert.equal(def.label, "Warm Sunshine");
  assert.ok(def.description && def.description.length > 0);
});

test("styles: defines high-contrast style", () => {
  assert.equal(isValidStyle("high-contrast"), true);
  const def = getStyleDefinition("high-contrast");
  assert.equal(def.id, "high-contrast");
  assert.equal(def.label, "High Contrast");
  assert.ok(def.description && def.description.length > 0);
});

test("styles: throws on unknown style definition", () => {
  assert.throws(() => getStyleDefinition("non-existent"), {
    name: "RangeError",
    message: /Unknown calendar style/,
  });
});

test("styles: validates style IDs correctly", () => {
  assert.equal(isValidStyle("warm-sunshine"), true);
  assert.equal(isValidStyle("high-contrast"), true);
  assert.equal(isValidStyle("unknown-style"), false);
  assert.equal(isValidStyle(null), false);
  assert.equal(isValidStyle(undefined), false);
  assert.equal(isValidStyle(123), false);
  assert.equal(isValidStyle({}), false);
});

test("styles: registry and objects are immutable", () => {
  assert.ok(Object.isFrozen(CALENDAR_STYLES));
  assert.ok(Object.isFrozen(CALENDAR_STYLES["warm-sunshine"]));
  assert.ok(Object.isFrozen(CALENDAR_STYLES["high-contrast"]));
});
