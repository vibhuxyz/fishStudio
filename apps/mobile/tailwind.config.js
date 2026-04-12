/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Fish Studio brand colors (matching user-ui)
        primary: "#6C3CE1", // Vibrant purple
        "primary-dark": "#5A2DC5",
        "primary-light": "#7D4EE8",
        accent: "#5EC4B6", // Teal/cyan
        "accent-dark": "#4DB0A3",
        "offer-green": "#22C55E", // Green for discounts
        "fish-blue": "#0EA5E9", // Brand blue
        // Neutral colors
        foreground: "#1E293B", // Dark grayish-blue text
        muted: "#F1F5F9", // Light gray background
        "muted-foreground": "#64748B", // Medium gray text
        border: "#E2E8F0", // Light gray borders
        input: "#E2E8F0", // Input borders
      },
      fontFamily: {
        poppins: ["Poppins-Regular"],
        "poppins-medium": ["Poppins-Medium"],
        "poppins-semibold": ["Poppins-SemiBold"],
        "poppins-bold": ["Poppins-Bold"],
        railway: ["Railway"],
        "railway-bold": ["Railway-Bold"],
        // Add fallbacks for Android
        inter: ["Inter-Regular"],
        "inter-semibold": ["Inter-SemiBold"],
        "inter-bold": ["Inter-Bold"],
      },
      borderRadius: {
        "2xl": "1rem", // 16px for cards
        "3xl": "1.5rem", // 24px for modals
      },
    },
  },
  plugins: [],
};
