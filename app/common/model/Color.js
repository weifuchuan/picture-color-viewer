export default class Color {
  static fastLinearRbg(r, g, b) {
    return new Color(delinearize_fast(r), delinearize_fast(g), delinearize_fast(b));
  }

  r;
  g;
  b;

  constructor(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  distanceLuv(c2) {
    let [l1, u1, v1] = this.luv();
    let [l2, u2, v2] = c2.luv();
    return Math.sqrt(sq(l1 - l2) + sq(u1 - u2) + sq(v1 - v2));
  }

  static distanceLuv(c1, c2) {
    return c1.distanceLuv(c2);
  }

  luv() {
    return xyzToLuv(...this.xyz());
  }

  linearRgb() {
    let r = linearize(this.r);
    let g = linearize(this.g);
    let b = linearize(this.b);
    return [r, g, b];
  }

  xyz() {
    return LinearRgbToXyz(...this.linearRgb());
  }
}

function delinearize_fast(v) {
  if (v > 0.2) {
    let v1 = v - 0.6;
    let v2 = v1 * v1;
    let v3 = v2 * v1;
    let v4 = v2 * v2;
    let v5 = v3 * v2;
    return 0.442430344268235 + 0.592178981271708 * v - 0.287864782562636 * v2 + 0.253214392068985 * v3 - 0.272557158129811 * v4 + 0.325554383321718 * v5;
  } else if (v > 0.03) {
    let v1 = v - 0.115;
    let v2 = v1 * v1;
    let v3 = v2 * v1;
    let v4 = v2 * v2;
    let v5 = v3 * v2;
    return 0.194915592891669 + 1.55227076330229 * v - 3.93691860257828 * v2 + 18.0679839248761 * v3 - 101.468750302746 * v4 + 632.341487393927 * v5;
  } else {
    let v1 = v - 0.015;
    let v2 = v1 * v1;
    let v3 = v2 * v1;
    let v4 = v2 * v2;
    let v5 = v3 * v2;
    // You can clearly see from the involved constants that the low-end is highly nonlinear.
    return 0.0519565234928877 + 5.09316778537561 * v - 99.0338180489702 * v2 + 3484.52322764895 * v3 - 150028.083412663 * v4 + 7168008.42971613 * v5;
  }
}

function xyzToLuv(x, y, z) {
  let wref = [0.95047, 1.00000, 1.08883];
  let l, u, v;
  if (y / wref[1] <= 6.0 / 29.0 * 6.0 / 29.0 * 6.0 / 29.0) {
    l = y / wref[1] * 29.0 / 3.0 * 29.0 / 3.0 * 29.0 / 3.0;
  } else {
    l = 1.16 * Math.cbrt(y / wref[1]) - 0.16;
  }
  let [ubis, vbis] = xyz_to_uv(x, y, z);
  let [un, vn] = xyz_to_uv(wref[0], wref[1], wref[2]);
  u = 13.0 * l * (ubis - un);
  v = 13.0 * l * (vbis - vn);
  return [l, u, v];
}

function xyz_to_uv(x, y, z) {
  let denom = x + 15.0 * y + 3.0 * z;
  let u, v;
  if (denom === 0.0) {
    u = v = 0.0;
  } else {
    u = 4.0 * x / denom;
    v = 9.0 * y / denom;
  }
  return [u, v];
}

function linearize(v) {
  if (v <= 0.04045) {
    return v / 12.92;
  }
  return Math.pow((v + 0.055) / 1.055, 2.4);
}

function LinearRgbToXyz(r, g, b) {
  let x = 0.4124564 * r + 0.3575761 * g + 0.1804375 * b;
  let y = 0.2126729 * r + 0.7151522 * g + 0.0721750 * b;
  let z = 0.0193339 * r + 0.1191920 * g + 0.9503041 * b;
  return [x, y, z];
}

function sq(v) {
  return v * v;
}
