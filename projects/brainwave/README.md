# Brainwave

A small collaborative brainstorming app. A group of friends — three to six people — pools ideas for a shared decision: where to travel, what features to prioritize, what to do for a birthday. They each add ideas. They like each other's ideas. At any point, an LLM sits on top and offers three lenses:

1. **Summarize** — the themes the brainstorm keeps returning to
2. **Prioritize** — the top-ranked ideas considering likes plus practical feasibility
3. **Patterns** — what the group seems to value, based on what they have liked

Same architectural skeleton as the [`react-redux`](../react-redux/) + [`express-comments-api`](../express-comments-api/) projects, with **one new layer** — the LLM call from the backend, via AWS Bedrock. This is the bridge between a pure-CRUD full-stack app and a full agentic system.

**Architecture reference:** [`docs/architecture.md`](./docs/architecture.md) — system + sequence diagrams (Mermaid), tech stack, model routing, and the full decision matrix (every significant choice, the alternative it beat, and why).

**Product vision:** [`docs/product-vision.md`](./docs/product-vision.md) — where this is heading: from brainstorm-with-AI-summary to a discovery-and-alignment tool for BAs, product owners, and delivery leads (conflict detection, gap detection, versioned reports). The capability roadmap (v0.2–v0.5) lives there; architecture §7 tracks the planned decisions.

> **Where this sits in the journey.** Brainwave is the second project in the AI-fullstack progression — `react-redux` + `express-comments-api` is the foundation (no AI); Brainwave adds the LLM layer; the future `customer-support-agent` project (planned) adds the agent loop, tool integration via MCP, and PII redaction. Each project introduces exactly one new architectural concern. The patterns transfer.

## Key patterns demonstrated

The senior-grade takeaways from working through this code:

- **The LLM call is just another async lifecycle.** Same `pending / fulfilled / rejected` shape as `fetchComments`. No new Redux pattern; the existing pattern absorbs the AI work cleanly.
- **Pessimistic is the right default for LLM calls.** You cannot predict LLM output, so you cannot optimistically render it. Show a spinner; wait for the response.
- **AI outputs should be cached.** A summary regenerated on every page reload would be expensive and slow. Cache in the database with `basedOnIdeaCount` so the UI can subtly warn the user when the cache is stale.
- **Prompt engineering is code.** The three prompts live in `server/lib/prompts.js`. They are reviewed in PRs like any other source. Not hand-tuned in a runtime admin panel.
- **The HTTP boundary is unchanged.** All the middleware-order, validation-layering, and centralized-error patterns from the comments-app project apply identically.
- **Bedrock is the production-aligned LLM access path.** Same SDK pattern (`AnthropicBedrock` from `@anthropic-ai/bedrock-sdk`) used by enterprise CSI deployments.

Full discussion in [`docs/ai-augmentation-patterns.md`](../../docs/ai-augmentation-patterns.md) *(to be written)*.

## What's here

```
brainwave/
├── package.json
├── .env.example                       # MongoDB + AWS Bedrock contract
├── server/
│   ├── server.js                      # Express entry
│   ├── db.js                          # Mongoose connection
│   ├── seed.js                        # one Bali Trip session with sample ideas
│   ├── lib/
│   │   ├── claude.js                  # AnthropicBedrock client wrapper
│   │   └── prompts.js                 # the three prompts as exported strings
│   ├── models/
│   │   ├── Session.js
│   │   ├── Idea.js
│   │   └── AIOutput.js
│   ├── routes/
│   │   ├── sessions.js                # CRUD on session + ideas + likes
│   │   └── ai.js                      # summarize / prioritize / patterns
│   └── middleware/
│       ├── errorHandler.js
│       └── validate.js
└── client/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css                  # shadcn neutral palette
        ├── lib/utils.js               # cn() helper
        ├── components/ui/             # Button, Input, Card from shadcn
        ├── features/brainstorm/
        │   ├── brainstormSlice.js
        │   ├── IdeasPanel.jsx
        │   ├── AIInsightsPanel.jsx
        │   └── BrainstormApp.jsx
        └── store.js
```

## Prerequisites

- Node.js 22+ (the repo `.nvmrc` will pick this up via `nvm use`)
- MongoDB running locally or in Docker
- AWS account with Bedrock access enabled for Anthropic Claude models in `us-west-2`
- AWS credentials available via `AWS_PROFILE`, environment variables, or IAM role

For local development, the simplest setup is `AWS_PROFILE=<your-profile>` in `.env` and a valid `~/.aws/credentials` file with Bedrock permissions.

### AWS Bedrock setup notes

If the AI endpoints return `403 "The security token included in the request is invalid"`, the AWS SDK is not picking up valid credentials. Things to check:

1. **Model access enabled.** In AWS Console → Bedrock → Model access, verify the Anthropic Claude models in the `BEDROCK_MODEL_HAIKU` / `BEDROCK_MODEL_SONNET` env vars are toggled on for your account.
2. **Model IDs match what your account has.** Bedrock model IDs include a date suffix (e.g., `anthropic.claude-haiku-4-5-20251001-v1:0`). Different AWS accounts have different generations enabled. Adjust the env vars to the IDs your account actually shows.
3. **Credentials path.** The SDK uses the standard AWS credential chain. `AWS_PROFILE=<your-profile>` in `.env` is usually the cleanest; alternatively `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` (+ `AWS_SESSION_TOKEN` if assuming a role).
4. **Region matches the model.** `AWS_REGION` in `.env` must match a region where the model ID is available. Anthropic Claude on Bedrock is widely available in `us-west-2` and `us-east-1`; other regions vary.

Once credentials are good, the three AI routes (`POST /sessions/:id/ai/{summarize,prioritize,patterns}`) return real Claude output rendered in the AI Insights panel.

## Run it

```bash
nvm use
cp .env.example .env       # fill in MONGODB_URI and AWS_REGION at minimum
npm install
npm run seed               # create the Bali Trip session with sample ideas
npm run dev:server         # backend on port 3002
# in another terminal
npm run dev:client         # frontend on port 5175
```

You should see the Bali Trip session with 8-12 seeded ideas in the left panel. The right panel will be empty until you click *Generate summary* (or *Prioritize*, or *Patterns*).

## Endpoints

| Method | Path | Body | Returns |
|---|---|---|---|
| GET    | `/sessions/:id` | — | `{ session, ideas, aiOutputs }` |
| POST   | `/sessions/:id/ideas` | `{ author, text }` | `201 Idea` |
| PATCH  | `/sessions/:id/ideas/:ideaId/like` | `{ member }` | `Idea` (toggled) |
| POST   | `/sessions/:id/ai/summarize` | — | `AIOutput` |
| POST   | `/sessions/:id/ai/prioritize` | — | `AIOutput` |
| POST   | `/sessions/:id/ai/patterns` | — | `AIOutput` |

Plus a health endpoint at `/health`.

Every error response uses the same shape, regardless of where it originated:

```json
{ "error": { "status": 400, "message": "text cannot be empty" } }
```

## How this connects to the rest of the repo

- The [`react-redux`](../react-redux/) project is the React + Redux + thunks foundation. Brainwave's `brainstormSlice.js` is the same pattern, extended.
- The [`express-comments-api`](../express-comments-api/) project is the Express + Mongoose + middleware foundation. Brainwave's backend is the same shape, plus the AI routes and the Bedrock layer.
- The [`docs/full-stack-integration.md`](../../docs/full-stack-integration.md) document covers the integration patterns (optimistic vs pessimistic, where state lives, the rollback discipline) that Brainwave reuses directly.
- The [`docs/ai-augmentation-patterns.md`](../../docs/ai-augmentation-patterns.md) document *(to be written alongside this project)* covers the new patterns: where the LLM call lives, prompt engineering as code, caching AI outputs, when to consider streaming.

## What's NOT in v0 (deferred)

- Real authentication (just trust the `member` name field for now)
- Real-time multi-user updates (refresh-to-see-changes is fine for v0)
- Streaming AI responses (return the full text; add streaming in v0.1)
- Multiple sessions per user (one Bali Trip session is enough)
- MCP tool integration (that comes in the future agent project)
- PII redaction (worth flagging as a v0 limitation for any real deployment)

## License

MIT.
