# Education and Income Across U.S. Counties

*Bachelor’s attainment and median household income, ACS 2020–2024.*

**Live site: [ssitari.github.io/ChoroplethEDABivariateCounty](https://ssitari.github.io/ChoroplethEDABivariateCounty/)**

A bivariate choropleth of the 3,144 counties and county-equivalents of the 50 states and DC, linked to a scatterplot. It maps the share of adults with a bachelor's degree against median household income, from the American Community Survey 2020–2024 5-year estimates. Brushing the map or the scatterplot highlights the same counties in the other view, and the stats panel compares the selection with the whole country.

This is a configured copy of [Choropleth EDA — Bivariate](https://github.com/ssitari/ChoroplethEDABivariate). `app.js` and `index.html` come from that template; the county-specific parts are `config.js`, the data, and the build script.

---

## Data

| Variable | Definition | Source |
|---|---|---|
| Bachelor's Degree or Higher | Percent of the population 25 years and over whose highest degree is a bachelor's, master's, professional school or doctorate | ACS 5-year table B15003, lines 022–025 ÷ line 001 |
| Median Household Income | Median household income in the past 12 months, in 2024 inflation-adjusted dollars | ACS 5-year table B19013, line 001 |

- **Estimates:** U.S. Census Bureau, American Community Survey 2020–2024 5-year estimates, from the [table-based summary file](https://www2.census.gov/programs-surveys/acs/summary_file/2024/table-based-SF/).
- **Boundaries:** U.S. Census Bureau 2024 [cartographic boundary file](https://www.census.gov/geographies/mapping-files/time-series/geo/cartographic-boundary.html), counties, 1:5,000,000, simplified with [mapshaper](https://github.com/mbloch/mapshaper) to 10% of removable vertices (1.6 MB).
- **Coverage:** the 50 states and DC. Puerto Rico and the island areas are left out because the Albers USA projection has no inset for them.
- **Connecticut** appears as its nine planning regions, which replaced its eight counties as county-equivalents from 2022 onward. The boundaries and estimates are the same vintage, so every county joins.

### Things to know when reading the map

- **Classes are tertiles.** Each variable is split into thirds by number of counties, not by population, so a sparsely populated county counts as much as Los Angeles County.
- **Small counties have noisy estimates.** Loving County, TX has 31 people aged 25 and over, and shows 0% with a degree. Margins of error for income (`med_hh_inc_moe`) and the 25+ population behind the education share (`pop_25_plus`) are in the GeoJSON but not shown on the page.
- **One county has no income estimate:** De Baca County, NM. It is drawn in grey and left out of the scatterplot and statistics.
- **Alaska and Hawaii are insets in non-standard places.** Alaska is drawn in the Gulf of Mexico and Hawaii in the lower right, east of Alaska, so the bottom-left corner stays free for the legend and the map can stay centred. As in the usual Albers USA layout, Alaska is shown at 0.35 of its true scale relative to the lower 48. The layout is in `projection.js`; its offsets are set in `config.js`, and `[0, 0]` restores the standard positions.
- **Area is not population.** Large western counties dominate the map visually; the scatterplot gives every county one dot.

### Rebuilding the data

```bash
bash scripts/build_data.sh
```

Downloads the boundary file and the two ACS tables into `build/` (git-ignored, about 110 MB), computes the county CSV with `scripts/make_acs_csv.mjs`, and joins, filters and simplifies with mapshaper. Needs bash, curl, unzip and Node.js 18+. The ACS tables come from the summary-file server because the `api.census.gov` endpoints now require an API key.

---

## Running locally

The page loads its modules and data with `fetch()`, so it must be served over HTTP; opening `index.html` from disk will not work.

```bash
npx serve .
# or
python -m http.server 8000
```

## Controls

| Action | Result |
|---|---|
| Shift + drag on map or scatterplot | Freehand lasso selection |
| Shift + Alt + drag | Rectangle selection |
| Scroll / drag on map | Zoom / pan |
| Hover | Tooltip with county, state and both values |

See the [template's README](https://github.com/ssitari/ChoroplethEDABivariate#readme) for the full feature list and for adapting the tool to other data.

---

## Acknowledgements

Methodological inspiration from the GeoDa platform:

> Anselin, Luc, Ibnu Syabri and Youngihn Kho (2006). GeoDa: An Introduction to Spatial Data Analysis. *Geographical Analysis* 38 (1), 5–22.

Bivariate color schemes by [Joshua Stevens](https://www.joshuastevens.net/cartography/make-a-bivariate-choropleth-map/).

Most of the code written with assistance from [Claude](https://claude.ai) (Anthropic).

---

## License

MIT — free to use, adapt, and redistribute with attribution. Census Bureau data are in the public domain.
