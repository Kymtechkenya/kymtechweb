/**
 * ==========================================================================
 * DATA LAYER
 * ==========================================================================
 * Everything in this file is about WHERE the laptop stock list comes from
 * and HOW it gets turned into a plain JavaScript array the rest of the site
 * can use. Nothing in here touches the DOM or draws anything on screen —
 * that's ui.js's job. Keeping the split this clean means you can swap the
 * data source later (say, to a real backend) without touching a single
 * line of the rendering code.
 *
 * Load order matters: this file must load BEFORE ui.js, filters.js and
 * app.js, since they all rely on things defined here (see index.html, the
 * <script> tags are in the right order already — just don't reorder them).
 * ========================================================================== */


/* --------------------------------------------------------------------------
 * 1. SITE-WIDE SETTINGS — the two things you're most likely to need to
 *    change, so they live right at the top.
 * ------------------------------------------------------------------------ */

// The WhatsApp number every "Order via WhatsApp" button messages.
// Format: country code + number, NO leading "+", NO spaces or dashes.
// e.g. Kenyan number 0723 512 233 becomes "254723512233".
const WHATSAPP_NUMBER = "254723512233"; // TODO: confirm this is the permanent number before going live

// The published Google Sheet (as CSV) that holds the live stock list.
//
// HOW TO SET THIS UP:
//   1. Open a Google Sheet using the same columns as the file
//      "laptops-template.csv" that ships alongside this site
//      (name, brand, condition, usecase, cpu, ram, ssd, screen,
//      battery, price, badges, image).
//   2. In Google Sheets: File > Share > Publish to web.
//   3. Under "Link", choose the correct sheet/tab, and set the format
//      dropdown to "Comma-separated values (.csv)".
//   4. Click Publish, then copy the link it gives you and paste it below,
//      between the quotes.
//
// Leave this as an empty string to skip the Google Sheet entirely and
// just use the built-in FALLBACK_LAPTOPS list below (handy for testing,
// or while you're still setting the sheet up).
const SHEET_CSV_URL = "";


/* --------------------------------------------------------------------------
 * 2. FALLBACK STOCK — shown whenever the Google Sheet isn't set up yet,
 *    is unreachable (no internet, wrong link, not published), or comes
 *    back empty. This is what keeps the site from ever showing a blank
 *    page just because the spreadsheet had a hiccup.
 * ------------------------------------------------------------------------ */
const FALLBACK_LAPTOPS = [
  { name: "HP EliteBook 840 G5", brand: "HP", condition: "exuk", useCase: ["office", "dev"], cpu: "Core i5-8350U", ram: "16GB", ssd: "256GB SSD", screen: '14"', battery: "~6 hrs", price: 32500, badges: ["Ex-UK Grade A", "Top Seller"] },
  { name: "Lenovo ThinkPad T480", brand: "Lenovo", condition: "exuk", useCase: ["office", "school", "dev"], cpu: "Core i5-8250U", ram: "8GB", ssd: "256GB SSD", screen: '14"', battery: "~7 hrs", price: 29500, badges: ["Ex-UK Grade A"] },
  { name: "Dell Latitude 7490", brand: "Dell", condition: "exuk", useCase: ["office", "dev"], cpu: "Core i7-8650U", ram: "16GB", ssd: "512GB SSD", screen: '14"', battery: "~6.5 hrs", price: 38900, badges: ["Ex-UK Grade A", "Best for Coding"] },
  { name: "Lenovo Legion 5", brand: "Lenovo", condition: "new", useCase: ["gaming", "creative"], cpu: "Ryzen 7 5800H", ram: "16GB", ssd: "512GB SSD", screen: '15.6"', battery: "~5 hrs", price: 118000, badges: ["Brand New", "Best for Coding"] },
  { name: "HP Pavilion 15", brand: "HP", condition: "new", useCase: ["school", "office"], cpu: "Core i5-1235U", ram: "8GB", ssd: "512GB SSD", screen: '15.6"', battery: "~8 hrs", price: 68000, badges: ["Brand New"] },
  { name: "Dell XPS 13", brand: "Dell", condition: "exuk", useCase: ["dev", "creative", "office"], cpu: "Core i7-8550U", ram: "16GB", ssd: "512GB SSD", screen: '13.3"', battery: "~7 hrs", price: 47500, badges: ["Ex-UK Grade A", "Top Seller"] },
  { name: "HP ZBook 15 G5", brand: "HP", condition: "exuk", useCase: ["creative", "dev", "gaming"], cpu: "Core i7-8850H + Quadro", ram: "32GB", ssd: "512GB SSD", screen: '15.6"', battery: "~5 hrs", price: 62000, badges: ["Ex-UK Grade A", "Best for Design"] },
  { name: "Lenovo IdeaPad 3", brand: "Lenovo", condition: "new", useCase: ["school"], cpu: "Core i3-1215U", ram: "8GB", ssd: "256GB SSD", screen: '15.6"', battery: "~7 hrs", price: 42000, badges: ["Brand New", "Budget Pick"] },
  { name: "Dell Latitude 5490", brand: "Dell", condition: "exuk", useCase: ["office", "school"], cpu: "Core i5-8350U", ram: "8GB", ssd: "256GB SSD", screen: '14"', battery: "~6 hrs", price: 26500, badges: ["Ex-UK Grade A", "Budget Pick"] },
  { name: "ASUS TUF Gaming A15", brand: "Other", condition: "new", useCase: ["gaming"], cpu: "Ryzen 5 7535HS", ram: "16GB", ssd: "512GB SSD", screen: '15.6"', battery: "~5 hrs", price: 95000, badges: ["Brand New"] },
  { name: "HP EliteBook 850 G6", brand: "HP", condition: "exuk", useCase: ["office", "dev"], cpu: "Core i7-8665U", ram: "16GB", ssd: "512GB SSD", screen: '15.6"', battery: "~6 hrs", price: 41500, badges: ["Ex-UK Grade A", "Best for Coding"] },
  { name: "Lenovo ThinkPad X1 Carbon", brand: "Lenovo", condition: "exuk", useCase: ["office", "dev", "creative"], cpu: "Core i7-8650U", ram: "16GB", ssd: "512GB SSD", screen: '14"', battery: "~8 hrs", price: 54000, badges: ["Ex-UK Grade A", "Top Seller"] },
];

// This is the array the rest of the site actually reads from. It starts
// empty and gets filled in by loadLaptops() below, either from the Google
// Sheet or from FALLBACK_LAPTOPS.
let laptops = [];


/* --------------------------------------------------------------------------
 * 3. CSV -> LAPTOP OBJECT HELPERS
 *    A spreadsheet only stores plain text, so a couple of small helpers
 *    convert what a non-technical person types into a sheet cell into the
 *    shape the site's JavaScript expects (arrays, numbers, etc).
 * ------------------------------------------------------------------------ */

// Turns a spreadsheet cell like "office, dev, school" into ["office","dev","school"].
// Used for both the "usecase" and "badges" columns.
function splitList(value) {
  return (value || "").split(",").map(function (s) { return s.trim(); }).filter(Boolean);
}

// Takes one row object from Papa Parse (keys = your column headers) and
// returns a laptop object shaped exactly like the ones in FALLBACK_LAPTOPS
// above. If someone leaves a cell blank in the sheet, we fall back to a
// sensible default instead of showing "undefined" on the card.
function rowToLaptop(row) {
  return {
    name: (row.name || "").trim() || "Unnamed laptop",
    brand: (row.brand || "").trim() || "Other",
    // Anything that isn't literally "new" is treated as Ex-UK, since that's
    // the more common listing and typos are more forgiving that way.
    condition: (row.condition || "").trim().toLowerCase() === "new" ? "new" : "exuk",
    useCase: splitList(row.usecase),
    cpu: (row.cpu || "").trim() || "-",
    ram: (row.ram || "").trim() || "-",
    ssd: (row.ssd || "").trim() || "-",
    screen: (row.screen || "").trim() || "-",
    battery: (row.battery || "").trim() || "-",
    // Strip out anything that isn't a digit or a dot, in case someone types
    // "KSh 32,500" or "32500/=" into the price column instead of a plain number.
    price: Number(String(row.price).replace(/[^0-9.]/g, "")) || 0,
    badges: splitList(row.badges),
    // Optional. A direct link to a product photo (see laptops-template.csv
    // for size/hosting guidance). Left blank/omitted is fine — ui.js falls
    // back to a plain placeholder graphic automatically.
    image: (row.image || "").trim(),
  };
}


/* --------------------------------------------------------------------------
 * 4. THE ACTUAL LOADER
 *    Called once when the page first loads (see app.js). Fills `laptops`
 *    and then hands off to render() (defined in ui.js) to draw the cards.
 * ------------------------------------------------------------------------ */
async function loadLaptops() {
  const resultCountEl = document.getElementById("resultCount");

  // No sheet configured yet — just use the sample stock and stop here.
  if (!SHEET_CSV_URL) {
    laptops = FALLBACK_LAPTOPS;
    render();
    return;
  }

  // Let the shopper know we're fetching live stock rather than showing a
  // blank grid while the request is in flight.
  if (resultCountEl) resultCountEl.textContent = "Loading current stock…";

  try {
    const response = await fetch(SHEET_CSV_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Sheet responded with status " + response.status);
    }

    const csvText = await response.text();

    // Papa.parse (loaded via CDN in index.html) turns the raw CSV text into
    // an array of row objects, using the first row as column names.
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });

    // Ignore any completely blank rows (e.g. trailing empty lines in the sheet).
    const rows = parsed.data.filter(function (r) { return r.name && r.name.trim(); });

    laptops = rows.length ? rows.map(rowToLaptop) : FALLBACK_LAPTOPS;
  } catch (err) {
    // Anything goes wrong (offline, bad link, sheet unpublished) — don't
    // break the page, just log it for whoever's debugging and fall back.
    console.warn("Could not load stock from the Google Sheet, showing fallback stock instead:", err);
    laptops = FALLBACK_LAPTOPS;
  }

  render();
}
