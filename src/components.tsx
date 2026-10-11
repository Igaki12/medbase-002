import {useEffect,useRef,useState,type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import DOMPurify from 'dompurify';
import {motion,useReducedMotion} from 'framer-motion';
import {X,ArrowUpRight,ChevronDown,Check,Settings2,RotateCcw} from 'lucide-react';
import {ResponsiveContainer,ScatterChart,Scatter,XAxis,YAxis,CartesianGrid,Tooltip,ReferenceLine,Line,ComposedChart} from 'recharts';
import {dataAdapter,normalizeText,type Scope,type Question,type QuizConfig,filterDefs,sortDefs,selectQuestions,localDate,type UserPoint,type DailyPoint} from './domain';
import {useStudy} from './state';
export function RichText({text,className=''}:{text:string;className?:string}){return <div className={`rich-text ${className}`} dangerouslySetInnerHTML={{__html:DOMPurify.sanitize(normalizeText(text??''),{ALLOWED_TAGS:['b','u','br'],ALLOWED_ATTR:[]})}}/>}
export function Modal({title,children,onClose,wide=false,className=''}:{title:string;children:ReactNode;onClose:()=>void;wide?:boolean;className?:string}){const ref=useRef<HTMLDivElement>(null);const closeRef=useRef(onClose);closeRef.current=onClose;useEffect(()=>{const active=document.activeElement as HTMLElement;const previous=document.body.style.overflow;document.body.style.overflow='hidden';ref.current?.focus();const handle=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.stopPropagation();closeRef.current()}if(e.key==='Tab'){const elements=ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href],[tabindex="0"]');if(!elements?.length)return;const first=elements[0],last=elements[elements.length-1];if(e.shiftKey&&(document.activeElement===first||document.activeElement===ref.current)){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}};document.addEventListener('keydown',handle,true);return()=>{document.body.style.overflow=previous;document.removeEventListener('keydown',handle,true);active?.focus()}},[]);return createPortal(<div className={`modal-backdrop ${className}`} onClick={e=>{if(e.target===e.currentTarget)onClose()}}><div className={`modal ${wide?'wide':''}`} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref}><header className="modal-header"><h2>{title}</h2><button className="icon-btn" aria-label="閉じる" onClick={onClose}><X size={22}/></button></header>{children}</div></div>,document.body)}
export function Empty({children}:{children:ReactNode}){return <div className="empty">{children}</div>}
export function Geometric({large=false}:{large?:boolean}) {
  const enabled=useStudy(s=>s.settings.animation);
  const reduced=useReducedMotion();
  const [skipped,setSkipped]=useState(false);
  // Keep each particle's path stable for this celebration, with a fresh mix next time.
  const [particles]=useState(()=>Array.from({length:large?32:22},(_,i)=>{
    const count=large?32:22;
    const angle=(i+(Math.random()-.5)*1.7)/count*Math.PI*2;
    const distance=(large?105:48)+Math.random()*(large?85:67);
    const sideways=(Math.random()-.5)*(large?60:34);
    const startRadius=Math.random()*10;
    const size=5+Math.random()*6;
    const spin=(Math.random()<.5?-1:1)*(160+Math.random()*580);
    return {
      shape:i%4,size,angle,
      startX:Math.cos(angle)*startRadius,startY:Math.sin(angle)*startRadius,
      dx:Math.cos(angle)*distance,dy:Math.sin(angle)*distance*.8,
      driftX:-Math.sin(angle)*sideways,driftY:Math.cos(angle)*sideways,
      fall:16+Math.random()*(large?62:38),
      duration:(large?1.1:.85)+Math.random()*1.15,
      delay:(i%3)*.09+Math.random()*.17,
      rotation:Math.random()*100-50,spin,
      peak:.75+Math.random()*.5,opacity:.7+Math.random()*.3,
    };
  }));
  useEffect(()=>{
    const skip=()=>setSkipped(true);
    document.addEventListener('pointerdown',skip,{once:true});
    return()=>document.removeEventListener('pointerdown',skip);
  },[]);
  if(!enabled||reduced||skipped)return null;
  return <div className={`burst ${large?'large':''}`} aria-hidden="true">
    {particles.map((p,i)=><motion.i key={i} className={`particle shape-${p.shape}`}
      style={{width:p.shape===3?p.size*.28:p.size,height:p.shape===3?p.size*1.7:p.size,left:-p.size/2,top:-p.size/2}}
      initial={{opacity:0,x:p.startX,y:p.startY,rotate:p.rotation,scale:0}}
      animate={{
        opacity:[0,p.opacity,p.opacity,0],
        x:[p.startX,p.dx*.46,p.dx*.88,p.dx+p.driftX],
        y:[p.startY,p.dy*.46,p.dy*.88+p.fall*.25,p.dy+p.fall+p.driftY*.35],
        rotate:[p.rotation,p.rotation+p.spin*.3,p.rotation+p.spin*.75,p.rotation+p.spin],
        scale:[0,p.peak,p.peak*.8,.25],
      }}
      transition={{duration:p.duration,delay:p.delay,times:[0,.12,.6,1],ease:[.16,.7,.35,1]}}
    />)}
  </div>;
}
export function HeroArt(){
  return <div className="hero-art" aria-hidden="true">
    <svg viewBox="0 0 380 290" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="goldMetallic" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#faecd0"/>
          <stop offset="35%" stopColor="#dcb76e"/>
          <stop offset="70%" stopColor="#a37c35"/>
          <stop offset="100%" stopColor="#dfc382"/>
        </linearGradient>
        <linearGradient id="indigoPlate" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e385b"/>
          <stop offset="100%" stopColor="#102036"/>
        </linearGradient>
        <linearGradient id="sageAccent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#76b19d"/>
          <stop offset="100%" stopColor="#3d6c5e"/>
        </linearGradient>
        <radialGradient id="auraGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e5cca0" stopOpacity="0.22"/>
          <stop offset="60%" stopColor="#254366" stopOpacity="0.08"/>
          <stop offset="100%" stopColor="#142b48" stopOpacity="0"/>
        </radialGradient>
        <filter id="foilShine" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#050e1a" floodOpacity="0.45"/>
        </filter>
      </defs>

      {/* Ambient Back Glow */}
      <circle cx="190" cy="142" r="130" fill="url(#auraGlow)"/>

      {/* Concentric Celestial & Academic Orbits */}
      <circle cx="190" cy="142" r="118" stroke="#c8b37b" strokeWidth="1" strokeOpacity="0.28" strokeDasharray="3 7"/>
      <circle cx="190" cy="142" r="96" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.12"/>
      <circle cx="190" cy="142" r="74" stroke="url(#goldMetallic)" strokeWidth="1" strokeOpacity="0.35"/>

      {/* Diagonal Knowledge Alignment Axis */}
      <path d="M65 230L315 54" stroke="url(#goldMetallic)" strokeWidth="1" strokeOpacity="0.22"/>
      <path d="M85 55L295 229" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.09"/>

      {/* Laurel Wreath Sprigs (left & right) */}
      <g stroke="url(#goldMetallic)" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" fill="none">
        <path d="M125 155 C120 120, 132 88, 155 70"/>
        <path d="M124 142 Q115 138 120 132 Q125 137 124 142" fill="url(#goldMetallic)" fillOpacity="0.6"/>
        <path d="M127 122 Q119 116 126 112 Q130 118 127 122" fill="url(#goldMetallic)" fillOpacity="0.6"/>
        <path d="M135 102 Q129 95 137 92 Q140 98 135 102" fill="url(#goldMetallic)" fillOpacity="0.6"/>
        <path d="M148 83 Q143 76 151 75 Q153 82 148 83" fill="url(#goldMetallic)" fillOpacity="0.6"/>

        <path d="M255 155 C260 120, 248 88, 225 70"/>
        <path d="M256 142 Q265 138 260 132 Q255 137 256 142" fill="url(#goldMetallic)" fillOpacity="0.6"/>
        <path d="M253 122 Q261 116 254 112 Q250 118 253 122" fill="url(#goldMetallic)" fillOpacity="0.6"/>
        <path d="M245 102 Q251 95 243 92 Q240 98 245 102" fill="url(#goldMetallic)" fillOpacity="0.6"/>
        <path d="M232 83 Q237 76 229 75 Q227 82 232 83" fill="url(#goldMetallic)" fillOpacity="0.6"/>
      </g>

      {/* Central Academic Medallion (Base Plate) */}
      <g filter="url(#foilShine)">
        <circle cx="190" cy="138" r="50" fill="url(#indigoPlate)" stroke="url(#goldMetallic)" strokeWidth="2"/>
        <circle cx="190" cy="138" r="45" fill="none" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.14"/>
        <circle cx="190" cy="138" r="42" fill="none" stroke="#c8b37b" strokeWidth="0.8" strokeOpacity="0.3" strokeDasharray="2 4"/>

        {/* Academic Medical Greek Cross */}
        <path d="M183 114 h14 v14 h14 v14 h-14 v14 h-14 v-14 h-14 v-14 h14 z" fill="#1b3454" stroke="url(#goldMetallic)" strokeWidth="1.2" strokeOpacity="0.7"/>
        <path d="M184 115 h12 v15 h15 v12 h-15 v15 h-12 v-15 h-15 v-12 h15 z" fill="none" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.12"/>

        {/* Rod of Asclepius (Center Staff and Serpent) */}
        <line x1="190" y1="102" x2="190" y2="168" stroke="url(#goldMetallic)" strokeWidth="2.8" strokeLinecap="round"/>
        <circle cx="190" cy="100" r="4" fill="url(#goldMetallic)"/>
        <circle cx="190" cy="100" r="1.5" fill="#fff" opacity="0.75"/>
        <path d="M187 167 h6 l-3 4 z" fill="url(#goldMetallic)"/>

        {/* Coiled Serpent */}
        <path d="M184 163 C196 159, 198 150, 190 144 C180 138, 184 128, 195 122 C200 118, 197 111, 191 108" fill="none" stroke="url(#goldMetallic)" strokeWidth="2.3" strokeLinecap="round"/>
        <circle cx="191" cy="108" r="2.2" fill="url(#goldMetallic)"/>
        <circle cx="191.5" cy="107.5" r="0.6" fill="#14263f"/>
      </g>

      {/* Open Medical Codex / Tome */}
      <g filter="url(#foilShine)" transform="translate(0, 4)">
        <path d="M190 192 C176 186, 154 188, 140 193 C140 209, 168 206, 190 212 C212 206, 240 209, 240 193 C226 188, 204 186, 190 192 Z" fill="#192e4a" stroke="url(#goldMetallic)" strokeWidth="1.6"/>
        <path d="M145 194 C160 190, 178 190, 188 194 M192 194 C202 190, 220 190, 235 194" stroke="#f2e2be" strokeWidth="1" strokeOpacity="0.75"/>
        <path d="M147 198 C161 194, 178 194, 187 197 M193 197 C202 194, 219 194, 233 198" stroke="#d5bb7c" strokeWidth="0.8" strokeOpacity="0.5"/>
        <path d="M190 194 v22 l-3.5 -3 l-3.5 3 v-22" fill="url(#goldMetallic)" stroke="#8f6f2e" strokeWidth="0.5"/>
      </g>

      {/* Clinical Carte node */}
      <g transform="translate(68, 160)" filter="url(#foilShine)">
        <rect width="32" height="40" rx="4" fill="#15273f" stroke="url(#goldMetallic)" strokeWidth="1" strokeOpacity="0.6"/>
        <line x1="7" y1="10" x2="25" y2="10" stroke="#c8b37b" strokeWidth="1.4" strokeOpacity="0.8"/>
        <line x1="7" y1="16" x2="25" y2="16" stroke="#ffffff" strokeWidth="0.9" strokeOpacity="0.3"/>
        <line x1="7" y1="21" x2="21" y2="21" stroke="#ffffff" strokeWidth="0.9" strokeOpacity="0.3"/>
        <line x1="7" y1="26" x2="18" y2="26" stroke="#ffffff" strokeWidth="0.9" strokeOpacity="0.3"/>
        <path d="M18 31 l2 2 l5 -5" fill="none" stroke="url(#sageAccent)" strokeWidth="1.4" strokeLinecap="round"/>
      </g>

      {/* Constellation Diamond Stars */}
      <path d="M96 78 L99 84 L105 87 L99 90 L96 96 L93 90 L87 87 L93 84 Z" fill="url(#goldMetallic)" opacity="0.85"/>
      <circle cx="96" cy="87" r="1.5" fill="#fff"/>
      <path d="M285 72 L287 76 L291 78 L287 80 L285 84 L283 80 L279 78 L283 76 Z" fill="url(#goldMetallic)" opacity="0.85"/>

      {/* Medicinal Herb / Sage Emblem */}
      <g transform="translate(280, 205)" opacity="0.95">
        <circle cx="12" cy="12" r="14" fill="#13273e" stroke="url(#sageAccent)" strokeWidth="1" strokeOpacity="0.6"/>
        <path d="M7 16 C8 10, 15 8, 18 7 C18 13, 15 17, 7 16 Z" fill="url(#sageAccent)" opacity="0.85"/>
        <path d="M7 16 L15 10" stroke="#f0f7f4" strokeWidth="0.8" opacity="0.6"/>
      </g>

      {/* Precision Node */}
      <circle cx="190" cy="36" r="3.5" fill="url(#goldMetallic)"/>
      <line x1="190" y1="28" x2="190" y2="44" stroke="url(#goldMetallic)" strokeWidth="1" strokeOpacity="0.4"/>
    </svg>
    <span className="art-caption">医学の知を、一問ずつ。</span>
  </div>}
export function Analytics({compact=false}:{compact?:boolean}){const histories=useStudy(s=>s.histories);const attempts=Object.values(histories).flatMap(h=>h.attempts);const oldest=attempts.length?Math.min(...attempts.map(a=>new Date(a.answered_at).getTime())):Date.now();const allDays=Math.max(90,Math.ceil((Date.now()-oldest)/86400000)+1);const [tab,setTab]=useState('scatter');const [wide,setWide]=useState(()=>window.innerWidth>=768);useEffect(()=>{const media=window.matchMedia('(min-width:768px)');const update=()=>setWide(media.matches);update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update)},[]);const [scope,setScope]=useState<Scope>('all');const [period,setPeriod]=useState('7');const [data,setData]=useState<{points:UserPoint[];daily:DailyPoint[]}>({points:[],daily:[]});useEffect(()=>{let mounted=true;dataAdapter.getScatter(scope,period==='all'?String(allDays):period).then(d=>{if(mounted)setData(d)});return()=>{mounted=false}},[scope,period,allDays]);const included=attempts.filter(a=>period==='all'||Date.now()-new Date(a.answered_at).getTime()<Number(period)*86400000);const self={id:'あなた',amount:included.length,rate:included.length?Math.round(included.filter(a=>a.result==='correct').length/included.length*100):0};const avgAmount=data.points.reduce((s,p)=>s+p.amount,0)/Math.max(data.points.length,1),avgRate=data.points.reduce((s,p)=>s+p.rate,0)/Math.max(data.points.length,1);const daily=data.daily.map(d=>({...d,label:d.date.slice(5).replace('-','/'),self:attempts.filter(a=>localDate(new Date(a.answered_at))===d.date).length}));const dailyOthers=daily.flatMap(d=>d.users.map(u=>({label:d.label,amount:u.amount})));const scatterChart=<ScatterChart margin={{top:20,right:24,bottom:18,left:0}}><CartesianGrid stroke="var(--line)" strokeDasharray="3 5"/><XAxis type="number" dataKey="amount" name="演習量" unit="問" tick={{fontSize:12,fill:'var(--muted)'}} axisLine={false} tickLine={false} domain={[0,'auto']}/><YAxis type="number" dataKey="rate" name="正答率" unit="%" domain={[0,100]} tick={{fontSize:12,fill:'var(--muted)'}} axisLine={false} tickLine={false} width={45}/><Tooltip cursor={{strokeDasharray:'3 3'}} content={({active,payload})=>active&&payload?.length?<div className="chart-tooltip">{payload[0].payload.id==='あなた'?'あなた':'匿名の学習者'}<br/>{payload[0].payload.amount}問 · {payload[0].payload.rate}%</div>:null}/><ReferenceLine x={avgAmount} stroke="#baa16f" strokeDasharray="5 5"/><ReferenceLine y={avgRate} stroke="#baa16f" strokeDasharray="5 5"/><Scatter data={data.points} fill="#aeb8c2" fillOpacity={.65} isAnimationActive={false}/><Scatter data={[self]} fill="var(--navy)" isAnimationActive={false} shape={(props:any)=><g><circle cx={props.cx} cy={props.cy} r={9} fill="var(--navy)" stroke="#fff" strokeWidth={3}/>{!wide&&<text x={props.cx+12} y={props.cy-12} fontSize={11} fill="var(--text)" fontWeight={700}>あなた</text>}</g>}/></ScatterChart>;const dailyChart=<ComposedChart data={daily} margin={{top:16,right:25,bottom:18,left:0}}><CartesianGrid stroke="var(--line)" strokeDasharray="3 5"/><XAxis dataKey="label" allowDuplicatedCategory={false} tick={{fontSize:12,fill:'var(--muted)'}} axisLine={false} tickLine={false} interval="preserveStartEnd"/><YAxis unit="問" tick={{fontSize:12,fill:'var(--muted)'}} axisLine={false} tickLine={false} width={45}/><Tooltip content={({active,payload})=>active&&payload?.length?<div className="chart-tooltip">{payload[0].payload.label}<br/>{payload.filter(p=>p.dataKey!=='amount').map(p=><span key={String(p.dataKey)}>{p.name}: {p.value}問<br/></span>)}{payload.some(p=>p.dataKey==='amount')&&<span>匿名の学習者: {payload.find(p=>p.dataKey==='amount')?.value}問</span>}</div>:null}/><Scatter data={dailyOthers} dataKey="amount" name="匿名の学習者" fill="#aeb8c2" fillOpacity={.3} isAnimationActive={false}/><Line dataKey="average" name="全体平均" stroke="#baa16f" strokeDasharray="5 5" dot={false} isAnimationActive={false}/><Line dataKey="self" name="あなた" stroke="var(--navy)" strokeWidth={2.5} dot={{r:4}} isAnimationActive={false}/></ComposedChart>;return <section aria-label="学習インサイト" className={`card analytics ${compact?'compact':''}`}><div className="section-heading"><div><span className="eyebrow">学習インサイト</span><h2>あなたの学習を、見える化。</h2></div><span className="demo-badge">他ユーザーはデモデータ</span></div><div className="chart-controls"><div className="tab-group"><button className={tab==='scatter'?'active':''} onClick={()=>setTab('scatter')}>演習量と正答率</button><button className={tab==='daily'?'active':''} onClick={()=>setTab('daily')}>日々の演習量</button></div><div className="inline-controls"><select aria-label="グラフの集計範囲" value={scope} onChange={e=>setScope(e.target.value as Scope)}><option value="all">全体</option><option value="univ">自大学</option><option value="grade">自学年</option></select><select aria-label="グラフの期間" value={period} onChange={e=>setPeriod(e.target.value)}><option value="7">7日</option><option value="30">30日</option><option value="all">全期間</option></select></div></div><div className="chart-legend"><span><i className="dot self"/>あなた</span><span><i className="dot"/>匿名の学習者</span><span><i className="line-swatch"/>全体平均</span></div><div className="analytics-layout">
{(wide||tab==='scatter')&&<div className="chart-panel" role="region" aria-label="演習量と正答率のグラフ"><h3>演習量と正答率</h3><div className="chart"><ResponsiveContainer width="100%" height="100%">{scatterChart}</ResponsiveContainer></div><p className="chart-caption">横軸：演習量 ／ 縦軸：正答率</p></div>}
{(wide||tab==='daily')&&<div className="chart-panel" role="region" aria-label="日々の演習量のグラフ"><h3>日々の演習量</h3><div className="chart"><ResponsiveContainer width="100%" height="100%">{dailyChart}</ResponsiveContainer></div><p className="chart-caption">その日に解いた問題数を表示</p></div>}
</div><div className="chart-footer"><span>自分の数値は端末内の履歴から集計</span><span>他ユーザーと平均値はデモデータ</span></div></section>}
export function QuizSettings({questions,onClose,onStart}:{questions:Question[];onClose:()=>void;onStart:(groups:Question[][])=>void}){const s=useStudy();const [config,setConfig]=useState<QuizConfig>({...s.config});const [name,setName]=useState('');const groups=selectQuestions(questions,config,s.histories,1);const count=groups.flat().length;const change=(key:keyof QuizConfig,value:string|boolean|number)=>setConfig(c=>({...c,[key]:value}));return <Modal title="出題設定" onClose={onClose} wide><div className="modal-body"><p className="muted">今の自分に合った問題で、学びを深めましょう。</p><div className="form-grid"><label>並び順<select value={config.sort} onChange={e=>change('sort',e.target.value)}>{sortDefs.map(o=><option value={o.id} key={o.id}>{o.label}</option>)}</select></label>{filterDefs.map(f=><label key={f.id}>{f.label}<select value={String(config[f.id])} onChange={e=>change(f.id,e.target.value)}>{f.options(questions).map(o=><option value={o.value} key={o.value}>{o.label}</option>)}</select></label>)}<label>出題数<select value={[0,10,20].includes(config.count)?String(config.count):'custom'} onChange={e=>change('count',e.target.value==='custom'?1:Number(e.target.value))}><option value="0">全問</option><option value="10">10問</option><option value="20">20問</option><option value="custom">任意の問数</option></select>{![0,10,20].includes(config.count)&&<input aria-label="任意の出題数" type="number" min="1" max="999" value={config.count} onChange={e=>change('count',Math.max(1,Math.min(999,Number(e.target.value))))}/>}</label></div><label className="checkbox-label"><input type="checkbox" checked={config.bookmark} onChange={e=>change('bookmark',e.target.checked)}/>ブックマークした問題だけ</label><div className="preset-row"><input placeholder="プリセット名" aria-label="プリセット名" value={name} onChange={e=>setName(e.target.value)}/><button className="btn secondary" disabled={!name.trim()} onClick={()=>{s.commit({presets:[...s.presets.filter(p=>p.name!==name.trim()),{name:name.trim(),config}]});setName('')}}>設定を保存</button></div>{s.presets.length>0&&<div className="chips">{s.presets.map(p=><button key={p.name} className="chip" onClick={()=>setConfig(p.config)}>{p.name}<ChevronDown size={12}/></button>)}</div>}<p className="muted small">連問はセット単位で出題します。指定数を超える場合があります。</p></div><footer className="modal-footer"><span><strong>{count}</strong> 問が該当</span><button className="btn primary" disabled={!count} onClick={()=>{s.commit({config});onStart(selectQuestions(questions,config,s.histories));onClose()}}>演習を始める<ArrowUpRight size={18}/></button></footer></Modal>}
export function Notice(){return <div className="ai-notice"><span>AI</span><p>解説はAI生成を含みます。必要に応じて元資料をご確認ください。</p></div>}

