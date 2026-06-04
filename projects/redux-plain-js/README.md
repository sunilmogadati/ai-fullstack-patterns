# Redux Toolkit in a plain JavaScript web app

Redux works in any JavaScript app. This project demonstrates every Redux Toolkit primitive (`configureStore`, `createSlice`, `createAsyncThunk`, `dispatch`, `subscribe`, `getState`) without React in the picture.

The point: nothing about RTK requires React. The same store, slices, and async thunks plug into any framework (or no framework at all).

## What's here

```
redux-plain-js/
├── index.html              # entry point with the steps performed by the script
├── package.json
├── vite.config.js
└── src/
    ├── main.js             # wires everything together, runs sync + async demos
    ├── store.js            # configureStore combining the two slices
    ├── commentsSlice.js    # createSlice + createAsyncThunk
    └── usersSlice.js       # createSlice for users (sign in / sign out)
```

## Run it

Requires Node.js 22 or later. From the repo root, `nvm use` will pick the version from `.nvmrc`.

```bash
npm install
npm run dev
```

Vite opens the app in your browser. Open the DevTools console: you'll see the store dispatching actions and the state changing in real time.

## Key patterns demonstrated

- Redux is just JavaScript. No React, no framework. The architecture is portable.
- `createSlice` generates actions and reducers from one declaration.
- `configureStore` wires devtools, middleware, and reducers in one call.
- The store has only three public methods: `dispatch`, `subscribe`, `getState`.
- Immer (built into `createSlice`) converts mutation-style code into immutable state updates.
- `createAsyncThunk` is framework-agnostic. It handles async with auto-generated pending, fulfilled, and rejected actions, no React required.

## Demo flow

`main.js` runs two parts when the page loads.

**Part 1: synchronous actions**
- `comments/addComment` x 2
- `comments/likeComment`
- `users/signIn`
- `comments/removeComment`

**Part 2: async work with `createAsyncThunk`**
- `comments/fetchComments/pending` (immediately)
- `comments/fetchComments/fulfilled` (after the API responds)

Every state transition logs to the console via the subscribed handler.

## Next

See [`react-redux`](../react-redux/) for the same store and thunk wired into a React UI with `useDispatch`, `useSelector`, and `<Provider>`. The Redux side stays identical; only the React integration is new.
