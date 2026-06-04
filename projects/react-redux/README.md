# Redux Toolkit with React

The same store as the `redux-plain-js` project, now wired into a React UI using `useDispatch` and `useSelector`. Every mutation — fetch, add, like, remove — is a `createAsyncThunk` that talks to the [`express-comments-api`](../express-comments-api/) backend running on port 3001. The `like` thunk uses an optimistic-update pattern; the others are pessimistic.

> **Run the backend first.** The app expects `express-comments-api` to be running on `http://localhost:3001`. See [its README](../express-comments-api/README.md) for setup. The integration story (where state lives, optimistic vs pessimistic, error recovery) is in [`docs/full-stack-integration.md`](../../docs/full-stack-integration.md).

## What's here

```
react-redux/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js                 # shadcn "new-york" style, neutral base
├── postcss.config.js
└── src/
    ├── main.jsx                       # React entry: ReactDOM + <Provider store={store}>
    ├── App.jsx                        # root layout (min-h-screen + bg-background)
    ├── index.css                      # Tailwind directives + shadcn CSS variables
    ├── store.js                       # configureStore
    ├── lib/
    │   └── utils.js                   # cn() helper — clsx + tailwind-merge
    ├── components/ui/
    │   ├── button.jsx                 # shadcn Button (cva variants: default, ghost, ...)
    │   ├── input.jsx                  # shadcn Input
    │   └── card.jsx                   # shadcn Card family
    └── features/comments/
        ├── commentsSlice.js           # 4 createAsyncThunks (fetch/add/like/remove)
        └── CommentsList.jsx           # useSelector + useDispatch + shadcn UI
```

## UI library

This project uses **Tailwind CSS + shadcn/ui** ("new-york" style, neutral base color). That stack is the production default for new React apps in 2026. The reasons it wins over alternatives:

| Alternative | When it still fits |
|---|---|
| Material-UI | Internal tools where you want enterprise-default look-and-feel cheaply. |
| Bootstrap | Existing Bootstrap codebases, or when designers think in Bootstrap. |
| CSS Modules | Older codebases; teams that prefer file-per-component styling. |
| Emotion / styled-components | CSS-in-JS shops; some advantages with runtime theming. |

shadcn/ui is unusual in that it is **not** an npm-installable component library — it is a set of source files you copy into your repo and own. The Button, Input, and Card components in `src/components/ui/` are part of *this codebase*, not part of a vendored package. That means you can modify them freely and there is never a breaking-upgrade dance.

## Run it

Requires Node.js 22 or later. From the repo root, `nvm use` will pick the version from `.nvmrc`.

```bash
npm install
npm run dev
```

Vite opens the app at `http://localhost:5174`. Install the Redux DevTools browser extension and open it from your DevTools panel: you'll see every action dispatched and can time-travel through state changes.

## Key patterns demonstrated

- `<Provider store={store}>` at the root makes the store available to every component below.
- `useSelector(state => state.comments.items)` subscribes to a slice of state. Re-renders when (and only when) the returned value changes.
- `useDispatch()` returns the dispatch function used to fire actions.
- `createAsyncThunk` models async work with auto-generated pending, fulfilled, and rejected actions — three actions per round-trip, all visible in Redux DevTools.
- `extraReducers` handles thunk lifecycle actions inside the slice that owns the data.
- **Optimistic vs pessimistic updates.** The `like` thunk increments in `pending` and rolls back in `rejected`. The others wait for `fulfilled`. Picking the right strategy per operation is a real design decision, not a polish choice.

## What to look at in the code

Walk through the files in this order:

1. `src/features/comments/commentsSlice.js`: four `createAsyncThunk`s (fetch / add / like / remove) and the `extraReducers` block that handles all twelve lifecycle actions.
2. `src/store.js`: `configureStore` bundles the slice into the store.
3. `src/main.jsx`: `<Provider>` wraps the app and makes the store available to every component below.
4. `src/features/comments/CommentsList.jsx`: `useSelector` reads from the store, `useDispatch` fires thunks. Note the component is **unchanged from the sync-reducer version** — `dispatch(thunk(payload))` looks the same as `dispatch(action(payload))` from a component's view.

This is the canonical RTK + React build order: define slices first, bundle them in a store, expose the store to React with `<Provider>`, then read and write inside components with the hooks.

## What to demo with Redux DevTools open

1. Reload the page. See `comments/fetchComments/pending` then `comments/fetchComments/fulfilled` fire.
2. Type a comment and click Add. See `comments/addComment/pending` → `/fulfilled`, then the new item appears at the top.
3. Click Like on a comment. See `comments/likeComment/pending` (likes count jumps optimistically) → `/fulfilled` (server confirms; count stays).
4. Stop the backend (`Ctrl-C` the `express-comments-api` terminal). Click Like again. See `pending` → `rejected`, and the optimistic increment rolls back.
5. Click Remove. See `comments/removeComment/pending` → `/fulfilled`, then the item disappears.
6. Time-travel: click any prior action in DevTools. The UI rewinds.

## Next

A future Next.js project will rebuild this with Server Components and Server Actions, showing where Redux still fits and where Server Components replace it.
