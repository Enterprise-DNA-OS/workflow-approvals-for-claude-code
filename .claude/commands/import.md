---
description: "Bring a Kissflow report CSV across"
---

# Bring a Kissflow report CSV across

Read CLAUDE.md first. Use the real names and arguments supplied by the operator. Never invent a record or evidence.

```bash
npm run workflow -- import kissflow --workflow="Client onboarding" --file="imports/requests.csv" --actor="Morgan"
```

Read docs/replace-kissflow.md. Inspect the headers. Run with --dry-run before committing the import, reconcile counts and IDs, and leave historical completed items as imported history. Add --mapping only for agreed custom headers.
