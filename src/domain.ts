export type Judgement = 'correct' | 'partial' | 'wrong' | 'unanswered';
export type Scope = 'all' | 'univ' | 'grade';
export type Question = { q_id:number; exam_name:string; page:number; q_text:string; options:Record<string,string>; images?:{label:string;page:number;box_2d:[number,number,number,number];src?:string}[]; answer:string[]|string; official_answer?:string[]; answer_source:string; explanation:string; option_explanations?:Record<string,string>; image_findings?:{label:string;finding:string}[]; tags?:{diseases?:string[];keywords?:string[];question_type?:string}; series_index?:number; series_total?:number; depends_on?:number[] };
export type Attempt = { attempt_id:string; answered_at:string; selected:string[]; written_answer?:string; auto_result?:Judgement; result:Judgement; edited:boolean; duration_sec?:number };
export type History = { key:string; attempts:Attempt[]; bookmark?:{on:boolean;label?:string;updated_at:string} };
export type QuestionStats = {q_id:number;respondents:number;correct_rate:number;option_rates:Record<string,number>;top_combinations:{options:string[];rate:number}[];self_judgement_rates?:Record<'correct'|'partial'|'wrong',number>};
export type UserPoint = {id:string;amount:number;rate:number};
export type DailyPoint = {date:string;average:number;users:{id:string;amount:number}[]};
export type SetMeta={source_file:string;title:string;exam_name:string;count:number};
export interface DataAdapter { listSets():Promise<SetMeta[]>; getQuestions(sourceFile:string):Promise<Question[]>; getPdfUrl(sourceFile:string):string|null; getStats(sourceFile:string,qId:number,scope:Scope):Promise<QuestionStats|null>; getScatter(scope:Scope,period:string):Promise<{points:UserPoint[];daily:DailyPoint[]}> }
export const SOURCE='q_and_a_sample';
export const keyOf=(id:number)=>`${SOURCE}:${id}`;
export const labels:Record<Judgement,string>={correct:'○ 正解',partial:'△ あと少し',wrong:'✕ 不正解',unanswered:'− 未回答'};
export const shortLabels:Record<Judgement,string>={correct:'○',partial:'△',wrong:'✕',unanswered:'−'};
export function judge(selected:string[],answer:string[]|string):Judgement { const expected=Array.isArray(answer)?answer:[answer]; return selected.length===0?'unanswered':selected.length===expected.length&&selected.every(x=>expected.includes(x))?'correct':'wrong' }
export function rng(seed:number) { let value=seed>>>0; return ()=>{value=(Math.imul(1664525,value)+1013904223)>>>0;return value/4294967296} }
const fileMap:Record<string,string>={'7:大腸内視鏡像':'Q7.png','9:A':'Q9A.png','9:B':'Q9B.png','9:C':'Q9C.png'};
export const asset=(path:string)=>`${import.meta.env.BASE_URL}${path}`;
let cached:Question[]|undefined;
export const dataAdapter:DataAdapter={
 async listSets(){const q=await this.getQuestions(SOURCE);return [{source_file:SOURCE,title:'2025年度 卒業試験',exam_name:q[0]?.exam_name??'共同問題',count:q.length}]},
 async getQuestions(source){if(source!==SOURCE)return [];if(!cached){const response=await fetch(asset('data/q_and_a_sample.json'));if(!response.ok)throw Error('問題データを読み込めませんでした。');const json=await response.json();if(!Array.isArray(json.q_and_a))throw Error('問題データの形式が正しくありません。');cached=json.q_and_a.map((q:Question)=>({...q,options:q.options??{},explanation:q.explanation??'',images:(q.images??[]).map(i=>({...i,src:fileMap[`${q.q_id}:${i.label}`]?asset(`images/${fileMap[`${q.q_id}:${i.label}`]}`):i.src}))}));}return cached!},
 getPdfUrl(source){return source===SOURCE?asset('pdfs/2025C.pdf'):null},
 async getStats(source,id,scope){const q=(await this.getQuestions(source)).find(q=>q.q_id===id);return q?makeStats(q,scope):null},
 async getScatter(scope,period){const random=rng(2025+['all','univ','grade'].indexOf(scope)*177);const count=/^\d+$/.test(period)?Math.max(1,Number(period)):90;const today=new Date();today.setHours(0,0,0,0);return {points:Array.from({length:80},(_,i)=>({id:`anonymous-${i}`,amount:Math.round(random()*240+8),rate:Math.round(35+random()*62)})),daily:Array.from({length:count},(_,i)=>{const d=new Date(today);d.setDate(d.getDate()-count+i+1);return {date:localDate(d),average:Math.round(random()*12+5),users:Array.from({length:12},(_,j)=>({id:`anonymous-${j}`,amount:Math.round(random()*26)}))}})} }
};
export function makeStats(q:Question,scope:Scope):QuestionStats {const random=rng(q.q_id*991+['all','univ','grade'].indexOf(scope)*71);const respondents=scope==='grade'&&q.q_id===7?4:Math.round(40+random()*440);const expected=Array.isArray(q.answer)?q.answer:[q.answer];const correct_rate=Math.round(50+random()*43);return {q_id:q.q_id,respondents,correct_rate,option_rates:Object.fromEntries(Object.keys(q.options).map(o=>[o,Math.round(expected.includes(o)?correct_rate+random()*(100-correct_rate):random()*32)])),top_combinations:[{options:expected,rate:correct_rate},...Object.keys(q.options).filter(o=>!expected.includes(o)).slice(0,2).map(o=>({options:[o],rate:Math.floor((100-correct_rate)*(.12+random()*.25))}))],self_judgement_rates:{correct:correct_rate,partial:Math.floor((100-correct_rate)/2),wrong:Math.ceil((100-correct_rate)/2)}} }
export function localDate(d:Date){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
export function normalizeText(text:string){return text.replace(/\\+n/g,'\n').replace(/\*\*(.+?)\*\*/gs,'<b>$1</b>').replace(/\^-/g,'⁻').replace(/\^\+/g,'⁺').replace(/HCO3/g,'HCO₃').replace(/SpO2/g,'SpO₂').replace(/CO2/g,'CO₂').replace(/\n/g,'<br>')}
export function groupQuestions(questions:Question[]):Question[][] {const sorted=[...questions].sort((a,b)=>a.q_id-b.q_id);const groups:Question[][]=[];const used=new Set<number>();for(const q of sorted){if(used.has(q.q_id))continue;const start=q.q_id-(q.series_index??1)+1;const group=q.series_total?sorted.filter(p=>p.series_total===q.series_total&&p.q_id-(p.series_index??1)+1===start):[q];groups.push(group);group.forEach(p=>used.add(p.q_id));}return groups}
export type Issue={id:string;source_file:string;q_id:number;exam_name:string;created_at:string;area:string;text:string};
export type Settings={theme:'light'|'dark';font:'S'|'M'|'L';animation:boolean};
export type QuizConfig={sort:string;status:string;bookmark:boolean;exam:string;tag:string;questionType:string;image:string;format:string;source:string;count:number};
export const defaultConfig:QuizConfig={sort:'number',status:'all',bookmark:false,exam:'all',tag:'all',questionType:'all',image:'all',format:'all',source:'all',count:0};
export type FilterDef={id:keyof QuizConfig;label:string;options:(q:Question[])=>{value:string;label:string}[];matches:(q:Question,c:QuizConfig,h:Record<string,History>)=>boolean};
const unique=(values:(string|undefined)[])=>[...new Set(values.filter((v):v is string=>!!v))].map(value=>({value,label:value}));
const all={value:'all',label:'すべて'};
export const filterDefs:FilterDef[]=[
 {id:'status',label:'前回の判定',options:()=>[all,...Object.entries(labels).map(([value,label])=>({value,label}))],matches:(q,c,h)=>c.status==='all'||(h[keyOf(q.q_id)]?.attempts.at(-1)?.result??'unanswered')===c.status},
 {id:'exam',label:'試験',options:q=>[all,...unique(q.map(q=>q.exam_name))],matches:(q,c)=>c.exam==='all'||q.exam_name===c.exam},
 {id:'tag',label:'タグ',options:q=>[all,...unique(q.flatMap(q=>[...(q.tags?.keywords??[]),...(q.tags?.diseases??[])]))],matches:(q,c)=>c.tag==='all'||[...(q.tags?.keywords??[]),...(q.tags?.diseases??[])].includes(c.tag)},
 {id:'questionType',label:'出題タイプ',options:q=>[all,...unique(q.map(q=>q.tags?.question_type)).map(o=>({...o,label:({knowledge:'知識',diagnosis:'診断',treatment:'治療'} as Record<string,string>)[o.value]??o.label}))],matches:(q,c)=>c.questionType==='all'||q.tags?.question_type===c.questionType},
 {id:'image',label:'画像',options:()=>[all,{value:'yes',label:'画像あり'},{value:'no',label:'画像なし'}],matches:(q,c)=>c.image==='all'||(!!q.images?.length)===(c.image==='yes')},
 {id:'format',label:'回答形式',options:()=>[all,{value:'choice',label:'選択式'},{value:'written',label:'記述式'}],matches:(q,c)=>c.format==='all'||(Object.keys(q.options).length>0)===(c.format==='choice')},
 {id:'source',label:'解答の出典',options:()=>[all,{value:'official',label:'公式解答'},{value:'generated',label:'AI生成'}],matches:(q,c)=>c.source==='all'||q.answer_source===c.source}
];
export type SortDef={id:string;label:string;apply:(groups:Question[][],histories:Record<string,History>,seed:number)=>Question[][]};
const weakRank=(g:Question[],h:Record<string,History>)=>Math.min(...g.map(q=>({wrong:0,partial:1,unanswered:2,correct:3}[h[keyOf(q.q_id)]?.attempts.at(-1)?.result??'unanswered'])));
const oldestDate=(g:Question[],h:Record<string,History>)=>Math.min(...g.map(q=>new Date(h[keyOf(q.q_id)]?.attempts.at(-1)?.answered_at??0).getTime()));
export const sortDefs:SortDef[]=[
 {id:'number',label:'問題番号順',apply:groups=>[...groups].sort((a,b)=>a[0].q_id-b[0].q_id)},
 {id:'random',label:'ランダム',apply:(groups,_h,seed)=>{const result=[...groups];const random=rng(seed);for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]]}return result}},
 {id:'weak',label:'✕・△を優先',apply:(groups,h)=>[...groups].sort((a,b)=>weakRank(a,h)-weakRank(b,h))},
 {id:'rate',label:'正答率が低い順',apply:groups=>[...groups].sort((a,b)=>makeStats(a[0],'all').correct_rate-makeStats(b[0],'all').correct_rate)},
 {id:'old',label:'前回解いた日が古い順',apply:(groups,h)=>[...groups].sort((a,b)=>oldestDate(a,h)-oldestDate(b,h))}
];
export function selectQuestions(q:Question[],c:QuizConfig,h:Record<string,History>,randomSeed=Date.now()):Question[][] {
 let groups=groupQuestions(q).filter(g=>g.some(q=>filterDefs.every(f=>f.matches(q,c,h))&&(!c.bookmark||h[keyOf(q.q_id)]?.bookmark?.on)));
 groups=(sortDefs.find(sort=>sort.id===c.sort)??sortDefs[0]).apply(groups,h,randomSeed);
 if(c.count>0){let n=0;groups=groups.filter(g=>{const include=n<c.count;n+=include?g.length:0;return include})}
 return groups;
}
