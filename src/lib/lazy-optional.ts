import { lazy, type ComponentType } from "react";

// Resolves once the browser has nothing more urgent to do, or after two seconds at the latest
const whenIdle = () =>
  new Promise<void>((resolve) => {
    if ("requestIdleCallback" in window) requestIdleCallback(() => resolve(), { timeout: 2000 });
    else setTimeout(resolve, 200);
  });

// Loads a decorative component once the page has painted and the browser is idle. If its download
// fails (a stale cached page after a deploy, a blocker, a bad network) it renders nothing instead
// of taking the page down.
export const lazyOptional = <P>(load: () => Promise<{ default: ComponentType<P> }>) =>
  lazy(() =>
    whenIdle()
      .then(load)
      .catch(() => ({ default: (() => null) as ComponentType<P> })),
  );
