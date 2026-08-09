/**
 * Audible + haptic + system-notification alert for incoming staff work.
 *
 * The bell is synthesised with Web Audio rather than loaded from an mp3: an
 * asset request can 404 or be slow on a rider's phone at exactly the moment
 * the alert matters, and a silent failure there means a missed order.
 */

let audioContext: AudioContext | null = null;

type WindowWithWebkitAudio = Window &
  typeof globalThis & { webkitAudioContext?: typeof AudioContext };

const getAudioContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ?? (window as WindowWithWebkitAudio).webkitAudioContext;
  if (!Ctor) return null;
  if (!audioContext) audioContext = new Ctor();
  return audioContext;
};

/**
 * Mobile browsers create the AudioContext suspended and only allow resuming
 * inside a user gesture. Staff portals are opened and then left idle, so we
 * resume once on the first interaction after load — otherwise the very first
 * order of a shift rings silently.
 */
export const primeOrderAlertAudio = () => {
  const ctx = getAudioContext();
  if (ctx && ctx.state === "suspended") {
    void ctx.resume().catch(() => {
      // Nothing to do — vibration and the visual toast still fire.
    });
  }
};

/**
 * Three-chime bell in the 1.3–2 kHz band — the range a phone speaker
 * reproduces loudest and that cuts through a noisy shop floor. Each chime is a
 * fundamental plus an octave partial, which reads far brighter than a bare
 * sine at the same peak gain.
 */
const CHIMES = [
  { freq: 1568, at: 0 },
  { freq: 1319, at: 0.2 },
  { freq: 1568, at: 0.4 },
];

const ring = (ctx: AudioContext) => {
  // One shared gain node so the three chimes are limited together — summing
  // per-chime gains near full scale would clip into a rasp instead of getting
  // louder.
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.9, ctx.currentTime);
  master.connect(ctx.destination);

  CHIMES.forEach(({ freq, at }) => {
    [
      { hz: freq, level: 0.5 },
      { hz: freq * 2, level: 0.2 },
    ].forEach(({ hz, level }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + at;

      osc.type = "triangle";
      osc.frequency.setValueAtTime(hz, start);

      // Percussive envelope: instant attack, exponential decay like a struck bell.
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(level, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);

      osc.connect(gain).connect(master);
      osc.start(start);
      osc.stop(start + 0.4);
    });
  });
};

const playBell = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  // A tab left idle can have its context auto-suspended by the browser, and an
  // order arriving then is exactly when the alert matters most — resume and
  // ring rather than returning silently. The resume only resolves if the tab
  // already has user activation; if it doesn't, the toast and vibration stand in.
  if (ctx.state === "suspended") {
    void ctx.resume().then(
      () => ring(ctx),
      () => {
        /* No activation yet — the visual toast still fires. */
      },
    );
    return;
  }

  ring(ctx);
};

const vibrate = () => {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    // Pattern, not a single buzz — distinguishable from a normal phone alert.
    navigator.vibrate?.([200, 100, 200]);
  }
};

export const requestOrderAlertPermission = async (): Promise<boolean> => {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  try {
    return (await Notification.requestPermission()) === "granted";
  } catch {
    return false;
  }
};

const showSystemNotification = (title: string, body: string, tag: string) => {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    // `tag` collapses repeats for the same order instead of stacking them.
    new Notification(title, { body, tag, icon: "/staff/icon.svg" });
  } catch {
    // Some mobile browsers only permit notifications via a service worker
    // registration; the sound and vibration already covered the alert.
  }
};

interface OrderAlertInput {
  title: string;
  body: string;
  /** Dedupe key — usually the order id. */
  tag: string;
}

export const fireOrderAlert = ({ title, body, tag }: OrderAlertInput) => {
  playBell();
  vibrate();
  showSystemNotification(title, body, tag);
};
