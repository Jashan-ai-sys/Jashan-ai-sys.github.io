import { Suspense, lazy, useEffect, useState } from "react";

import { HERO, MARQUEE } from "../constants";

// The 3D scene pulls in three.js, so it loads after the text has painted.
const PhoneCanvas = lazy(() => import("./canvas/phone"));

const TIME_FORMAT = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
});

const useClock = () => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return TIME_FORMAT.format(now);
};

// Hero
export const Hero = () => {
  const clock = useClock();
  // performance.now() at the moment the visitor answered the phone, or null while it rings
  const [answeredAt, setAnsweredAt] = useState<number | null>(null);

  return (
    <section className="studio relative w-full md:h-dvh md:min-h-[760px] overflow-hidden">
      <Suspense fallback={<div className="h-[400px] md:hidden" />}>
        <PhoneCanvas
          answeredAt={answeredAt}
          onToggle={() =>
            setAnsweredAt((current) => (current === null ? performance.now() : null))
          }
        />
      </Suspense>

      {/* Name badges */}
      <div className="hidden md:flex absolute top-20 right-12 flex-col items-end gap-1.5 pointer-events-none">
        <span className="label-box">Jashanprit Singh</span>
        <span className="label-box">AI Engineer</span>
        <span className="label-box tabular-nums">{clock} IST</span>
      </div>

      {/* Pitch */}
      <div className="relative px-6 pb-24 md:px-0 md:pb-0 md:absolute md:bottom-24 md:left-12 md:max-w-[44%] pointer-events-none">
        <h1 className="text-[48px] sm:text-[72px] lg:text-[88px]">
          {HERO.headline}
          <span className="text-teal"> {HERO.headlineAccent}</span>
        </h1>
        <p className="mt-5 max-w-[52ch] text-[17px] leading-7 text-mute">
          {HERO.summary}
        </p>
        <div className="mt-7 flex flex-wrap gap-3 pointer-events-auto">
          <a href="#work" className="button button-solid">
            See the work
          </a>
          <a href="#contact" className="button button-outline">
            Get in touch
          </a>
        </div>
      </div>

      {/* Scene hint */}
      <span className="label-box absolute top-[350px] md:top-auto md:bottom-28 right-6 md:right-12 pointer-events-none">
        {answeredAt === null ? "Click the phone to answer" : "Click again to hang up"}
      </span>

      {/* Skills strip */}
      <div className="absolute bottom-0 inset-x-0 border-y border-line bg-panel/70 overflow-hidden py-3">
        <ul className="marquee font-mono text-[13px] uppercase tracking-widest text-mute">
          {[...MARQUEE, ...MARQUEE].map((item, i) => (
            <li key={i} className="px-7" aria-hidden={i >= MARQUEE.length}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
