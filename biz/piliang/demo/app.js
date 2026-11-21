(function () {
  var D = window.DEMO, SHOPS = D.SHOPS, GOODS = D.GOODS, FILES = D.FILES;
  var qs = new URLSearchParams(location.search);
  var SPEED = Math.max(.2, Math.min(8, parseFloat(qs.get('speed')) || 1));
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function yuan(x) { return (x < 0 ? '-' : '') + '¥' + Math.abs(x).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function clock(base, sec) { var t = base + Math.round(sec); return pad(Math.floor(t / 3600) % 24) + ':' + pad(Math.floor(t / 60) % 60) + ':' + pad(t % 60); }
  function shopOf(id) { for (var i = 0; i < SHOPS.length; i++) if (SHOPS[i].id === id) return SHOPS[i]; }
  function clen(s) { return Array.from(s.replace(/\s/g, '')).length; }
  // ?manual=1：录屏用的虚拟时钟，由 window.__tick(ms) 推进，机器卡也不影响节奏
  var MANUAL = qs.get('manual') === '1', vq = [], vnow = 0, vid = 0;
  if (MANUAL) document.documentElement.classList.add('manual');
  function after(fn, ms) { if (!MANUAL) return setTimeout(fn, ms); vq.push({ t: vnow + ms, fn: fn, id: ++vid }); return -vid; }
  function cancel(id) { if (id < 0) { for (var i = 0; i < vq.length; i++) if (vq[i].id === -id) { vq.splice(i, 1); break; } } else clearTimeout(id); }
  window.__tick = function (ms) { var end = vnow + ms; for (;;) { vq.sort(function (a, b) { return a.t - b.t; }); if (!vq.length || vq[0].t > end) break; var it = vq.shift(); vnow = it.t; it.fn(); } vnow = end; };
  var toastT;
  function toast(msg) { var t = $('toast'); t.textContent = msg; t.classList.add('show'); cancel(toastT); toastT = after(function () { t.classList.remove('show'); }, 2200); }
  function later(fn, ms) { return after(fn, ms / SPEED); }
  function isMobile() { return window.matchMedia('(max-width:899px)').matches; }

  function download(name, rows) {
    var csv = '﻿' + rows.map(function (r) { return r.map(function (c) { c = c == null ? '' : String(c); return /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(','); }).join('\r\n');
    try {
      var url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      var a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      toast('已导出 ' + name + '（' + (rows.length - 1) + ' 行）');
    } catch (e) { toast('这个浏览器不支持直接下载，换电脑浏览器试试'); }
  }

  function openModal(title, html) { $('m-title').textContent = title; $('m-body').innerHTML = html; $('modal').hidden = false; }
  function closeModal() { $('modal').hidden = true; }
  $('m-x').onclick = closeModal;
  $('modal').addEventListener('click', function (e) { if (e.target === this) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

  /* ---------------- 顶部切换 ---------------- */
  var tool = qs.get('tool') === 'recon' ? 'recon' : 'list';
  var tabs = document.querySelectorAll('.bar__tabs button');
  function setTool(t) {
    tool = t;
    tabs.forEach(function (b) { b.setAttribute('aria-selected', b.dataset.tool === t ? 'true' : 'false'); });
    $('t-list').hidden = t !== 'list'; $('t-recon').hidden = t !== 'recon';
    try { history.replaceState(null, '', t === 'recon' ? '?tool=recon' : location.pathname); } catch (e) {}
    syncRun();
  }
  tabs.forEach(function (b) { b.onclick = function () { setTool(b.dataset.tool); }; });

  function setView(sec, v) {
    if (v === 'log' && !isMobile()) v = sec.id === 't-list' ? 'goods' : 'files';
    sec.dataset.view = v;
    sec.querySelectorAll('.seg button').forEach(function (b) { b.setAttribute('aria-selected', b.dataset.view === v ? 'true' : 'false'); });
  }
  document.querySelectorAll('.tool').forEach(function (sec) {
    sec.querySelectorAll('.seg button').forEach(function (b) { b.onclick = function () { setView(sec, b.dataset.view); }; });
  });

  var run = $('run');
  function syncRun() {
    var st = tool === 'list' ? L.state : C.state, txt = '开始', cls = '';
    if (st === 'run') { txt = '暂停'; cls = 'is-pause'; }
    else if (st === 'pause') { txt = '继续'; }
    else if (st === 'done') { txt = '再跑一遍'; cls = 'is-done'; }
    run.className = 'run ' + cls; run.querySelector('span').textContent = txt;
    $('meta').innerHTML = tool === 'list' ? L.meta() : C.meta();
  }
  run.onclick = function () { (tool === 'list' ? L : C).toggle(); };

  /* ================= 工具一：多店铺批量上架 ================= */
  var rules = { trunc: true, crop: true, words: true, update: true };
  document.querySelectorAll('[data-rule]').forEach(function (inp) {
    inp.onchange = function () { rules[inp.dataset.rule] = inp.checked; toast((inp.checked ? '已打开：' : '已关掉：') + inp.parentNode.textContent.trim() + (inp.checked ? '' : '（遇到会算没上成）')); };
  });

  var L = {
    state: 'idle', tasks: [], idx: 0, results: [], timer: null, filter: 'all', q: '', attempt: {},
    meta: function () {
      var n = L.taskList().length;
      if (L.state === 'done') { var c = L.count(); return '上完了 · <b>' + (c.ok + c.warn) + ' 成功</b> · ' + c.fail + ' 没上成'; }
      return GOODS.filter(function (g) { return g.on; }).length + ' 个商品 · 3 个店铺 · ' + n + ' 个上架任务';
    },
    taskList: function () {
      var t = []; GOODS.forEach(function (g) { if (!g.on) return; SHOPS.forEach(function (s) { if (g.shops[s.id]) t.push({ g: g, s: s }); }); }); return t;
    },
    count: function (list) {
      var c = { ok: 0, warn: 0, fail: 0 }; (list || L.results).forEach(function (r) { c[r.status]++; }); return c;
    },
    toggle: function () {
      if (L.state === 'run') { L.state = 'pause'; cancel(L.timer); $('l-ptitle').textContent = '已暂停'; syncRun(); return; }
      if (L.state === 'pause') { L.state = 'run'; $('l-ptitle').textContent = '上架中…'; syncRun(); L.step(); return; }
      L.start(L.taskList());
    },
    start: function (tasks, rerun) {
      if (!tasks.length) { toast('没有要上的：先勾几个商品和店铺'); return; }
      L.tasks = tasks; L.idx = 0; L.state = 'run'; L.rerun = !!rerun;
      if (!rerun) { L.results = []; L.attempt = {}; $('l-log').innerHTML = ''; L.base = 9 * 3600 + 30 * 60; L.t = 0; }
      L.logSec(rerun ? '重跑没上成的 ' + tasks.length + ' 个任务' : '开始：' + GOODS.filter(function (g) { return g.on; }).length + ' 个商品 → 3 个店铺，共 ' + tasks.length + ' 个任务', rerun ? '按现在的规则开关重新检查' : '按每个店铺的规则先检查标题、主图、类目、库存，能自动改的先改');
      $('l-ptitle').textContent = '上架中…';
      if (isMobile()) setView($('t-list'), 'log');
      document.querySelectorAll('#t-list .sh, #t-list .gcell input').forEach(function (x) { x.disabled = true; });
      syncRun(); L.paint(); later(L.step, 300);
    },
    check: function (g, s) {
      var key = g.code + s.id, att = (L.attempt[key] || 0) + 1; L.attempt[key] = att;
      var notes = [], title = g.title;
      if (g.stock === 0) return { status: 'fail', reason: '库存为 0，先不上（补货后再上）' };
      if (g.nocat === s.id) return { status: 'fail', reason: '类目「' + g.cat + '」在' + s.plat + '没找到对应类目，跳过（在类目对照表里加一行就行）' };
      if (g.qual && g.qual.shop === s.id) return { status: 'fail', reason: s.plat + '这个类目要「' + g.qual.need + '」，店铺还没上传资质，跳过' };
      if (g.exist === s.id) {
        if (!rules.update) return { status: 'fail', reason: '店里已有同一商家编码的商品，没重复上' };
        notes.push('店里已有这个商家编码，改成更新价格和库存');
      }
      if (g.word) {
        if (!rules.words) return { status: 'fail', reason: '标题含广告法禁用词「' + g.word + '」，平台审核不过' };
        var rep = g.word === '最好用' ? '好用' : '热卖'; title = title.replace(g.word, rep);
        notes.push('标题含广告法禁用词「' + g.word + '」，已换成「' + rep + '」');
      }
      var n = clen(title);
      if (n > s.max) {
        if (!rules.trunc) return { status: 'fail', reason: '标题 ' + n + ' 字，超过' + s.plat + '的 ' + s.max + ' 字，平台拒绝' };
        var cut = title.split(' '), out = '';
        for (var i = 0; i < cut.length; i++) { var nx = out ? out + ' ' + cut[i] : cut[i]; if (clen(nx) > s.max) break; out = nx; }
        title = out; notes.push('标题 ' + n + ' 字超过 ' + s.max + ' 字，按词截断为「' + out + '」');
      }
      if (g.img !== '800×800') {
        if (!rules.crop) return { status: 'fail', reason: '主图 ' + g.img + ' 不是 1:1，' + s.plat + '要求正方形主图' };
        notes.push('主图 ' + g.img + ' 不是正方形，已居中裁成 800×800');
      }
      if (g.tmo === s.id) notes.push('接口超时，自动重试第 2 次成功');
      if (g.tmo3 === s.id && att === 1) return { status: 'fail', reason: s.plat + '接口连续 3 次超时，稍后点「重跑没上成的」', soft: true };
      if (g.tmo3 === s.id) notes.push('上次超时，这次重跑成功');
      return { status: notes.length ? 'warn' : 'ok', notes: notes, title: title };
    },
    link: function (g, s) {
      var h = 0, k = g.code + s.id; for (var i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) % 1e9;
      var id = String(7e11 + h * 97 % 1e11);
      return s.id === 'tb' ? 'item.taobao.com/item.htm?id=' + id : s.id === 'pdd' ? 'mobile.yangkeduo.com/goods.html?goods_id=' + id.slice(0, 11) : 'haohuo.jinritemai.com/views/product/item?id=3' + id + '412';
    },
    step: function () {
      if (L.state !== 'run') return;
      if (L.idx >= L.tasks.length) return L.finish();
      var t = L.tasks[L.idx++], r = L.check(t.g, t.s);
      r.g = t.g; r.s = t.s; r.time = clock(L.base, L.t); L.t += 1.4 + (r.status !== 'ok' ? 1.1 : 0);
      if (r.status !== 'fail') r.url = L.link(t.g, t.s);
      for (var i = 0; i < L.results.length; i++) if (L.results[i].g === t.g && L.results[i].s === t.s) { L.results.splice(i, 1); break; }
      L.results.push(r);
      L.logTask(r); L.paint(t.s.id);
      L.timer = later(L.step, r.status === 'ok' ? 95 : 210);
    },
    finish: function () {
      L.state = 'done'; var c = L.count();
      $('l-ptitle').textContent = '上完了';
      L.logSec('全部跑完：成功 ' + c.ok + '，自动处理后成功 ' + c.warn + '，没上成 ' + c.fail, c.fail ? '没上成的看「上架结果」，改好后点「重跑没上成的」' : '');
      document.querySelectorAll('#t-list .sh, #t-list .gcell input').forEach(function (x) { x.disabled = false; });
      L.paint(); L.renderResult(); syncRun();
      later(function () { setView($('t-list'), 'result'); }, 650);
    },
    logSec: function (a, b) {
      var li = document.createElement('li'); li.className = 'sec';
      li.innerHTML = '<time>' + clock(L.base || 34200, L.t || 0) + '</time><div class="l1"><span class="who">' + esc(a) + '</span></div>' + (b ? '<div class="sub">' + esc(b) + '</div>' : '');
      L.push(li);
    },
    logTask: function (r) {
      var li = document.createElement('li');
      var tag = r.status === 'ok' ? '<span class="tag ok">成功</span>' : r.status === 'warn' ? '<span class="tag warn">已处理·成功</span>' : '<span class="tag fail">' + (r.reason.indexOf('跳过') >= 0 || r.reason.indexOf('先不上') >= 0 ? '跳过' : '失败') + '</span>';
      var subs = (r.notes || []).map(function (n) { return '<div class="sub warn">' + esc(n) + '</div>'; }).join('') + (r.reason ? '<div class="sub fail">' + esc(r.reason) + '</div>' : '');
      li.innerHTML = '<time>' + r.time + '</time><div class="l1"><span class="who" style="color:' + r.s.color + '">' + r.s.plat + '·' + esc(r.s.name.slice(-3)) + '</span><span class="what">上架「' + esc(r.g.title.split(' ')[0]) + '」</span>' + tag + '</div>' + subs;
      L.push(li);
    },
    push: function (li) {
      var log = $('l-log'), ph = log.querySelector('.ph'); if (ph) ph.remove();
      log.appendChild(li); log.scrollTop = log.scrollHeight;
    },
    paint: function (cur) {
      var all = L.rerun ? L.results.length : L.tasks.length, c = L.count(), done = L.results.length;
      if (L.state === 'idle') { all = L.taskList().length; done = 0; }
      var tot = Math.max(1, L.rerun ? L.results.length : all);
      $('l-b-ok').style.width = (c.ok / tot * 100) + '%'; $('l-b-warn').style.width = (c.warn / tot * 100) + '%'; $('l-b-fail').style.width = (c.fail / tot * 100) + '%';
      $('l-n-ok').textContent = c.ok; $('l-n-warn').textContent = c.warn; $('l-n-fail').textContent = c.fail;
      $('l-pnum').textContent = L.state === 'idle' ? '共 ' + all + ' 个任务' : L.rerun ? '重跑 ' + L.idx + ' / ' + L.tasks.length : done + ' / ' + all;
      var per = {}; SHOPS.forEach(function (s) { per[s.id] = { n: 0, ok: 0, f: 0 }; });
      var base = L.state === 'idle' ? L.taskList() : L.rerun ? L.results : L.tasks;
      base.forEach(function (t) { per[t.s.id].n++; });
      L.results.forEach(function (r) { if (r.status === 'fail') per[r.s.id].f++; else per[r.s.id].ok++; });
      $('l-shoprow').innerHTML = SHOPS.map(function (s) {
        var p = per[s.id];
        return '<div class="shop' + (cur === s.id && L.state === 'run' ? ' is-on' : '') + '"><b><i style="background:' + s.color + '"></i>' + s.plat + '</b><span>' + (L.state === 'idle' ? p.n + ' 个待上' : p.ok + ' 成 · ' + p.f + ' 败 / ' + p.n) + '</span></div>';
      }).join('');
      syncRun();
    },
    renderGoods: function () {
      var q = L.q.trim().toLowerCase();
      var head = '<thead><tr><th class="first"><label class="gcell" style="min-width:0"><input type="checkbox" id="l-all" ' + (GOODS.every(function (g) { return g.on; }) ? 'checked' : '') + ' aria-label="全选商品">商品（标题 · 商家编码）</label></th><th>类目</th><th class="r">价格</th><th class="r">库存</th>' +
        SHOPS.map(function (s) { return '<th class="c"><button class="sh-h ghost" style="height:26px;padding:0 8px" data-col="' + s.id + '" title="这一列全选 / 全不选"><i style="background:' + s.color + '"></i>' + s.plat + '</button></th>'; }).join('') + '</tr></thead>';
      var rows = GOODS.filter(function (g) { return !q || (g.title + g.code + g.cat).toLowerCase().indexOf(q) >= 0; }).map(function (g) {
        var n = clen(g.title), meta = esc(g.code);
        if (g.img !== '800×800') meta += ' · <span class="w">主图 ' + g.img + '</span>';
        return '<tr class="' + (g.on ? '' : 'off') + '"><td class="first"><div class="gcell"><input type="checkbox" data-g="' + g.i + '" ' + (g.on ? 'checked' : '') + ' aria-label="选中 ' + esc(g.title) + '">' +
          '<span class="thumb" style="background:hsl(' + g.hue + ' 45% 58%)">' + g.icon + '</span><span class="gname"><b title="' + esc(g.title) + '">' + esc(g.title) + '</b><span>' + meta + (n > 30 ? '<em class="len" style="font-style:normal">' + n + ' 字</em>' : '') + '</span></span></div></td>' +
          '<td class="muted">' + esc(g.cat) + '</td><td class="r num">¥' + g.price.toFixed(2) + '</td><td class="r num' + (g.stock === 0 ? ' neg' : '') + '">' + g.stock + '</td>' +
          SHOPS.map(function (s) { var on = g.shops[s.id]; return '<td class="c"><button class="sh" data-g="' + g.i + '" data-s="' + s.id + '" aria-pressed="' + on + '" style="' + (on ? 'background:' + s.color : '') + '" aria-label="' + s.plat + '：' + (on ? '要上' : '不上') + '">' + s.short + '</button></td>'; }).join('') + '</tr>';
      }).join('');
      $('l-goods').innerHTML = head + '<tbody>' + (rows || '<tr><td colspan="7" class="muted" style="padding:30px;text-align:center">没搜到，换个词试试</td></tr>') + '</tbody>';
      var sel = GOODS.filter(function (g) { return g.on; }).length;
      $('l-sum').innerHTML = '已选 <b>' + sel + '</b> 个商品 · <b>' + L.taskList().length + '</b> 个上架任务';
      $('l-cnt').textContent = GOODS.length;
      var lock = L.state === 'run' || L.state === 'pause';
      document.querySelectorAll('#t-list .sh, #t-list .gcell input, #t-list [data-col]').forEach(function (x) { x.disabled = lock; });
      if (L.state === 'idle') L.paint(); else syncRun();
    },
    renderResult: function () {
      var c = L.count(), all = L.results.length;
      $('l-rcnt').textContent = all || '';
      $('l-stats').innerHTML = '<div class="stat"><span>上架任务</span><b class="num">' + all + '</b></div><div class="stat ok"><span>直接成功</span><b class="num">' + c.ok + '</b></div><div class="stat warn"><span>自动改后成功</span><b class="num">' + c.warn + '</b></div><div class="stat fail"><span>没上成</span><b class="num">' + c.fail + '</b></div>';
      var F = [['all', '全部', all], ['ok', '成功', c.ok], ['warn', '自动处理过', c.warn], ['fail', '没上成', c.fail]];
      $('l-filter').innerHTML = F.map(function (f) { return '<button data-f="' + f[0] + '" aria-pressed="' + (L.filter === f[0]) + '">' + f[1] + '<em>' + f[2] + '</em></button>'; }).join('');
      $('l-rerun').disabled = !c.fail || L.state === 'run';
      var order = { fail: 0, warn: 1, ok: 2 };
      var list = L.results.filter(function (r) { return L.filter === 'all' || r.status === L.filter; }).slice().sort(function (a, b) { return order[a.status] - order[b.status] || a.g.i - b.g.i; });
      $('l-result').innerHTML = '<thead><tr><th class="first">商品</th><th>店铺</th><th>结果</th><th>说明</th><th>商品链接</th></tr></thead><tbody>' + (list.map(function (r) {
        var tag = r.status === 'ok' ? '<span class="tag ok">成功</span>' : r.status === 'warn' ? '<span class="tag warn">已处理·成功</span>' : '<span class="tag fail">没上成</span>';
        var note = r.status === 'fail' ? r.reason : r.status === 'warn' ? r.notes.join('；') : '价格 ¥' + r.g.price.toFixed(2) + '，库存 ' + r.g.stock;
        return '<tr><td class="first"><div class="gcell" style="min-width:220px"><span class="thumb" style="background:hsl(' + r.g.hue + ' 45% 58%);width:30px;height:30px;font-size:12px">' + r.g.icon + '</span><span class="gname"><b>' + esc(r.g.title.split(' ')[0]) + '</b><span>' + r.g.code + '</span></span></div></td>' +
          '<td><span class="ptag"><i style="background:' + r.s.color + '"></i>' + r.s.plat + ' · ' + esc(r.s.name) + '</span></td><td>' + tag + '</td><td class="wrap ' + (r.status === 'ok' ? 'muted' : '') + '">' + esc(note) + '</td>' +
          '<td>' + (r.url ? '<button class="link" data-url="' + esc(r.url) + '">' + esc(r.url.slice(0, 26)) + '…</button>' : '<span class="muted">—</span>') + '</td></tr>';
      }).join('') || '<tr><td colspan="5" class="muted" style="padding:30px;text-align:center">' + (all ? '这一类没有' : '还没开始上架。点右上角「开始」') + '</td></tr>') + '</tbody>';
    },
    exportCsv: function () {
      if (!L.results.length) { toast('先点「开始」跑一遍'); return; }
      var rows = [['商家编码', '商品标题', '平台', '店铺', '结果', '说明', '商品链接', '处理时间']];
      L.results.slice().sort(function (a, b) { return a.g.i - b.g.i; }).forEach(function (r) {
        rows.push([r.g.code, r.title || r.g.title, r.s.plat, r.s.name, r.status === 'ok' ? '成功' : r.status === 'warn' ? '自动处理后成功' : '没上成', r.status === 'fail' ? r.reason : (r.notes || []).join('；'), r.url ? 'https://' + r.url : '', '2026-11-21 ' + r.time]);
      });
      download('上架结果_20261121.csv', rows);
    }
  };

  $('l-goods').addEventListener('click', function (e) {
    var b = e.target.closest('.sh'), col = e.target.closest('[data-col]');
    if (b && !b.disabled) { var g = GOODS[+b.dataset.g]; g.shops[b.dataset.s] = !g.shops[b.dataset.s]; L.renderGoods(); return; }
    if (col && !col.disabled) { var sid = col.dataset.col, allOn = GOODS.every(function (g) { return g.shops[sid]; }); GOODS.forEach(function (g) { g.shops[sid] = !allOn; }); L.renderGoods(); toast(shopOf(sid).plat + (allOn ? '：全部不上' : '：全部要上')); }
  });
  $('l-goods').addEventListener('change', function (e) {
    var inp = e.target;
    if (inp.id === 'l-all') { GOODS.forEach(function (g) { g.on = inp.checked; }); L.renderGoods(); return; }
    if (inp.dataset.g != null) { GOODS[+inp.dataset.g].on = inp.checked; L.renderGoods(); }
  });
  $('l-q').addEventListener('input', function () { L.q = this.value; L.renderGoods(); });
  $('l-filter').addEventListener('click', function (e) { var b = e.target.closest('[data-f]'); if (b) { L.filter = b.dataset.f; L.renderResult(); } });
  $('l-result').addEventListener('click', function (e) { var b = e.target.closest('[data-url]'); if (b) toast('演示数据，链接是编的：' + b.dataset.url.split('/')[0]); });
  $('l-export').onclick = L.exportCsv;
  $('l-rerun').onclick = function () {
    var f = L.results.filter(function (r) { return r.status === 'fail'; }).map(function (r) { return { g: r.g, s: r.s }; });
    if (!f.length) return; setView($('t-list'), isMobile() ? 'log' : 'goods'); L.start(f, true);
  };
  $('l-import').onclick = function () {
    openModal('导入商品表', '<p>演示里已经放好 48 个商品（当作是从「商品资料_1121.xlsx」读进来的）。实际用的时候，拿你们现在的商品表直接拖进来，列名不一样也能认。</p>' +
      '<div class="tbox"><table class="grid"><thead><tr><th>你们表里叫</th><th>对到</th></tr></thead><tbody>' +
      [['宝贝名称 / 商品名 / 标题', '标题'], ['货号 / 商家编码 / SKU', '商家编码'], ['一口价 / 售价', '价格'], ['可售库存 / 数量', '库存'], ['主图路径 / 图片文件夹', '主图'], ['分类 / 类目', '类目（按对照表换成各平台的类目）']].map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>'; }).join('') +
      '</tbody></table></div><div class="modal__btns"><button class="ghost ghost--dark" type="button" id="m-dl">下载现在这份商品表 csv</button><button class="ghost" type="button" id="m-ok">知道了</button></div>');
    $('m-ok').onclick = closeModal;
    $('m-dl').onclick = function () { download('商品资料_1121.csv', [['商家编码', '标题', '类目', '价格', '库存', '主图尺寸', '淘宝', '拼多多', '抖店']].concat(GOODS.map(function (g) { return [g.code, g.title, g.cat, g.price.toFixed(2), g.stock, g.img, g.shops.tb ? '上' : '', g.shops.pdd ? '上' : '', g.shops.dy ? '上' : '']; }))); };
  };
  $('l-log').innerHTML = '<li class="ph">点右上角「开始」<br>这里一条条显示每个店铺上架的结果<br>标题太长、主图不对这类会自动处理</li>';

  /* ================= 工具二：订单表格自动对账 ================= */
  var MAP = [
    { k: 'oid', n: '订单号', tb: '订单编号', pdd: '订单号', dy: '主订单编号', pay: '业务单号', exp: '关联订单号' },
    { k: 'item', n: '商品', tb: '宝贝标题', pdd: '商品', dy: '选购商品', pay: '', exp: '' },
    { k: 'qty', n: '数量', tb: '从宝贝标题「×2」拆', pdd: '商品数量(件)', dy: '商品数量', pay: '', exp: '', calc: { tb: 1 } },
    { k: 'amt', n: '金额', tb: '买家实际支付金额', pdd: '商家实收金额(元)', dy: '订单应付金额（子订单相加）', pay: '金额(元)', exp: '', calc: { dy: 1 } },
    { k: 'time', n: '时间', tb: '订单创建时间', pdd: '订单成交时间', dy: '订单提交时间', pay: '入账时间', exp: '揽收时间' },
    { k: 'waybill', n: '运单号', tb: '物流单号', pdd: '快递单号', dy: '快递信息（去掉「中通快递:」）', pay: '', exp: '运单号', calc: { dy: 1 } },
    { k: 'refund', n: '退款', tb: '订单状态 = 交易关闭', pdd: '售后状态', dy: '售后状态', pay: '收支类型 + 备注', exp: '', calc: { tb: 1 } }
  ];
  var MAPCOLS = [['tb', '淘宝'], ['pdd', '拼多多（两份）'], ['dy', '抖店'], ['pay', '结算流水'], ['exp', '快递揽收']];
  var STEPS = ['读入 6 张表', '认列名', '合并三个平台的订单', '去重、合并拆开的行', '跟结算流水对钱', '跟快递表对发货', '找出对不上的，出汇总'];
  var KIND = {
    short: { n: '少收款', c: 'fail' }, nopay: { n: '完成没入账', c: 'fail' }, refnobook: { n: '退款没入账', c: 'warn' },
    dupship: { n: '重复发货', c: 'fail' }, refship: { n: '退款后还发货', c: 'fail' }, nopick: { n: '打了面单没揽收', c: 'warn' }, orphan: { n: '有入账没订单', c: 'info' }
  };
  function fileById(id) { for (var i = 0; i < FILES.length; i++) if (FILES[i].id === id) return FILES[i]; }
  function col(f, name) { return f.cols.indexOf(name); }

  // 真按列名把几张表读成一张统一的表
  function engine() {
    var out = { raw: 0, orders: [], dupRemoved: 0, dyMerged: 0, bad: [], sum: {} };
    var list = [], byKey = {};
    function add(o, src) {
      out.raw++;
      var key = o.plat + o.oid, ex = byKey[key];
      if (!ex) { byKey[key] = o; o.src = src; o.sub = o.subid ? [o.subid] : []; list.push(o); return; }
      if (o.plat === 'dy' && o.subid && ex.sub.indexOf(o.subid) < 0) { ex.sub.push(o.subid); ex.item += ' + ' + o.item; ex.qty += o.qty; ex.amt = Math.round((ex.amt + o.amt) * 100) / 100; if (ex.sub.length === 2) out.dyMerged++; return; }
      out.dupRemoved++;
    }
    var tb = fileById('tb');
    tb.rows.forEach(function (r) {
      var t = r[col(tb, '宝贝标题')], q = 0; t.replace(/×(\d+)/g, function (_, n) { q += +n; }); t.split(' + ').forEach(function (p) { if (p.indexOf('×') < 0) q += 1; });
      var st = r[col(tb, '订单状态')];
      add({ plat: 'tb', oid: r[col(tb, '订单编号')], item: t.replace(/ ×\d+/g, ''), qty: q, amt: +r[col(tb, '买家实际支付金额')], time: r[col(tb, '订单创建时间')].slice(0, 16), waybill: r[col(tb, '物流单号')], refund: st === '交易关闭', status: st, done: st === '交易成功' }, 'tb');
    });
    ['pdd1', 'pdd2'].forEach(function (id) {
      var f = fileById(id);
      f.rows.forEach(function (r) {
        var st = r[col(f, '订单状态')];
        add({ plat: 'pdd', oid: r[col(f, '订单号')], item: r[col(f, '商品')], qty: +r[col(f, '商品数量(件)')], amt: +r[col(f, '商家实收金额(元)')], time: r[col(f, '订单成交时间')].replace(/\//g, '-'), waybill: r[col(f, '快递单号')], refund: r[col(f, '售后状态')] === '退款成功', status: st, done: st === '已签收' }, id);
      });
    });
    var dy = fileById('dy');
    dy.rows.forEach(function (r) {
      var st = r[col(dy, '订单状态')], wb = r[col(dy, '快递信息')];
      add({ plat: 'dy', oid: r[col(dy, '主订单编号')], subid: r[col(dy, '子订单编号')], item: r[col(dy, '选购商品')], qty: +r[col(dy, '商品数量')], amt: +r[col(dy, '订单应付金额')], time: r[col(dy, '订单提交时间')].replace(/\//g, '-').slice(0, 16), waybill: wb ? wb.split(':')[1] : '', refund: r[col(dy, '售后状态')] === '退款成功', status: st, done: st === '已完成' }, 'dy');
    });
    list.sort(function (a, b) { return a.time < b.time ? -1 : 1; });
    out.orders = list;
    // 结算流水
    var pay = fileById('pay'), payBy = {}, seen = {};
    list.forEach(function (o) { seen[o.oid] = o; o.inc = 0; o.fee = 0; o.ref = 0; o.refRow = null; o.exps = []; o.issues = []; });
    pay.rows.forEach(function (r) {
      var oid = r[col(pay, '业务单号')], type = r[col(pay, '收支类型')], amt = +r[col(pay, '金额(元)')], note = r[col(pay, '备注')], o = seen[oid];
      if (!o) { if (type === '收入') out.bad.push({ kind: 'orphan', plat: r[col(pay, '账单来源')], oid: oid, amt: amt, text: '结算流水 ' + r[0].slice(5, 16) + ' 入账 ' + yuan(amt) + '，三个平台的订单表里都找不到这一单（可能导出时漏了日期，或者是别的店的单）' }); return; }
      if (type === '收入') o.inc += amt;
      else if (note.indexOf('退款') >= 0) { o.ref += amt; o.refRow = r; }
      else o.fee += amt;
    });
    // 快递表
    var exp = fileById('exp'), expBy = {};
    exp.rows.forEach(function (r) { var o = seen[r[col(exp, '关联订单号')]]; if (o) o.exps.push({ wb: r[col(exp, '运单号')], time: r[col(exp, '揽收时间')] }); });
    var cutPay = '2026-11-12 23:59', cutPick = '2026-11-18 00:00';
    list.forEach(function (o) {
      function bad(kind, amt, text) { o.issues.push(kind); out.bad.push({ kind: kind, plat: { tb: '淘宝', pdd: '拼多多', dy: '抖店' }[o.plat], oid: o.oid, amt: amt, text: text, o: o }); }
      if (o.inc > 0 && o.inc < o.amt - .005) bad('short', o.inc - o.amt, '订单实收 ' + yuan(o.amt) + '，结算只入账 ' + yuan(o.inc) + '，少了 ' + yuan(o.amt - o.inc) + '，流水里没写原因');
      if (o.done && !o.refund && o.inc === 0 && o.time <= cutPay) bad('nopay', -o.amt, o.time.slice(5, 10) + ' 下单、订单已完成，过了结算期还没看到入账');
      if (o.refund && !o.refRow) bad('refnobook', -o.amt, '平台显示退款成功（' + yuan(o.amt) + '），结算流水里没有这笔退款，账上会多算收入');
      if (o.exps.length > 1) bad('dupship', 0, '同一单揽收了 ' + o.exps.length + ' 个包裹：' + o.exps.map(function (x) { return x.wb; }).join('、') + '，确认是不是补发，不是就联系买家退回');
      if (o.refund && o.refRow && o.exps.some(function (x) { return x.time > o.refRow[0]; })) bad('refship', -o.amt, '退款在 ' + o.refRow[0].slice(5, 16) + ' 已经退了，包裹 ' + o.exps[0].time.slice(5, 16) + ' 才揽收，货发出去了，赶紧拦截');
      if (o.waybill && !o.exps.length && !o.refund && o.time < cutPick) bad('nopick', 0, '订单上有运单号 ' + o.waybill + '，快递表里一直没有揽收记录，问一下仓库是不是漏发了');
    });
    var order = { refship: 0, dupship: 1, short: 2, nopay: 3, refnobook: 4, nopick: 5, orphan: 6 };
    out.bad.sort(function (a, b) { return order[a.kind] - order[b.kind]; });
    out.bad.forEach(function (b, i) { b.id = i; b.done = false; });
    // 汇总
    ['tb', 'pdd', 'dy'].forEach(function (p) { out.sum[p] = { n: 0, amt: 0, inc: 0, ref: 0, fee: 0, wait: 0, bad: 0 }; });
    list.forEach(function (o) {
      var s = out.sum[o.plat]; s.n++; s.amt += o.amt; s.inc += o.inc; s.ref += o.ref; s.fee += o.fee;
      if (!o.inc && !o.refund && o.time > cutPay) s.wait += o.amt;
      if (o.issues.length) s.bad++;
    });
    out.bad.forEach(function (b) { if (b.kind === 'orphan') out.sum.dy.bad++; });
    out.payRows = pay.rows.length; out.expRows = exp.rows.length;
    out.payMatched = list.filter(function (o) { return o.inc > 0; }).length;
    out.expMatched = list.filter(function (o) { return o.exps.length; }).length;
    return out;
  }

  var C = {
    state: 'idle', res: null, bfilter: 'all', ofilter: 'all', step: -1, timer: null,
    meta: function () { return C.state === 'done' ? '对完了 · ' + C.res.orders.length + ' 单 · <b>' + C.res.bad.length + ' 处对不上</b>' : '11 月 1–20 日 · 3 个平台 · 6 张表'; },
    toggle: function () {
      if (C.state === 'run') { C.state = 'pause'; cancel(C.timer); $('r-ptitle').textContent = '已暂停'; syncRun(); return; }
      if (C.state === 'pause') { C.state = 'run'; $('r-ptitle').textContent = '对账中…'; syncRun(); C.next(); return; }
      C.start();
    },
    start: function () {
      C.res = engine(); C.state = 'run'; C.step = -1; C.queue = []; C.base = 10 * 3600 + 5 * 60; C.t = 0;
      $('r-log').innerHTML = ''; $('r-ptitle').textContent = '对账中…';
      ['map', 'sum', 'bad'].forEach(function (k) { $('r-' + k + '-empty').hidden = false; });
      $('r-map-box').hidden = true; $('r-map-notes').hidden = true; $('r-sum-wrap').hidden = true; $('r-bad-wrap').hidden = true; $('r-bcnt').textContent = '';
      C.renderFiles(); C.renderSteps();
      if (isMobile()) setView($('t-recon'), 'log'); else setView($('t-recon'), 'files');
      C.plan(); syncRun(); C.next();
    },
    plan: function () {
      var r = C.res, q = C.queue, F = function (id) { return fileById(id); };
      function S(i) { q.push({ step: i }); }
      function Lg(a, b, cls, ms, fn) { q.push({ log: [a, b, cls], ms: ms || 380, fn: fn }); }
      S(0);
      FILES.forEach(function (f) { Lg('读入 ' + f.name, f.rows.length + ' 行 · ' + f.cols.length + ' 列', '', 300, function () { C.markFile(f.id); }); });
      S(1);
      Lg('认列名', '三个平台的表头都不一样，按意思对到统一的 7 个字段', '', 300, function () { if (!isMobile()) setView($('t-recon'), 'map'); C.renderMap(); });
      MAP.forEach(function (m, i) { Lg('「' + m.n + '」', [m.tb, m.pdd, m.dy].map(function (x) { return x.split('（')[0]; }).join(' / ') + ' → ' + m.n, '', 260, function () { C.showMapRow(i); }); });
      Lg('数量和运单号要拆一下', '淘宝没有数量列，从标题后面的「×2」拆；抖店运单号前面带着快递公司名，去掉', 'warn', 420);
      S(2);
      Lg('三个平台合到一张表', '淘宝 ' + F('tb').rows.length + ' + 拼多多 ' + (F('pdd1').rows.length + F('pdd2').rows.length) + ' + 抖店 ' + F('dy').rows.length + ' = ' + r.raw + ' 行', '', 500);
      S(3);
      Lg('拼多多两份表日期重叠', '11-08 ~ 11-10 两份都有，按订单号去掉重复的 ' + r.dupRemoved + ' 行', 'warn', 480);
      Lg('抖店一单买了几样会拆成几行', '按主订单号合回去 ' + r.dyMerged + ' 单，金额相加', 'warn', 480);
      Lg('去重后', '共 ' + r.orders.length + ' 单', '', 380);
      S(4);
      Lg('对结算流水', r.payRows + ' 条流水，按订单号对上 ' + r.payMatched + ' 单（收入、平台扣费、退款分开记）', '', 520);
      var cnt = {}; r.bad.forEach(function (b) { cnt[b.kind] = (cnt[b.kind] || 0) + 1; });
      ['short', 'nopay', 'refnobook', 'orphan'].forEach(function (k) { if (cnt[k]) Lg('发现 ' + cnt[k] + ' 单' + KIND[k].n, r.bad.filter(function (b) { return b.kind === k; }).map(function (b) { return b.plat + ' ' + b.oid.slice(-6); }).join('、'), 'fail', 420); });
      S(5);
      Lg('对快递揽收表', r.expRows + ' 条揽收记录，对上 ' + r.expMatched + ' 单', '', 520);
      ['dupship', 'refship', 'nopick'].forEach(function (k) { if (cnt[k]) Lg('发现 ' + cnt[k] + ' 单' + KIND[k].n, r.bad.filter(function (b) { return b.kind === k; }).map(function (b) { return b.plat + ' ' + b.oid.slice(-6); }).join('、'), 'fail', 420); });
      S(6);
      Lg('出汇总表和异常清单', r.orders.length + ' 单整理好，' + r.bad.length + ' 处对不上列进异常清单', '', 500, function () { C.renderSum(); C.renderBad(); });
      q.push({ end: true });
    },
    next: function () {
      if (C.state !== 'run') return;
      var it = C.queue.shift(); if (!it) return;
      var ms = 200;
      if (it.end) return C.finish();
      if (it.step != null) { C.step = it.step; C.renderSteps(); C.logLine('第 ' + (it.step + 1) + ' 步 · ' + STEPS[it.step], '', 'sec'); ms = 260; }
      if (it.log) { C.logLine(it.log[0], it.log[1], it.log[2]); ms = it.ms; C.t += 1 + Math.random() * 2; }
      if (it.fn) it.fn();
      C.timer = later(C.next, ms);
    },
    finish: function () {
      C.state = 'done'; C.step = 7; C.renderSteps(); $('r-ptitle').textContent = '对完了';
      C.logLine('完成：' + C.res.orders.length + ' 单，' + C.res.bad.length + ' 处对不上', '看「异常」逐条处理，处理完点「标记已处理」', 'sec');
      syncRun();
      later(function () { setView($('t-recon'), 'bad'); }, 700);
    },
    logLine: function (a, b, cls) {
      var li = document.createElement('li'); if (cls === 'sec') li.className = 'sec';
      var tag = cls === 'fail' ? '<span class="tag fail">要处理</span>' : cls === 'warn' ? '<span class="tag warn">已处理</span>' : '';
      li.innerHTML = '<time>' + clock(C.base, C.t) + '</time><div class="l1"><span class="' + (cls === 'sec' ? 'who' : 'what') + '">' + esc(a) + '</span>' + tag + '</div>' + (b ? '<div class="sub' + (cls === 'fail' ? ' fail' : cls === 'warn' ? ' warn' : '') + '">' + esc(b) + '</div>' : '');
      var log = $('r-log'), ph = log.querySelector('.ph'); if (ph) ph.remove();
      log.appendChild(li); log.scrollTop = log.scrollHeight;
    },
    renderSteps: function () {
      $('r-steps').innerHTML = STEPS.map(function (s, i) { var c = i < C.step ? 'ok' : i === C.step ? 'on' : ''; return '<li class="' + c + '"><i>' + (c ? '' : i + 1) + '</i><span>' + s + '</span></li>'; }).join('');
      var p = C.step < 0 ? 0 : Math.min(1, C.step / STEPS.length);
      $('r-bar').style.width = (p * 100) + '%';
      $('r-pnum').textContent = C.step < 0 ? '共 7 步' : C.step >= 7 ? '7 / 7' : '第 ' + (C.step + 1) + ' / 7 步';
    },
    renderFiles: function () {
      var hl = ['买家实际支付金额', '商家实收金额(元)', '订单应付金额', '订单编号', '订单号', '主订单编号'];
      $('r-files').innerHTML = FILES.map(function (f) {
        var read = C.read && C.read[f.id];
        return '<button class="file' + (read ? ' is-read' : '') + '" type="button" data-file="' + f.id + '"><div class="file__top"><span class="file__ic" style="background:' + f.color + '">' + (f.name.slice(-4) === '.csv' ? 'CSV' : 'XLS') + '</span><span class="file__n"><b>' + esc(f.name) + '</b><span>' + f.plat + ' · ' + f.range + ' · ' + f.rows.length + ' 行</span></span><span class="file__st">' + (read ? '<span class="tag ok">已读入</span>' : '<span class="tag gray">待读</span>') + '</span></div>' +
          '<div class="file__cols">' + f.cols.map(function (c) { return '<span' + (hl.indexOf(c) >= 0 ? ' class="hl"' : '') + '>' + esc(c) + '</span>'; }).join('') + '</div></button>';
      }).join('');
    },
    markFile: function (id) { C.read = C.read || {}; C.read[id] = true; C.renderFiles(); },
    renderMap: function () {
      $('r-map-empty').hidden = true; $('r-map-box').hidden = false; $('r-map-notes').hidden = false;
      $('r-map').innerHTML = '<thead><tr><th>统一成</th>' + MAPCOLS.map(function (c) { return '<th>' + c[1] + '</th>'; }).join('') + '</tr></thead><tbody>' + MAP.map(function (m, i) {
        return '<tr data-row="' + i + '"><td>' + m.n + '</td>' + MAPCOLS.map(function (c) { var v = m[c[0]]; return '<td><span class="col' + (!v ? ' none' : m.calc && m.calc[c[0]] ? ' calc' : '') + '">' + esc(v || '—') + '</span></td>'; }).join('') + '</tr>';
      }).join('') + '</tbody>';
      $('r-map-notes').innerHTML = '<li><b>蓝色的</b>是表里没有现成的列、要算一下的：淘宝的数量从标题拆、抖店的金额把子订单加起来</li><li>下个月平台改了导出格式（多一列、改个名），在对照表里改一行就行，不用重写</li><li>拼多多导了两次、日期有重叠，按订单号去重；一个订单号对多条流水的（收入、扣费、退款）分开记</li>';
    },
    showMapRow: function (i) { document.querySelectorAll('#r-map tr[data-row="' + i + '"] .col').forEach(function (x, k) { later(function () { x.classList.add('show'); }, k * 60); }); },
    showAllMap: function () { document.querySelectorAll('#r-map .col').forEach(function (x) { x.classList.add('show'); }); },
    renderSum: function () {
      var r = C.res, P = [['tb', '淘宝 · 禾木家居旗舰店', '#ff5000'], ['pdd', '拼多多 · 禾木好物馆', '#e02e24'], ['dy', '抖店 · 禾木生活官方店', '#1d1d1f']];
      $('r-sum-empty').hidden = true; $('r-sum-wrap').hidden = false; C.showAllMap();
      var tot = { n: 0, amt: 0, inc: 0, ref: 0, fee: 0, wait: 0, bad: 0 };
      var rows = P.map(function (p) {
        var s = r.sum[p[0]]; for (var k in tot) tot[k] += s[k];
        return '<tr><td><span class="ptag"><i style="background:' + p[2] + '"></i>' + p[1] + '</span></td><td class="r num">' + s.n + '</td><td class="r num">' + yuan(s.amt) + '</td><td class="r num">' + yuan(s.inc) + '</td><td class="r num neg">' + yuan(s.ref) + '</td><td class="r num neg">' + yuan(s.fee) + '</td><td class="r num"><b>' + yuan(s.inc + s.ref + s.fee) + '</b></td><td class="r num muted">' + yuan(s.wait) + '</td><td class="r">' + (s.bad ? '<span class="tag fail">' + s.bad + '</span>' : '<span class="tag ok">0</span>') + '</td></tr>';
      }).join('');
      $('r-sum').innerHTML = '<thead><tr><th>平台 · 店铺</th><th class="r">订单数</th><th class="r">订单实收</th><th class="r">已入账</th><th class="r">退款</th><th class="r">平台扣费</th><th class="r">实际到手</th><th class="r">待结算</th><th class="r">异常</th></tr></thead><tbody>' + rows + '</tbody>' +
        '<tfoot><tr><td>合计</td><td class="r num">' + tot.n + '</td><td class="r num">' + yuan(tot.amt) + '</td><td class="r num">' + yuan(tot.inc) + '</td><td class="r num neg">' + yuan(tot.ref) + '</td><td class="r num neg">' + yuan(tot.fee) + '</td><td class="r num">' + yuan(tot.inc + tot.ref + tot.fee) + '</td><td class="r num">' + yuan(tot.wait) + '</td><td class="r">' + r.bad.length + '</td></tr></tfoot>';
      C.renderOrders();
    },
    renderOrders: function () {
      var r = C.res, F = [['all', '全部'], ['bad', '有异常'], ['tb', '淘宝'], ['pdd', '拼多多'], ['dy', '抖店']];
      $('r-ofilter').innerHTML = F.map(function (f) { return '<button data-of="' + f[0] + '" aria-pressed="' + (C.ofilter === f[0]) + '">' + f[1] + '</button>'; }).join('');
      var list = r.orders.filter(function (o) { return C.ofilter === 'all' || (C.ofilter === 'bad' ? o.issues.length : o.plat === C.ofilter); });
      $('r-ocnt').textContent = list.length + ' 单';
      var PN = { tb: ['淘宝', '#ff5000'], pdd: ['拼多多', '#e02e24'], dy: ['抖店', '#1d1d1f'] };
      $('r-orders').innerHTML = '<thead><tr><th>平台</th><th>订单号</th><th>商品</th><th class="r">数量</th><th class="r">实收</th><th>下单时间</th><th>运单号</th><th class="r">入账</th><th>对账</th></tr></thead><tbody>' + list.map(function (o) {
        var st = o.issues.length ? o.issues.map(function (k) { return '<span class="tag ' + KIND[k].c + '">' + KIND[k].n + '</span>'; }).join(' ') : o.refund ? '<span class="tag gray">已退款</span>' : o.inc ? '<span class="tag ok">对上了</span>' : '<span class="tag gray">待结算</span>';
        return '<tr><td><span class="ptag"><i style="background:' + PN[o.plat][1] + '"></i>' + PN[o.plat][0] + '</span></td><td class="mono">' + o.oid + '</td><td>' + esc(o.item) + '</td><td class="r num">' + o.qty + '</td><td class="r num">' + yuan(o.amt) + '</td><td class="num muted">' + o.time.slice(5) + '</td><td class="mono muted">' + (o.waybill || '—') + '</td><td class="r num">' + (o.inc ? yuan(o.inc) : '<span class="muted">—</span>') + '</td><td>' + st + '</td></tr>';
      }).join('') + '</tbody>';
    },
    renderBad: function () {
      var r = C.res; $('r-bad-empty').hidden = true; $('r-bad-wrap').hidden = false;
      var left = r.bad.filter(function (b) { return !b.done; }).length;
      $('r-bcnt').textContent = left || '';
      var cnt = {}; r.bad.forEach(function (b) { cnt[b.kind] = (cnt[b.kind] || 0) + 1; });
      $('r-bfilter').innerHTML = '<button data-bf="all" aria-pressed="' + (C.bfilter === 'all') + '">全部<em>' + r.bad.length + '</em></button>' + Object.keys(KIND).filter(function (k) { return cnt[k]; }).map(function (k) { return '<button data-bf="' + k + '" aria-pressed="' + (C.bfilter === k) + '">' + KIND[k].n + '<em>' + cnt[k] + '</em></button>'; }).join('');
      var list = r.bad.filter(function (b) { return C.bfilter === 'all' || b.kind === C.bfilter; });
      $('r-bad').innerHTML = '<thead><tr><th>类型</th><th>平台</th><th>订单号</th><th class="r">金额差</th><th>怎么回事</th><th>处理</th></tr></thead><tbody>' + list.map(function (b) {
        return '<tr class="' + (b.done ? 'handled' : '') + '"><td><span class="tag ' + KIND[b.kind].c + '">' + KIND[b.kind].n + '</span></td><td>' + b.plat + '</td><td class="mono">' + b.oid + '</td><td class="r num ' + (b.amt < 0 ? 'neg' : '') + '">' + (b.amt ? yuan(b.amt) : '<span class="muted">—</span>') + '</td><td class="wrap">' + esc(b.text) + '</td><td><button class="done-btn" data-done="' + b.id + '" aria-pressed="' + b.done + '">' + (b.done ? '已处理 ✓' : '标记已处理') + '</button></td></tr>';
      }).join('') + '</tbody>';
    }
  };

  $('r-files').addEventListener('click', function (e) {
    var b = e.target.closest('[data-file]'); if (!b) return;
    var f = fileById(b.dataset.file), rows = f.rows.slice(0, 40);
    openModal(f.name, '<p class="muted" style="font-size:13px">' + f.plat + ' 原样导出的表，共 ' + f.rows.length + ' 行，这里显示前 ' + rows.length + ' 行。列名和格式都没动过。</p><div class="tbox"><table class="grid"><thead><tr>' + f.cols.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td' + (/^-?[\d.]+$/.test(c) && c.length < 9 ? ' class="r num"' : '') + '>' + esc(c || '') + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>');
  });
  document.querySelectorAll('[data-start]').forEach(function (b) { b.onclick = function () { if (C.state !== 'run') C.start(); }; });
  $('r-bfilter').addEventListener('click', function (e) { var b = e.target.closest('[data-bf]'); if (b) { C.bfilter = b.dataset.bf; C.renderBad(); } });
  $('r-ofilter').addEventListener('click', function (e) { var b = e.target.closest('[data-of]'); if (b) { C.ofilter = b.dataset.of; C.renderOrders(); } });
  $('r-bad').addEventListener('click', function (e) {
    var b = e.target.closest('[data-done]'); if (!b) return;
    var it = C.res.bad[+b.dataset.done]; it.done = !it.done; C.renderBad();
    var left = C.res.bad.filter(function (x) { return !x.done; }).length;
    toast(it.done ? '已标记处理，还剩 ' + left + ' 处' : '已改回未处理');
  });
  $('r-export-bad').onclick = function () {
    download('对账异常清单_1101-1120.csv', [['类型', '平台', '订单号', '金额差', '说明', '处理状态']].concat(C.res.bad.map(function (b) { return [KIND[b.kind].n, b.plat, '\t' + b.oid, b.amt ? b.amt.toFixed(2) : '', b.text, b.done ? '已处理' : '待处理']; })));
  };
  $('r-export-sum').onclick = function () {
    var PN = { tb: '淘宝', pdd: '拼多多', dy: '抖店' };
    download('订单汇总_1101-1120.csv', [['平台', '订单号', '商品', '数量', '实收', '下单时间', '运单号', '已入账', '平台扣费', '退款', '对账结果']].concat(C.res.orders.map(function (o) {
      return [PN[o.plat], '\t' + o.oid, o.item, o.qty, o.amt.toFixed(2), o.time, o.waybill ? '\t' + o.waybill : '', o.inc.toFixed(2), o.fee.toFixed(2), o.ref.toFixed(2), o.issues.length ? o.issues.map(function (k) { return KIND[k].n; }).join('、') : o.refund ? '已退款' : o.inc ? '对上了' : '待结算'];
    })));
  };
  $('r-log').innerHTML = '<li class="ph">点右上角「开始」<br>认列名 → 合并 → 去重 → 对流水 → 对快递<br>一步步跑，最后列出对不上的</li>';

  /* ---------------- 初始化 ---------------- */
  L.renderGoods(); L.renderResult(); C.renderFiles(); C.renderSteps();
  setTool(tool);
  window.addEventListener('resize', function () { document.querySelectorAll('.tool').forEach(function (s) { if (s.dataset.view === 'log' && !isMobile()) setView(s, s.id === 't-list' ? 'goods' : 'files'); }); });
  window.__demo = { L: L, C: C, setView: setView, setTool: setTool };
})();
