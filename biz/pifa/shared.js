/* 恒顺日化批发 · 演示数据和计算（客户端 app/ 和后台 admin/ 共用一份，存在本机浏览器里） */
(function (W) {
  var KEY = 'hs-pifa-demo-v3';
  var DAY = 864e5;

  var BRANCHES = [
    { id: 'hz', name: '杭州仓', city: '杭州', k: 1 },
    { id: 'sz', name: '苏州仓', city: '苏州', k: 1.03 },
    { id: 'hf', name: '合肥仓', city: '合肥', k: 0.97 }
  ];
  var STAFF = [
    { id: 'admin', name: '管理员', role: 'admin' },
    { id: 's1', name: '周敏', role: 'sales', branch: 'hz' },
    { id: 's2', name: '陈涛', role: 'sales', branch: 'hz' },
    { id: 's3', name: '刘洋', role: 'sales', branch: 'sz' },
    { id: 's4', name: '孙婷', role: 'sales', branch: 'hf' },
    { id: 'w1', name: '老吴', role: 'wh' }
  ];
  var CATS = ['洗衣清洁', '纸品', '个人护理', '口腔护理', '厨房用品', '酒店用品'];
  var CAT_HUE = { '洗衣清洁': 205, '纸品': 30, '个人护理': 330, '口腔护理': 175, '厨房用品': 95, '酒店用品': 260 };
  // 名称, 规格, 分类, 形状, 杭州批发价/箱
  var RAW = [
    ['薰衣草洗衣液', '3kg×4瓶/箱', 0, 'jug', 96], ['深层洁净洗衣液', '2kg×6瓶/箱', 0, 'jug', 108], ['洗衣凝珠', '52颗×8盒/箱', 0, 'box', 168],
    ['无磷洗衣粉', '1.6kg×10袋/箱', 0, 'bag', 85], ['84 消毒液', '1.2L×12瓶/箱', 0, 'bottle', 66], ['洁厕灵', '600g×20瓶/箱', 0, 'bottle', 88],
    ['玻璃清洁剂', '500ml×24瓶/箱', 0, 'spray', 120], ['地板清洁剂', '2L×6瓶/箱', 0, 'jug', 72],
    ['原木抽纸', '3层100抽×48包/箱', 1, 'pack', 118], ['卷纸', '4层180g×40卷/箱', 1, 'roll', 92], ['湿巾', '80片×24包/箱', 1, 'pack', 106],
    ['厨房纸', '2卷×24提/箱', 1, 'roll', 128], ['手帕纸', '10包×36条/箱', 1, 'pack', 78], ['盒装面巾纸', '200抽×24盒/箱', 1, 'box', 132],
    ['去屑洗发水', '750ml×12瓶/箱', 2, 'pump', 228], ['柔顺护发素', '750ml×12瓶/箱', 2, 'pump', 216], ['沐浴露', '1L×12瓶/箱', 2, 'pump', 198],
    ['香皂', '115g×72块/箱', 2, 'bar', 144], ['洗手液', '500ml×24瓶/箱', 2, 'pump', 156], ['身体乳', '400ml×12瓶/箱', 2, 'bottle', 186],
    ['美白牙膏', '120g×48支/箱', 3, 'tube', 192], ['软毛牙刷', '120支/箱', 3, 'brush', 150], ['儿童牙膏', '60g×48支/箱', 3, 'tube', 168],
    ['漱口水', '500ml×12瓶/箱', 3, 'bottle', 138],
    ['洗洁精', '1.5kg×12瓶/箱', 4, 'bottle', 84], ['果蔬洗洁精', '1.1kg×12瓶/箱', 4, 'bottle', 96], ['加厚垃圾袋', '50只×60卷/箱', 4, 'roll', 110],
    ['保鲜膜', '30cm×100m×20卷/箱', 4, 'roll', 140], ['钢丝球', '10只×50包/箱', 4, 'bag', 95], ['百洁抹布', '5条×40包/箱', 4, 'pack', 88],
    ['一次性牙具套装', '500套/箱', 5, 'box', 175], ['酒店小香皂', '15g×1000块/箱', 5, 'bar', 160], ['一次性拖鞋', '200双/箱', 5, 'pack', 130],
    ['酒店洗发沐浴', '30ml×500瓶/箱', 5, 'bottle', 220], ['一次性浴帽', '1000只/箱', 5, 'bag', 68], ['酒店卷纸', '3层×60卷/箱', 5, 'roll', 99]
  ];
  var CUST = [
    ['城东惠民超市', '王经理', 'hz', 's1', 0.97, '杭州市上城区'], ['好邻居便利（滨江店）', '李店长', 'hz', 's1', 0.98, '杭州市滨江区'],
    ['鑫鑫日用百货', '赵老板', 'hz', 's2', 0.95, '杭州市余杭区'], ['金桥批发部', '钱老板', 'hz', 's2', 0.96, '杭州市萧山区'],
    ['万家福超市', '孙经理', 'sz', 's3', 0.97, '苏州市吴中区'], ['姑苏宾馆用品', '周经理', 'sz', 's3', 0.95, '苏州市姑苏区'],
    ['乐购生活超市', '吴店长', 'hf', 's4', 0.98, '合肥市蜀山区'], ['新华路便利店', '郑老板', 'hf', 's4', 1, '合肥市庐阳区']
  ];
  var PENDING = [['平价日化店', '冯老板', '杭州市拱墅区', '138****2716'], ['阳光快捷酒店', '陈经理', '苏州市相城区', '139****0583']];
  var REVIEWS = ['货到了，包装完好，数量对得上', '比上次快一天到，司机还帮忙卸货', '抽纸那箱有点压扁了，不影响卖', '业务员很负责，缺货提前打电话说了',
    '发货照片很清楚，放心', '价格合适，下次还在这里拿', '赠品也到了，谢谢', '洗衣液有一瓶盖子松了，其他都好'];

  var POP = 'p9 p10 p1 p2 p25 p20 p14 p5 p15 p16 p17 p12 p13 p21 p24 p26 p27 p6 p11 p4 p3 p18 p22 p23 p28 p29 p30 p7 p31 p33 p36 p34 p35 p19 p8 p32'.split(' ');
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  function seed() {
    var r = rng(20261118), now = Date.now();
    var products = RAW.map(function (a, i) {
      var stock = {};
      BRANCHES.forEach(function (b) { stock[b.id] = Math.round(6 + r() * 32); });
      return { id: 'p' + (i + 1), name: a[0], spec: a[1], cat: CATS[a[2]], shape: a[3], base: a[4], cost: Math.round(a[4] * (0.72 + r() * 0.08)), stock: stock, off: false };
    });
    // 几个分店卖空了 → 该店自动下架
    [['p3', 'sz'], ['p11', 'hf'], ['p17', 'hz'], ['p22', 'sz'], ['p28', 'hf'], ['p33', 'hz'], ['p35', 'sz']].forEach(function (x) { find(products, x[0]).stock[x[1]] = 0; });
    // 压货的几样
    find(products, 'p32').stock = { hz: 48, sz: 40, hf: 36 };
    find(products, 'p19').stock = { hz: 52, sz: 38, hf: 45 };
    find(products, 'p8').stock = { hz: 40, sz: 30, hf: 34 };
    // 促销价（有起止时间）、买几送一
    var promos = { p1: [0.86, 2], p9: [0.88, 3], p15: [0.85, 1], p25: [0.9, 4], p31: [0.87, 5] };
    Object.keys(promos).forEach(function (k) { var p = find(products, k); p.promo = { k: promos[k][0], start: now - 3 * DAY, end: now + promos[k][1] * DAY + 6 * 36e5 }; });
    [['p2', 10], ['p10', 10], ['p21', 5], ['p34', 5]].forEach(function (x) { find(products, x[0]).buyN = x[1]; });

    var customers = CUST.map(function (a, i) {
      return { id: 'c' + (i + 1), name: a[0], contact: a[1], branch: a[2], sales: a[3], disc: a[4], addr: a[5], phone: '13' + ((5 + i) % 10) + '****' + (1000 + Math.round(r() * 8999)), status: 'ok', joined: now - (40 + i * 6) * DAY };
    });
    PENDING.forEach(function (a, i) { customers.push({ id: 'c' + (9 + i), name: a[0], contact: a[1], addr: a[2], phone: a[3], status: 'pending', joined: now - (i ? 3 : 1) * 36e5 * (i ? 5 : 2), disc: 1 }); });

    var db = { v: 1, products: products, customers: customers, orders: [], seq: 100, rate: 0.03, notices: [
      { t: now - 2 * DAY, title: '双十二囤货：洗衣液、抽纸限时特价', body: '活动价到本周日，满 3000 送手帕纸 1 箱。' },
      { t: now - 9 * DAY, title: '合肥仓新到酒店用品', body: '一次性牙具、拖鞋、浴帽都已到货，酒店客户可以下单了。' }
    ] };

    // 历史订单（近 20 天），最近两天的留在各个环节
    var okc = customers.filter(function (c) { return c.status === 'ok'; });
    var list = [];
    for (var d = 30; d >= 0; d--) {
      var n = d === 0 ? 3 : 3 + Math.floor(r() * 4);
      for (var j = 0; j < n; j++) list.push(now - d * DAY - (9 + r() * 8) * 36e5 + (d === 0 ? 8 * 36e5 : 0));
    }
    list.sort(function (a, b) { return a - b; });
    list.forEach(function (t, idx) {
      var c = okc[Math.floor(r() * okc.length)];
      var cart = [], cnt = 2 + Math.floor(r() * 4), used = {};
      for (var k = 0; k < cnt; k++) {
        var p = find(products, POP[Math.floor(Math.pow(r(), 1.5) * POP.length)]);
        if (used[p.id]) continue; used[p.id] = 1;
        cart.push({ pid: p.id, qty: [2, 3, 4, 5, 5, 6, 8, 10, 10, 12][Math.floor(r() * 10)] });
      }
      var o = makeOrder(db, c, cart, t, true);
      var left = list.length - idx;
      o.status = left <= 2 ? 'pay' : left <= 4 ? 'pack' : left <= 6 ? 'ship' : 'done';
      o.payShot = 'demo';
      if (o.status !== 'pay') o.t.paid = t + 0.6 * 36e5;
      if (o.status === 'ship' || o.status === 'done') { o.t.packed = t + 3 * 36e5; o.photos = ['demo1', 'demo2']; o.t.shipped = t + 5 * 36e5; o.ship = { co: ['德邦物流', '安能物流', '自家车送'][Math.floor(r() * 3)], no: 'DP' + (7000000000 + Math.floor(r() * 99999999)) }; }
      if (o.status === 'done') { o.t.signed = t + 30 * 36e5; if (r() < 0.65) o.review = { star: r() < 0.75 ? 5 : 4, text: REVIEWS[Math.floor(r() * REVIEWS.length)] }; }
      db.orders.push(o);
    });
    db.orders.reverse();
    return db;
  }

  function find(arr, id) { for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i]; return null; }
  function br(id) { return find(BRANCHES, id); }
  function staff(id) { return find(STAFF, id); }
  function price(p, branch) { return Math.round(p.base * br(branch).k); }
  function promoOn(p, t) { t = t || Date.now(); return p.promo && t >= p.promo.start && t < p.promo.end; }
  function unitPrice(p, branch, t) { var base = price(p, branch); return promoOn(p, t) ? Math.round(base * p.promo.k) : base; }
  var GIFT_LINE = 3000, GIFT_PID = 'p13';

  // 购物车 → 金额：促销价 / 客户固定折扣（促销品不再打折）/ 买 N 送 1 / 满额送
  function calc(db, cust, cart, t) {
    var lines = [], sub = 0, disc = 0, gifts = [];
    cart.forEach(function (it) {
      var p = find(db.products, it.pid); if (!p) return;
      var up = unitPrice(p, cust.branch, t), promo = promoOn(p, t), amt = up * it.qty;
      sub += amt;
      if (!promo && cust.disc < 1) disc += amt * (1 - cust.disc);
      if (p.buyN && it.qty >= p.buyN) gifts.push({ pid: p.id, qty: Math.floor(it.qty / p.buyN), why: '买' + p.buyN + '送1' });
      lines.push({ pid: p.id, qty: it.qty, price: up, list: price(p, cust.branch), promo: promo });
    });
    disc = Math.round(disc);
    if (sub - disc >= GIFT_LINE) gifts.push({ pid: GIFT_PID, qty: 1, why: '满' + GIFT_LINE + '送' });
    return { lines: lines, sub: sub, disc: disc, total: sub - disc, gifts: gifts };
  }

  function makeOrder(db, cust, cart, t, history) {
    var c = calc(db, cust, cart, t);
    db.seq++;
    var d = new Date(t);
    var no = 'HS' + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0') + db.seq;
    var o = { id: 'o' + db.seq, no: no, cid: cust.id, branch: cust.branch, sales: cust.sales, items: c.lines, gifts: c.gifts, sub: c.sub, disc: c.disc, total: c.total, status: 'pay', t: { created: t }, payShot: null, photos: [], ship: null, review: null };
    if (!history) {
      // 下单就扣这个分店的库存，扣到 0 该店自动下架
      c.lines.concat(c.gifts).forEach(function (l) { var p = find(db.products, l.pid); p.stock[cust.branch] = Math.max(0, p.stock[cust.branch] - l.qty); });
    }
    return o;
  }

  function visible(p, branch) { return !p.off && p.stock[branch] > 0; }

  // —— 存取 ——
  var mem = null;
  function load() {
    try { var s = localStorage.getItem(KEY); if (s) { var d = JSON.parse(s); if (d && d.v === 1) return d; } } catch (e) {}
    if (mem) return mem;
    var d2 = seed(); save(d2); return d2;
  }
  function save(db) { mem = db; try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {} }
  function reset() { try { localStorage.removeItem(KEY); localStorage.removeItem(KEY + '-me'); } catch (e) {} mem = null; return load(); }
  function onChange(fn) { W.addEventListener('storage', function (e) { if (e.key === KEY) { mem = null; fn(load()); } }); }

  // —— 小工具 ——
  function money(n) { return '¥' + Math.round(n).toLocaleString('zh-CN'); }
  function pad(n) { return String(n).padStart(2, '0'); }
  function time(t, withDate) {
    var d = new Date(t), now = new Date(), s = pad(d.getHours()) + ':' + pad(d.getMinutes());
    var dd = Math.round((new Date(now.toDateString()) - new Date(d.toDateString())) / DAY);
    if (dd === 0 && !withDate) return '今天 ' + s;
    if (dd === 1 && !withDate) return '昨天 ' + s;
    return (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + s;
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var STATUS = { pay: '待确认收款', pack: '备货中', ship: '已发货', done: '已签收' };
  var STEPS = ['pay', 'pack', 'ship', 'done'];

  // —— 图（全是代码画的，不用外部图片）——
  function prodImg(p) {
    var h = CAT_HUE[p.cat] + (parseInt(p.id.slice(1), 10) * 23) % 40 - 20;
    var bg = 'hsl(' + h + ',55%,93%)', c1 = 'hsl(' + h + ',62%,52%)', c2 = 'hsl(' + h + ',60%,38%)', lab = '#fff';
    var s = '';
    switch (p.shape) {
      case 'jug': s = '<rect x="30" y="34" width="40" height="52" rx="8" fill="' + c1 + '"/><rect x="40" y="24" width="14" height="12" rx="2" fill="' + c2 + '"/><path d="M62 40h8a6 6 0 0 1 0 12h-4" stroke="' + c2 + '" stroke-width="5" fill="none"/><rect x="36" y="52" width="28" height="18" rx="3" fill="' + lab + '" opacity=".9"/>'; break;
      case 'bottle': s = '<rect x="36" y="30" width="28" height="56" rx="9" fill="' + c1 + '"/><rect x="43" y="18" width="14" height="14" rx="3" fill="' + c2 + '"/><rect x="40" y="50" width="20" height="20" rx="3" fill="' + lab + '" opacity=".9"/>'; break;
      case 'pump': s = '<rect x="35" y="36" width="30" height="50" rx="8" fill="' + c1 + '"/><rect x="45" y="24" width="10" height="13" fill="' + c2 + '"/><rect x="45" y="20" width="22" height="6" rx="3" fill="' + c2 + '"/><rect x="39" y="54" width="22" height="18" rx="3" fill="' + lab + '" opacity=".9"/>'; break;
      case 'spray': s = '<rect x="38" y="38" width="26" height="48" rx="7" fill="' + c1 + '"/><path d="M42 38v-10h18l8 6v4H42z" fill="' + c2 + '"/><rect x="42" y="56" width="18" height="16" rx="3" fill="' + lab + '" opacity=".9"/>'; break;
      case 'box': s = '<path d="M22 42l28-12 28 12v34L50 88 22 76z" fill="' + c1 + '"/><path d="M50 54v34L22 76V42z" fill="' + c2 + '"/><path d="M22 42l28 12 28-12" stroke="' + lab + '" stroke-width="2" fill="none" opacity=".7"/>'; break;
      case 'pack': s = '<rect x="20" y="38" width="60" height="40" rx="10" fill="' + c1 + '"/><rect x="20" y="38" width="60" height="12" rx="6" fill="' + c2 + '"/><ellipse cx="50" cy="62" rx="14" ry="7" fill="' + lab + '" opacity=".85"/>'; break;
      case 'roll': s = '<rect x="26" y="34" width="48" height="50" rx="4" fill="' + c1 + '"/><ellipse cx="50" cy="34" rx="24" ry="8" fill="' + c2 + '"/><ellipse cx="50" cy="34" rx="7" ry="3" fill="' + bg + '"/><rect x="26" y="56" width="48" height="8" fill="' + lab + '" opacity=".6"/>'; break;
      case 'bag': s = '<path d="M30 30h40l4 54a4 4 0 0 1-4 4H30a4 4 0 0 1-4-4z" fill="' + c1 + '"/><rect x="30" y="26" width="40" height="8" rx="2" fill="' + c2 + '"/><rect x="36" y="50" width="28" height="18" rx="3" fill="' + lab + '" opacity=".9"/>'; break;
      case 'tube': s = '<path d="M28 40h44l-6 40H34z" fill="' + c1 + '" transform="rotate(-12 50 60)"/><rect x="42" y="28" width="14" height="12" rx="2" fill="' + c2 + '" transform="rotate(-12 50 60)"/><rect x="38" y="52" width="22" height="10" rx="2" fill="' + lab + '" opacity=".85" transform="rotate(-12 50 60)"/>'; break;
      case 'brush': s = '<rect x="46" y="30" width="8" height="58" rx="4" fill="' + c1 + '" transform="rotate(20 50 60)"/><rect x="44" y="18" width="12" height="16" rx="2" fill="' + c2 + '" transform="rotate(20 50 60)"/>'; break;
      case 'bar': s = '<rect x="22" y="44" width="56" height="30" rx="14" fill="' + c1 + '"/><rect x="30" y="50" width="40" height="10" rx="5" fill="' + lab + '" opacity=".5"/>'; break;
    }
    return '<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="100" height="100" fill="' + bg + '"/>' + s + '</svg>';
  }
  // 付款截图（示例）：一张转账成功的手机截图
  function payImg(o) {
    return '<svg viewBox="0 0 300 520" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="520" fill="#f2f3f5"/><rect width="300" height="54" fill="#fff"/><text x="150" y="34" font-size="15" text-anchor="middle" fill="#222" font-family="PingFang SC,sans-serif">转账详情</text>' +
      '<circle cx="150" cy="118" r="30" fill="#2bb673"/><path d="M136 118l10 10 18-20" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<text x="150" y="182" font-size="15" text-anchor="middle" fill="#444" font-family="PingFang SC,sans-serif">转账成功</text>' +
      '<text x="150" y="226" font-size="32" font-weight="600" text-anchor="middle" fill="#111" font-family="PingFang SC,sans-serif">' + Math.round(o.total).toLocaleString('zh-CN') + '.00</text>' +
      '<rect x="16" y="260" width="268" height="190" rx="10" fill="#fff"/>' +
      row(290, '收款方', '恒顺日化批发') + row(326, '收款账户', '对公账户 尾号 6608') + row(362, '付款备注', o.no) + row(398, '转账时间', time(o.t.created, true)) + row(434, '交易状态', '已到账') + '</svg>';
    function row(y, a, b) { return '<text x="32" y="' + y + '" font-size="13" fill="#888" font-family="PingFang SC,sans-serif">' + a + '</text><text x="268" y="' + y + '" font-size="13" text-anchor="end" fill="#222" font-family="PingFang SC,sans-serif">' + esc(b) + '</text>'; }
  }
  // 备货照片（示例）：仓库里码好的纸箱
  function packImg(seedStr, o) {
    var alt = seedStr === 'demo2';
    var boxes = '';
    var cols = alt ? 3 : 4, rows = alt ? 2 : 3;
    for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) {
      var w = alt ? 70 : 54, h = alt ? 56 : 44, bx = 40 + x * (w + 4) + (y % 2) * (alt ? 0 : 10), by = 210 - (y + 1) * (h + 3);
      boxes += '<rect x="' + bx + '" y="' + by + '" width="' + w + '" height="' + h + '" rx="2" fill="hsl(' + (32 + (x + y) % 3 * 4) + ',48%,' + (62 + (x * 3 + y) % 4 * 3) + '%)" stroke="#9a7547" stroke-width="1"/><rect x="' + (bx + w / 2 - 4) + '" y="' + by + '" width="8" height="' + h + '" fill="#c9a56f" opacity=".7"/>';
    }
    return '<svg viewBox="0 0 320 240" xmlns="http://www.w3.org/2000/svg"><rect width="320" height="240" fill="#d9dde2"/><rect y="150" width="320" height="90" fill="#b7bcc3"/><rect x="0" y="0" width="320" height="18" fill="#c5cad1"/>' +
      '<rect x="24" y="210" width="' + (alt ? 236 : 250) + '" height="10" fill="#8b6a43"/>' + boxes +
      '<rect x="' + (alt ? 250 : 262) + '" y="120" width="44" height="58" rx="3" fill="#fff" stroke="#999"/><text x="' + (alt ? 272 : 284) + '" y="140" font-size="9" text-anchor="middle" fill="#333" font-family="PingFang SC,sans-serif">' + (o ? esc(o.no.slice(-5)) : '') + '</text><text x="' + (alt ? 272 : 284) + '" y="156" font-size="8" text-anchor="middle" fill="#666" font-family="PingFang SC,sans-serif">已核对</text>' +
      '<text x="12" y="232" font-size="10" fill="#fff" font-family="PingFang SC,sans-serif" opacity=".9">' + (o && o.t.packed ? time(o.t.packed, true) : '') + '</text></svg>';
  }
  function imgOf(src, kind, o) {
    if (src && src.indexOf('data:') === 0) return '<img src="' + src + '" alt="">';
    return kind === 'pay' ? payImg(o) : packImg(src, o);
  }
  // 上传的图压到 640px 以内再存
  function shrink(file, cb) {
    var fr = new FileReader();
    fr.onload = function () {
      var im = new Image();
      im.onload = function () { var s = Math.min(1, 640 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = im.width * s; c.height = im.height * s; c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); cb(c.toDataURL('image/jpeg', 0.72)); };
      im.onerror = function () { cb(null); };
      im.src = fr.result;
    };
    fr.readAsDataURL(file);
  }

  W.HS = { BRANCHES: BRANCHES, STAFF: STAFF, CATS: CATS, STATUS: STATUS, STEPS: STEPS, DAY: DAY, GIFT_LINE: GIFT_LINE, GIFT_PID: GIFT_PID, KEY: KEY,
    load: load, save: save, reset: reset, onChange: onChange, find: find, br: br, staff: staff, price: price, unitPrice: unitPrice, promoOn: promoOn,
    calc: calc, makeOrder: makeOrder, visible: visible, money: money, time: time, esc: esc, prodImg: prodImg, imgOf: imgOf, shrink: shrink };
})(window);
