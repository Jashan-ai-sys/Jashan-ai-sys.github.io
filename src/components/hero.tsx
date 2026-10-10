import { useEffect, useState } from "react";

import { HERO, MARQUEE } from "../constants";
import { RunSheet } from "./run-sheet";

const TIME = { hour: "numeric", minute: "2-digit" } as const;
const IST_TIME = new Intl.DateTimeFormat("en-IN", { ...TIME, timeZone: "Asia/Kolkata" });
const VISITOR_TIME = new Intl.DateTimeFormat("en-IN", TIME);

// The time in India beside the visitor's own, so someone abroad can see the overlap at a glance
const useClock = () => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10_000);
    return () => clearInterval(timer);
  }, []);

  const ist = IST_TIME.format(now);
  const visitor = VISITOR_TIME.format(now);
  return `${ist} IST · ${visitor === ist ? "UTC+5:30" : `${visitor} your time`}`;
};

// Hero
export const Hero = () => {
  const clock = useClock();

  return (
    <section id="top" className="studio relative w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 pt-24 pb-24 lg:pb-28 lg:min-h-dvh grid lg:grid-cols-[1fr_minmax(0,480px)] gap-10 lg:gap-14">
        <div className="flex flex-col justify-between gap-10">
          {/* Name badges */}
          <div className="hidden lg:flex flex-col items-start gap-1.5">
            <span className="label-box">Jashanprit Singh</span>
            <span className="label-box">AI Engineer</span>
            <span className="label-box tabular-nums">{clock}</span>
          </div>

          {/* Pitch */}
          <div>
            <p className="lg:hidden mb-3 font-mono text-[13px] text-mute">
              Jashanprit Singh · AI Engineer
            </p>
            <h1 className="text-[44px] sm:text-[64px] lg:text-[80px]">
              {HERO.headline}
              <span className="text-teal"> {HERO.headlineAccent}</span>
            </h1>
            <p className="mt-5 max-w-[52ch] text-[17px] leading-7 text-mute">
              <span className="sm:hidden">{HERO.summaryShort}</span>
              <span className="hidden sm:inline">{HERO.summary}</span>
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#work" className="button button-solid">
                See the work
              </a>
              <a href="#contact" className="button button-outline">
                Get in touch
              </a>
            </div>
          </div>
        </div>

        <div className="lg:self-end">
          <RunSheet />
        </div>
      </div>

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
