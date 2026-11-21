/* 永固进销存 · 试玩逻辑（纯前端，状态存在内存 + localStorage） */
(function(){
var SEED=window.JXC_SEED,CO=SEED.CO,CUST=SEED.CUST,SUP=SEED.SUP,KEY='jxc-demo-v3',TODAY='2026-11-21';
var S=load();
function load(){try{var t=localStorage.getItem(KEY);if(t){var o=JSON.parse(t);if(o&&o.v===3)return o}}catch(e){}return SEED.build()}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function $(s,r){return(r||document).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function r2(n){return Math.round(n*100)/100}
function money(n,noSign){var s=r2(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,',');return(noSign?'':'¥')+s}
function money0(n){return '¥'+Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g,',')}
function prod(id){for(var i=0;i<S.products.length;i++)if(S.products[i].id===id)return S.products[i]}
function cust(id){for(var i=0;i<CUST.length;i++)if(CUST[i].id===id)return CUST[i];return{name:'',contact:'',phone:'',addr:''}}
function sup(id){for(var i=0;i<SUP.length;i++)if(SUP[i].id===id)return SUP[i];return{name:'',contact:'',phone:''}}
function docBy(no){for(var i=0;i<S.docs.length;i++)if(S.docs[i].no===no)return S.docs[i]}
function sum(d){return r2(d.items.reduce(function(a,it){return a+it.qty*it.price},0))}
function low(p){return p.stock<p.safe}
function warns(){return S.products.filter(low)}
function cn(d){var a=d.split('-');return a[0]+' 年 '+(+a[1])+' 月 '+(+a[2])+' 日'}
function md(d){var a=d.split('-');return(+a[1])+'-'+a[2]}
// 演示里的「现在」：接着今天最后一张单往后走几分钟（不用真实钟点，免得半夜打开显示 00:40）
function now(){var m=0;S.docs.forEach(function(d){if(d.date===TODAY){var a=d.time.split(':');m=Math.max(m,a[0]*60+ +a[1])}});m=Math.min(m?m+9:545,23*60+50);var h=Math.floor(m/60),mm=m%60;return(h<10?'0':'')+h+':'+(mm<10?'0':'')+mm}
function nextNo(pre){var k=pre+TODAY.replace(/-/g,''),m=0;S.docs.forEach(function(d){if(d.no.indexOf(k)===0)m=Math.max(m,+d.no.split('-')[1])});m++;return k+'-'+(m<10?'0':'')+m}
// 人民币大写
function upper(n){var fr=['角','分'],dg=['零','壹','贰','叁','肆','伍','陆','柒','捌','玖'],un=[['元','万','亿'],['','拾','佰','仟']];
  var c=Math.round(Math.abs(n)*100),s='';
  s+=(dg[Math.floor(c/10)%10]+fr[0]).replace(/零./,'');s+=(dg[c%10]+fr[1]).replace(/零./,'');
  s=s||'整';var m=Math.floor(c/100);
  for(var i=0;i<un[0].length&&m>0;i++){var p='';for(var j=0;j<un[1].length&&m>0;j++){p=dg[m%10]+un[1][j]+p;m=Math.floor(m/10)}s=p.replace(/(零.)*零$/,'').replace(/^$/,'零')+un[0][i]+s}
  return s.replace(/(零.)*零元/,'元').replace(/(零.)+/g,'零').replace(/^整$/,'零元整')}
var toastT;
function toast(t){var el=$('#toast');el.textContent=t;el.classList.add('on');clearTimeout(toastT);toastT=setTimeout(function(){el.classList.remove('on')},2600)}
function modal(html,w){var m=document.createElement('div');m.className='modal-m';m.innerHTML='<div class="modal" role="dialog" aria-modal="true"'+(w?' style="width:min('+w+'px,100%)"':'')+'>'+html+'</div>';
  document.body.appendChild(m);m.addEventListener('click',function(e){if(e.target===m||e.target.closest('[data-close]'))m.remove()});return m}
function closeModals(){$$('.modal-m').forEach(function(m){m.remove()})}
function pname(p){return '<span class="pn"><b>'+E(p.name)+'</b><small>'+E(p.spec)+'</small></span>'}
function statusPill(p){return p.stock<p.safe?'<span class="pill p-red">要补货</span>':p.stock<=p.safe*1.3?'<span class="pill p-warn">偏少</span>':'<span class="pill p-ok">正常</span>'}
function prodOptions(sel,showStock){var cats={},h='<option value="">选商品…</option>';
  S.products.forEach(function(p){(cats[p.cat]=cats[p.cat]||[]).push(p)});
  Object.keys(cats).forEach(function(c){h+='<optgroup label="'+c+'">'+cats[c].map(function(p){
    return '<option value="'+p.id+'"'+(p.id===sel?' selected':'')+'>'+E(p.name+' '+p.spec)+(showStock?'（存 '+p.stock+p.unit+(low(p)?' 低':'')+'）':'')+'</option>'}).join('')+'</optgroup>'});
  return h}

/* ---------- 路由 ---------- */
var TITLES={dash:['工作台','仓管 周敏 · 城西仓'],out:['出库开单','开单后库存自动扣，能直接打送货单'],in:['采购入库','到货验收后登记，库存自动加'],stock:['库存','低于安全库存的标红，一键出补货单'],print:['查单打印','按单号查单，打印送货单 / 出库单'],report:['进销存报表','按商品看进、出、存']};
function route(){var h=location.hash.replace(/^#/,'')||'dash',parts=h.split('/'),r=parts[0],arg=decodeURIComponent(parts.slice(1).join('/'));
  if(!TITLES[r])r='dash';
  $$('#nav a').forEach(function(a){a.classList.toggle('on',a.getAttribute('data-r')===r)});
  $('#title').textContent=TITLES[r][0];$('#subtitle').textContent=TITLES[r][1];
  document.body.classList.toggle('can-print',r==='print');
  closeModals();
  ({dash:vDash,out:vOut,in:vIn,stock:vStock,print:vPrint,report:vReport})[r](arg);
  badge();window.scrollTo(0,0)}
function badge(){var n=warns().length,b=$('#warnCount');b.hidden=!n;b.textContent=n}
window.addEventListener('hashchange',route);
$('#reset').onclick=function(){if(!confirm('把演示数据恢复成一开始的样子？'))return;try{localStorage.removeItem(KEY)}catch(e){}S=SEED.build();draft={out:null,in:null};route();toast('已恢复演示数据')};

/* ---------- 工作台 ---------- */
function vDash(){
  var outs=S.docs.filter(function(d){return d.type==='out'}),ins=S.docs.filter(function(d){return d.type==='in'});
  var todayOut=outs.filter(function(d){return d.date===TODAY}),w=warns();
  var mOut=outs.reduce(function(a,d){return a+sum(d)},0),mIn=ins.reduce(function(a,d){return a+sum(d)},0);
  var recent=S.docs.slice(0,9);
  $('#view').innerHTML='<div class="kpis">'+
    '<div class="kpi"><span>今天出库</span><b>'+todayOut.length+' 单</b><small>'+money(todayOut.reduce(function(a,d){return a+sum(d)},0))+'</small></div>'+
    '<div class="kpi"><span>11 月出库金额</span><b>'+money0(mOut)+'</b><small>'+outs.length+' 张出库单</small></div>'+
    '<div class="kpi"><span>11 月入库金额</span><b>'+money0(mIn)+'</b><small>'+ins.length+' 次到货</small></div>'+
    '<a class="kpi'+(w.length?' alert':'')+'" href="#stock/warn"><span>低于安全库存</span><b>'+w.length+' 种</b><small>点开看要补的货 →</small></a></div>'+
    '<div class="quick"><a href="#out"><i style="background:#e9effc;color:#2b59c3">出</i><div><b>开出库单</b><span>选客户、加商品，库存自动扣</span></div></a>'+
    '<a href="#in"><i style="background:#e5f5ec;color:#1a8a4a">入</i><div><b>登记到货</b><span>采购到货验收后入库</span></div></a>'+
    '<a href="#print"><i style="background:#fff4e0;color:#b26a00">印</i><div><b>查单打印</b><span>送货单、出库单、三联单</span></div></a></div>'+
    '<div class="cols"><div class="card"><h2>最近的单 <small>点单号看单据</small></h2><div class="doclist">'+recent.map(function(d){
      var who=d.type==='out'?cust(d.party).name:d.type==='in'?sup(d.party).name:'补货 '+d.items.length+' 种';
      var tag=d.type==='out'?(d.signed?'<span class="pill p-gray">出库 · 已签收</span>':'<span class="pill p-blue">出库 · 待签收</span>'):d.type==='in'?'<span class="pill p-ok">入库</span>':'<span class="pill p-warn">补货单</span>';
      return '<a href="#print/'+d.no+'"><div><b>'+d.no+'</b><small>'+E(who)+' · '+md(d.date)+' '+d.time+'</small></div><div class="r">'+tag+'<small>'+money(sum(d))+'</small></div></a>'}).join('')+'</div></div>'+
    '<div class="card"><h2>库存预警 <small>库存低于安全库存</small></h2>'+(w.length?'<div class="doclist">'+w.map(function(p){
      return '<a href="#stock/hl='+p.id+'"><div><b>'+E(p.name)+'</b><small>'+E(p.spec)+'</small></div><div class="r"><b class="stk-red">'+p.stock+'</b> / '+p.safe+' '+p.unit+'<small>安全库存 '+p.safe+'</small></div></a>'}).join('')+
      '</div><button class="btn btn--red" style="width:100%;margin-top:12px" id="dReplen">一键生成补货单</button>':'<p class="empty">都在安全库存以上</p>')+'</div></div>';
  var b=$('#dReplen');if(b)b.onclick=replenish;
}

/* ---------- 开单（出库 / 入库共用） ---------- */
var draft={out:null,in:null};
function newDraft(type){return type==='out'?{party:'',date:TODAY,addr:'',phone:'',note:'',lines:[{pid:'',qty:'',price:''}]}:{party:'',date:TODAY,ref:'',checker:'周敏',note:'',bh:'',lines:[{pid:'',qty:'',price:''}]}}
function lineHtml(type,l,i){var p=prod(l.pid),amt=p&&l.qty?l.qty*l.price:0,hint='',cls='';
  if(p){if(type==='out'){var left=p.stock-(+l.qty||0);
      if(+l.qty>p.stock){hint='库存不够：只剩 '+p.stock+' '+p.unit;cls=' err'}
      else if(l.qty&&left<p.safe){hint='库存 '+p.stock+' '+p.unit+' → 出完剩 '+left+'，会低于安全库存 '+p.safe;cls=' low'}
      else hint='库存 '+p.stock+' '+p.unit+(l.qty?' → 出完剩 '+left:'')+' · 安全库存 '+p.safe;}
    else hint='现有 '+p.stock+' '+p.unit+(l.qty?' → 入库后 '+(p.stock+(+l.qty||0)):'')+' · 安全库存 '+p.safe+(low(p)?' · 正缺货':'')}
  return '<div class="ln" data-i="'+i+'"><select class="sel" data-k="pid" aria-label="商品">'+prodOptions(l.pid,type==='out')+'</select>'+
    '<label class="qty"><input class="inp" data-k="qty" type="number" inputmode="numeric" min="0" placeholder="0" value="'+E(l.qty)+'" aria-label="数量"></label>'+
    '<label class="pr"><input class="inp" data-k="price" type="number" inputmode="decimal" min="0" step="0.01" placeholder="0.00" value="'+E(l.price)+'" aria-label="单价"></label>'+
    '<div class="amt">'+(amt?money(amt):'—')+'</div><button class="x" type="button" data-del aria-label="删掉这行">×</button>'+
    (hint?'<div class="hint'+cls+'">'+E(hint)+'</div>':'')+'</div>'}
function totalOf(dr){return dr.lines.reduce(function(a,l){return a+(prod(l.pid)&&l.qty?l.qty*l.price:0)},0)}
function bindForm(type,rerender){var dr=draft[type],box=$('#lines');
  function paintTotal(){var t=totalOf(dr);$('#tot').innerHTML='合计 <b>'+money(t)+'</b><small>'+(t?'大写：'+upper(t):'还没加商品')+'</small>'}
  function paintLines(){$('#lineBody').innerHTML=dr.lines.map(function(l,i){return lineHtml(type,l,i)}).join('');paintTotal()}
  box.addEventListener('change',function(e){var ln=e.target.closest('.ln');if(!ln)return;var l=dr.lines[+ln.dataset.i],k=e.target.dataset.k;
    if(k==='pid'){l.pid=e.target.value;var p=prod(l.pid);l.price=p?(type==='out'?p.price:p.cost):'';if(p&&!l.qty)l.qty='';paintLines();var q=$('.ln[data-i="'+ln.dataset.i+'"] [data-k=qty]');if(q&&p)q.focus()}
    else{paintOne(ln)}});
  box.addEventListener('input',function(e){var ln=e.target.closest('.ln');if(!ln||e.target.tagName!=='INPUT')return;var l=dr.lines[+ln.dataset.i];
    l[e.target.dataset.k]=e.target.value===''?'':+e.target.value;var p=prod(l.pid);
    ln.querySelector('.amt').textContent=p&&l.qty?money(l.qty*l.price):'—';
    var h=ln.querySelector('.hint'),tmp=document.createElement('div');tmp.innerHTML=lineHtml(type,l,+ln.dataset.i);var nh=tmp.querySelector('.hint');
    if(h&&nh){h.className=nh.className;h.textContent=nh.textContent}else if(nh)ln.appendChild(nh);
    paintTotal()});
  function paintOne(){paintTotal()}
  box.addEventListener('click',function(e){if(e.target.closest('[data-del]')){var i=+e.target.closest('.ln').dataset.i;dr.lines.splice(i,1);if(!dr.lines.length)dr.lines.push({pid:'',qty:'',price:''});paintLines()}
    if(e.target.closest('#addLine')){dr.lines.push({pid:'',qty:'',price:''});paintLines();var s=$$('#lineBody .ln .sel');s[s.length-1].focus()}});
  $$('[data-f]').forEach(function(el){el.addEventListener('input',function(){dr[el.dataset.f]=el.value;
    if(el.dataset.f==='party'&&type==='out'){var c=cust(el.value);dr.addr=c.addr;dr.phone=c.contact+' '+c.phone;$('[data-f=addr]').value=dr.addr;$('[data-f=phone]').value=dr.phone}})});
  paintLines();
}
function lines(type){return '<div class="lines" id="lines"><div class="lh"><span>商品</span><span style="text-align:right">数量</span><span style="text-align:right">'+(type==='out'?'单价':'进价')+'</span><span style="text-align:right">金额</span><span></span></div><div id="lineBody"></div>'+
  '<div class="lf"><button class="btn btn--line btn--sm" type="button" id="addLine">+ 加一行</button><div class="total" id="tot"></div></div></div>'}
function check(type,dr){var ok=dr.lines.filter(function(l){return l.pid&&+l.qty>0});
  if(!dr.party)return type==='out'?'先选客户':'先选供应商';
  if(!ok.length)return '至少加一样商品，填上数量';
  if(type==='out'){var bad=ok.filter(function(l){return +l.qty>prod(l.pid).stock})[0];if(bad)return prod(bad.pid).name+' 库存不够，只剩 '+prod(bad.pid).stock+' '+prod(bad.pid).unit}
  // 同一商品写了两行就合并
  var m={},items=[];ok.forEach(function(l){if(m[l.pid]){m[l.pid].qty+=+l.qty}else{m[l.pid]={pid:l.pid,qty:+l.qty,price:+l.price||0};items.push(m[l.pid])}});
  if(type==='out'){var b2=items.filter(function(it){return it.qty>prod(it.pid).stock})[0];if(b2)return prod(b2.pid).name+' 合起来超过库存了'}
  return items}

/* ---------- 出库 ---------- */
var outTab='all';
function vOut(arg){if(!draft.out)draft.out=newDraft('out');var dr=draft.out;
  var outs=S.docs.filter(function(d){return d.type==='out'}),pend=outs.filter(function(d){return !d.signed}).length;
  var list=outTab==='pend'?outs.filter(function(d){return !d.signed}):outs;
  $('#view').innerHTML='<div class="card"><h2>开出库单 <small>选客户、加商品，开单后库存自动扣</small><button class="btn btn--line btn--sm" type="button" id="sample">填一张示例</button></h2>'+
    '<div class="form"><div class="f w2 w2m"><label for="fCust">客户</label><select class="sel" id="fCust" data-f="party"><option value="">选客户…</option>'+CUST.map(function(c){return '<option value="'+c.id+'"'+(c.id===dr.party?' selected':'')+'>'+E(c.name)+'</option>'}).join('')+'</select></div>'+
    '<div class="f"><label for="fDate">出库日期</label><input class="inp" id="fDate" type="date" data-f="date" value="'+dr.date+'"></div>'+
    '<div class="f"><label>单号（自动）</label><input class="inp" value="'+nextNo('CK')+'" readonly tabindex="-1"></div>'+
    '<div class="f w2 w2m"><label for="fAddr">送货地址</label><input class="inp" id="fAddr" data-f="addr" value="'+E(dr.addr)+'" placeholder="选客户后自动带出"></div>'+
    '<div class="f"><label for="fPhone">联系人电话</label><input class="inp" id="fPhone" data-f="phone" value="'+E(dr.phone)+'"></div>'+
    '<div class="f"><label for="fNote">备注</label><input class="inp" id="fNote" data-f="note" value="'+E(dr.note)+'" placeholder="比如：上午送到"></div></div>'+
    lines('out')+'<div class="submit"><button class="btn btn--line" type="button" id="clear">清空</button><button class="btn" type="button" id="submit">开单并出库</button></div></div>'+
    '<div class="card"><h2>出库单记录 <small>共 '+outs.length+' 张 · 11 月</small><div class="tabs" id="oTabs"><button data-t="all" class="'+(outTab==='all'?'on':'')+'">全部</button><button data-t="pend" class="'+(outTab==='pend'?'on':'')+'">待签收<em>'+pend+'</em></button></div></h2>'+
    '<div class="tw"><table><thead><tr><th>单号</th><th>日期</th><th>客户</th><th class="num">品项</th><th class="num">金额</th><th>状态</th><th>操作</th></tr></thead><tbody>'+
    list.map(function(d){return '<tr><td><a class="btn--link" href="#print/'+d.no+'">'+d.no+'</a></td><td>'+md(d.date)+' '+d.time+'</td><td>'+E(cust(d.party).name)+'</td><td class="num">'+d.items.length+'</td><td class="num">'+money(sum(d))+'</td>'+
      '<td>'+(d.signed?'<span class="pill p-gray">已签收</span>':'<span class="pill p-blue">待签收</span>')+'</td><td><div class="row"><a class="btn btn--line btn--sm" href="#print/'+d.no+'" data-print="'+d.no+'">打印</a>'+(d.signed?'':'<button class="btn btn--line btn--sm" data-sign="'+d.no+'">回单签收</button>')+'</div></td></tr>'}).join('')+
    '</tbody></table></div></div>';
  bindForm('out');
  $('#sample').onclick=function(){draft.out={party:'C01',date:TODAY,addr:cust('C01').addr,phone:cust('C01').contact+' '+cust('C01').phone,note:'上午 10 点前送到',
    lines:[{pid:'P201',qty:8,price:205},{pid:'P105',qty:60,price:3.6},{pid:'P204',qty:40,price:9.5},{pid:'P401',qty:24,price:11}]};vOut()};
  $('#clear').onclick=function(){draft.out=newDraft('out');vOut()};
  $('#submit').onclick=function(){var r=check('out',draft.out);if(typeof r==='string'){toast(r);return}doOut(r)};
  $('#oTabs').onclick=function(e){var b=e.target.closest('button');if(!b)return;outTab=b.dataset.t;vOut()};
  $$('[data-sign]').forEach(function(b){b.onclick=function(){var d=docBy(b.dataset.sign);d.signed=true;save();toast(d.no+' 回单已签收');vOut()}});
}
function doOut(items){var dr=draft.out,no=nextNo('CK'),chg=[];
  items.forEach(function(it){var p=prod(it.pid),b=p.stock;p.stock-=it.qty;chg.push({p:p,from:b,to:p.stock})});
  var c=cust(dr.party);
  S.docs.unshift({no:no,type:'out',date:dr.date||TODAY,time:now(),party:dr.party,addr:dr.addr,phone:dr.phone,items:items,note:dr.note,maker:'周敏',signed:false});
  save();draft.out=newDraft('out');vOut();badge();
  var lows=chg.filter(function(x){return x.to<x.p.safe});
  var m=modal('<h3>出库单 '+no+' 已开好</h3><p class="sub">'+E(c.name)+' · '+items.length+' 样 · '+money(items.reduce(function(a,it){return a+it.qty*it.price},0))+' · 库存已扣</p>'+
    '<ul class="chg">'+chg.map(function(x){var l=x.to<x.p.safe;return '<li class="'+(l?'low':'')+'"><span>'+pname(x.p)+'</span><span class="arrow">'+x.from+' → <b>'+x.to+'</b> '+x.p.unit+(l?' <span class="pill p-red">低于安全库存 '+x.p.safe+'</span>':'')+'</span></li>'}).join('')+'</ul>'+
    '<div class="mact"><button class="btn btn--line" data-close>继续开单</button>'+(lows.length?'<a class="btn btn--line" id="mStock" href="#stock/hl='+lows[0].p.id+'">看库存（'+lows.length+' 样要补）</a>':'<a class="btn btn--line" href="#stock">看库存</a>')+'<a class="btn" id="mPrint" href="#print/'+no+'">打印送货单</a></div>');
}

/* ---------- 入库 ---------- */
function vIn(arg){if(arg&&arg.indexOf('bh=')===0){fromBh(arg.slice(3));history.replaceState(null,'','#in')}
  if(!draft.in)draft.in=newDraft('in');var dr=draft.in;
  var ins=S.docs.filter(function(d){return d.type==='in'}),bhs=S.docs.filter(function(d){return d.type==='bh'&&!d.done});
  $('#view').innerHTML=(bhs.length?'<div class="alertbar" style="background:#fff4e0;color:#7a4a00"><span>有 <b style="color:#b26a00">'+bhs.length+'</b> 张补货单还没到货：'+bhs.map(function(b){return b.no+'（'+b.items.length+' 样）'}).join('、')+'</span><button class="btn btn--sm" id="useBh" data-no="'+bhs[0].no+'">到货了，带入 '+bhs[0].no+'</button></div>':'')+
    '<div class="card"><h2>登记到货入库 <small>按供应商送货单点数验收，入库后库存自动加</small><button class="btn btn--line btn--sm" type="button" id="sample">填一张示例</button></h2>'+
    '<div class="form"><div class="f w2 w2m"><label for="fSup">供应商</label><select class="sel" id="fSup" data-f="party"><option value="">选供应商…</option>'+SUP.map(function(s){return '<option value="'+s.id+'"'+(s.id===dr.party?' selected':'')+'>'+E(s.name)+'</option>'}).join('')+'</select></div>'+
    '<div class="f"><label for="fDate">到货日期</label><input class="inp" id="fDate" type="date" data-f="date" value="'+dr.date+'"></div>'+
    '<div class="f"><label>入库单号（自动）</label><input class="inp" value="'+nextNo('RK')+'" readonly tabindex="-1"></div>'+
    '<div class="f w2 w2m"><label for="fRef">供应商送货单号</label><input class="inp" id="fRef" data-f="ref" value="'+E(dr.ref)+'" placeholder="对方单子上的号，对账用"></div>'+
    '<div class="f"><label for="fChk">验收人</label><select class="sel" id="fChk" data-f="checker">'+['周敏','老陈','小黄'].map(function(n){return '<option'+(n===dr.checker?' selected':'')+'>'+n+'</option>'}).join('')+'</select></div>'+
    '<div class="f"><label for="fNote">备注</label><input class="inp" id="fNote" data-f="note" value="'+E(dr.note)+'" placeholder="比如：少到 2 箱"></div></div>'+
    lines('in')+'<div class="submit"><button class="btn btn--line" type="button" id="clear">清空</button><button class="btn" type="button" id="submit" style="background:#1a8a4a">确认入库</button></div></div>'+
    '<div class="card"><h2>入库记录 <small>共 '+ins.length+' 次到货 · 11 月</small></h2><div class="tw"><table><thead><tr><th>入库单号</th><th>到货日期</th><th>供应商</th><th>送货单号</th><th class="num">品项</th><th class="num">金额</th><th>验收</th><th>操作</th></tr></thead><tbody>'+
    ins.map(function(d){return '<tr><td><a class="btn--link" href="#print/'+d.no+'">'+d.no+'</a></td><td>'+md(d.date)+' '+d.time+'</td><td>'+E(sup(d.party).name)+'</td><td>'+E(d.ref||'—')+'</td><td class="num">'+d.items.length+'</td><td class="num">'+money(sum(d))+'</td><td>'+E(d.checker||'')+'</td><td><a class="btn btn--line btn--sm" href="#print/'+d.no+'">打印</a></td></tr>'}).join('')+
    '</tbody></table></div></div>';
  bindForm('in');
  var ub=$('#useBh');if(ub)ub.onclick=function(){fromBh(ub.dataset.no);vIn();toast('已按补货单带入，核对实到数量后确认入库')};
  $('#sample').onclick=function(){draft.in={party:'S2',date:TODAY,ref:'HT'+'2611210'+'37',checker:'老陈',note:'',bh:'',lines:[{pid:'P203',qty:30,price:105},{pid:'P201',qty:20,price:168},{pid:'P202',qty:10,price:265}]};vIn()};
  $('#clear').onclick=function(){draft.in=newDraft('in');vIn()};
  $('#submit').onclick=function(){var r=check('in',draft.in);if(typeof r==='string'){toast(r);return}doIn(r)};
}
function fromBh(no){var b=docBy(no);if(!b)return;var cnt={};b.items.forEach(function(it){cnt[it.sup]=(cnt[it.sup]||0)+1});
  var top=Object.keys(cnt).sort(function(a,c){return cnt[c]-cnt[a]})[0];
  draft.in={party:top||'',date:TODAY,ref:'',checker:'周敏',note:'按补货单 '+no+' 到货',bh:no,lines:b.items.map(function(it){return{pid:it.pid,qty:it.qty,price:it.price}})}}
function doIn(items){var dr=draft.in,no=nextNo('RK'),chg=[];
  items.forEach(function(it){var p=prod(it.pid),b=p.stock;p.stock+=it.qty;chg.push({p:p,from:b,to:p.stock})});
  S.docs.unshift({no:no,type:'in',date:dr.date||TODAY,time:now(),party:dr.party,ref:dr.ref,items:items,note:dr.note,maker:'周敏',checker:dr.checker});
  if(dr.bh){var b=docBy(dr.bh);if(b)b.done=true}
  save();draft.in=newDraft('in');vIn();badge();
  modal('<h3>入库单 '+no+' 已登记</h3><p class="sub">'+E(sup(S.docs[0].party).name)+' · '+items.length+' 样 · '+money(sum(S.docs[0]))+' · 库存已加</p>'+
    '<ul class="chg">'+chg.map(function(x){var back=x.from<x.p.safe&&x.to>=x.p.safe,still=x.to<x.p.safe;return '<li class="up'+(still?' low':'')+'"><span>'+pname(x.p)+'</span><span class="arrow">'+x.from+' → <b>'+x.to+'</b> '+x.p.unit+(back?' <span class="pill p-ok">回到安全库存以上</span>':still?' <span class="pill p-red">还差 '+(x.p.safe-x.to)+'</span>':'')+'</span></li>'}).join('')+'</ul>'+
    '<div class="mact"><button class="btn btn--line" data-close>继续登记</button><a class="btn btn--line" href="#stock">看库存</a><a class="btn" href="#print/'+no+'">打印入库单</a></div>');
}

/* ---------- 库存 ---------- */
var stF={tab:'all',cat:'',q:''};
function vStock(arg){var hl='';if(arg==='warn')stF.tab='warn';if(arg&&arg.indexOf('hl=')===0){hl=arg.slice(3);stF.tab='all';stF.q='';stF.cat=''}
  var w=warns(),cats=[];S.products.forEach(function(p){if(cats.indexOf(p.cat)<0)cats.push(p.cat)});
  var val=S.products.reduce(function(a,p){return a+p.stock*p.cost},0);
  $('#view').innerHTML=(w.length?'<div class="alertbar"><span><b>'+w.length+'</b> 个商品低于安全库存：'+w.slice(0,4).map(function(p){return E(p.name)}).join('、')+(w.length>4?' 等':'')+'</span><button class="btn btn--red" id="replen">一键生成补货单</button></div>':'')+
    '<div class="kpis"><div class="kpi"><span>商品</span><b>'+S.products.length+' 种</b><small>6 个分类</small></div><div class="kpi"><span>库存货值（按进价）</span><b>'+money0(val)+'</b><small>城西仓</small></div>'+
    '<div class="kpi'+(w.length?' alert':'')+'"><span>要补货</span><b>'+w.length+' 种</b><small>低于安全库存</small></div><div class="kpi"><span>偏少</span><b>'+S.products.filter(function(p){return !low(p)&&p.stock<=p.safe*1.3}).length+' 种</b><small>不到安全库存 1.3 倍</small></div></div>'+
    '<div class="card"><div class="tool"><div class="tabs" id="sTabs"><button data-t="all" class="'+(stF.tab==='all'?'on':'')+'">全部 '+S.products.length+'</button><button data-t="warn" class="'+(stF.tab==='warn'?'on':'')+'">只看要补货<em>'+w.length+'</em></button></div>'+
    '<div class="row"><select class="sel" id="sCat" aria-label="分类"><option value="">全部分类</option>'+cats.map(function(c){return '<option'+(c===stF.cat?' selected':'')+'>'+c+'</option>'}).join('')+'</select><input class="inp" id="sQ" placeholder="搜商品名 / 规格" value="'+E(stF.q)+'" style="width:160px"></div></div>'+
    '<div class="tw"><table><thead><tr><th>编码</th><th>商品</th><th>分类</th><th class="num">库存</th><th class="num">安全库存</th><th>状况</th><th class="num">进价</th><th class="num">售价</th><th class="num">货值</th></tr></thead><tbody id="sBody"></tbody></table></div></div>';
  function paint(){var q=stF.q.trim().toLowerCase();
    var rows=S.products.filter(function(p){return(stF.tab!=='warn'||low(p))&&(!stF.cat||p.cat===stF.cat)&&(!q||(p.name+p.spec+p.id).toLowerCase().indexOf(q)>=0)})
      .sort(function(a,b){return(low(b)-low(a))||(a.stock/a.safe-b.stock/b.safe)*(low(a)?1:0)||a.id.localeCompare(b.id)});
    $('#sBody').innerHTML=rows.length?rows.map(function(p){var l=low(p),r=Math.min(1,p.stock/(p.safe*3));
      return '<tr id="r-'+p.id+'" class="'+(l?'warn':'')+(p.id===hl?' flash':'')+'"><td>'+p.id+'</td><td>'+pname(p)+'</td><td>'+p.cat+'</td><td class="num'+(l?' stk-red':'')+'">'+p.stock+' '+p.unit+'</td><td class="num">'+p.safe+'</td>'+
        '<td><span class="bar'+(l?' low':'')+'"><i style="width:'+Math.round(r*100)+'%"></i></span>'+statusPill(p)+'</td><td class="num">'+money(p.cost,1)+'</td><td class="num">'+money(p.price,1)+'</td><td class="num">'+money0(p.stock*p.cost)+'</td></tr>'}).join(''):'<tr><td colspan="9" class="empty">没有符合的商品</td></tr>'}
  paint();
  $('#sTabs').onclick=function(e){var b=e.target.closest('button');if(!b)return;stF.tab=b.dataset.t;$$('#sTabs button').forEach(function(x){x.classList.toggle('on',x===b)});hl='';paint()};
  $('#sCat').onchange=function(){stF.cat=this.value;hl='';paint()};
  $('#sQ').oninput=function(){stF.q=this.value;hl='';paint()};
  var rb=$('#replen');if(rb)rb.onclick=replenish;
  if(hl){var tr=$('#r-'+hl);if(tr)setTimeout(function(){tr.scrollIntoView({block:'center',behavior:'smooth'})},50)}
}
function suggest(p){var n=p.safe*2-p.stock,step=p.safe>=100?10:5;return Math.max(step,Math.ceil(n/step)*step)}
function replenish(){var w=warns();if(!w.length){toast('都在安全库存以上，不用补');return}
  var m=modal('<h3>补货单（草稿）</h3><p class="sub">按「补到安全库存的 2 倍」算的建议数量，可以改</p><div class="tw"><table><thead><tr><th>商品</th><th class="num">库存 / 安全</th><th class="num">建议补</th><th class="hide-m">供应商</th><th class="num">金额</th></tr></thead><tbody>'+
    w.map(function(p){return '<tr data-p="'+p.id+'"><td>'+pname(p)+'</td><td class="num"><b class="stk-red">'+p.stock+'</b> / '+p.safe+'</td><td class="num"><input class="inp" type="number" min="0" value="'+suggest(p)+'" style="width:64px;height:32px;text-align:right;padding:0 6px" aria-label="补货数量"> <small style="color:var(--muted)">'+p.unit+'</small></td><td class="hide-m">'+E(sup(p.sup).name)+'</td><td class="num" data-amt>'+money(suggest(p)*p.cost)+'</td></tr>'}).join('')+
    '</tbody><tfoot><tr><td colspan="3">合计（按进价）</td><td class="hide-m"></td><td class="num" id="bhTot"></td></tr></tfoot></table></div><div class="mact" style="margin-top:14px"><button class="btn btn--line" data-close>取消</button><button class="btn btn--red" id="bhMake">生成补货单</button></div>',680);
  function tot(){var t=0;$$('tr[data-p]',m).forEach(function(tr){var p=prod(tr.dataset.p),q=+tr.querySelector('input').value||0;tr.querySelector('[data-amt]').textContent=money(q*p.cost);t+=q*p.cost});$('#bhTot',m).textContent=money(t)}
  tot();m.addEventListener('input',tot);
  $('#bhMake',m).onclick=function(){var items=[];$$('tr[data-p]',m).forEach(function(tr){var p=prod(tr.dataset.p),q=+tr.querySelector('input').value||0;if(q>0)items.push({pid:p.id,qty:q,price:p.cost,sup:p.sup,stock:p.stock,safe:p.safe})});
    if(!items.length){toast('数量都是 0');return}
    var no=nextNo('BH');S.docs.unshift({no:no,type:'bh',date:TODAY,time:now(),party:'',items:items,maker:'周敏',done:false});save();m.remove();
    location.hash='#print/'+no;setTimeout(function(){toast('补货单 '+no+' 已生成，到货后在「采购入库」一键带入')},60)}
}

/* ---------- 查单打印 ---------- */
var pv={tpl:'half',copy:0,no:'',zoom:false};
function tplsFor(d){return d.type==='out'?[['half','送货单（二等分 · 三联）'],['a4','出库单（A4）']]:d.type==='in'?[['a4','入库单（A4）']]:[['a4','采购补货单（A4）']]}
function vPrint(arg){var q=arg||'',d=q?docBy(q):null,res=[];
  if(!q){d=S.docs.filter(function(x){return x.type==='out'})[0]}
  if(q&&!d){var k=q.toLowerCase();res=S.docs.filter(function(x){var who=x.type==='out'?cust(x.party).name:x.type==='in'?sup(x.party).name:'补货';
    return(x.no+who+x.items.map(function(it){return prod(it.pid).name}).join('')).toLowerCase().indexOf(k)>=0}).slice(0,12)}
  if(d&&pv.no!==d.no){pv.no=d.no;pv.tpl=d.type==='out'?'half':'a4';pv.copy=0}
  var rec=S.docs.slice(0,8);
  $('#view').innerHTML='<div class="card"><form class="pbar" id="pForm"><input class="inp" id="pQ" placeholder="输入单号、客户名或商品名" value="'+E(q&&!d?q:(d?d.no:''))+'" aria-label="查单"><button class="btn" type="submit">查单</button></form>'+
    '<div class="recent" aria-label="最近的单">'+rec.map(function(x){return '<button type="button" data-no="'+x.no+'" class="'+(d&&x.no===d.no?'on':'')+'">'+x.no+'</button>'}).join('')+'</div>'+
    (q&&!d?'<div class="res" style="margin-top:10px">'+(res.length?res.map(function(x){var who=x.type==='out'?cust(x.party).name:x.type==='in'?sup(x.party).name:'采购补货单';return '<a href="#print/'+x.no+'"><span><b>'+x.no+'</b> <small>'+E(who)+'</small></span><small>'+md(x.date)+' · '+money(sum(x))+'</small></a>'}).join(''):'<p class="empty">没找到「'+E(q)+'」，换个单号或客户名试试</p>')+'</div>':'')+'</div>'+
    (d?previewHtml(d):'');
  $('#pForm').onsubmit=function(e){e.preventDefault();var v=$('#pQ').value.trim();location.hash='#print/'+encodeURIComponent(v)};
  $$('.recent button').forEach(function(b){b.onclick=function(){location.hash='#print/'+b.dataset.no}});
  if(d)bindPreview(d);
}
function previewHtml(d){var t=tplsFor(d),who=d.type==='out'?cust(d.party).name:d.type==='in'?sup(d.party).name:'补货 '+d.items.length+' 样';
  return '<div class="card"><div class="pv-head"><div><h2 style="margin:0">'+(d.type==='out'?'出库单':d.type==='in'?'入库单':'采购补货单')+' '+d.no+'</h2><p style="font-size:13px;color:var(--muted)">'+E(who)+' · '+d.date+' '+d.time+' · '+money(sum(d))+
    (d.type==='out'?(d.signed?' · <span class="pill p-gray">回单已签收</span>':' · <span class="pill p-blue">待签收</span>'):'')+'</p></div>'+
    '<div class="row">'+(d.type==='out'&&!d.signed?'<button class="btn btn--line btn--sm" id="pSign">回单签收</button>':'')+(d.type==='bh'&&!d.done?'<a class="btn btn--line btn--sm" href="#in/bh='+d.no+'">到货了去入库</a>':'')+'<button class="btn" id="pPrint">打印</button></div></div>'+
    '<div class="tool"><div class="tabs" id="pTpl">'+t.map(function(x){return '<button data-t="'+x[0]+'" class="'+(pv.tpl===x[0]?'on':'')+'">'+x[1]+'</button>'}).join('')+'</div>'+
    (pv.tpl==='half'?'<div class="copies" id="pCopy" aria-label="联次">'+['① 存根 白','② 客户 红','③ 回单 黄'].map(function(c,i){return '<button data-c="'+i+'" class="'+(pv.copy===i?'on':'')+'">'+c+'</button>'}).join('')+'</div>':'')+'</div>'+
    '<button class="btn btn--line btn--sm zoomBtn" id="pZoom" style="margin-bottom:8px">'+(pv.zoom?'缩回看整张':'放大看清楚')+'</button><div class="desk'+(pv.zoom?' zoom':'')+'" id="desk"><div class="sheet-wrap" id="wrap">'+sheet(d)+'</div></div>'+
    '<p style="font-size:12.5px;color:var(--muted);margin-top:10px">'+(pv.tpl==='half'?'针式打印机放 241×140 二等分三联纸，一次打出白、红、黄三联；激光打印机也能直接打。':'A4 纸打印，签字后拍照或扫描存档。')+' 浏览器里点「打印」只出这张单，不带页面上别的东西。</p></div>'}
function bindPreview(d){
  $('#pTpl').onclick=function(e){var b=e.target.closest('button');if(!b)return;pv.tpl=b.dataset.t;vPrintKeep()};
  var pc=$('#pCopy');if(pc)pc.onclick=function(e){var b=e.target.closest('button');if(!b)return;pv.copy=+b.dataset.c;vPrintKeep()};
  $('#pPrint').onclick=function(){fillPrint();window.print()};
  $('#pZoom').onclick=function(){pv.zoom=!pv.zoom;vPrintKeep()};
  var ps=$('#pSign');if(ps)ps.onclick=function(){d.signed=true;save();toast(d.no+' 回单已签收');vPrintKeep()};
  fit();
}
function vPrintKeep(){var y=window.scrollY;vPrint(pv.no);window.scrollTo(0,y)}
function fit(){var desk=$('#desk'),wrap=$('#wrap');if(!desk||!wrap)return;var sh=wrap.firstElementChild;sh.style.transform='none';
  var cs=getComputedStyle(desk),avail=desk.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight),w=sh.offsetWidth,h=sh.offsetHeight,s=Math.min(1,avail/w);if(pv.zoom&&desk.classList.contains('zoom'))s=Math.max(s,0.6);
  sh.style.transform='scale('+s+')';wrap.style.width=Math.floor(w*s)+'px';wrap.style.height=Math.ceil(h*s)+'px'}
window.addEventListener('resize',fit);
function fillPrint(){var sh=$('#wrap .sheet');if(!sh)return;$('#printRoot').innerHTML=sh.outerHTML;
  $('#pagesize').textContent=pv.tpl==='half'?'@page{size:241mm 140mm;margin:0}':'@page{size:A4;margin:0}'}
window.addEventListener('beforeprint',fillPrint);

function pad(rows,n,cols){var h='';for(var i=rows;i<n;i++)h+='<tr>'+new Array(cols+1).join('<td></td>')+'</tr>';return h}
function sheet(d){var t=sum(d),items=d.items;
  if(d.type==='out'&&pv.tpl==='half'){var c=cust(d.party);
    return '<div class="sheet half c'+pv.copy+'"><div class="sh-top"><div class="co">'+CO.name+'<small>'+CO.addr+' · '+CO.tel+'</small></div><div class="ttl">送货单</div><div class="no">No.<b>'+d.no+'</b></div></div>'+
      '<div class="sh-info"><span>客户：<u>'+E(c.name)+'</u></span><span>联系人：'+E(d.phone||(c.contact+' '+c.phone))+'</span><span>日期：'+cn(d.date)+'</span><span class="w">送货地址：'+E(d.addr||c.addr)+'</span></div>'+
      '<table><thead><tr><th style="width:34px">序号</th><th>品名</th><th>规格</th><th style="width:40px">单位</th><th style="width:56px">数量</th><th style="width:70px">单价</th><th style="width:88px">金额</th><th style="width:70px">备注</th></tr></thead><tbody>'+
      items.map(function(it,i){var p=prod(it.pid);return '<tr><td class="c">'+(i+1)+'</td><td>'+E(p.name)+'</td><td>'+E(p.spec)+'</td><td class="c">'+p.unit+'</td><td class="r">'+it.qty+'</td><td class="r">'+money(it.price,1)+'</td><td class="r">'+money(it.qty*it.price,1)+'</td><td></td></tr>'}).join('')+pad(items.length,8,8)+
      '<tr class="sum"><td colspan="2" class="c">合计</td><td colspan="4" class="big">人民币（大写）：'+upper(t)+'</td><td class="r">¥'+money(t,1)+'</td><td></td></tr></tbody></table>'+
      '<div class="sh-sign"><span>制单：'+E(d.maker||CO.maker)+'</span><span>仓库发货：<u></u></span><span>送货人：<u></u></span><span>收货人签字：<u></u></span></div>'+
      '<div class="sh-note">'+(d.note?'备注：'+E(d.note)+'。':'')+'货物请当面点清，签收后即视为数量、规格无误；质量问题请 7 天内联系 '+CO.tel+'。</div>'+
      '<div class="sh-side">'+['①白 存根','②红 客户','③黄 回单'].map(function(s,i){return i===pv.copy?'<b>'+s+'</b>':'<span>'+s+'</span>'}).join('')+'</div></div>'}
  var title,info,head,rows,boxes,cols;
  if(d.type==='out'){var c2=cust(d.party);title='出库单';
    info='<span>客户：<u>'+E(c2.name)+'</u></span><span>联系人：'+E(d.phone||(c2.contact+' '+c2.phone))+'</span><span>出库日期：'+cn(d.date)+'</span><span class="w">送货地址：'+E(d.addr||c2.addr)+'</span><span>仓库：'+CO.wh+'</span><span>开单时间：'+d.date+' '+d.time+'</span><span>结算：月结</span>';
    head=['序号','编码','品名','规格','单位','数量','单价','金额'];cols=8;
    rows=items.map(function(it,i){var p=prod(it.pid);return '<tr><td class="c">'+(i+1)+'</td><td class="c">'+p.id+'</td><td>'+E(p.name)+'</td><td>'+E(p.spec)+'</td><td class="c">'+p.unit+'</td><td class="r">'+it.qty+'</td><td class="r">'+money(it.price,1)+'</td><td class="r">'+money(it.qty*it.price,1)+'</td></tr>'}).join('');
    boxes=['制单：'+E(d.maker||CO.maker),'仓管出库：','送货人：','客户签收（盖章）：']}
  else if(d.type==='in'){var s=sup(d.party);title='入库单';
    info='<span>供应商：<u>'+E(s.name)+'</u></span><span>联系人：'+E(s.contact+' '+s.phone)+'</span><span>到货日期：'+cn(d.date)+'</span><span>供应商送货单号：'+E(d.ref||'—')+'</span><span>仓库：'+CO.wh+'</span><span>验收人：'+E(d.checker||'')+'</span>';
    head=['序号','编码','品名','规格','单位','实收数量','进价','金额'];cols=8;
    rows=items.map(function(it,i){var p=prod(it.pid);return '<tr><td class="c">'+(i+1)+'</td><td class="c">'+p.id+'</td><td>'+E(p.name)+'</td><td>'+E(p.spec)+'</td><td class="c">'+p.unit+'</td><td class="r">'+it.qty+'</td><td class="r">'+money(it.price,1)+'</td><td class="r">'+money(it.qty*it.price,1)+'</td></tr>'}).join('');
    boxes=['制单：'+E(d.maker||CO.maker),'验收：'+E(d.checker||''),'仓管：','供应商送货人：']}
  else{title='采购补货单';
    info='<span>生成日期：'+cn(d.date)+'</span><span>仓库：'+CO.wh+'</span><span>状态：'+(d.done?'已到货入库':'待采购')+'</span><span class="w">依据：库存低于安全库存的商品，建议补到安全库存的 2 倍</span>';
    head=['序号','品名','规格','单位','现有','安全库存','建议补货','参考进价','金额','供应商'];cols=10;
    rows=items.map(function(it,i){var p=prod(it.pid);return '<tr><td class="c">'+(i+1)+'</td><td>'+E(p.name)+'</td><td>'+E(p.spec)+'</td><td class="c">'+p.unit+'</td><td class="r">'+it.stock+'</td><td class="r">'+it.safe+'</td><td class="r"><b>'+it.qty+'</b></td><td class="r">'+money(it.price,1)+'</td><td class="r">'+money(it.qty*it.price,1)+'</td><td>'+E(sup(it.sup).name)+'</td></tr>'}).join('');
    boxes=['制单：'+E(d.maker||CO.maker),'仓管：','采购：','审批：']}
  var span=cols-1;
  return '<div class="sheet a4"><div class="sh-top"><div class="co">'+CO.full+'<small>'+CO.addr+' · '+CO.tel+'</small></div><div class="no">No.<b>'+d.no+'</b></div></div>'+
    '<div class="sh-top" style="border:0;justify-content:center;margin:8px 0 0"><div class="ttl">'+title+'</div></div>'+
    '<div class="sh-info">'+info+'</div><table><thead><tr>'+head.map(function(h){return '<th>'+h+'</th>'}).join('')+'</tr></thead><tbody>'+rows+pad(items.length,14,cols)+
    '<tr class="sum"><td colspan="'+(cols===10?8:7)+'" class="c">合　计</td><td class="r">¥'+money(t,1)+'</td>'+(cols===10?'<td></td>':'')+'</tr>'+
    '<tr class="sum"><td colspan="'+cols+'" class="big">人民币（大写）：'+upper(t)+'</td></tr></tbody></table>'+
    '<div class="remark">备注：'+E(d.note||'')+'</div><div class="boxes">'+boxes.map(function(b){return '<div>'+b+'</div>'}).join('')+'</div>'+
    '<div class="pg"><span>'+CO.full+' · 打印于 '+TODAY+' '+now()+'</span><span>第 1 页 / 共 1 页</span></div></div>'}

/* ---------- 报表 ---------- */
var rp={period:'month',cat:''};
var PERIODS={month:['2026-11-01','本月 11-01 ~ 11-21'],week:['2026-11-16','本周 11-16 ~ 11-21'],today:[TODAY,'今天 11-21']};
function calc(){var from=PERIODS[rp.period][0],rows={};
  S.products.forEach(function(p){rows[p.id]={p:p,open:p.open,inn:0,out:0,outAmt:0,inAmt:0,gp:0}});
  S.docs.slice().reverse().forEach(function(d){if(d.type==='bh')return;d.items.forEach(function(it){var r=rows[it.pid];if(!r)return;
    if(d.date<from){r.open+=d.type==='in'?it.qty:-it.qty;return}
    if(d.type==='in'){r.inn+=it.qty;r.inAmt+=it.qty*it.price}else{r.out+=it.qty;r.outAmt+=it.qty*it.price;r.gp+=it.qty*(it.price-r.p.cost)}})});
  return S.products.map(function(p){var r=rows[p.id];r.end=r.open+r.inn-r.out;return r}).filter(function(r){return !rp.cat||r.p.cat===rp.cat})}
function cntDocs(t){var from=PERIODS[rp.period][0];return S.docs.filter(function(d){return d.type===t&&d.date>=from}).length}
function vReport(){var rows=calc(),cats=[];S.products.forEach(function(p){if(cats.indexOf(p.cat)<0)cats.push(p.cat)});
  var T=rows.reduce(function(a,r){a.inAmt+=r.inAmt;a.outAmt+=r.outAmt;a.gp+=r.gp;a.val+=r.end*r.p.cost;return a},{inAmt:0,outAmt:0,gp:0,val:0});
  var top=rows.slice().sort(function(a,b){return b.outAmt-a.outAmt}).slice(0,8),mx=top.length?top[0].outAmt||1:1;
  var bycat={};rows.forEach(function(r){bycat[r.p.cat]=(bycat[r.p.cat]||0)+r.outAmt});
  $('#view').innerHTML='<div class="tool"><div class="tabs" id="rP">'+Object.keys(PERIODS).map(function(k){return '<button data-k="'+k+'" class="'+(rp.period===k?'on':'')+'">'+PERIODS[k][1]+'</button>'}).join('')+'</div>'+
    '<div class="row"><select class="sel" id="rCat" aria-label="分类"><option value="">全部分类</option>'+cats.map(function(c){return '<option'+(c===rp.cat?' selected':'')+'>'+c+'</option>'}).join('')+'</select><button class="btn btn--line" id="rCsv">导出 Excel</button></div></div>'+
    '<div class="kpis"><div class="kpi"><span>入库金额（进价）</span><b>'+money0(T.inAmt)+'</b><small>'+cntDocs('in')+' 次到货</small></div><div class="kpi"><span>出库金额（售价）</span><b>'+money0(T.outAmt)+'</b><small>'+cntDocs('out')+' 张出库单</small></div>'+
    '<div class="kpi"><span>出库毛利</span><b>'+money0(T.gp)+'</b><small>毛利率 '+(T.outAmt?Math.round(T.gp/T.outAmt*1000)/10:0)+'%</small></div><div class="kpi"><span>期末库存货值</span><b>'+money0(T.val)+'</b><small>'+rows.length+' 种商品 · 按进价</small></div></div>'+
    '<div class="cols"><div class="card"><h2>出库金额前 8 的商品</h2>'+top.map(function(r){return '<div style="display:grid;grid-template-columns:minmax(0,9em) 1fr auto;gap:10px;align-items:center;margin:7px 0;font-size:13px"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+E(r.p.name)+'</span><span style="background:#eef1f6;border-radius:4px;height:14px;overflow:hidden"><i style="display:block;height:100%;width:'+Math.max(2,Math.round(r.outAmt/mx*100))+'%;background:#2b59c3;border-radius:4px"></i></span><span style="font-variant-numeric:tabular-nums">'+money0(r.outAmt)+'</span></div>'}).join('')+'</div>'+
    '<div class="card"><h2>按分类出库</h2>'+Object.keys(bycat).map(function(c){var pc=T.outAmt?bycat[c]/T.outAmt:0;return '<div style="display:flex;justify-content:space-between;padding:8px 0;border-top:1px solid var(--line);font-size:13.5px"><span>'+c+'</span><span style="font-variant-numeric:tabular-nums">'+money0(bycat[c])+' <small style="color:var(--muted)">'+Math.round(pc*100)+'%</small></span></div>'}).join('')+'</div></div>'+
    '<div class="card" style="margin-top:16px"><h2>按商品进销存 <small>'+PERIODS[rp.period][1]+' · 期初 + 入库 − 出库 = 结存，结存低于安全库存标红</small></h2><div class="tw"><table><thead><tr><th>编码</th><th>商品</th><th>单位</th><th class="num">期初</th><th class="num">入库</th><th class="num">出库</th><th class="num">结存</th><th class="num">入库金额</th><th class="num">出库金额</th><th class="num">毛利</th></tr></thead><tbody>'+
    rows.map(function(r){var l=r.end<r.p.safe;return '<tr class="'+(l?'warn':'')+'"><td>'+r.p.id+'</td><td>'+pname(r.p)+'</td><td>'+r.p.unit+'</td><td class="num">'+r.open+'</td><td class="num">'+(r.inn?'+'+r.inn:'—')+'</td><td class="num">'+(r.out?'−'+r.out:'—')+'</td><td class="num'+(l?' stk-red':'')+'">'+r.end+'</td><td class="num">'+(r.inAmt?money(r.inAmt,1):'—')+'</td><td class="num">'+(r.outAmt?money(r.outAmt,1):'—')+'</td><td class="num">'+(r.gp?money(r.gp,1):'—')+'</td></tr>'}).join('')+
    '</tbody><tfoot><tr><td colspan="7">合计 '+rows.length+' 种</td><td class="num">'+money(T.inAmt,1)+'</td><td class="num">'+money(T.outAmt,1)+'</td><td class="num">'+money(T.gp,1)+'</td></tr></tfoot></table></div></div>';
  $('#rP').onclick=function(e){var b=e.target.closest('button');if(!b)return;rp.period=b.dataset.k;vReport()};
  $('#rCat').onchange=function(){rp.cat=this.value;vReport()};
  $('#rCsv').onclick=function(){var lines=[['编码','品名','规格','单位','期初','入库','出库','结存','安全库存','入库金额','出库金额','毛利']];
    rows.forEach(function(r){lines.push([r.p.id,r.p.name,r.p.spec,r.p.unit,r.open,r.inn,r.out,r.end,r.p.safe,r2(r.inAmt),r2(r.outAmt),r2(r.gp)])});
    var csv='﻿'+lines.map(function(l){return l.map(function(v){v=String(v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}).join(',')}).join('\r\n');
    try{var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='进销存报表_'+PERIODS[rp.period][0]+'.csv';document.body.appendChild(a);a.click();a.remove();toast('已导出，用 Excel 打开')}catch(e){toast('这个浏览器不支持直接下载')}};
}

route();
})();
