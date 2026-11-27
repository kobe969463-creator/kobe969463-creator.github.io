const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
const wait = ms => new Promise(r => setTimeout(r, ms));
const pad = n => String(n).padStart(2, '0');
const hms = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; };
const D = window.D, files = D.files;
let cur = 0, issues = {}, running = false, schedOn = true, messages = [...D.seed];

function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2400); }
function tab(t) {
  $$('#tabs a').forEach(a => a.classList.toggle('on', a.dataset.t === t));
  $$('.pane').forEach(p => p.classList.toggle('on', p.id === t));
  document.body.classList.toggle('chat-on', t === 'chat');
  $(`#tabs a[data-t="${t}"]`)?.classList.remove('new');
  if (t === 'chat') $('#msgs').scrollTop = 1e6;
}
$$('#tabs a').forEach(a => a.onclick = () => tab(a.dataset.t));

// ---- 原始数据 ----
const BAD = /^[¥￥]|元$|测试|^合计$|（|^-\d|^\s+|\s+$/;
function showFile(i) {
  cur = i; const f = files[i];
  $$('#files li').forEach((li, j) => li.classList.toggle('on', j === i));
  $('#rawName').textContent = f.name;
  const g = $('#rawGrid');
  if (f.preview.kind === 'img') {
    $('#rawMeta').textContent = '图片 · 需要识字';
    g.className = 'grid img'; g.innerHTML = `<img src="${f.preview.url}" alt="">`;
    g.querySelector('img').onclick = () => zoom(f.preview.url); return;
  }
  $('#rawMeta').textContent = `${f.type.toUpperCase()} · 共 ${f.preview.total} 行`;
  const rows = f.preview.rows, nc = Math.max(...rows.map(r => r.length), 1);
  g.className = 'grid';
  g.innerHTML = `<table><tr><th style="width:34px"></th>${Array.from({length: nc}, (_, j) => `<th>${String.fromCharCode(65 + j)}</th>`).join('')}</tr>` +
    rows.map((r, k) => { const blank = !r.some(c => c.trim());
      return `<tr class="${blank ? 'blank' : ''}"><td class="rn">${k + 1}</td>${Array.from({length: nc}, (_, j) => { const c = r[j] ?? '';
        return `<td class="${c && BAD.test(c) ? 'bad' : ''}">${esc(c)}</td>`; }).join('')}</tr>`; }).join('') + '</table>';
}
function drawFiles() {
  $('#files').innerHTML = files.map((f, i) => { const iss = issues[f.name];
    const tags = iss ? `<i class="g">有效 ${iss.valid}</i>` + Object.entries(iss.issues).map(([k, v]) => `<i>${k} ${v}</i>`).join('')
      : `<span>${(f.size / 1024).toFixed(1)} KB</span>`;
    return `<li><span class="fi ${f.type}">${f.type.toUpperCase()}</span><div class="nm"><b>${esc(f.name)}</b><small>${tags}</small></div></li>`; }).join('');
  $$('#files li').forEach((li, i) => li.onclick = () => { tab('raw'); showFile(i); if (innerWidth <= 860) $('main').scrollIntoView({behavior: 'smooth'}); });
  $$('#files li')[cur]?.classList.add('on');
}
{ const d = D.date.split('-'); $('#srcDate').textContent = `${+d[1]}月${+d[2]}日 · ${files.length} 个文件`; }
drawFiles(); showFile(0);

// ---- 群聊 / 定时 ----
function nextRun() {
  const now = new Date(), t = new Date(now); t.setHours(9, 0, 0, 0);
  if (t <= now) t.setDate(t.getDate() + 1);
  return `${t.getMonth() + 1}月${t.getDate()}日 09:00`;
}
function drawSched() {
  $('#groupName').textContent = D.group; $('#schGroup').textContent = D.group;
  $('#sw').classList.toggle('on', schedOn);
  $('#schNext').textContent = schedOn ? nextRun() : '已暂停';
}
function drawGroup() {
  $('#msgs').innerHTML = messages.map(m => `<div class="m ${m.bot ? 'bot' : ''}"><span class="av">${m.bot ? '日报' : esc(m.who.split('·').pop().trim().slice(-2))}</span><div>
    <div class="who">${esc(m.who)}${m.bot ? '<em>机器人</em>' : ''} · ${esc(m.at)}</div><div class="bub">${esc(m.text)}</div>
    ${m.img ? `<div class="img" data-src="${m.img}"><img src="${m.img}" alt=""></div>` : ''}</div></div>`).join('');
  $$('.m .img').forEach(d => d.onclick = () => zoom(d.dataset.src));
  $('#msgs').scrollTop = 1e6;
}
function zoom(src) { $('#modalImg').src = src; $('#modal').hidden = false; $('#modal').scrollTop = 0; document.body.classList.add('lock'); }
$('#modal').onclick = () => { $('#modal').hidden = true; document.body.classList.remove('lock'); };
$('#sw').onclick = () => { schedOn = !schedOn; drawSched(); toast(schedOn ? '定时推送已打开，每天 09:00 发' : '定时推送已暂停'); };
$('.chat-in').onclick = () => toast('这里是店长群，日报会自动发进来');
drawSched(); drawGroup();

// ---- 运行 ----
const ORDER = ['read', 'calc', 'write', 'render', 'push', 'pushed'];
function setStep(step) {
  const si = ORDER.indexOf(step);
  $$('#steps li').forEach(li => { const i = ORDER.indexOf(li.dataset.s); li.className = i < si ? 'ok' : i === si ? 'doing' : ''; });
  const pct = [8, 35, 55, 75, 95, 100][Math.max(0, si)]; $('#runPct').textContent = pct + '%'; $('#runBar').style.width = pct + '%';
}
function log(msg) { const d = document.createElement('div'); d.innerHTML = `<i>${hms()}</i>${esc(msg)}`; $('#console').appendChild(d); }
// 日志按出现的先后归到步骤里
const STEP_OF = msg => /^读取|^表头|^识字/.test(msg) ? 'read' : /^清洗/.test(msg) ? 'calc' : /^汇总/.test(msg) ? 'write' : /^小结|^日报|^完成/.test(msg) ? 'render' : 'push';
$('#run').onclick = async () => {
  if (running) return;
  running = true;
  $('#run').disabled = true; $('#run span').textContent = '正在跑…';
  $('#runTitle').textContent = '正在整理 11月25日 的数据';
  $('#runCard').hidden = false; $('#console').innerHTML = '';
  if (innerWidth <= 860) $('#runCard').scrollIntoView({behavior: 'smooth', block: 'start'});
  setStep('read'); await wait(500);
  for (const msg of D.logs) {
    const st = STEP_OF(msg); setStep(st);
    if (st === 'write' && !Object.keys(issues).length) { D.result.files.forEach(f => issues[f.name] = f); drawFiles(); fillClean(); }
    log(msg);
    await wait(st === 'read' ? 520 : st === 'calc' ? 900 : 650);
  }
  const t = new Date();
  messages.push({who: '日报助手', bot: true, at: `今天 ${pad(t.getHours())}:${pad(t.getMinutes())}`, text: D.push.text, img: D.push.img});
  drawGroup();
  setStep('pushed'); $$('#steps li').forEach(li => li.className = 'ok'); $('#runTitle').textContent = '跑完了，日报已发到群里';
  $('#rep').innerHTML = `<img src="${D.result.report}" id="repImg" alt="">`; $('#repImg').onclick = () => zoom(D.result.report); $('#repActs').hidden = false;
  ['clean', 'report', 'chat'].forEach(k => $(`#tabs a[data-t="${k}"]`).classList.add('new'));
  $('#run').disabled = false; $('#run span').textContent = '立即跑一次';
  toast('日报已发到「' + D.group + '」');
  await wait(1400); $('#runCard').hidden = true; running = false;
};
function fillClean() {
  const s = D.result, k = s.skipped, n = Object.keys(issues).length;
  $('#sum').innerHTML = `<span class="big">${n} 个文件 → <b>${s.valid}</b> 条有效订单</span>` +
    Object.entries(k).map(([a, b]) => `<span>${a} <b>${b}</b></span>`).join('') +
    Object.values(issues).filter(f => f.issues['截图识字']).map(f => `<span>截图识出 <b>${f.issues['截图识字']}</b> 行</span>`).join('') +
    `<a class="ghost dl" href="./clean_1125.xlsx" download="清洗后订单_2026-11-25.xlsx"><svg viewBox="0 0 24 24"><path d="M12 4v12M7 11l5 5 5-5M4 20h16"/></svg>下载清洗后表格</a>`;
  $('#cleanEmpty').hidden = true;
  $('#cleanTbl').innerHTML = `<tr><th>门店</th><th>订单号</th><th>时间</th><th>商品</th><th>数量</th><th>金额(元)</th><th>渠道</th></tr>` +
    s.sample.map((r, i) => `<tr style="animation-delay:${i * 40}ms"><td>${esc(r.store)}</td><td>${esc(r.order_id)}</td><td>${r.time}</td><td>${esc(r.product)}</td>
      <td class="num">${r.qty}</td><td class="num">${r.amount.toFixed(2)}</td><td><span class="st">${esc(r.channel)}</span></td></tr>`).join('');
}
