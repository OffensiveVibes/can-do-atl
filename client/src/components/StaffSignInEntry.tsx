import { ArrowRight, Smile } from "lucide-react";
import { useLocation } from "wouter";

export default function StaffSignInEntry() {
  const [location] = useLocation();
  if (location !== "/") return null;

  return (
    <a href="/admin" className="staff-signin-entry" aria-label="Staff sign in">
      <Smile size={17} strokeWidth={2.25} />
      <span>Staff sign in</span>
      <ArrowRight size={15} strokeWidth={2.4} />
    </a>
  );
}
