import type { TextStyle } from "react-native";

/** Shared UI surfaces for Iris's dark control surfaces. */
export const SURFACES = {
  screen: "#111111",
  elevated: "#191919",
  secondary: "#242424",
} as const;

/** Theme-independent lines used to separate content sections. */
export const DIVIDERS = {
  subtle: "rgba(255, 255, 255, 0.24)",
} as const;

/** Shared vertical rhythm for screen sections and content containers. */
export const SPACING = {
  screen: 24,
  section: 16,
  dividerTop: 24,
} as const;

/** Semantic text roles shared by every Iris screen. */
export const TYPOGRAPHY: Record<string, TextStyle> = {
  screenTitle: {
    fontSize: 24,
    fontWeight: "300",
    lineHeight: 32,
  },
  largeHeading: {
    fontSize: 25,
    fontWeight: "300",
    lineHeight: 32,
  },
  navigationIcon: {
    fontSize: 34,
    fontWeight: "300",
    lineHeight: 40,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 2.2,
    lineHeight: 16,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: "500",
    lineHeight: 24,
  },
  option: {
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 24,
  },
  description: {
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 17,
  },
  body: {
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 21,
  },
  longBody: {
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 19,
  },
  utility: {
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 18,
    letterSpacing: 0.2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  cardAction: {
    fontSize: 17,
    fontWeight: "500",
    lineHeight: 24,
  },
  button: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  badge: {
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16,
  },
  meta: {
    fontSize: 11,
    fontWeight: "400",
    letterSpacing: 0.6,
    lineHeight: 16,
  },
  display: {
    fontSize: 52,
    fontWeight: "300",
    letterSpacing: -1.5,
    lineHeight: 56,
  },
  actionLarge: {
    fontSize: 17,
    fontWeight: "600",
    lineHeight: 24,
  },
  searchInput: {
    fontSize: 26,
    fontWeight: "300",
    letterSpacing: -0.6,
  },
} as const;
