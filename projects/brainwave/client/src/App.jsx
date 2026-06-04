import BrainstormApp from "./features/brainstorm/BrainstormApp.jsx";

// Root layout — full-viewport background anchored to the shadcn palette.
export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <BrainstormApp />
    </div>
  );
}
