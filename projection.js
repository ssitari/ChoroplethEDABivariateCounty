// ============================================================
//  projection.js  —  Albers USA with movable Alaska and Hawaii insets
//
//  The same composite as d3.geoAlbersUsa(): the lower 48 in Albers
//  equal-area conic, Alaska at 0.35 scale and Hawaii at full scale in
//  their own conics, each clipped to its own box. The only difference is
//  that the two insets can be moved, by offsets in units of the projection
//  scale, so they can sit somewhere other than below California and
//  Arizona. With both offsets [0, 0] it draws exactly what geoAlbersUsa
//  draws.
//
//  Implements what app.js needs from a projection: stream (for
//  d3.geoPath), scale, translate, fitExtent and fitSize. There is no
//  invert, so it is not suitable for anything that converts screen
//  positions back to longitude and latitude.
// ============================================================

const EPS = 1e-6;

function multiplex(streams) {
  const each = m => (...args) => streams.forEach(s => s[m](...args));
  return {
    point: each('point'), sphere: each('sphere'),
    lineStart: each('lineStart'), lineEnd: each('lineEnd'),
    polygonStart: each('polygonStart'), polygonEnd: each('polygonEnd'),
  };
}

export function geoAlbersUsaMovable({ alaska: akOff = [0, 0], hawaii: hiOff = [0, 0] } = {}) {
  const lower48 = d3.geoAlbers();
  const alaska  = d3.geoConicEqualArea().rotate([154, 0]).center([-2, 58.5]).parallels([55, 65]);
  const hawaii  = d3.geoConicEqualArea().rotate([157, 0]).center([-3, 19.9]).parallels([8, 18]);
  let k = 1070, t = [480, 250];
  let cache = null, cacheStream = null;

  // Box positions from d3.geoAlbersUsa, in units of the scale k relative
  // to the translate point, shifted by the configured offsets.
  function place() {
    const [x, y] = t;
    const [ax, ay] = akOff, [hx, hy] = hiOff;
    lower48.scale(k).translate(t)
      .clipExtent([[x - 0.455 * k, y - 0.238 * k], [x + 0.455 * k, y + 0.238 * k]]);
    alaska.scale(k * 0.35).translate([x + (ax - 0.307) * k, y + (ay + 0.201) * k])
      .clipExtent([[x + (ax - 0.425) * k + EPS, y + (ay + 0.120) * k + EPS],
                   [x + (ax - 0.214) * k - EPS, y + (ay + 0.234) * k - EPS]]);
    hawaii.scale(k).translate([x + (hx - 0.205) * k, y + (hy + 0.212) * k])
      .clipExtent([[x + (hx - 0.214) * k + EPS, y + (hy + 0.166) * k + EPS],
                   [x + (hx - 0.115) * k - EPS, y + (hy + 0.234) * k - EPS]]);
    cache = cacheStream = null;
  }

  const p = {
    stream(s) {
      if (cache && cacheStream === s) return cache;
      cacheStream = s;
      return cache = multiplex([lower48.stream(s), alaska.stream(s), hawaii.stream(s)]);
    },
    scale(_)     { if (!arguments.length) return k; k = +_; place(); return p; },
    translate(_) { if (!arguments.length) return t; t = [+_[0], +_[1]]; place(); return p; },
    // As d3's fitExtent: measure the object at a reference scale, then scale
    // and centre it in the extent.
    fitExtent(extent, object) {
      p.scale(150).translate([0, 0]);
      const b = d3.geoPath(p).bounds(object);
      const w = extent[1][0] - extent[0][0], h = extent[1][1] - extent[0][1];
      const f = Math.min(w / (b[1][0] - b[0][0]), h / (b[1][1] - b[0][1]));
      const x = +extent[0][0] + (w - f * (b[1][0] + b[0][0])) / 2;
      const y = +extent[0][1] + (h - f * (b[1][1] + b[0][1])) / 2;
      return p.scale(150 * f).translate([x, y]);
    },
    fitSize(size, object) { return p.fitExtent([[0, 0], size], object); },
  };
  place();
  return p;
}
