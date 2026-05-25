import store from "./store.js";
import {
  addComment,
  likeComment,
  removeComment,
  fetchComments,
} from "./commentsSlice.js";
import { signIn } from "./usersSlice.js";

// Expose the store globally so you can experiment from the console.
window.store = store;
window.fetchComments = fetchComments;

console.log("--- Initial state ---");
console.log(store.getState());

// Subscribe so every dispatched action logs the resulting state.
const unsubscribe = store.subscribe(() => {
  console.log("--- State changed ---");
  console.log(store.getState());
});

// =====================================================
// PART 1 -- Synchronous actions (createSlice reducers)
// =====================================================

console.log("\n--- Dispatching comments/addComment ---");
store.dispatch(addComment({ text: "Great answer!" }));

console.log("\n--- Dispatching comments/addComment again ---");
store.dispatch(addComment({ text: "Could you elaborate?" }));

console.log("\n--- Dispatching comments/likeComment for id=1000 ---");
store.dispatch(likeComment({ id: 1000 }));

console.log("\n--- Dispatching users/signIn ---");
store.dispatch(signIn({ id: 42, name: "Sunil" }));

console.log("\n--- Dispatching comments/removeComment for id=1001 ---");
store.dispatch(removeComment({ id: 1001 }));

// =====================================================
// PART 2 -- Async work with createAsyncThunk
// =====================================================
//
// createAsyncThunk has nothing to do with React. It's pure Redux.
// Dispatching it kicks off the pending/fulfilled/rejected lifecycle.
// The subscribe handler above will log each state transition.

console.log("\n--- Dispatching comments/fetchComments (async) ---");
const promise = store.dispatch(fetchComments());

// The dispatched thunk returns a promise so you can await completion.
promise.then((result) => {
  console.log("\n--- Thunk completed ---");
  console.log("Result:", result);
  console.log("Final state:", store.getState());

  // Stop logging after the async work finishes.
  unsubscribe();

  console.log("\n--- Subscriptions stopped. Store still works. ---");
  console.log("\nTry this in the console to see cross-slice listening in action:");
  console.log('  store.dispatch({ type: "users/signOut" })  // signs out user AND clears comments');
  console.log("  store.getState()");
});
