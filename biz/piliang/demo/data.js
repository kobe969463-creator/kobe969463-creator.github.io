/* 演示数据：店铺、商品、各平台导出的订单表（品牌和数据都是编的） */
(function () {
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  var SHOPS = [
    { id: 'tb', plat: '淘宝', name: '禾木家居旗舰店', short: '淘', color: '#ff5000', max: 30 },
    { id: 'pdd', plat: '拼多多', name: '禾木好物馆', short: '拼', color: '#e02e24', max: 30 },
    { id: 'dy', plat: '抖店', name: '禾木生活官方店', short: '抖', color: '#1d1d1f', max: 30 }
  ];

  // [标题, 类目, 价格, 库存, 特殊情况]
  var RAW = [
    ['北欧陶瓷马克杯 带盖勺 380ml 办公室咖啡杯', '杯具水具', 39.9, 320, ''],
    ['日式棉麻桌布 长方形茶几布 防水防油免洗 ins风格客厅餐桌垫子 北欧简约台布盖布', '布艺软装', 59, 186, ''],
    ['加厚珊瑚绒四件套 冬季保暖 床单被套 1.8m床', '床上用品', 199, 64, ''],
    ['304不锈钢保温杯 大容量1000ml 男女学生便携水杯', '杯具水具', 69, 420, 'exist:tb'],
    ['硅藻泥浴室防滑地垫 吸水速干 卫生间门口脚垫', '地垫地毯', 45.9, 260, 'img:750×1000'],
    ['可折叠收纳箱 大号衣物整理箱带盖 车载后备箱储物箱 家用宿舍搬家打包箱子', '收纳整理', 36.8, 510, ''],
    ['真空压缩袋 棉被衣物收纳袋 抽气加厚 8件套送手泵', '收纳整理 > 真空压缩袋', 49.9, 300, 'nocat:dy'],
    ['乌檀木实木砧板 家用切菜板 防霉菜板', '厨房用具', 89, 150, ''],
    ['大豆蜡香薰蜡烛 礼盒装 卧室助眠 生日礼物', '家居香氛', 79, 0, ''],
    ['床头置物架 免打孔 宿舍上下铺挂篮', '收纳整理', 25.9, 680, 'only:tb,pdd'],
    ['最好用的懒人拖把 免手洗平板拖把 家用一拖净', '清洁用具', 59.9, 240, 'word:最好用'],
    ['记忆棉枕头 护颈慢回弹 单人睡眠枕芯', '床上用品', 99, 130, ''],
    ['亚克力化妆品收纳盒 桌面大容量 抽屉式护肤品置物架 梳妆台口红整理盒 防尘', '收纳整理', 68, 210, ''],
    ['玻璃密封罐 五谷杂粮储物罐 带盖厨房收纳', '厨房用具', 29.9, 520, ''],
    ['全棉纱布毛巾 4条装 洗脸家用 柔软吸水', '毛巾浴巾', 39, 600, 'tmo:pdd'],
    ['手持挂烫机 家用小型便携 熨烫衣服', '生活电器', 129, 90, 'qual:dy:3C 认证'],
    ['奶油风落地衣帽架 卧室挂衣架 简易', '家具', 89, 75, 'img:1080×1440'],
    ['云南古树红茶 礼盒装 250g 2026新茶', '茶叶', 128, 80, 'qual:dy:食品经营许可证'],
    ['手工藤编收纳筐 脏衣篮 客厅杂物篮', '收纳整理', 58, 140, 'only:tb,dy'],
    ['硅胶儿童餐具套装 防摔宝宝吃饭碗勺', '母婴餐具', 49, 220, ''],
    ['壁挂电动牙刷收纳架 免打孔 卫生间置物', '卫浴用品', 32, 330, ''],
    ['双层隔热玻璃杯 带把手 拿铁咖啡杯 300ml', '杯具水具', 28, 410, ''],
    ['遮光窗帘成品 卧室客厅隔热 免打孔安装 1.5米宽 遮阳布 加厚全遮光 北欧简约', '布艺软装', 139, 95, ''],
    ['极简陶瓷花瓶 客厅插花干花摆件', '家居摆件', 46, 175, ''],
    ['冰箱收纳盒 食品级保鲜盒 冷冻饺子盒', '厨房用具', 39.9, 450, 'exist:pdd'],
    ['落地折叠晾衣架 阳台室内晒被子', '晾晒用品', 79, 160, 'tmo3:dy'],
    ['销量第一 北欧沙发抱枕 客厅靠垫', '布艺软装', 29.9, 380, 'word:第一'],
    ['竹纤维洗碗布 不沾油抹布 10片装', '清洁用具', 15.9, 900, ''],
    ['智能感应垃圾桶 自动开盖 卫生间客厅', '生活电器', 109, 60, 'qual:dy:3C 认证'],
    ['和风餐垫 隔热垫 4片装', '厨房用具', 19.9, 700, ''],
    ['不锈钢锅铲汤勺漏勺 厨具7件套 家用炒菜铲子勺子全套 加厚防烫手柄 送挂架', '厨房用具', 69, 210, 'exist:tb'],
    ['羊羔绒午睡毯 办公室盖腿沙发毯', '床上用品', 79, 140, ''],
    ['植绒防滑衣架 无痕 20个装', '晾晒用品', 29.9, 800, ''],
    ['仿真多肉盆栽 桌面绿植 办公室摆件', '家居摆件', 25.9, 260, 'img:640×480'],
    ['台面多层调料架 厨房置物架', '厨房用具', 99, 120, ''],
    ['透明抽屉式鞋盒 加厚 6个装', '收纳整理', 59, 0, ''],
    ['卧室加湿器 大雾量静音 办公室桌面', '生活电器', 89, 110, 'qual:dy:3C 认证'],
    ['可折叠布艺脏衣篓 大号洗衣篮', '收纳整理', 22.9, 430, ''],
    ['感应小夜灯 卧室床头 充电款', '灯具照明', 35.9, 380, 'nocat:dy'],
    ['防霉竹筷子 家用 10双装', '厨房用具', 19.9, 1000, ''],
    ['免打孔强力粘钩 浴室挂钩 10个装', '卫浴用品', 9.9, 2000, 'only:pdd,dy'],
    ['不锈钢手冲咖啡壶 细口壶 600ml', '杯具水具', 79, 90, 'img:800×1200'],
    ['加厚珊瑚绒浴巾 大号成人吸水', '毛巾浴巾', 49, 260, ''],
    ['抽屉分隔收纳盒 内衣袜子分格整理', '收纳整理', 26.9, 540, ''],
    ['全身落地镜 卧室穿衣镜 ins风 家用试衣镜 超白玻璃高清 带支架可挂墙 免打孔', '家具', 159, 40, 'tmo:tb'],
    ['冬季保暖猫窝 四季通用宠物窝 可拆洗 封闭式猫咪床垫 小型犬狗窝 加厚', '宠物用品', 69, 120, 'nocat:dy'],
    ['原木风小床头柜 卧室简约储物柜', '家具', 189, 30, 'img:1200×900'],
    ['硅胶防烫手套 厨房微波炉烤箱', '厨房用具', 17.9, 560, '']
  ];
  var CAT_ICON = { '杯具水具': '杯', '布艺软装': '布', '床上用品': '床', '地垫地毯': '垫', '收纳整理': '收', '收纳整理 > 真空压缩袋': '袋', '厨房用具': '厨', '家居香氛': '香', '清洁用具': '洁', '毛巾浴巾': '巾', '生活电器': '电', '家具': '木', '茶叶': '茶', '母婴餐具': '婴', '卫浴用品': '浴', '家居摆件': '摆', '晾晒用品': '晾', '灯具照明': '灯', '宠物用品': '宠' };
  var HUES = [12, 28, 160, 200, 220, 260, 330, 40, 180, 140];

  var GOODS = RAW.map(function (r, i) {
    var f = {}; (r[4] ? r[4].split(' ') : []).forEach(function (x) { var p = x.split(':'); f[p[0]] = p.slice(1); });
    var shops = { tb: true, pdd: true, dy: true };
    if (f.only) { shops = { tb: false, pdd: false, dy: false }; f.only[0].split(',').forEach(function (s) { shops[s] = true; }); }
    return {
      i: i, code: 'HM-' + (2611000 + i * 7 + 3), title: r[0], cat: r[1], price: r[2], stock: r[3], icon: CAT_ICON[r[1]] || '品',
      hue: HUES[i % HUES.length], img: f.img ? f.img[0] : '800×800', nocat: f.nocat ? f.nocat[0] : '', qual: f.qual ? { shop: f.qual[0], need: f.qual[1] } : null,
      exist: f.exist ? f.exist[0] : '', word: f.word ? f.word[0] : '', tmo: f.tmo ? f.tmo[0] : '', tmo3: f.tmo3 ? f.tmo3[0] : '', shops: shops, on: true
    };
  });

  /* ---------- 订单对账：几个平台导出的表（列名各不一样） ---------- */
  var R = rng(20261121);
  function ri(a, b) { return a + Math.floor(R() * (b - a + 1)); }
  function pick(a) { return a[Math.floor(R() * a.length)]; }
  function pad(n, w) { n = String(n); while (n.length < (w || 2)) n = '0' + n; return n; }
  function digits(n) { var s = String(ri(1, 9)); while (s.length < n) s += ri(0, 9); return s; }
  function dt(day, h, m, s) { return '2026-11-' + pad(day) + ' ' + pad(h) + ':' + pad(m) + ':' + pad(s == null ? ri(0, 59) : s); }
  function money(x) { return Math.round(x * 100) / 100; }
  var SUR = '王李张刘陈杨黄赵吴周徐孙马朱胡郭何林罗高郑梁谢宋唐许韩冯邓曹彭曾萧田董潘袁蔡蒋余于杜叶程魏苏吕丁任沈'.split('');
  var CITY = ['杭州市', '广州市', '成都市', '武汉市', '南京市', '西安市', '长沙市', '苏州市', '郑州市', '合肥市', '青岛市', '厦门市', '昆明市', '沈阳市', '福州市', '东莞市', '宁波市', '济南市'];
  var CARR = [['中通快递', '7831', 14], ['圆通速递', 'YT', 13], ['韵达快递', '4330', 13]];
  var sale = GOODS.filter(function (g) { return g.price < 160; });

  function shortName(t) { return t.split(' ')[0]; }
  function mkOrder(plat, k) {
    var day = ri(1, 20), h = ri(8, 23), m = ri(0, 59);
    var g = pick(sale), qty = R() < .72 ? 1 : R() < .7 ? 2 : 3;
    var items = [{ name: shortName(g.title), qty: qty, price: g.price }];
    if (plat === 'dy' && R() < .12) { var g2 = pick(sale); items.push({ name: shortName(g2.title), qty: 1, price: g2.price }); }
    var amt = 0; items.forEach(function (it) { amt += it.price * it.qty; });
    amt = money(amt * pick([1, 1, 1, .95, .9]) - (R() < .2 ? 3 : 0));
    var c = pick(CARR);
    var o = {
      plat: plat, day: day, time: dt(day, h, m), items: items, amt: amt,
      buyer: pick(['t', 'j', 'x', 'm', 'h', 'z', 'a', 'l']) + '**' + ri(1, 9), recv: pick(SUR) + '**', city: pick(CITY),
      carrier: c[0], waybill: c[1] + digits(c[2] - c[1].length), refund: false, ship: true
    };
    if (plat === 'tb') o.oid = '41' + digits(17);
    if (plat === 'pdd') o.oid = '2611' + pad(day) + '-' + digits(15);
    if (plat === 'dy') o.oid = '69' + digits(17);
    if (R() < .07) { o.refund = true; o.ship = R() < .5 && day <= 16; o.refundDay = o.ship ? day + ri(3, 4) : Math.min(20, day + ri(0, 1)); }
    if (!o.ship) o.waybill = '';
    o.done = day <= 17; o.settleDay = day + ri(7, 8);
    return o;
  }
  var ORDERS = [], i;
  for (i = 0; i < 124; i++) ORDERS.push(mkOrder('tb', i));
  for (i = 0; i < 96; i++) ORDERS.push(mkOrder('pdd', i));
  for (i = 0; i < 72; i++) ORDERS.push(mkOrder('dy', i));
  ORDERS.sort(function (a, b) { return a.time < b.time ? -1 : 1; });

  // 埋几处对不上的（跑完能找出来）
  function candidates(fn) { return ORDERS.filter(function (o) { return !o.mark && fn(o); }); }
  function plant(kind, n, fn, extra) { var c = candidates(fn), step = Math.max(1, Math.floor(c.length / n)); for (var k = 0; k < n && k * step < c.length; k++) { var o = c[k * step + Math.floor(R() * Math.min(step, c.length - k * step))]; o.mark = kind; if (extra) extra(o); } }
  plant('short', 3, function (o) { return o.day <= 10 && !o.refund && o.amt > 40 && o.items.length === 1; }, function (o) { o.shortBy = pick([6.5, 12, 18.8]); });
  plant('nopay', 2, function (o) { return o.day >= 6 && o.day <= 11 && !o.refund; });
  plant('dupship', 2, function (o) { return o.day >= 4 && !o.refund && o.plat !== 'pdd' && o.ship; });
  plant('refnobook', 3, function (o) { return o.day >= 3 && o.day <= 12 && o.items.length === 1; }, function (o) { o.refund = true; o.refundDay = o.day + 2; o.ship = true; o.waybill = o.waybill || 'YT' + digits(11); });
  plant('refship', 1, function (o) { return o.day >= 8 && o.day <= 14 && o.plat === 'pdd'; }, function (o) { o.refund = true; o.refundDay = o.day; o.ship = true; o.waybill = o.waybill || '7831' + digits(10); });
  plant('nopick', 2, function (o) { return o.day >= 12 && o.day <= 16 && !o.refund && o.ship; });
  // 拼多多两次导出重叠的日期（11-08 ~ 11-10）
  var PDD_OVER = ORDERS.filter(function (o) { return o.plat === 'pdd' && o.day >= 8 && o.day <= 10; });

  function tbStatus(o) { return o.refund ? '交易关闭' : o.day >= 18 ? '卖家已发货' : '交易成功'; }
  function pddStatus(o) { return o.refund ? '已取消' : o.day >= 18 ? '已发货，待签收' : '已签收'; }
  function dyStatus(o) { return o.refund ? '已关闭' : o.day >= 18 ? '已发货' : '已完成'; }
  function itemsText(o) { return o.items.map(function (it) { return it.name + (it.qty > 1 ? ' ×' + it.qty : ''); }).join(' + '); }

  var FILES = [];
  // 淘宝
  FILES.push({
    id: 'tb', plat: '淘宝', color: '#ff5000', name: '淘宝_订单导出_20261120.xlsx', range: '11-01 ~ 11-20',
    cols: ['订单编号', '买家会员名', '宝贝标题', '买家实际支付金额', '订单状态', '订单创建时间', '物流单号'],
    rows: ORDERS.filter(function (o) { return o.plat === 'tb'; }).map(function (o) { return [o.oid, o.buyer, itemsText(o), o.amt.toFixed(2), tbStatus(o), o.time, o.waybill]; })
  });
  // 拼多多（两个文件，11-08 ~ 11-10 重叠）
  function pddRow(o) { return [o.oid, o.items[0].name, String(o.items[0].qty), o.amt.toFixed(2), pddStatus(o), o.time.slice(0, 16).replace(/-/g, '/'), o.waybill, o.refund ? '退款成功' : '无售后']; }
  var pddCols = ['订单号', '商品', '商品数量(件)', '商家实收金额(元)', '订单状态', '订单成交时间', '快递单号', '售后状态'];
  FILES.push({ id: 'pdd1', plat: '拼多多', color: '#e02e24', name: '拼多多_订单_1101-1110.xlsx', range: '11-01 ~ 11-10', cols: pddCols, rows: ORDERS.filter(function (o) { return o.plat === 'pdd' && o.day <= 10; }).map(pddRow) });
  FILES.push({ id: 'pdd2', plat: '拼多多', color: '#e02e24', name: '拼多多_订单_1108-1120.xlsx', range: '11-08 ~ 11-20', cols: pddCols, rows: ORDERS.filter(function (o) { return o.plat === 'pdd' && o.day >= 8; }).map(pddRow) });
  // 抖店（一单多个商品拆成几行）
  var dyRows = [];
  ORDERS.filter(function (o) { return o.plat === 'dy'; }).forEach(function (o) {
    var tot = 0; o.items.forEach(function (it) { tot += it.price * it.qty; });
    var left = o.amt;
    o.items.forEach(function (it, k) {
      var part = k === o.items.length - 1 ? money(left) : money(o.amt * it.price * it.qty / tot); left -= part;
      dyRows.push([o.oid, o.oid.slice(0, 15) + pad(k + 1, 4), it.name, String(it.qty), part.toFixed(2), dyStatus(o), o.time.replace(/-/g, '/'), o.waybill ? o.carrier + ':' + o.waybill : '', o.refund ? '退款成功' : '-']);
    });
  });
  FILES.push({ id: 'dy', plat: '抖店', color: '#1d1d1f', name: '抖店_订单明细_1120.csv', range: '11-01 ~ 11-20', cols: ['主订单编号', '子订单编号', '选购商品', '商品数量', '订单应付金额', '订单状态', '订单提交时间', '快递信息', '售后状态'], rows: dyRows });

  // 结算流水（三个平台的账单拼成一张）
  var pay = [], fee = { tb: .006, pdd: .006, dy: .02 }, platName = { tb: '淘宝', pdd: '拼多多', dy: '抖店' };
  ORDERS.forEach(function (o) {
    if (o.done && o.settleDay <= 20 && o.mark !== 'nopay' && !(o.refund && !o.ship && o.refundDay <= o.day + 1 && o.mark !== 'refnobook')) {
      var inc = o.mark === 'short' ? money(o.amt - o.shortBy) : o.amt;
      pay.push([dt(o.settleDay, ri(1, 6), ri(0, 59)), platName[o.plat], o.oid, '收入', inc.toFixed(2), '订单结算']);
      pay.push([dt(o.settleDay, ri(1, 6), ri(0, 59)), platName[o.plat], o.oid, '支出', '-' + money(o.amt * fee[o.plat]).toFixed(2), o.plat === 'dy' ? '平台服务费' : '技术服务费']);
    }
    if (o.refund && o.mark !== 'refnobook') {
      var paid = o.done && o.settleDay <= 20 && !(!o.ship && o.refundDay <= o.day + 1);
      if (paid) pay.push([dt(o.refundDay, ri(9, 18), ri(0, 59)), platName[o.plat], o.oid, '支出', '-' + o.amt.toFixed(2), '售后退款']);
      else pay.push([dt(o.refundDay, ri(9, 18), ri(0, 59)), platName[o.plat], o.oid, '退款', '0.00', '未结算订单退款（不动账）']);
    }
  });
  pay.push([dt(15, 3, 12), '抖店', '69' + digits(17), '收入', '86.00', '订单结算']);
  pay.sort(function (a, b) { return a[0] < b[0] ? -1 : 1; });
  FILES.push({ id: 'pay', plat: '结算流水', color: '#3b5bdb', name: '三平台结算账单_11月.xlsx', range: '11-01 ~ 11-20', cols: ['入账时间', '账单来源', '业务单号', '收支类型', '金额(元)', '备注'], rows: pay });

  // 快递揽收表（电子面单系统导出）
  var exp = [];
  ORDERS.forEach(function (o) {
    if (!o.waybill || o.mark === 'nopick') return;
    var pd = o.mark === 'refship' ? o.day : Math.min(20, o.day + (R() < .6 ? 0 : 1));
    var ph = o.mark === 'refship' ? 21 : ri(15, 20);
    exp.push([o.waybill, o.oid, dt(pd, ph, ri(0, 59)), o.recv, o.city, (ri(3, 30) / 10).toFixed(1)]);
    if (o.mark === 'dupship') exp.push(['7831' + digits(10), o.oid, dt(Math.min(20, pd + 1), ri(15, 19), ri(0, 59)), o.recv, o.city, (ri(3, 30) / 10).toFixed(1)]);
  });
  exp.sort(function (a, b) { return a[2] < b[2] ? -1 : 1; });
  FILES.push({ id: 'exp', plat: '快递', color: '#0c8599', name: '电子面单_揽收记录_1120.xlsx', range: '11-01 ~ 11-20', cols: ['运单号', '关联订单号', '揽收时间', '收件人', '目的地', '重量(kg)'], rows: exp });

  // 退款时间（给「退款后还发货」那单用：退款在白天，揽收在晚上 21 点）
  ORDERS.forEach(function (o) { if (o.mark === 'refship') { pay.forEach(function (r) { if (r[2] === o.oid && r[5].indexOf('退款') >= 0) r[0] = dt(o.refundDay, 10, 26); }); } });

  window.DEMO = { SHOPS: SHOPS, GOODS: GOODS, FILES: FILES, PDD_OVER: PDD_OVER.length };
})();
