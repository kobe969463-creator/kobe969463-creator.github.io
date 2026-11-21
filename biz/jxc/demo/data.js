/* 永固五金建材 · 进销存演示数据（公司名、客户、数据都是编的）
   商品 32 种、客户 12 家、供应商 7 家；11 月 1 日～21 日的出入库单按固定种子生成，每次打开都一样。 */
(function(){
var CO={name:'永固五金建材',full:'永固五金建材批发部',addr:'城西建材市场 C 区 12-14 号',tel:'0757-8623 1188',wh:'城西仓',maker:'周敏'};

// [编码,品名,规格,单位,分类,进价,售价,安全库存,供应商,出库常见量[min,max],目标结存]
var P=[
['P001','膨胀螺丝','M8×80 镀锌','盒',  '紧固件',28,36,40,'S3',[2,12],96],
['P002','自攻螺钉','4.2×25 十字沉头 1000只','盒','紧固件',22,29,50,'S3',[2,15],138],
['P003','六角螺栓','M10×50 不锈钢 50套','包','紧固件',45,58,20,'S3',[1,6],25],
['P004','圆钢钉','2 寸 散装','公斤','紧固件',6.5,8.5,100,'S3',[10,40],260],
['P005','拉铆钉','4×10 铝 1000只','盒','紧固件',26,34,30,'S3',[1,6],71],
['P101','PPR 冷水管','20×2.3 4米','根','管材管件',9.8,13,200,'S1',[20,80],540],
['P102','PPR 热水管','25×4.2 4米','根','管材管件',19.5,25,120,'S1',[10,50],286],
['P103','PPR 等径弯头','20 100个装','包','管材管件',38,52,30,'S1',[1,6],64],
['P104','PVC 排水管','110×3.2 4米','根','管材管件',32,41,60,'S1',[4,20],132],
['P105','PVC 电线管','16 中型 3.8米','根','管材管件',2.6,3.6,300,'S1',[30,120],820],
['P106','角阀','铜芯 4分 冷热通用','个','管材管件',12,17,80,'S1',[6,24],52],
['P107','生料带','20米 加厚','卷','管材管件',0.9,1.5,500,'S1',[20,100],1320],
['P201','BV2.5 铜芯线','国标 100米','卷','电工电料',168,205,20,'S2',[2,8],26],
['P202','BV4 铜芯线','国标 100米','卷','电工电料',265,318,15,'S2',[1,4],34],
['P203','BV1.5 铜芯线','国标 100米','卷','电工电料',105,129,20,'S2',[2,6],12],
['P204','五孔插座','86型 白色','个','电工电料',6.8,9.5,200,'S7',[20,80],460],
['P205','单开开关','86型 白色','个','电工电料',5.2,7.5,150,'S7',[10,50],372],
['P206','空气开关','2P 32A','个','电工电料',26,35,40,'S7',[2,12],88],
['P207','LED 筒灯','5W 开孔 75mm','个','电工电料',9.5,13.5,100,'S7',[10,40],236],
['P301','角磨片','100×6 树脂 25片','盒','五金工具',38,50,20,'S4',[1,5],24],
['P302','冲击钻头','8mm 四坑','支','五金工具',4.5,6.8,100,'S4',[5,30],255],
['P303','钢卷尺','5米 加厚','把','五金工具',7,10.5,50,'S4',[2,10],118],
['P304','不锈钢合页','4寸 静音','对','五金工具',4.2,6,200,'S4',[10,60],430],
['P305','执手门锁','静音 室内','套','五金工具',58,78,30,'S4',[2,8],9],
['P401','硅酮玻璃胶','透明 300ml','支','涂料辅料',7.8,11,150,'S6',[12,48],366],
['P402','瓷砖胶','C1 20kg','袋','涂料辅料',26,34,80,'S6',[8,30],46],
['P403','耐水腻子粉','20kg','袋','涂料辅料',16,22,100,'S6',[10,40],248],
['P404','JS 防水涂料','双组分 18kg','桶','涂料辅料',158,198,20,'S6',[1,6],23],
['P405','美纹纸','48mm×20米','卷','涂料辅料',2.2,3.5,200,'S6',[10,60],515],
['P501','纸面石膏板','9.5mm 1200×2400','张','板材龙骨',24,31,150,'S5',[10,60],390],
['P502','轻钢主龙骨','50 系列 3米','根','板材龙骨',7.5,10,300,'S5',[20,100],780],
['P503','水泥','P.O 42.5 50kg','袋','板材龙骨',23,28,200,'S5',[10,60],560]
];
var CUST=[
['C01','锦程装饰工程有限公司','陈工','138 2716 4402','南海区桂城海八路 88 号 · 碧水湾 6 栋工地'],
['C02','华盛建筑劳务队','王队长','139 2255 1830','禅城区张槎一路 · 华盛产业园 2 号楼'],
['C03','安居家装','李经理','135 3098 6621','顺德区大良新桂路 216 号'],
['C04','宏达水电安装','赵师傅','186 6623 0975','南海区大沥镇黄岐商业街 17 号'],
['C05','鹏程物业维修部','孙主管','137 2841 5509','禅城区岭南大道北 · 鹏程花园物业中心'],
['C06','好邻居五金店','吴老板','159 8880 3147','三水区西南街道健力宝南路 5 号铺'],
['C07','金屋装饰设计','郑设计','133 1608 7724','南海区千灯湖金融街 B 座 1203'],
['C08','德信建设 3 号工地','冯工','136 3260 9812','高明区荷城沧江路 · 德信雅苑 3 期'],
['C09','美家整装','何店长','188 2287 4410','顺德区容桂大道中 92 号'],
['C10','合力机电安装','钱工','131 4825 7036','禅城区汾江中路 · 合力大厦 5 楼'],
['C11','城南建材店','黄老板','150 1866 2259','禅城区南庄镇紫洞路 31 号'],
['C12','刘师傅（水电）','刘师傅','177 2734 9058','自提']
];
var SUP=[
['S1','南方管业供货部','莫经理','0757-8251 6633'],
['S2','华通电线电缆','林业务','0757-8337 2208'],
['S3','恒力紧固件厂','杨厂长','0757-8812 4590'],
['S4','金刚工具批发','许经理','0757-8669 1172'],
['S5','安达建材','邓经理','0757-8590 7731'],
['S6','雅彩涂料经销','邱业务','0757-8288 3016'],
['S7','鸿运开关电器','罗经理','0757-8726 4485']
];
var NOTES_OUT=['','','','上午 10 点前送到','放门卫，打电话','楼上 5 楼，带搬运','月结','','车停后门','先送一半'];

function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function build(){
  var r=rng(20261121),ri=function(a,b){return a+Math.floor(r()*(b-a+1))},pick=function(a){return a[Math.floor(r()*a.length)]};
  var products=P.map(function(a){return{id:a[0],name:a[1],spec:a[2],unit:a[3],cat:a[4],cost:a[5],price:a[6],safe:a[7],sup:a[8],lot:a[9],tgt:a[10]}});
  var byId={};products.forEach(function(p){byId[p.id]=p});
  var docs=[],seq={};
  function no(pre,d){var k=pre+d;seq[k]=(seq[k]||0)+1;return pre+d.replace(/-/g,'')+'-'+(seq[k]<10?'0':'')+seq[k]}
  function round5(n){return n<10?n:Math.round(n/5)*5}
  for(var day=1;day<=21;day++){
    var d='2026-11-'+(day<10?'0':'')+day,wd=(day+6)%7; // 11-01 是周日
    // 入库：隔一两天来一车
    if(day%2===1||day===20){
      var s=SUP[(day*3)%SUP.length],ps=products.filter(function(p){return p.sup===s[0]});
      var n=Math.min(ps.length,ri(2,5)),used={},items=[];
      while(items.length<n){var p=pick(ps);if(used[p.id])continue;used[p.id]=1;
        items.push({pid:p.id,qty:round5(ri(p.lot[0],p.lot[1])*ri(3,5)),price:p.cost})}
      docs.push({no:no('RK',d),type:'in',date:d,time:(8+ri(0,2))+':'+(ri(10,55)),party:s[0],ref:'SH'+(ri(100000,999999)),items:items,maker:'周敏',checker:pick(['周敏','老陈'])});
    }
    var cnt=wd===0?1:(day===21?3:ri(2,3));
    for(var k=0;k<cnt;k++){
      var c=pick(CUST),m=ri(2,6),used2={},items2=[];
      while(items2.length<m){var p2=pick(products);if(used2[p2.id])continue;used2[p2.id]=1;
        items2.push({pid:p2.id,qty:round5(ri(p2.lot[0],p2.lot[1])),price:p2.price})}
      var hh=8+k*3+ri(0,2);
      docs.push({no:no('CK',d),type:'out',date:d,time:hh+':'+(ri(10,55)),party:c[0],items:items2,note:pick(NOTES_OUT),maker:'周敏',
        signed:day<=19||(day===20&&k===0)});
    }
  }
  // 期初 = 目标结存 − 入 + 出；不够扣的补进早一点的入库单
  products.forEach(function(p){
    function net(){var inn=0,out=0;docs.forEach(function(d){d.items.forEach(function(it){if(it.pid!==p.id)return;if(d.type==='in')inn+=it.qty;else out+=it.qty})});return{inn:inn,out:out}}
    var t=net(),open=p.tgt-t.inn+t.out;
    var floor=Math.round(p.safe*0.8);
    if(open<floor){
      // 进得太多：从最晚的入库单开始少进一点
      var need=floor-open,ind=docs.filter(function(d){return d.type==='in'}).reverse();
      for(var i=0;i<ind.length&&need>0;i++){ind[i].items.forEach(function(it){if(it.pid!==p.id||need<=0)return;var cut=Math.min(need,it.qty);it.qty-=cut;need-=cut})
        ind[i].items=ind[i].items.filter(function(it){return it.qty>0})}
      docs=docs.filter(function(d){return d.items.length});
      t=net();open=p.tgt-t.inn+t.out;
    }
    p.open=open;p.stock=p.tgt;delete p.tgt;
  });
  docs.forEach(function(d){d.time=d.time.replace(/^(\d):/,'0$1:')});
  // 一张补货单示例（上周生成、已转入库）
  docs.push({no:'BH20261114-01',type:'bh',date:'2026-11-14',time:'17:20',party:'',items:[{pid:'P202',qty:20,price:265,sup:'S2',stock:12,safe:15},{pid:'P404',qty:20,price:158,sup:'S6',stock:18,safe:20}],maker:'周敏',done:true});
  docs.sort(function(a,b){return(b.date+b.time).localeCompare(a.date+a.time)});
  return{v:3,products:products,docs:docs,seq:seq};
}
window.JXC_SEED={CO:CO,CUST:CUST.map(function(c){return{id:c[0],name:c[1],contact:c[2],phone:c[3],addr:c[4]}}),
  SUP:SUP.map(function(s){return{id:s[0],name:s[1],contact:s[2],phone:s[3]}}),build:build};
})();
