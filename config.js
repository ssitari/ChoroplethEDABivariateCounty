// ============================================================
//  config.js  —  US counties: educational attainment × income
//  Data built by scripts/build_data.sh; see the README.
// ============================================================

export const DATA_FILE = './data/us_counties_acs2024.geojson';

export const PAGE_TITLE = 'Education and Income Across U.S. Counties';

// Optional line under the heading; '' hides it.
export const PAGE_SUBTITLE = 'Bachelor’s attainment and median household income, ACS 2020–2024';

export const DATA_CREDIT_HTML = `
  Data: U.S. Census Bureau, American Community Survey 2020–2024 5-year estimates,
  tables B15003 and B19013; 2024 cartographic boundary file, counties, 1:5,000,000.
  Source code and method notes:
  <a href="https://github.com/ssitari/ChoroplethEDABivariateCounty" rel="noopener" target="_blank">ssitari/ChoroplethEDABivariateCounty</a>.
`;

export const GEOGRAPHY_LABEL        = 'county';
export const GEOGRAPHY_LABEL_PLURAL = 'counties';

// Albers USA with Alaska moved into the Gulf of Mexico and Hawaii under
// South Texas (projection.js). In the standard layout Alaska fills the
// bottom-left corner, where the legend sits, so the map was pushed to the
// top of the pane to clear it. With the corner empty the map stays centred
// and, no longer widened by Alaska, draws about 8% larger. Offsets are in
// units of the projection scale; [0, 0] is the standard geoAlbersUsa layout.
//
// The 50 states and DC only: there is no inset for Puerto Rico or the
// island areas, which are left out of the data for that reason.
import { geoAlbersUsaMovable } from './projection.js';
export const PROJECTION = () => geoAlbersUsaMovable({ alaska: [0.41, 0.05], hawaii: [0.07, 0] });

export const FEATURE_ID_FIELD    = 'GEOID';
export const FEATURE_NAME_FIELD  = 'NAMELSAD';
export const FEATURE_GROUP_FIELD = 'STATE_NAME';

export const VARIABLES = [
  {
    id:    'ba_plus',
    label: "Bachelor's Degree or Higher",
    prop:  'pct_ba_plus',
    fmt:   v => v.toFixed(1) + '%',
    unit:  '%',
  },
  {
    id:    'med_inc',
    label: 'Median Household Income',
    prop:  'med_hh_inc',
    fmt:   v => '$' + (Math.round(v / 100) / 10) + 'k',
    unit:  '$',
  },
];

export const DEFAULT_VAR_X = 'ba_plus';
export const DEFAULT_VAR_Y = 'med_inc';

export const DEFAULT_BIVARIATE_SCHEME = 'DkBlue_DkRed';
export const NULL_COLOR         = '#d0d0d0';
export const SELECTION_COLOR    = '#e07b39';
export const DEEMPHASIS_OPACITY = 0.2;

// Smaller than the template's 5: ~3,100 dots at 5px overplot into one blob.
export const DOT_RADIUS = 2.5;
