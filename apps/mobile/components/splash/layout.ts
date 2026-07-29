import { Dimensions } from "react-native";
import { Easing } from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

// The choreography was laid out against a 370x800 frame. Sizes scale off the
// device width, but vertical offsets scale off its height — on a short phone
// (SE) pure width-scaling pushes the trust icons straight into the hero.
const FRAME_W = 370;
const FRAME_H = 800;

export const SCREEN_W = width;
export const px = (value: number) => (value * width) / FRAME_W;
export const py = (value: number) => (value * height) / FRAME_H;

const HERO_RATIO = 428 / 740; // food.png
export const WORDMARK_RATIO = 92 / 504; // wm.png
export const TAGLINE_RATIO = 62 / 504; // tag.png
export const CELL_RATIO = 124 / 150; // ic1–ic4.png

export const PANEL_H = py(190);
// Short screens can't afford the photo's full height. The box crops it from the
// top so the purple curve baked into its bottom edge always stays put.
export const HERO_BOX_H = Math.min(width * HERO_RATIO, height * 0.27);
export const HERO_H = width * HERO_RATIO;
export const WORDMARK_W = px(252);
export const TAGLINE_W = px(252);
export const CELLS_W = px(318);
export const CELL_W = CELLS_W / 4;
export const LOGO_SIZE = px(106);
export const GLOW_SIZE = px(420);

// food.png carries the purple curve baked into its bottom corners, so it has to
// overlap the panel by the same 35pt the design used or the seam splits open.
export const HERO_PANEL_OVERLAP = py(35);

// Entrance beats, in ms. Everything moves in one direction (up); the spring is
// reserved for the brand mark so nothing else competes with it.
export const BEAT = {
  logo: 180,
  ripple: 450,
  rippleStagger: 800,
  wordmark: 580,
  tagline: 950,
  cells: 1120,
  cellStagger: 80,
  hero: 1340,
  panel: 1620,
  headline: 2050,
  headlineStagger: 130,
  indicator: 2350,
  hint: 2500,
} as const;

// Last entrance settles at 2.5s plus its 600ms tail. Below this the splash would
// cut off mid-choreography, so it holds even when the app is ready sooner.
export const CHOREOGRAPHY_MS = 3100;
export const CROSSFADE_MS = 320;

export const OVERSHOOT = Easing.bezier(0.34, 1.56, 0.64, 1);
export const DECELERATE = Easing.bezier(0.2, 0.85, 0.2, 1);
export const WIPE = Easing.bezier(0.2, 0.8, 0.2, 1);
export const RISE = Easing.bezier(0.2, 0.9, 0.2, 1);
