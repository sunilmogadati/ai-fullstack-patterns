# Redux Toolkit with React

The same store as the `redux-plain-js` project, now wired into a React UI using `useDispatch` and `useSelector`. Includes `createAsyncThunk` for fetching initial data.

## What's here

```
react-redux/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx                       # React entry: ReactDOM + <Provider store={store}>
    ├── App.jsx                        # root component
    ├── store.js                       # configureStore
    └── features/comments/
        ├── commentsSlice.js           # createSlice + createAsyncThunk
        └── CommentsList.jsx           # useSelector + useDispatch in action
```

## Run it

```bash
npm install
npm run dev
```

Vite opens the app at `http://localhost:5174`. Install the Redux DevTools browser extension and open it from your DevTools panel: you'll see every action dispatched and can time-travel through state changes.

## What this teaches

- `<Provider store={store}>` at the root makes the store available to every component below.
- `useSelector(state => state.comments.items)` subscribes to a slice of state. Re-renders when (and only when) the returned value changes.
- `useDispatch()` returns the dispatch function used to fire actions.
- `createAsyncThunk` models async work with auto-generated pending, fulfilled, and rejected actions.
- `extraReducers` handles thunk lifecycle actions inside the slice that owns the data.

## What to look at in the code

Walk through the files in this order:

1. `src/features/comments/commentsSlice.js`: `createSlice` (sync reducers) and `createAsyncThunk` (async).
2. `src/store.js`: `configureStore` bundles the slice into the store.
3. `src/main.jsx`: `<Provider>` wraps the app and makes the store available to every component below.
4. `src/features/comments/CommentsList.jsx`: `useSelector` reads from the store, `useDispatch` fires actions.

This is the canonical RTK + React build order: define slices first, bundle them in a store, expose the store to React with `<Provider>`, then read and write inside components with the hooks.

## What to demo with Redux DevTools open

1. Reload the page. See `comments/fetchComments/pending` then `comments/fetchComments/fulfilled` fire.
2. Type a comment and click Add. See `comments/addComment` fire.
3. Click Like on a comment. See `comments/likeComment` fire.
4. Click Remove. See `comments/removeComment` fire.
5. Time-travel: click any prior action in DevTools. The UI rewinds.

## Next

A future Next.js project will rebuild this with Server Components and Server Actions, showing where Redux still fits and where Server Components replace it.
