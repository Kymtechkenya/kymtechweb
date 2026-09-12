/**
 * ==========================================================================
 * FILTERS / USER INTERACTION LAYER
 * ==========================================================================
 * This file owns the "what is the shopper currently looking for" state, and
 * wires up every button/input that can change it. Whenever something here
 * changes `state`, it calls render() (from ui.js) to redraw the grid.
 *
 * Depends on:
 *   - `render()` (defined in ui.js) — must be loaded before this file.
 * ========================================================================== */

// The single source of truth for "what's currently selected". ui.js's
// applyFilters() reads straight from this object, so as long as everything
// in this file keeps `state` up to date, the grid will always match what
// the buttons show as selected.
const state = {
  usecase: "all",     // "all" | "gaming" | "school" | "office" | "dev" | "creative"
  condition: "all",   // "all" | "exuk" | "new"
  brand: "all",        // "all" | "HP" | "Lenovo" | "Dell" | "Other"
  search: "",          // free-text typed into the search box
  visibleCount: PAGE_SIZE, // how many matching cards to render (pagination — see ui.js)
};

/**
 * Wires up one group of filter pills (use case, condition, or brand).
 * All three groups behave identically — click a button, it becomes the
 * only "selected" one in its group, everything else in that group
 * un-selects. We use event delegation (one listener on the container,
 * not one per button) so this still works even if buttons are added or
 * removed later.
 *
 * @param {string} containerId - id of the wrapping <div> holding the buttons
 * @param {string} stateKey    - which key in `state` this group controls
 */
function setupFilterGroup(containerId, stateKey) {
  const container = document.getElementById(containerId);

  container.addEventListener("click", function (event) {
    const clickedButton = event.target.closest("button");
    if (!clickedButton) return; // clicked the container padding, not a button

    // Each button carries its own value in a data-* attribute matching the
    // state key, e.g. data-usecase="gaming" or data-brand="Dell".
    const newValue = clickedButton.dataset[stateKey];
    state[stateKey] = newValue;
    state.visibleCount = PAGE_SIZE; // start back at page one for the new filter

    // Visually mark only the clicked button as pressed. The actual
    // "selected" look comes from CSS reacting to aria-pressed (see
    // style.css), so this one line handles both the visuals and the
    // accessibility state together.
    container.querySelectorAll("button").forEach(function (button) {
      button.setAttribute("aria-pressed", button === clickedButton ? "true" : "false");
    });

    render();
  });
}

setupFilterGroup("useCaseFilters", "usecase");
setupFilterGroup("conditionFilters", "condition");
setupFilterGroup("brandFilters", "brand");

// Live search — re-render on every keystroke. With ~a dozen laptops this is
// cheap; if the catalog grows into the hundreds, this would be a good spot
// to add a small debounce so we're not re-rendering on every single keypress.
document.getElementById("searchInput").addEventListener("input", function (event) {
  state.search = event.target.value;
  state.visibleCount = PAGE_SIZE;
  render();
});

// "Reset filters" link shown inside the empty-results message. Puts every
// filter group back to "All" and clears the search box.
document.getElementById("resetFilters").addEventListener("click", function () {
  state.usecase = "all";
  state.condition = "all";
  state.brand = "all";
  state.search = "";
  state.visibleCount = PAGE_SIZE;

  document.getElementById("searchInput").value = "";

  // Re-select whichever button in each group represents "all" — this
  // relies on each group's "all" button being the one with value "all"
  // for its own data attribute (usecase/condition/brand).
  document.querySelectorAll("#useCaseFilters button, #conditionFilters button, #brandFilters button")
    .forEach(function (button) {
      const isAllButton = button.dataset.usecase === "all"
        || button.dataset.condition === "all"
        || button.dataset.brand === "all";
      button.setAttribute("aria-pressed", isAllButton ? "true" : "false");
    });

  render();
});

// "Load more laptops" — reveals the next page of matching results without
// touching any of the active filters. Doesn't reset visibleCount (that's
// the whole point); every other handler above resets it back to PAGE_SIZE
// since those represent a fresh search.
document.getElementById("loadMoreBtn").addEventListener("click", function () {
  state.visibleCount += PAGE_SIZE;
  render();
});
