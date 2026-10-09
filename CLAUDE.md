# Workflow Approvals for Claude Code

An internal request and approval record system for one business. Demo records are fictional. The operator owns decisions. Read from the CLI before answering and read full history before changing a request. Never invent decisions, evidence or identities.

Actor names are attribution, not authentication. Only record an approval the assigned person actually gave. Never turn an agent recommendation into a human approval. The tool enforces sequence and blocks requester self-approval. Reassignment needs a reason. Published process definitions are immutable. Imported source status is context, not local approval. Read docs/replace-kissflow.md before import and docs/compliance.md before discussing record checks.

Local mode is single-process. Shared Postgres requires restricted roles, operator authentication and protected backups. Never expose an owner connection to a browser. No external sends, vendor calls, deletion commands or background workers. Drafts stay in drafts/.

## Recurring jobs

| Job | Recipe |
|---|---|
| Review process owners, volumes and retention review dates | /workflows |
| Read the approval sequence | /steps |
| Review the request register | /requests |
| Review decisions waiting for an owner | /inbox |
| Chase overdue approvals | /overdue |
| Balance pending decisions by reviewer | /workload |
| Find the process steps holding work | /bottlenecks |
| Review completed request turnaround | /cycle-times |
| Read decisions and their evidence | /decisions |
| Find overdue approvals, stale drafts and unreviewed imports | /attention |
| Check retention reviews and internal approval controls | /compliance |
| Read a request with its steps and history | /request |
| Read the append-only request history | /history |
| Prepare the weekly approval meeting | /weekly-review |
| Define a new approval process | /add-workflow |
| Add a step before publishing the process | /add-step |
| Freeze the approval sequence for use | /publish-workflow |
| Record an internal request | /add-request |
| Begin an approval sequence | /submit |
| Record the assigned reviewer decision | /decide |
| Hand the pending decision to another reviewer | /reassign |
| Record the next purpose and retention review | /review-data |
| Record an operator note | /log |
| Draft a follow-up for an overdue request | /draft-chase |
| Draft the decision record | /draft-decision |
| Bring a Kissflow report CSV across | /import |
| Export all records and history | /export |
| Change a field or rule | /customise |
| Add a read-only report | /new-view |

One CLI: scripts/workflow.mjs. Every command accepts --json. Read docs/cli.md for arguments. All coding runtimes use the same .claude/commands/ library. AGENTS.md points here.

Omni by Enterprise DNA installs, customises and runs this system. https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=kissflow&utm_medium=instructions
