export const APPEARANCE_MODES = ["solid", "gradient", "image"] as const;
export type AppearanceMode = (typeof APPEARANCE_MODES)[number];
export const BUTTON_SHAPES = ["pill", "soft", "square"] as const;
export type ButtonShape = (typeof BUTTON_SHAPES)[number];
export const SERVICE_CARD_KEYS = ["food_drives", "clothing_closet", "community_outreach"] as const;
export type ServiceCardKey = (typeof SERVICE_CARD_KEYS)[number];

export const DEFAULT_APPEARANCE = {
  siteName: "Can Do ATL",
  tabTitle: "Can Do ATL — Student-led mutual aid",
  logoUrl: "/manus-storage/cando-atlanta-pencil-logo_ae816652.png",
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
  { cardKey: "food_drives", imageUrl: "/manus-storage/cando-food-drive_871f5113.png", imageKey: null, hoverImageUrl: "/manus-storage/cando-hover-food-drive_149f6ede.png", hoverImageKey: null, imageAlt: "Students organizing food drive supplies", position: 0 },
  { cardKey: "clothing_closet", imageUrl: "/manus-storage/cando-clothing-closet_0be9460f.png", imageKey: null, hoverImageUrl: "/manus-storage/cando-hover-clothing-closet_fd9db982.png", hoverImageKey: null, imageAlt: "Students organizing clothing donations", position: 1 },
  { cardKey: "community_outreach", imageUrl: "/manus-storage/cando-outreach_ef7007e4.png", imageKey: null, hoverImageUrl: "/manus-storage/cando-hover-outreach_830f5058.png", hoverImageKey: null, imageAlt: "Students sharing community care kits", position: 2 },
];
