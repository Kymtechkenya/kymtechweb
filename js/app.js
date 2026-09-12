/**
 * ==========================================================================
 * APP ENTRY POINT
 * ==========================================================================
 * Deliberately tiny. By the time this file runs, everything else is already
 * loaded and ready:
 *   - data.js     has defined loadLaptops(), FALLBACK_LAPTOPS, etc.
 *   - ui.js       has defined render(), cardHTML(), etc.
 *   - filters.js  has defined `state` and wired up every button/input.
 *
 * This is just the "go" button: fetch the stock (from the Google Sheet, or
 * fall back to sample data) and draw the first set of cards.
 *
 * Because all four <script> tags are placed at the very end of <body> in
 * index.html, the rest of the page's HTML is already sitting in the DOM by
 * the time this runs — no need to wait for a DOMContentLoaded event.
 * ========================================================================== */
loadLaptops();
