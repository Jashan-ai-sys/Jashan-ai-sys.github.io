import { useEffect, useState } from "react";

import { HERO_RUNS } from "../constants";
import { useInView } from "../hooks/use-in-view";
import { prefillContact } from "../lib/contact";
import { cueMascot } from "../lib/mascot";
import { reduceMotion } from "../lib/motion";

const STEP_MS = 900;
// Four steps and the outcome
const LAST = 5;
// The row of an awkward run where the agent does the careful thing
const TESTED_ROW = 2;

// A link can open the page on one job: #job=call, #job=chat or #job=form
const jobFromHash = () => {
  const id = new URLSearchParams(location.hash.slice(1)).get("job");
  return Math.max(0, HERO_RUNS.findIndex((run) => run.id === id));
};

// A worked example of one business job going from arrival to done, and of the same job going wrong
// on purpose. It is scripted, and says so on the card.
export const RunSheet = () => {
  const { ref, isInView } = useInView({ rootMargin: "0px", threshold: 0.15 });
  const [started, setStarted] = useState(false);
  const [job, setJob] = useState(jobFromHash);
  const [awkward, setAwkward] = useState(false);
  const [replays, setReplays] = useState(0);
  // How many of the rows have appeared
  const [shown, setShown] = useState(reduceMotion ? LAST : 0);

  const run = HERO_RUNS[job];
  const { steps, outcome } = awkward ? run.awkward : run;

  // It first plays when the visitor reaches it, not while it is still below the fold
  useEffect(() => {
    if (isInView) setStarted(true);
  }, [isInView]);

  // A press always starts a run, from a blank sheet, even if the card never came far enough into view
  const restart = () => {
    setStarted(true);
    if (!reduceMotion) setShown(0);
    setReplays(replays + 1);
  };

  useEffect(() => {
    if (!started || reduceMotion) return;

    setShown(0);
    let rows = 0;
    const timer = setInterval(() => {
      rows += 1;
      setShown(rows);
      if (rows >= LAST) clearInterval(timer);
    }, STEP_MS);

    return () => clearInterval(timer);
  }, [started, job, awkward, replays]);

  // The mascot follows the job with its face only; a speech bubble would sit on the card
  useEffect(() => {
    if (!started || reduceMotion) return;
    if (shown === 2) cueMascot("listening");
    if (shown === TESTED_ROW + 1 && awkward) cueMascot("confused");
    if (shown === LAST && !awkward) cueMascot("celebrate");
  }, [shown]);

  return (
    <div ref={ref} data-no-mascot className="bg-paper border border-line p-5 sm:p-6">
      <span className="label-box text-[11px]">
        Illustration · made-up business · not a live AI
      </span>

      <div role="group" aria-label="Pick a job" className="mt-4 flex flex-wrap gap-2">
        {HERO_RUNS.map((option, i) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={i === job}
            className="job-button"
            onClick={() => {
              setJob(i);
              setAwkward(false);
              restart();
            }}
          >
            {option.title}
          </button>
        ))}
      </div>

      <p className="mt-4 font-mono text-[12px] text-mute">{run.caption}</p>

      <ol className="run-steps mt-2">
        {steps.map((step, i) => {
          const tested = awkward && i === TESTED_ROW;
          return (
            <li
              key={i}
              className={`run-step ${i < shown ? "run-step-on" : ""} ${tested ? "run-step-tested" : ""}`}
            >
              <span className="run-dot" aria-hidden />
              <span>
                {step.text}
                {step.chip && <span className="chip ml-2 whitespace-nowrap">{step.chip}</span>}
                {tested && (
                  <span className="mt-1 block text-[12px] text-mute">{run.awkward.why}</span>
                )}
              </span>
            </li>
          );
        })}
      </ol>

      <p className={`run-step bg-panel px-4 ${shown >= LAST ? "run-step-on" : ""}`}>
        <span className="font-hand text-[26px] font-bold leading-none text-teal">Done.</span>
        <span>{outcome}</span>
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[12px]">
        <button
          type="button"
          className="job-button"
          onClick={() => {
            setAwkward(!awkward);
            restart();
          }}
        >
          {awkward ? "Back to the normal one" : "Now try an awkward one"}
        </button>
        <button
          type="button"
          className="underline underline-offset-4 hover:text-teal"
          onClick={restart}
        >
          Replay
        </button>
        <a
          href="#contact"
          className="text-teal underline underline-offset-4 hover:no-underline"
          onClick={(e) => {
            // The handler scrolls to the message field itself; the address is only the fallback
            e.preventDefault();
            prefillContact(`My job is like: ${run.title.toLowerCase()}. `);
          }}
        >
          Have a job like this? Tell me about it
        </a>
      </div>

      <div className="mt-5 border-t border-line pt-3 text-[12px] leading-5 text-mute">
        <p>
          Tested before launch: awkward cases like these are checked first, and you get the
          written report.{" "}
          <a href="#process" className="underline underline-offset-2 hover:text-teal">
            See how testing fits the process
          </a>
        </p>
        <p>Runs where you choose: your own servers, or the cloud.</p>
      </div>
    </div>
  );
};
