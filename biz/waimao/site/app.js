/* SELVANE 演示站：路由、渲染、购物车、询盘、结账。纯前端，不连后端。 */
(function(){
var P = window.PRODUCTS, C = window.COLORS, M = window.MATERIALS, $ = function(s, r){ return (r || document).querySelector(s); }, $$ = function(s, r){ return [].slice.call((r || document).querySelectorAll(s)); };
function load(k, d){ try { var v = localStorage.getItem('sv_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
function save(k, v){ try { localStorage.setItem('sv_' + k, JSON.stringify(v)); } catch (e) {} }
var S = {lang: load('lang', 'en'), cart: load('cart', []), order: load('order', null), inq: {}, inqDone: null, co: {}, pd: null};
if (!window.I18N[S.lang]) S.lang = 'en';
function t(k, v){ var s = (window.I18N[S.lang][k] != null ? window.I18N[S.lang][k] : window.I18N.en[k]) || k; if (v) for (var x in v) s = s.split('{' + x + '}').join(v[x]); return s; }
function L(o){ return o ? (o[S.lang] || o.en) : ''; }
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function money(n){ return 'US$ ' + n.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}); }
function byId(id){ return P.filter(function(p){ return p.id === id; })[0]; }
function unit(p){ return t('u_' + p.unit); }
function price(p, q){ var r = p.price[0]; for (var i = 1; i < p.price.length; i++) if (q >= p.price[i][0]) r = p.price[i][1]; return r; }
function minP(p){ return p.price[p.price.length - 1][1]; }
function maxP(p){ return p.price[1][1]; }
function country(code){ var c = window.COUNTRIES.filter(function(x){ return x[0] === code; })[0]; return c ? c[{en: 1, zh: 2, es: 3}[S.lang]] : ''; }
function cname(k){ return C[k] ? L(C[k]) : k; }

var I = { // 图标
  cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2.2l2.2 11h10.8l2-8H6.3"/><circle cx="9.5" cy="19.5" r="1.4"/><circle cx="17" cy="19.5" r="1.4"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.2 4.2L19 7"/></svg>',
  left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5-7 7 7 7"/></svg>',
  right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>',
  file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M12 12v6M9.5 15.5 12 18l2.5-2.5"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z"/><path d="m9 12 2 2 4-4"/></svg>',
  factory: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M3 21V10l6 4v-4l6 4V4h6v17z"/><path d="M7 17h2M12 17h2M17 17h1"/></svg>',
  box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M13 3 5 14h6l-1 7 8-11h-6z"/></svg>',
  wallet: '<svg viewBox="0 0 48 32" fill="none"><rect x="2" y="4" width="44" height="24" rx="5" fill="#1d3f8f"/><path d="M15 23l2.2-14h6.2c3.6 0 5.2 2 4.6 4.8-.6 3-3 4.7-6.4 4.7h-2.3L18.5 23z" fill="#fff"/><path d="M21 18.5l-.5 4.5h3.3l.7-4.5" fill="#7fb6ff"/></svg>',
  card: '<svg viewBox="0 0 48 32" fill="none"><rect x="2" y="4" width="44" height="24" rx="5" fill="#2d5442"/><rect x="2" y="10" width="44" height="5" fill="#1a3326"/><rect x="7" y="20" width="12" height="3" rx="1.5" fill="#cfe0d4"/><circle cx="35" cy="21.5" r="3.5" fill="#f2b84b"/><circle cx="39.5" cy="21.5" r="3.5" fill="#e0643a" opacity=".85"/></svg>',
  bank: '<svg viewBox="0 0 48 32" fill="none"><rect x="2" y="4" width="44" height="24" rx="5" fill="#ede6d8"/><path d="M24 8l11 5H13z" fill="#1f3b2d"/><path d="M15 14v8M21 14v8M27 14v8M33 14v8" stroke="#1f3b2d" stroke-width="2.4"/><rect x="12" y="23" width="24" height="2.5" fill="#1f3b2d"/></svg>',
};
var LOGO = '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="15" fill="#1f3b2d"/><path d="M8 20a8 8 0 0 1 16 0z" fill="#f3c27a"/><path d="M16 26c-1-6 1-11 7-14-1 6-3 10-7 14z" fill="#8fbf8a"/><path d="M6 22h20" stroke="#fffdf9" stroke-width="1.6" stroke-linecap="round"/></svg>';

/* ---------- shell ---------- */
function cartCount(){ return S.cart.reduce(function(a, l){ return a + l.qty; }, 0); }
function shell(route){
  var nav = [['', 'nav_home'], ['products', 'nav_products'], ['factory', 'nav_factory'], ['inquiry', 'nav_contact']], cur = route.split('/')[0];
  if (cur === 'product') cur = 'products';
  function links(cls){ return nav.map(function(n){ return '<a class="' + cls + (cur === n[0] ? ' on' : '') + '" href="#/' + n[0] + '">' + t(n[1]) + '</a>'; }).join(''); }
  var langs = [['en', 'EN'], ['zh', '中文'], ['es', 'ES']].map(function(l){ return '<button type="button" data-lang="' + l[0] + '" aria-pressed="' + (S.lang === l[0]) + '" lang="' + l[0] + '">' + l[1] + '</button>'; }).join('');
  var n = cartCount();
  $('#shell').innerHTML =
    '<div class="strip"><div class="wrap"><span>' + t('demoStrip') + '</span><a href="../">' + t('backCase') + '</a></div></div>' +
    '<header class="hd"><div class="wrap"><a class="logo" href="#/" aria-label="Selvane home">' + LOGO + '<span><b>SELVANE</b><small>OUTDOOR LIVING</small></span></a>' +
    '<nav class="nav" aria-label="Main">' + links('') + '</nav>' +
    '<div class="hd__r"><div class="lang" role="group" aria-label="Language">' + langs + '</div>' +
    '<a class="btn btn--sm btn--accent hd__quote" href="#/inquiry">' + t('getQuote') + '</a>' +
    '<a class="icobtn" href="#/cart" aria-label="' + t('cart') + '">' + I.cart + (n ? '<span class="badge-n" id="cartN">' + n + '</span>' : '<span class="badge-n" id="cartN" hidden></span>') + '</a>' +
    '<button class="icobtn menu-btn" type="button" data-act="menu" aria-label="' + t('menu') + '">' + I.menu + '</button></div></div></header>' +
    '<nav class="mnav" id="mnav" aria-label="Mobile"><div class="mnav__x"><button class="icobtn" type="button" data-act="menu-x" aria-label="Close">' + I.x + '</button></div>' + links('nl') +
    '<a class="btn btn--accent" href="#/inquiry">' + t('getQuote') + '</a></nav>';
  document.documentElement.lang = S.lang === 'zh' ? 'zh-CN' : S.lang;
}
function footer(){
  return '<footer class="ft"><div class="wrap"><div class="ft__g">' +
    '<div><a class="logo" href="#/">' + LOGO + '<span><b>SELVANE</b><small>OUTDOOR LIVING</small></span></a><p>' + t('footAbout') + '</p></div>' +
    '<div><h4>' + t('footLinks') + '</h4><ul><li><a href="#/products?cat=furniture">' + t('cat_furniture') + '</a></li><li><a href="#/products?cat=lighting">' + t('cat_lighting') + '</a></li><li><a href="#/products?cat=pet">' + t('cat_pet') + '</a></li><li><a href="#/factory">' + t('nav_factory') + '</a></li><li><a href="#/inquiry">' + t('nav_contact') + '</a></li></ul></div>' +
    '<div><h4>' + t('footContact') + '</h4><ul class="contact"><li>' + I.pin + '<span>' + t('footAddr') + '</span></li><li>' + I.mail + '<span>sales@selvane-outdoor.com</span></li><li>' + I.phone + '<span>+86 574 8800 6620 (WhatsApp)</span></li><li>' + I.clock + '<span>' + t('footHours') + '</span></li></ul></div>' +
    '</div><div class="ft__b"><span>© 2026 Selvane Outdoor · ' + t('footNote') + '</span><span>' + t('demoStrip') + '</span></div></div></footer>';
}

/* ---------- cards ---------- */
function card(p){
  var tag = p.badge ? '<span class="tag' + (p.badge === 'new' ? ' tag--new' : '') + '">' + t('b_' + p.badge) + '</span>' : (p.ready ? '<span class="tag tag--ready">' + t('b_ready') + '</span>' : '');
  return '<article class="card">' + tag + '<a class="card__img" href="#/product/' + p.id + '" aria-label="' + esc(L(p.name)) + '">' + window.productArt(p, p.colors[0], 'main') + '</a>' +
    '<div class="card__b"><span class="card__sku">' + p.sku + '</span><h3><a href="#/product/' + p.id + '">' + esc(L(p.name)) + '</a></h3>' +
    '<div class="swatches">' + p.colors.map(function(c){ return '<i style="background:' + C[c].hex + '" title="' + cname(c) + '"></i>'; }).join('') + '</div>' +
    '<div class="card__p">' + money(minP(p)) + ' – ' + money(maxP(p)).replace('US$ ', '') + ' <small>' + t('perUnit', {u: unit(p)}) + '</small></div>' +
    '<div class="card__m">' + t('moq') + ' ' + p.price[1][0] + ' ' + unit(p) + '</div>' +
    '<div class="card__acts"><a class="btn btn--ghost" href="#/inquiry?p=' + p.sku + '">' + t('inquire') + '</a><a class="btn" href="#/product/' + p.id + '">' + t('view') + '</a></div></div></article>';
}

/* ---------- home ---------- */
function home(){
  var hot = P.slice().sort(function(a, b){ return b.pop - a.pop; }).slice(0, 8);
  var cats = ['furniture', 'lighting', 'pet'];
  var whyIc = [I.factory, I.box, I.bolt, I.shield];
  var mk = ['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Netherlands', 'Spain', 'Poland', 'Australia', 'UAE', 'Saudi Arabia', 'Chile', 'Mexico', 'Japan', 'South Africa'];
  return '<section class="hero"><div class="hero__art">' + window.heroArt() + '</div><div class="wrap">' +
    '<span class="eyebrow">' + t('heroEyebrow') + '</span><h1>' + t('heroTitle') + '</h1><p>' + t('heroSub') + '</p>' +
    '<div class="hero__btns"><a class="btn btn--light" href="#/products">' + t('heroBtn1') + '</a><a class="btn btn--line-light" href="#/inquiry">' + t('heroBtn2') + '</a></div>' +
    '<div class="hero__certs"><span>BSCI</span><span>ISO 9001</span><span>CE · RoHS · FCC</span><span>FSC</span></div></div></section>' +
    '<section class="stats"><div class="wrap"><div><b>17</b><span>' + t('stat1') + '</span></div><div><b>36,000</b><span>' + t('stat2') + '</span></div><div><b>420</b><span>' + t('stat3') + '</span></div><div><b>60+</b><span>' + t('stat4') + '</span></div></div></section>' +
    '<section class="sec"><div class="wrap"><div class="sec__hd"><div><h2>' + t('catTitle') + '</h2><p>' + t('catSub') + '</p></div><a class="link" href="#/products">' + t('cat_all') + ' →</a></div><div class="cats">' +
    cats.map(function(c){ var n = P.filter(function(p){ return p.cat === c; }).length;
      return '<a class="cat" href="#/products?cat=' + c + '"><div class="cat__img">' + window.catArt(c) + '</div><div class="cat__b"><h3>' + t('cat_' + c) + '<small>' + t('items', {n: n}) + '</small></h3><p>' + t('catDesc_' + c) + '</p><span class="link">' + t('view') + ' →</span></div></a>'; }).join('') +
    '</div></div></section>' +
    '<section class="sec sec--sand"><div class="wrap"><div class="sec__hd"><div><h2>' + t('hotTitle') + '</h2><p>' + t('hotSub') + '</p></div><a class="btn btn--ghost btn--sm" href="#/products">' + t('seeAll') + '</a></div><div class="grid">' + hot.map(card).join('') + '</div></div></section>' +
    '<section class="sec"><div class="wrap"><div class="sec__hd"><h2>' + t('whyTitle') + '</h2></div><ul class="why">' +
    [1, 2, 3, 4].map(function(i){ return '<li><div class="ic">' + whyIc[i - 1] + '</div><h3>' + t('why' + i + 't') + '</h3><p>' + t('why' + i + 'd') + '</p></li>'; }).join('') + '</ul></div></section>' +
    '<section class="sec sec--sand"><div class="wrap"><div class="fac"><div class="fac__art">' + window.factoryArt() + '</div><div><h2 class="h2">' + t('facTitle') + '</h2><p class="sub">' + t('facSub') + '</p>' +
    '<div class="fac__nums"><div><b>30,000</b><span>' + t('fac1') + '</span></div><div><b>6</b><span>' + t('fac2') + '</span></div><div><b>12</b><span>' + t('fac3') + '</span></div><div><b>98.6%</b><span>' + t('fac4') + '</span></div></div>' +
    '<p style="margin-top:20px"><a class="link" href="#/factory">' + t('facMore') + ' →</a></p></div></div>' +
    '<div class="ws">' + [1, 2, 3].map(function(n){ return '<figure>' + window.workshopArt(n) + '<figcaption>' + t('ws' + n) + '</figcaption></figure>'; }).join('') + '</div></div></section>' +
    '<section class="sec"><div class="wrap"><div class="sec__hd"><div><h2>' + t('certTitle') + '</h2><p>' + t('certSub') + '</p></div></div><div class="certs">' + certs() + '</div></div></section>' +
    '<section class="sec sec--sand"><div class="wrap"><div class="sec__hd"><h2>' + t('processTitle') + '</h2></div><ol class="steps">' +
    [1, 2, 3, 4, 5].map(function(i){ return '<li><h3>' + t('p' + i + 't') + '</h3><p>' + t('p' + i + 'd') + '</p></li>'; }).join('') + '</ol>' +
    '<h3 style="font-size:17px;font-weight:600;margin:36px 0 12px">' + t('marketsTitle') + '</h3><div class="markets">' + mk.map(function(m){ return '<span>' + m + '</span>'; }).join('') + '</div></div></section>' +
    '<section class="sec"><div class="wrap"><div class="ctab"><div><h2>' + t('ctaTitle') + '</h2><p>' + t('ctaSub') + '</p></div><a class="btn btn--light" href="#/inquiry">' + t('ctaBtn') + '</a></div></div></section>';
}
function certs(){ return window.CERTS.map(function(c){ return '<div class="cert">' + I.shield + '<b>' + c + '</b></div>'; }).join(''); }

/* ---------- products ---------- */
var F = {cat: 'all', price: 'any', moq: 'any', cert: [], ready: false, q: '', sort: 'pop'};
var PR = {any: [0, 1e9], 1: [0, 20], 2: [20, 80], 3: [80, 200], 4: [200, 1e9]}, MQ = {any: 1e9, 1: 50, 2: 100, 3: 300};
function filtered(){
  var q = F.q.trim().toLowerCase();
  var list = P.filter(function(p){
    if (F.cat !== 'all' && p.cat !== F.cat) return false;
    var r = PR[F.price], lo = minP(p); if (lo < r[0] || lo >= r[1]) return false;
    if (p.price[1][0] > MQ[F.moq]) return false;
    if (F.cert.length && !F.cert.some(function(c){ return p.cert.indexOf(c) > -1; })) return false;
    if (F.ready && !p.ready) return false;
    if (q && (p.sku + ' ' + p.name.en + ' ' + p.name.zh + ' ' + p.name.es).toLowerCase().indexOf(q) < 0) return false;
    return true;
  });
  var s = {pop: function(a, b){ return b.pop - a.pop; }, low: function(a, b){ return minP(a) - minP(b); }, high: function(a, b){ return minP(b) - minP(a); }, moq: function(a, b){ return a.price[1][0] - b.price[1][0]; }, new: function(a, b){ return a.added < b.added ? 1 : -1; }}[F.sort];
  return list.sort(s);
}
function products(params){
  if (params.cat) F.cat = params.cat;
  var certList = ['BSCI', 'CE', 'RoHS', 'FCC', 'FSC', 'SGS', 'REACH'];
  function radio(name, val, label, cnt){ return '<label class="opt"><input type="radio" name="' + name + '" value="' + val + '"' + (F[name] === val ? ' checked' : '') + '>' + label + (cnt != null ? '<small>' + cnt + '</small>' : '') + '</label>'; }
  var catTitle = F.cat === 'all' ? t('cat_all') : t('cat_' + F.cat);
  return '<div class="ph"><div class="wrap"><div class="crumb"><a href="#/">' + t('home') + '</a><span>/</span><span>' + t('prodTitle') + '</span></div><h1 id="catTitle">' + catTitle + '</h1></div></div>' +
    '<div class="wrap shop"><aside class="filt" id="filt" aria-label="' + t('filters') + '"><div class="filt__hd"><b>' + t('filters') + '</b><button class="icobtn" type="button" data-act="filt-x" aria-label="Close">' + I.x + '</button></div>' +
    '<div class="fg"><h4>' + t('f_category') + '</h4>' + radio('cat', 'all', t('cat_all'), P.length) + ['furniture', 'lighting', 'pet'].map(function(c){ return radio('cat', c, t('cat_' + c), P.filter(function(p){ return p.cat === c; }).length); }).join('') + '</div>' +
    '<div class="fg"><h4>' + t('f_price') + '</h4>' + ['any', '1', '2', '3', '4'].map(function(v){ return radio('price', v, t('pr_' + v)); }).join('') + '</div>' +
    '<div class="fg"><h4>' + t('f_moq') + '</h4>' + ['any', '1', '2', '3'].map(function(v){ return radio('moq', v, t('moq_' + v)); }).join('') + '</div>' +
    '<div class="fg"><h4>' + t('f_cert') + '</h4>' + certList.map(function(c){ return '<label class="opt"><input type="checkbox" name="cert" value="' + c + '"' + (F.cert.indexOf(c) > -1 ? ' checked' : '') + '>' + c + '</label>'; }).join('') + '</div>' +
    '<div class="fg"><label class="opt"><input type="checkbox" name="ready"' + (F.ready ? ' checked' : '') + '>' + t('f_ready') + '</label></div>' +
    '<div class="filt__ft"><button class="btn btn--ghost" type="button" data-act="filt-clear">' + t('clear') + '</button><button class="btn" type="button" data-act="filt-x" id="applyBtn"></button></div></aside>' +
    '<div><div class="toolbar"><div class="search">' + I.search + '<input type="search" id="q" placeholder="' + t('search') + '" value="' + esc(F.q) + '" aria-label="' + t('search') + '"></div>' +
    '<button class="btn btn--ghost btn--sm fbtn" type="button" data-act="filt-open" id="fbtn">' + t('filters') + '</button>' +
    '<select class="sel" id="sort" aria-label="' + t('sort') + '">' + ['pop', 'low', 'high', 'moq', 'new'].map(function(s){ return '<option value="' + s + '"' + (F.sort === s ? ' selected' : '') + '>' + t('sort_' + s) + '</option>'; }).join('') + '</select></div>' +
    '<div class="chips" id="chips"></div><p class="count" id="count"></p><div id="results"></div></div></div>';
}
function drawResults(){
  var list = filtered(), r = $('#results'); if (!r) return;
  r.innerHTML = list.length ? '<div class="grid">' + list.map(card).join('') + '</div>' : '<div class="empty">' + t('noResult') + '<p style="margin-top:12px"><button class="btn btn--ghost btn--sm" type="button" data-act="filt-clear">' + t('clear') + '</button></p></div>';
  $('#count').textContent = t('showing', {n: list.length, t: P.length});
  $('#applyBtn').textContent = t('apply', {n: list.length});
  $('#catTitle').textContent = F.cat === 'all' ? t('cat_all') : t('cat_' + F.cat);
  var chips = [];
  if (F.cat !== 'all') chips.push(['cat', t('cat_' + F.cat)]);
  if (F.price !== 'any') chips.push(['price', t('pr_' + F.price)]);
  if (F.moq !== 'any') chips.push(['moq', t('f_moq') + ' ' + t('moq_' + F.moq)]);
  F.cert.forEach(function(c){ chips.push(['cert:' + c, c]); });
  if (F.ready) chips.push(['ready', t('b_ready')]);
  $('#chips').innerHTML = chips.map(function(c){ return '<button type="button" data-chip="' + c[0] + '">' + esc(c[1]) + '</button>'; }).join('');
  var nf = chips.length; $('#fbtn').textContent = t('filters') + (nf ? ' (' + nf + ')' : '');
}
function bindProducts(){
  drawResults();
  $('#filt').addEventListener('change', function(e){
    var el = e.target;
    if (el.name === 'cert') F.cert = $$('input[name=cert]:checked').map(function(i){ return i.value; });
    else if (el.name === 'ready') F.ready = el.checked;
    else F[el.name] = el.value;
    drawResults();
  });
  $('#q').addEventListener('input', function(e){ F.q = e.target.value; drawResults(); });
  $('#sort').addEventListener('change', function(e){ F.sort = e.target.value; drawResults(); });
}

/* ---------- product detail ---------- */
var VIEWS = ['main', 'scene', 'detail', 'dim'];
function detail(id){
  var p = byId(id); if (!p) return '<div class="wrap" style="padding:80px 16px">Not found. <a class="link" href="#/products">' + t('prodTitle') + '</a></div>';
  if (!S.pd || S.pd.id !== id) S.pd = {id: id, color: p.colors[0], view: 0, qty: p.price[1][0]};
  var d = S.pd, u = unit(p), mat = L(M[p.mat]);
  var dims = p.dims[1] ? p.dims.join(' × ') + ' mm' : (p.dims[2] ? p.dims[0] + ' × ' + p.dims[2] + ' mm' : (p.dims[0] / 1000) + ' m');
  var related = P.filter(function(x){ return x.cat === p.cat && x.id !== p.id; }).sort(function(a, b){ return b.pop - a.pop; }).slice(0, 4);
  return '<div class="ph" style="padding:0"><div class="wrap" style="padding-top:14px;padding-bottom:14px"><div class="crumb"><a href="#/">' + t('home') + '</a><span>/</span><a href="#/products?cat=' + p.cat + '">' + t('cat_' + p.cat) + '</a><span>/</span><span>' + p.sku + '</span></div></div></div>' +
    '<div class="wrap"><div class="pd"><div class="gal"><div class="gal__main" id="galMain"></div><div class="thumbs" id="thumbs"></div></div>' +
    '<div class="pi"><div class="pi__sku">' + t('sku') + ': ' + p.sku + '</div><h1>' + esc(L(p.name)) + '</h1>' +
    '<div class="pi__tags">' + (p.ready ? '<span>' + t('b_ready') + '</span>' : '') + p.cert.map(function(c){ return '<span>' + c + '</span>'; }).join('') + '</div>' +
    '<p class="pi__desc">' + esc(L(p.desc)) + '</p>' +
    '<div class="tiers"><div class="tiers__hd"><span>' + t('price') + '</span><span>' + t('perUnit', {u: u}) + '</span></div><div class="tiers__row" id="tiers">' +
    [[1, p.price[0], t('sampleTier') + ' 1–' + (p.price[1][0] - 1)]].concat(p.price.slice(1).map(function(tr, i, a){ return [tr[0], tr[1], tr[0] + (a[i + 1] ? '–' + (a[i + 1][0] - 1) : '+')]; })).map(function(x){
      return '<div data-min="' + x[0] + '"><small>' + x[2] + '</small><b>' + money(x[1]).replace('US$ ', '$') + '</b></div>'; }).join('') + '</div></div>' +
    '<p class="moqnote">' + t('moqNote', {n: p.price[1][0], u: u}) + '</p>' +
    '<p class="field-l">' + t('color') + ': <span id="colName">' + cname(d.color) + '</span></p><div class="cols" id="cols">' +
    p.colors.map(function(c){ return '<button type="button" data-color="' + c + '" aria-pressed="' + (c === d.color) + '"><i style="background:' + C[c].hex + '"></i>' + cname(c) + '</button>'; }).join('') + '</div>' +
    '<p class="field-l">' + t('quantity') + ' <span>(' + u + ')</span></p><div class="buy"><div class="qty"><button type="button" data-q="-1" aria-label="-">−</button><input id="qty" type="number" inputmode="numeric" min="1" value="' + d.qty + '" aria-label="' + t('quantity') + '"><button type="button" data-q="1" aria-label="+">+</button></div>' +
    '<div class="buy__t">' + t('total') + '<b id="tot"></b></div></div>' +
    '<div class="acts"><button class="btn btn--accent" type="button" data-act="add">' + I.cart.replace('<svg', '<svg width="18" height="18"') + t('addCart') + '</button><a class="btn btn--ghost" href="#/inquiry?p=' + p.sku + '">' + t('sendInquiry') + '</a></div>' +
    '<div class="mini-links"><button type="button" data-act="catalog">' + I.file + t('catalog') + '</button></div>' +
    '<div class="facts"><div>' + t('moq') + '<b>' + p.price[1][0] + ' ' + u + '</b></div><div>' + t('leadTime') + '<b>' + t('days', {n: p.lead}) + '</b></div><div>' + t('s_warranty') + '<b>' + t('years', {n: p.warranty}) + '</b></div></div>' +
    '</div></div>' +
    '<div class="tabs" role="tablist"><button role="tab" aria-selected="true" data-tab="spec">' + t('tab_spec') + '</button><button role="tab" aria-selected="false" data-tab="pack">' + t('tab_pack') + '</button><button role="tab" aria-selected="false" data-tab="oem">' + t('tab_oem') + '</button></div>' +
    '<div class="tabp" data-panel="spec"><table class="spec"><tbody>' + rows([[t('s_model'), p.sku], [t('s_material'), mat], [t('s_size'), dims], [t('s_weight'), p.kg + ' kg'], [t('s_colors'), p.colors.map(cname).join(', ')], [t('s_cert'), p.cert.join(', ')], [t('s_warranty'), t('years', {n: p.warranty})], [t('s_lead'), t('days', {n: p.lead})]]) + '</tbody></table></div>' +
    '<div class="tabp" data-panel="pack" hidden><table class="spec"><tbody>' + rows([[t('s_package'), t('pkg') + ' · ' + p.pcs + ' ' + u + ' / ' + t('u_carton')], [t('s_carton'), p.carton === '—' ? '3 ' + t('u_carton') + ' / ' + u : p.carton + ' mm'], [t('s_cbm'), p.cbm + ' m³'], [t('s_load'), p.load.toLocaleString('en-US') + ' ' + u], [t('s_port'), 'Ningbo / Shanghai'], [t('s_terms'), t('terms')], [t('s_payment'), t('payterms')]]) + '</tbody></table></div>' +
    '<div class="tabp" data-panel="oem" hidden><ul class="oem">' + [1, 2, 3, 4].map(function(i){ return '<li>' + I.check + '<span>' + t('oem' + i) + '</span></li>'; }).join('') + '</ul></div>' +
    '<section class="sec" style="padding-top:56px"><div class="sec__hd"><h2>' + t('related') + '</h2></div><div class="grid">' + related.map(card).join('') + '</div></section></div>';
}
function rows(r){ return r.map(function(x){ return '<tr><th>' + x[0] + '</th><td>' + esc(x[1]) + '</td></tr>'; }).join(''); }
function drawGallery(){
  var p = byId(S.pd.id), d = S.pd;
  $('#galMain').innerHTML = window.productArt(p, d.color, VIEWS[d.view]) + '<button class="gal__nav gal__nav--p" type="button" data-g="-1" aria-label="Previous">' + I.left + '</button><button class="gal__nav gal__nav--n" type="button" data-g="1" aria-label="Next">' + I.right + '</button><span class="gal__lbl">' + (d.view + 1) + ' / 4 · ' + t('v_' + VIEWS[d.view]) + '</span>';
  $('#thumbs').innerHTML = VIEWS.map(function(v, i){ return '<button type="button" data-view="' + i + '" aria-current="' + (i === d.view) + '" aria-label="' + t('v_' + v) + '">' + window.productArt(p, d.color, v) + '<span>' + t('v_' + v) + '</span></button>'; }).join('');
}
function drawTotal(){
  var p = byId(S.pd.id), q = S.pd.qty, up = price(p, q);
  $('#tot').textContent = money(up * q);
  var best = 1; $$('#tiers div').forEach(function(el){ if (q >= +el.dataset.min) best = +el.dataset.min; });
  $$('#tiers div').forEach(function(el){ el.classList.toggle('on', +el.dataset.min === best); });
}
function bindDetail(){
  if (!S.pd || !$('#galMain')) return;
  drawGallery(); drawTotal();
  $('#qty').addEventListener('input', function(e){ var v = parseInt(e.target.value, 10); S.pd.qty = v > 0 ? Math.min(v, 99999) : 1; drawTotal(); });
  $('#qty').addEventListener('blur', function(e){ e.target.value = S.pd.qty; });
}

/* ---------- cart ---------- */
function addToCart(id, color, qty){
  var l = S.cart.filter(function(x){ return x.id === id && x.color === color; })[0];
  if (l) l.qty += qty; else S.cart.push({id: id, color: color, qty: qty});
  save('cart', S.cart); updateBadge(true);
}
function updateBadge(bump){
  var b = $('#cartN'), n = cartCount(); if (!b) return;
  b.textContent = n; b.hidden = !n;
  if (bump) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
}
function subtotal(){ return S.cart.reduce(function(a, l){ var p = byId(l.id); return a + price(p, l.qty) * l.qty; }, 0); }
function cart(){
  var head = '<div class="ph"><div class="wrap"><div class="crumb"><a href="#/">' + t('home') + '</a><span>/</span><span>' + t('cartTitle') + '</span></div><h1>' + t('cartTitle') + '</h1></div></div>';
  if (!S.cart.length) return head + '<div class="wrap" style="padding-top:40px;padding-bottom:80px"><div class="empty">' + I.cart.replace('<svg', '<svg width="40" height="40" style="margin:0 auto 12px;color:#b9b0a0"') + '<p>' + t('cartEmpty') + '</p><p style="margin-top:16px"><a class="btn" href="#/products">' + t('cartEmptyBtn') + '</a></p></div></div>';
  return head + '<div class="wrap cartg"><div>' + S.cart.map(function(l, i){
    var p = byId(l.id), up = price(p, l.qty), u = unit(p), nxt = p.price.slice(1).filter(function(tr){ return tr[0] > l.qty; })[0];
    return '<div class="line"><a class="line__img" href="#/product/' + p.id + '">' + window.productArt(p, l.color, 'main') + '</a><div><h3><a href="#/product/' + p.id + '">' + esc(L(p.name)) + '</a></h3>' +
      '<div class="line__meta">' + p.sku + ' · ' + cname(l.color) + ' · ' + money(up) + ' ' + t('perUnit', {u: u}) + '</div>' +
      '<div class="line__row"><div class="qty qty--sm"><button type="button" data-lq="' + i + '" data-d="-1" aria-label="-">−</button><input type="number" min="1" value="' + l.qty + '" data-li="' + i + '" aria-label="' + t('quantity') + '"><button type="button" data-lq="' + i + '" data-d="1" aria-label="+">+</button></div><button class="rm" type="button" data-rm="' + i + '">' + t('remove') + '</button></div>' +
      (nxt ? '<div class="line__hint">' + t('tierHint', {n: nxt[0], u: u, p: money(nxt[1])}) + '</div>' : '') + '</div>' +
      '<div class="line__tot">' + money(up * l.qty) + '<small>' + l.qty + ' ' + u + '</small></div></div>';
  }).join('') + '</div>' +
    '<aside class="sum-box"><h3>' + t('subtotal') + '</h3><div class="sum-row"><span>' + cartCount() + ' ' + t('items', {n: ''}).trim() + '</span><b>' + money(subtotal()) + '</b></div><p class="note">' + t('shipLater') + '</p>' +
    '<a class="btn btn--accent btn--block" href="#/checkout">' + t('checkout') + '</a><a class="btn btn--ghost btn--block" href="#/inquiry?cart=1">' + t('quoteCart') + '</a></aside></div>';
}

/* ---------- inquiry ---------- */
function inquiry(params){
  var head = '<div class="ph"><div class="wrap"><div class="crumb"><a href="#/">' + t('home') + '</a><span>/</span><span>' + t('nav_contact') + '</span></div><h1>' + t('inqTitle') + '</h1><p>' + t('inqSub') + '</p></div></div>';
  if (!S.inq.products) S.inq.products = [];
  if (params.p && S.inq.products.indexOf(params.p) < 0) S.inq.products.push(params.p);
  if (params.cart) S.cart.forEach(function(l){ var s = byId(l.id).sku; if (S.inq.products.indexOf(s) < 0) S.inq.products.push(s); });
  if (params.cart && !S.inq.message) S.inq.message = S.cart.map(function(l){ var p = byId(l.id); return p.sku + ' · ' + cname(l.color) + ' × ' + l.qty + ' ' + unit(p); }).join('\n');
  var side = '<div class="inq__side"><div class="box"><h3>' + t('inqWhat') + '</h3><ul class="ticks">' + [1, 2, 3, 4].map(function(i){ return '<li>' + I.check + '<span>' + t('inqW' + i) + '</span></li>'; }).join('') + '</ul></div>' +
    '<div class="box"><h3>' + t('inqOr') + '</h3><ul class="contact"><li>' + I.mail + '<span>sales@selvane-outdoor.com</span></li><li>' + I.phone + '<span>+86 574 8800 6620 (WhatsApp)</span></li><li>' + I.clock + '<span>' + t('footHours') + '</span></li><li>' + I.pin + '<span>' + t('footAddr') + '</span></li></ul></div></div>';
  var main;
  if (S.inqDone) {
    var d = S.inqDone;
    main = '<div class="card-p"><div class="ok"><div class="ok__ic">' + I.check + '</div><h2>' + t('inqOkTitle', {name: esc(d.name)}) + '</h2><p>' + t('inqOkSub', {no: d.no, email: esc(d.email)}) + '</p><span class="demo-pill">' + t('inqOkDemo') + '</span>' +
      '<dl class="sum">' + [[t('fName'), d.name], [t('fCompany'), d.company], [t('fCountry'), country(d.country)], [t('fProducts'), d.products.join(', ') || '—'], [t('fQty'), d.qty || '—'], [t('fMessage'), d.message]].map(function(r){ return '<div><dt>' + r[0] + '</dt><dd>' + esc(r[1]).replace(/\n/g, '<br>') + '</dd></div>'; }).join('') + '</dl>' +
      '<div class="btns"><button class="btn btn--ghost" type="button" data-act="inq-again">' + t('inqAgain') + '</button><a class="btn" href="#/products">' + t('backShop') + '</a></div></div></div>';
  } else {
    var v = S.inq, pick = P.slice().sort(function(a, b){ return b.pop - a.pop; }).slice(0, 8).map(function(p){ return p.sku; });
    v.products.forEach(function(s){ if (pick.indexOf(s) < 0) pick.unshift(s); });
    main = '<form class="card-p" id="inqForm" novalidate><div class="form-g">' +
      fld('name', t('fName'), 'text', v.name, 'autocomplete="name"') + fld('email', t('fEmail'), 'email', v.email, 'autocomplete="email"') +
      fld('company', t('fCompany'), 'text', v.company, 'autocomplete="organization"') + countrySel('country', v.country) +
      fld('phone', t('fPhone') + ' <span>(' + t('optional') + ')</span>', 'tel', v.phone, 'autocomplete="tel"', true) + fld('qty', t('fQty') + ' <span>(' + t('optional') + ')</span>', 'text', v.qty, 'placeholder="e.g. 200 sets"', true) +
      '<div class="f f--full"><label>' + t('fProducts') + ' <span>(' + t('optional') + ')</span></label><div class="pchips" id="pchips">' + pick.map(function(s){ var p = P.filter(function(x){ return x.sku === s; })[0]; return '<button type="button" data-pc="' + s + '" aria-pressed="' + (v.products.indexOf(s) > -1) + '">' + s + ' · ' + esc(L(p.name)) + '</button>'; }).join('') + '</div></div>' +
      '<div class="f f--full" data-f="message"><label for="f-message">' + t('fMessage') + '</label><textarea id="f-message" name="message" placeholder="' + t('msgPh') + '">' + esc(v.message || '') + '</textarea><span class="msg">' + t('required') + '</span></div>' +
      '</div><p class="formerr" id="formErr">' + t('fixErrors') + '</p><button class="btn btn--accent btn--block" type="submit" style="margin-top:18px">' + t('fSubmit') + '</button></form>';
  }
  return head + '<div class="wrap inq">' + side + '<div>' + main + '</div></div>';
}
function fld(name, label, type, val, attr, opt){
  return '<div class="f" data-f="' + name + '"><label for="f-' + name + '">' + label + '</label><input id="f-' + name + '" name="' + name + '" type="' + type + '" value="' + esc(val || '') + '" ' + (attr || '') + (opt ? '' : ' required') + '><span class="msg">' + (type === 'email' ? t('badEmail') : t('required')) + '</span></div>';
}
function countrySel(name, val, full){
  var idx = {en: 1, zh: 2, es: 3}[S.lang];
  return '<div class="f' + (full ? ' f--full' : '') + '" data-f="' + name + '"><label for="f-' + name + '">' + t('fCountry') + '</label><select id="f-' + name + '" name="' + name + '" required><option value="">' + t('chooseCountry') + '</option>' +
    window.COUNTRIES.map(function(c){ return '<option value="' + c[0] + '"' + (val === c[0] ? ' selected' : '') + '>' + c[idx] + '</option>'; }).join('') + '</select><span class="msg">' + t('required') + '</span></div>';
}
function validate(form, req){
  var ok = true;
  req.forEach(function(n){
    var el = form.elements[n], v = (el.value || '').trim(), bad = !v || (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
    var w = el.closest('.f'); if (w) w.classList.toggle('err', bad); if (bad) ok = false;
  });
  return ok;
}
function bindInquiry(){
  var f = $('#inqForm'); if (!f) return;
  f.addEventListener('input', function(e){ if (e.target.name) { S.inq[e.target.name] = e.target.value; var w = e.target.closest('.f'); if (w) w.classList.remove('err'); } });
  f.addEventListener('change', function(e){ if (e.target.name) S.inq[e.target.name] = e.target.value; });
  f.addEventListener('submit', function(e){
    e.preventDefault();
    if (!validate(f, ['name', 'email', 'company', 'country', 'message'])) { $('#formErr').classList.add('on'); var first = $('.f.err input,.f.err select,.f.err textarea', f); if (first) first.focus(); return; }
    var now = new Date(), no = 'INQ-' + now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0') + '-' + (1000 + Math.floor(Math.random() * 9000));
    S.inqDone = {no: no, name: S.inq.name.trim(), email: S.inq.email.trim(), company: S.inq.company, country: S.inq.country, products: S.inq.products.slice(), qty: S.inq.qty, message: S.inq.message};
    S.inq = {}; render(true);
  });
}

/* ---------- checkout ---------- */
function totals(){ var kg = 0, cbm = 0; S.cart.forEach(function(l){ var p = byId(l.id); kg += p.kg * l.qty; cbm += p.cbm / p.pcs * l.qty; }); return {kg: Math.round(kg * 10) / 10, cbm: Math.round(cbm * 100) / 100}; }
function shipOpts(){
  var c = window.COUNTRIES.filter(function(x){ return x[0] === S.co.country; })[0]; if (!c) return null;
  var z = c[4], w = totals(), SH = window.SHIP;
  return [['express', Math.max(SH.express.min, w.kg * SH.express.kg[z]), SH.express.days], ['air', Math.max(SH.air.min, w.kg * SH.air.kg[z]), SH.air.days], ['sea', Math.max(SH.sea.min, w.cbm * SH.sea.cbm[z]), SH.sea.days]]
    .map(function(o){ return {k: o[0], price: Math.round(o[1] * 100) / 100, days: o[2]}; });
}
function shipCost(){ var o = shipOpts(); if (!o) return null; var s = o.filter(function(x){ return x.k === S.co.ship; })[0]; return s ? s.price : null; }
function checkout(){
  if (!S.cart.length) return cart();
  var v = S.co;
  return '<div class="ph"><div class="wrap"><div class="crumb"><a href="#/">' + t('home') + '</a><span>/</span><a href="#/cart">' + t('cartTitle') + '</a><span>/</span><span>' + t('checkout') + '</span></div><h1>' + t('checkout') + '</h1></div></div>' +
    '<div class="wrap cartg"><form class="co" id="coForm" novalidate>' +
    '<div class="demo-bar">' + I.info + '<div><b>' + t('demoCheckout') + '</b><span>' + t('demoCheckoutSub') + '</span></div></div>' +
    '<h2><i>1</i>' + t('coContact') + '<button class="link" type="button" data-act="fill">' + t('fillDemo') + '</button></h2><div class="form-g">' + fld('email', t('fEmail'), 'email', v.email, 'autocomplete="email"') + fld('phone', t('fPhone'), 'tel', v.phone, 'autocomplete="tel"') + '</div>' +
    '<h2><i>2</i>' + t('coAddress') + '</h2><div class="form-g">' + fld('name', t('fFull'), 'text', v.name, 'autocomplete="name"') + fld('company', t('fCompany') + ' <span>(' + t('optional') + ')</span>', 'text', v.company, 'autocomplete="organization"', true) +
    countrySel('country', v.country, true) + '<div class="f f--full" data-f="street"><label for="f-street">' + t('fStreet') + '</label><input id="f-street" name="street" value="' + esc(v.street || '') + '" autocomplete="street-address" required><span class="msg">' + t('required') + '</span></div>' +
    fld('city', t('fCity'), 'text', v.city, 'autocomplete="address-level2"') + fld('state', t('fState'), 'text', v.state, 'autocomplete="address-level1"', true) + fld('zip', t('fZip'), 'text', v.zip, 'autocomplete="postal-code"') + '</div>' +
    '<h2><i>3</i>' + t('coShipping') + '</h2><div id="ships"></div>' +
    '<h2><i>4</i>' + t('coPayment') + '</h2><div class="pays" id="pays" role="group" aria-label="' + t('coPayment') + '">' +
    [['paypal', I.wallet], ['card', I.card], ['bank', I.bank]].map(function(x){ return '<button class="pay" type="button" data-pay="' + x[0] + '" aria-pressed="' + (v.pay === x[0]) + '">' + x[1] + '<span>' + t('pay_' + x[0]) + '</span></button>'; }).join('') + '</div><div id="payNote"></div>' +
    '<h2><i>5</i>' + t('coNotes') + '</h2><div class="f"><textarea name="notes" placeholder="' + t('notesPh') + '" style="min-height:84px" aria-label="' + t('coNotes') + '">' + esc(v.notes || '') + '</textarea></div>' +
    '</form><aside class="sum-box" id="coSum"></aside></div>';
}
function drawShip(){
  var o = shipOpts(), box = $('#ships'); if (!box) return;
  if (!o) { box.innerHTML = '<p class="ship-est">' + t('chooseCountryFirst') + '</p>'; S.co.ship = S.co.ship || null; }
  else {
    if (!S.co.ship) S.co.ship = totals().kg > 80 ? 'sea' : 'express';
    var w = totals();
    box.innerHTML = '<p class="ship-est">' + t('shipEstimate', {kg: w.kg, cbm: w.cbm, c: country(S.co.country)}) + '</p><div class="ships">' + o.map(function(x){
      return '<label class="ship' + (S.co.ship === x.k ? ' on' : '') + '"><input type="radio" name="ship" value="' + x.k + '"' + (S.co.ship === x.k ? ' checked' : '') + '><span><b>' + t('sh_' + x.k) + '</b><small>' + t('shDays', {a: x.days[0], b: x.days[1]}) + '</small></span><span class="pr">' + money(x.price) + '</span></label>'; }).join('') + '</div>';
  }
  drawSum();
}
function drawPay(){
  $$('#pays .pay').forEach(function(b){ b.setAttribute('aria-pressed', b.dataset.pay === S.co.pay); });
  $('#payNote').innerHTML = S.co.pay ? '<p class="paynote">' + I.info + '<span>' + t('payNote_' + S.co.pay) + '</span></p>' : '';
}
function drawSum(){
  var el = $('#coSum'); if (!el) return;
  var sub = subtotal(), sc = shipCost();
  el.innerHTML = '<h3>' + t('orderItems') + '</h3><div class="sum-items">' + S.cart.map(function(l){ var p = byId(l.id); return '<div class="sum-it"><div class="im">' + window.productArt(p, l.color, 'main') + '<b>' + l.qty + '</b></div><div>' + esc(L(p.name)) + '<small>' + p.sku + ' · ' + cname(l.color) + '</small></div><b>' + money(price(p, l.qty) * l.qty) + '</b></div>'; }).join('') + '</div>' +
    '<div class="sum-row"><span>' + t('subtotal') + '</span><span>' + money(sub) + '</span></div><div class="sum-row"><span>' + t('shipping') + '</span><span>' + (sc == null ? '—' : money(sc)) + '</span></div>' +
    '<div class="sum-row t"><span>' + t('grandTotal') + '</span><span>' + money(sub + (sc || 0)) + '</span></div>' +
    '<p class="formerr" id="formErr">' + t('fixErrors') + '</p><button class="btn btn--accent btn--block" type="button" data-act="place" style="margin-top:14px">' + t('placeOrder') + '</button><p class="note" style="margin:10px 0 0;text-align:center">' + t('demoCheckout') + '</p>';
}
function bindCheckout(){
  var f = $('#coForm'); if (!f) return;
  drawShip(); drawPay();
  f.addEventListener('input', function(e){ if (e.target.name && e.target.name !== 'ship') { S.co[e.target.name] = e.target.value; var w = e.target.closest('.f'); if (w) w.classList.remove('err'); } });
  f.addEventListener('change', function(e){
    if (e.target.name === 'country') { S.co.country = e.target.value; drawShip(); }
    else if (e.target.name === 'ship') { S.co.ship = e.target.value; drawShip(); }
  });
}
function placeOrder(){
  var f = $('#coForm'), ok = validate(f, ['email', 'phone', 'name', 'country', 'street', 'city', 'zip']);
  $('#pays').classList.toggle('err', !S.co.pay);
  if (!S.co.pay) ok = false;
  if (!ok) { $('#formErr').classList.add('on'); var first = $('.f.err input,.f.err select', f) || $('#pays'); first.scrollIntoView({block: 'center'}); return; }
  var now = new Date(), sub = subtotal(), sc = shipCost() || 0;
  S.order = {no: 'SV-' + now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0') + '-' + (100 + Math.floor(Math.random() * 900)),
    date: now.toISOString().slice(0, 10), items: S.cart.slice(), sub: sub, ship: sc, method: S.co.ship, pay: S.co.pay, addr: JSON.parse(JSON.stringify(S.co))};
  save('order', S.order); S.cart = []; save('cart', S.cart); S.co = {pay: null}; updateBadge();
  location.hash = '#/order';
}
function order(){
  var o = S.order;
  if (!o) return '<div class="wrap" style="padding:80px 16px;text-align:center"><p>' + t('orderNone') + '</p><p style="margin-top:16px"><a class="btn" href="#/products">' + t('cartEmptyBtn') + '</a></p></div>';
  var a = o.addr;
  return '<div class="order"><div class="order__hd ok"><div class="ok__ic">' + I.check + '</div><h2 style="font-size:28px">' + t('orderTitle') + '</h2><p>' + t('orderSub', {no: o.no, date: o.date}) + '</p><p>' + t('orderThanks', {name: esc(a.name), email: esc(a.email)}) + '</p><span class="demo-pill">' + t('orderDemo') + '</span></div>' +
    '<div class="box" style="margin-top:28px"><h3>' + t('next') + '</h3><ol class="timeline">' + [1, 2, 3, 4].map(function(i){ return '<li class="' + (i === 1 ? 'on' : '') + '">' + t('n' + i) + '</li>'; }).join('') + '</ol></div>' +
    '<div class="order__grid"><div class="box"><h3>' + t('shipTo') + '</h3><p style="font-size:14.5px;line-height:1.7">' + esc(a.name) + (a.company ? '<br>' + esc(a.company) : '') + '<br>' + esc(a.street) + '<br>' + esc(a.city) + (a.state ? ', ' + esc(a.state) : '') + ' ' + esc(a.zip) + '<br>' + country(a.country) + '<br>' + esc(a.phone) + '</p></div>' +
    '<div class="box"><h3>' + t('payWith') + '</h3><p style="font-size:14.5px">' + t('pay_' + o.pay) + '</p><p style="font-size:13.5px;color:var(--muted);margin-top:6px">' + t('payNote_' + o.pay) + '</p><h3 style="margin-top:16px">' + t('method') + '</h3><p style="font-size:14.5px">' + t('sh_' + o.method) + '</p></div></div>' +
    '<div class="box"><h3>' + t('orderItems') + '</h3>' + o.items.map(function(l){ var p = byId(l.id); return '<div class="sum-it"><div class="im">' + window.productArt(p, l.color, 'main') + '<b>' + l.qty + '</b></div><div>' + esc(L(p.name)) + '<small>' + p.sku + ' · ' + cname(l.color) + ' · ' + money(price(p, l.qty)) + ' ' + t('perUnit', {u: unit(p)}) + '</small></div><b>' + money(price(p, l.qty) * l.qty) + '</b></div>'; }).join('') +
    '<div class="sum-row" style="margin-top:8px;border-top:1px solid var(--line);padding-top:12px"><span>' + t('subtotal') + '</span><span>' + money(o.sub) + '</span></div><div class="sum-row"><span>' + t('shipping') + '</span><span>' + money(o.ship) + '</span></div><div class="sum-row t"><span>' + t('grandTotal') + '</span><span>' + money(o.sub + o.ship) + '</span></div></div>' +
    '<p style="text-align:center;margin-top:24px"><a class="btn" href="#/products">' + t('backShop') + '</a></p></div>';
}

/* ---------- factory ---------- */
function factory(){
  var caps = [[{en:'PE rattan weaving',zh:'PE 藤编',es:'Tejido de ratán PE'}, '8,000 sets'], [{en:'Aluminum welding & powder coating',zh:'铝合金焊接 & 喷粉',es:'Soldadura de aluminio y pintura'}, '12,000 sets'], [{en:'Polywood & wood',zh:'塑木 & 实木',es:'Polywood y madera'}, '3,500 sets'], [{en:'Solar LED assembly',zh:'太阳能 LED 组装',es:'Montaje LED solar'}, '180,000 pcs'], [{en:'Sewing (cushions, pet beds)',zh:'缝纫（坐垫、宠物窝）',es:'Costura (cojines, camas)'}, '60,000 pcs'], [{en:'Pet houses & cat trees',zh:'宠物屋 & 猫爬架',es:'Casetas y árboles para gatos'}, '9,000 pcs']];
  return '<div class="ph"><div class="wrap"><div class="crumb"><a href="#/">' + t('home') + '</a><span>/</span><span>' + t('nav_factory') + '</span></div><h1>' + t('aboutTitle') + '</h1><p>' + t('aboutSub') + '</p></div></div>' +
    '<section class="sec"><div class="wrap"><div class="about"><div class="fac__art">' + window.factoryArt() + '</div><div><p>' + t('aboutP1') + '</p><p>' + t('aboutP2') + '</p>' +
    '<div class="fac__nums"><div><b>36,000 m²</b><span>' + t('stat2') + '</span></div><div><b>420</b><span>' + t('stat3') + '</span></div><div><b>30,000</b><span>' + t('fac1') + '</span></div><div><b>98.6%</b><span>' + t('fac4') + '</span></div></div></div></div>' +
    '<div class="ws">' + [1, 2, 3].map(function(n){ return '<figure>' + window.workshopArt(n) + '<figcaption>' + t('ws' + n) + '</figcaption></figure>'; }).join('') + '</div></div></section>' +
    '<section class="sec sec--sand"><div class="wrap"><div class="about" style="align-items:start"><div><h2 class="h2" style="margin-bottom:20px">' + t('timeline') + '</h2><ul class="tl">' +
    ['2009', '2013', '2016', '2019', '2022', '2025'].map(function(y){ return '<li><b>' + y + '</b>' + t('t' + y) + '</li>'; }).join('') + '</ul></div>' +
    '<div><h2 class="h2" style="margin-bottom:20px">' + t('capacity') + '</h2><div class="tbl-wrap"><table class="tbl"><thead><tr><th>' + t('line') + '</th><th>' + t('cap') + '</th></tr></thead><tbody>' + caps.map(function(c){ return '<tr><td>' + L(c[0]) + '</td><td>' + c[1] + '</td></tr>'; }).join('') + '</tbody></table></div></div></div></div></section>' +
    '<section class="sec"><div class="wrap"><div class="sec__hd"><div><h2>' + t('certTitle') + '</h2><p>' + t('certSub') + '</p></div></div><div class="certs">' + certs() + '</div></div></section>' +
    '<section class="sec sec--sand"><div class="wrap"><div class="sec__hd"><h2>' + t('shows') + '</h2></div><ul class="showsg">' + window.SHOWS.map(function(s){ return '<li><b>' + s[0] + '</b><span>' + s[1] + ' · ' + s[2] + '</span><em>' + t('booth', {b: s[3]}) + '</em></li>'; }).join('') + '</ul></div></section>' +
    '<section class="sec"><div class="wrap"><div class="ctab"><div><h2>' + t('ctaTitle') + '</h2><p>' + t('ctaSub') + '</p></div><a class="btn btn--light" href="#/inquiry">' + t('ctaBtn') + '</a></div></div></section>';
}

/* ---------- router ---------- */
function parse(){
  var h = location.hash.replace(/^#\/?/, ''), q = h.indexOf('?'), path = q > -1 ? h.slice(0, q) : h, params = {};
  if (q > -1) h.slice(q + 1).split('&').forEach(function(kv){ var p = kv.split('='); params[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || ''); });
  return {path: path, params: params};
}
var lastPath = null;
function render(keepScroll){
  var r = parse(), path = r.path, parts = path.split('/'), html, bind, title = 'Selvane Outdoor';
  if (lastPath !== null && lastPath.split('/')[0] === 'inquiry' && parts[0] !== 'inquiry') S.inqDone = null;
  if (parts[0] === 'products') { html = products(r.params); bind = bindProducts; title = t('prodTitle'); }
  else if (parts[0] === 'product') { html = detail(parts[1]); bind = bindDetail; var p = byId(parts[1]); if (p) title = L(p.name); }
  else if (parts[0] === 'inquiry') { html = inquiry(r.params); bind = bindInquiry; title = t('inqTitle'); }
  else if (parts[0] === 'cart') { html = cart(); title = t('cartTitle'); }
  else if (parts[0] === 'checkout') { html = checkout(); bind = bindCheckout; title = t('checkout'); }
  else if (parts[0] === 'order') { html = order(); title = t('orderTitle'); }
  else if (parts[0] === 'factory') { html = factory(); title = t('nav_factory'); }
  else { html = home(); title = 'Selvane Outdoor · ' + t('heroTitle'); }
  var y = window.scrollY;
  shell(path);
  $('#app').innerHTML = html + footer();
  document.title = title + (parts[0] && parts[0] !== '' ? ' · Selvane Outdoor' : '');
  if (bind) bind();
  window.scrollTo(0, keepScroll ? y : 0);
  lastPath = path;
  closeMenus();
}
window.addEventListener('hashchange', function(){ var tt = $('#toast'); if (tt) tt.classList.remove('on'); render(false); });

/* ---------- 事件 ---------- */
var toastT;
function toast(msg, link){
  var el = $('#toast');
  el.innerHTML = I.check + '<span>' + msg + '</span>' + (link ? '<a href="' + link[1] + '">' + link[0] + '</a>' : '');
  el.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function(){ el.classList.remove('on'); }, 3200);
}
function closeMenus(){ var m = $('#mnav'), f = $('#filt'); if (m) m.classList.remove('on'); if (f) f.classList.remove('on'); $('#scrim').classList.remove('on'); }
document.addEventListener('click', function(e){
  var el = e.target.closest('[data-lang],[data-act],[data-g],[data-view],[data-color],[data-q],[data-tab],[data-lq],[data-rm],[data-chip],[data-pc],[data-pay],#scrim');
  if (!el) return;
  var d = el.dataset;
  if (el.id === 'scrim') return closeMenus();
  if (d.lang) { S.lang = d.lang; save('lang', S.lang); render(true); return; }
  if (d.act === 'menu') { $('#mnav').classList.add('on'); $('#scrim').classList.add('on'); return; }
  if (d.act === 'menu-x' || d.act === 'filt-x') return closeMenus();
  if (d.act === 'filt-open') { $('#filt').classList.add('on'); $('#scrim').classList.add('on'); return; }
  if (d.act === 'filt-clear') { F = {cat: 'all', price: 'any', moq: 'any', cert: [], ready: false, q: '', sort: F.sort}; var keep = $('#filt').classList.contains('on'); render(true); if (keep) { $('#filt').classList.add('on'); $('#scrim').classList.add('on'); } return; }
  if (d.chip) { var c = d.chip; if (c.indexOf('cert:') === 0) F.cert = F.cert.filter(function(x){ return x !== c.slice(5); }); else if (c === 'ready') F.ready = false; else F[c] = c === 'cat' ? 'all' : 'any';
    $$('#filt input').forEach(function(i){ if (i.type === 'radio') i.checked = F[i.name] === i.value; else if (i.name === 'cert') i.checked = F.cert.indexOf(i.value) > -1; else if (i.name === 'ready') i.checked = F.ready; }); drawResults(); return; }
  if (d.g) { S.pd.view = (S.pd.view + (+d.g) + 4) % 4; drawGallery(); return; }
  if (d.view) { S.pd.view = +d.view; drawGallery(); return; }
  if (d.color) { S.pd.color = d.color; $$('#cols button').forEach(function(b){ b.setAttribute('aria-pressed', b.dataset.color === d.color); }); $('#colName').textContent = cname(d.color); drawGallery(); return; }
  if (d.q) { S.pd.qty = Math.max(1, S.pd.qty + (+d.q) * (S.pd.qty >= 100 ? 10 : 1)); $('#qty').value = S.pd.qty; drawTotal(); return; }
  if (d.tab) { $$('.tabs button').forEach(function(b){ b.setAttribute('aria-selected', b === el); }); $$('.tabp').forEach(function(p){ p.hidden = p.dataset.panel !== d.tab; }); return; }
  if (d.act === 'add') { addToCart(S.pd.id, S.pd.color, S.pd.qty); toast(t('added') + ' · ' + S.pd.qty + ' ' + unit(byId(S.pd.id)), [t('viewCart'), '#/cart']); return; }
  if (d.act === 'catalog') { toast(t('catalogToast')); return; }
  if (d.lq) { var l = S.cart[+d.lq]; l.qty = Math.max(1, l.qty + (+d.d)); save('cart', S.cart); updateBadge(); render(true); return; }
  if (d.rm) { S.cart.splice(+d.rm, 1); save('cart', S.cart); updateBadge(); render(true); return; }
  if (d.pc) { var i = S.inq.products.indexOf(d.pc); if (i > -1) S.inq.products.splice(i, 1); else S.inq.products.push(d.pc); el.setAttribute('aria-pressed', i < 0); return; }
  if (d.act === 'inq-again') { S.inqDone = null; render(false); return; }
  if (d.pay) { S.co.pay = d.pay; $('#pays').classList.remove('err'); drawPay(); return; }
  if (d.act === 'fill') {
    var demo = {email: 'emma.carter@example.com', phone: '+1 310 555 0148', name: 'Emma Carter', company: 'Harbour Home Goods LLC', country: 'US', street: '2150 Harbor Plaza Dr, Suite 4', city: 'Long Beach', state: 'CA', zip: '90802'};
    for (var k in demo) { S.co[k] = demo[k]; var inp = $('#coForm [name=' + k + ']'); if (inp) { inp.value = demo[k]; var w = inp.closest('.f'); if (w) w.classList.remove('err'); } }
    S.co.ship = null; drawShip(); return;
  }
  if (d.act === 'place') { placeOrder(); return; }
});
document.addEventListener('change', function(e){
  if (e.target.dataset && e.target.dataset.li != null) { var l = S.cart[+e.target.dataset.li], v = parseInt(e.target.value, 10); l.qty = v > 0 ? v : 1; save('cart', S.cart); updateBadge(); render(true); }
});
document.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeMenus(); });
render(false);
})();
