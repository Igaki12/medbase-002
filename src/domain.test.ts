// @vitest-environment jsdom
import {describe,it,expect,beforeEach,vi} from 'vitest';
import raw from '../public/data/q_and_a_sample.json';
import {judge,groupQuestions,selectQuestions,defaultConfig,makeStats,normalizeText,keyOf,type Question} from './domain';
import {initial,validateImport,useStudy,exportData,storageAdapter} from './state';
import DOMPurify from 'dompurify';
const questions=raw.q_and_a as Question[];
describe('添付問題と判定',()=>{
 it('JSONの6問だけを収録する',()=>{expect(questions.map(q=>q.q_id)).toEqual([1,2,3,4,7,9]);expect(questions.filter(q=>q.images?.length)).toHaveLength(2);expect(questions.flatMap(q=>q.images??[])).toHaveLength(4)});
 it.each(questions)('問題$q_id の正解を判定する',q=>{expect(judge(q.answer as string[],q.answer)).toBe('correct');expect(judge([],q.answer)).toBe('unanswered');expect(judge(['a','b','c','d','e'],q.answer)).toBe('wrong')});
 it('複数選択は順序によらず完全一致、部分一致は不正解',()=>{expect(judge(['d','c'],['c','d'])).toBe('correct');expect(judge(['c'],['c','d'])).toBe('wrong');expect(judge(['c','d','e'],['c','d'])).toBe('wrong')});
 it('問題7の未収録小問を生成しない',()=>{expect(groupQuestions(questions).map(g=>g.map(q=>q.q_id))).toEqual([[1],[2],[3],[4],[7],[9]])});
 it('連問をまとめ、絞り込みと問数指定でも分割しない',()=>{const chain=[{...questions[0],q_id:6,series_index:1,series_total:3},{...questions[4]},{...questions[0],q_id:8,series_index:3,series_total:3}];expect(groupQuestions(chain)).toHaveLength(1);expect(selectQuestions(chain,{...defaultConfig,image:'yes',count:1},{}).flat()).toHaveLength(3)});
 it('画像・ブックマーク・記述式のフィルター',()=>{expect(selectQuestions(questions,{...defaultConfig,image:'yes'},{}).flat().map(q=>q.q_id)).toEqual([7,9]);expect(selectQuestions(questions,{...defaultConfig,format:'written'},{})).toEqual([]);const written={...questions[0],options:{},answer:'壁細胞'};expect(selectQuestions([written],{...defaultConfig,format:'written'},{}).flat()).toHaveLength(1);expect(selectQuestions(questions,{...defaultConfig,bookmark:true},{[keyOf(9)]:{key:keyOf(9),attempts:[],bookmark:{on:true,updated_at:new Date().toISOString()}}}).flat().map(q=>q.q_id)).toEqual([9])});
 it('ダミー集計は固定で、5人未満のケースもある',()=>{expect(makeStats(questions[5],'all')).toEqual(makeStats(questions[5],'all'));expect(makeStats(questions[4],'grade').respondents).toBe(4)});
 it('省略可能なフィールドがなくても並び替えられる',()=>{const q={...questions[0],images:undefined,tags:undefined,option_explanations:undefined};expect(selectQuestions([q],{...defaultConfig,sort:'rate'},{}).flat()).toHaveLength(1)});
 it('改行・太字を正規化し、危険なHTMLを除去する',()=>{const html=DOMPurify.sanitize(normalizeText('**強調**\\n次\\\\n行\n<u>下線</u><img src=x onerror=alert(1)><script>alert(1)</script>'),{ALLOWED_TAGS:['b','u','br'],ALLOWED_ATTR:[]});expect(html).toBe('<b>強調</b><br>次<br>行<br><u>下線</u>')});
});
describe('保存・復元と履歴',()=>{
 beforeEach(()=>{const memory=new Map<string,string>();vi.stubGlobal('localStorage',{getItem:(k:string)=>memory.get(k)??null,setItem:(k:string,v:string)=>memory.set(k,v),clear:()=>memory.clear()});useStudy.setState({...initial(),error:null})});
 const attempt=()=>({attempt_id:crypto.randomUUID(),answered_at:new Date().toISOString(),selected:['c'],auto_result:'correct' as const,result:'correct' as const,edited:false});
 it('回答・メモ・ブックマーク・設定は再読込後も残る',()=>{const s=useStudy.getState();s.start([[1],[2]]);s.submit(1,attempt());s.note(1,'覚えたいこと');s.bookmark(1,true,'要暗記');s.commit({settings:{theme:'dark',font:'L',animation:false}});const restored=storageAdapter.load();expect(restored.histories[keyOf(1)].attempts).toHaveLength(1);expect(restored.notes[keyOf(1)]).toBe('覚えたいこと');expect(restored.settings.theme).toBe('dark');expect(restored.histories[keyOf(1)].bookmark?.label).toBe('要暗記')});
 it('手動判定・再挑戦・過去の削除が独立する',()=>{const s=useStudy.getState();s.start([[1]]);const a=attempt();s.submit(1,a);s.editAttempt(1,a.attempt_id,'partial');s.retry([1]);s.submit(1,attempt());expect(exportData().histories[keyOf(1)].attempts).toHaveLength(2);expect(exportData().histories[keyOf(1)].attempts[0]).toMatchObject({edited:true,result:'partial',auto_result:'correct'});s.deleteAttempt(1,a.attempt_id);expect(exportData().histories[keyOf(1)].attempts).toHaveLength(1)});
 it('記述式の回答と自己判定を保存する',()=>{const s=useStudy.getState();s.start([[1]]);const a={...attempt(),selected:[],written_answer:'壁細胞',auto_result:undefined,result:'unanswered' as const};s.submit(1,a);s.editAttempt(1,a.attempt_id,'correct');expect(exportData().histories[keyOf(1)].attempts[0]).toMatchObject({written_answer:'壁細胞',result:'correct',edited:true})});
 it('エクスポート→インポートで同じ状態に戻る',()=>{const s=useStudy.getState();s.start([[1],[9]]);s.submit(1,attempt());s.note(9,'画像メモ');s.bookmark(9,true);const snapshot=exportData();const json=JSON.parse(JSON.stringify(snapshot));s.restore(initial());s.restore(validateImport(json));expect(exportData()).toEqual(snapshot)});
 it.each([{},{...initial(),version:2},{...initial(),notes:{bad:4}},{...initial(),settings:{theme:'other'}},{...initial(),config:{...defaultConfig,count:-1}},{...initial(),session:{groups:[]}}])('不正データを拒否し既存データを保つ',data=>{useStudy.getState().note(1,'大切な記録');expect(()=>useStudy.getState().restore(data as any)).toThrow();expect(exportData().notes[keyOf(1)]).toBe('大切な記録')});
 it('出題0問では既存セッションを壊さない',()=>{useStudy.getState().start([[1]]);useStudy.getState().start([]);expect(exportData().session?.groups).toEqual([[1]])});
});
