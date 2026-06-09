import IdeasPanel from "./IdeasPanel.jsx";
import AIInsightsPanel from "./AIInsightsPanel.jsx";

// Two-panel layout. Ideas on the left (the live brainstorm), AI insights on
// the right (on-demand synthesis).
//
// On narrow screens the panels stack vertically — at this scale of UI it's
// fine; we don't have enough density to fight for horizontal space below
// the lg breakpoint.
export default function BrainstormApp() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:py-12">
      <header className="mb-6 lg:mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Brainwave</h1>
        <p className="text-sm text-muted-foreground">
          Group ideation with on-demand AI synthesis.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_22rem]">
        <IdeasPanel />
        <AIInsightsPanel />
      </div>
    </div>
  );
}
