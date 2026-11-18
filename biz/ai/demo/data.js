/* 演示用假数据：画布页和日报页共用这一份，数字前后对得上。公司、门店、人名都是虚构的。 */
(function () {
  var stores = [
    // 门店, 昨天(11-17), 前天(11-16), 上周二(11-10), 单数, 退款笔数
    { name: '文三路店', today: 12860, yday: 12140, lastwk: 12420, orders: 412, refund: 6 },
    { name: '古墩路店', today: 10940, yday: 10320, lastwk: 10050, orders: 371, refund: 1 },
    { name: '江南大道店', today: 6210, yday: 8960, lastwk: 9020, orders: 205, refund: 0 },
    { name: '学源街店', today: 9480, yday: 9110, lastwk: 8870, orders: 356, refund: 2 },
    { name: '市心路店', today: 11350, yday: 10880, lastwk: 11020, orders: 389, refund: 1 },
    { name: '良渚店', today: 7920, yday: 7650, lastwk: 7310, orders: 268, refund: 1 }
  ];
  var group = { today: 4560, yday: 1200, lastwk: 2300, orders: 3,
    rows: [
      { who: '周敏', client: '园区一家设计公司', item: '下午茶盒（巴斯克 + 蛋挞 + 美式）', n: 120, price: 29, sum: 3480 },
      { who: '陈涛', client: '社区幼儿园', item: '肉松小贝 + 牛奶', n: 60, price: 12, sum: 720 },
      { who: '陈涛', client: '健身房前台', item: '全麦欧包', n: 24, price: 15, sum: 360 }
    ] };
  var products = [
    { name: '巴斯克芝士', qty: 236, price: 18, tag: '上新第 3 天' },
    { name: '肉松小贝', qty: 486, price: 8.5, tag: '2 家店卖空' },
    { name: '原味吐司', qty: 312, price: 12 },
    { name: '葡式蛋挞', qty: 690, price: 5 },
    { name: '美式咖啡', qty: 380, price: 9 },
    { name: '拿铁', qty: 228, price: 13 },
    { name: '全麦欧包', qty: 174, price: 16 },
    { name: '奶油泡芙', qty: 290, price: 9 }
  ];
  products.forEach(function (p) { p.sum = Math.round(p.qty * p.price); });

  function sum(arr, k) { return arr.reduce(function (s, x) { return s + x[k]; }, 0); }
  var storeToday = sum(stores, 'today'), storeYday = sum(stores, 'yday'), storeLast = sum(stores, 'lastwk');
  var total = { today: storeToday + group.today, yday: storeYday + group.yday, lastwk: storeLast + group.lastwk,
    orders: sum(stores, 'orders') + group.orders, storeOrders: sum(stores, 'orders') };
  total.avg = storeToday / total.storeOrders;
  total.vsYday = total.today / total.yday - 1;
  total.vsLast = total.today / total.lastwk - 1;

  // 分时段（7 点到 21 点，门店合计）：形状 → 按总数缩放
  var hours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
  function scale(shape, to) { var s = shape.reduce(function (a, b) { return a + b; }, 0); return shape.map(function (v) { return Math.round(v / s * to); }); }
  var hourlyToday = scale([3.6, 8.4, 9.6, 7.4, 6.9, 8.6, 6.4, 5.9, 5.6, 6.8, 8.2, 7.9, 5.9, 4.6, 1.8], storeToday);
  var hourlyLast = scale([3.4, 8.0, 9.2, 7.2, 6.8, 8.4, 6.3, 5.8, 6.2, 7.4, 8.6, 8.3, 6.2, 4.8, 1.9], storeLast);
  // 江南大道店 15:12 以后没有流水
  var jiangnanHourly = [520, 1080, 1160, 760, 640, 820, 590, 470, 170, 0, 0, 0, 0, 0, 0];
  var jiangnanLast = [380, 760, 820, 610, 560, 700, 520, 470, 540, 640, 800, 760, 520, 340, 100];

  var anomalies = [
    { level: 'red', title: '江南大道店掉了 31%', body: '只有 ¥6,210，上周二 ¥9,020。15:12 以后一笔流水都没有，不像生意差，更像收银机掉线或者下午的单没交上来。', act: '今天上午先问店长' },
    { level: 'amber', title: '肉松小贝 2 家店下午前卖空', body: '古墩路店 13:40、良渚店 14:15 卖完，下午还有顾客问。', act: '这两家今天各多备 40 个' },
    { level: 'amber', title: '文三路店退款 6 笔', body: '平时 1～2 笔。其中 5 笔是葡式蛋挞，都在 16 点以后。', act: '看一下下午那批蛋挞' }
  ];

  var conclusion = [
    '昨天一共 ¥' + Math.round(total.today).toLocaleString('en-US') + '，比上周二多 3.8%，多出来的主要是团购（周敏一单 120 份下午茶）和巴斯克芝士。',
    '江南大道店只有 ¥6,210，比上周二少 31%，15:12 以后没有流水，更像收银机掉线或漏交，建议上午先问店长。',
    '肉松小贝在古墩路店、良渚店 14 点前就卖空了，建议这两家今天各多备 40 个。',
    '巴斯克芝士上新第 3 天卖到第一，可以挪到收银台边上。',
    '文三路店退款 6 笔（平时 1～2 笔），5 笔是蛋挞，建议查一下下午那批。'
  ];

  var files = [
    { name: '文三路店_1117.xlsx', rows: 428, note: '日期｜品名｜数量｜金额，标准格式' },
    { name: '古墩路店 销售1117.xlsx', rows: 391, note: '列叫「商品名称 / 销量 / 销售额」，最后一行是合计' },
    { name: '江南大道店-11.17.csv', rows: 214, note: '收银机导出，金额前面带 ¥，中文编码不一样' },
    { name: '学源街店日报.xlsx', rows: 377, note: '第 1 行是标题，第 2 行才是表头，有合并单元格' },
    { name: '市心路店1117.xls', rows: 402, note: '老格式 xls，数量单位「个」「盒」混着写' },
    { name: '良渚店.xlsx', rows: 497, note: '分「上午」「下午」两个工作表，中午有一段重复' },
    { name: '团购登记_周敏陈涛.xlsx', rows: 7, note: '业务员手填：客户｜品项｜份数｜单价｜送达时间' }
  ];

  window.WF = {
    company: '麦田日记烘焙', day: '11月17日', week: '周二', sendAt: '11月18日 08:31',
    stores: stores, group: group, products: products, total: total,
    hours: hours, hourlyToday: hourlyToday, hourlyLast: hourlyLast,
    jiangnanHourly: jiangnanHourly, jiangnanLast: jiangnanLast,
    anomalies: anomalies, conclusion: conclusion, files: files,
    money: function (n) { return '¥' + Math.round(n).toLocaleString('en-US'); },
    pct: function (r) { var v = (r * 100).toFixed(1); return (r >= 0 ? '+' : '') + v + '%'; }
  };
})();
