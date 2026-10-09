import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {getDb,REPO_ROOT} from './lib/db.mjs';
import {parseCsv,pick} from './lib/csv.mjs';
import {table} from './lib/format.mjs';
import {page,table as htmlTable,writeOut} from './lib/render.mjs';
export const specs={
 workflows:[],steps:['workflow'],requests:[],inbox:[],overdue:[],workload:[],bottlenecks:[], 'cycle-times':[],decisions:[],attention:[],compliance:[],
 request:['request'],history:['request'],'weekly-review':[],
 'add-workflow':['name','owner','purpose','review-due','actor'],
 'add-step':['workflow','name','assignee','days','actor'],
 'publish-workflow':['workflow','actor'],
 'add-request':['workflow','title','requester','detail','actor'],
 submit:['request','actor'],decide:['request','decision','evidence','note','actor'],
 reassign:['request','assignee','note','actor'],
 'review-data':['workflow','purpose','review-due','actor'],log:['request','note','actor'],
 'draft-chase':['request'],'draft-decision':['request'],
 import:['workflow','file','mapping','actor','dry-run'],export:['file'],help:[]
};
const reads={
 workflows:'select * from workflow_summary order by name',
 requests:'select r.id,r.title,w.name as workflow,r.requester,r.state,r.source_status,r.updated_at from requests r join workflows w on w.id=r.workflow_id order by r.created_at,r.id',
 inbox:'select * from approval_inbox order by due_at,id',overdue:'select * from approval_inbox where overdue order by due_at,id',
 workload:'select assignee,count(*)::int as pending,count(*) filter(where overdue)::int as overdue from approval_inbox group by assignee order by pending desc,assignee',
 bottlenecks:'select workflow,step,count(*)::int as waiting,count(*) filter(where overdue)::int as overdue,max(age_days) as oldest_days from approval_inbox group by workflow,step order by oldest_days desc,workflow',
 'cycle-times':"select w.name,count(*)::int as completed,round(avg(extract(epoch from(r.closed_at-r.submitted_at))/3600)::numeric,2) as mean_hours from requests r join workflows w on w.id=r.workflow_id where r.closed_at is not null and r.submitted_at is not null group by w.name order by w.name",
 decisions:"select r.title,t.position,t.name,t.state,t.decided_by,t.evidence,t.note,t.decided_at from tasks t join requests r on r.id=t.request_id where t.state in ('approved','rejected') order by t.decided_at,t.id",
 attention:'select * from workflow_attention order by issue,title',
 compliance:`select id,name as record,'IPP9-review' as rule,'Review the continuing purpose and retention of these records' as issue from workflows where review_due<=current_date or trim(purpose)=''
 union all select r.id,r.title,'INTERNAL-separation','Pending reviewer is also the requester' from requests r join tasks t on t.request_id=r.id where t.state='pending' and lower(trim(t.assignee))=lower(trim(r.requester))
 union all select id,title,'INTERNAL-import','Imported request must be reconciled before it is submitted' from requests where state='imported'
 union all select id,title,'INTERNAL-requester','Requester must be recorded before submission' from requests where trim(requester)=''`
};
export function parseArgs(args){
 const command=args[0]||'help';if(!Object.hasOwn(specs,command))throw Error(`Unknown command ${command}`);
 const o={},pos=[];for(const a of args.slice(1)){if(!a.startsWith('--')){pos.push(a);continue;}const at=a.indexOf('=');const k=a.slice(2,at<0?undefined:at);if(![...specs[command],'json'].includes(k))throw Error(`Unknown flag --${k}`);if(Object.hasOwn(o,k))throw Error(`Duplicate flag --${k}`);if(['json','dry-run'].includes(k)){if(at>=0)throw Error(`--${k} is a switch without a value`);o[k]=true;}else{if(at<0)throw Error(`Use --${k}=value`);o[k]=a.slice(at+1);}}
 if(command==='import'){if(pos.length!==1||pos[0]!=='kissflow')throw Error('Use import kissflow');}else if(pos.length)throw Error('Unexpected positional argument');
 return{command,o};
}
function need(o,k){if(typeof o[k]!=='string'||!o[k].trim())throw Error(`Required --${k}`);return o[k].trim();}
function date(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s)||Number.isNaN(Date.parse(s))||new Date(s).toISOString().slice(0,10)!==s)throw Error('Use a real YYYY-MM-DD date');return s;}
async function one(db,kind,value,lock=false){
 const allowed={workflows:'name',requests:'title'};const col=allowed[kind];if(!col)throw Error('Invalid record kind');
 const all=await db.query(`select * from ${kind} order by ${col},id${lock?' for update':''}`);
 const norm=value.toLowerCase();let hits=all.filter(r=>r.id===value||r[col].toLowerCase()===norm);if(hits.length!==1)hits=all.filter(r=>r.id.startsWith(norm)||r[col].toLowerCase().includes(norm));
 if(hits.length!==1)throw Error(`${hits.length?'Ambiguous':'No match'} ${kind}: ${value}. Candidates: ${hits.map(r=>`${r.id} ${r[col]}`).join('; ')||all.map(r=>`${r.id} ${r[col]}`).join('; ')}`);return hits[0];
}
const actorSame=(a,b)=>a.trim().toLowerCase()===b.trim().toLowerCase();
async function event(db,actor,action,detail,r=null,w=null){await db.query('insert into activity(actor,action,detail,request_id,workflow_id) values($1,$2,$3,$4,$5)',[actor,action,JSON.stringify(detail),r,w]);}
async function transaction(db,fn,rollback=false){await db.exec('BEGIN');try{const v=await fn();await db.exec(rollback?'ROLLBACK':'COMMIT');return v;}catch(e){await db.exec('ROLLBACK');throw e;}}
async function detail(db,value){const r=await one(db,'requests',value);return{request:r,tasks:await db.query('select * from tasks where request_id=$1 order by position',[r.id]),history:await db.query('select actor,action,detail,created_at from activity where request_id=$1 order by created_at,id',[r.id])};}
export async function execute(db,args){
 const{command:c,o}=parseArgs(args);
 if(reads[c])return db.query(reads[c]);
 if(c==='help')return Object.entries(specs).map(([command,flags])=>({command,flags:flags.map(x=>`--${x}`).join(' ')}));
 if(c==='steps'){const w=await one(db,'workflows',need(o,'workflow'));return db.query('select * from step_definitions where workflow_id=$1 order by position',[w.id]);}
 if(c==='request')return detail(db,need(o,'request'));
 if(c==='history')return(await detail(db,need(o,'request'))).history;
 if(c==='weekly-review')return{inbox:await db.query(reads.inbox),attention:await db.query(reads.attention),workload:await db.query(reads.workload),compliance:await db.query(reads.compliance)};
 if(c==='export'){
  const data={format:'workflow-approvals-v1',exported_at:new Date().toISOString()};for(const t of ['workflows','step_definitions','requests','tasks','activity'])data[t]=await db.query(`select * from ${t} order by id`);
  const file=path.resolve(need(o,'file'));fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n',{flag:'wx',mode:0o600});return[{file,requests:data.requests.length}];
 }
 if(c.startsWith('draft-')){
  const d=await detail(db,need(o,'request'));const file=writeOut('drafts',`${c}-${d.request.id}-${Date.now()}`,page({title:c==='draft-chase'?'Approval follow-up draft':'Decision record draft',subtitle:d.request.title,sections:[{title:'Request',html:htmlTable([d.request],['title','requester','state','detail'])},{title:'Steps and evidence',html:htmlTable(d.tasks,['position','name','assignee','state','evidence','note'])},{title:'Decision history',html:htmlTable(d.history)}]}));return[{file,status:'Draft only; human review required'}];
 }
 const actor=need(o,'actor');
 return transaction(db,async()=>{
  if(c==='add-workflow'){
   const rows=await db.query('insert into workflows(name,owner,purpose,review_due) values($1,$2,$3,$4) returning *',[need(o,'name'),need(o,'owner'),need(o,'purpose'),date(need(o,'review-due'))]);await event(db,actor,c,rows[0],null,rows[0].id);return rows;
  }
  if(['add-step','publish-workflow','review-data'].includes(c)){
   const w=await one(db,'workflows',need(o,'workflow'),true);let rows;
   if(c==='add-step'){
    if(w.published)throw Error('Published workflow is immutable; create a revised workflow');const days=Number(need(o,'days'));if(!Number.isInteger(days)||days<1||days>365)throw Error('days must be an integer from 1 to 365');
    rows=await db.query('insert into step_definitions(workflow_id,position,name,assignee,due_days) select $1,coalesce(max(position),0)+1,$2,$3,$4 from step_definitions where workflow_id=$1 returning *',[w.id,need(o,'name'),need(o,'assignee'),days]);
   }else if(c==='publish-workflow'){
    if(w.published)throw Error('Workflow already published');if(!(await db.query('select id from step_definitions where workflow_id=$1',[w.id])).length)throw Error('At least one approval step required');rows=await db.query('update workflows set published=true where id=$1 returning *',[w.id]);
   }else rows=await db.query('update workflows set purpose=$2,review_due=$3 where id=$1 returning *',[w.id,need(o,'purpose'),date(need(o,'review-due'))]);
   await event(db,actor,c,{before:w,after:rows},null,w.id);return rows;
  }
  if(c==='add-request'){
   const w=await one(db,'workflows',need(o,'workflow'));const rows=await db.query('insert into requests(workflow_id,title,requester,detail) values($1,$2,$3,$4) returning *',[w.id,need(o,'title'),need(o,'requester'),need(o,'detail')]);await event(db,actor,c,rows[0],rows[0].id,w.id);return rows;
  }
  if(c==='import'){
   const w=await one(db,'workflows',need(o,'workflow'),true);const rows=parseCsv(fs.readFileSync(need(o,'file'),'utf8'));if(!rows.length)throw Error('Empty CSV');
   const mapping=o.mapping?JSON.parse(fs.readFileSync(o.mapping,'utf8')):{};const defaultMap={id:['ID','_id','Item ID','Request ID'],title:['Name','Title','Request name'],requester:['Requester','Created by','Created By'],detail:['Description','Detail'],status:['Status','State']};
   for(const k of Object.keys(mapping))if(!Object.hasOwn(defaultMap,k)||typeof mapping[k]!=='string')throw Error(`Unknown mapping field ${k}`);
   const val=(r,k)=>pick(r,...(mapping[k]?[mapping[k]]:defaultMap[k]));const seen=new Set();const count={inserted:0,updated:0,unchanged:0,dry_run:Boolean(o['dry-run'])};
   for(const row of rows){
    const id=val(row,'id').trim(),title=val(row,'title').trim();if(!id||!title)throw Error('Every row requires an ID and Name/Title; use --mapping for custom report headings');if(seen.has(id))throw Error(`Duplicate source ID ${id}`);seen.add(id);
    const source=JSON.stringify(row);const [old]=await db.query('select * from requests where workflow_id=$1 and external_id=$2 for update',[w.id,id]);
    if(old&&JSON.stringify(old.source_data)===JSON.stringify(JSON.parse(source))){count.unchanged++;continue;}
    // jsonb key order differs, so compare values independently.
    if(old&&Object.keys(row).length===Object.keys(old.source_data).length&&Object.entries(row).every(([k,v])=>old.source_data[k]===v)){count.unchanged++;continue;}
    if(old&&old.state!=='imported')throw Error(`Imported request ${id} is already in local use; reconcile changes manually`);
    const fields=[title,val(row,'requester').trim(),val(row,'detail'),source,val(row,'status')];let r;
    if(old){[r]=await db.query('update requests set title=$2,requester=$3,detail=$4,source_data=$5,source_status=$6 where id=$1 returning *',[old.id,...fields]);count.updated++;}
    else{[r]=await db.query("insert into requests(workflow_id,external_id,title,requester,detail,source_data,source_status,state) values($1,$2,$3,$4,$5,$6,$7,'imported') returning *",[w.id,id,...fields]);count.inserted++;}
    await event(db,actor,'import',{external_id:id,before:old?.source_data||null,after:row},r.id,w.id);
   }return[count];
  }
  const r=await one(db,'requests',need(o,'request'),true);
  if(c==='log'){await event(db,actor,'log',{note:need(o,'note')},r.id,r.workflow_id);return[{id:r.id,logged:true}];}
  if(c==='submit'){
   if(!['draft','imported'].includes(r.state))throw Error('Only draft or imported requests can be submitted');if(!r.requester.trim()||!r.detail.trim())throw Error('Requester and detail required before submission');
   const w=await one(db,'workflows',r.workflow_id,true);if(!w.published)throw Error('Workflow must be published');
   const steps=await db.query('select * from step_definitions where workflow_id=$1 order by position',[w.id]);if(!steps.length)throw Error('No approval steps');
   for(const s of steps)await db.query("insert into tasks(request_id,position,name,assignee,due_days,state,due_at) values($1,$2,$3,$4,$5,$6,case when $6='pending' then now()+$5::integer*interval '1 day' else null end)",[r.id,s.position,s.name,s.assignee,s.due_days,s.position===steps[0].position?'pending':'waiting']);
   const rows=await db.query("update requests set state='active',submitted_at=now() where id=$1 returning *",[r.id]);await event(db,actor,c,{previous_state:r.state,source_status:r.source_status,steps},r.id,r.workflow_id);return rows;
  }
  if(!['decide','reassign'].includes(c))throw Error(`Unsupported mutation ${c}`);
  if(r.state!=='active')throw Error('Request is not active');const [task]=await db.query("select * from tasks where request_id=$1 and state='pending' order by position for update",[r.id]);if(!task)throw Error('No pending step');
  if(c==='reassign'){
   const assignee=need(o,'assignee');const rows=await db.query('update tasks set assignee=$2 where id=$1 returning *',[task.id,assignee]);await event(db,actor,c,{before:task.assignee,after:assignee,note:need(o,'note')},r.id,r.workflow_id);return rows;
  }
  if(!actorSame(task.assignee,actor))throw Error('Actor must match the current assigned reviewer');if(actorSame(r.requester,actor))throw Error('Requester cannot approve or reject their own request');
  const decision=need(o,'decision');if(!['approve','reject'].includes(decision))throw Error('decision must be approve or reject');
  const evidence=need(o,'evidence'),note=need(o,'note');const state=decision==='approve'?'approved':'rejected';
  await db.query('update tasks set state=$2,decided_at=now(),decided_by=$3,evidence=$4,note=$5 where id=$1',[task.id,state,actor,evidence,note]);
  const [next]=await db.query("select * from tasks where request_id=$1 and state='waiting' order by position limit 1",[r.id]);
  if(decision==='reject')await db.query("update tasks set state='cancelled' where request_id=$1 and state='waiting'",[r.id]);
  else if(next)await db.query("update tasks set state='pending',due_at=now()+due_days*interval '1 day',created_at=now() where id=$1",[next.id]);
  if(decision==='reject'||!next)await db.query('update requests set state=$2,closed_at=now() where id=$1',[r.id,state]);
  await event(db,actor,'decide',{step:task.name,position:task.position,decision,evidence,note},r.id,r.workflow_id);return db.query('select id,title,state from requests where id=$1',[r.id]);
 },Boolean(o['dry-run']));
}
export function human(data){if(!Array.isArray(data))return Object.entries(data).map(([k,v])=>`${k}\n${human(Array.isArray(v)?v:[v])}`).join('\n\n');if(!data.length)return '  (none)';const columns=Object.keys(data[0]).map(key=>({key,label:key,width:70,format:v=>v===null?'':v instanceof Date?v.toISOString():typeof v==='object'?JSON.stringify(v):String(v)}));return table(data,columns);}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){let db;try{parseArgs(process.argv.slice(2));db=await getDb();const data=await execute(db,process.argv.slice(2));console.log(process.argv.includes('--json')?JSON.stringify(data,null,2):human(data));}catch(e){console.error(e.message);process.exitCode=1;}finally{if(db)await db.close();}}
