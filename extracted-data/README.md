# Haram Textile — Extracted Site Data

Full extraction of the legacy site at https://www.haramtextile.com, prepared for the React rebuild with a database-backed admin panel.

## Contents

| File / Folder | What it is |
|---|---|
| `site-content.json` | **The master data file.** All page text, contact info, team, stats, certifications, product categories, and manufacturing processes — structured and ready to seed a database. |
| `image-manifest.txt` | List of all shared/static image URLs on the live site. |
| `download-images.sh` | Script that re-downloads every image (galleries + manufacturing + static). Already run. |
| `assets/images/` | **All 236 downloaded images**, preserving the original `images/...` folder structure (~27 MB). |

## Pages extracted (16 total)

- **Main:** Home, About Us, Certifications, Contact Us, Inquiry
- **Products:** Boys (24), Girls (18), Ladies (18), Men's (15) — image galleries
- **Manufacturing:** Knitting, Dyeing, Cutting, Printing, Embroidery, Sewing, Finishing & Packing

## Key facts

- **Company:** Haram Textile — Manufacturer & Exporter of Knitted Garments, Faisalabad, Pakistan (est. 19 Dec 2009)
- **Phone:** (+92) 41-8814858 · **Email:** rashid@haramtextile.com (CEO), adnan@haramtextile.com (MD)
- **Address:** 7-km, Millat Chowk, West Millat Industrial Estate, Pharang Drainage Dhanola, Faisalabad, Pakistan
- **Stats:** 220 machines · 350 staff · 30,000 sq ft · 600,000 pcs/month packing capacity
- **Certs:** ISO 9001:2008 (ACS), Oeko-Tex 100 (AITEX Spain Class II), BSCI

## Notes for the rebuild

- The legacy product pages have **no individual product names, descriptions, or prices** — only image galleries. The new admin panel should let staff add a name/description/category/price to each photo.
- Product image folders contain matched pairs: `s{n}.jpg` (thumbnail) + `{n}.jpg` (full-size).
- The old theme reused stock "dairy/agri" image filenames (`dairy_about.jpg`, `agri_signature.png`) — these are leftover template assets, replace with proper branding in the rebuild.
