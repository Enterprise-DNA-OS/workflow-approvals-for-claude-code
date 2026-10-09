---
description: "Record the assigned reviewer decision"
---

# Record the assigned reviewer decision

Read CLAUDE.md first. Read the full request first with the request command. Use the real names and arguments supplied by the operator. Never invent a record or evidence.

```bash
npm run workflow -- decide --request="Harbour Advisory handover" --decision="approve" --evidence="scope-reference" --note="Reviewed by the responsible person" --actor="Morgan"
```

Get the actual assigned reviewer decision, note and evidence. An actor label is not authentication. Do not turn an agent recommendation into a human approval.
