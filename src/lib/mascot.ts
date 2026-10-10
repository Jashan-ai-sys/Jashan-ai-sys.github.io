export const MASCOT_EVENT = "mascot-cue";

export type MascotCue = {
  animation: "listening" | "confused" | "celebrate";
  say?: string;
  // A form field to go and stand beside
  at?: Element | null;
};

// The mascot is lazy-loaded and lives outside the sections, so they reach it with a window event.
export const cueMascot = (
  animation: MascotCue["animation"],
  say?: string,
  at?: Element | null,
) =>
  window.dispatchEvent(
    new CustomEvent<MascotCue>(MASCOT_EVENT, { detail: { animation, say, at } }),
  );
