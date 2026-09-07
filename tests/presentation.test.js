const tests = [];
const test = (name, run) => tests.push({ name, run });

const screenLink = document.querySelector("#screen-stylesheet");
const printLink = document.querySelector("#print-stylesheet");
const [screenResponse, printResponse] = await Promise.all([
  fetch(screenLink.href),
  fetch(printLink.href),
]);
const [screenText, printText] = await Promise.all([
  screenResponse.text(),
  printResponse.text(),
]);

test("loads the screen stylesheet for normal presentation", () => {
  if (!screenResponse.ok || screenLink.getAttribute("media") !== null) {
    throw new Error("Screen stylesheet is missing or media-restricted");
  }
});

test("loads the print stylesheet only for print media", () => {
  if (!printResponse.ok || printLink.getAttribute("media") !== "print") {
    throw new Error("Print stylesheet is not isolated to print media");
  }
});

test("keeps print rules out of the screen stylesheet", () => {
  if (screenText.includes("@media print")) throw new Error("Screen stylesheet still contains print rules");
});

test("defines physical pages and page breaks in the print stylesheet", () => {
  if (!printText.includes("@page") || !printText.includes("break-after: page")) {
    throw new Error("Print stylesheet is missing page sizing or page breaks");
  }
});

test("removes editor chrome in the print stylesheet", () => {
  if (!printText.includes(".no-print") || !printText.includes("display: none !important")) {
    throw new Error("Print stylesheet does not hide editor chrome");
  }
});

test("defines holiday labels and compact markers for screen and print", () => {
  if (!screenText.includes(".holiday-labels") || !screenText.includes(".holiday-marker")) {
    throw new Error("Screen holiday styles are missing");
  }
  if (!printText.includes(".holiday-labels") || !printText.includes(".holiday-marker")) {
    throw new Error("Print holiday styles are missing");
  }
});

const results = document.querySelector("#results");
let passed = 0;

for (const { name, run } of tests) {
  const item = document.createElement("li");
  try {
    run();
    item.textContent = `PASS — ${name}`;
    item.className = "pass";
    passed += 1;
  } catch (error) {
    item.textContent = `FAIL — ${name}: ${error.message}`;
    item.className = "fail";
  }
  results.append(item);
}

const summary = document.querySelector("#summary");
summary.textContent = `${passed}/${tests.length} tests passed`;
summary.dataset.passed = String(passed === tests.length);
