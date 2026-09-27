import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  /** Called with a reset key change (e.g. switching decks) to clear a previous error automatically. */
  resetKey?: string;
  onReset?: () => void;
}

interface State {
  error: Error | null;
}

/**
 * Wraps a single game engine. If Foreplay Roulette's physics loop or any
 * other game throws, this catches it and offers a way back to the deck
 * list instead of taking the whole app down to a blank screen.
 *
 * Deliberately scoped to one game at a time — the shell (header, ribbon,
 * safeword bar) stays outside this boundary, so the safeword is still
 * reachable even if the game body itself is broken.
 */
export class GameErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Intentionally minimal: no remote logging, nothing that phones home.
    // eslint-disable-next-line no-console
    console.error("Lace game engine crashed:", error, info.componentStack);
  }

  componentDidUpdate(prevProps: Props) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-full border border-stop/30 text-stop">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            </svg>
          </div>
          <p className="font-display text-[18px] font-medium">This game hit a snag</p>
          <p className="max-w-[240px] text-[12.5px] leading-relaxed text-silk-faint">
            Blame the compiler, not each other. Profiles and limits are fine. Safeword below still works.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              this.setState({ error: null });
              this.props.onReset?.();
            }}
          >
            Back to decks
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
