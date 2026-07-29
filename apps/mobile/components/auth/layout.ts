import { Dimensions } from "react-native";

import { authScreen } from "@/constants/theme";

const { width, height } = Dimensions.get("window");

// The auth comps were drawn on a 370x800 frame. The login screen has to fit in
// one viewport without scrolling, so the vertical rhythm compresses on shorter
// phones rather than pushing the footer off-screen.
export const vs = (value: number) =>
  value * Math.min(1, Math.max(0.78, height / 844));

export const HERO_H = width * authScreen.heroAspect;
// The comp only shows a band of the photo above the curve, so the box crops the
// image from the top rather than letting it eat the form.
export const HERO_BOX_H = Math.min(HERO_H, height * authScreen.heroHeightRatio);
export const PANEL_OVERLAP = vs(authScreen.panelOverlap);
