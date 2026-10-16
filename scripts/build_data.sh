#!/usr/bin/env bash
# Rebuild data/us_counties_acs2024.geojson from Census Bureau sources.
# Needs: bash, curl, unzip, Node.js 18+ (mapshaper is fetched with npx).
# Run from the repository root:  bash scripts/build_data.sh
set -euo pipefail

YEAR=2024
WORK=build                      # downloads and intermediates; git-ignored
OUT=data/us_counties_acs${YEAR}.geojson
GEO="https://www2.census.gov/geo/tiger/GENZ${YEAR}/shp/cb_${YEAR}_us_county_5m.zip"
ACS="https://www2.census.gov/programs-surveys/acs/summary_file/${YEAR}/table-based-SF/data/5YRData"

mkdir -p "$WORK/geo" "$WORK/acs"

# 1. Boundaries: 2024 cartographic boundary file, counties, 1:5,000,000
[ -f "$WORK/geo.zip" ] || curl -fsSL "$GEO" -o "$WORK/geo.zip"
unzip -q -o "$WORK/geo.zip" -d "$WORK/geo"

# 2. ACS 5-year detailed tables from the table-based summary file. These are
#    keyless; the api.census.gov endpoints now require an API key.
for t in b15003 b19013; do
  f="acsdt5y${YEAR}-${t}.dat"
  [ -f "$WORK/acs/$f" ] || curl -fsSL "$ACS/$f" -o "$WORK/acs/$f"
done

# 3. County CSV: percent bachelor's or higher, median household income
node scripts/make_acs_csv.mjs "$WORK/acs" "$WORK/acs_counties.csv"

# 4. Join, keep the 50 states + DC (STATEFP <= 56), simplify, export.
#    -simplify works on shared borders, so neighbours stay gap-free.
#    gj2008 writes clockwise outer rings, the order d3-geo expects.
npx -y mapshaper "$WORK/geo/cb_${YEAR}_us_county_5m.shp" \
  -filter '+STATEFP <= 56' \
  -join "$WORK/acs_counties.csv" keys=GEOID,GEOID string-fields=GEOID \
  -filter-fields GEOID,NAMELSAD,STATE_NAME,STUSPS,pct_ba_plus,pop_25_plus,med_hh_inc,med_hh_inc_moe \
  -simplify 10% keep-shapes \
  -o gj2008 precision=0.0001 format=geojson "$OUT"

echo "wrote $OUT"
