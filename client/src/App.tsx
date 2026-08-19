import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Admin from "@/pages/Admin";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { trpc } from "./lib/trpc";
import Home from "./pages/Home";
import About from "./pages/About";
import { useEffect } from "react";

const defaultBranding = {
  siteName: "Can Do ATL",
  tabTitle: "Can Do ATL — Student-led mutual aid",
  logoUrl: "",
  logoAlt: "Atlanta pencil surrounded by grocery essentials",
  primaryColor: "#3A5A40",
  accentColor: "#BC6C25",
  highlightColor: "#F1CB6B",
  inkColor: "#2C2C2C",
  buttonShape: "pill",
};

function Router() {
  return <Switch><Route path="/" component={Home} /><Route path="/about" component={About} /><Route path="/admin" component={Admin} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>;
}

function BrandingLayer({ children }: { children: React.ReactNode }) {
  const content = trpc.content.public.useQuery();
  const appearance = { ...defaultBranding, ...(content.data?.appearance ?? {}) };

  useEffect(() => {
    document.title = appearance.tabTitle;
    const icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (icon && appearance.logoUrl) icon.href = appearance.logoUrl;
    if (icon && !appearance.logoUrl) icon.removeAttribute("href");
    const root = document.documentElement;
    root.style.setProperty("--green", appearance.primaryColor);
    root.style.setProperty("--terracotta", appearance.accentColor);
    root.style.setProperty("--butter", appearance.highlightColor);
    root.style.setProperty("--charcoal", appearance.inkColor);
    root.style.setProperty("--primary", appearance.primaryColor);
    root.style.setProperty("--ring", appearance.accentColor);
  }, [appearance.accentColor, appearance.highlightColor, appearance.inkColor, appearance.logoUrl, appearance.primaryColor, appearance.tabTitle]);

  return <div className="site-branding-layer" data-button-shape={appearance.buttonShape}>{children}</div>;
}

function App() { return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><BrandingLayer><Router /></BrandingLayer></TooltipProvider></ThemeProvider></ErrorBoundary>; }
export default App;
