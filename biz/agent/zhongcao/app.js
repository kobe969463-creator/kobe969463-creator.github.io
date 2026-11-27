const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
const wait = ms => new Promise(r => setTimeout(r, ms));
const XLSX = {file: './notes_1126.xlsx', name: '种草笔记_1126.xlsx'}, ZIP = {file: './covers_1126.zip', name: '种草封面_1126.zip'};
let N = 8, notes = [], running = false;

function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2200); }

// ---- 商品图 ----
const imgs = [...window.IMAGES];
function drawImgs() {
  $('#imgs').innerHTML = imgs.map(i => `<div><img src="${i.url}" title="${esc(i.name)}" alt="${esc(i.name)}"></div>`).join('') + (imgs.length < 6 ? '<div class="add" id="add">+</div>' : '');
  $('#imgN').textContent = `${imgs.length} 张`;
  const a = $('#add'); if (a) a.onclick = () => $('#addImg').click();
}
$('#addImg').onchange = e => {
  const f = e.target.files[0]; if (!f) return;
  imgs.push({name: f.name, url: URL.createObjectURL(f)}); drawImgs(); toast('商品图已添加'); e.target.value = '';
};
drawImgs();

$$('#segN button').forEach(b => b.onclick = () => {
  if (b.classList.contains('lock')) return toast('一次最多出 8 篇，篇数多的分批生成');
  if (running) return;
  $$('#segN button').forEach(x => x.classList.toggle('on', x === b)); N = +b.dataset.v; $('#go span').textContent = `批量生成 ${N} 篇`; placeholders();
});
$$('#styles span').forEach(s => s.onclick = () => {
  if (s.classList.contains('on') && $$('#styles span.on').length === 1) return toast('至少留一个角度');
  s.classList.toggle('on');
});

function placeholders(n = N) {
  $('#grid').innerHTML = Array.from({length: n}, (_, i) => `<div class="note wait" data-i="${i}"><div class="cv"></div><div class="t">　</div><div class="tg">　</div></div>`).join('');
}
function fill(i, n) {
  const el = $(`.note[data-i="${i}"]`); if (!el || el.dataset.ok) return;
  el.dataset.ok = 1; el.classList.remove('wait');
  el.innerHTML = `<div class="cv"><img src="./${n.cover}" alt=""><span class="ang">${esc(n.angle || '')}</span></div><div class="t">${esc(n.title)}</div><div class="tg">${n.tags.map(esc).join(' ')}</div>`;
  el.onclick = () => openNote(i);
}

// 选中的角度轮流出，凑够篇数
function pick() {
  const styles = $$('#styles span.on').map(s => s.textContent);
  const pool = window.NOTES.filter(n => styles.includes(n.angle));
  return pool.slice(0, N);
}
$('#go').onclick = async () => {
  if (running) return;
  const list = pick();
  running = true; notes = [];
  $('#go').disabled = true; $('#xlsBtn').disabled = $('#zipBtn').disabled = true; $('#bar').hidden = false;
  placeholders(list.length);
  if (innerWidth <= 860) document.querySelector('main').scrollIntoView({behavior: 'smooth'});
  const st = $('#status'), bar = $('#barI');
  st.className = 'status ing';
  st.textContent = '读取商品信息'; bar.style.width = '5%'; await wait(700);
  st.textContent = '正在写标题和正文'; bar.style.width = '15%'; await wait(1600);
  for (let i = 0; i < list.length; i++) {
    st.textContent = `正在做封面 ${i} / ${list.length}`;
    await wait(420);
    notes.push(list[i]); fill(i, list[i]);
    bar.style.width = (30 + 65 * (i + 1) / list.length) + '%';
  }
  st.textContent = '正在导出表格'; bar.style.width = '97%'; await wait(600);
  bar.style.width = '100%';
  st.className = 'status ok'; st.textContent = `✓ ${notes.length} 篇笔记已生成 · 4 种封面模板轮换`;
  $('#go').disabled = false; $('#xlsBtn').disabled = $('#zipBtn').disabled = false; setTimeout(() => $('#bar').hidden = true, 600);
  toast(`${notes.length} 篇笔记生成好了`);
  running = false;
};

function modal(html) { $('#sheet').innerHTML = `<button class="x" id="closeM" aria-label="关闭">✕</button>` + html; $('#modal').hidden = false; document.body.classList.add('lock'); $('#closeM').onclick = closeModal; }
function closeModal() { $('#modal').hidden = true; document.body.classList.remove('lock'); }
$('#modal').onclick = e => { if (e.target.id === 'modal') closeModal(); };
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#modal').hidden) closeModal(); });
function copy(text) {
  if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  fallbackCopy(text);
}
function fallbackCopy(text) {
  const t = document.createElement('textarea'); t.value = text; t.style.cssText = 'position:fixed;opacity:0;top:0';
  document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (e) {} t.remove();
}
function openNote(i) {
  const n = notes[i];
  modal(`<div class="detail"><img src="./${n.cover}" alt=""><div class="info"><span class="chip">${esc(n.angle || '')} · 第 ${n.id} 篇</span>
    <h2>${esc(n.title)}</h2><div class="body">${esc(n.body)}</div><div class="tags">${n.tags.map(esc).join('  ')}</div>
    <div class="btns"><button class="ghost strong" id="cp">复制标题和正文</button><a class="ghost" href="./${n.cover}" download="封面_${String(n.id).padStart(2, '0')}.jpg">下载封面</a></div></div></div>`);
  $('#cp').onclick = () => { copy(`${n.title}\n\n${n.body}\n\n${n.tags.join(' ')}`); toast('已复制'); };
}
$('#xlsBtn').onclick = () => {
  if (!notes.length) return;
  modal(`<div class="xls"><div class="xls-h"><span class="fi">XLSX</span><div><b>${esc(XLSX.name)}</b><small>${notes.length} 行 · 标题 / 正文 / 标签 / 封面图都在表里</small></div>
    <a class="ghost strong" href="${XLSX.file}" download="${XLSX.name}">下载表格</a></div>
    <div class="tbl"><table><colgroup><col style="width:34px"><col style="width:34px"><col style="width:72px"><col style="width:190px"><col class="cbody"><col style="width:170px"><col style="width:62px"></colgroup>
    <tr><th class="rn"></th><th>序号</th><th>角度</th><th>标题</th><th>正文</th><th>标签</th><th>封面</th></tr>
    ${notes.map((n, i) => `<tr><td class="rn">${i + 2}</td><td>${n.id}</td><td>${esc(n.angle || '')}</td><td><div class="cl">${esc(n.title)}</div></td><td><div class="cl">${esc(n.body)}</div></td><td><div class="cl">${n.tags.map(esc).join(' ')}</div></td><td><img src="./${n.cover}" alt=""></td></tr>`).join('')}
    </table></div></div>`);
  toast(`已导出 ${XLSX.name}`);
};
$('#zipBtn').onclick = () => {
  const a = document.createElement('a'); a.href = ZIP.file; a.download = ZIP.name; document.body.appendChild(a); a.click(); a.remove();
  toast(`${notes.length} 张封面打包下载中`);
};
placeholders();
