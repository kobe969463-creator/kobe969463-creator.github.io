/* 产品图、横幅、工厂插画：全部内联 SVG 现画，不用外链图片 */
(function(){
var uid = 0;
function sh(hex, a){ // a>0 变亮，a<0 变暗（百分比）
  var n = parseInt(hex.slice(1), 16), r = n >> 16, g = n >> 8 & 255, b = n & 255, f = a < 0 ? 0 : 255, p = Math.abs(a) / 100;
  r = Math.round(r + (f - r) * p); g = Math.round(g + (f - g) * p); b = Math.round(b + (f - b) * p);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}
function lum(hex){ var n = parseInt(hex.slice(1), 16); return ((n >> 16) * .3 + (n >> 8 & 255) * .59 + (n & 255) * .11) / 255; }
function weave(id, c){
  return '<pattern id="' + id + '" width="9" height="9" patternUnits="userSpaceOnUse"><rect width="9" height="9" fill="' + c + '"/>' +
    '<path d="M0 2.2h4.5M4.5 6.7h4.5" stroke="' + sh(c, 22) + '" stroke-width="2.4"/><path d="M4.5 0v4.5M0 4.5v4.5M9 4.5v4.5" stroke="' + sh(c, -22) + '" stroke-width="1.2"/></pattern>';
}
function glow(id, k){ return '<radialGradient id="' + id + '"><stop offset="0" stop-color="' + k + '" stop-opacity=".95"/><stop offset=".35" stop-color="' + k + '" stop-opacity=".45"/><stop offset="1" stop-color="' + k + '" stop-opacity="0"/></radialGradient>'; }
function panel(x, y, w, h, skew){ // 太阳能板
  var s = skew || 0, d = 'M' + (x + s) + ' ' + y + 'h' + w + 'l' + (-s) + ' ' + h + 'h' + (-w) + 'z', g = '';
  for (var i = 1; i < 4; i++) { var px = x + s + w * i / 4; g += '<path d="M' + px + ' ' + y + 'l' + (-s) + ' ' + h + '" stroke="#5b79b8" stroke-width=".8"/>'; }
  g += '<path d="M' + (x + s / 2) + ' ' + (y + h / 2) + 'h' + w + '" stroke="#5b79b8" stroke-width=".8"/>';
  return '<path d="' + d + '" fill="#1d2a4c" stroke="#9aa3b5" stroke-width="1.2"/>' + g;
}

var S = {};
S.sofa = function(c, k, id){
  return {d: weave(id + 'w', c), f: [128, 150], box: [64, 92, 336, 236], b:
    '<rect x="86" y="100" width="228" height="70" rx="14" fill="url(#' + id + 'w)"/>' +
    '<rect x="80" y="160" width="240" height="64" rx="10" fill="url(#' + id + 'w)"/>' +
    '<rect x="64" y="132" width="34" height="96" rx="12" fill="url(#' + id + 'w)" stroke="' + sh(c, -25) + '" stroke-width="1"/>' +
    '<rect x="302" y="132" width="34" height="96" rx="12" fill="url(#' + id + 'w)" stroke="' + sh(c, -25) + '" stroke-width="1"/>' +
    '<rect x="98" y="92" width="100" height="66" rx="16" fill="' + k + '" stroke="' + sh(k, -14) + '"/><rect x="202" y="92" width="100" height="66" rx="16" fill="' + k + '" stroke="' + sh(k, -14) + '"/>' +
    '<rect x="96" y="150" width="102" height="30" rx="9" fill="' + sh(k, -5) + '" stroke="' + sh(k, -16) + '"/><rect x="202" y="150" width="102" height="30" rx="9" fill="' + sh(k, -5) + '" stroke="' + sh(k, -16) + '"/>' +
    '<rect x="112" y="108" width="40" height="36" rx="10" fill="#c46a43" transform="rotate(-9 132 126)"/><rect x="250" y="110" width="36" height="32" rx="9" fill="#8e9f86" transform="rotate(7 268 126)"/>' +
    '<rect x="88" y="224" width="10" height="12" rx="2" fill="' + sh(c, -40) + '"/><rect x="302" y="224" width="10" height="12" rx="2" fill="' + sh(c, -40) + '"/>'};
};
S.sofa2 = function(c, k, id){
  var w = 'url(#' + id + 'w)', e = sh(k, -15);
  return {d: weave(id + 'w', c), f: [300, 190], box: [36, 96, 362, 240], b:
    '<rect x="50" y="104" width="300" height="66" rx="12" fill="' + w + '"/><rect x="50" y="160" width="300" height="62" rx="10" fill="' + w + '"/>' +
    '<rect x="36" y="134" width="30" height="92" rx="11" fill="' + w + '" stroke="' + sh(c, -25) + '"/>' +
    '<rect x="62" y="96" width="88" height="62" rx="15" fill="' + k + '" stroke="' + e + '"/><rect x="154" y="96" width="88" height="62" rx="15" fill="' + k + '" stroke="' + e + '"/><rect x="246" y="96" width="92" height="62" rx="15" fill="' + k + '" stroke="' + e + '"/>' +
    '<rect x="64" y="152" width="90" height="26" rx="8" fill="' + sh(k, -5) + '" stroke="' + e + '"/><rect x="158" y="152" width="90" height="26" rx="8" fill="' + sh(k, -5) + '" stroke="' + e + '"/>' +
    '<rect x="252" y="174" width="110" height="62" rx="10" fill="' + w + '" stroke="' + sh(c, -25) + '"/><rect x="258" y="166" width="98" height="30" rx="9" fill="' + sh(k, -3) + '" stroke="' + e + '"/>' +
    '<rect x="80" y="112" width="38" height="34" rx="9" fill="#2e3d5c" transform="rotate(-8 99 129)"/><rect x="290" y="110" width="36" height="32" rx="9" fill="#c46a43" transform="rotate(6 308 126)"/>' +
    '<rect x="58" y="222" width="9" height="12" fill="' + sh(c, -40) + '"/><rect x="262" y="236" width="9" height="5" fill="' + sh(c, -40) + '"/><rect x="346" y="236" width="9" height="5" fill="' + sh(c, -40) + '"/>'};
};
S.dining = function(c, k, id){
  var m = '#3b3d42', top = '', i;
  for (i = 0; i < 6; i++) top += '<rect x="' + (112 + i * 30) + '" y="148" width="28" height="11" fill="' + (i % 2 ? c : sh(c, 6)) + '"/>';
  function chair(x, dir){
    var bx = dir > 0 ? x : x + 52, fx = dir > 0 ? x + 54 : x - 2;
    return '<rect x="' + bx + '" y="110" width="10" height="128" rx="3" fill="' + m + '"/><rect x="' + Math.min(x, x) + '" y="178" width="64" height="10" rx="3" fill="' + m + '"/>' +
      '<rect x="' + fx + '" y="186" width="9" height="52" rx="2" fill="' + m + '"/><rect x="' + x + '" y="148" width="62" height="6" rx="3" fill="' + m + '"/>' +
      '<rect x="' + (x + 4) + '" y="168" width="56" height="11" rx="5" fill="' + k + '"/>' +
      '<rect x="' + (dir > 0 ? bx + 2 : bx - 4) + '" y="118" width="12" height="52" rx="5" fill="' + sh(k, -6) + '"/>';
  }
  return {d: '', f: [200, 152], box: [36, 104, 364, 238], b:
    '<rect x="166" y="112" width="68" height="40" rx="5" fill="' + m + '"/>' +
    '<rect x="174" y="118" width="52" height="6" fill="' + c + '"/><rect x="174" y="128" width="52" height="6" fill="' + c + '"/><rect x="174" y="138" width="52" height="6" fill="' + c + '"/>' +
    top + '<rect x="110" y="146" width="182" height="15" rx="3" fill="none" stroke="' + sh(c, -25) + '"/>' +
    '<rect x="126" y="161" width="9" height="77" fill="' + m + '"/><rect x="266" y="161" width="9" height="77" fill="' + m + '"/><rect x="126" y="200" width="149" height="6" fill="' + m + '"/>' +
    '<path d="M193 146c0-12 3-20 7-20s7 8 7 20z" fill="#e9e7e1" stroke="#c9c4ba"/><circle cx="196" cy="118" r="7" fill="#8e9f86"/><circle cx="205" cy="114" r="8" fill="#7d9375"/><circle cx="201" cy="122" r="6" fill="#9fb096"/>' +
    chair(40, 1) + chair(296, -1)};
};
S.bistro = function(c, k, id){
  function ch(m){ // m=1 左，m=-1 右
    function X(x){ return m > 0 ? x : 400 - x; }
    return '<path d="M' + X(84) + ' 178 L' + X(78) + ' 110 Q' + X(100) + ' 94 ' + X(124) + ' 108 L' + X(126) + ' 160" fill="none" stroke="' + c + '" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M' + X(86) + ' 124 Q' + X(102) + ' 114 ' + X(120) + ' 122M' + X(87) + ' 140 Q' + X(102) + ' 131 ' + X(121) + ' 138" fill="none" stroke="' + c + '" stroke-width="4"/>' +
      '<path d="M' + X(88) + ' 182 L' + X(80) + ' 238M' + X(134) + ' 182 L' + X(142) + ' 238M' + X(108) + ' 184 L' + X(110) + ' 236" stroke="' + c + '" stroke-width="5" stroke-linecap="round"/>' +
      '<ellipse cx="' + X(111) + '" cy="179" rx="34" ry="8" fill="' + c + '"/><ellipse cx="' + X(111) + '" cy="173" rx="30" ry="6.5" fill="' + k + '" stroke="' + sh(k, -15) + '"/>';
  }
  return {d: '', f: [200, 160], box: [76, 94, 324, 240], b:
    ch(1) + ch(-1) +
    '<path d="M200 156 V232" stroke="' + c + '" stroke-width="7"/><path d="M172 236 Q200 222 228 236" fill="none" stroke="' + c + '" stroke-width="6" stroke-linecap="round"/>' +
    '<ellipse cx="200" cy="152" rx="62" ry="12" fill="' + sh(c, -12) + '"/><ellipse cx="200" cy="148" rx="62" ry="11" fill="' + c + '"/>' +
    '<path d="M186 146 q2-14 14-14 q12 0 14 14z" fill="#fff" stroke="#d8d3c8"/><path d="M211 138 q8 0 8 5 q0 5-8 4" fill="none" stroke="#d8d3c8" stroke-width="2"/>'};
};
S.lounger = function(c, k, id){
  var f = '#5a5d63';
  return {d: '', f: [120, 170], box: [66, 112, 318, 240], b:
    '<path d="M104 200 H312" stroke="' + f + '" stroke-width="8" stroke-linecap="round"/><path d="M112 200 L70 118" stroke="' + f + '" stroke-width="8" stroke-linecap="round"/>' +
    '<path d="M128 202 V236M292 202 V226" stroke="' + f + '" stroke-width="7" stroke-linecap="round"/><path d="M118 174 L150 200" stroke="' + f + '" stroke-width="5"/>' +
    '<circle cx="298" cy="230" r="9" fill="#2f3135"/><circle cx="298" cy="230" r="3.5" fill="#9a9ca1"/>' +
    '<path d="M76 126 L116 192 L304 192" fill="none" stroke="' + sh(c, -18) + '" stroke-width="18" stroke-linejoin="round" stroke-linecap="round"/>' +
    '<path d="M76 126 L116 192 L304 192" fill="none" stroke="' + c + '" stroke-width="13" stroke-linejoin="round" stroke-linecap="round"/>' +
    '<path d="M76 126 L116 192 L304 192" fill="none" stroke="' + sh(c, -10) + '" stroke-width="1" stroke-dasharray="3 4"/>' +
    '<rect x="70" y="112" width="34" height="18" rx="9" fill="' + k + '" transform="rotate(62 87 121)"/><path d="M236 186 l18 -18" stroke="#c46a43" stroke-width="0"/>'};
};
S.swing = function(c, k, id){
  var st = '#3b3d42';
  return {d: weave(id + 'w', c), f: [215, 150], box: [140, 38, 306, 244], b:
    '<ellipse cx="226" cy="238" rx="78" ry="8" fill="' + st + '"/><path d="M286 236 V78 Q286 42 252 42 H216" fill="none" stroke="' + st + '" stroke-width="9" stroke-linecap="round"/>' +
    '<path d="M216 42 V74" stroke="#7a7c82" stroke-width="3" stroke-dasharray="4 2"/>' +
    '<path d="M216 74 C150 80 140 168 160 204 C176 232 256 232 272 204 C292 168 282 80 216 74 Z" fill="url(#' + id + 'w)" stroke="' + sh(c, -30) + '" stroke-width="1.5"/>' +
    '<path d="M216 98 C174 104 170 166 182 194 L250 194 C262 166 258 104 216 98 Z" fill="' + sh(c, -38) + '"/>' +
    '<rect x="190" y="116" width="52" height="44" rx="15" fill="' + sh(k, -4) + '" stroke="' + sh(k, -16) + '"/>' +
    '<ellipse cx="216" cy="192" rx="44" ry="13" fill="' + k + '" stroke="' + sh(k, -16) + '"/>'};
};
S.umbrella = function(c, k, id){
  var p = '#55575c', ribs = '', i;
  for (i = 0; i <= 6; i++) { var x = 70 + i * 43.3; ribs += '<path d="M196 62 Q' + ((196 + x) / 2) + ' ' + (i === 0 || i === 6 ? 70 : 60) + ' ' + x + ' 118" fill="none" stroke="' + sh(c, -18) + '" stroke-width="1.2"/>'; }
  var sc = '';
  for (i = 0; i < 6; i++) { var a = 330 - i * 43.3; sc += ' Q' + (a - 21.6) + ' 130 ' + (a - 43.3) + ' 118'; }
  return {d: '', f: [196, 90], box: [68, 36, 352, 242], b:
    '<path d="M250 236 H350M300 226 V242" stroke="' + p + '" stroke-width="10" stroke-linecap="round"/><rect x="296" y="62" width="9" height="170" rx="3" fill="' + p + '"/>' +
    '<path d="M300 66 Q252 36 198 60" fill="none" stroke="' + p + '" stroke-width="6" stroke-linecap="round"/><path d="M300 150 l-28 18" stroke="' + p + '" stroke-width="4"/>' +
    '<path d="M70 118 Q196 18 330 118' + sc + ' Z" fill="' + c + '" stroke="' + sh(c, -22) + '" stroke-width="1.2"/>' +
    ribs + '<circle cx="196" cy="58" r="6" fill="' + sh(c, -30) + '"/>'};
};
S.chair = function(c, k, id){
  var d = sh(c, -22), sl = '';
  [100, 122, 144].forEach(function(y){ sl += '<rect x="138" y="' + y + '" width="128" height="15" rx="4" fill="' + c + '" stroke="' + d + '"/>'; });
  return {d: '', f: [200, 140], box: [128, 84, 272, 240], b:
    '<rect x="140" y="86" width="12" height="152" rx="4" fill="' + d + '"/><rect x="252" y="86" width="12" height="152" rx="4" fill="' + d + '"/>' + sl +
    '<path d="M150 236 L250 186M250 236 L150 186" stroke="' + sh(c, -35) + '" stroke-width="5" stroke-linecap="round"/>' +
    '<rect x="130" y="168" width="144" height="18" rx="5" fill="' + sh(c, 8) + '" stroke="' + d + '"/><path d="M152 172h100M152 180h100" stroke="' + d + '" stroke-width=".8"/>' +
    '<circle cx="146" cy="177" r="3" fill="#c7a25a"/><circle cx="258" cy="177" r="3" fill="#c7a25a"/>'};
};
S.string = function(c, k, id){
  var b = '', i, multi = c === '#e46a8c', pal = ['#ff8a8a', '#ffd36b', '#7fd6a0', '#7fb6ff', '#d59bff'];
  function strand(y0, y1, n, o){
    var s = '<path d="M8 ' + y0 + ' Q200 ' + y1 + ' 392 ' + y0 + '" fill="none" stroke="#2a2a2a" stroke-width="2"/>';
    for (i = 1; i < n; i++) {
      var t = i / n, x = (1 - t) * (1 - t) * 8 + 2 * (1 - t) * t * 200 + t * t * 392, y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * y1 + t * t * y0;
      var col = multi ? pal[(i + o) % pal.length] : c;
      s += '<circle cx="' + x + '" cy="' + (y + 16) + '" r="22" fill="url(#' + id + (multi ? 'g' + ((i + o) % pal.length) : 'g') + ')"/>' +
        '<rect x="' + (x - 3) + '" y="' + (y + 1) + '" width="6" height="7" rx="1.5" fill="#222"/><ellipse cx="' + x + '" cy="' + (y + 16) + '" rx="6.5" ry="9" fill="' + col + '"/><ellipse cx="' + (x - 2) + '" cy="' + (y + 13) + '" rx="2" ry="3.5" fill="#fff" opacity=".7"/>';
    }
    return s;
  }
  var defs = glow(id + 'g', c); if (multi) pal.forEach(function(p, j){ defs += glow(id + 'g' + j, p); });
  return {d: defs, f: [200, 128], box: [8, 50, 392, 240], b:
    strand(56, 176, 12, 0) + strand(112, 232, 10, 2) +
    '<path d="M352 240 V196" stroke="#555" stroke-width="3"/>' + panel(332, 180, 40, 22, 6)};
};
function stake(x, by, s, c, k, id){
  var h = 120 * s, w = 14 * s;
  return '<ellipse cx="' + x + '" cy="' + by + '" rx="' + 42 * s + '" ry="' + 9 * s + '" fill="url(#' + id + 'g)"/>' +
    '<rect x="' + (x - w / 2) + '" y="' + (by - h) + '" width="' + w + '" height="' + h + '" fill="' + c + '" stroke="' + sh(c, -25) + '"/>' +
    '<circle cx="' + x + '" cy="' + (by - h - 24 * s) + '" r="' + 46 * s + '" fill="url(#' + id + 'g)"/>' +
    '<rect x="' + (x - 18 * s) + '" y="' + (by - h - 48 * s) + '" width="' + 36 * s + '" height="' + 48 * s + '" rx="' + 6 * s + '" fill="' + k + '" stroke="' + sh(c, -10) + '" stroke-width="' + 2 * s + '"/>' +
    '<path d="M' + (x - 26 * s) + ' ' + (by - h - 48 * s) + 'h' + 52 * s + 'l-' + 6 * s + ' -' + 10 * s + 'h-' + 40 * s + 'z" fill="' + sh(c, -15) + '"/>' +
    panel(x - 17 * s, by - h - 60 * s, 30 * s, 9 * s, 4 * s);
}
S.path = function(c, k, id){
  return {d: glow(id + 'g', k), f: [200, 120], box: [90, 60, 330, 244], b:
    stake(118, 214, .62, c, k, id) + stake(300, 222, .78, c, k, id) + stake(205, 240, 1, c, k, id)};
};
S.spot = function(c, k, id){
  return {d: glow(id + 'g', k) + '<linearGradient id="' + id + 'b" x1="1" y1="1" x2="0" y2="0"><stop offset="0" stop-color="' + k + '" stop-opacity=".75"/><stop offset="1" stop-color="' + k + '" stop-opacity="0"/></linearGradient>', f: [230, 170], box: [70, 40, 300, 244], b:
    '<path d="M214 168 L70 40 L150 30 Z" fill="url(#' + id + 'b)"/>' +
    '<circle cx="128" cy="96" r="44" fill="#8e9f86"/><circle cx="98" cy="70" r="30" fill="#9fb096"/><circle cx="156" cy="66" r="32" fill="#7d9375"/><path d="M126 130 V240" stroke="#6b4a35" stroke-width="10"/>' +
    '<path d="M232 240 V194" stroke="' + sh(c, -20) + '" stroke-width="6"/>' +
    '<g transform="rotate(-42 232 186)"><rect x="214" y="150" width="36" height="52" rx="8" fill="' + c + '" stroke="' + sh(c, -28) + '"/><ellipse cx="232" cy="151" rx="18" ry="6" fill="' + k + '"/></g>' +
    '<path d="M240 194 l26 -6" stroke="#666" stroke-width="2"/>' + panel(258, 172, 38, 20, 5) + '<path d="M276 194 V240" stroke="#555" stroke-width="3"/>'};
};
S.lantern = function(c, k, id){
  return {d: glow(id + 'g', k) + '<pattern id="' + id + 'p" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 6h12M6 0v12" stroke="' + c + '" stroke-width="4.5"/></pattern>', f: [200, 140], box: [146, 24, 254, 226], b:
    '<path d="M200 24 V58" stroke="#3a3a3a" stroke-width="2"/><circle cx="200" cy="24" r="6" fill="none" stroke="#3a3a3a" stroke-width="2.5"/>' +
    '<circle cx="200" cy="150" r="80" fill="url(#' + id + 'g)"/>' +
    '<rect x="152" y="80" width="96" height="128" rx="40" fill="' + k + '"/><rect x="152" y="80" width="96" height="128" rx="40" fill="url(#' + id + 'p)" stroke="' + sh(c, -25) + '" stroke-width="2"/>' +
    '<path d="M164 80 L176 60 H224 L236 80 Z" fill="' + sh(c, -35) + '"/><rect x="160" y="204" width="80" height="14" rx="5" fill="' + sh(c, -35) + '"/>' +
    '<ellipse cx="200" cy="232" rx="60" ry="7" fill="' + k + '" opacity=".35"/>'};
};
S.wall = function(c, k, id){
  var br = '', y, x;
  for (y = 30; y < 250; y += 22) for (x = (y / 22 % 2 ? 100 : 122); x < 300; x += 44) br += '<rect x="' + x + '" y="' + y + '" width="42" height="20" fill="#d8cdbd" stroke="#c8bba7"/>';
  return {d: '<linearGradient id="' + id + 'c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + k + '" stop-opacity=".85"/><stop offset="1" stop-color="' + k + '" stop-opacity="0"/></linearGradient><clipPath id="' + id + 'k"><rect x="100" y="30" width="200" height="214" rx="6"/></clipPath>',
    f: [200, 128], box: [100, 30, 300, 244], b:
    '<g clip-path="url(#' + id + 'k)">' + br + '</g>' +
    '<path d="M166 160 H234 L300 244 H100 Z" fill="url(#' + id + 'c)"/>' +
    panel(150, 72, 92, 26, 8) +
    '<rect x="160" y="98" width="80" height="62" rx="9" fill="' + c + '" stroke="' + sh(c, -30) + '"/><rect x="168" y="106" width="64" height="34" rx="5" fill="' + k + '"/>' +
    '<path d="M174 112h52M174 120h52M174 128h52" stroke="' + sh(k, -14) + '" stroke-dasharray="3 3"/><circle cx="200" cy="150" r="6" fill="#f2f2f2" stroke="#999"/>'};
};
S.flood = function(c, k, id){
  var dots = '', i, j;
  for (i = 0; i < 6; i++) for (j = 0; j < 4; j++) dots += '<circle cx="' + (92 + i * 17) + '" cy="' + (134 + j * 16) + '" r="4.5" fill="#fffbe6"/>';
  return {d: glow(id + 'g', k), f: [130, 150], box: [62, 70, 356, 240], b:
    '<circle cx="134" cy="160" r="110" fill="url(#' + id + 'g)"/>' +
    '<path d="M100 214 Q134 246 168 214" fill="none" stroke="' + sh(c, -20) + '" stroke-width="7"/><path d="M134 236 V244" stroke="' + sh(c, -20) + '" stroke-width="8"/>' +
    '<rect x="74" y="116" width="120" height="96" rx="10" fill="' + c + '" stroke="' + sh(c, -30) + '"/><rect x="82" y="124" width="104" height="80" rx="6" fill="' + k + '"/>' + dots +
    '<path d="M194 190 C236 200 230 238 270 232" fill="none" stroke="#2c2c2c" stroke-width="2.5"/>' +
    panel(232, 76, 112, 70, 12) + '<path d="M290 146 V238M268 238 H312" stroke="#555" stroke-width="5" stroke-linecap="round"/>'};
};
S.lamp = function(c, k, id){
  return {d: glow(id + 'g', k), f: [200, 120], box: [126, 56, 274, 240], b:
    '<ellipse cx="200" cy="150" rx="92" ry="44" fill="url(#' + id + 'g)"/>' +
    '<ellipse cx="200" cy="232" rx="50" ry="9" fill="' + sh(c, -14) + '"/><rect x="192" y="128" width="16" height="104" rx="4" fill="' + c + '" stroke="' + sh(c, -22) + '"/>' +
    '<ellipse cx="200" cy="134" rx="62" ry="9" fill="' + k + '"/>' +
    '<path d="M134 134 Q134 62 200 58 Q266 62 266 134 Z" fill="' + c + '" stroke="' + sh(c, -22) + '"/>' +
    '<path d="M176 70 Q200 60 224 70 L218 84 Q200 78 182 84 Z" fill="#1d2a4c" stroke="#9aa3b5"/>'};
};
S.bed = function(c, k, id){
  return {d: '', f: [130, 176], box: [66, 136, 334, 242], b:
    '<ellipse cx="200" cy="192" rx="132" ry="50" fill="' + sh(c, -10) + '"/>' +
    '<ellipse cx="200" cy="186" rx="130" ry="48" fill="' + c + '"/>' +
    '<ellipse cx="200" cy="186" rx="124" ry="44" fill="none" stroke="' + sh(c, 18) + '" stroke-width="10" stroke-dasharray="1.5 7" stroke-linecap="round"/>' +
    '<ellipse cx="200" cy="184" rx="86" ry="27" fill="' + sh(c, -16) + '"/><ellipse cx="200" cy="189" rx="80" ry="22" fill="' + sh(c, 6) + '"/>' +
    '<ellipse cx="200" cy="189" rx="72" ry="18" fill="none" stroke="' + sh(c, 16) + '" stroke-width="6" stroke-dasharray="1 6" stroke-linecap="round"/>'};
};
S.cot = function(c, k, id){
  var f = '#3b3d42';
  return {d: '<pattern id="' + id + 'm" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="' + c + '"/><circle cx="3" cy="3" r="1.2" fill="' + sh(c, -25) + '"/></pattern>', f: [200, 172], box: [64, 144, 336, 242], b:
    '<path d="M100 196 V236M300 196 V236M122 160 V214M282 160 V214" stroke="' + f + '" stroke-width="6" stroke-linecap="round"/>' +
    '<path d="M92 150 H308 L332 196 H68 Z" fill="url(#' + id + 'm)" stroke="' + f + '" stroke-width="7" stroke-linejoin="round"/>' +
    '<rect x="90" y="232" width="22" height="7" rx="3" fill="#222"/><rect x="290" y="232" width="22" height="7" rx="3" fill="#222"/>'};
};
S.house = function(c, k, id){
  var pl = '', y, sg = '';
  for (y = 144; y < 224; y += 14) pl += '<path d="M112 ' + y + ' H288" stroke="' + sh(c, -18) + '"/>';
  for (y = 0; y < 5; y++) sg += '<path d="M' + (116 + y * 8) + ' ' + (122 - y * 12) + ' H' + (284 - y * 8) + '" stroke="' + sh(k, -20) + '" stroke-width="1.2"/>';
  return {d: '', f: [200, 170], box: [92, 60, 308, 240], b:
    '<rect x="100" y="222" width="200" height="14" rx="2" fill="' + sh(c, -35) + '"/>' +
    '<rect x="110" y="130" width="180" height="94" fill="' + c + '" stroke="' + sh(c, -25) + '"/>' + pl +
    '<path d="M92 138 L200 62 L308 138 Z" fill="' + k + '" stroke="' + sh(k, -25) + '" stroke-width="2"/>' + sg +
    '<path d="M170 224 V178 A30 30 0 0 1 230 178 V224 Z" fill="#2f241c"/><path d="M178 186 V224M188 180 V224M198 178 V224M208 178 V224M218 180 V224" stroke="#4a3a2e" stroke-width="2"/>' +
    '<rect x="182" y="140" width="36" height="12" rx="2" fill="' + sh(c, 25) + '"/>'};
};
S.cathouse = function(c, k, id){
  return {d: '', f: [180, 190], box: [110, 112, 306, 244], b:
    '<rect x="128" y="230" width="12" height="10" fill="#333"/><rect x="270" y="230" width="12" height="10" fill="#333"/>' +
    '<rect x="122" y="140" width="166" height="92" rx="6" fill="' + c + '" stroke="' + sh(c, -25) + '"/>' +
    '<path d="M122 156 H288M122 172 H288M122 188 H288M122 204 H288M122 220 H288" stroke="' + sh(c, -12) + '"/>' +
    '<path d="M110 146 L128 116 H304 L306 146 Z" fill="' + sh(c, -30) + '"/>' +
    '<circle cx="176" cy="192" r="24" fill="#2b2622"/><circle cx="252" cy="182" r="14" fill="#2b2622"/>' +
    '<path d="M166 214 c2-6 6-8 10-8s8 2 10 8" fill="none" stroke="' + sh(c, 20) + '" stroke-width="3"/>'};
};
S.feeder = function(c, k, id){
  var ln = '', x;
  for (x = 122; x < 290; x += 14) ln += '<path d="M' + x + ' 152 V204" stroke="' + sh(c, -14) + '" stroke-width="1.2"/>';
  return {d: '<linearGradient id="' + id + 's" x1="0" x2="1"><stop offset="0" stop-color="#9ea2a9"/><stop offset=".5" stop-color="#f1f2f4"/><stop offset="1" stop-color="#9ea2a9"/></linearGradient>', f: [160, 150], box: [104, 136, 296, 240], b:
    '<rect x="118" y="200" width="20" height="38" rx="3" fill="' + sh(c, -12) + '"/><rect x="262" y="200" width="20" height="38" rx="3" fill="' + sh(c, -12) + '"/>' +
    '<rect x="108" y="148" width="184" height="58" rx="7" fill="' + c + '" stroke="' + sh(c, -24) + '"/>' + ln +
    '<ellipse cx="160" cy="150" rx="34" ry="10" fill="url(#' + id + 's)"/><ellipse cx="160" cy="148" rx="27" ry="7" fill="#7b5236"/>' +
    '<circle cx="152" cy="147" r="2.5" fill="#a87348"/><circle cx="162" cy="146" r="2.5" fill="#a87348"/><circle cx="170" cy="149" r="2.5" fill="#a87348"/>' +
    '<ellipse cx="240" cy="150" rx="34" ry="10" fill="url(#' + id + 's)"/><ellipse cx="240" cy="148" rx="27" ry="7" fill="#a9d4ec"/>'};
};
S.cattree = function(c, k, id){
  return {d: '<pattern id="' + id + 's" width="8" height="5" patternUnits="userSpaceOnUse"><rect width="8" height="5" fill="#d8c39a"/><path d="M0 4 L8 1" stroke="#b9a073" stroke-width="1.2"/></pattern>', f: [260, 90], box: [88, 56, 316, 242], b:
    '<rect x="88" y="226" width="226" height="14" rx="5" fill="' + c + '" stroke="' + sh(c, -20) + '"/>' +
    '<rect x="132" y="112" width="18" height="114" fill="url(#' + id + 's)"/><rect x="252" y="76" width="18" height="150" fill="url(#' + id + 's)"/><rect x="186" y="164" width="16" height="62" fill="url(#' + id + 's)"/>' +
    '<rect x="200" y="172" width="112" height="54" rx="6" fill="' + c + '" stroke="' + sh(c, -20) + '"/><circle cx="246" cy="200" r="16" fill="' + sh(c, -55) + '"/>' +
    '<path d="M150 146 Q200 178 252 146" fill="none" stroke="' + sh(c, -10) + '" stroke-width="9" stroke-linecap="round"/>' +
    '<rect x="96" y="102" width="96" height="13" rx="5" fill="' + c + '" stroke="' + sh(c, -20) + '"/>' +
    '<rect x="206" y="66" width="106" height="14" rx="6" fill="' + c + '" stroke="' + sh(c, -20) + '"/><path d="M212 66 Q259 46 306 66" fill="' + sh(c, 10) + '" stroke="' + sh(c, -20) + '"/>' +
    '<path d="M110 115 V140" stroke="#888" stroke-width="1.5"/><circle cx="110" cy="146" r="7" fill="#c46a43"/>'};
};
S.playpen = function(c, k, id){
  var n = 8, pts = [], i, back = '', front = '', h = 92;
  for (i = 0; i < n; i++) { var a = Math.PI * 2 * i / n + Math.PI / 8; pts.push([200 + 150 * Math.cos(a), 196 + 42 * Math.sin(a)]); }
  for (i = 0; i < n; i++) {
    var p = pts[i], q = pts[(i + 1) % n], bars = '', j, isBack = (p[1] + q[1]) / 2 < 196;
    for (j = 1; j < 8; j++) { var x = p[0] + (q[0] - p[0]) * j / 8, y = p[1] + (q[1] - p[1]) * j / 8; bars += 'M' + x + ' ' + y + 'v' + (-h); }
    var g = '<path d="' + bars + '" stroke="' + c + '" stroke-width="1.6"/><path d="M' + p[0] + ' ' + (p[1] - h) + 'L' + q[0] + ' ' + (q[1] - h) + 'M' + p[0] + ' ' + p[1] + 'L' + q[0] + ' ' + q[1] + 'M' + p[0] + ' ' + (p[1] - h / 2) + 'L' + q[0] + ' ' + (q[1] - h / 2) + '" stroke="' + c + '" stroke-width="3"/>' +
      '<path d="M' + p[0] + ' ' + (p[1] + 4) + 'v' + (-h - 8) + '" stroke="' + c + '" stroke-width="4" stroke-linecap="round"/>';
    if (isBack) back += g; else front += g;
  }
  return {d: '', f: [200, 190], box: [50, 96, 350, 242], b:
    '<ellipse cx="200" cy="196" rx="150" ry="42" fill="#9fb58f" opacity=".45"/><g opacity=".55">' + back + '</g>' + front};
};

function bg(view, cat, id){
  if (view === 'scene') {
    if (cat === 'lighting') return '<linearGradient id="' + id + 'sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b2645"/><stop offset=".6" stop-color="#5b4a6e"/><stop offset="1" stop-color="#d98f5f"/></linearGradient>|' +
      '<rect width="400" height="300" fill="url(#' + id + 'sky)"/><circle cx="60" cy="40" r="1.4" fill="#fff"/><circle cx="130" cy="22" r="1" fill="#fff"/><circle cx="330" cy="34" r="1.3" fill="#fff"/><circle cx="250" cy="18" r="1" fill="#fff"/>' +
      '<path d="M0 200 Q100 176 200 194 T400 186 V300 H0Z" fill="#2c3a33"/><rect y="236" width="400" height="64" fill="#24302a"/>';
    return '<linearGradient id="' + id + 'sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe3ee"/><stop offset="1" stop-color="#f4ede1"/></linearGradient>|' +
      '<rect width="400" height="300" fill="url(#' + id + 'sky)"/><path d="M0 178 Q60 150 120 170 T240 160 T400 168 V230 H0Z" fill="#9db394"/><path d="M0 196 Q80 176 160 192 T400 186 V236 H0Z" fill="#7f9a78"/>' +
      '<rect y="228" width="400" height="72" fill="#c49a6c"/><path d="M0 244 H400M0 262 H400M0 282 H400" stroke="#a97f55" stroke-width="2"/>' +
      '<path d="M14 236 l6 -34 h36 l6 34z" fill="#c46a43"/><ellipse cx="38" cy="190" rx="20" ry="16" fill="#6f8c66"/><ellipse cx="26" cy="176" rx="12" ry="18" fill="#7d9a72"/><ellipse cx="50" cy="172" rx="11" ry="20" fill="#5f7d58"/>';
  }
  if (view === 'dim') return '<pattern id="' + id + 'grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#eceef2"/></pattern>|<rect width="400" height="300" fill="#fff"/><rect width="400" height="300" fill="url(#' + id + 'grid)"/>';
  return '<linearGradient id="' + id + 'bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7f4ef"/><stop offset="1" stop-color="#e9e3d8"/></linearGradient><radialGradient id="' + id + 'sh"><stop offset="0" stop-color="#000" stop-opacity=".16"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>|' +
    '<rect width="400" height="300" fill="url(#' + id + 'bg)"/><ellipse cx="200" cy="240" rx="170" ry="16" fill="url(#' + id + 'sh)"/>';
}
function fmtDim(mm){ return mm >= 10000 ? (mm / 1000) + ' m' : mm + ' mm'; }

/* view: main | scene | detail | dim */
window.productArt = function(p, colorKey, view){
  var id = 'a' + (uid++), c = (window.COLORS[colorKey] || window.COLORS[p.colors[0]]).hex;
  var s = S[p.shape](c, p.cushion, id), b = bg(view || 'main', p.cat, id).split('|');
  var body = s.b, extra = '';
  if (view === 'detail') body = '<g transform="translate(200 150) scale(2.3) translate(' + (-s.f[0]) + ' ' + (-s.f[1]) + ')">' + s.b + '</g>';
  else if (view === 'scene') body = '<g transform="translate(200 240) scale(.86) translate(-200 -240)">' + s.b + '</g>';
  else if (view === 'dim') {
    var x0 = s.box[0], y0 = s.box[1], x1 = s.box[2], y1 = Math.min(s.box[3], 242), W = p.dims[0], H = p.dims[2];
    body = '<g transform="translate(176 150) scale(.78) translate(-200 -150)" opacity=".92">' + s.b + '</g>';
    var tx = function(x){ return 176 + (x - 200) * .78; }, ty = function(y){ return 150 + (y - 150) * .78; };
    var a0 = tx(x0), a1 = tx(x1), b0 = ty(y0), b1 = ty(y1), ly = b1 + 22, lx = a1 + 22, col = '#3f5cf3';
    extra = '<g stroke="' + col + '" stroke-width="1.3" fill="' + col + '" font-family="General Sans,Arial,sans-serif" font-size="12" font-weight="600">' +
      '<path d="M' + a0 + ' ' + (b1 + 8) + 'v20M' + a1 + ' ' + (b1 + 8) + 'v20M' + a0 + ' ' + ly + 'H' + a1 + '"/>' +
      '<path d="M' + a0 + ' ' + ly + 'l7 -4v8zM' + a1 + ' ' + ly + 'l-7 -4v8z" stroke="none"/>' +
      '<text x="' + ((a0 + a1) / 2) + '" y="' + (ly + 17) + '" text-anchor="middle" stroke="none">' + fmtDim(W) + '</text>';
    if (H) extra += '<path d="M' + (a1 + 8) + ' ' + b0 + 'h20M' + (a1 + 8) + ' ' + b1 + 'h20M' + lx + ' ' + b0 + 'V' + b1 + '"/>' +
      '<path d="M' + lx + ' ' + b0 + 'l-4 7h8zM' + lx + ' ' + b1 + 'l-4 -7h8z" stroke="none"/>' +
      '<text x="' + (lx + 8) + '" y="' + ((b0 + b1) / 2 + 4) + '" stroke="none">' + fmtDim(H) + '</text>';
    extra += '</g>';
  }
  return '<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + p.name.en.replace(/"/g, '') + '"><defs>' + b[0] + s.d + '</defs>' + b[1] + body + extra + '</svg>';
};

/* 首页横幅：傍晚的露台 */
window.heroArt = function(){
  var id = 'h' + (uid++), sofa = S.sofa('#4a4d52', '#e9e3d6', id + 's'), lan = S.lantern('#b58a57', '#ffcf73', id + 'l'), bed = S.bed('#e3d6c1', '', id + 'b'), lamp = S.lamp('#cdbb9c', '#ffd88a', id + 'm');
  var bulbs = '', i, gl = glow(id + 'bg', '#ffcf73');
  for (i = 1; i < 16; i++) { var t = i / 16, x = (1 - t) * (1 - t) * 240 + 2 * (1 - t) * t * 760 + t * t * 1240, y = (1 - t) * (1 - t) * 40 + 2 * (1 - t) * t * 210 + t * t * 30;
    bulbs += '<circle cx="' + x + '" cy="' + (y + 18) + '" r="30" fill="url(#' + id + 'bg)"/><rect x="' + (x - 3) + '" y="' + y + '" width="6" height="8" fill="#222"/><ellipse cx="' + x + '" cy="' + (y + 18) + '" rx="7" ry="10" fill="#ffe2a0"/>'; }
  var planks = '';
  for (i = 0; i < 8; i++) planks += '<path d="M0 ' + (470 + i * i * 2.4 + i * 10) + ' H1200" stroke="#6f4f36" stroke-width="2"/>';
  return '<svg viewBox="0 0 1200 600" preserveAspectRatio="xMaxYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>' +
    '<linearGradient id="' + id + 'k" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16233b"/><stop offset=".55" stop-color="#4d4562"/><stop offset="1" stop-color="#c98a5e"/></linearGradient>' +
    '<linearGradient id="' + id + 'd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a6243"/><stop offset="1" stop-color="#5a3f2b"/></linearGradient>' + gl + sofa.d + lan.d + lamp.d +
    glow(id + 'w', '#ffc977') + '</defs>' +
    '<rect width="1200" height="600" fill="url(#' + id + 'k)"/>' +
    '<circle cx="980" cy="70" r="26" fill="#f6e7c4" opacity=".9"/><circle cx="420" cy="60" r="1.5" fill="#fff"/><circle cx="600" cy="30" r="1.2" fill="#fff"/><circle cx="1120" cy="140" r="1.4" fill="#fff"/>' +
    '<path d="M0 360 Q200 320 420 350 T820 330 T1200 340 V470 H0Z" fill="#2a3a33"/>' +
    '<rect x="1010" y="170" width="190" height="300" fill="#3a3330"/><rect x="1050" y="220" width="110" height="150" rx="4" fill="#ffd994" opacity=".85"/><path d="M1105 220 V370M1050 295 H1160" stroke="#3a3330" stroke-width="6"/>' +
    '<circle cx="1105" cy="300" r="120" fill="url(#' + id + 'w)" opacity=".5"/>' +
    '<rect y="460" width="1200" height="140" fill="url(#' + id + 'd)"/>' + planks +
    '<path d="M240 40 Q760 210 1240 30" fill="none" stroke="#111" stroke-width="2.5"/>' + bulbs +
    '<g transform="translate(560 150) scale(1.4)">' + sofa.b + '</g>' +
    '<g transform="translate(960 300) scale(.62)">' + lamp.b + '</g>' +
    '<g transform="translate(400 336) scale(.78)">' + bed.b + '</g>' +
    '<g transform="translate(1060 250) scale(.72)"><path d="M200 -200 V24" stroke="#222" stroke-width="2"/>' + lan.b + '</g>' +
    '<g transform="translate(-150 0)"><path d="M470 470 l14 -70 h60 l14 70z" fill="#b65f3c"/><ellipse cx="514" cy="384" rx="34" ry="26" fill="#4f6b4a"/><ellipse cx="494" cy="360" rx="20" ry="32" fill="#5f7d58"/><ellipse cx="536" cy="352" rx="18" ry="36" fill="#47613f"/></g>' +
    '</svg>';
};

/* 分类卡片配图 */
window.catArt = function(cat){
  var P = window.PRODUCTS, pick = {furniture: ['f136', 'sage'], lighting: ['l213', 'natural'], pet: ['p325', 'beige']}[cat];
  var p = P.filter(function(x){ return x.id === pick[0]; })[0];
  return window.productArt(p, p.colors[0], 'scene');
};

/* 工厂外景 */
window.factoryArt = function(){
  var id = 'fa' + (uid++), win = '', i, j, saw = '';
  for (i = 0; i < 6; i++) saw += 'l30 -26 v26';
  for (i = 0; i < 5; i++) for (j = 0; j < 3; j++) win += '<rect x="' + (66 + i * 22) + '" y="' + (128 + j * 30) + '" width="14" height="18" fill="#cfe0ee"/>';
  return '<svg viewBox="0 0 600 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Factory"><defs><linearGradient id="' + id + 's" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe3ee"/><stop offset="1" stop-color="#f3eee4"/></linearGradient></defs>' +
    '<rect width="600" height="360" fill="url(#' + id + 's)"/><path d="M0 240 Q150 214 300 232 T600 226 V360 H0Z" fill="#a9bd9f"/><rect y="270" width="600" height="90" fill="#bfc2c3"/><path d="M0 300 H600" stroke="#fff" stroke-width="3" stroke-dasharray="26 18"/>' +
    '<rect x="50" y="100" width="130" height="170" fill="#e9e7e1" stroke="#c9c4ba"/>' + win + '<rect x="50" y="90" width="130" height="16" fill="#1f3b2d"/><text x="115" y="102" fill="#fff" font-size="11" font-family="General Sans,Arial,sans-serif" font-weight="600" text-anchor="middle" letter-spacing="2">SELVANE</text>' +
    '<rect x="96" y="232" width="38" height="38" fill="#7a8a96"/>' +
    '<path d="M190 270 V160 ' + saw + ' V270 Z" fill="#d6d2c8" stroke="#b9b3a6"/><path d="M190 270 V160 ' + saw + '" fill="none" stroke="#8f9aa6" stroke-width="3"/>' +
    '<rect x="200" y="200" width="160" height="12" fill="#b9b3a6"/><rect x="220" y="226" width="48" height="44" fill="#6e7780"/><rect x="290" y="226" width="48" height="44" fill="#6e7780"/>' +
    '<path d="M370 270 V176 l36 -30 l36 30 l36 -30 l36 30 V270 Z" fill="#cfcac0" stroke="#b1ab9e"/><rect x="392" y="214" width="120" height="56" fill="#7a8a96"/><path d="M392 228 H512M392 242 H512M392 256 H512" stroke="#6a7a86"/>' +
    '<g transform="translate(420 238)"><rect width="96" height="34" fill="#c46a43"/><path d="M8 4 V30M20 4 V30M32 4 V30M44 4 V30M56 4 V30M68 4 V30M80 4 V30" stroke="#a5532f"/><rect x="100" y="8" width="30" height="26" rx="3" fill="#1f3b2d"/><circle cx="18" cy="38" r="6" fill="#222"/><circle cx="110" cy="38" r="6" fill="#222"/></g>' +
    '<rect x="532" y="214" width="56" height="56" fill="#2e3d5c"/><rect x="532" y="186" width="56" height="28" fill="#1f3b2d"/>' +
    '<circle cx="30" cy="236" r="18" fill="#7d9a72"/><circle cx="574" cy="160" r="0"/><path d="M30 254 V270" stroke="#6b4a35" stroke-width="4"/>' +
    '<path d="M300 100 V40" stroke="#888" stroke-width="2"/><path d="M300 42 h28 v16 h-28z" fill="#c43c3c"/></svg>';
};
/* 车间三张 */
window.workshopArt = function(n){
  var id = 'ws' + (uid++), base = '<rect width="400" height="260" fill="#efe9de"/><rect y="200" width="400" height="60" fill="#cfc8bb"/><path d="M0 20 H400" stroke="#c2baab" stroke-width="6"/>';
  var lamps = '';
  [80, 200, 320].forEach(function(x){ lamps += '<path d="M' + x + ' 20 V44" stroke="#666" stroke-width="2"/><path d="M' + (x - 16) + ' 56 Q' + x + ' 36 ' + (x + 16) + ' 56Z" fill="#3b3d42"/><ellipse cx="' + x + '" cy="58" rx="22" ry="5" fill="#ffe7a8" opacity=".8"/>'; });
  if (n === 1) { // 编藤
    var w = weave(id + 'w', '#b58a57'), rolls = '';
    [[60, 176], [100, 184], [80, 150]].forEach(function(r){ rolls += '<circle cx="' + r[0] + '" cy="' + r[1] + '" r="24" fill="#4a4d52"/><circle cx="' + r[0] + '" cy="' + r[1] + '" r="16" fill="none" stroke="#6b6e74" stroke-width="3"/><circle cx="' + r[0] + '" cy="' + r[1] + '" r="6" fill="#2a2b2e"/>'; });
    return '<svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>' + w + '</defs>' + base + lamps + rolls +
      '<rect x="150" y="150" width="200" height="12" fill="#8a6243"/><path d="M160 162 V210M340 162 V210" stroke="#6b4a35" stroke-width="8"/>' +
      '<rect x="180" y="96" width="140" height="54" rx="8" fill="url(#' + id + 'w)"/><path d="M180 96 H320 V150 H180 Z" fill="none" stroke="#7a7c82" stroke-width="3"/>' +
      '<path d="M300 96 V150M290 96 V150" stroke="#b9bcc2" stroke-width="3"/><rect x="290" y="96" width="30" height="54" fill="#d6d2c8" opacity=".85"/><path d="M296 104 h18M296 116 h18M296 128 h18M296 140h18" stroke="#9a9ca1"/></svg>';
  }
  if (n === 2) { // 灯具组装线
    var items = '', i;
    for (i = 0; i < 5; i++) items += '<g transform="translate(' + (50 + i * 66) + ' 128)"><rect width="34" height="26" rx="5" fill="#2a2b2e"/><rect x="4" y="4" width="26" height="14" rx="3" fill="' + (i < 3 ? '#ffcf73' : '#6d7178') + '"/>' + (i < 3 ? '<circle cx="17" cy="12" r="22" fill="#ffcf73" opacity=".18"/>' : '') + '</g>';
    return '<svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + base + lamps +
      '<rect x="20" y="154" width="360" height="16" rx="8" fill="#3b3d42"/><path d="M28 162 H372" stroke="#6b6e74" stroke-width="2" stroke-dasharray="6 6"/>' +
      '<path d="M50 170 V210M350 170 V210M200 170 V210" stroke="#6b6e74" stroke-width="6"/>' + items +
      '<rect x="300" y="70" width="80" height="46" rx="5" fill="#1f3b2d"/><text x="340" y="90" fill="#9fe0b0" font-size="11" font-family="monospace" text-anchor="middle">PASS 1,284</text><text x="340" y="106" fill="#ffcf73" font-size="10" font-family="monospace" text-anchor="middle">IP65 ✓</text></svg>';
  }
  // 质检实验室
  return '<svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + base + lamps +
    '<rect x="40" y="80" width="120" height="130" rx="8" fill="#d6d9de" stroke="#9a9ca1"/><rect x="56" y="96" width="88" height="62" rx="4" fill="#2e3d5c"/><circle cx="100" cy="127" r="18" fill="none" stroke="#7fb6ff" stroke-width="2"/><path d="M100 127 l10 -8" stroke="#fff" stroke-width="2"/>' +
    '<circle cx="70" cy="180" r="7" fill="#c43c3c"/><circle cx="92" cy="180" r="7" fill="#1f8a4c"/><rect x="110" y="174" width="34" height="12" rx="3" fill="#9a9ca1"/>' +
    '<rect x="200" y="150" width="70" height="50" fill="#c49a6c" stroke="#a97f55"/><rect x="280" y="150" width="70" height="50" fill="#c49a6c" stroke="#a97f55"/><rect x="240" y="100" width="70" height="50" fill="#c49a6c" stroke="#a97f55"/>' +
    '<rect x="252" y="114" width="46" height="18" rx="3" fill="#1f8a4c"/><text x="275" y="127" fill="#fff" font-size="9" font-family="General Sans,Arial,sans-serif" font-weight="600" text-anchor="middle">QC PASSED</text>' +
    '<rect x="300" y="60" width="58" height="76" rx="4" fill="#fff" stroke="#c9c4ba" transform="rotate(6 329 98)"/><path d="M312 80 l4 4 l8 -8M312 98 l4 4 l8 -8M312 116 l4 4 l8 -8" stroke="#1f8a4c" stroke-width="2" fill="none" transform="rotate(6 329 98)"/></svg>';
};
})();
