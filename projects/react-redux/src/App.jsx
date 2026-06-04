import CommentsList from "./features/comments/CommentsList.jsx";

// Root component of the app. In this small demo it just renders the CommentsList
// feature. In a larger app, App would compose multiple feature components, handle
// routing between pages, and own any layout chrome (header, nav, footer, etc.).
//
// The min-h-screen wrapper anchors the background-color from index.css to the
// full viewport so the page reads as a single canvas, not a card on a white box.
export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <CommentsList />
    </div>
  );
}
