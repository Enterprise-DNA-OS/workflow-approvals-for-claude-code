# Bring Kissflow report records across

Verified 9 October 2026: [Kissflow reports overview](https://kfdocs.kissflow.com/help/docs/build/processes/reports-overview). Reports supports tabular and All Items CSV or JSON export. The vendor emails a download link. A simple CSV is limited to process forms with at most one table. Multiple tables or selected workflow steps can require multiple CSV files or JSON. This importer accepts a flat CSV only.

## Export and map

Open the process, choose Reports, then its All Items or a tabular report. Include the unique item ID, name, requester, description and source status. Export through More options. Report headings depend on the process configuration, so the supplied fictional CSV is an example, not a vendor-issued standard export. Inspect your own headings. Use examples/mapping.json to map custom labels to id, title, requester, detail and status. Unmapped columns are retained in source_data.

Create a fresh data directory, migrate without seed, and define the destination workflow using add-workflow, add-step and publish-workflow. Then use one import command:

```bash
npm run workflow -- import kissflow --workflow="Client onboarding" --file=imports/requests.csv --actor="Morgan" --dry-run
npm run workflow -- import kissflow --workflow="Client onboarding" --file=imports/requests.csv --actor="Morgan"
```

Add --mapping=examples/mapping.json to either command if needed. The test run validates and rolls back the entire file. A later bad row rolls back earlier rows. Duplicate source IDs, malformed CSV and missing IDs or titles fail. IDs are scoped to the destination workflow. An unchanged import is a no-op. A changed row updates an imported record, but never overwrites a record already submitted locally.

| Source heading or mapping key | What carries across |
|---|---|
| ID, _id, Item ID, Request ID or mapped id | Stable source identifier |
| Name, Title, Request name or mapped title | Request title |
| Requester, Created by or mapped requester | Requester label |
| Description, Detail or mapped detail | Request description |
| Status, State or mapped status | Original status retained as text |
| All columns | Original source data preserved |

Every imported record starts in imported state, including those marked Completed by Kissflow. No prior decision, signature, approval identity or completion time is invented. Do not submit historical completed requests as new approvals. Keep these as imported history or agree a separate historical migration. For genuinely pending requests, reconcile the source, confirm the new workflow and requester, then submit them locally. Missing requester or detail blocks submission; correct the source mapping and re-import before local use.

## Reconcile and trial

Compare IDs, counts, titles, requester labels, descriptions and all source columns. A CSV alone cannot reproduce workflow definitions, conditional logic, attachments, comments, historical approvals, identity controls, integrations or external portals. Archive and map those separately. Work through a known pending request in both systems and compare decisions and document output before cancelling a contract. One day is a trial of the supported record import, not a promise to migrate every application.

The export command writes a full JSON snapshot of all five data collections, including tasks and activity. It is a private backup artifact, not a Kissflow import file. Use a reviewed database backup and restore process for production recovery. Enterprise DNA maps broader history and connections as part of an agreed migration.
