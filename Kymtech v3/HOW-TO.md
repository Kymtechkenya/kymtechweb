# Updating the KymTech Website

Three things covered here, in the order you'll probably need them:
1. Adding or editing laptops
2. Adding product photos (with sizes)
3. Adding a new blog article

None of these require touching the site's code.


## 1. Adding or editing laptops

The live product grid is driven by a Google Sheet, not by editing any
files directly. This is set up in `js/data.js` (see `SHEET_CSV_URL` near
the top of that file) — if that's not configured yet, see the earlier
setup notes in that file for how to publish a Google Sheet as CSV.

**`laptops-template.csv`** (in this same folder) is a *template*, not the
live data — it's what your Google Sheet's columns should look like. Open
it, copy the column headers and a couple of example rows into your Sheet
to get the format right, then add/edit/delete rows freely from there on.
Once a laptop is added as a row, it just appears on the site — no re-
upload of any files needed, no limit on how many rows/laptops you add.

Columns, in short:
- `name`, `brand` — plain text
- `condition` — either `exuk` or `new`
- `usecase` — one or more of: `gaming`, `school`, `office`, `dev`,
  `creative`, separated by commas if more than one (e.g. `office,dev`)
- `cpu`, `ram`, `ssd`, `screen`, `battery` — plain text, shown as-is
- `price` — just the number, e.g. `32500` (no "KSh", no commas)
- `badges` — one or more of anything you like (e.g. `Top Seller`), comma-
  separated if more than one
- `image` — see section 2 below


## 2. Adding product photos

Leave the `image` column blank and the site shows a simple placeholder
graphic instead — nothing breaks. To use a real photo, put a direct link
to it in that column. Two ways to get that link:

**Option A — easiest, fully spreadsheet-based (recommended)**
Upload the photo to any free image host (e.g. imgur.com — no account
needed for a single upload) and copy the *direct image link* it gives you
(it should end in `.jpg`, `.png`, or similar — not just a page link).
Paste that into the `image` column. Nothing else to do.

**Option B — host photos alongside the website files**
Put the photo file into the `images` folder that ships with this site,
name it after the laptop with no spaces (e.g. `hp-elitebook-840-g5.jpg`),
and in the `image` column type: `images/hp-elitebook-840-g5.jpg`
This only works once that `images` folder is uploaded to your actual
website alongside `index.html` — not from the spreadsheet alone.

**Recommended photo specs, either way:**
- Size/shape: **800 x 600px** (a 4:3 rectangle) — this matches the shape
  every card crops photos to, so a different shape just gets center-
  cropped rather than distorted, but starting at 4:3 looks best.
- Format: JPG or WEBP.
- File size: ideally under ~200KB so cards load quickly on mobile data.
- Background: plain/light or white background if you can manage it — the
  grid looks a lot more polished when every photo is framed consistently
  rather than mixed backgrounds/angles.
- If a link is ever broken (typo, deleted photo), the site automatically
  falls back to the placeholder graphic instead of showing a broken image
  — so a bad link degrades gracefully rather than breaking the page.


## 3. Adding a new blog article

1. Copy one of the existing files in `/blog` (either one) and rename it,
   e.g. `blog/how-to-spot-a-fake-laptop-charger.html`.
2. Open it and update: the `<title>`, the meta description, the canonical
   URL, the Open Graph/Twitter tags, the JSON-LD `headline`/`description`/
   `datePublished`, and of course the actual heading and article content
   further down the page.
3. Add a matching teaser card in `index.html`'s `<section id="blog">` —
   copy one of the two existing `<article>` blocks in that section, update
   the text, and point its link at your new file.
4. Add a `<url>` entry for the new page in `sitemap.xml` (copy one of the
   existing blog `<url>` blocks and update the address/date).

That's it — no other files need to change.


## A note on how the product grid scales

The homepage only shows 9 laptop cards at a time, with a "Load more
laptops" button underneath — this is intentional, and already built in.
As your spreadsheet grows to 20, 50, 100+ laptops, nothing here needs to
change; shoppers just click through pages of 9 rather than the site
trying to load everything in one long scroll.
