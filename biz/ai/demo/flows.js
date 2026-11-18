/* 两条演示工作流：节点、连线、每一步的日志和输入输出。全是假数据，不连任何模型和接口。 */
(function () {
  var W = window.WF, m = W.money, p = W.pct;
  function tbl(head, rows, rcols) {
    rcols = rcols || [];
    return '<table class="dt"><thead><tr>' + head.map(function (h, i) { return '<th' + (rcols.indexOf(i) > -1 ? ' class="r"' : '') + '>' + h + '</th>'; }).join('') +
      '</tr></thead><tbody>' + rows.map(function (r) {
        return '<tr' + (r.cls ? ' class="' + r.cls + '"' : '') + '>' + r.c.map(function (c, i) { return '<td' + (rcols.indexOf(i) > -1 ? ' class="r"' : '') + '>' + c + '</td>'; }).join('') + '</tr>';
      }).join('') + '</tbody></table>';
  }
  function code(s) { return '<pre class="box code">' + s + '</pre>'; }

  var storeRows = W.stores.map(function (s) {
    var c = s.today / s.lastwk - 1;
    return { cls: c < -.2 ? 'fix' : '', c: [s.name, m(s.today), s.orders, '<span class="' + (c < -.2 ? 'bad' : '') + '">' + p(c) + '</span>'] };
  });

  var report = {
    key: 'report', name: '门店销售日报',
    meta: '每天 08:30 自动跑 · 上次 <b>今天 08:31 成功</b>',
    start: [8, 30, 0],
    world: [1100, 560],
    nodes: [
      { id: 'n1', t: 'trigger', k: '定时触发', title: '每天 08:30', sub: '工作日和周末都跑，节假日照常', x: 30, y: 40, d: 500, real: '0.0s',
        logs: ['<b>定时触发</b>　11月18日 08:30:00，开始整理 11月17日 的数据'],
        cfg: '<dl class="kv"><dt>时间</dt><dd>每天 08:30</dd><dt>处理哪天</dt><dd>前一天（11月17日 周二）</dd><dt>失败了</dt><dd>5 分钟后重试 1 次，还不行在群里 @ 运营</dd></dl>',
        io: '<h4>输出</h4><dl class="kv"><dt>日期</dt><dd>2026-11-17（周二）</dd><dt>对比</dt><dd>前天 11-16、上周二 11-10</dd></dl>' },
      { id: 'n2', t: 'tool', k: '读文件', title: '收齐各店的表', sub: '共享文件夹「门店日报 / 1117」', x: 300, y: 40, d: 1200, real: '1.4s',
        logs: ['<b>收齐各店的表</b>　找到 7 份文件（6 家门店 + 团购）', '　江南大道店交的是 csv，良渚店有 2 个工作表', '<span class="ok">✓</span> 共读到 2,316 行'],
        cfg: '<dl class="kv"><dt>位置</dt><dd>共享文件夹 / 门店日报 / 按日期分</dd><dt>认哪些</dt><dd>xlsx、xls、csv，文件名里带店名就行</dd><dt>没交的</dt><dd>9:00 前在群里 @ 店长催一次</dd></dl>',
        io: function () { return '<h4>输出 · 7 份文件</h4>' + tbl(['文件', '行数', '情况'], W.files.map(function (f) { return { c: [f.name, f.rows, '<span style="color:var(--muted)">' + f.note + '</span>'] }; }), [1]); } },
      { id: 'n3', t: 'llm', k: '大模型', title: '认出每份表的列', sub: '各店列名、格式不一样，先对到统一的「品名 / 数量 / 金额」', x: 570, y: 40, d: 2000, real: '6.2s',
        logs: ['<b>认出每份表的列</b>　把 7 份表头交给大模型对字段', '　古墩路店「销售额」→ 金额，学源街店表头在第 2 行', '　团购表没有金额列 → 用「份数 × 单价」算', '<span class="ok">✓</span> 7 份全部对上，0 份要人看'],
        cfg: '<h4>提示词</h4><div class="box">下面是几家门店交上来的销售表，每份给你前 5 行。\n请把每一列对到这几个统一字段：日期、门店、品名、数量、单位、金额。\n· 列名不一样但意思一样的算同一个（销量 = 数量，实收 = 金额）\n· 表头不在第 1 行的，告诉我在第几行\n· 有「合计」「小计」行的标出来\n· 对不上的列写「不要」，拿不准的写「要人看」\n只回 JSON，不要解释。</div>',
        io: function () {
          return '<h4>输出 · 列对照</h4>' + tbl(['文件', '原来的列', '对到'], [
            { c: ['古墩路店', '商品名称 / 销量 / 销售额', '品名 / 数量 / 金额'] },
            { c: ['江南大道店', '商品 / 数量 / 实收(¥)', '品名 / 数量 / 金额'] },
            { c: ['学源街店', '表头在第 2 行；「备注」', '不要'] },
            { c: ['市心路店', '规格（个、盒）', '单位'] },
            { c: ['良渚店', '上午、下午两个工作表', '合并'] },
            { c: ['团购登记', '份数 × 单价', '金额（算出来）'] }
          ]) + '<p class="dk" style="margin-top:8px">要人看：0 份</p>';
        } },
      { id: 'n4', t: 'code', k: '代码', title: '清洗合并', sub: '去合计行、去重复、单位统一成「个」', x: 840, y: 40, d: 1200, real: '0.8s',
        logs: ['<b>清洗合并</b>　去掉合计行、空行 9 行', '　良渚店上午下午重叠的 14 行去重', '　市心路店 37 行「盒」换算成「个」', '<span class="ok">✓</span> 剩 2,293 行，合成一张表'],
        cfg: code('<i># 统一字段后合并</i>\nrows = []\n<em>for</em> f <em>in</em> files:\n    df = read(f, header=f.header_row)\n    df = df.rename(columns=f.mapping)\n    df = df[~df.品名.str.contains(<i>"合计|小计"</i>)]\n    df[<i>"门店"</i>] = f.store\n    rows.append(df)\ndata = concat(rows).drop_duplicates(\n    [<i>"门店"</i>, <i>"时间"</i>, <i>"品名"</i>, <i>"金额"</i>])\ndata.loc[data.单位 == <i>"盒"</i>, <i>"数量"</i>] *= 6'),
        io: function () { return '<h4>输出</h4>' + tbl(['步骤', '行数'], [{ c: ['读进来', '2,316'] }, { c: ['去合计 / 空行', '−9'] }, { c: ['去重复', '−14'] }, { c: ['合并后', '<b>2,293</b>'] }], [1]) +
          '<h4>前 4 行</h4>' + tbl(['时间', '门店', '品名', '数量', '金额'], [
            { c: ['07:02', '文三路店', '美式咖啡', 2, '18.0'] }, { c: ['07:03', '文三路店', '肉松小贝', 3, '25.5'] },
            { c: ['07:05', '良渚店', '原味吐司', 1, '12.0'] }, { c: ['07:05', '古墩路店', '葡式蛋挞', 4, '20.0'] }], [3, 4]); } },
      { id: 'n5', t: 'code', k: '代码', title: '算汇总和对比', sub: '营业额、单数、客单价，比前天、比上周同一天', x: 840, y: 215, d: 1000, real: '0.5s',
        logs: ['<b>算汇总和对比</b>　营业额 ' + m(W.total.today) + '，比上周二 <span class="ok">' + p(W.total.vsLast) + '</span>', '　单数 ' + W.total.orders.toLocaleString('en-US') + '，客单价 ¥' + W.total.avg.toFixed(1)],
        cfg: '<dl class="kv"><dt>按什么分</dt><dd>门店、商品、小时</dd><dt>比谁</dt><dd>前一天、上周同一天</dd><dt>团购</dt><dd>单独一行，不算进门店客单价</dd></dl>',
        io: function () { return '<h4>输出 · 各门店</h4>' + tbl(['门店', '营业额', '单数', '比上周二'], storeRows, [1, 2, 3]) +
          '<p class="dk" style="margin-top:8px">合计 ' + m(W.total.today) + '（含团购 ' + m(W.group.today) + '）</p>'; } },
      { id: 'n6', t: 'cond', k: '条件', title: '有没有异常', sub: '掉量超 20%、卖空、退款比平时多一倍', x: 570, y: 215, d: 500, real: '0.0s',
        logs: ['<b>有没有异常</b>　命中 3 条 → 走「有」'],
        cfg: '<h4>规则（满足任一条）</h4><div class="box">门店营业额 比上周同一天 少 20% 以上\n某个商品在门店 18 点前卖空\n门店退款笔数 ≥ 最近 4 周平均的 2 倍\n某个小时 0 笔流水（营业时间内）</div>',
        io: '<h4>结果</h4><p><span class="chip chip--warn">有异常 · 3 条</span>走上面这条线；没有异常时直接去写结论。</p>' },
      { id: 'n7', t: 'code', k: '代码', title: '查异常明细', sub: '找出是哪家店、几点开始、哪个商品', x: 300, y: 215, d: 1000, real: '0.6s', tag: '有异常时',
        logs: ['<b>查异常明细</b>　<span class="warn">江南大道店 15:12 以后 0 笔流水</span>', '　<span class="warn">肉松小贝 古墩路店 13:40、良渚店 14:15 卖空</span>', '　<span class="warn">文三路店退款 6 笔，5 笔是蛋挞</span>'],
        cfg: '<dl class="kv"><dt>掉量</dt><dd>按小时对比，找从几点开始掉</dd><dt>卖空</dt><dd>看最后一笔的时间</dd><dt>退款</dt><dd>按商品、时间段分</dd></dl>',
        io: function () { return '<h4>输出 · 3 条</h4>' + W.anomalies.map(function (a) { return '<p style="margin-bottom:8px"><b>' + a.title + '</b><br><span style="color:var(--muted)">' + a.body + '</span></p>'; }).join(''); } },
      { id: 'n8', t: 'llm', k: '大模型', title: '写今天要注意的', sub: '把数字和异常读一遍，写 3～5 句给老板和店长看', x: 30, y: 215, d: 2200, real: '7.9s',
        logs: ['<b>写今天要注意的</b>　交给大模型：汇总 + 3 条异常 + 上周同期', '<span class="ok">✓</span> 写好 5 句，最长一句 41 字'],
        cfg: '<h4>提示词</h4><div class="box">你是这家烘焙连锁的运营。下面是昨天的销售汇总、和上周同一天的对比、系统找出来的异常。\n写 3～5 句话给老板和店长看：\n· 先说整体，再说要处理的事，每句带数字\n· 异常要说「可能是什么原因」和「今天建议做什么」\n· 不要客套，不要用「赋能」「抓手」这类词\n· 数字只用下面给的，不要自己算新的</div>',
        io: function () { return '<h4>输出</h4><div class="box">' + W.conclusion.map(function (s, i) { return (i + 1) + '. ' + s; }).join('\n') + '</div>'; } },
      { id: 'n9', t: 'tpl', k: '生成', title: '出日报', sub: '网页版 + 一张长图 + Excel 明细', x: 30, y: 400, d: 1300, real: '2.1s',
        logs: ['<b>出日报</b>　套用日报模板：4 个数 + 结论 + 异常 + 3 张图 + 明细表', '<span class="ok">✓</span> 网页版、长图、Excel 已生成'],
        cfg: '<dl class="kv"><dt>模板</dt><dd>门店日报 v3（手机上看）</dd><dt>图</dt><dd>门店对比、分时段、商品前 8</dd><dt>附件</dt><dd>明细.xlsx（2,293 行）</dd></dl>',
        io: '<h4>输出</h4><a class="thumb" href="report.html"><span>打开生成的日报 →</span></a>' },
      { id: 'n10', t: 'push', k: '发消息', title: '推到店长群', sub: '一段摘要 + 日报链接，异常 @ 对应店长', x: 300, y: 345, d: 900, real: '0.4s', tag: '同时',
        logs: ['<b>推到店长群</b>　已发「麦田日记 · 店长群」，@ 江南大道店店长'],
        cfg: '<dl class="kv"><dt>群</dt><dd>麦田日记 · 店长群（企业群机器人）</dd><dt>@ 谁</dt><dd>有异常的门店店长</dd></dl>',
        io: function () { return '<h4>发出去的消息</h4><div class="msg"><div class="msg__h"><i>日报</i>日报机器人 · 08:31</div><div class="msg__b"><b>11月17日 销售日报</b>营业额 ' + m(W.total.today) + '，比上周二 ' + p(W.total.vsLast) + '<br>⚠ 江南大道店少 31%，15:12 后没流水 @江南大道-店长<br>⚠ 肉松小贝 古墩路、良渚 下午前卖空<br><a href="report.html">看完整日报 →</a></div></div>'; } },
      { id: 'n11', t: 'push', k: '发邮件', title: '发邮件给老板和财务', sub: '日报长图放正文，明细 Excel 当附件', x: 300, y: 462, d: 900, real: '0.9s', tag: '同时',
        logs: ['<b>发邮件</b>　已发给 老板、运营、财务 3 人，附件 明细.xlsx'],
        cfg: '<dl class="kv"><dt>收件人</dt><dd>老板、运营主管、财务</dd><dt>标题</dt><dd>【日报】11月17日 营业额 ' + m(W.total.today) + '</dd></dl>',
        io: '<h4>结果</h4><p><span class="chip chip--ok">已发送 3 人</span><span class="chip">明细.xlsx 186 KB</span></p>' }
    ],
    edges: [['n1', 'n2'], ['n2', 'n3'], ['n3', 'n4'], ['n4', 'n5'], ['n5', 'n6'], ['n6', 'n7', '有'], ['n6', 'n8', '没有', { over: true, skip: true }], ['n7', 'n8'], ['n8', 'n9'], ['n9', 'n10'], ['n9', 'n11']],
    order: [['n1'], ['n2'], ['n3'], ['n4'], ['n5'], ['n6'], ['n7'], ['n8'], ['n9'], ['n10', 'n11']],
    memo: { x: 590, y: 400, w: 300, html: '<b>备注</b>哪家店 9:00 还没交表，先在群里 @ 店长催一次；9:30 还没交，就先出不含这家店的日报，并在开头写明。' },
    done: function () { return '<span>日报已生成，推到群里、发了邮件</span><a href="report.html">看日报</a>'; }
  };

  var receipt = '<svg class="receipt" viewBox="0 0 300 220" role="img" aria-label="送货单照片"><rect width="300" height="220" fill="#fbfaf6"/>' +
    '<text x="150" y="26" text-anchor="middle" font-size="14" font-weight="600" fill="#333">鲜诚乳业 送货单</text>' +
    '<text x="16" y="48" font-size="10" fill="#555">单号 SH20261117-0386　　日期 2026.11.17</text><text x="16" y="62" font-size="10" fill="#555">收货：麦田日记 中央厨房</text>' +
    '<line x1="12" y1="72" x2="288" y2="72" stroke="#999"/>' +
    '<text x="16" y="88" font-size="10" fill="#777">品名</text><text x="160" y="88" font-size="10" fill="#777">数量</text><text x="205" y="88" font-size="10" fill="#777">单价</text><text x="250" y="88" font-size="10" fill="#777">金额</text>' +
    '<g font-size="11" fill="#2a2a7a" font-family="cursive,serif"><text x="16" y="110">淡奶油 1L</text><text x="164" y="110">24</text><text x="205" y="110">38</text><text x="248" y="110">912</text>' +
    '<text x="16" y="132">无盐黄油 500g</text><text x="164" y="132">48</text><text x="205" y="132">46</text><text x="244" y="132">2208</text>' +
    '<text x="16" y="154">马斯卡彭 500g</text><text x="164" y="154">12</text><text x="205" y="154">52</text><text x="248" y="154">624</text></g>' +
    '<path d="M158 124c4-3 9-4 12 0" stroke="#2a2a7a" fill="none" stroke-width="1.2"/>' +
    '<line x1="12" y1="166" x2="288" y2="166" stroke="#999"/><text x="16" y="184" font-size="11" fill="#333">合计：叁仟柒佰肆拾肆元整　¥3744</text>' +
    '<text x="16" y="206" font-size="10" fill="#777">收货人签字：</text><path d="M80 204c10-12 18 6 28-4s14 4 24-2" stroke="#2a2a7a" fill="none" stroke-width="1.3"/>' +
    '<circle cx="250" cy="196" r="18" fill="none" stroke="#d9534f" stroke-width="1.5" opacity=".7"/><text x="250" y="200" text-anchor="middle" font-size="8" fill="#d9534f" opacity=".8">鲜诚乳业</text></svg>';

  var invoice = {
    key: 'invoice', name: '送货单录入',
    meta: '仓库拍照上传就跑 · 本月 <b>已录 186 张</b>',
    start: [10, 12, 30],
    world: [1100, 360],
    nodes: [
      { id: 'b1', t: 'trigger', k: '上传触发', title: '仓库拍照上传', sub: '手机拍送货单，一次可以传好几张', x: 30, y: 60, d: 500, real: '0.0s',
        logs: ['<b>仓库拍照上传</b>　收到 1 张照片（中央厨房 · 小李）'],
        cfg: '<dl class="kv"><dt>谁传</dt><dd>仓库和中央厨房的收货人</dd><dt>怎么传</dt><dd>手机打开表单拍照，或发给群里的机器人</dd></dl>',
        io: '<h4>输入</h4>' + receipt },
      { id: 'b2', t: 'llm', k: '大模型 · 看图', title: '认出单据上的字', sub: '供应商、单号、每一行品名数量单价金额', x: 300, y: 60, d: 2000, real: '5.6s',
        logs: ['<b>认出单据上的字</b>　鲜诚乳业，单号 SH20261117-0386', '　认出 3 行商品，合计 ¥3,744'],
        cfg: '<h4>提示词</h4><div class="box">这是一张送货单的照片。认出：供应商、单号、日期、每一行的品名 / 规格 / 数量 / 单价 / 金额、合计。\n手写的字拿不准的，在那个格子后面标「?」。\n只回 JSON。</div>',
        io: function () { return '<h4>输出</h4>' + tbl(['品名', '数量', '单价', '金额'], [{ c: ['淡奶油 1L', 24, 38, 912] }, { cls: 'fix', c: ['无盐黄油 500g', '<span class="bad">18 ?</span>', 46, 2208] }, { c: ['马斯卡彭 500g', 12, 52, 624] }], [1, 2, 3]) + '<p class="dk" style="margin-top:8px">黄油的数量是手写涂改过的，标了「?」</p>'; } },
      { id: 'b3', t: 'code', k: '代码', title: '核一遍数', sub: '数量 × 单价 对不对得上金额，供应商在不在名录里', x: 570, y: 60, d: 800, real: '0.1s',
        logs: ['<b>核一遍数</b>　<span class="warn">无盐黄油：18 × 46 = 828，单上写 2,208，对不上</span>', '　按金额倒推，数量应该是 48 → 交给人确认'],
        cfg: code('<em>for</em> r <em>in</em> rows:\n    <em>if</em> abs(r.数量 * r.单价 - r.金额) > 1:\n        r.要人看 = True\n        r.建议 = r.金额 / r.单价\n<em>if</em> sum(金额) != 合计: 要人看 = True'),
        io: '<h4>结果</h4><p><span class="chip chip--warn">1 行要人看</span><span class="chip chip--ok">供应商在名录</span><span class="chip chip--ok">合计对得上</span></p>' },
      { id: 'b4', t: 'human', k: '人工确认', title: '采购看一眼', sub: '只有对不上的才停下来等人，其余直接过', x: 840, y: 60, d: 900, real: '等人', wait: true,
        logs: ['<b>采购看一眼</b>　<span class="warn">等采购确认 1 行</span>（已在群里提醒）'],
        cfg: '<dl class="kv"><dt>谁确认</dt><dd>采购主管</dd><dt>什么时候停</dt><dd>有「要人看」的行</dd><dt>超时</dt><dd>2 小时没人点，再提醒一次</dd></dl>',
        io: '<h4>结果</h4><p><span class="chip chip--ok">已确认</span>黄油数量改成 48</p>' },
      { id: 'b5', t: 'tool', k: '写表格', title: '写进采购台账', sub: '按供应商、日期记一行，原图链接一起存', x: 840, y: 235, d: 900, real: '0.6s',
        logs: ['<b>写进采购台账</b>　新增 3 行，台账第 2,148～2,150 行'],
        cfg: '<dl class="kv"><dt>写到</dt><dd>在线表格「采购台账 2026」</dd><dt>一起存</dt><dd>原图、谁确认的、改了什么</dd></dl>',
        io: function () { return '<h4>写入的 3 行</h4>' + tbl(['日期', '供应商', '品名', '数量', '金额'], [{ c: ['11-17', '鲜诚乳业', '淡奶油 1L', 24, 912] }, { c: ['11-17', '鲜诚乳业', '无盐黄油', 48, '2,208'] }, { c: ['11-17', '鲜诚乳业', '马斯卡彭', 12, 624] }], [3, 4]); } },
      { id: 'b6', t: 'code', k: '代码', title: '跟采购单对账', sub: '订了多少、到了多少、钱对不对', x: 570, y: 235, d: 1000, real: '0.3s',
        logs: ['<b>跟采购单对账</b>　对采购单 PO-1109', '　<span class="warn">无盐黄油 订 50 到 48，少 2 件</span>，其余对上'],
        cfg: '<dl class="kv"><dt>找哪张采购单</dt><dd>同供应商、最近 7 天、还没收齐的</dd><dt>差多少算差异</dt><dd>数量差 1 件以上、金额差 1 元以上</dd></dl>',
        io: function () { return '<h4>对账结果</h4>' + tbl(['品名', '订', '到', '差'], [{ c: ['淡奶油 1L', 24, 24, '<span style="color:var(--ok)">对上</span>'] }, { cls: 'fix', c: ['无盐黄油', 50, 48, '<span class="bad">少 2</span>'] }, { c: ['马斯卡彭', 12, 12, '<span style="color:var(--ok)">对上</span>'] }], [1, 2]); } },
      { id: 'b7', t: 'push', k: '发消息', title: '差异提醒采购', sub: '少到、多到、价格变了，发给采购跟进', x: 300, y: 235, d: 800, real: '0.3s',
        logs: ['<b>差异提醒采购</b>　已发给采购主管：鲜诚乳业黄油少到 2 件'],
        cfg: '<dl class="kv"><dt>发给</dt><dd>采购主管</dd><dt>没差异</dt><dd>不发，只记台账</dd></dl>',
        io: '<h4>发出去的消息</h4><div class="msg"><div class="msg__h"><i>采购</i>单据机器人 · 10:14</div><div class="msg__b"><b>送货差异 · 鲜诚乳业</b>SH20261117-0386 对 PO-1109：无盐黄油 订 50 到 48，少 2 件（¥92）。其余 2 项对上。</div></div>' }
    ],
    edges: [['b1', 'b2'], ['b2', 'b3'], ['b3', 'b4'], ['b4', 'b5'], ['b5', 'b6'], ['b6', 'b7']],
    order: [['b1'], ['b2'], ['b3'], ['b4'], ['b5'], ['b6'], ['b7']],
    memo: { x: 30, y: 235, w: 240, html: '<b>备注</b>数都对得上的单子不会停，拍完照十几秒就进台账；只有认不清、算不对的才等人点一下。' },
    form: '<p class="hint" style="margin-bottom:12px">认出来的数对不上，等你确认。改好点「确认」，后面接着跑。</p>' + receipt +
      '<div class="form"><label class="fh"><span>品名</span><span>数量</span><span>单价</span><span class="sum">金额</span></label>' +
      '<label><span>淡奶油 1L</span><input value="24" inputmode="numeric" aria-label="淡奶油数量"><span>38</span><span class="sum">912</span></label>' +
      '<label class="flag"><span>无盐黄油 500g</span><input id="fixq" value="18" inputmode="numeric" aria-label="无盐黄油数量"><span>46</span><span class="sum">2,208</span><small>认成 18，但 18 × 46 ≠ 2,208；按金额应该是 48</small></label>' +
      '<label><span>马斯卡彭 500g</span><input value="12" inputmode="numeric" aria-label="马斯卡彭数量"><span>52</span><span class="sum">624</span></label></div>' +
      '<button class="btn2" type="button" id="confirm">确认，接着跑</button>',
    done: function () { return '<span>3 行已进台账，差异已提醒采购</span><a href="#" data-flow-go="report">看销售日报那条</a>'; }
  };

  window.FLOWS = { report: report, invoice: invoice };
})();
