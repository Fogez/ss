export const MINIMUM_ATTENDEES = 3;

export class MeetingMeter {
  constructor(employees, hoursPerYear, now = () => Date.now()) {
    this.employees = employees;
    this.hoursPerYear = hoursPerYear;
    this.now = now;
    this.reset();
  }

  reset() {
    this.selectedIds = new Set();
    this.state = "idle";
    this.accumulatedCost = 0;
    this.accumulatedElapsedMs = 0;
    this.segmentStartedAt = null;
  }

  get selectedCount() { return this.selectedIds.size; }
  get canRun() { return this.selectedCount >= MINIMUM_ATTENDEES; }
  get isRunning() { return this.state === "running"; }

  hourlyRate() {
    return this.employees
      .filter(({ id }) => this.selectedIds.has(id))
      .reduce((sum, employee) => sum + employee.annualSalary / this.hoursPerYear, 0);
  }

  settle(at = this.now()) {
    if (!this.isRunning || this.segmentStartedAt === null) return;
    const durationMs = Math.max(0, at - this.segmentStartedAt);
    this.accumulatedCost += this.hourlyRate() * durationMs / 3_600_000;
    this.accumulatedElapsedMs += durationMs;
    this.segmentStartedAt = at;
  }

  setAttendee(id, selected, at = this.now()) {
    this.settle(at);
    selected ? this.selectedIds.add(id) : this.selectedIds.delete(id);
    if (this.isRunning && !this.canRun) this.pause(at);
  }

  start(at = this.now()) {
    if (!this.canRun || this.state !== "idle") return false;
    this.state = "running";
    this.segmentStartedAt = at;
    return true;
  }

  pause(at = this.now()) {
    if (!this.isRunning) return false;
    this.settle(at);
    this.state = "paused";
    this.segmentStartedAt = null;
    return true;
  }

  resume(at = this.now()) {
    if (!this.canRun || this.state !== "paused") return false;
    this.state = "running";
    this.segmentStartedAt = at;
    return true;
  }

  end(at = this.now()) {
    if (this.state !== "running" && this.state !== "paused") return false;
    this.settle(at);
    this.state = "ended";
    this.segmentStartedAt = null;
    return true;
  }

  cost(at = this.now()) {
    if (!this.isRunning) return this.accumulatedCost;
    return this.accumulatedCost + this.hourlyRate() * Math.max(0, at - this.segmentStartedAt) / 3_600_000;
  }

  elapsedMs(at = this.now()) {
    if (!this.isRunning) return this.accumulatedElapsedMs;
    return this.accumulatedElapsedMs + Math.max(0, at - this.segmentStartedAt);
  }
}
