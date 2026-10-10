import { Component, Suspense, type ReactNode } from "react";

type OptionalProps = {
  children: ReactNode;
  // Shown while the part is loading
  fallback?: ReactNode;
};

// Wraps a decorative part of the page (the 3D scene, the mascot). Nothing shows while it loads, and
// if it throws while drawing, only that part disappears instead of the whole page going blank.
export class Optional extends Component<OptionalProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) return null;
    return <Suspense fallback={this.props.fallback ?? null}>{this.props.children}</Suspense>;
  }
}
