import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Admin from "@/pages/Admin";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import StaffSignInEntry from "./components/StaffSignInEntry";
import AboutPageEntry from "./components/AboutPageEntry";
import Home from "./pages/Home";
import About from "./pages/About";

function Router() {
  return <Switch><Route path="/" component={Home} /><Route path="/about" component={About} /><Route path="/admin" component={Admin} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>;
}

function App() { return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><AboutPageEntry /><StaffSignInEntry /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>; }
export default App;
