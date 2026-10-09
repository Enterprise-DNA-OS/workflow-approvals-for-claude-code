# CLI reference

Run npm run workflow -- <command> with flags in --name=value form. Every command accepts --json. Case-insensitive names and ID prefixes work. Ambiguous matches list candidates and exit 1. All timestamps and calendar-day deadlines use UTC. Local mode is single-process.

## workflows

Review process owners, volumes and retention review dates.

```bash
npm run workflow -- workflows
```

## steps

Read the approval sequence.

```bash
npm run workflow -- steps --workflow="Client onboarding"
```

## requests

Review the request register.

```bash
npm run workflow -- requests
```

## inbox

Review decisions waiting for an owner.

```bash
npm run workflow -- inbox
```

## overdue

Chase overdue approvals.

```bash
npm run workflow -- overdue
```

## workload

Balance pending decisions by reviewer.

```bash
npm run workflow -- workload
```

## bottlenecks

Find the process steps holding work.

```bash
npm run workflow -- bottlenecks
```

## cycle-times

Review completed request turnaround.

```bash
npm run workflow -- cycle-times
```

## decisions

Read decisions and their evidence.

```bash
npm run workflow -- decisions
```

## attention

Find overdue approvals, stale drafts and unreviewed imports.

```bash
npm run workflow -- attention
```

## compliance

Check retention reviews and internal approval controls.

```bash
npm run workflow -- compliance
```

## request

Read a request with its steps and history.

```bash
npm run workflow -- request --request="Harbour Advisory handover"
```

## history

Read the append-only request history.

```bash
npm run workflow -- history --request="Harbour Advisory handover"
```

## weekly-review

Prepare the weekly approval meeting.

```bash
npm run workflow -- weekly-review
```

## add-workflow

Define a new approval process.

```bash
npm run workflow -- add-workflow --name="New approval process" --owner="Morgan" --purpose="Review ongoing need for internal records" --review-due="2027-01-31" --actor="Morgan"
```

## add-step

Add a step before publishing the process.

```bash
npm run workflow -- add-step --workflow="Client onboarding" --name="New approval process" --assignee="Taylor" --days="2" --actor="Morgan"
```

## publish-workflow

Freeze the approval sequence for use.

```bash
npm run workflow -- publish-workflow --workflow="Client onboarding" --actor="Morgan"
```

## add-request

Record an internal request.

```bash
npm run workflow -- add-request --workflow="Client onboarding" --title="New client handover" --requester="Alex" --detail="Service scope and evidence reference" --actor="Morgan"
```

## submit

Begin an approval sequence.

```bash
npm run workflow -- submit --request="Harbour Advisory handover" --actor="Morgan"
```

## decide

Record the assigned reviewer decision.

```bash
npm run workflow -- decide --request="Harbour Advisory handover" --decision="approve" --evidence="scope-reference" --note="Reviewed by the responsible person" --actor="Morgan"
```

## reassign

Hand the pending decision to another reviewer.

```bash
npm run workflow -- reassign --request="Harbour Advisory handover" --assignee="Taylor" --note="Reviewed by the responsible person" --actor="Morgan"
```

## review-data

Record the next purpose and retention review.

```bash
npm run workflow -- review-data --workflow="Client onboarding" --purpose="Review ongoing need for internal records" --review-due="2027-01-31" --actor="Morgan"
```

## log

Record an operator note.

```bash
npm run workflow -- log --request="Harbour Advisory handover" --note="Reviewed by the responsible person" --actor="Morgan"
```

## draft-chase

Draft a follow-up for an overdue request.

```bash
npm run workflow -- draft-chase --request="Harbour Advisory handover"
```

## draft-decision

Draft the decision record.

```bash
npm run workflow -- draft-decision --request="Harbour Advisory handover"
```

## import

Bring a Kissflow report CSV across.

```bash
npm run workflow -- import kissflow --workflow="Client onboarding" --file="imports/requests.csv" --actor="Morgan"
```

## export

Export all records and history.

```bash
npm run workflow -- export --file="exports/backup.json"
```

## help

Read available commands.

```bash
npm run workflow -- help
```

Import accepts --mapping=<file> and --dry-run. Source status is preserved without fabricating prior approvals. Due days begin when each sequential step becomes pending. Mean turnaround is computed only from locally submitted and closed requests, in hours. Bottleneck age is the current step age. Workflow changes do not change existing tasks. Decisions and activity are retained. Reassignment preserves the current deadline.
