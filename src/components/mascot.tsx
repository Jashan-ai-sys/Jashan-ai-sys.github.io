import { createAvatar, type AvatarController } from "@bible-strong/avatar-react";
import "@bible-strong/avatar-react/styles.css";
import { useEffect, useRef, useState } from "react";

import { MASCOT_TOUR } from "../constants";
import definition from "../echo.avatar.json";
import { MASCOT_EVENT, type MascotCue } from "../lib/mascot";
import { reduceMotion } from "./canvas/motion";

const Echo = createAvatar(definition);

type Animation = keyof typeof definition.animations;
type Bubble = { text: string; next?: (typeof MASCOT_TOUR)[number] };
// Where the mascot stands, as an offset from its home in the bottom-right corner
type Spot = { dx: number; dy: number; bubbleSide: "left" | "right" };

const HOME: Spot = { dx: 0, dy: 0, bubbleSide: "left" };
const HOME_INSET = 16;
const EDGE_GAP = 8;
const NAVBAR_HEIGHT = 56;
const CLICK_OFFSET = 12;
// Keep in step with the .cloud rules in index.css
const CLOUD_GAP = 22;
const CLOUD_MAX_WIDTH = 200;
const CLOUD_ROOM = 110;
const CLOUD_CLOSE_MS = 200;
// Clicks on these do their own job, so the mascot stays out of the way
const NOT_SUMMONING = "a, button, input, textarea, label, [data-mascot], [data-no-mascot]";

// Every exported animation loops, so each one is timed out back to idle.
const WAKE_MS = 1600;
const HOVER_MS = 1500;
const CUE_MS = 4000;
const TOUR_MS = 7000;
const TOUR_ARRIVAL_MS = 2500;
const DROWSY_AFTER_MS = 30_000;
const ASLEEP_AFTER_MS = 38_000;
const DOZE_CHECK_MS = 4000;
const STREAM_MS = 22;
const NARROW_SCREEN = window.matchMedia("(max-width: 639px)");
const ACTIVITY = ["pointermove", "pointerdown", "keydown", "scroll"] as const;

const tourBubble = (stop: number, say: "line" | "tip" = "line"): Bubble => ({
  text: MASCOT_TOUR[stop][say],
  next: MASCOT_TOUR[stop + 1],
});

const placeAt = (left: number, top: number, size: number, bubbleSide: Spot["bubbleSide"]): Spot => ({
  dx: left + size - (window.innerWidth - HOME_INSET),
  dy: top + size - (window.innerHeight - HOME_INSET),
  bubbleSide,
});

// Keep the mascot on screen, and low enough that the bubble beside it clears the navbar
const clampTop = (top: number, size: number) =>
  Math.min(
    Math.max(top, NAVBAR_HEIGHT + CLOUD_ROOM - size),
    window.innerHeight - size - EDGE_GAP,
  );

// Stand just below-right of the click, with the bubble on whichever side has room for it
const spotNear = (x: number, y: number, size: number): Spot => {
  const bubbleSide = x > window.innerWidth / 2 ? "left" : "right";
  const room = Math.min(CLOUD_MAX_WIDTH, window.innerWidth - 108) + CLOUD_GAP + EDGE_GAP;
  const minLeft = bubbleSide === "left" ? room : EDGE_GAP;
  const maxLeft = window.innerWidth - size - (bubbleSide === "right" ? room : EDGE_GAP);
  const left = Math.min(Math.max(x + CLICK_OFFSET, minLeft), maxLeft);
  return placeAt(left, clampTop(y + CLICK_OFFSET, size), size, bubbleSide);
};

// Stand at the right end of a form field, above its input, with the bubble level with the label:
// neither covers what is being typed. Null while the field is off the screen.
const spotBeside = (field: Element, size: number): Spot | null => {
  const rect = field.getBoundingClientRect();
  if (rect.bottom < NAVBAR_HEIGHT || rect.top > window.innerHeight) return null;
  const inputTop = (field.querySelector("input, textarea") ?? field).getBoundingClientRect().top;
  const left = Math.min(rect.right + EDGE_GAP, window.innerWidth - size - EDGE_GAP);

  return placeAt(left, clampTop(inputTop - size, size), size, "left");
};

// Types the line out a character at a time. The part not yet typed still takes up its space, so the bubble never resizes.
const Streamed = ({ text }: { text: string }) => {
  const [shown, setShown] = useState(reduceMotion ? text.length : 0);

  useEffect(() => {
    if (shown >= text.length) return;
    const timer = setTimeout(() => setShown(shown + 1), STREAM_MS);
    return () => clearTimeout(timer);
  }, [shown, text.length]);

  return (
    <p>
      {text.slice(0, shown)}
      <span className="invisible">{text.slice(shown)}</span>
    </p>
  );
};

// Mascot
const Mascot = () => {
  const avatar = useRef<AvatarController>(null);
  const body = useRef<HTMLButtonElement>(null);
  const [bubble, setBubble] = useState<Bubble | null>(null);
  const [closing, setClosing] = useState(false);
  const [spot, setSpot] = useState(HOME);
  // Beside a form field it lets clicks through, so it can never take one meant for a field
  const [docked, setDocked] = useState(false);
  // Mutable state the event handlers share without re-subscribing
  const live = useRef({
    stop: 0,
    muted: false,
    speaking: false,
    // Set by the bubble's Next link, so the stop it scrolls to gets introduced
    touring: false,
    playing: "waking" as Animation,
    // The form field the mascot is standing beside, if any
    field: null as Element | null,
    animTimer: 0,
    sayTimer: 0,
    closeTimer: 0,
    tourTimer: 0,
  }).current;

  const rest = () => {
    live.playing = "idle";
    avatar.current?.play("idle");
  };

  const play = (animation: Animation, ms: number) => {
    if (reduceMotion) return;
    // Playing restarts the timeline, so a repeat (one per keystroke in the form) only extends it
    if (live.playing !== animation) avatar.current?.play(animation);
    live.playing = animation;
    clearTimeout(live.animTimer);
    live.animTimer = window.setTimeout(rest, ms);
  };

  // The bubble is gone: go back to the corner unless there is a field to stay beside
  const settle = () => {
    live.speaking = false;
    setClosing(false);
    setBubble(null);
    if (!live.field) setSpot(HOME);
  };

  // Pop the bubble away, then settle once the pop-out has had time to play
  const hush = () => {
    clearTimeout(live.sayTimer);
    clearTimeout(live.closeTimer);
    if (reduceMotion || !live.speaking) return settle();
    setClosing(true);
    live.closeTimer = window.setTimeout(settle, CLOUD_CLOSE_MS);
  };

  const say = (next: Bubble, ms: number) => {
    if (live.muted) return;
    live.speaking = true;
    clearTimeout(live.closeTimer);
    setClosing(false);
    setBubble(next);
    clearTimeout(live.sayTimer);
    live.sayTimer = window.setTimeout(hush, ms);
  };

  useEffect(() => {
    if (!reduceMotion) {
      live.animTimer = window.setTimeout(rest, WAKE_MS);
    }

    // Track which section is in the middle of the screen. It speaks on landing, and when the
    // visitor asked for the next stop; plain scrolling stays quiet.
    let greeted = false;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          live.stop = MASCOT_TOUR.findIndex((stop) => stop.id === entry.target.id);
          if (greeted && !live.touring) continue;
          play(greeted ? "curious" : "waking", WAKE_MS);
          // On a phone the landing greeting would sit on the hero's buttons, so it only wakes up there
          if (greeted || !NARROW_SCREEN.matches) say(tourBubble(live.stop), TOUR_MS);
          greeted = true;
          live.touring = false;
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    for (const stop of MASCOT_TOUR) {
      const section = document.getElementById(stop.id);
      if (section) observer.observe(section);
    }

    // It is fixed to the screen, so when the page moves it follows its field, or goes home if it has
    // none. A field that is off the screen keeps its claim: focusing one scrolls it into view next.
    const follow = () => {
      const beside =
        live.field && body.current && spotBeside(live.field, body.current.offsetWidth);
      setSpot(beside || HOME);
      setDocked(Boolean(beside));
    };

    const onCue = (e: Event) => {
      const { animation, say: text, at } = (e as CustomEvent<MascotCue>).detail;
      if (at) {
        live.field = at;
        follow();
      }
      play(animation, CUE_MS);
      if (text) say({ text }, CUE_MS);
    };

    // Leave the form once focus moves off its fields
    const onFocusOut = (e: FocusEvent) => {
      if (!live.field || (e.relatedTarget as Element | null)?.closest("label")) return;
      live.field = null;
      setDocked(false);
      hush();
    };

    const onHover = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if ((e.target as Element).closest?.(".button-solid")) play("excited", HOVER_MS);
    };

    // Come to wherever the visitor clicks and say what that section is about
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element;
      if (live.muted || target.closest(NOT_SUMMONING) || getSelection()?.toString()) return;
      const stop = MASCOT_TOUR.findIndex(
        (item) => item.id === target.closest("section[id]")?.id,
      );
      if (stop < 0 || !body.current) return;

      live.stop = stop;
      live.field = null;
      setDocked(false);
      setSpot(spotNear(e.clientX, e.clientY, body.current.offsetWidth));
      play("curious", WAKE_MS);
      say(tourBubble(stop, "tip"), TOUR_MS);
    };
    // Doze off when the visitor goes quiet, and wake on the next movement
    let lastActive = Date.now();
    let doze: "" | "drowsy" | "sleeping" = "";
    const onActivity = () => {
      lastActive = Date.now();
      if (!doze) return;
      doze = "";
      play("waking", WAKE_MS);
    };
    const dozeTimer = setInterval(() => {
      const quietFor = Date.now() - lastActive;
      if (reduceMotion || quietFor < DROWSY_AFTER_MS) return;
      const stage = quietFor < ASLEEP_AFTER_MS ? "drowsy" : "sleeping";
      if (stage === doze) return;
      doze = stage;
      live.playing = stage;
      clearTimeout(live.animTimer);
      avatar.current?.play(stage);
    }, DOZE_CHECK_MS);

    window.addEventListener(MASCOT_EVENT, onCue);
    document.addEventListener("pointerover", onHover);
    document.addEventListener("click", onClick);
    document.addEventListener("focusout", onFocusOut);
    window.addEventListener("scroll", follow, { passive: true });
    window.addEventListener("resize", follow);
    for (const type of ACTIVITY) {
      window.addEventListener(type, onActivity, { passive: true });
    }

    return () => {
      observer.disconnect();
      clearTimeout(live.animTimer);
      clearTimeout(live.sayTimer);
      clearTimeout(live.closeTimer);
      clearTimeout(live.tourTimer);
      clearInterval(dozeTimer);
      window.removeEventListener(MASCOT_EVENT, onCue);
      document.removeEventListener("pointerover", onHover);
      document.removeEventListener("click", onClick);
      document.removeEventListener("focusout", onFocusOut);
      window.removeEventListener("scroll", follow);
      window.removeEventListener("resize", follow);
      for (const type of ACTIVITY) window.removeEventListener(type, onActivity);
    };
  }, []);

  const toggleBubble = () => {
    live.muted = false;
    if (bubble) return hush();
    play("laughing", HOVER_MS);
    say(tourBubble(live.stop), TOUR_MS);
  };

  const mute = () => {
    live.muted = true;
    hush();
  };

  return (
    // A pointer-only extra: the navbar and the form's own errors already cover everything it says
    <div
      aria-hidden
      data-mascot
      className="fixed bottom-4 right-4 z-20 transition-transform duration-500 ease-out motion-reduce:transition-none"
      style={{ transform: `translate(${spot.dx}px, ${spot.dy}px)` }}
      // Its buttons must not take focus from the page: that would close a phone's keyboard mid-form
      onMouseDown={(e) => e.preventDefault()}
    >
      {bubble && (
        <div
          key={bubble.text}
          data-side={spot.bubbleSide}
          className={closing ? "cloud cloud-out" : "cloud"}
        >
          <i className="cloud-tail" />
          <Streamed text={bubble.text} />
          <div className="mt-1 flex justify-between gap-4 font-mono text-[11px]">
            {bubble.next && (
              <button
                type="button"
                tabIndex={-1}
                className="underline underline-offset-4 hover:no-underline"
                onClick={() => {
                  live.touring = true;
                  document.getElementById(bubble.next!.id)?.scrollIntoView();
                  // Dropped if the scroll never brings a new section to the middle
                  clearTimeout(live.tourTimer);
                  live.tourTimer = window.setTimeout(
                    () => (live.touring = false),
                    TOUR_ARRIVAL_MS,
                  );
                }}
              >
                Next: {bubble.next.title} &rarr;
              </button>
            )}
            <button
              type="button"
              tabIndex={-1}
              className="ml-auto opacity-75 hover:opacity-100"
              onClick={mute}
            >
              Hide
            </button>
          </div>
        </div>
      )}

      <button
        ref={body}
        type="button"
        tabIndex={-1}
        className={`block rounded-full leading-[0] ${docked ? "pointer-events-none" : ""}`}
        onClick={toggleBubble}
      >
        <Echo
          ref={avatar}
          size="clamp(48px, 10vw, 88px)"
          {...(reduceMotion
            ? { defaultExpression: "neutral" }
            : { defaultAnimation: "waking" })}
        />
      </button>
    </div>
  );
};

export default Mascot;
