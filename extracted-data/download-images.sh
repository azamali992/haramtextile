#!/usr/bin/env bash
# Downloads all Haram Textile images into ./assets, preserving the images/ structure.
set -u
BASE="https://www.haramtextile.com"
OUT="$(dirname "$0")/assets"
mkdir -p "$OUT"

dl() {
  local path="$1"
  local dest="$OUT/$path"
  mkdir -p "$(dirname "$dest")"
  if curl -fsSL "$BASE/$path" -o "$dest"; then
    echo "OK   $path"
  else
    echo "MISS $path"
  fi
}

# --- Static / shared images + manifest ---
while read -r url; do
  [ -z "$url" ] && continue
  path="${url#$BASE/}"
  dl "$path"
done < "$(dirname "$0")/image-manifest.txt"

# --- Product galleries: thumbnails s{n}.jpg AND full-size {n}.jpg ---
declare -A GALLERY
GALLERY[boys]="1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 24 25"
GALLERY[girl]="1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18"
GALLERY[ladies]="1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18"
GALLERY[mens]="1 2 3 4 5 6 7 8 9 10 11 12 14 15 17"
for dir in "${!GALLERY[@]}"; do
  for n in ${GALLERY[$dir]}; do
    dl "images/$dir/s$n.jpg"
    dl "images/$dir/$n.jpg"
  done
done

# --- Manufacturing: thumb + big ---
for dir in knitting dying cutting printing emb stitching; do
  for n in 1 2 3; do
    dl "images/$dir/product_thumb$n.jpg"
    dl "images/$dir/product_big$n.jpg"
  done
done
for n in 1 2 3 5 6 7 8 9; do
  dl "images/packing/product_thumb$n.jpg"
  dl "images/packing/product_big$n.jpg"
done

echo "Done. Saved under: $OUT"
