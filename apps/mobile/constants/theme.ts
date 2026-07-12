/**
 * FishStudio Design System — sourced from Figma specs (Login/Signup screens)
 * Single source of truth for colors, typography, spacing, radii, and shadows.
 */

// ─── Colors ──────────────────────────────────────────────────────────────────

export const colors = {
  // Brand
  primary: "#5A2C96",           // main purple (FishStudio brand)
  primaryDark: "#300861",       // deep brand purple (logo, country code)
  primaryNavy: "#08146A",       // navy (floating action button)
  primarySurface: "#F1ECF8",    // tint of primary — active nav tab bg
  primaryMuted: "#56357E",      // active nav icon / label

  // Gradient (left→right: cyan to purple)
  gradientStart: "#0DB3D9",
  gradientEnd: "#5A2C96",

  // Semantic — success
  success: "#15803D",
  successSurface: "#DCFCE7",

  // Semantic — info / blue badge
  info: "#1D4ED8",
  infoSurface: "#DBEAFE",

  // Semantic — Google brand colours (for the Sign in with Google button)
  googleBlue: "#4285F4",
  googleGreen: "#34A853",
  googleYellow: "#FBBC05",
  googleRed: "#EA4335",

  // Text
  textPrimary: "#1C1C1C",       // headings, strong labels (brand dark black)
  textSecondary: "#8E8E93",     // secondary text (brand grey)
  textMuted: "#8E8E93",         // subheadings / helper copy
  textPlaceholder: "#A1A1AA",   // input placeholder
  textLink: "#5A2C96",          // inline links ("Resend code", "Privacy")
  textWhite: "#FFFFFF",

  // Backgrounds
  white: "#FFFFFF",             // primary background (brand)
  screenBg: "#FFFFFF",          // page background
  secondaryBg: "#F8F8FA",       // secondary background (brand)
  surfaceAlt: "#F8F8FA",        // card / surface bg
  inputBg: "#F8F8FA",           // text input & OTP box bg
  buttonSecondaryBg: "#F8F8FA", // Google / secondary button bg

  // Dividers
  divider: "rgba(90, 44, 150, 0.3)", // "or continue with" lines

  // Misc
  overlay: "rgba(0,0,0,0.4)",
  transparent: "transparent",
} as const;

// ─── Typography ──────────────────────────────────────────────────────────────

// Single brand font family: Inter (brief preferred SF Pro Display, Inter as the
// cross-platform alternative — Inter is bundled in assets/fonts).
export const fonts = {
  regular: "Inter-Regular",
  medium: "Inter-Medium",
  semiBold: "Inter-SemiBold",
  bold: "Inter-Bold",
  interBold: "Inter-Bold",      // used for floating pill label
} as const;

export const fontSizes = {
  "2xs": 9,    // fine print ("Your data is encrypted")
  xs: 10,      // legal footer
  sm: 11,      // nav labels
  base: 12,    // field labels (uppercase), resend timer
  md: 14,      // country code prefix (+91)
  body: 15,    // Google button, CTA ghost button
  lg: 16,      // input text, subtitle
  xl: 17,      // tagline
  "2xl": 18,   // primary CTA label
  "3xl": 20,   // brand wordmark, heading-level copy
  "4xl": 30,   // "Welcome back" heading
} as const;

export const lineHeights = {
  tight: 16,
  snug: 18,
  normal: 20,
  relaxed: 24,
  loose: 28,
  xl: 30,
  "2xl": 36,
} as const;

export const letterSpacings = {
  tight: -0.75,   // large headings
  normal: -0.5,   // brand wordmark
  wide: 1.2,      // uppercase field labels
  wider: 0.55,    // nav labels (uppercase)
  widest: 0.6,    // floating pill label
} as const;

// ─── Spacing ─────────────────────────────────────────────────────────────────

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  14: 56,
  15: 60,
  16: 64,
} as const;

// ─── Border Radius ────────────────────────────────────────────────────────────

export const radii = {
  sm: 16,         // active nav pill, trust-badge inner items
  md: 24,         // OTP boxes, trust-badge card, bottom nav bar, cards
  lg: 39,         // ghost / secondary buttons
  pill: 53,       // phone number input
  button: 65,     // primary CTA button
  navBar: 24,     // bottom navigation bar
  full: 9999,     // circular elements (floating button, icon circles)
} as const;

// ─── Shadows ─────────────────────────────────────────────────────────────────

export const shadows = {
  // Dual-colour glow on the primary gradient CTA
  primaryButton: {
    shadowColor: "#0DB3D9",
    shadowOpacity: 0.23,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 20 },
    elevation: 10,
  },
  // Frosted-glass bottom nav bar
  navBar: {
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  // Floating action / chat button
  floating: {
    shadowColor: "#000000",
    shadowOpacity: 0.25,
    shadowRadius: 50,
    shadowOffset: { width: 0, height: 25 },
    elevation: 12,
  },
  // Generic card / surface
  card: {
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
} as const;

// ─── Gradient presets ────────────────────────────────────────────────────────

export const gradients = {
  // Primary CTA button (99.95° ≈ horizontal)
  primary: [colors.gradientStart, colors.gradientEnd] as const,
  // Login/Signup button on QR screen (135°)
  primaryDiagonal: [colors.gradientStart, colors.gradientEnd] as const,
  // Solid brand purple as a 2-stop gradient (for LinearGradient consumers)
  purple: [colors.primary, colors.primaryDark] as const,
} as const;

// ─── Component tokens ────────────────────────────────────────────────────────

export const inputToken = {
  height: 60,
  borderRadius: radii.pill,
  backgroundColor: colors.inputBg,
  fontFamily: fonts.medium,
  fontSize: fontSizes.lg,
  color: colors.textPrimary,
  paddingHorizontal: spacing[4],
} as const;

export const otpBoxToken = {
  height: 56,
  borderRadius: radii.md,
  backgroundColor: colors.inputBg,
  flex: 1,
} as const;

export const primaryButtonToken = {
  height: 60,
  borderRadius: radii.button,
  fontFamily: fonts.bold,
  fontSize: fontSizes["2xl"],
  color: colors.textWhite,
} as const;

export const secondaryButtonToken = {
  height: 56,
  borderRadius: radii.lg,
  backgroundColor: colors.buttonSecondaryBg,
  fontFamily: fonts.semiBold,
  fontSize: fontSizes.body,
  color: colors.textPrimary,
} as const;
