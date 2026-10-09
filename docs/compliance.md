# Record checks and their limits

Checked 9 October 2026. This is an internal operations approval ledger for one business. It does not certify compliance, provide electronic signatures or approve regulated transactions.

## External rule and implemented check

[New Zealand Privacy Act principle 9](https://www.privacy.org.nz/privacy-principles/9/) limits retention to the continuing lawful purpose. The IPP9-review check flags an arrived review date or missing purpose for a workflow. Dates are set by the operator. There is no universal legal retention interval here. Review records and attachments, agree retention with the responsible person, and use an approved disposal process outside this tool. The check does not establish lawful retention or delete anything.

[Principle 5](https://www.privacy.org.nz/privacy-principles/5/) concerns reasonable safeguards for personal information. Database tables have row-level security enabled and public access revoked. Views use the caller's privileges. There are no public access policies. The embedded database and the owner connection are trusted operator tools, not authentication or a multi-user authorisation system. Before shared use, implement authentication, restricted roles, protected files and backups, and test who can read and change records. This command cannot assess those safeguards.

## Internal controls, not statutory rules

INTERNAL-separation flags a pending reviewer who is also the requester. The decision command refuses that decision. INTERNAL-import flags imported records pending reconciliation. INTERNAL-requester flags missing requester names. Publishing requires at least one step. Submission snapshots the current workflow. Evidence and a note are required for every decision. Rejection cancels later steps. Seven-day draft inactivity is an internal attention threshold, not a legal deadline. Step due dates are calendar days from activation in UTC.

Actor and assignee names are supplied attribution, not verified identities. A trusted operator can reassign a pending step with a reason. Activity rejects updates and deletes, but a database owner can change triggers. This is not a tamper-proof record. Imports preserve all source fields, including personal data, so review what you export and restrict access to the resulting database, drafts and reports.
