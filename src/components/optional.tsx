import { Component, Suspense, type ReactNode } from "react";

// Wraps a decorative part of the page (the mascot). Nothing shows while it loads, and if it throws
// while drawing, only that part disappears instead of the whole page going blank.
export class Optional extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) return null;
    return <Suspense fallback={null}>{this.props.children}</Suspense>;
  }
}
