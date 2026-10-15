import { useEffect, useRef } from "react";

import { mountPuff } from "../fur/mount";
import { reduceMotion } from "../lib/motion";

// A furry creature in the hero's empty corner, to stroke and boop. Decorative: it says nothing a
// screen reader needs, and clicks on it are its own, so the mascot is not summoned by them.
const MochiPuff = () => {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => mountPuff(host.current!, { still: reduceMotion }), []);

  return <div ref={host} aria-hidden data-no-mascot className="puff" />;
};

export default MochiPuff;
