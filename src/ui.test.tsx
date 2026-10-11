// @vitest-environment jsdom
import {describe,it,expect,beforeEach,afterEach,vi} from 'vitest';
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import App from './App';
import {dataAdapter,keyOf,type Question} from './domain';
import {initial,useStudy,exportData} from './state';
const written:Question={q_id:21,exam_name:'検証用',page:1,q_text:'記述式の検証問題',options:{},answer:'壁細胞',answer_source:'generated',explanation:'**模範解答**の説明'};
const chain:Question[]=[1,2,3].map(i=>({q_id:30+i,exam_name:'検証用',page:1,q_text:i===1?'共通の症例文。小問1':'小問'+i,options:{a:'選択肢A',b:'選択肢B'},answer:['a'],answer_source:'official',explanation:'解説',series_index:i,series_total:3,depends_on:i===1?undefined:[31]}));
let root:Root;let container:HTMLDivElement;
beforeEach(()=>{vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);const memory=new Map<string,string>();vi.stubGlobal('localStorage',{getItem:(k:string)=>memory.get(k)??null,setItem:(k:string,v:string)=>memory.set(k,v)});vi.stubGlobal('scrollTo',()=>{});Element.prototype.scrollIntoView=vi.fn();useStudy.setState({...initial(),error:null});container=document.createElement('div');document.body.append(container);root=createRoot(container);location.hash='/practice';vi.spyOn(dataAdapter,'getQuestions').mockResolvedValue([written,...chain]);});
afterEach(async()=>{await act(async()=>root.unmount());container.remove();vi.restoreAllMocks();vi.unstubAllGlobals()});
const click=async(text:string)=>{const button=[...container.querySelectorAll('button')].find(b=>b.textContent===text);expect(button).toBeTruthy();await act(async()=>button!.click())};
describe('未収録形式の共通画面（本番に追加しない）',()=>{
 it('記述式の入力→模範解答→自己判定が通る',async()=>{useStudy.getState().start([[21]]);await act(async()=>root.render(<App/>));const input=container.querySelector<HTMLTextAreaElement>('.written-answer')!;expect(input).toBeTruthy();await act(async()=>{const setter=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value')!.set!;setter.call(input,'壁細胞');input.dispatchEvent(new Event('input',{bubbles:true}))});await click('回答する');expect(container.textContent).toContain('模範解答');expect(container.textContent).toContain('自己判定を選んでください');await click('○ 正解');expect(exportData().histories[keyOf(21)].attempts[0].result).toBe('correct');expect(exportData().histories[keyOf(21)].attempts[0].written_answer).toBe('壁細胞');});
 it('完全な連問は同じ画面に3小問、症例文は先頭だけ',async()=>{useStudy.getState().start([[31,32,33]]);await act(async()=>root.render(<App/>));expect(container.querySelectorAll('.question-card')).toHaveLength(3);expect(container.querySelector('.practice-main')?.textContent?.match(/共通の症例文/g)).toHaveLength(1);expect(container.textContent).not.toContain('共通症例は未収録');const first=container.querySelector('.question-card')!;await act(async()=>{first.querySelector<HTMLButtonElement>('.choice')!.click()});await act(async()=>{first.querySelector<HTMLButtonElement>('.answer-button')!.click()});expect(exportData().histories[keyOf(31)].attempts[0].result).toBe('correct');expect(container.querySelectorAll('.answer-button')).toHaveLength(2);await click('もう一度解く');expect(container.querySelectorAll('.answer-button')).toHaveLength(3);expect(exportData().histories[keyOf(31)].attempts).toHaveLength(1);});
});
