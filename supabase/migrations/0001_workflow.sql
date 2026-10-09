create table workflows (
 id uuid primary key default gen_random_uuid(), name text not null unique check(length(trim(name))>0), owner text not null,
 purpose text not null, review_due date not null, published boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table step_definitions (
 id uuid primary key default gen_random_uuid(), workflow_id uuid not null references workflows(id), position integer not null check(position>0),
 name text not null, assignee text not null, due_days integer not null check(due_days between 1 and 365),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(workflow_id,position)
);
create table requests (
 id uuid primary key default gen_random_uuid(), workflow_id uuid not null references workflows(id), title text not null check(length(trim(title))>0),
 requester text not null default '', detail text not null default '', state text not null default 'draft' check(state in ('draft','imported','active','approved','rejected')),
 external_id text, source_data jsonb not null default '{}', source_status text not null default '',
 submitted_at timestamptz, closed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(workflow_id,external_id)
);
create index requests_workflow_idx on requests(workflow_id);
create table tasks (
 id uuid primary key default gen_random_uuid(), request_id uuid not null references requests(id), position integer not null,
 name text not null, assignee text not null, due_days integer not null, state text not null check(state in ('waiting','pending','approved','rejected','cancelled')),
 due_at timestamptz, decided_at timestamptz, decided_by text, evidence text, note text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(request_id,position)
);
create index tasks_pending_idx on tasks(due_at) where state='pending';
create table activity (
 id uuid primary key default gen_random_uuid(), request_id uuid references requests(id), workflow_id uuid references workflows(id),
 actor text not null, action text not null, detail jsonb not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index activity_request_idx on activity(request_id,created_at);
create index activity_workflow_idx on activity(workflow_id,created_at);
create function touch_updated() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
create function immutable_activity() returns trigger language plpgsql as $$ begin raise exception 'activity is append-only'; end $$;
create trigger activity_immutable before update or delete on activity for each row execute function immutable_activity();
create function guard_step() returns trigger language plpgsql as $$ begin
 if exists(select 1 from workflows where id=coalesce(new.workflow_id,old.workflow_id) and published) then raise exception 'published workflow steps are immutable'; end if;
 if tg_op='DELETE' then return old; end if; return new; end $$;
create trigger step_immutable before insert or update or delete on step_definitions for each row execute function guard_step();
create function guard_workflow() returns trigger language plpgsql as $$ begin
 if old.published and (not new.published or new.name<>old.name) then raise exception 'published workflow identity is immutable'; end if; return new; end $$;
create trigger workflow_guard before update on workflows for each row execute function guard_workflow();
create function guard_task() returns trigger language plpgsql as $$ begin
 if tg_op='DELETE' then raise exception 'task snapshots cannot be deleted'; end if;
 if (new.request_id,new.position,new.name,new.due_days) is distinct from (old.request_id,old.position,old.name,old.due_days) then raise exception 'task snapshot is immutable'; end if;
 if old.state in ('approved','rejected','cancelled') then raise exception 'decided task is immutable'; end if; return new; end $$;
create trigger task_guard before update or delete on tasks for each row execute function guard_task();
do $$ declare t text; begin
 foreach t in array array['workflows','step_definitions','requests','tasks','activity'] loop
 execute format('alter table %I enable row level security',t);
 execute format('revoke all on %I from public',t);
 if t<>'activity' then execute format('create trigger %I before update on %I for each row execute function touch_updated()',t||'_touch',t); end if;
 end loop; end $$;
create view approval_inbox with(security_invoker=true) as
 select t.id,t.request_id,r.title,w.name as workflow,t.name as step,t.assignee,t.due_at,
 round(extract(epoch from(now()-t.created_at))/86400,1) as age_days,
 t.due_at<now() as overdue from tasks t join requests r on r.id=t.request_id join workflows w on w.id=r.workflow_id where t.state='pending' and r.state='active';
create view workflow_summary with(security_invoker=true) as
 select w.id,w.name,w.owner,w.published,count(r.id)::int as requests,
 count(r.id) filter(where r.state='active')::int as active,
 count(r.id) filter(where r.state='imported')::int as imported,
 count(r.id) filter(where r.state='approved')::int as approved,
 count(r.id) filter(where r.state='rejected')::int as rejected,w.review_due
 from workflows w left join requests r on r.workflow_id=w.id group by w.id;
create view workflow_attention with(security_invoker=true) as
 select r.id,r.title,'Overdue approval' as issue,t.assignee as owner,t.due_at as due_at from tasks t join requests r on r.id=t.request_id where t.state='pending' and t.due_at<now()
 union all select id,title,'Import needs review',requester,null::timestamptz from requests where state='imported'
 union all select id,title,'Draft inactive for seven days',requester,updated_at+interval '7 days' from requests where state='draft' and updated_at<now()-interval '7 days';
revoke all on approval_inbox,workflow_summary,workflow_attention from public;
