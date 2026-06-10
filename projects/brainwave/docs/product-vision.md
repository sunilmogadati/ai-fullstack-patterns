# Brainwave — Product Vision

> v0.1 is a small collaborative brainstorming app with an AI synthesis layer. This document describes what it is growing into, and why. The [architecture doc](./architecture.md) describes what is actually built; its §7 tracks which pieces of this vision are in progress.

## The problem

Before any project gets built, somebody has to figure out **what to build**. That phase — discovery — runs on scattered input: workshop notes, stakeholder interviews, email threads, ticket exports, hallway corrections to all of the above. The person responsible (a business analyst, a product owner, a consultancy's delivery lead) ends up with 40 pages of notes that nobody — including them — ever reads *cross-referenced*.

Three failure modes hide in those notes:

1. **Conflicts.** The Sales VP asks for 2-minute mobile claims; the Operations director (in a different meeting, two weeks later) mentions every claim needs a 1-day manual fraud review. Both statements are in the notes. The contradiction is in neither.
2. **Gaps.** In six weeks of meetings, nobody mentioned data migration. Absence doesn't appear in a summary — only in the questions an experienced architect would have asked.
3. **Drift.** Nobody can say whether the group is actually converging on an agreed scope, or just generating more notes.

These surface in month four as change requests, scope fights, and slipped timelines. Most project failures are born in discovery, not in code.

## What Brainwave becomes

A discovery-and-alignment tool: all of that input flows into one place, and an AI layer reads **everything together** — something no human in the process ever does — and maintains a living, versioned report:

- **Themes** — what everyone is asking for, grouped, with every theme citing its sources
- **Conflicts** — cross-stakeholder and cross-document contradictions, tracked to resolution
- **Gaps** — what was never said that should have been
- **Priorities** — a ranked, rationale-attached backlog seed
- **Convergence** — the delta between report versions: *"since v2: 3 conflicts resolved, 1 new"*

The one-line version: **an AI summary tells you what was said; a discovery report tells you what it means, what's missing, who disagrees, and what will bite you in month four.**

## Who it's for

- **Business analysts** — themes become draft requirements; the conflict register becomes the issues log; source citations give traceability (currently hand-maintained in spreadsheets); exports become user stories with acceptance criteria in Jira / Azure DevOps.
- **Product owners** — stakeholder asks and sprint feedback in; prioritized, rationale-attached backlog seed out.
- **Consultancies and delivery leads** — discovery engagements produce a versioned, source-cited, defensible artifact instead of a Word document assembled from notes.

## How it's different from "a meeting with AI summary"

This question is the product's scope filter — features that don't widen this gap don't ship.

1. **The input isn't a meeting.** Weeks of multi-channel input (workshops, interviews, imports, agent follow-ups) — the meeting is one source among many.
2. **Diagnostic, not descriptive.** Conflict detection requires reading statements *against* reference documents (the contradiction is never in one transcript). Gap detection requires a model of what complete discovery looks like.
3. **A system of record, not a memo.** Versioned, structured, scored, diffable — answers "are we converging?", not "what happened Tuesday?"
4. **Traceable.** Every finding cites who said it and where — which is what makes the artifact defensible when scope disputes get expensive.
5. **Active, not passive.** An interviewer agent takes the detected gaps back to stakeholders as questions. The tool runs the discovery method; it doesn't just record it.

## Capability roadmap

Each version introduces one architectural concern, same discipline as the rest of this repo.

| Version | Capability | New concern |
|---|---|---|
| **v0.1** ✅ | Sessions, ideas, three synthesis lenses, output caching, cost capture | The LLM call as ordinary engineering |
| **v0.2** | Bulk ingest (CSV/JSON), semantic dedup, structured JSON outputs, `Report` collection (versioned, diffable) | Embeddings as infrastructure; outputs as data, not prose |
| **v0.3** | Conflict + gap lenses, document grounding with citations, cross-session memory, chat-with-session | RAG (Atlas Vector Search) |
| **v0.4** | Public API (keys, rate limits, `/v1`), Slack connector, webhooks, Jira/Azure DevOps export, report sharing | Productization: auth, multi-tenancy, integration surface |
| **v0.5** | MCP server (sessions + lenses as tools), interviewer agent | The agent loop |

## Open-core intent

The engine — sessions, ingestion, synthesis pipeline, report infrastructure, connectors — is open source and welcomes contribution. The domain expertise that makes the diagnostic lenses good — what counts as a conflict, what a complete discovery covers, how priorities should be argued — is the proprietary layer. The same split as any open-core product: the machine is open, the judgment is the product.
