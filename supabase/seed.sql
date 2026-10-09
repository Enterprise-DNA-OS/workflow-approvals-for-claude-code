insert into workflows(id,name,owner,purpose,review_due) values
 ('10000000-0000-0000-0000-000000000001','Client onboarding','Morgan','Keep onboarding decisions until the agreed review; use fictional demo clients',current_date-10),
 ('10000000-0000-0000-0000-000000000002','Policy exception','Taylor','Record operational exceptions and review their continuing purpose',current_date+90)
on conflict do nothing;
insert into step_definitions(id,workflow_id,position,name,assignee,due_days)
select v.id::uuid,v.w::uuid,v.p,v.n,v.a,v.d from (values
 ('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001',1,'Check handover evidence','Morgan',2),
 ('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001',2,'Accept service scope','Taylor',3),
 ('20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000002',1,'Review exception','Morgan',2)
) v(id,w,p,n,a,d) where not exists(select 1 from step_definitions s where s.id=v.id::uuid);
update workflows set published=true where id in('10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002') and not published;
insert into requests(id,workflow_id,title,requester,detail,state,submitted_at,created_at,updated_at) values
 ('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','Harbour Advisory handover','Jamie','Service scope confirmed; waiting for evidence review','active',now()-interval '6 days',now()-interval '6 days',now()-interval '6 days'),
 ('30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','Southern Design handover','Riley','Needs the signed scope before submission','draft',null,now()-interval '12 days',now()-interval '12 days'),
 ('30000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000002','Temporary reporting exception','Jamie','Review the temporary monthly reporting arrangement','active',now()-interval '1 day',now()-interval '1 day',now()-interval '1 day')
on conflict do nothing;
insert into tasks(id,request_id,position,name,assignee,due_days,state,due_at,created_at) values
 ('40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001',1,'Check handover evidence','Morgan',2,'pending',now()-interval '4 days',now()-interval '6 days'),
 ('40000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000001',2,'Accept service scope','Taylor',3,'waiting',null,now()-interval '6 days'),
 ('40000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000003',1,'Review exception','Morgan',2,'pending',now()+interval '1 day',now()-interval '1 day')
on conflict do nothing;
insert into activity(id,workflow_id,request_id,actor,action,detail)
values('50000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','Demo operator','demo-seed','{"note":"Fictional onboarding request awaiting a decision"}') on conflict do nothing;
