const $=s=>document.querySelector(s);
let D;try{D=JSON.parse(localStorage.getItem('yq-data'))||YQ_DEFAULT}catch(e){D=YQ_DEFAULT}
const pg=document.body.dataset.page;
const num=v=>parseFloat(String(v).replace(/[$,%\s]/g,''))||0;
const sum=(a,f)=>a.reduce((s,x)=>s+(+f(x)||0),0);
const comp=a=>(a.reduce((c,v)=>c*(1+v/100),1)-1)*100;
const $m=n=>(n<0?'-':'')+'$'+Math.abs(Math.round(n)).toLocaleString('en-US');
const pct=v=>`<span class="${v<0?'neg':'pos'}">${v>=0?'+':''}${v.toFixed(2)}%</span>`;
const gn=v=>`<span class="${v<0?'neg':'pos'}">${v<0?'-':'+'}$${Math.abs(Math.round(v)).toLocaleString('en-US')}</span>`;
const dt=d=>new Date(d+'T00:00:00');
const fd=d=>d?dt(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'';
const wd=d=>dt(d).toLocaleDateString('en-US',{weekday:'short'});
const days=[...D.days].sort((a,b)=>a.d<b.d?-1:a.d>b.d?1:0),hold=D.holdings;
const L=days.length?days[days.length-1]:{d:'',p:0,g:0},T0=L.d?dt(L.d).getTime():0;
const per=f=>{const a=days.filter(f);return{p:comp(a.map(x=>x.p)),g:sum(a,x=>x.g)}};
const P={'Today':per(x=>x.d==L.d),'7 days':per(x=>dt(x.d).getTime()>=T0-6*864e5),'Month to date':per(x=>x.d.slice(0,7)==L.d.slice(0,7)),'Year to date':per(x=>x.d.slice(0,4)==L.d.slice(0,4)),'Since inception':per(()=>true)};
const months=[];days.forEach(x=>{const k=x.d.slice(0,7);let m=months[months.length-1];if(!m||m.k!=k){m={k,a:[],g:0};months.push(m)}m.a.push(x.p);m.g+=+x.g||0});months.forEach(m=>m.p=comp(m.a));
const mn=k=>new Date(k+'-01T00:00:00').toLocaleDateString('en-US',{month:'short',year:'numeric'});
const totInv=sum(hold,h=>h.inv),totVal=sum(hold,h=>h.val),tg=totVal-totInv,tgp=totInv?tg/totInv*100:0;
const kpi=(l,v,s)=>`<div class="kpi"><small>${l}</small><strong>${v}</strong>${s?`<em>${s}</em>`:''}</div>`;
const head=(t,s)=>`<div class="ph"><h1>${t}</h1><p class="lead">${s}</p></div>`;
function line(h){let c=100,v=[100];days.forEach(x=>{c*=1+x.p/100;v.push(c)});
 const W=640,L0=46,B=26,mx=Math.max(...v),lo0=Math.min(...v),pd=(mx-lo0||1)*.1,hi=mx+pd,lo=lo0-pd,X=i=>L0+i/(v.length-1||1)*(W-L0-8),Y=a=>8+(hi-a)/(hi-lo)*(h-B-8);
 const grid=[0,1,2,3].map(i=>{const a=lo+(hi-lo)*i/3,y=Y(a);return `<line x1="${L0}" x2="${W}" y1="${y}" y2="${y}" stroke="#e3e7ee"/><text x="${L0-8}" y="${y+4}" text-anchor="end">${a.toFixed(0)}</text>`}).join('');
 const pts=v.map((a,i)=>X(i).toFixed(1)+','+Y(a).toFixed(1)).join(' ');
 return `<svg viewBox="0 0 ${W} ${h}" class="ch">${grid}<polygon points="${L0},${h-B} ${pts} ${W-8},${h-B}" fill="#1f5fa8" opacity=".08"/><polyline class="draw" pathLength="1000" points="${pts}" fill="none" stroke="#1f5fa8" stroke-width="2" stroke-linejoin="round"/><text x="${L0}" y="${h-6}">${fd(days.length?days[0].d:'')}</text><text x="${W-8}" y="${h-6}" text-anchor="end">${fd(L.d)}</text></svg>`}
function bars(a,lab){const m=Math.max(...a.map(x=>Math.abs(x.p)),.1),W=640,H=200,z=96,w=(W-46)/(a.length||1);
 return `<svg viewBox="0 0 ${W} ${H}" class="ch"><line x1="40" x2="${W}" y1="${z}" y2="${z}" stroke="#c9d0db"/><text x="34" y="${z+4}" text-anchor="end">0%</text><text x="34" y="14" text-anchor="end">${m.toFixed(1)}%</text><text x="34" y="${H-30}" text-anchor="end">-${m.toFixed(1)}%</text>${a.map((x,i)=>{const hh=Math.abs(x.p)/m*80;return `<rect x="${44+i*w+w*.15}" y="${x.p>=0?z-hh:z}" width="${w*.7}" height="${Math.max(hh,1)}" rx="1.5" fill="${x.p>=0?'#0a7d4f':'#c0392b'}"><title>${x.t}: ${x.p.toFixed(2)}%</title></rect>`+(lab?`<text x="${44+i*w+w/2}" y="${H-6}" text-anchor="middle">${x.l}</text>`:'')}).join('')}${!lab&&a.length?`<text x="44" y="${H-6}">${a[0].t}</text><text x="${W}" y="${H-6}" text-anchor="end">${a[a.length-1].t}</text>`:''}</svg>`}
const dtable=n=>`<div class="tw"><table><tr><th>Date</th><th class="r">Daily gain</th><th class="r">Daily gain ($)</th></tr>${days.slice().reverse().slice(0,n||99999).map((x,i)=>`<tr class="${!n&&i>=30?'x':''}"><td>${wd(x.d)}, ${fd(x.d)}</td><td class="r">${pct(x.p)}</td><td class="r">${gn(x.g)}</td></tr>`).join('')}</table></div>`;
const pages=[['index','Home'],['daily','Daily gains'],['performance','Performance'],['portfolio','Portfolio'],['why-invest','Why invest']];
const file={home:'index',daily:'daily',performance:'performance',portfolio:'portfolio',why:'why-invest'}[pg];
const shell=c=>`<header><div class="wrap"><a class="logo" href="index.html"><span class="mark">Y</span>Yaktonian Equity</a><nav>${pages.map(p=>`<a href="${p[0]}.html" class="${p[0]==file?'on':''}">${p[1]}</a>`).join('')}</nav></div></header><main><div class="wrap">${c}</div></main><footer><div class="wrap">Figures last updated ${fd(D.updated)}. Past performance does not guarantee future results. Investing involves risk, including loss of principal. This site is informational and is not an offer or financial advice. <a href="admin.html" style="opacity:.6">Admin</a></div></footer>`;
const cols=['#12263f','#1f5fa8','#3f8fd2','#0b7a6e','#5bb3a6','#9aa9bd','#c3a24a','#d5dbe4'];
const R={};
R.home=()=>`<section class="hero"><div><h1>Transparent returns. Diversified holdings.</h1><p class="lead">Yaktonian Equity publishes every daily gain and every position, so you can see exactly where capital is invested and how it is performing.</p><div class="btns"><a class="btn pri" href="daily.html">See daily gains</a><a class="btn" href="portfolio.html">View portfolio</a></div></div>
<div class="card" style="margin:0"><small>Portfolio value</small><strong class="big">${$m(totVal)}</strong><div>${gn(L.g)} &nbsp;${pct(L.p)} <small>on ${fd(L.d)}</small></div><div style="margin-top:12px">${line(170)}</div></div></section>
<div class="kpis">${kpi('Total invested',$m(totInv))}${kpi('Total gain',gn(tg),pct(tgp)+' on invested')}${kpi('Month to date',pct(P['Month to date'].p),gn(P['Month to date'].g))}${kpi('Year to date',pct(P['Year to date'].p),gn(P['Year to date'].g))}${kpi('Investors',D.investors,'Since '+D.since)}</div>
<section class="card"><div class="head"><h3>Latest daily gains</h3><a href="daily.html">All daily gains</a></div>${dtable(5)}</section>`;
R.daily=()=>`${head('Daily gains','Every trading day, as logged.')}<div class="kpis">${kpi('Latest day',pct(L.p),fd(L.d))}${kpi('Latest gain',gn(L.g))}${kpi('Last 7 days',pct(P['7 days'].p),gn(P['7 days'].g))}${kpi('Month to date',pct(P['Month to date'].p),gn(P['Month to date'].g))}</div>
<div class="card"><h3>Last 30 days</h3>${bars(days.slice(-30).map(x=>({p:x.p,t:fd(x.d)})))}</div>
<div class="card"><div class="head"><h3>Daily log</h3><button class="btn sm" id="more">Show all</button></div><div id="dt">${dtable()}</div></div>`;
R.performance=()=>`${head('Performance','Returns by period, built from the daily log.')}<div class="kpis">${Object.keys(P).map(k=>kpi(k,pct(P[k].p),gn(P[k].g))).join('')}</div>
<div class="card"><h3>Growth of 100 since the first logged day</h3>${line(260)}</div>
<div class="card"><h3>Monthly returns</h3>${bars(months.slice(-12).map(m=>({p:m.p,t:mn(m.k),l:mn(m.k).split(' ')[0]})),1)}<div class="tw"><table><tr><th>Month</th><th class="r">Return</th><th class="r">Gain ($)</th></tr>${months.slice().reverse().map(m=>`<tr><td>${mn(m.k)}</td><td class="r">${pct(m.p)}</td><td class="r">${gn(m.g)}</td></tr>`).join('')}</table></div></div>`;
R.portfolio=()=>{let a=0;const g=hold.map((h,i)=>{const s=a;a+=totVal?h.val/totVal*100:0;return `${cols[i%8]} ${s}% ${a}%`}).join(',');
 const cls={};hold.forEach(h=>{const c=cls[h.c]=cls[h.c]||{inv:0,val:0};c.inv+=+h.inv||0;c.val+=+h.val||0});
 return `${head('Portfolio','How much we have invested, and where it sits today.')}<div class="kpis">${kpi('Total invested',$m(totInv))}${kpi('Current value',$m(totVal))}${kpi('Total gain',gn(tg))}${kpi('Return on invested',pct(tgp))}</div>
<div class="split"><div class="card"><h3>Allocation</h3><div class="donut" style="background:conic-gradient(${g})"></div></div>
<div class="card"><h3>Holdings</h3><div class="tw"><table><tr><th>Holding</th><th>Class</th><th class="r">Invested</th><th class="r">Value</th><th class="r">Gain / loss</th><th class="r">Return</th><th class="r">Weight</th></tr>${hold.map((h,i)=>`<tr><td><span class="dot" style="background:${cols[i%8]}"></span><b>${h.n}</b> <small>${h.t}</small></td><td>${h.c}</td><td class="r">${$m(h.inv)}</td><td class="r">${$m(h.val)}</td><td class="r">${gn(h.val-h.inv)}</td><td class="r">${pct(h.inv?(h.val/h.inv-1)*100:0)}</td><td class="r">${totVal?(h.val/totVal*100).toFixed(1):0}%</td></tr>`).join('')}<tr class="tot"><td>Total</td><td></td><td class="r">${$m(totInv)}</td><td class="r">${$m(totVal)}</td><td class="r">${gn(tg)}</td><td class="r">${pct(tgp)}</td><td class="r">100%</td></tr></table></div></div></div>
<div class="card"><h3>By asset class</h3><div class="tw"><table><tr><th>Class</th><th class="r">Invested</th><th class="r">Value</th><th class="r">Weight</th></tr>${Object.keys(cls).map(k=>`<tr><td>${k}</td><td class="r">${$m(cls[k].inv)}</td><td class="r">${$m(cls[k].val)}</td><td class="r">${totVal?(cls[k].val/totVal*100).toFixed(1):0}%</td></tr>`).join('')}</table></div></div>`};
R.why=()=>`${head('Why invest','Five principles behind how Yaktonian Equity is run.')}<div class="grid">${[['Diversified by design','Capital is spread across equities, funds, bonds, commodities and cash, so no single position decides the outcome.'],['Transparent numbers','Every daily gain and every holding is published on this site, with what was invested and what it is worth now.'],['Patience over prediction','We aim to compound steadily and avoid chasing short-term moves.'],['Risk is managed first','Position sizes are capped and a cash reserve is always held.'],['Aligned incentives','Our own capital sits in the same portfolio as yours.']].map(x=>`<div class="card"><h3>${x[0]}</h3><p>${x[1]}</p></div>`).join('')}</div><div class="btns sec"><a class="btn pri" href="performance.html">See the track record</a><a class="btn" href="portfolio.html">See the holdings</a></div>`;
R.admin=()=>`${head('Admin panel','Update returns, holdings and site details.')}<div id="adm"></div>`;
$('#app').innerHTML=shell(R[pg]());
if($('#more'))$('#more').onclick=e=>{const o=$('#dt').classList.toggle('all');e.target.textContent=o?'Show recent':'Show all'};
function admin(){const root=$('#adm');
 if(sessionStorage.getItem('yq-auth')!=='1'){root.innerHTML=`<div class="card" style="max-width:380px"><label>Password</label><input id="pw" type="password"><div class="btns" style="margin-top:16px"><button class="btn pri" id="go">Sign in</button></div><p class="note" id="msg"></p></div>`;
  const go=()=>{if($('#pw').value===D.adminPass){sessionStorage.setItem('yq-auth','1');location.reload()}else $('#msg').textContent='Wrong password.'};$('#go').onclick=go;$('#pw').onkeydown=e=>e.key=='Enter'&&go();return}
 let W=JSON.parse(JSON.stringify(D)),tab='days',all=false,msg='';
 const tdy=new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10);
 const tv=()=>sum(W.holdings,h=>h.val),sortD=()=>W.days.sort((a,b)=>a.d<b.d?-1:a.d>b.d?1:0);sortD();
 const save=()=>{W.updated=tdy;localStorage.setItem('yq-data',JSON.stringify(W));msg='Saved in this browser.'};
 const upsert=(d,p,g)=>{W.days=W.days.filter(x=>x.d!=d);W.days.push({d,p,g});sortD()};
 const inp=(s,i,f,v,t='text')=>`<input data-s="${s}" data-i="${i}" data-f="${f}" type="${t}" ${t=='number'?'step="any"':''} value="${String(v).replace(/"/g,'&quot;')}">`;
 const tabs=[['days','Daily returns'],['hold','Holdings'],['site','Site details'],['pub','Publish']];
 const draw=()=>{let c='';
  if(tab=='days'){const dd=W.days.map((x,i)=>({x,i})).reverse(),sh=all?dd:dd.slice(0,15);
   c=`<div class="card"><h3>Add a day's return</h3><div class="row4"><div><label>Date</label><input id="nd" type="date" value="${tdy}"></div><div><label>Return (%)</label><input id="np" type="number" step="any" placeholder="0.25"></div><div><label>Gain ($), optional</label><input id="ng" type="number" step="any" placeholder="auto"></div><div><button class="btn pri" data-a="addDay">Add day</button></div></div><p class="note">Leave Gain ($) blank to calculate it from the return and the current portfolio value. Adding a date that already exists replaces it. Months and totals on the site update automatically.</p></div>
<div class="card"><h3>Upload returns (CSV)</h3><p class="note">One day per line: date, return %, gain $ (optional). Example: 2026-10-08, 0.21</p><input id="file" type="file" accept=".csv,.txt"><label>Or paste rows</label><textarea id="csv" placeholder="2026-10-08,0.21,10200"></textarea><div class="btns" style="margin-top:12px"><button class="btn pri" data-a="csv">Import rows</button></div></div>
<div class="card"><div class="head"><h3>Logged days (${W.days.length})</h3><button class="btn sm" data-a="more">${all?'Show recent':'Show all'}</button></div><div class="tw"><table><tr><th>Date</th><th>Return %</th><th>Gain $</th><th></th></tr>${sh.map(({x,i})=>`<tr><td>${inp('days',i,'d',x.d,'date')}</td><td>${inp('days',i,'p',x.p,'number')}</td><td>${inp('days',i,'g',x.g,'number')}</td><td><button class="btn sm" data-a="delDay" data-i="${i}">Delete</button></td></tr>`).join('')}</table></div></div>`}
  if(tab=='hold')c=`<div class="card"><div class="head"><h3>Holdings</h3><button class="btn sm pri" data-a="addH">Add holding</button></div><div class="tw"><table><tr><th>Name</th><th>Ticker</th><th>Class</th><th>Invested ($)</th><th>Current value ($)</th><th></th></tr>${W.holdings.map((h,i)=>`<tr><td>${inp('hold',i,'n',h.n)}</td><td>${inp('hold',i,'t',h.t)}</td><td>${inp('hold',i,'c',h.c)}</td><td>${inp('hold',i,'inv',h.inv,'number')}</td><td>${inp('hold',i,'val',h.val,'number')}</td><td><button class="btn sm" data-a="delH" data-i="${i}">Remove</button></td></tr>`).join('')}</table></div><p class="note">Total invested ${$m(sum(W.holdings,h=>h.inv))}. Current value ${$m(tv())}. Weights, gains and the allocation chart update automatically.</p></div>`;
  if(tab=='site')c=`<div class="card"><h3>Site details</h3><div class="row3"><div><label>Number of investors</label>${inp('set',0,'investors',W.investors)}</div><div><label>Investing since</label>${inp('set',0,'since',W.since)}</div><div><label>Admin password</label>${inp('set',0,'adminPass',W.adminPass)}</div></div><p class="note">Total invested, portfolio value, gains and returns are calculated from your holdings and daily log.</p></div>`;
  if(tab=='pub')c=`<div class="card"><h3>Publish to the live site</h3><p class="note">Changes save automatically, but only in this browser. To update the live site for everyone: download data.js, replace <b>assets/data.js</b> in your repo, and push. GitHub Pages and Cloudflare Pages then redeploy.</p><div class="btns"><button class="btn pri" data-a="dl">Download data.js</button><button class="btn" data-a="reset">Discard local changes</button><button class="btn" data-a="out">Sign out</button></div></div>`;
  root.innerHTML=`<div class="tabs">${tabs.map(t=>`<button class="btn sm ${tab==t[0]?'pri':''}" data-a="tab" data-t="${t[0]}">${t[1]}</button>`).join('')}</div><p class="note" id="msg">${msg}</p>${c}`};
 root.onchange=e=>{const t=e.target;
  if(t.id=='file'&&t.files[0]){const r=new FileReader();r.onload=()=>{$('#csv').value=r.result};r.readAsText(t.files[0]);return}
  const{s,i,f}=t.dataset;if(!s)return;
  if(s=='set')W[f]=t.value;
  else if(s=='hold')W.holdings[i][f]=(f=='inv'||f=='val')?num(t.value):t.value;
  else{const x=W.days[i];if(f=='d'){x.d=t.value;sortD()}else if(f=='p'){x.p=num(t.value);x.g=Math.round(x.p/100*tv())}else x.g=num(t.value)}
  save();draw()};
 root.onclick=e=>{const a=e.target.dataset.a;if(!a)return;const i=+e.target.dataset.i;
  if(a=='tab'){tab=e.target.dataset.t;draw();return}
  if(a=='out'){sessionStorage.removeItem('yq-auth');location.reload();return}
  if(a=='reset'){localStorage.removeItem('yq-data');location.reload();return}
  if(a=='dl'){const l=document.createElement('a');l.href=URL.createObjectURL(new Blob(['window.YQ_DEFAULT = '+JSON.stringify(W,null,1)+';\n']));l.download='data.js';l.click();return}
  if(a=='addDay'){const d=$('#nd').value;if(!d||$('#np').value===''){msg='Enter a date and a return %.';draw();return}const p=num($('#np').value);upsert(d,p,$('#ng').value===''?Math.round(p/100*tv()):num($('#ng').value))}
  else if(a=='csv'){let n=0;$('#csv').value.split(/\r?\n/).forEach(l=>{const q=l.split(/[,;\t]/).map(s=>s.trim());let d=q[0],m=d.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);if(m)d=`${m[3]}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}`;if(!/^\d{4}-\d{2}-\d{2}$/.test(d)||isNaN(parseFloat(q[1])))return;const p=num(q[1]);upsert(d,p,q[2]?num(q[2]):Math.round(p/100*tv()));n++});save();msg=`Imported ${n} rows. Saved in this browser.`;draw();return}
  else if(a=='addH')W.holdings.push({n:'New holding',t:'',c:'Equity',inv:0,val:0});
  else if(a=='delH')W.holdings.splice(i,1);
  else if(a=='delDay')W.days.splice(i,1);
  else if(a=='more')all=!all;
  save();draw()};
 draw()}
if(pg==='admin')admin();
