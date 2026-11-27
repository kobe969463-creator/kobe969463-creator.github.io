const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
const wait = ms => new Promise(r => setTimeout(r, ms));
const now = () => { const d = new Date(); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
const S = {chunks: [], own: false, handoffs: [], stats: {asked: 0, auto: 0, handoff: 0}};
let busy = false;

// ---- 知识库 ----
function parseDoc(text) {
  const chunks = []; let title = null, buf = [];
  const push = () => { if (title && buf.join('').trim()) chunks.push({title, text: buf.join('\n').trim()}); };
  for (const line of text.split(/\r?\n/)) {
    if (/^#{2,3}\s/.test(line)) { push(); title = line.replace(/^#+\s*/, '').trim(); buf = []; }
    else if (title) buf.push(line);
  }
  push();
  if (chunks.length) return chunks;
  // 没有小标题就按空行分段
  return text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean).slice(0, 20)
    .map(p => ({title: p.split('\n')[0].replace(/^[#\-\s]+/, '').slice(0, 12), text: p}));
}
async function learn(name, size, text, own) {
  const chunks = parseDoc(text);
  if (!chunks.length) { $('#kbMeta').textContent = '没认出内容，资料里用「## 小标题」分段'; return; }
  $('#drop').hidden = true; $('#doc').hidden = false;
  $('#doc').innerHTML = `<span class="fi">${name.split('.').pop().toUpperCase()}</span><div><b>${esc(name)}</b><small>${(size / 1024).toFixed(1)} KB</small></div><span class="st ing">正在学习</span>`;
  $('#chunks').innerHTML = '';
  await wait(900);
  for (const c of chunks) {
    const d = document.createElement('div'); d.className = 'chunk'; d.dataset.t = c.title;
    d.innerHTML = `<b>${esc(c.title)}</b><p>${esc(c.text.replace(/\n/g, ' ').replace(/^- /, ''))}</p>`;
    $('#chunks').appendChild(d); await wait(110);
  }
  S.chunks = chunks; S.own = own;
  $('#doc .st').className = 'st'; $('#doc .st').innerHTML = `✓ 已学会 ${chunks.length} 类问题<button class="re" id="re">换资料</button>`;
  $('#re').onclick = () => $('#file').click();
  $('#kbMeta').textContent = `1 份资料 · ${chunks.length} 个知识点`;
}
$('#file').onchange = async e => {
  const f = e.target.files[0]; if (!f) return;
  await learn(f.name, f.size, await f.text(), true);
  e.target.value = '';
};

// ---- 回答：先看要不要转店长，再按问答库 / 资料找 ----
const norm = q => q.toLowerCase().replace(/[\s，。、：；！？,.:;!?（）()~"'“”‘’]/g, '');
const STOP = new Set(['你们', '我们', '可以', '一下', '什么', '怎么', '多少', '有没', '没有', '是不', '不是', '这个', '那个', '请问', '想问', '能不', '要不', '吗吗']);
const grams = s => { s = s.replace(/[0-9a-z\-~]/g, ''); const g = new Set(); for (let i = 0; i < s.length - 1; i++) { const b = s.slice(i, i + 2); if (!STOP.has(b)) g.add(b); } return g; };
function answer(q) {
  const n = norm(q);
  for (const h of window.HANDOFF) if (h.k.some(k => n.includes(k))) return {answer: h.a, handoff: true, reason: h.reason, source: ''};
  if (S.own) return answerFromDoc(n);
  let best = null, bs = 0;
  for (const e of window.QA) {
    const s = e.k.reduce((a, k) => a + (n.includes(k) ? k.length : 0), 0) * e.w;
    if (s > bs) { bs = s; best = e; }
  }
  if (best && bs >= 1.8) return {answer: best.a, handoff: false, reason: '', source: best.src};
  // 关键词没中，再按字面相似度在资料里找一段
  const r = answerFromDoc(n, 3);
  if (!r.handoff) return r;
  return {answer: '这个我帮你转人工，店长看到会马上回你，稍等一下。', handoff: true, reason: '资料里没有', source: ''};
}
function answerFromDoc(n, need = 2) {
  const g = grams(n);
  let best = null, bs = 0;
  for (const c of S.chunks) {
    const cg = grams(norm(c.title.repeat(3) + c.text));
    const s = [...g].filter(x => cg.has(x)).length;
    if (s > bs) { bs = s; best = c; }
  }
  if (!best || bs < need) return {answer: '这个我帮你转人工，店长看到会马上回你，稍等一下。', handoff: true, reason: '资料里没有', source: ''};
  const lines = best.text.split('\n').map(l => l.replace(/^[-*\s]+/, '').trim()).filter(Boolean).slice(0, 4);
  return {answer: '店里的说明是这样的：\n' + lines.join('\n'), handoff: false, reason: '', source: best.title};
}

// ---- 后台 ----
function bump(id, v) { const el = $(id); if (el.textContent !== String(v)) { el.textContent = v; el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); } }
function refresh() {
  const s = S.stats;
  bump('#stAsk', s.asked); bump('#stAuto', s.auto); bump('#stHand', s.handoff);
  $('#stRate').textContent = s.asked ? Math.round(s.auto / s.asked * 100) + '%' : '—';
  const pending = S.handoffs.filter(h => h.status === '待处理').length;
  $('#handN').textContent = pending; $('#handN').classList.toggle('zero', !pending);
  $('#tabBadge').textContent = pending || '';
  const ul = $('#hands');
  ul.innerHTML = S.handoffs.length ? S.handoffs.map(h => `<li class="${h.status === '待处理' ? '' : 'taken'}"><div class="who"><b>${esc(h.who)}</b><time>${h.at}</time></div>
    <p>${esc(h.q)}</p><div class="row"><span class="tag">${esc(h.reason)}</span><button data-id="${h.id}">${h.status === '待处理' ? '接手回复' : '已接手'}</button></div></li>`).join('')
    : '<li class="empty"><svg viewBox="0 0 24 24"><path d="M5 12l4 4 10-10"/></svg>暂时没有要你处理的</li>';
  $$('#hands button').forEach(b => b.onclick = () => take(+b.dataset.id));
}
function take(id) {
  const h = S.handoffs.find(x => x.id === id);
  if (!h || h.status !== '待处理') return;
  h.status = '店长已接手'; refresh();
  addMsg('sys', '店长已接入，正在回复你');
}

// ---- 顾客聊天 ----
function addMsg(cls, html) {
  const box = $('#msgs'), d = document.createElement('div');
  d.className = cls; d.innerHTML = html; box.appendChild(d);
  box.scrollTop = box.scrollHeight;
  return d;
}
async function ask(q) {
  q = q.trim(); if (!q || busy) return;
  busy = true;
  addMsg('m me', `<span class="av">我</span><div class="bub">${esc(q)}</div>`);
  $('#inp').value = '';
  await wait(350);
  const t = addMsg('m bot typing', '<span class="av">溪</span><div class="bub"><i></i><i></i><i></i></div>');
  $('#phSub').textContent = '对方正在输入…';
  const r = S.chunks.length ? answer(q) : {answer: '店里还在整理资料，稍后再来问我，或者直接留言给店长。', handoff: false, source: ''};
  await wait(Math.min(2200, 800 + r.answer.length * 12));
  t.remove(); $('#phSub').textContent = '在线 · 通常秒回';
  $$('.chunk').forEach(c => c.classList.toggle('hit', !!r.source && c.dataset.t === r.source));
  addMsg('m bot', `<span class="av">溪</span><div class="bub">${esc(r.answer)}${r.source && !r.handoff ? `<span class="src">${esc(r.source)}</span>` : ''}</div>`);
  if (S.chunks.length) {
    S.stats.asked++;
    if (r.handoff) {
      S.stats.handoff++;
      S.handoffs.unshift({id: S.handoffs.length + 1, who: '顾客 · 周女士', q, reason: r.reason || '需要店长处理', at: now(), status: '待处理'});
      await wait(300); addMsg('sys', '已转给店长，店长会接着回复你');
      if (innerWidth <= 860 && document.body.dataset.p === 'chat') toast('后台多了 1 条待人工');
    } else S.stats.auto++;
    refresh();
  }
  busy = false;
}
$('#form').onsubmit = e => { e.preventDefault(); ask($('#inp').value); };
$$('#quick span, #faq li').forEach(s => s.onclick = () => ask(s.textContent));

// ---- 手机上：顶部切换 顾客咨询 / 店家后台 ----
function pane(p) {
  document.body.dataset.p = p;
  if (p === 'admin' && $('#toast')) $('#toast').classList.remove('show');
  $$('#mtabs button').forEach(b => b.classList.toggle('on', b.dataset.p === p));
}
$$('#mtabs button').forEach(b => b.onclick = () => pane(b.dataset.p));
function toast(msg) {
  let t = $('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); t.onclick = () => pane('admin'); }
  t.textContent = msg + '，点这里看'; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2600);
}

pane('chat'); refresh();
learn('溪畔小住-店铺资料.md', new Blob([window.SHOP_DOC]).size, window.SHOP_DOC, false);
