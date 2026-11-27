const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const hm = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(Math.floor(m % 60)).padStart(2, '0')}`;
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pad = n => String(n).padStart(2, '0');
let N = 10, SEC = 12, outputs = [], selected = null, running = false;

const ACCOUNTS = [
  {id: 'a1', name: '半山柚茶·官方', tag: '主号', color: '#ff6a28', fans: '1.2万'},
  {id: 'a2', name: '柚茶小酒窝', tag: '探店号', color: '#f5458a', fans: '8,630'},
  {id: 'a3', name: '滨江吃喝指南', tag: '本地号', color: '#3b7bff', fans: '2.4万'},
  {id: 'a4', name: '半山柚茶·二店', tag: '分店号', color: '#18a86b', fans: '3,170'},
];
// 每个号的发布时段（分钟），错开避免同一时间扎堆
const SLOTS = {a1: [11 * 60 + 30, 17 * 60 + 10, 20 * 60 + 30], a2: [12 * 60 + 15, 18 * 60 + 5, 21 * 60 + 10],
  a3: [13 * 60 + 0, 19 * 60 + 20], a4: [14 * 60 + 10, 20 * 60 + 0]};
const sched = {clock: 11 * 60, running: false, items: [], feed: []};

function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2200); }
function show(view) {
  $$('nav a[data-view]').forEach(a => a.classList.toggle('on', a.dataset.view === view));
  $$('.view').forEach(v => v.classList.toggle('on', v.id === view));
  if (view === 'lib') renderLib();
  if (view === 'plan') drawPlan();
  window.scrollTo(0, 0);
  playVisible();
}
$$('nav a[data-view]').forEach(a => a.onclick = () => show(a.dataset.view));
$$('nav a.dim').forEach(a => a.onclick = () => toast('这个模块下个版本上线'));
document.addEventListener('click', e => { const g = e.target.closest('[data-goto]'); if (g) show(g.dataset.goto); });

// 只播放屏幕里看得到的视频，手机上省流量
const io = new IntersectionObserver(es => es.forEach(e => {
  const v = e.target;
  if (e.isIntersecting && v.offsetParent) { v.preload = 'auto'; v.play().catch(() => {}); } else v.pause();
}), {threshold: .15});
function watch(root) { root.querySelectorAll('video[data-io]').forEach(v => { v.muted = true; io.observe(v); }); }
function playVisible() { $$('video[data-io]').forEach(v => { io.unobserve(v); io.observe(v); }); }

// ---- 素材 ----
function loadFolder() {
  const f = window.FOLDER;
  $('#folderPath').textContent = f.path;
  const tot = f.videos.reduce((a, v) => a + v.duration, 0);
  $('#folderMeta').textContent = `${f.videos.length} 段视频 · ${f.audio.length} 首音乐 · 共 ${Math.round(tot)} 秒`;
  $('#tiles').innerHTML = f.videos.map(v => `<div class="tile"><video data-io src="./${v.url}" muted loop playsinline preload="metadata"></video><span>${esc(v.name)}<em>${v.duration}s</em></span></div>`).join('');
  watch($('#tiles'));
  const a = f.audio[0];
  const bars = Array.from({length: 64}, (_, i) => 20 + Math.abs(Math.sin(i * .7) * 55 + Math.sin(i * 2.3) * 25));
  $('#bgm').innerHTML = a ? `<span class="note"><svg viewBox="0 0 24 24"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg></span>
    <b>${esc(a.name)}</b><div class="wave">${bars.map(h => `<i style="height:${h}%"></i>`).join('')}</div><span class="muted">0:${String(a.duration).padStart(2, '0')}</span>` : '';
}

// ---- 表单 ----
function seg(id, cb) {
  $$(`#${id} button`).forEach(b => b.onclick = () => {
    if (b.classList.contains('lock')) return toast(`这批素材 ${window.FOLDER.videos.length} 段，一次最多出 10 条不重样的，多放几段素材就能出 20 条`);
    $$(`#${id} button`).forEach(x => x.classList.toggle('on', x === b)); cb(+b.dataset.v);
  });
}
seg('segN', v => { N = v; $('#go span').textContent = `一键生成 ${v} 条`; drawStrip(); });
seg('segS', v => SEC = v);
$$('#opts span').forEach(s => s.onclick = () => s.classList.toggle('on'));
function drawStrip(done = [], busy = -1) {
  const box = $('#strip'), n = Math.min(N, 10);
  while (box.children.length > n) box.lastChild.remove();
  while (box.children.length < n) box.appendChild(document.createElement('div'));
  [...box.children].forEach((el, i) => {
    const key = done[i] ? 'img' + done[i].cover : i === busy ? 'busy' : 'empty';
    if (el.dataset.k === key) return;
    el.dataset.k = key;
    el.className = 'slot' + (key === 'busy' ? ' busy' : '');
    el.innerHTML = done[i] ? `<img src="./${done[i].cover}" alt=""><b>${pad(i + 1)}</b>` : '';
  });
}
function setLatest(o) { $('#latest').innerHTML = `<video src="./${o.file}" muted autoplay loop playsinline></video><b>${pad(o.id)}</b>`; }

// 按勾选的去重项整理每条成片的参数
function build(opts) {
  const src = window.OUTPUTS.slice(0, N);
  return src.map(o => ({...o,
    speed: opts.speed ? o.speed : 1.0, mirror: opts.mirror ? o.mirror : false, crop: opts.crop ? o.crop : 0,
    bright: opts.color ? o.bright : 0, sat: opts.color ? o.sat : 1, bgm_off: opts.bgm_offset ? o.bgm_off : 0,
    sims: o.sims.slice(0, N)})).map(o => ({...o, max_sim: Math.max(...o.sims.filter((_, j) => j !== o.id - 1))}));
}
function tagList(o) { return [`${o.speed}x`, o.mirror ? '镜像' : '', o.crop ? `裁边${Math.round(o.crop * 100)}%` : ''].filter(Boolean); }

const ORDER = ['scan', 'slice', 'copy', 'render', 'check', 'done'];
function setStep(step, done = 0, total = N) {
  const si = ORDER.indexOf(step);
  $$('#steps li').forEach(li => { const i = ORDER.indexOf(li.dataset.s); li.className = i < si ? 'ok' : i === si ? 'doing' : ''; });
  $('#renderN').textContent = step === 'render' || si > 3 ? `${done}/${total}` : '';
  const pct = step === 'done' ? 100 : Math.round([2, 6, 10, 14, 92][Math.max(0, si)] + (step === 'render' ? 78 * done / Math.max(1, total) : 0));
  $('#runPct').textContent = pct + '%'; $('#runBar').style.width = pct + '%';
}
function log(msg) {
  const d = document.createElement('div'), t = new Date();
  d.innerHTML = `<i>${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}</i>${esc(msg)}`; $('#console').appendChild(d);
  while ($('#console').children.length > 12) $('#console').firstChild.remove();
}

$('#go').onclick = async () => {
  if (running) return;
  const opts = {}; $$('#opts span').forEach(s => opts[s.dataset.k] = s.classList.contains('on'));
  const list = build(opts), t0 = Date.now();
  running = true; outputs = []; renderedLib = '';
  $('#form').hidden = true; $('#run').hidden = false; $('#runDone').hidden = true;
  $('#runTitle').textContent = '正在生成'; $('#console').innerHTML = ''; $('#libCount').textContent = '';
  $('#latest').innerHTML = '<span>成片会在这里预览</span>'; $('#strip').innerHTML = ''; drawStrip();
  if (innerWidth <= 860) $('#run').scrollIntoView({behavior: 'smooth', block: 'start'});
  const f = window.FOLDER, tot = f.videos.reduce((a, v) => a + v.duration, 0);
  setStep('scan'); await sleep(500);
  log(`扫描：${f.videos.length} 段视频，共 ${Math.round(tot)} 秒；背景音乐：背景音乐_${f.audio[0].name}.m4a`);
  setStep('slice'); await sleep(500);
  log('切片：按镜头切成 18 个片段');
  setStep('copy'); log('文案：按卖点写标题和字幕…'); await sleep(900);
  log(`文案：写好 ${list.length} 组标题 + 字幕`);
  setStep('render', 0, list.length); drawStrip([], 0); $('#stripMeta').textContent = `已出 0 / ${list.length}`;
  for (let i = 0; i < list.length; i++) {
    await sleep(N <= 5 ? 600 : 380);
    const o = list[i]; outputs.push(o);
    log(`合成：${o.name}（${o.duration}s，${o.clips.length} 个镜头，${tagList(o).join(' / ')}）`);
    setStep('render', i + 1, list.length); setLatest(o);
    drawStrip(outputs, i + 1 < list.length ? i + 1 : -1);
    $('#stripMeta').textContent = `已出 ${outputs.length} / ${list.length}`;
  }
  setStep('check', list.length, list.length); await sleep(700);
  log(`去重自检：${list.length} 条两两比对，最高画面相似度 ${Math.max(...list.map(o => o.max_sim))}%`);
  const d = new Date(), dir = `${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  log(`完成：${list.length} 条成片，用时 ${Math.round((Date.now() - t0) / 1000)} 秒，保存在 输出/${dir}/`);
  setStep('done', list.length, list.length); running = false;
  $('#stripMeta').textContent = `${outputs.length} 条`; $('#libCount').textContent = outputs.length;
  $('#runTitle').textContent = '生成完成'; $('#runDone').hidden = false; $$('#steps li').forEach(li => li.className = 'ok');
  toast(`${outputs.length} 条成片已生成`);
  plan();
};
$('#again').onclick = () => { $('#run').hidden = true; $('#form').hidden = false; };

// ---- 成片库 ----
let renderedLib = '';
function renderLib() {
  if (!outputs.length || running) {
    $('#libStats').innerHTML = '';
    $('#grid').innerHTML = `<div class="empty-box"><p>${running ? '正在生成，稍等几秒' : '还没有成片'}</p><button class="primary sm" data-goto="gen">去批量生成</button></div>`;
    $('#mx').innerHTML = ''; $('#mxSum').textContent = ''; $('#mxNote').innerHTML = '生成后这里会把每两条成片比一遍画面，看有没有太像的。';
    renderedLib = ''; return;
  }
  const avg = outputs.reduce((a, o) => a + o.duration, 0) / outputs.length, mx = Math.max(...outputs.map(o => o.max_sim ?? 0));
  $('#libStats').innerHTML = `<span><b>${outputs.length}</b> 条</span><span>平均 <b>${avg.toFixed(1)}</b> 秒</span><span>两两画面相似度最高 <b>${mx}%</b></span>`;
  const key = outputs.map(o => o.id + o.title + o.speed + o.mirror + o.crop).join();
  if (renderedLib !== key) {
    renderedLib = key;
    $('#grid').innerHTML = outputs.map((o, i) => `<div class="vc" data-i="${i}"><div class="vbox"><video data-io src="./${o.file}" poster="./${o.cover}" muted loop playsinline preload="none"></video>
      <span class="num">${pad(o.id)}</span><span class="dur">${o.duration}s</span><span class="play"><svg viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z"/></svg></span></div>
      <div class="t">${esc(o.title)}</div><div class="tags">${tagList(o).map(t => `<i>${t}</i>`).join('')}</div></div>`).join('');
    $$('.vc').forEach(c => c.onclick = () => pick(+c.dataset.i));
    watch($('#grid'));
  }
  const col = v => { const k = Math.min(1, v / 70); return `rgb(${255},${Math.round(246 - 140 * k)},${Math.round(240 - 200 * k)})`; };
  $('#mx').style.gridTemplateColumns = `repeat(${outputs.length},minmax(0,1fr))`;
  $('#mx').innerHTML = outputs.map((o, i) => o.sims.map((v, j) => i === j ? '<i class="self"></i>' : `<i style="background:${col(v)}">${v}</i>`).join('')).join('');
  const pairs = outputs.length * (outputs.length - 1) / 2;
  $('#mxSum').textContent = `${pairs} 组`;
  $('#mxNote').innerHTML = mx < 60 ? `两两比对 ${pairs} 组，最像的一对 ${mx}%，<b>都在 60% 以下</b>，每条的镜头组合都不一样。` : `有成片相似度到了 ${mx}%，建议多放几段素材再生成。`;
}
function pick(i) {
  const o = outputs[i]; selected = i;
  $$('.vc').forEach(c => c.classList.toggle('on', +c.dataset.i === i));
  $('#modal').hidden = false; document.body.classList.add('lock');
  $('#detail').innerHTML = `<button class="x" id="closeM" aria-label="关闭">✕</button><video src="./${o.file}" poster="./${o.cover}" autoplay loop muted playsinline controls></video><div class="info">
    <div class="lbl">成片 ${pad(o.id)} · ${o.duration} 秒</div><h3>${esc(o.title)}</h3>
    <dl class="kv"><dt>镜头顺序</dt><dd>${o.clips.map(esc).join(' → ')}</dd><dt>变速</dt><dd>${o.speed}x</dd><dt>镜像</dt><dd>${o.mirror ? '是' : '否'}</dd>
    <dt>裁边</dt><dd>${Math.round(o.crop * 100)}%</dd><dt>调色</dt><dd>亮度 ${o.bright > 0 ? '+' : ''}${o.bright} · 饱和 ${o.sat}</dd>
    <dt>字幕</dt><dd>${esc(o.cap_style)} / 标题${esc(o.title_style)}</dd><dt>音乐</dt><dd>从第 ${o.bgm_off} 秒起</dd><dt>相似度</dt><dd>与其他成片最高 ${o.max_sim}%</dd></dl>
    <div class="lbl">字幕</div><ul class="lines">${o.lines.map(l => `<li>${esc(l)}</li>`).join('')}</ul></div>`;
  $('#closeM').onclick = closeModal;
}
function closeModal() { $('#modal').hidden = true; $('#detail').innerHTML = ''; document.body.classList.remove('lock'); $$('.vc').forEach(c => c.classList.remove('on')); }
$('#modal').onclick = e => { if (e.target.id === 'modal') closeModal(); };
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#modal').hidden) closeModal(); });

// ---- 发布排程 ----
const T0 = 10 * 60, T1 = 22 * 60, X = m => (m - T0) / (T1 - T0) * 100;
$('#hours').innerHTML = Array.from({length: 7}, (_, i) => `<span style="left:${i * 100 / 6}%">${10 + i * 2}:00</span>`).join('');
function plan() {
  const slots = Object.entries(SLOTS).flatMap(([a, ms]) => ms.map(m => [m, a])).sort((x, y) => x[0] - y[0]);
  sched.items = outputs.map((o, i) => { const [m, a] = slots[i % slots.length];
    return {id: i + 1, account: a, minute: m, video: o.name, title: o.title, cover: o.cover, status: 'queued'}; });
  sched.clock = 11 * 60; sched.running = false; sched.feed = [];
  $$('.track').forEach(t => t.innerHTML = '');
  $('#feed').dataset.n = -1;
}
function drawPlan() {
  const s = {...sched, accounts: ACCOUNTS};
  $('#clock').textContent = hm(s.clock);
  $('.clock').classList.toggle('live', s.running);
  const done = s.items.filter(i => i.status === 'done').length;
  $('#planSum').textContent = s.items.length ? `${s.accounts.length} 个账号 · ${s.items.length} 条 · 已发 ${done}` : '先去生成成片';
  $('#startPub').disabled = s.running || !s.items.length || done === s.items.length;
  $('#startPub').textContent = s.running ? '自动发布中…' : done && done === s.items.length ? '今天的都发完了' : '开始自动发布';
  const st = {queued: '排队中', publishing: '发布中', done: '已发布', failed: '失败'};
  if (!$('#rows').dataset.ready) {
    $('#rows').innerHTML = s.accounts.map(a => `<div class="row"><div class="acc"><span class="av" style="background:${a.color}">${a.name[0]}</span>
      <div><b>${esc(a.name)}</b><small><i style="background:${a.color}22;color:${a.color}">${a.tag}</i>${a.fans} 粉丝</small></div></div>
      <div class="track" data-a="${a.id}"></div></div>`).join('');
    $('#rows').dataset.ready = 1;
  }
  s.items.forEach(i => {
    let el = $(`.job[data-id="${i.id}"]`);
    if (!el) { el = document.createElement('div'); el.dataset.id = i.id; el.style.left = X(i.minute) + '%';
      el.innerHTML = `<img src="./${i.cover}" alt=""><div><b>${hm(i.minute)}</b><small></small></div>`;
      $(`.track[data-a="${i.account}"]`).appendChild(el); }
    if (el.dataset.st !== i.status) { el.dataset.st = i.status; el.className = `job ${i.status}`; el.querySelector('small').textContent = st[i.status]; }
  });
  let now = $('.tl .now');
  if (!now) { now = document.createElement('div'); now.className = 'now'; $('.tl').appendChild(now); }
  const tr0 = $('.track'); if (tr0) { const tl = $('.tl').getBoundingClientRect(), r = tr0.getBoundingClientRect();
    now.style.left = (r.left - tl.left + r.width * Math.min(100, Math.max(0, X(s.clock))) / 100) + 'px'; }
  const fl = $('#feed');
  if (+fl.dataset.n !== s.feed.length) {
    fl.dataset.n = s.feed.length;
    fl.innerHTML = s.feed.length ? s.feed.map(f => `<li><span class="dot" style="background:${f.color}"></span><div><b>${esc(f.account)}</b>
      <p>${esc(f.video)} · ${esc(f.title)}</p><span class="ok">✓ 已发布</span></div><time>${hm(f.minute)}</time></li>`).join('') : '<li class="empty">到点后这里会显示发布结果</li>';
  }
}
function publish(it) {
  setTimeout(() => {
    const acc = ACCOUNTS.find(a => a.id === it.account);
    it.status = 'done';
    sched.feed.unshift({minute: it.minute, account: acc.name, color: acc.color, video: it.video, title: it.title});
    drawPlan();
  }, 900);
}
$('#startPub').onclick = () => {
  if (sched.running || !sched.items.length) return;
  sched.running = true; drawPlan();
  const speed = window.SIM_SPEED || 45;
  const tick = setInterval(() => {
    sched.clock += speed / 20;
    sched.items.filter(it => it.status === 'queued' && it.minute <= sched.clock).forEach(it => { it.status = 'publishing'; publish(it); });
    if (sched.clock >= 22 * 60) { sched.clock = 22 * 60; sched.running = false; clearInterval(tick); }
    drawPlan();
  }, 50);
};
addEventListener('resize', () => { if ($('#plan').classList.contains('on')) drawPlan(); });

loadFolder(); drawStrip();
