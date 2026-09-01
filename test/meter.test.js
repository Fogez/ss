import test from "node:test";
import assert from "node:assert/strict";
import { employees, WORKING_HOURS_PER_YEAR } from "../data/employees.js";
import { MeetingMeter } from "../js/meter.js";

const ids = employees.map(({ id }) => id);
function setup(count = 0) {
  let time = 0;
  const meter = new MeetingMeter(employees, WORKING_HOURS_PER_YEAR, () => time);
  ids.slice(0, count).forEach((id) => meter.setAttendee(id, true));
  return { meter, advance: (ms) => { time += ms; } };
}

test("one or two attendees cannot start, while exactly three can", () => {
  const { meter } = setup(2);
  assert.equal(meter.start(), false);
  meter.setAttendee(ids[2], true);
  assert.equal(meter.start(), true);
});

test("all eleven employees total $550 per hour", () => assert.equal(setup(11).meter.hourlyRate(), 550));

test("joiners only count after joining and leavers stop after leaving", () => {
  const { meter, advance } = setup(3);
  meter.start();
  advance(20 * 60_000);
  meter.setAttendee(ids[3], true);
  advance(10 * 60_000);
  meter.setAttendee(ids[0], false);
  advance(10 * 60_000);
  // 150/hr × 20m + 200/hr × 10m + 150/hr × 10m
  assert.ok(Math.abs(meter.cost() - 108.33333333333333) < Number.EPSILON * 100);
});

test("cost does not run while paused and resumes from its saved total", () => {
  const { meter, advance } = setup(3);
  meter.start(); advance(60_000); meter.pause();
  const pausedCost = meter.cost();
  advance(60_000); assert.equal(meter.cost(), pausedCost);
  meter.resume(); advance(60_000); assert.equal(meter.cost(), 5);
});

test("dropping below three pauses automatically", () => {
  const { meter, advance } = setup(3);
  meter.start(); advance(60_000); meter.setAttendee(ids[0], false);
  assert.equal(meter.state, "paused");
  const cost = meter.cost(); advance(60_000); assert.equal(meter.cost(), cost);
});

test("end freezes and reset clears all meeting state", () => {
  const { meter, advance } = setup(3);
  meter.start(); advance(60_000); meter.end(); advance(60_000);
  assert.equal(meter.cost(), 2.5);
  meter.reset();
  assert.equal(meter.cost(), 0); assert.equal(meter.elapsedMs(), 0);
  assert.equal(meter.selectedCount, 0); assert.equal(meter.state, "idle");
});
