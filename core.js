(function(root){
'use strict';
function keys(q){return Object.keys(q.answers)}
function options(q,k){for(const [prefix,opts] of Object.entries(q.optionSets||{})){if(k.startsWith(prefix))return opts}return q.options}
function values(q,k){if(k.startsWith('('))return ['○','×'];return options(q,k).map((_,i)=>String(i+1))}
function normalize(v){return Array.isArray(v)?[...v].map(String).sort().join(','):String(v||'').split(',').filter(Boolean).sort().join(',')}
function answered(v){return Array.isArray(v)?v.length>0:!!v}
function grade(q,answers={}){
 const result={};const grouped=new Set();
 for(const group of q.unordered||[]){
  const remaining=group.map(k=>String(q.answers[k]));
  for(const k of group){grouped.add(k);const index=remaining.indexOf(String(answers[k]||''));result[k]=index>=0;if(index>=0)remaining.splice(index,1)}
 }
 for(const k of keys(q)){if(!grouped.has(k))result[k]=(q.acceptedAnswers?.[k]||[q.answers[k]]).some(v=>normalize(answers[k])===normalize(v))}
 return result;
}
function completion(q,answers={}){const total=keys(q).length;const done=keys(q).filter(k=>answered(answers[k])).length;return {total,done,complete:done===total}}
function label(q,k,value){if(!answered(value))return '未解答';if(k.startsWith('('))return value;return (Array.isArray(value)?value:String(value).split(',')).map(v=>`${v}. ${options(q,k)[Number(v)-1]||''}`).join(' ／ ')}
function migrateSession(s){
 const value=s?.answers?.[18]?.['2-H'];
 if(Array.isArray(value)&&value.every(v=>['5','8'].includes(v))&&new Set(value).size===value.length){s.answers[18]['2-H']=value.includes('8')?'8':value[0]||''}
 return s;
}
function validateSession(s,questions){
 if(!s||s.schema!==1||!Array.isArray(s.ids)||!s.ids.length||new Set(s.ids).size!==s.ids.length||s.ids.some(id=>!questions.find(q=>q.id===id)))return false;
 if(!s.answers||typeof s.answers!=='object'||Array.isArray(s.answers)||!s.flags||typeof s.flags!=='object')return false;
 if(!['exam','result'].includes(s.stage)||!Number.isInteger(s.index)||s.index<0||s.index>=s.ids.length)return false;
 if(s.deadline!==null&&(!Number.isFinite(s.deadline)||s.deadline<=0))return false;
 for(const [id,a] of Object.entries(s.answers)){
  const q=questions.find(q=>q.id===Number(id));if(!q||!a||typeof a!=='object'||Array.isArray(a))return false;
  for(const [k,v] of Object.entries(a)){if(!keys(q).includes(k))return false;const allowed=values(q,k);if((q.multi||[]).includes(k)){if(!Array.isArray(v)||new Set(v).size!==v.length||v.some(x=>!allowed.includes(x)))return false}else if(typeof v!=='string'||(v!==''&&!allowed.includes(v)))return false}
 }
 return true;
}
const api={migrateSession,keys,options,values,normalize,answered,grade,completion,label,validateSession};root.ExamCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
