/**
 * TAILWIND THEME CONFIG
 * ---------------------
 * We're using the Tailwind "Play CDN" build (no build step, no npm install —
 * just a script tag), so this is the one place we tell Tailwind about our
 * brand colors and fonts. Once this runs, classes like `bg-midnight` or
 * `font-display` work everywhere in the HTML, same as any built-in class.
 *
 * IMPORTANT: this file has to load AFTER the Tailwind CDN <script> tag in
 * index.html, and BEFORE the page's own styles/markup need those classes.
 * That's why it's the very next <script> tag after the CDN one in <head>.
 *
 * Brand palette (matches the KymTech brand brief):
 *   midnight    - deep navy, our main dark background / heading color
 *   midnight2   - a slightly lighter navy, used for the footer so it reads
 *                 as a distinct "zone" without a hard line between sections
 *   crimson     - the action color: WhatsApp/order buttons, prices, links
 *   crimsondark - crimson's hover state (a touch darker so buttons feel
 *                 "pressed" rather than just fading)
 *   ice         - very light blue-grey, used for soft section backgrounds
 *   slate       - muted grey-blue for secondary/supporting text
 *   leaf        - green accent, borrowed from WhatsApp/M-Pesa so it reads
 *                 as "trust/verified/money" rather than just decoration
 */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        midnight: '#0B132B',
        midnight2: '#141C3A',
        crimson: '#E63946',
        crimsondark: '#C62834',
        ice: '#F0F4F8',
        slate: '#5B6478',
        leaf: '#128C4B',
      },
      fontFamily: {
        // Headlines / anything with class="font-display"
        display: ['Sora', 'sans-serif'],
        // Body copy — this is also just the default site font
        body: ['Inter', 'sans-serif'],
      },
    }
  }
}
