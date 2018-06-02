"use strict";
exports.__esModule = true;
var Color = /** @class */ (function () {
  function Color(r, g, b) {
    this.r = 0;
    this.g = 0;
    this.b = 0;
    this.r = r;
    this.g = g;
    this.b = b;
  }
  Color.fastLinearRbg = function (r, g, b) {
    return new Color(delinearize_fast(r), delinearize_fast(g), delinearize_fast(b));
  };
  Color.prototype.distanceLuv = function (c2) {
    var _a = this.luv(), l1 = _a[0], u1 = _a[1], v1 = _a[2];
    var _b = c2.luv(), l2 = _b[0], u2 = _b[1], v2 = _b[2];
    return Math.sqrt(sq(l1 - l2) + sq(u1 - u2) + sq(v1 - v2));
  };
  Color.distanceLuv = function (c1, c2) {
    return c1.distanceLuv(c2);
  };
  Color.prototype.luv = function () {
    var _a = this.xyz(), x = _a[0], y = _a[1], z = _a[2];
    var wref = [0.95047, 1.0, 1.08883];
    var l, u, v;
    if (y / wref[1] <= 6.0 / 29.0 * 6.0 / 29.0 * 6.0 / 29.0) {
      l = y / wref[1] * 29.0 / 3.0 * 29.0 / 3.0 * 29.0 / 3.0;
    }
    else {
      l = 1.16 * Math.cbrt(y / wref[1]) - 0.16;
    }
    var _b = xyz_to_uv(x, y, z), ubis = _b[0], vbis = _b[1];
    var _c = xyz_to_uv(wref[0], wref[1], wref[2]), un = _c[0], vn = _c[1];
    u = 13.0 * l * (ubis - un);
    v = 13.0 * l * (vbis - vn);
    return [l, u, v];
  };
  Color.prototype.linearRgb = function () {
    var r = linearize(this.r);
    var g = linearize(this.g);
    var b = linearize(this.b);
    return [r, g, b];
  };
  Color.prototype.xyz = function () {
    var _a = this.linearRgb(), r = _a[0], g = _a[1], b = _a[2];
    return [
      0.4124564 * r + 0.3575761 * g + 0.1804375 * b,
      0.2126729 * r + 0.7151522 * g + 0.072175 * b,
      0.0193339 * r + 0.119192 * g + 0.9503041 * b
    ];
  };
  return Color;
}());
exports["default"] = Color;
function delinearize_fast(v) {
  if (v > 0.2) {
    var v1 = v - 0.6;
    var v2 = v1 * v1;
    var v3 = v2 * v1;
    var v4 = v2 * v2;
    var v5 = v3 * v2;
    return (0.442430344268235 +
      0.592178981271708 * v -
      0.287864782562636 * v2 +
      0.253214392068985 * v3 -
      0.272557158129811 * v4 +
      0.325554383321718 * v5);
  }
  else if (v > 0.03) {
    var v1 = v - 0.115;
    var v2 = v1 * v1;
    var v3 = v2 * v1;
    var v4 = v2 * v2;
    var v5 = v3 * v2;
    return (0.194915592891669 +
      1.55227076330229 * v -
      3.93691860257828 * v2 +
      18.0679839248761 * v3 -
      101.468750302746 * v4 +
      632.341487393927 * v5);
  }
  else {
    var v1 = v - 0.015;
    var v2 = v1 * v1;
    var v3 = v2 * v1;
    var v4 = v2 * v2;
    var v5 = v3 * v2;
    // You can clearly see from the involved constants that the low-end is highly nonlinear.
    return (0.0519565234928877 +
      5.09316778537561 * v -
      99.0338180489702 * v2 +
      3484.52322764895 * v3 -
      150028.083412663 * v4 +
      7168008.42971613 * v5);
  }
}
function xyz_to_uv(x, y, z) {
  var denom = x + 15.0 * y + 3.0 * z;
  var u, v;
  if (denom === 0.0) {
    u = v = 0.0;
  }
  else {
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
function sq(v) {
  return v * v;
}
