# ai-fullstack-patterns

A working lab for the patterns behind shipping AI-enabled web applications.

The goal is to build up the full toolkit needed to ship a production AI-enabled web app. Each project is a self-contained, runnable workspace paired with a doc that explains the *why* alongside the *what*.

## The journey

A suggested progression through the projects. Each one introduces a layer that the next builds on, but folders are named by topic rather than by index, so projects can be added or rearranged without renumbering.

| Project | Status | What it covers |
|---|---|---|
| [`projects/redux-plain-js/`](./projects/redux-plain-js/) | Built | Redux Toolkit in plain JavaScript, no React. `configureStore`, `createSlice`, `createAsyncThunk`, `dispatch`, `subscribe`, `getState`. Console-driven. Proves Redux is framework-agnostic. |
| [`projects/react-redux/`](./projects/react-redux/) | Built | The same store wired into a React UI with `useDispatch`, `useSelector`, and `<Provider>`. Adds `createAsyncThunk` for fetching. Redux DevTools time-travel. |
| `projects/nextjs-app-router/` | Planned | Next.js 14+ App Router fundamentals: routes, layouts, loading states. The baseline for the Next.js projects below. |
| `projects/react-server-components/` | Planned | React Server Components + Server Actions. Where the modern stack starts to leave traditional Redux behind for server-owned state. |
| `projects/tanstack-query/` | Planned | TanStack Query for server data, what most modern production stacks use instead of `createAsyncThunk` for fetching. |
| `projects/fastapi-python-sidecar/` | Planned | FastAPI service for Python ML/AI work. The "split-stack" pattern: TypeScript web plus a Python ML sidecar. |
| `projects/nextjs-fastapi-integration/` | Planned | Full-stack integration. Next.js calling a FastAPI sidecar for AI work, results flowing back through Server Components and Server Actions. |
| `projects/claude-agent-sdk-streaming/` | Planned | Agentic AI in production. Claude Agent SDK with token streaming. |

## What's in this repo (top level)

```
ai-fullstack-patterns/
├── README.md
├── docs/             ← topic docs that pair with the projects
└── projects/         ← runnable code, one folder per topic
```

## How to run any project

**Prerequisites:** Node.js 22 or later. The repo includes an `.nvmrc` file - if you use [nvm](https://github.com/nvm-sh/nvm), running `nvm use` in the repo root will switch to the recommended version automatically.

```bash
cd projects/<project-name>
npm install
npm run dev
```

Each project has its own README with what to look at and what the demo proves.

## How to read the docs

The `docs/` folder contains topic documents in plain Markdown. They render correctly on GitHub (including the inline architecture diagrams) and in any modern Markdown viewer.

## Conventions

- **JavaScript first, TypeScript later.** The early projects use plain JavaScript to keep the code visually clean. Later projects introduce TypeScript alongside Next.js.
- **One concept per project.** Each project introduces one major new idea; earlier projects do not get retroactively modified.
- **Production patterns, not tutorial patterns.** Code reflects what you would actually ship, not the simplest possible thing that runs.
- **No frameworks of frameworks.** No CRA, no Next.js boilerplate generators beyond `create-next-app`. Vite plus raw React, then Vite plus Next.js when we get there.

## License

MIT.
