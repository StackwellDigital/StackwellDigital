STACKWELL DIGITAL · SANDBOX HOMEPAGE · DEPLOY STRUCTURE
=======================================================

Drop everything in this zip into the root of the
StackwellDigital/StackwellDigital repo. Cloudflare Pages
auto-deploys on push. No build command, output dir = /.

FILE STRUCTURE
--------------
/index.html            <- the new sandbox canvas (root homepage)
/robots.txt
/sitemap.xml

/main/                 <- your CURRENT site, split into section pages.
  hero/index.html         These render inside the big section tiles
  services/index.html     AND fullscreen when clicked / nav-clicked.
  process/index.html
  audit/index.html        (audit tool JS included + working)
  pricing/index.html
  work/index.html
  reports/index.html
  team/index.html
  faq/index.html
  contact/index.html

/sites/                <- standalone builds shown as normal tiles.
  baselines/index.html    REPLACE the placeholder index.html in each
  littlegreens/index.html of these with the real site's index file.
  atwood/index.html
  chipd/index.html
  pitchd/index.html
  vomad/index.html
  borrowhood/index.html

/concepts/             <- old Stackwell versions
  stackwell-v1/index.html
  stackwell-v2/index.html
  stackwell-v3/index.html

/products/             <- add-on showcases
  stackwell-shop/index.html
  stackwell-book/index.html

WHAT TO REPLACE
---------------
Every file under /sites, /concepts, /products is a PLACEHOLDER.
Swap each index.html for the real build. Keep the folder names
(or rename them and update the matching `src` path in /index.html
inside the SECTIONS / SITES / PLACEMENT config blocks at the top
of the <script>).

The /main/* pages are auto-generated from your deployed index.html.
If you edit the live site later, re-split it so these stay in sync.

NOTES
-----
- Each tile is a same-origin iframe, so no X-Frame-Options issues.
- Big SECTION tiles = 4x a normal tile (2x2 grid cells).
- Top nav pans the canvas to each section tile.
- Logo (top-left) returns to the grid from any fullscreen view.
- Tiles render the site at 1440px wide then scale down. If a site
  is designed for a different width, set SITE_NATIVE_W / 
  SECTION_NATIVE_W in /index.html.
- GA + Meta Pixel fire on the sandbox; section pages are noindex
  so they don't compete with the canonical homepage in search.
