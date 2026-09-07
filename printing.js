/**
 * Creates a filename-friendly document title for printing and Save as PDF.
 */
export function buildPrintTitle(label = "Calendar") {
  const safeLabel = String(label)
    .replace(/[\u0000-\u001f<>:"/\\|?*]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return `Paperday - ${safeLabel || "Calendar"}`;
}

function nextPaint(windowRef) {
  if (typeof windowRef.requestAnimationFrame !== "function") {
    return Promise.resolve();
  }

  return new Promise((resolve) => windowRef.requestAnimationFrame(resolve));
}

/**
 * Installs a reusable print lifecycle around a button. The native print action
 * can be injected for testing or alternative browser shells.
 */
export function createPrintController({
  button,
  status,
  getLabel = () => "Calendar",
  documentRef = document,
  windowRef = window,
  printAction,
}) {
  if (!button || typeof button.addEventListener !== "function") {
    throw new TypeError("button must be an interactive element");
  }

  const runPrint = printAction ?? (() => windowRef.print());
  let busy = false;
  let originalTitle = null;

  function setStatus(message) {
    if (status) status.textContent = message;
  }

  function getPageCount() {
    return documentRef.querySelectorAll(".calendar-page").length;
  }

  function prepare(pageCount = getPageCount()) {
    if (originalTitle === null) originalTitle = documentRef.title;
    busy = true;
    documentRef.title = buildPrintTitle(getLabel());
    documentRef.documentElement.classList.add("print-preparing");
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    setStatus(`Preparing ${pageCount} printable ${pageCount === 1 ? "page" : "pages"}…`);
  }

  function finish(message = "Print dialog closed. Ready to print again.") {
    if (originalTitle !== null) documentRef.title = originalTitle;
    originalTitle = null;
    busy = false;
    documentRef.documentElement.classList.remove("print-preparing");
    button.disabled = false;
    button.removeAttribute("aria-busy");
    setStatus(message);
  }

  function handleBeforePrint() {
    prepare();
    setStatus("Print dialog opened. Choose a printer or Save as PDF.");
  }

  function handleAfterPrint() {
    finish();
  }

  async function requestPrint() {
    if (busy) return false;

    const pageCount = getPageCount();
    if (pageCount === 0) {
      setStatus("No printable calendar pages are available yet.");
      return false;
    }

    prepare(pageCount);

    try {
      if (documentRef.fonts?.ready) await documentRef.fonts.ready;
      await nextPaint(windowRef);
      await nextPaint(windowRef);
      const result = runPrint();
      if (result && typeof result.then === "function") await result;
      if (busy) finish();
      return true;
    } catch {
      finish("Printing could not start. Try your browser’s Print command.");
      return false;
    }
  }

  button.addEventListener("click", requestPrint);
  windowRef.addEventListener("beforeprint", handleBeforePrint);
  windowRef.addEventListener("afterprint", handleAfterPrint);

  return {
    requestPrint,
    finishPrint: finish,
    get isPrinting() {
      return busy;
    },
    destroy() {
      button.removeEventListener("click", requestPrint);
      windowRef.removeEventListener("beforeprint", handleBeforePrint);
      windowRef.removeEventListener("afterprint", handleAfterPrint);
      if (busy) finish();
    },
  };
}
