import { employees, WORKING_HOURS_PER_YEAR } from "../data/employees.js";
import { MeetingMeter } from "./meter.js";

const meter = new MeetingMeter(employees, WORKING_HOURS_PER_YEAR);
const $ = (id) => document.getElementById(id);
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function formatElapsed(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor(totalSeconds % 3600 / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

function renderCost() { $("cost").textContent = money.format(meter.cost()); }

function render() {
  $("elapsed").textContent = formatElapsed(meter.elapsedMs());
  $("attendee-count").textContent = meter.selectedCount;
  $("hourly-rate").textContent = `${money.format(meter.hourlyRate())}/hr`;
  $("minimum-message").classList.toggle("hidden", meter.canRun);
  $("start").disabled = !meter.canRun || meter.state !== "idle";
  $("pause").disabled = meter.state !== "running" && !(meter.state === "paused" && meter.canRun);
  $("pause").textContent = meter.state === "paused" ? "Resume" : "Pause";
  $("end").disabled = meter.state !== "running" && meter.state !== "paused";
  const labels = { idle: "Ready to start", running: "Meeting in progress", paused: "Meeting paused", ended: "Meeting ended" };
  $("status").lastElementChild.textContent = labels[meter.state];
  $("status").className = `status ${meter.state}`;
  $("select-all").textContent = meter.selectedCount === employees.length ? "Clear all" : "Select all";
  renderCost();
}

for (const employee of employees) {
  const label = document.createElement("label");
  label.className = "employee";
  label.innerHTML = `<input type="checkbox" value="${employee.id}"><span class="checkmark" aria-hidden="true"></span><span>${employee.name}</span>`;
  label.querySelector("input").addEventListener("change", (event) => {
    meter.setAttendee(employee.id, event.target.checked);
    render();
  });
  $("employee-list").append(label);
}

$("select-all").addEventListener("click", () => {
  const select = meter.selectedCount !== employees.length;
  document.querySelectorAll(".employee input").forEach((input) => {
    if (input.checked !== select) {
      input.checked = select;
      meter.setAttendee(input.value, select);
    }
  });
  render();
});
$("start").addEventListener("click", () => { meter.start(); render(); });
$("pause").addEventListener("click", () => { meter.isRunning ? meter.pause() : meter.resume(); render(); });
$("end").addEventListener("click", () => { meter.end(); render(); });
$("reset").addEventListener("click", () => {
  meter.reset();
  document.querySelectorAll(".employee input").forEach((input) => { input.checked = false; });
  render();
});

setInterval(() => {
  $("elapsed").textContent = formatElapsed(meter.elapsedMs());
}, 1000);
setInterval(renderCost, 5000);
render();
