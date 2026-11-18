/* 画布：摆节点、画连线、点「运行」一个个跑（全是前端动画和假数据）。 */
(function () {
  var IC = {
    trigger: '<path d="M10 3.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm0 3v3.8l2.6 1.6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    tool: '<path d="M3.5 6.5h5l1.5 2h6.5v7a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-9Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
    llm: '<path d="M10 2.8l1.6 4.1 4.1 1.6-4.1 1.6L10 14.2l-1.6-4.1-4.1-1.6 4.1-1.6L10 2.8Zm5 9.2.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z" fill="currentColor"/>',
    code: '<path d="M7 6 3 10l4 4m6-8 4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    cond: '<path d="M4 10h4l4-4.5H16M8 10l4 4.5H16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    tpl: '<path d="M5 3.5h7l3 3v10H5v-13Zm2.5 7h5m-5 3h5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"/>',
    push: '<path d="M3.5 9.5 16.5 4l-3 12-3.5-4.5-6.5-2Zm6.5 2 6.5-7.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
    human: '<path d="M10 9.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5.5 7c.6-2.8 2.8-4.5 5.5-4.5s4.9 1.7 5.5 4.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'
  };
  var $ = function (id) { return document.getElementById(id); };
  var world = $('world'), edgesSvg = $('edges'), stage = $('stage'), panel = $('panel'), logEl = $('log'), detail = $('detail');
  var Q = location.search, AUTO = /[?&]auto\b/.test(Q);
  var mobile = function () { return matchMedia('(max-width:899px)').matches; };
  var F, st = {}, timers = [], running = false, sel = null, clock = 0, ran = false, waitResolve = null;

  function icon(t) { return '<span class="node__ic" style="background:var(--t-' + t + ')"><svg viewBox="0 0 20 20">' + IC[t] + '</svg></span>'; }
  function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }
  function stopAll() { timers.forEach(clearTimeout); timers = []; running = false; waitResolve = null; }
  function nodeById(id) { return F.nodes.filter(function (n) { return n.id === id; })[0]; }
  function fmt(s) { var h = Math.floor(s / 3600), mi = Math.floor(s % 3600 / 60), se = Math.floor(s % 60); return [h, mi, se].map(function (v) { return (v < 10 ? '0' : '') + v; }).join(':'); }

  function render(key) {
    stopAll(); F = FLOWS[key]; st = {}; sel = null; ran = false;
    document.querySelectorAll('.bar__tabs button').forEach(function (b) { b.setAttribute('aria-selected', b.dataset.flow === key); });
    $('meta').innerHTML = F.meta;
    world.querySelectorAll('.node,.memo').forEach(function (e) { e.remove(); });
    world.style.width = F.world[0] + 'px'; world.style.height = F.world[1] + 'px';
    F.nodes.forEach(function (n) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'node'; b.id = n.id; b.dataset.t = n.t;
      b.style.left = n.x + 'px'; b.style.top = n.y + 'px';
      b.innerHTML = '<span class="node__h">' + icon(n.t) + '<span class="node__t"><span class="node__k">' + n.k + '</span>' + n.title + '</span></span>' +
        '<span class="node__s">' + n.sub + '</span>' + (n.tag ? '<span class="node__tag">' + n.tag + '</span>' : '') + '<span class="node__st"></span>';
      b.addEventListener('click', function () { select(n.id, true); });
      world.appendChild(b);
    });
    if (F.memo) { var mm = document.createElement('div'); mm.className = 'memo'; mm.style.left = F.memo.x + 'px'; mm.style.top = F.memo.y + 'px'; if (F.memo.w) mm.style.width = F.memo.w + 'px'; mm.innerHTML = F.memo.html; world.appendChild(mm); }
    logEl.innerHTML = '<li class="empty">点右上角「运行」，这里会一行行出日志</li>';
    $('done').hidden = true;
    setRun('运行', false, false);
    mbar('', '点右上角「运行」，看它一步步跑');
    showTab('log');
    fit(); drawEdges();
  }

  function fit() {
    if (mobile()) { world.style.transform = ''; return; }
    var sw = stage.clientWidth, sh = stage.clientHeight, ww = F.world[0], wh = F.world[1];
    var s = Math.min(1.05, (sw - 48) / ww, (sh - 70) / wh);
    var x = Math.max(16, (sw - ww * s) / 2), y = Math.max(16, (sh - wh * s) / 2 - 10);
    world.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + s + ')';
    $('zoomv').textContent = Math.round(s * 100) + '%';
  }

  function box(id) { var e = $(id), n = nodeById(id); return { x: n.x, y: n.y, w: e.offsetWidth || 230, h: e.offsetHeight || 92 }; }
  function drawEdges() {
    if (mobile()) return;
    var h = '';
    F.edges.forEach(function (ed, i) {
      var a = box(ed[0]), b = box(ed[1]), o = ed[3] || {}, d, lx, ly;
      if (o.over) {
        var x1 = a.x + a.w / 2, x2 = b.x + b.w / 2, yy = a.y - 46;
        d = 'M' + x1 + ' ' + a.y + ' C' + x1 + ' ' + yy + ' ' + x2 + ' ' + yy + ' ' + x2 + ' ' + b.y; lx = (x1 + x2) / 2; ly = yy + 11;
      } else if (b.x >= a.x + a.w) {
        var sx = a.x + a.w, sy = a.y + a.h / 2, tx = b.x, ty = b.y + b.h / 2, c = (tx - sx) / 2;
        d = 'M' + sx + ' ' + sy + ' C' + (sx + c) + ' ' + sy + ' ' + (tx - c) + ' ' + ty + ' ' + tx + ' ' + ty; lx = (sx + tx) / 2; ly = (sy + ty) / 2;
      } else if (b.x + b.w <= a.x) {
        var sx2 = a.x, sy2 = a.y + a.h / 2, tx2 = b.x + b.w, ty2 = b.y + b.h / 2, c2 = (sx2 - tx2) / 2;
        d = 'M' + sx2 + ' ' + sy2 + ' C' + (sx2 - c2) + ' ' + sy2 + ' ' + (tx2 + c2) + ' ' + ty2 + ' ' + tx2 + ' ' + ty2; lx = (sx2 + tx2) / 2; ly = (sy2 + ty2) / 2;
      } else {
        var sx3 = a.x + a.w / 2, sy3 = a.y + a.h, tx3 = b.x + b.w / 2, ty3 = b.y, c3 = (ty3 - sy3) / 2;
        d = 'M' + sx3 + ' ' + sy3 + ' C' + sx3 + ' ' + (sy3 + c3) + ' ' + tx3 + ' ' + (ty3 - c3) + ' ' + tx3 + ' ' + ty3; lx = (sx3 + tx3) / 2; ly = (sy3 + ty3) / 2;
      }
      h += '<path id="e' + i + '" d="' + d + '"/>';
      if (ed[2]) { var w = ed[2].length * 12 + 16; h += '<g class="lbl" id="l' + i + '"><rect x="' + (lx - w / 2) + '" y="' + (ly - 11) + '" width="' + w + '" height="22" rx="11"/><text x="' + lx + '" y="' + (ly + 4) + '" text-anchor="middle">' + ed[2] + '</text></g>'; }
    });
    edgesSvg.innerHTML = h;
    F.edges.forEach(function (ed, i) { paintEdge(i); });
  }
  function paintEdge(i) {
    var ed = F.edges[i], e = $('e' + i), l = $('l' + i), s = st[ed[1]], s0 = st[ed[0]], o = ed[3] || {};
    if (!e) return;
    var c = o.skip && s0 === 'ok' ? 'skip' : (s === 'run' || s === 'wait') && !o.skip ? 'on' : s === 'ok' && !o.skip && s0 === 'ok' ? 'ok' : '';
    e.setAttribute('class', c); if (l) l.setAttribute('class', 'lbl' + (c === 'on' || c === 'ok' ? ' on' : ''));
  }
  function setState(id, s) {
    st[id] = s; var e = $(id), n = nodeById(id);
    e.classList.remove('is-run', 'is-ok', 'is-wait', 'is-skip'); if (s) e.classList.add('is-' + s);
    e.querySelector('.node__st').innerHTML = s === 'run' ? '<i></i>运行中' : s === 'ok' ? '<i></i>' + n.real : s === 'wait' ? '<i></i>等确认' : '';
    F.edges.forEach(function (ed, i) { if (ed[1] === id || ed[0] === id) paintEdge(i); });
    if (s === 'run' && mobile()) e.scrollIntoView({ block: 'center', behavior: 'smooth' });
    if (sel === id) showDetail(id);
  }

  function log(html) {
    if (logEl.querySelector('.empty')) logEl.innerHTML = '';
    var li = document.createElement('li');
    li.innerHTML = '<time>' + fmt(clock) + '</time><span>' + html + '</span>';
    logEl.appendChild(li);
    var pb = panel.querySelector('.panel__body'); if (!detail.hidden) {} else pb.scrollTop = pb.scrollHeight;
    var tmp = document.createElement('div'); tmp.innerHTML = html; mbar(null, tmp.textContent.trim());
  }
  function mbar(state, txt) { if (state !== null) $('mdot').className = 'mbar__dot' + (state ? ' ' + state : ''); if (txt) $('mtxt').textContent = txt; }
  function setRun(label, dis, again) { var r = $('run'); r.disabled = dis; r.classList.toggle('is-again', !!again); r.querySelector('span').textContent = label; }

  function realSec(n) { var v = parseFloat(n.real); return isNaN(v) ? 0 : v; }

  function run() {
    if (running) return;
    stopAll(); running = true; ran = true;
    F.nodes.forEach(function (n) { setState(n.id, ''); });
    logEl.innerHTML = ''; $('done').hidden = true;
    clock = F.start[0] * 3600 + F.start[1] * 60 + F.start[2];
    setRun('运行中…', true); mbar('on', '开始运行');
    if (!mobile()) showTab('log');
    var gi = 0;
    (function nextGroup() {
      if (!running) return;
      if (gi >= F.order.length) return finish();
      var g = F.order[gi++], maxd = 0, base = clock;
      g.forEach(function (id) {
        var n = nodeById(id); setState(id, 'run'); maxd = Math.max(maxd, n.d);
        n.logs.forEach(function (line, k) {
          later(function () { clock = base + realSec(n) * (k / Math.max(1, n.logs.length)) + (g.length > 1 ? g.indexOf(id) * .2 : 0); log(line); }, n.d * (k / n.logs.length) * .9 + 60);
        });
      });
      later(function () {
        var w = g.map(nodeById).filter(function (n) { return n.wait; })[0];
        function after() {
          g.forEach(function (id) { setState(id, 'ok'); });
          clock = base + Math.max.apply(null, g.map(function (id) { return realSec(nodeById(id)); })) + .3;
          if (gi >= F.order.length) return finish();
          later(nextGroup, 180);
        }
        if (w) {
          setState(w.id, 'wait'); mbar('wait', '等你确认 1 行，点这里');
          select(w.id, true);
          waitResolve = function () { waitResolve = null; clock += 38; log('<span class="ok">✓</span> 采购主管已确认：无盐黄油数量 18 → 48'); mbar('on', '接着跑'); if (mobile()) closeSheet(); after(); };
          if (AUTO) later(function () { var i = $('fixq'); if (i) { i.value = '48'; } later(function () { waitResolve && waitResolve(); }, 900); }, 1300);
        } else after();
      }, maxd);
    })();
  }
  function finish() {
    running = false;
    var total = F.order.reduce(function (s, g) { return s + Math.max.apply(null, g.map(function (id) { return realSec(nodeById(id)); })); }, 0);
    log('<span class="ok"><b>运行成功</b></span>　' + F.nodes.length + ' 个节点，用时 ' + (F.key === 'invoice' ? '42' : total.toFixed(1)) + ' 秒');
    if (F.key === 'report') F.nodes.forEach(function () {});
    $('done').innerHTML = F.done(); $('done').hidden = false;
    setRun('再跑一次', false, true); mbar('ok', '运行成功 · ' + (F.key === 'report' ? '日报已推到群里' : '已进台账'));
    $('meta').innerHTML = F.key === 'report' ? '每天 08:30 自动跑 · 刚刚 <b>运行成功</b>' : '仓库拍照上传就跑 · 刚刚 <b>运行成功</b>';
  }

  function showTab(t) {
    panel.querySelectorAll('.panel__tabs [role=tab]').forEach(function (b) { b.setAttribute('aria-selected', b.dataset.tab === t); });
    logEl.hidden = t !== 'log'; detail.hidden = t !== 'detail';
    if (t === 'detail' && !sel) detail.innerHTML = '<p class="hint">在画布上点一个节点，看它的设置和这一步的输入输出。</p>';
  }
  function showDetail(id) {
    var n = nodeById(id), s = st[id];
    var h = '<h3>' + icon(n.t) + n.title + '</h3><p class="dk">' + n.k + ' · ' + n.sub + '</p>';
    if (s === 'wait' && F.form) h += '<h4>等你确认</h4>' + F.form;
    else if (s === 'ok') h += (typeof n.io === 'function' ? n.io() : n.io) + '<h4>设置</h4>' + n.cfg;
    else h += '<h4>设置</h4>' + n.cfg + '<h4>输入输出</h4><p class="hint">' + (s === 'run' ? '正在跑…' : '点「运行」，跑完这一步这里会出它的输入和输出。') + '</p>';
    detail.innerHTML = h;
    var c = $('confirm'); if (c) c.addEventListener('click', function () { waitResolve && waitResolve(); });
  }
  function select(id, open) {
    if (sel) { var o = $(sel); o && o.classList.remove('sel'); }
    sel = id; $(id).classList.add('sel');
    showDetail(id); showTab('detail'); panel.querySelector('.panel__body').scrollTop = 0;
    if (open && mobile()) openSheet();
  }
  function openSheet() { panel.classList.add('open'); $('scrim').hidden = false; }
  function closeSheet() { panel.classList.remove('open'); $('scrim').hidden = true; }

  document.querySelectorAll('.bar__tabs button').forEach(function (b) { b.addEventListener('click', function () { if (F.key !== b.dataset.flow) { closeSheet(); render(b.dataset.flow); } }); });
  panel.querySelectorAll('.panel__tabs [role=tab]').forEach(function (b) { b.addEventListener('click', function () { showTab(b.dataset.tab); }); });
  $('run').addEventListener('click', run);
  $('px').addEventListener('click', closeSheet); $('scrim').addEventListener('click', closeSheet);
  $('mlog').addEventListener('click', function () { showTab(st && sel && st[sel] === 'wait' ? 'detail' : 'log'); openSheet(); });
  $('mtxt').addEventListener('click', function () { if (sel && st[sel] === 'wait') { showTab('detail'); openSheet(); } });
  $('done').addEventListener('click', function (e) { var a = e.target.closest('[data-flow-go]'); if (a) { e.preventDefault(); render(a.dataset.flowGo); } });
  var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { fit(); drawEdges(); }, 80); });

  window.WFCanvas = { run: run, select: select, render: render, showTab: showTab, open: openSheet, close: closeSheet };
  render(/[?&]flow=invoice/.test(Q) ? 'invoice' : 'report');
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fit(); drawEdges(); });
  if (AUTO) setTimeout(run, 900);
})();
