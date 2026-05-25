import CommentsList from "./features/comments/CommentsList.jsx";

// Root component of the app. In this small demo it just renders the CommentsList
// feature. In a larger app, App would compose multiple feature components, handle
// routing between pages, and own any layout chrome (header, nav, footer, etc.).
export default function App() {
  return <CommentsList />;
}
