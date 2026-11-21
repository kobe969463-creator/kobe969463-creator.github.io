/* 客户管理 CRM 演示：数据和动作（电脑后台、手机跟进页共用）
   公司「拓禾办公」和所有客户、金额都是编的。状态存在浏览器 localStorage，读写都包 try/catch。 */
(function(){
'use strict';
var KEY='crm-demo-tuohe-v1';
var TODAY='2026-11-20',NOW='09:40';
var WEEK=['周日','周一','周二','周三','周四','周五','周六'];

var SALES=[
  {id:'s1',name:'陈立峰',team:'销售一组',lead:1},{id:'s2',name:'赵晓楠',team:'销售一组'},{id:'s4',name:'孙浩',team:'销售一组'},
  {id:'s5',name:'吴佳怡',team:'销售一组'},{id:'s6',name:'郑凯',team:'销售一组'},{id:'s7',name:'林哲',team:'销售一组'},
  {id:'s8',name:'何静',team:'销售二组',lead:1},{id:'s3',name:'王思雨',team:'销售二组'},{id:'s9',name:'许嘉欣',team:'销售二组'},
  {id:'s10',name:'冯涛',team:'销售二组'},{id:'s11',name:'唐悦',team:'销售二组'},{id:'s12',name:'李卓',team:'销售二组'},
  {id:'s13',name:'周宇航',team:'销售二组'}
];
var ME='s3';
var STAGES=['线索','初步沟通','需求确认','已报价','谈判','成交'];
var LOST='输单';
var SOURCES=['官网咨询','老客户介绍','展会','电话陌拜','地图搜索','公众号留言'];
var NEEDS=[
  ['复印机租赁 3 台',10800,'年'],['彩色复合机采购',26000],['会议平板 86 寸 ×2',38000],['IT 运维包年',24000],
  ['办公网络改造',45000],['打印耗材年框',12000],['门禁考勤一体机',9000],['监控安装 16 路',16000],
  ['新办公室整体（网络 + 打印 + 会议室）',86000],['复印机租赁 1 台',4200,'年'],['投影 + 幕布 ×3',15000],['电脑 20 台 + 装机',98000]
];
var CITY=['杭州','杭州','杭州','宁波','绍兴','嘉兴','湖州','杭州','金华'];
var ZIHAO=['青川','恒岳','瑞丰','睿博','安诚','景和','拓远','德昇','华岚','卓衡','明澈','远舟','合川','鼎晟','新禾','嘉澜','鸿策','雅筑',
  '博研','森茂','汇知','中屹','衡信','云峤','盛衍','冠群','澄和','思齐','启衡','禾木','知行','书远','朗月','泊川','南岸','栖云','一苇',
  '若水','清和','望舒','观澜','致远','怀瑾','素心','乐游','山禾','溪亭','青柠','白石','松间','行舟','临川','半岛','星桥','西岭','东篱'];
var KIND=['科技有限公司','建筑设计事务所','会计师事务所','律师事务所','教育培训学校','贸易有限公司','物业服务有限公司','医疗器械有限公司',
  '包装材料有限公司','广告传媒有限公司','口腔门诊部','电子商务有限公司','人力资源有限公司','装饰工程有限公司','财税咨询有限公司'];
var IND={'科技有限公司':'软件 / 互联网','建筑设计事务所':'设计','会计师事务所':'财税','律师事务所':'法律','教育培训学校':'教育','贸易有限公司':'贸易',
  '物业服务有限公司':'物业','医疗器械有限公司':'医疗','包装材料有限公司':'制造','广告传媒有限公司':'广告传媒','口腔门诊部':'医疗',
  '电子商务有限公司':'电商','人力资源有限公司':'人力','装饰工程有限公司':'装修','财税咨询有限公司':'财税'};
var SUR='张王李刘陈杨黄赵周吴徐孙朱马胡郭林何高罗郑梁谢宋唐许韩冯邓曹彭曾肖田董潘袁蔡蒋余于杜叶程魏苏吕丁沈任姚卢傅钟姜崔谭陆汪范金石廖贾夏韦付方邹熊白孟秦邱江尹薛';
var GIVEN=['雯','磊','婷','佳慧','志强','晓燕','建华','丽娟','海涛','文静','俊杰','雪梅','国栋','玉兰','子豪','思琪','振宇','美玲','永刚','慧敏','立新','秀英','明轩','春燕','伟','静','敏','涛','颖','超','晓东','云飞','嘉怡','欣然','梦瑶','宏伟'];
var TITLE=['行政主管','行政经理','办公室主任','总经理','采购','IT 负责人','财务经理','前台 / 行政','老板','运营总监'];

/* ---------- 日期 ---------- */
function dn(s){var a=s.split('-');return Date.UTC(+a[0],+a[1]-1,+a[2])/864e5}
function ds(n){var d=new Date(n*864e5);return d.getUTCFullYear()+'-'+p2(d.getUTCMonth()+1)+'-'+p2(d.getUTCDate())}
function p2(n){return (n<10?'0':'')+n}
var TN=dn(TODAY);
function wk(s){return WEEK[new Date(dn(s)*864e5).getUTCDay()]}
function md(s){var a=s.split('-');return (+a[1])+'月'+(+a[2])+'日'}
function dayLabel(s){var k=dn(s)-TN;
  if(k===0)return '今天';if(k===1)return '明天';if(k===2)return '后天';if(k===-1)return '昨天';
  if(k>2&&k<7)return wk(s);return md(s)}
function addDays(s,k){return ds(dn(s)+k)}
function nextMonday(s){var k=new Date(dn(s)*864e5).getUTCDay();return addDays(s,((8-k)%7)||7)}

/* ---------- 随机（固定种子，每次打开数据一样） ---------- */
var seed=20261120;
function rnd(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}
function ri(a,b){return a+Math.floor(rnd()*(b-a+1))}
function pick(a){return a[Math.floor(rnd()*a.length)]}
function wpick(items,w){var s=0,i,r;for(i=0;i<w.length;i++)s+=w[i];r=rnd()*s;for(i=0;i<w.length;i++){r-=w[i];if(r<0)return items[i]}return items[items.length-1]}
function tm(a,b){var h=ri(a,b),m=pick(['00','10','15','20','30','40','45','50']);return p2(h)+':'+m}

/* ---------- 跟进话术 ---------- */
var T={
  0:['{src}来的，想了解{need}，打过去没接，发了短信','{src}留了电话，问{need}大概多少钱，约了回电','新线索：{need}，先加了微信，对方说下周再细聊'],
  1:['电话聊了 10 分钟，现在用的是买断的旧机器，老卡纸，想换','加了微信，发了{need}的方案和价格范围','对方说今年有预算，先要一份方案看看','聊了一下，决定权在{boss}，下次约{boss}一起'],
  2:['上门看了现场，3 层楼，每层一台，月印量大概 8000 张','确认了要黑白为主、偶尔彩色，要能扫描到邮箱','带样机上门演示了 40 分钟，{c}比较满意','对方列了 5 条要求，主要在意售后响应时间'],
  3:['发了正式报价 ¥{amt}，对方说要跟{boss}汇报','报价单发过去了，对方在比另一家','按对方要求改了一版报价，去掉了两台打印机','对方觉得贵了 10%，我说可以送一年耗材，回去商量'],
  4:['对方希望押金减半，跟主管申请了，同意减到 1000','合同条款对过一遍，对方法务要改违约金那条','约了下周二签合同，要开专票','价格谈定了，就差盖章'],
  5:['合同签了，周四装机','回款到了，安排装机和培训','装机完成，{c}说用着挺顺','签了，顺便问了明年的耗材年框'],
  L:['选了别家，价格低 15%','老板说今年先不换了，明年再说','对方公司要搬家，项目暂停','对方总部统一采购，不在我们这买']
};
var NEXTN={
  0:['第一次电话，问清需求','再打一次，上次没接'],
  1:['问方案看了没有','约时间上门看现场','约{boss}一起聊'],
  2:['带样机上门演示','出方案和报价','确认印量和楼层'],
  3:['问报价{boss}看了没有','对方在比价，再沟通一次','送耗材那个方案等回复'],
  4:['确认合同条款','约签合同时间','催盖章、开票信息']
};
function fill(t,c){return t.replace(/\{need\}/g,(/^[A-Za-z]/.test(c.need)?' ':'')+c.need).replace(/\{amt\}/g,c.amount.toLocaleString('zh-CN')).replace(/\{src\}/g,c.source)
  .replace(/\{boss\}/g,c.boss).replace(/\{c\}/g,c.contact)}

/* ---------- 生成演示数据 ---------- */
function makeName(used){var n,i=0;do{n=pick(CITY)+pick(ZIHAO)+pick(KIND);i++}while(used[n]&&i<50);used[n]=1;return n}
function mkCustomer(id,used){
  var name=makeName(used),kind='';for(var k in IND)if(name.indexOf(k)>0)kind=k;
  var nd=pick(NEEDS),amt=Math.round(nd[1]*(0.8+rnd()*0.5)/100)*100;
  var sur=SUR[ri(0,SUR.length-1)];
  return {id:id,name:name,ind:IND[kind]||'其他',contact:sur+pick(GIVEN),title:pick(TITLE),
    phone:pick(['138','139','135','136','158','159','186','187','177','133'])+'****'+p2(ri(10,99))+p2(ri(10,99)),
    need:nd[0],amount:amt,source:wpick(SOURCES,[30,18,10,14,16,12]),boss:pick(['老板','总经理','财务总监','合伙人']),
    size:pick(['20 人左右','30～50 人','50～100 人','100 人以上','十几个人']),addr:'',
    stage:0,maxStage:0,owner:null,next:null,nextNote:'',follows:[],created:'',pool:null,deal:null,lost:null}
}
function genFollows(c,stageIdx,lastDay,isLost){
  var n=stageIdx===0?ri(1,2):stageIdx+ri(1,2);if(isLost)n=ri(2,4);
  var days=[lastDay],d=lastDay,i;
  for(i=1;i<n;i++){d=addDays(d,-ri(2,9));days.unshift(d)}
  c.created=addDays(days[0],-ri(0,2));
  var by=c.owner;
  for(i=0;i<n;i++){
    var st=n===1?stageIdx:Math.round(stageIdx*i/(n-1));if(isLost)st=Math.min(c.maxStage,Math.round(c.maxStage*i/Math.max(1,n-2)));
    var txt=(isLost&&i===n-1)?pick(T.L):fill(pick(T[st]),c);
    c.follows.push({d:days[i],t:tm(9,18),by:by,type:wpick(['电话','微信','上门','邮件'],[48,30,16,6]),text:txt,stage:(isLost&&i===n-1)?LOST:STAGES[st]});
  }
}
function seedData(){
  seed=20261120;
  var used={},cs=[],id=1,i,j,c,s;
  function nid(){return 'c'+(id++)}
  // 跟进中
  SALES.forEach(function(sl){
    var cnt=sl.id===ME?16:ri(6,9);
    for(j=0;j<cnt;j++){
      c=mkCustomer(nid(),used);c.owner=sl.id;
      var st=wpick([0,1,2,3,4],[12,28,22,20,18]);c.stage=st;c.maxStage=st;
      var last=addDays(TODAY,-ri(1,12));
      genFollows(c,st,last);
      var nx=wpick(['today','over','fut'],[18,14,68]);
      if(nx==='today')c.next={d:TODAY,t:tm(10,17)};
      else if(nx==='over'){var od=addDays(TODAY,-ri(1,6));if(dn(od)<=dn(last))od=addDays(last,1);if(dn(od)>=TN)od=addDays(TODAY,-1);c.next={d:od,t:tm(9,17)}}
      else c.next={d:addDays(TODAY,ri(1,14)),t:tm(9,17)};
      c.nextNote=fill(pick(NEXTN[st]),c);
      cs.push(c);
    }
  });
  // 我（王思雨）的：5 个今天、3 个逾期，写死，录屏和截图稳定
  var mine=cs.filter(function(x){return x.owner===ME});
  var plan=[['today','09:30'],['today','10:30'],['today','14:00'],['today','15:30'],['today','16:30'],['over',-1],['over',-2],['over',-5]];
  mine.forEach(function(x,k){
    if(k<plan.length){var p=plan[k];
      if(p[0]==='today'){x.next={d:TODAY,t:p[1]};if(x.stage===0){x.stage=1;x.maxStage=1}}
      else{x.next={d:addDays(TODAY,p[1]),t:tm(9,16)};var lf=x.follows[x.follows.length-1];if(dn(lf.d)>=dn(x.next.d)){lf.d=addDays(x.next.d,-ri(2,5));x.created=addDays(x.follows[0].d,-1);if(dn(x.follows[0].d)>dn(lf.d))x.follows[0].d=addDays(lf.d,-3)}}
    }else if(dn(x.next.d)<=TN){x.next={d:addDays(TODAY,ri(1,10)),t:tm(9,17)}}
    x.nextNote=fill(pick(NEXTN[x.stage]),x);
  });
  // 成交（6 月到 11 月）
  var monthW=[[6,6],[7,7],[8,8],[9,9],[10,11],[11,8]];
  monthW.forEach(function(mw){
    for(j=0;j<mw[1];j++){
      c=mkCustomer(nid(),used);c.owner=(mw[0]===11&&j<2)?ME:pick(SALES).id;c.stage=5;c.maxStage=5;
      var last=mw[0]===11?'2026-11-'+p2(ri(2,19)):'2026-'+p2(mw[0])+'-'+p2(ri(3,28));
      if(mw[0]===11&&j<2){var nn=NEEDS[j===0?2:3];c.need=nn[0];c.amount=j===0?36800:24000}
      genFollows(c,5,last);c.deal={d:last,amount:c.amount};c.next=null;c.nextNote='';
      cs.push(c);
    }
  });
  // 输单
  for(j=0;j<14;j++){c=mkCustomer(nid(),used);c.owner=pick(SALES).id;c.maxStage=ri(1,4);c.stage=-1;
    var lday='2026-'+p2(ri(7,11))+'-'+p2(ri(2,18));genFollows(c,c.maxStage,lday,true);c.lost={d:lday,reason:c.follows[c.follows.length-1].text};cs.push(c)}
  // 公海
  var reasons=[['超 30 天没跟进，自动收回',9],['前负责人离职（马骁）',5],['主动退回：暂时不需要',5],['新线索，还没人领',7]];
  reasons.forEach(function(r){
    for(j=0;j<r[1];j++){
      c=mkCustomer(nid(),used);
      if(r[0].indexOf('新线索')===0){c.owner=null;c.created=addDays(TODAY,-ri(0,6));
        c.follows=[{d:c.created,t:c.created===TODAY?tm(7,8):tm(9,18),by:null,type:'系统',text:c.source+'进来的线索：「想了解'+c.need+'」，还没人联系过',stage:'线索'}];
        c.pool={since:c.created,reason:r[0],prev:null};
      }else{
        var prev=r[0].indexOf('离职')>0?'马骁':pick(SALES.filter(function(x){return x.id!==ME})).name,st2=ri(1,3);
        c.owner='x';c.stage=st2;c.maxStage=st2;
        var lastd=r[0].indexOf('30')>0?addDays(TODAY,-ri(31,58)):addDays(TODAY,-ri(8,40));
        genFollows(c,st2,lastd);
        c.follows.forEach(function(f){f.by='@'+prev});
        var since=r[0].indexOf('30')>0?addDays(lastd,30):addDays(lastd,ri(0,3));if(dn(since)>TN)since=addDays(TODAY,-1);
        c.follows.push({d:since,t:'02:00',by:null,type:'系统',text:r[0].indexOf('30')>0?'超过 30 天没有新的跟进，自动退回公海':(r[0].indexOf('离职')>0?'前负责人马骁离职，客户转入公海':prev+' 退回公海：暂时不需要，明年可能再看'),stage:STAGES[st2]});
        c.owner=null;c.pool={since:since,reason:r[0],prev:prev};
      }
      c.next=null;c.nextNote='';
      cs.push(c);
    }
  });
  // 录屏用：公海第一个固定成这家（进公海最新、需求大）
  var top=cs.filter(function(x){return x.pool&&x.pool.reason.indexOf('30')>0})[0];
  if(top){top.name='嘉兴澄和建筑设计事务所';top.ind='设计';top.need='新办公室整体（网络 + 打印 + 会议室）';top.amount=86000;top.contact='沈佳慧';top.title='行政经理';
    top.source='展会';top.size='30～50 人';top.pool.since=addDays(TODAY,0);top.pool.reason='超 30 天没跟进，自动收回';
    top.pool.prev='郑凯';
    top.follows=[
      {d:'2026-09-12',t:'15:20',by:'@郑凯',type:'上门',text:'展会上加的微信，对方新租了一层办公室，想把网络、打印、会议室一起交给一家做',stage:'线索'},
      {d:'2026-09-26',t:'10:40',by:'@郑凯',type:'电话',text:'电话聊了 20 分钟，30～50 人，会议室 2 间，预算没定，等装修图纸',stage:'初步沟通'},
      {d:'2026-10-19',t:'14:05',by:'@郑凯',type:'微信',text:'对方说新办公室年底装修完，到时候一起弄，让 11 月中再联系',stage:'初步沟通'},
      {d:TODAY,t:'02:00',by:null,type:'系统',text:'超过 30 天没有新的跟进，自动退回公海',stage:'初步沟通'}];
    top.created='2026-09-12';top.stage=1;top.maxStage=1;
  }
  return {v:1,customers:cs,log:[],seq:id};
}

/* ---------- 存取 ---------- */
var S=null;
function load(){
  try{var raw=localStorage.getItem(KEY);if(raw){var o=JSON.parse(raw);if(o&&o.v===1&&o.customers){S=o;return S}}}catch(e){}
  S=seedData();return S;
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function reset(){try{localStorage.removeItem(KEY)}catch(e){}S=seedData();save();return S}
window.addEventListener('storage',function(e){if(e.key===KEY&&window.CRM&&CRM.onExternal){S=null;load();CRM.onExternal()}});

/* ---------- 查询 ---------- */
function sales(id){for(var i=0;i<SALES.length;i++)if(SALES[i].id===id)return SALES[i];return null}
function sname(id){if(!id)return '系统';if(id.charAt(0)==='@')return id.slice(1);var s=sales(id);return s?s.name:'—'}
function byId(id){var a=S.customers;for(var i=0;i<a.length;i++)if(a[i].id===id)return a[i];return null}
function isActive(c){return c.owner&&c.stage>=0&&c.stage<5}
function nextState(c){ // 'over' | 'today' | 'soon' | 'none'
  if(!isActive(c))return '';if(!c.next)return 'none';var k=dn(c.next.d)-TN;
  if(k<0)return 'over';if(k===0)return 'today';return 'fut'}
function overDays(c){return c.next?TN-dn(c.next.d):0}
function stageName(c){return c.stage<0?LOST:STAGES[c.stage]}
function lastFollow(c){return c.follows[c.follows.length-1]}
function doneK(c,k){return c.doneToday&&c.doneToday.d===TODAY&&c.doneToday.kind===k}
function mineToday(owner){owner=owner||ME;return S.customers.filter(function(c){return c.owner===owner&&(nextState(c)==='today'||doneK(c,'today'))}).sort(function(a,b){var ta=doneK(a,'today')?a.doneToday.t:a.next.t,tb=doneK(b,'today')?b.doneToday.t:b.next.t;return ta<tb?-1:1})}
function mineOver(owner){owner=owner||ME;return S.customers.filter(function(c){return c.owner===owner&&(nextState(c)==='over'||doneK(c,'over'))}).sort(function(a,b){return (b.doneToday&&b.doneToday.d===TODAY?b.doneToday.od:overDays(b))-(a.doneToday&&a.doneToday.d===TODAY?a.doneToday.od:overDays(a))})}
function doneToday(c){return !!(c.doneToday&&c.doneToday.d===TODAY)}
function poolList(){return S.customers.filter(function(c){return !c.owner}).sort(function(a,b){return dn(b.pool.since)-dn(a.pool.since)})}
function followedToday(c){var f=lastFollow(c);return f&&f.d===TODAY&&f.type!=='系统'&&f.by===c.owner}

/* ---------- 动作 ---------- */
function nowT(){var d=new Date();var h=d.getHours(),m=d.getMinutes();if(h<9||h>19){return NOW}return p2(h)+':'+p2(m)}
function claim(id,who){var c=byId(id);if(!c||c.owner)return false;who=who||ME;c.owner=who;
  c.follows.push({d:TODAY,t:nowT(),by:who,type:'系统',text:sname(who)+' 从公海领取（原因：'+c.pool.reason+'）',stage:STAGES[Math.max(0,c.stage)]});
  c.claimed={d:TODAY,from:c.pool};c.pool=null;if(c.stage<0)c.stage=0;
  c.next={d:TODAY,t:'17:00'};c.nextNote='领了，今天先打个电话';save();return true}
function release(id,reason){var c=byId(id);if(!c||!c.owner)return false;var prev=c.owner;
  c.follows.push({d:TODAY,t:nowT(),by:prev,type:'系统',text:sname(prev)+' 退回公海：'+reason,stage:stageName(c)});
  c.owner=null;c.pool={since:TODAY,reason:'主动退回：'+reason,prev:sname(prev)};c.next=null;c.nextNote='';save();return true}
function addFollow(id,o){ // o:{type,text,stage(idx or 'L'),next:{d,t}|null,nextNote}
  var c=byId(id);if(!c)return false;var by=c.owner||ME;
  var pv=nextState(c);if(pv==='today'||pv==='over')c.doneToday={kind:pv,d:TODAY,od:pv==='over'?overDays(c):0,t:c.next.t};
  if(o.stage==='L'){c.stage=-1;c.lost={d:TODAY,reason:o.text}}
  else if(typeof o.stage==='number'){c.stage=o.stage;if(o.stage>c.maxStage)c.maxStage=o.stage;if(o.stage===5)c.deal={d:TODAY,amount:c.amount}}
  c.follows.push({d:TODAY,t:nowT(),by:by,type:o.type||'电话',text:o.text,stage:stageName(c)});
  if(isActive(c)){c.next=o.next||null;c.nextNote=o.next?(o.nextNote||'再跟进一次'):''}else{c.next=null;c.nextNote=''}
  save();return true}
function setNext(id,next,note){var c=byId(id);if(!c)return;c.next=next;c.nextNote=note||c.nextNote;save()}

/* ---------- 报表 ---------- */
function inMonth(d,ym){return d&&d.slice(0,7)===ym}
function funnel(){
  var cs=S.customers,res=STAGES.map(function(n,i){return {name:n,reached:0,now:0,amount:0}});
  cs.forEach(function(c){
    var ms=c.pool&&c.stage<=0?0:c.maxStage;
    for(var i=0;i<=ms&&i<6;i++)res[i].reached++;
    if(c.owner&&c.stage>=0){res[c.stage].now++;res[c.stage].amount+=c.stage===5?(c.deal?c.deal.amount:c.amount):c.amount}
  });
  return res}
function bySales(ym){
  ym=ym||TODAY.slice(0,7);
  return SALES.map(function(s){
    var r={id:s.id,name:s.name,team:s.team,follows:0,newC:0,deals:0,dealAmt:0,active:0,pipe:0,today:0,over:0};
    S.customers.forEach(function(c){
      c.follows.forEach(function(f){if(f.by===s.id&&f.type!=='系统'&&inMonth(f.d,ym))r.follows++});
      if(c.owner===s.id){
        if(c.deal&&inMonth(c.deal.d,ym)){r.deals++;r.dealAmt+=c.deal.amount}
        if(isActive(c)){r.active++;r.pipe+=c.amount;var ns=nextState(c);if(ns==='today')r.today++;if(ns==='over')r.over++}
        if((inMonth(c.created,ym)&&!c.claimed)||(c.claimed&&inMonth(c.claimed.d,ym)))r.newC++;
      }
    });
    return r}).sort(function(a,b){return b.dealAmt-a.dealAmt||b.follows-a.follows})}
function byMonth(){
  var ms=['2026-06','2026-07','2026-08','2026-09','2026-10','2026-11'];
  return ms.map(function(m){var r={m:m,label:(+m.slice(5))+'月',deals:0,amt:0,leads:0,follows:0};
    S.customers.forEach(function(c){if(c.deal&&inMonth(c.deal.d,m)){r.deals++;r.amt+=c.deal.amount}if(inMonth(c.created,m))r.leads++;
      c.follows.forEach(function(f){if(f.type!=='系统'&&inMonth(f.d,m))r.follows++})});return r})}
function bySource(){
  return SOURCES.map(function(s){var r={name:s,all:0,deals:0,amt:0};S.customers.forEach(function(c){if(c.source===s){r.all++;if(c.deal){r.deals++;r.amt+=c.deal.amount}}});r.rate=r.all?r.deals/r.all:0;return r})
    .sort(function(a,b){return b.amt-a.amt})}

/* ---------- 格式 ---------- */
function money(n){if(n>=10000){var w=n/10000;return '¥'+(w>=100?Math.round(w):(Math.round(w*10)/10))+'万'}return '¥'+n.toLocaleString('zh-CN')}
function moneyFull(n){return '¥'+Math.round(n).toLocaleString('zh-CN')}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(ch){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]})}
function nextLabel(c){if(!c.next)return '没约';var k=dn(c.next.d)-TN;if(k<0)return '逾期 '+(-k)+' 天';return dayLabel(c.next.d)+' '+c.next.t}

window.CRM={TODAY:TODAY,NOW:NOW,ME:ME,SALES:SALES,STAGES:STAGES,LOST:LOST,SOURCES:SOURCES,
  load:load,save:save,reset:reset,get S(){return S||load()},
  dn:dn,ds:ds,addDays:addDays,nextMonday:nextMonday,dayLabel:dayLabel,md:md,wk:wk,
  sales:sales,sname:sname,byId:byId,isActive:isActive,nextState:nextState,overDays:overDays,stageName:stageName,lastFollow:lastFollow,
  mineToday:mineToday,mineOver:mineOver,doneToday:doneToday,poolList:poolList,followedToday:followedToday,
  claim:claim,release:release,addFollow:addFollow,setNext:setNext,
  funnel:funnel,bySales:bySales,byMonth:byMonth,bySource:bySource,
  money:money,moneyFull:moneyFull,esc:esc,nextLabel:nextLabel,onExternal:null};
load();
})();
