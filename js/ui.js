/**
 * ==========================================================================
 * UI / RENDERING LAYER
 * ==========================================================================
 * This file turns the `laptops` array (from data.js) plus the current
 * filter/search `state` (from filters.js) into actual HTML on the page.
 * It doesn't know or care where the data came from — that separation is
 * what makes it easy to change one without breaking the other.
 *
 * Depends on:
 *   - `laptops`         (global array, set by data.js's loadLaptops())
 *   - `state`           (global object, defined in filters.js)
 *   - `WHATSAPP_NUMBER` (defined in data.js)
 * ========================================================================== */


/* --- Small formatting helpers --------------------------------------------- */

// 32500 -> "KSh 32,500"
function formatKsh(amount) {
  return "KSh " + amount.toLocaleString("en-KE");
}

// Builds the "Order via WhatsApp" link for one laptop. The message is
// filled in with everything the shopper AND KymTech need — model, brand,
// condition, the key specs, and the price — so the customer's only job is
// to hit send, and whoever picks up the chat on the KymTech side can see
// exactly which unit is wanted without any back-and-forth.
// (%0A in a wa.me URL renders as a line break inside WhatsApp.)
function waLink(laptop) {
  const lines = [
    `Hi KymTech, I'd like to order this laptop:`,
    ``,
    `Model: ${laptop.name}`,
    `Brand: ${laptop.brand}`,
    `Condition: ${conditionLabel(laptop.condition)}`,
    `Specs: ${laptop.cpu}, ${laptop.ram} RAM, ${laptop.ssd}`,
    `Price: ${formatKsh(laptop.price)}`,
    ``,
    `Please confirm availability and delivery.`,
  ];
  const message = lines.join("\n");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

// The "no photo yet" placeholder — a plain SVG laptop icon in a box the
// same size/shape as a real product photo would be. Used both when a
// laptop simply has no `image` set, and as a graceful fallback if an
// `image` URL is set but broken (bad link, deleted photo, typo) — see
// handleProductImageError() below, wired up via the <img>'s onerror.
function placeholderImageHTML() {
  return `<div class="w-full aspect-[4/3] rounded-lg bg-white flex items-center justify-center">
      <svg viewBox="0 0 200 120" class="w-2/3" aria-hidden="true">
        <rect x="30" y="10" width="140" height="82" rx="7" fill="#0B132B"/>
        <rect x="38" y="18" width="124" height="66" rx="3" fill="#F0F4F8"/>
        <rect x="46" y="26" width="70" height="6" rx="2" fill="#E63946" opacity="0.7"/>
        <rect x="46" y="38" width="90" height="4" rx="2" fill="#5B6478" opacity="0.4"/>
        <path d="M14 94 L186 94 L198 108 L2 108 Z" fill="#1B2547"/>
      </svg>
    </div>`;
}

// Called from the <img>'s onerror attribute (see cardHTML below) if a
// photo URL from the spreadsheet fails to load. Swaps the broken <img>
// out for the same placeholder used when there's no photo at all, so a
// bad link degrades gracefully instead of showing a broken-image icon.
function handleProductImageError(imgEl) {
  imgEl.outerHTML = placeholderImageHTML();
}

// Picks a badge color based on what the badge text says. Anything we don't
// recognise falls back to a neutral grey pill rather than erroring out —
// this means new/custom badge text typed into the spreadsheet (like
// "Clearance Sale") still renders fine, just without special coloring.
function badgeClass(badgeText) {
  if (badgeText.includes("Ex-UK")) return "bg-leaf/10 text-leaf";
  if (badgeText.includes("Brand New")) return "bg-blue-50 text-blue-700";
  if (badgeText.includes("Top Seller")) return "bg-crimson/10 text-crimson";
  return "bg-ice text-slate";
}

// "exuk" -> "Ex-UK Refurbished", "new" -> "Brand New"
function conditionLabel(condition) {
  return condition === "exuk" ? "Ex-UK Refurbished" : "Brand New";
}


/* --- Card markup ----------------------------------------------------------- */

// Builds the HTML string for a single product card. Called once per laptop
// that survives the current filters (see applyFilters below).
function cardHTML(laptop) {
  const specRows = [
    ["Processor", laptop.cpu],
    ["RAM", laptop.ram],
    ["Storage", laptop.ssd],
    ["Screen", laptop.screen],
    ["Battery", laptop.battery],
  ];

  const badgesMarkup = laptop.badges
    .map(function (badge) {
      return `<span class="badge px-2.5 py-1 rounded-full ${badgeClass(badge)}">${badge}</span>`;
    })
    .join("");

  const specsMarkup = specRows
    .map(function ([label, value]) {
      return `
        <div>
          <dt class="text-slate/70">${label}</dt>
          <dd class="font-medium text-midnight mt-0.5">${value}</dd>
        </div>`;
    })
    .join("");

  // Product image: if the spreadsheet row (or FALLBACK_LAPTOPS entry) has
  // an `image` URL, use a real photo. Otherwise fall back to the plain
  // SVG laptop placeholder so the card still looks intentional rather
  // than broken for any model you haven't photographed yet.
  // `object-cover` + a fixed aspect ratio keeps every card the same
  // height in the grid regardless of the photo's original dimensions —
  // see the "Product images" notes in laptops-template.csv for the
  // recommended size/shape to shoot or crop photos to.
  const imageMarkup = laptop.image
    ? `<img src="${laptop.image}" alt="${laptop.name}" loading="lazy"
         onerror="handleProductImageError(this)"
         class="w-full aspect-[4/3] object-cover rounded-lg bg-white">`
    : placeholderImageHTML();

  return `
    <article class="card-lift bg-white rounded-2xl border border-black/5 overflow-hidden flex flex-col">
      <div class="bg-ice px-5 pt-5 pb-4 relative">
        <div class="flex flex-wrap gap-1.5 mb-3">
          ${badgesMarkup}
        </div>
        ${imageMarkup}
      </div>

      <div class="p-5 flex flex-col flex-1">
        <p class="text-xs font-semibold text-slate uppercase tracking-wide">${laptop.brand} &middot; ${conditionLabel(laptop.condition)}</p>
        <h3 class="font-display font-bold text-lg mt-1">${laptop.name}</h3>

        <dl class="grid grid-cols-2 gap-y-2 gap-x-3 mt-4 text-xs">
          ${specsMarkup}
        </dl>

        <div class="mt-5 flex items-end justify-between">
          <p class="font-display font-extrabold text-xl">${formatKsh(laptop.price)}</p>
        </div>

        <a href="${waLink(laptop)}" target="_blank" rel="noopener"
           class="mt-4 flex items-center justify-center gap-2 bg-crimson hover:bg-crimsondark transition-colors text-white font-semibold text-sm py-3 rounded-full">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.7.44 3.36 1.28 4.83L2 22l5.4-1.42a9.9 9.9 0 0 0 4.64 1.18h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2zm5.8 14.1c-.24.68-1.4 1.32-1.94 1.4-.5.08-1.12.11-1.8-.11-.42-.13-.95-.31-1.64-.6-2.88-1.24-4.76-4.13-4.9-4.32-.14-.2-1.17-1.56-1.17-2.98 0-1.42.75-2.11 1.01-2.4.26-.28.58-.36.77-.36.2 0 .39 0 .56.01.18.01.42-.07.66.5.24.58.82 2.01.9 2.15.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.17-.3.38-.44.51-.15.15-.3.31-.13.6.17.3.76 1.25 1.63 2.02 1.12 1 2.06 1.31 2.36 1.46.3.15.47.13.65-.08.17-.2.73-.85.92-1.14.19-.3.39-.24.65-.15.26.1 1.68.79 1.96.94.29.14.48.21.55.33.07.12.07.7-.17 1.38z"/></svg>
          Order via WhatsApp
        </a>
      </div>
    </article>`;
}


// How many cards to show before the shopper has to click "Load more
// laptops". Keeps the initial page load light and the grid from turning
// into an endless wall of cards once the spreadsheet has 30, 50, 100+
// rows in it — this is what makes the catalog scale without any other
// code changes as stock grows.
const PAGE_SIZE = 9;

/* --- Filtering + full re-render --------------------------------------------- */

// Runs the current `laptops` array through whatever filters/search are
// active right now (state comes from filters.js). Returns just the
// laptops that match everything — an empty array means "show the empty state".
function applyFilters() {
  return laptops.filter(function (laptop) {
    if (state.usecase !== "all" && !laptop.useCase.includes(state.usecase)) return false;
    if (state.condition !== "all" && laptop.condition !== state.condition) return false;
    if (state.brand !== "all" && laptop.brand !== state.brand) return false;
    if (state.search && !laptop.name.toLowerCase().includes(state.search.toLowerCase())) return false;
    return true;
  });
}

// The one function that actually touches the DOM for the product grid.
// Called after: initial stock load, any filter button click, typing in
// search, the "reset filters" click, and clicking "Load more laptops".
function render() {
  const allMatches = applyFilters();
  const visibleMatches = allMatches.slice(0, state.visibleCount);

  const grid = document.getElementById("laptopGrid");
  const emptyState = document.getElementById("emptyState");
  const resultCount = document.getElementById("resultCount");
  const loadMoreWrap = document.getElementById("loadMoreWrap");

  resultCount.textContent = visibleMatches.length === laptops.length
    ? `Showing all ${visibleMatches.length} laptops`
    : `Showing ${visibleMatches.length} of ${allMatches.length} matching laptops`;

  if (allMatches.length === 0) {
    grid.innerHTML = "";
    emptyState.classList.remove("fade-hidden");
  } else {
    emptyState.classList.add("fade-hidden");
    grid.innerHTML = visibleMatches.map(cardHTML).join("");
  }

  // Only show "Load more" while there are more matching laptops beyond
  // what's currently visible on the page.
  if (loadMoreWrap) {
    loadMoreWrap.classList.toggle("fade-hidden", visibleMatches.length >= allMatches.length);
  }
}
