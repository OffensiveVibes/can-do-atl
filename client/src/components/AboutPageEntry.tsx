import { UsersRound } from "lucide-react";
import { useLocation } from "wouter";

export default function AboutPageEntry() {
  const [location] = useLocation();
  if (location !== "/") return null;

  return (
    <a className="about-page-entry" href="/about" aria-label="Learn about the Can Do ATL team">
      <UsersRound size={16} strokeWidth={2.2} />
      <span>About us</span>
    </a>
  );
}
