// Build a county CSV from the ACS 2024 5-year table-based summary files.
//   B15003 Educational attainment, population 25+  -> pct_ba_plus
//   B19013 Median household income                 -> med_hh_inc
// Usage: node make_acs_csv.mjs <dir with .dat files> <out.csv>
import fs from 'node:fs';
import path from 'node:path';

const [dir, out] = process.argv.slice(2);

function readCounties(file) {
  const lines = fs.readFileSync(path.join(dir, file), 'utf8').split(/\r?\n/);
  const head = lines[0].split('|');
  const rows = new Map();
  for (const line of lines.slice(1)) {
    if (!line.startsWith('0500000US')) continue;   // summary level 050 = county
    const f = line.split('|');
    const rec = {};
    head.forEach((h, i) => { rec[h] = f[i]; });
    rows.set(f[0].slice(9), rec);                  // 5-digit state+county FIPS
  }
  return rows;
}

// Negative values in the summary file are annotation codes, not data.
const num = s => { const v = Number(s); return s === '' || s == null || !Number.isFinite(v) || v < 0 ? null : v; };

const edu = readCounties('acsdt5y2024-b15003.dat');
const inc = readCounties('acsdt5y2024-b19013.dat');

const out_rows = ['GEOID,pct_ba_plus,pop_25_plus,med_hh_inc,med_hh_inc_moe'];
let nullEdu = 0, nullInc = 0;
for (const [geoid, e] of edu) {
  const total = num(e.B15003_E001);
  const ba = ['022', '023', '024', '025'].map(k => num(e[`B15003_E${k}`]));
  const pct = total && ba.every(v => v != null) ? +(100 * ba.reduce((a, b) => a + b, 0) / total).toFixed(1) : null;
  const i = inc.get(geoid) || {};
  const medInc = num(i.B19013_E001), medMoe = num(i.B19013_M001);
  if (pct == null) nullEdu++;
  if (medInc == null) nullInc++;
  out_rows.push([geoid, pct ?? '', total ?? '', medInc ?? '', medMoe ?? ''].join(','));
}
fs.writeFileSync(out, out_rows.join('\n') + '\n');
console.log(`counties: edu=${edu.size} inc=${inc.size} written=${out_rows.length - 1} nullEdu=${nullEdu} nullInc=${nullInc}`);
const onlyInc = [...inc.keys()].filter(k => !edu.has(k));
if (onlyInc.length) console.log('in B19013 but not B15003:', onlyInc.join(' '));
