# Workflow Approvals for Claude Code

Know who is waiting, which approval is late and why each decision was made. An MIT-licensed database and command set for internal requests. Works with Claude Code, Codex, OpenCode or Cursor.

| Do it yourself | We customise it | We run it for you |
|---|---|---|
| Free. Try the demo and import a Kissflow report CSV. | Your fields, approval rules, history, web front end or different stack. | Installed, connected and operated through Omni by Enterprise DNA. One setup fee, then a retainer. |
| [Quick start](#quick-start) | [Get your version built](https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=kissflow&utm_medium=customise) | [Book a call](https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=kissflow&utm_medium=managed) |

## The weekly operations meeting

Five rituals: review incoming requests, check the evidence, record each approval, chase overdue decisions and review the completed work. The fictional Harbour Operations demo has an overdue client handover, an inactive draft, a policy exception and an overdue retention review.

## Quick start

Node 20 or later, on Windows or Linux:

```bash
git clone https://github.com/Enterprise-DNA-OS/workflow-approvals-for-claude-code.git
cd workflow-approvals-for-claude-code
npm install
npm run demo
npm test
npm run view
npm run docs
```

PGlite runs locally in .data/db. DATABASE_URL selects Postgres 15 or later with verified TLS. Local mode supports one process. For real records use a fresh DATA_DIR, migrate without seed and define your workflows. Keep demo records separate. Shared use requires authenticated operators, restricted database roles and protected backups. Actor names are attribution, not authentication. This base does not send alerts or run background jobs.

There are 28 CLI commands including help and 29 slash recipes including /customise and /new-view. [CLI reference](docs/cli.md).

## Approval rules that preserve history

A workflow freezes when published. Submission snapshots its steps. The next step opens only after approval and receives its own calendar-day deadline. Evidence and a note are required. A requester cannot decide their own request. Rejection cancels later steps. Completed tasks and activity cannot be edited through the tool. A database owner can still change the software, so this is not a tamper-proof archive or a signature service.

## Ten questions beyond a fixed report

Kissflow already offers configurable reports. These questions demonstrate shipped queries, not an unsupported claim that its product cannot answer them.

1. Which handovers are waiting on the same reviewer? workload
2. Which approval steps have the oldest pending work? bottlenecks
3. Which requests have crossed their current deadline? overdue
4. Which draft handovers have been untouched for a week? attention
5. Who approved each step and what evidence did they record? decisions
6. Which imported requests still need reconciliation? compliance
7. Which reviewer is also the person who raised the request? compliance
8. Which processes need their data-retention purpose reviewed? compliance
9. How long did locally completed approvals take? cycle-times
10. What changed between the original request and the final decision? request

## Your first hour: ten things to ask for

1. Put our business name and colours on the decision pack.
2. Show who has overdue approvals.
3. Read the handover evidence before deciding.
4. Draft a follow-up for the current reviewer.
5. Check our export without saving it.
6. Map our report headings and reconcile imported records.
7. Define our approval sequence and publish it for use.
8. Submit a known pending request and test each decision.
9. Add our request category with /customise.
10. Add a weekly owner report with /new-view.

## Paperwork and views

brand.json controls logo, colours and business name. npm run docs creates decision records and workflow review packs. npm run view creates the approval desk and workflow register. Drafts stay in drafts/. Protect these files as private business records.

[Record checks](docs/compliance.md) distinguish privacy review reminders from internal approval policy. [Why no front end](docs/why-no-front-end.md) explains mobile, offline and interactive needs. Nothing sends, signs a regulated approval, moves money or calls a vendor system.

## Move from Kissflow

[The replacement guide](docs/replace-kissflow.md) explains the flat CSV import, optional heading mapping, test run, repeat imports and reconciliation. All source fields are preserved. Imported records require review. Workflow designs, attachments, integrations, identities and historical decisions require a separate migration. This is an internal approval base, not the whole Kissflow application platform.

## Verification

npm test uses a temporary database, exercises every command and checks sequential decisions, rejection, self-approval refusal, immutable history, dry runs, rollback, repeat imports, custom headings, ambiguity, branded documents and JSON exports. CI defines Windows and Linux runs plus an empty disposable Postgres database. Local verification results are recorded in docs/verification.md.

MIT licence. Not affiliated with Kissflow or Anthropic. Hosting and coding-agent usage carry their own costs. [Research](docs/research.md). [Book 30 minutes with Sam](https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=kissflow&utm_medium=readme).
