import { buildPrintTitle, createPrintController } from "../printing.js";

const tests = [];
const test = (name, run) => tests.push({ name, run });
const fixture = document.querySelector("#fixture");

function createControls() {
  const button = document.createElement("button");
  const status = document.createElement("p");
  fixture.append(button, status);
  return { button, status };
}

function addPrintablePage() {
  const page = document.createElement("article");
  page.className = "calendar-page";
  fixture.append(page);
  return page;
}

function clearFixture() {
  fixture.replaceChildren();
  document.documentElement.classList.remove("print-preparing");
}

test("builds safe Save-as-PDF document titles", () => {
  const title = buildPrintTitle('2027: January/February * calendar');
  if (title !== "Paperday - 2027 January February calendar") throw new Error("Print title was not sanitized");
});

test("does not print before calendar pages exist", async () => {
  clearFixture();
  const { button, status } = createControls();
  let calls = 0;
  const controller = createPrintController({ button, status, printAction: () => { calls += 1; } });
  const printed = await controller.requestPrint();
  if (printed || calls !== 0) throw new Error("Empty print job was started");
  if (!status.textContent.includes("No printable")) throw new Error("Empty-state feedback is missing");
  controller.destroy();
});

test("prepares and restores a successful print job", async () => {
  clearFixture();
  addPrintablePage();
  const { button, status } = createControls();
  const startingTitle = document.title;
  let preparedDuringPrint = false;
  const controller = createPrintController({
    button,
    status,
    getLabel: () => "2027 monthly calendar",
    printAction: () => {
      preparedDuringPrint = document.documentElement.classList.contains("print-preparing")
        && button.disabled
        && document.title === "Paperday - 2027 monthly calendar";
    },
  });

  const printed = await controller.requestPrint();
  if (!printed || !preparedDuringPrint) throw new Error("Document was not prepared before printing");
  if (button.disabled || document.title !== startingTitle) throw new Error("Document was not restored after printing");
  if (!status.textContent.includes("Ready to print again")) throw new Error("Completion feedback is missing");
  controller.destroy();
});

test("ignores duplicate print requests while preparing", async () => {
  clearFixture();
  addPrintablePage();
  const { button, status } = createControls();
  let calls = 0;
  const controller = createPrintController({ button, status, printAction: () => { calls += 1; } });
  const first = controller.requestPrint();
  const duplicate = await controller.requestPrint();
  const printed = await first;
  if (!printed || duplicate || calls !== 1) throw new Error("Duplicate print request was not blocked");
  controller.destroy();
});

test("supports browser-menu and keyboard print events", () => {
  clearFixture();
  addPrintablePage();
  const { button, status } = createControls();
  const startingTitle = document.title;
  const controller = createPrintController({ button, status, getLabel: () => "Keyboard calendar", printAction: () => {} });

  window.dispatchEvent(new Event("beforeprint"));
  if (!controller.isPrinting || !button.disabled || document.title !== "Paperday - Keyboard calendar") {
    throw new Error("beforeprint did not prepare the document");
  }

  window.dispatchEvent(new Event("afterprint"));
  if (controller.isPrinting || button.disabled || document.title !== startingTitle) {
    throw new Error("afterprint did not restore the document");
  }
  controller.destroy();
});

const results = document.querySelector("#results");
let passed = 0;

for (const { name, run } of tests) {
  const item = document.createElement("li");
  try {
    await run();
    item.textContent = `PASS — ${name}`;
    item.className = "pass";
    passed += 1;
  } catch (error) {
    item.textContent = `FAIL — ${name}: ${error.message}`;
    item.className = "fail";
  }
  results.append(item);
}

clearFixture();
const summary = document.querySelector("#summary");
summary.textContent = `${passed}/${tests.length} tests passed`;
summary.dataset.passed = String(passed === tests.length);
