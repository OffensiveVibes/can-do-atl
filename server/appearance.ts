export const APPEARANCE_MODES = ["solid", "gradient", "image"] as const;
export type AppearanceMode = (typeof APPEARANCE_MODES)[number];
export const BUTTON_SHAPES = ["pill", "soft", "square"] as const;
export type ButtonShape = (typeof BUTTON_SHAPES)[number];
export const SERVICE_CARD_KEYS = ["food_drives", "clothing_closet", "community_outreach"] as const;
export type ServiceCardKey = (typeof SERVICE_CARD_KEYS)[number];

export const DEFAULT_APPEARANCE = {
  siteName: "Can Do ATL",
  tabTitle: "Can Do ATL — Student-led mutual aid",
  logoUrl: "",
  logoKey: null,
  logoAlt: "Atlanta pencil surrounded by grocery essentials",
  primaryColor: "#3A5A40",
  accentColor: "#BC6C25",
  highlightColor: "#F1CB6B",
  inkColor: "#2C2C2C",
  buttonShape: "pill" as ButtonShape,
  pageMode: "solid" as AppearanceMode,
  pageColor: "#F7F3EB",
  pageGradientFrom: "#F7F3EB",
  pageGradientTo: "#E7EDE1",
  pageImageUrl: null,
  pageImageKey: null,
  pageImageBlur: 0,
  pageOverlayOpacity: 24,
  headerMode: "solid" as AppearanceMode,
  headerColor: "#F7F3EB",
  headerGradientFrom: "#F7F3EB",
  headerGradientTo: "#F7F3EB",
  headerImageUrl: null,
  headerImageKey: null,
  headerImageBlur: 0,
  headerOverlayOpacity: 8,
  footerMode: "solid" as AppearanceMode,
  footerColor: "#2C2C2C",
  footerGradientFrom: "#2C2C2C",
  footerGradientTo: "#3A5A40",
  footerImageUrl: null,
  footerImageKey: null,
  footerImageBlur: 0,
  footerOverlayOpacity: 36,
};

export const DEFAULT_SERVICE_CARDS = [
  { cardKey: "food_drives", imageUrl: "", imageKey: null, hoverImageUrl: "", hoverImageKey: null, imageAlt: "Students organizing food drive supplies", position: 0 },
  { cardKey: "clothing_closet", imageUrl: "", imageKey: null, hoverImageUrl: "", hoverImageKey: null, imageAlt: "Students organizing clothing donations", position: 1 },
  { cardKey: "community_outreach", imageUrl: "", imageKey: null, hoverImageUrl: "", hoverImageKey: null, imageAlt: "Students sharing community care kits", position: 2 },
];
