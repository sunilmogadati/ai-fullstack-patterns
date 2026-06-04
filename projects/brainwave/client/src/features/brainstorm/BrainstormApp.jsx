import IdeasPanel from "./IdeasPanel.jsx";

// Top-level layout. v0 has only the left panel (ideas). v0.1 will add the
// right panel for AI insights — same architectural seam (the AI is just
// another async slice) so adding it later does not reshape the layout.
export default function BrainstormApp() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <IdeasPanel />
    </div>
  );
}
