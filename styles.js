/**
 * Calendar style definitions and registry.
 *
 * To add a new style:
 * 1. Add an entry to `CALENDAR_STYLES` below with `id`, `label`, and `description`.
 * 2. Add the corresponding CSS tokens under `[data-style="<id>"]` in `screen.css`.
 */

export const CALENDAR_STYLES = Object.freeze({
  "warm-sunshine": Object.freeze({
    id: "warm-sunshine",
    label: "Warm Sunshine",
    description: "Warm linen paper with sumi ink and warm brass accents.",
    themeColor: "#f4efe6",
  }),
  "high-contrast": Object.freeze({
    id: "high-contrast",
    label: "High Contrast",
    description: "Crisp stark white and deep black for maximum clarity and bold print.",
    themeColor: "#ffffff",
  }),
});

export const DEFAULT_STYLE = "warm-sunshine";

/**
 * Retrieves the style definition for a given style ID.
 *
 * @param {string} styleId
 * @returns {typeof CALENDAR_STYLES[keyof typeof CALENDAR_STYLES]}
 */
export function getStyleDefinition(styleId) {
  const definition = CALENDAR_STYLES[styleId];
  if (!definition) {
    throw new RangeError(`Unknown calendar style: ${styleId}`);
  }
  return definition;
}

/**
 * Checks whether a given string is a recognized style ID.
 *
 * @param {unknown} styleId
 * @returns {boolean}
 */
export function isValidStyle(styleId) {
  return typeof styleId === "string" && Object.prototype.hasOwnProperty.call(CALENDAR_STYLES, styleId);
}
