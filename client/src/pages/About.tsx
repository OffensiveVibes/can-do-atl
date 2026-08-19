import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { SITE_TEXT_DEFAULTS, type SiteTextValues } from "@shared/siteText";
import {
  ChevronDown,
  Facebook,
  Globe2,
  ImagePlus,
  Instagram,
  Linkedin,
  Music2,
  UsersRound,
  Youtube,
} from "lucide-react";

type TeamMember = {
  id?: number;
  name: string;
  role: string;
  bio: string | null;
  imageUrl: string | null;
  linkedinUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
  youtubeUrl: string | null;
  websiteUrl: string | null;
  position: number;
};

const socialDefinitions = [
  { key: "linkedinUrl", label: "LinkedIn", icon: Linkedin },
  { key: "instagramUrl", label: "Instagram", icon: Instagram },
  { key: "facebookUrl", label: "Facebook", icon: Facebook },
  { key: "tiktokUrl", label: "TikTok", icon: Music2 },
  { key: "youtubeUrl", label: "YouTube", icon: Youtube },
  { key: "websiteUrl", label: "Website", icon: Globe2 },
] as const;

function initials(name: string) {
  return name.split(" ").filter(Boolean).map((word) => word[0]).join("").slice(0, 2).toUpperCase() || "CD";
}

function ProfileCard({ member, index }: { member: TeamMember; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const socialLinks = socialDefinitions.filter((social) => Boolean(member[social.key]));

  return (
    <article className={`about-profile-card about-profile-${(index % 3) + 1}`}>
      <button className="about-profile-trigger" onClick={() => setExpanded((current) => !current)} aria-expanded={expanded}>
        <div className="about-profile-photo">
          {member.imageUrl ? <img src={member.imageUrl} alt={`${member.name} profile`} /> : <div className="about-photo-slot"><ImagePlus size={24} /><span>{initials(member.name)}</span><small>Image slot</small></div>}
        </div>
        <div className="about-profile-intro">
          <span className="about-profile-number">0{index + 1}</span>
          <h2>{member.name}</h2>
          <p>{member.role}</p>
        </div>
        <span className={`about-profile-expand ${expanded ? "is-open" : ""}`}><ChevronDown size={21} /></span>
      </button>
      {expanded && <div className="about-profile-details"><div className="about-detail-note"><span>Field note</span><p>{member.bio || "Add an introduction for this team member from the staff workspace."}</p></div><div className="about-profile-socials"><strong>Find {member.name.split(" ")[0]} online</strong>{socialLinks.length ? <div>{socialLinks.map((social) => { const Icon = social.icon; const href = member[social.key]; return href ? <a key={social.key} href={href} target="_blank" rel="noreferrer"><Icon size={17} /><span>{social.label}</span></a> : null; })}</div> : <p>LinkedIn and social links can be added from the staff workspace.</p>}</div></div>}
    </article>
  );
}

export default function About() {
  const content = trpc.content.public.useQuery();
  const members = (content.data?.teamMembers ?? []) as TeamMember[];
  const appearance = content.data?.appearance ?? { siteName: "Can Do ATL", logoUrl: "", logoAlt: "Atlanta pencil surrounded by grocery essentials" };
  const text = { ...SITE_TEXT_DEFAULTS, ...(content.data?.siteText ?? {}) } as SiteTextValues;
  const isDefaultName = appearance.siteName === "Can Do ATL";

  return <div className="about-page"><header className="about-header"><a className="brand-lockup" href="/" aria-label={`${appearance.siteName} home`}><span className="brand-mark-wrap">{appearance.logoUrl ? <img src={appearance.logoUrl} alt={appearance.logoAlt} className="brand-mark" /> : <span className="brand-mark-empty" aria-hidden="true">CD</span>}</span>{isDefaultName ? <span className="brand-name"><strong>Can Do</strong><em>ATL</em></span> : <span className="brand-name brand-name-custom">{appearance.siteName}</span>}</a><nav aria-label="About Us navigation"><a href="/">Home</a><a href="#team">Our team</a></nav></header><main><section className="about-hero"><div className="about-hero-tape" aria-hidden="true" /><p className="kicker">About {appearance.siteName}</p><h1>{text.aboutHeading}</h1><p>{text.aboutIntro.replace("Can Do ATL", appearance.siteName)}</p><div className="about-campus-line"><span>Georgia Tech</span><i /><span>Georgia State</span><i /><span>Kennesaw State</span></div></section><section id="team" className="about-team-section"><div className="about-section-intro"><div><p className="kicker">{text.teamKicker}</p><h2>{text.teamHeading}</h2></div><p>{text.teamIntro}</p></div>{content.isLoading ? <div className="about-loading">Loading the team board…</div> : <div className="about-profile-grid">{members.map((member, index) => <ProfileCard key={member.id ?? member.position} member={member} index={index} />)}</div>}</section><section className="about-join-note"><div><UsersRound size={25} /><p className="kicker">{text.joinKicker}</p><h2>{text.joinHeading}</h2><p>{text.joinBody}</p></div><a href="https://forms.gle/ZnfzPQnNQNVfWABXA" target="_blank" rel="noreferrer">{text.volunteerLabel} <ChevronDown size={18} /></a></section></main><footer className="about-footer"><span>© {new Date().getFullYear()} {appearance.siteName}</span><a href="/">{text.footerTagline}</a><a className="about-footer-staff" href="/admin">Staff sign in <span>☺</span></a><span>Atlanta, Georgia</span></footer></div>;
}
