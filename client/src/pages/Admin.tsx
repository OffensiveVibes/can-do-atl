import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import SortableProfilesBoard from "@/components/ProfilesBoard";
import AdminRequestBoard from "@/components/AdminRequestBoard";
import { SITE_TEXT_DEFAULTS, type SiteTextKey, type SiteTextValues } from "@shared/siteText";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
  Facebook,
  FileText,
  Globe2,
  ImagePlus,
  Images,
  Instagram,
  Link as LinkIcon,
  Linkedin,
  Loader2,
  LockKeyhole,
  MailPlus,
  MapPin,
  Music2,
  Pencil,
  Palette,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
  UsersRound,
  X,
  Youtube,
} from "lucide-react";

type Tab = "events" | "slides" | "updates" | "impact" | "text" | "appearance" | "members" | "requests" | "team";
type SlideItem = { id: number; eyebrow: string; headline: string; accent: string | null; body: string; imageUrl: string; imageKey: string | null; imageAlt: string; volunteerHref: string | null; donateHref: string | null; position: number; isPublished: boolean };
type EventItem = { id: number; title: string; campus: string; details: string | null; startsAt: Date; endsAt: Date | null; linkHref: string | null; isPublished: boolean };
type UpdateItem = { id: number; title: string; body: string; linkLabel: string | null; linkHref: string | null; status: "draft" | "published" };
type ImpactMetricKey = "care_packages" | "clothing_items" | "student_volunteers";
type ImpactMetricItem = { metricKey: ImpactMetricKey; value: number; label: string; position: number };
type TeamMemberItem = { id: number; name: string; role: string; bio: string | null; imageUrl: string | null; imageKey: string | null; linkedinUrl: string | null; instagramUrl: string | null; facebookUrl: string | null; tiktokUrl: string | null; youtubeUrl: string | null; websiteUrl: string | null; position: number; isPublished: boolean };
type AppearanceItem = { siteName: string; tabTitle: string; logoUrl?: string | null; logoKey?: string | null; logoAlt: string; primaryColor: string; accentColor: string; highlightColor: string; inkColor: string; buttonShape: "pill" | "soft" | "square"; pageMode: "solid" | "gradient" | "image"; pageColor: string; pageGradientFrom: string; pageGradientTo: string; pageImageUrl?: string | null; pageImageKey?: string | null; pageImageBlur: number; pageOverlayOpacity: number; headerMode: "solid" | "gradient" | "image"; headerColor: string; headerGradientFrom: string; headerGradientTo: string; headerImageUrl?: string | null; headerImageKey?: string | null; headerImageBlur: number; headerOverlayOpacity: number; footerMode: "solid" | "gradient" | "image"; footerColor: string; footerGradientFrom: string; footerGradientTo: string; footerImageUrl?: string | null; footerImageKey?: string | null; footerImageBlur: number; footerOverlayOpacity: number };
type ServiceCardItem = { cardKey: "food_drives" | "clothing_closet" | "community_outreach"; imageUrl: string; imageKey?: string | null; hoverImageUrl: string; hoverImageKey?: string | null; imageAlt: string; position: number };

const primaryImage = "/manus-storage/cando-hero-atl_b12524b6.png";

function toLocalInputValue(value?: Date | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function inputToDate(value: string) {
  return value ? new Date(value) : undefined;
}

function readImageFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("The selected image could not be read."));
    reader.readAsDataURL(file);
  });
}

function AdminGate() {
  const { user, loading, logout } = useAuth();
  const [requestEmail, setRequestEmail] = useState("");
  const [requestNote, setRequestNote] = useState("");
  const access = trpc.access.status.useQuery(undefined, { enabled: Boolean(user) });
  const submitRequest = trpc.access.submitRequest.useMutation({ onSuccess: () => { toast.success("Your administrator request was saved for staff review."); setRequestEmail(""); setRequestNote(""); }, onError: (error) => toast.error(error.message || "Your request could not be submitted.") });
  const accept = trpc.access.acceptInvitation.useMutation({
    onSuccess: (result) => {
      if (result.activated) {
        toast.success("Access activated. Reloading your workspace…");
        window.setTimeout(() => window.location.reload(), 550);
      } else {
        toast.error("This account does not have an active administrator invitation.");
      }
    },
  });
  const switchAccount = async () => {
    await logout();
    startLogin();
  };

  if (loading || (user && access.isLoading)) {
    return <div className="admin-loading"><Loader2 className="animate-spin" /> Loading workspace…</div>;
  }
  if (!user) {
    return (
      <main className="admin-access-page">
        <div className="access-paper">
          <div className="access-icon"><LockKeyhole size={28} /></div>
          <p className="admin-kicker">Can Do ATL workspace</p>
          <h1>Sign in to manage the site.</h1>
          <p><strong>You must be an administrator to sign in.</strong> To formally request administrator access, submit your email below or email <a href="mailto:candoatltm@gmail.com">candoatltm@gmail.com</a>.</p>
          <button className="admin-button admin-button-primary" onClick={() => startLogin()}>
            Sign in securely <ChevronRight size={18} />
          </button>
          <a href="/" className="admin-back-link">Return to public site</a>
          <div className="access-request-form"><p className="admin-kicker">Request administrator access</p><label>Email address<input type="email" value={requestEmail} onChange={(event) => setRequestEmail(event.target.value)} placeholder="name@example.edu" /></label><label>Optional note<textarea value={requestNote} onChange={(event) => setRequestNote(event.target.value)} placeholder="Tell the team how you would help." /></label><button className="admin-button admin-button-secondary" onClick={() => { if (!requestEmail.trim()) return toast.error("Enter your email address."); submitRequest.mutate({ email: requestEmail, note: requestNote }); }} disabled={submitRequest.isPending}>{submitRequest.isPending ? <Loader2 className="animate-spin" size={18} /> : <MailPlus size={18} />} Submit request</button></div>
        </div>
      </main>
    );
  }
  if (!access.data?.canEdit) {
    const pending = access.data?.inviteStatus === "pending";
    return (
      <main className="admin-access-page">
        <div className="access-paper">
          <div className="access-icon"><ShieldCheck size={28} /></div>
          <p className="admin-kicker">Account access</p>
          <h1>Your dashboard is invite-only.</h1>
          <p>
            {pending
              ? "An administrator invitation was found for this account. Activate it to enter the workspace."
              : "Ask the primary Can Do ATL administrator to add your email before attempting to access this workspace."}
          </p>
          {pending && (
            <button className="admin-button admin-button-primary" onClick={() => accept.mutate()} disabled={accept.isPending}>
              {accept.isPending ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />} Activate invitation
            </button>
          )}
          <button className="admin-button admin-button-secondary" onClick={switchAccount}>
            Sign out and use another email <ChevronRight size={18} />
          </button>
          <a href="/" className="admin-back-link">Return to public site</a>
        </div>
      </main>
    );
  }
  return <DashboardLayout><AdminWorkspace primary={access.data.primary} /></DashboardLayout>;
}

function AdminWorkspace({ primary }: { primary: boolean }) {
  const [tab, setTab] = useState<Tab>("events");
  const adminContent = trpc.content.admin.useQuery();
  const accessRequests = trpc.access.listRequests.useQuery();
  const utils = trpc.useUtils();
  const invalidate = async () => {
    await Promise.all([utils.content.admin.invalidate(), utils.content.public.invalidate()]);
  };
  const counts = useMemo(() => ({
    events: adminContent.data?.events.filter((event) => event.isPublished).length ?? 0,
    slides: adminContent.data?.slides.filter((slide) => slide.isPublished).length ?? 0,
    updates: adminContent.data?.updates.filter((update) => update.status === "published").length ?? 0,
    impact: adminContent.data?.impactMetrics.length ?? 3,
  }), [adminContent.data]);

  if (adminContent.isLoading) return <div className="admin-loading"><Loader2 className="animate-spin" /> Preparing your content board…</div>;
  if (adminContent.error) return <div className="admin-loading admin-error"><CircleAlert /> The content board could not load. Refresh and try again.</div>;

  return (
    <div className="admin-workspace">
      <header className="admin-topbar">
        <div>
          <p className="admin-kicker">Can Do ATL</p>
          <h1>Content workspace</h1>
          <p>Publish changes when the work is ready. The public site updates right away.</p>
        </div>
        <a className="admin-public-link" href="/" target="_blank" rel="noreferrer">View public site <ChevronRight size={16} /></a>
      </header>

      <div className="admin-stat-strip">
        <button onClick={() => setTab("events")} className={tab === "events" ? "active" : ""}><CalendarDays /><span><b>{counts.events}</b> live events</span></button>
        <button onClick={() => setTab("slides")} className={tab === "slides" ? "active" : ""}><Images /><span><b>{counts.slides}</b> carousel slides</span></button>
        <button onClick={() => setTab("updates")} className={tab === "updates" ? "active" : ""}><FileText /><span><b>{counts.updates}</b> site updates</span></button>
        <button onClick={() => setTab("impact")} className={tab === "impact" ? "active" : ""}><BarChart3 /><span><b>{counts.impact}</b> impact counters</span></button>
      </div>

      <div className="admin-tabs" role="tablist" aria-label="Content areas">
        <button role="tab" aria-selected={tab === "events"} className={tab === "events" ? "selected" : ""} onClick={() => setTab("events")}><CalendarDays size={16} /> Events</button>
        <button role="tab" aria-selected={tab === "slides"} className={tab === "slides" ? "selected" : ""} onClick={() => setTab("slides")}><Images size={16} /> Hero carousel</button>
        <button role="tab" aria-selected={tab === "updates"} className={tab === "updates" ? "selected" : ""} onClick={() => setTab("updates")}><FileText size={16} /> Updates</button>
        <button role="tab" aria-selected={tab === "impact"} className={tab === "impact" ? "selected" : ""} onClick={() => setTab("impact")}><BarChart3 size={16} /> Impact</button>
        <button role="tab" aria-selected={tab === "text"} className={tab === "text" ? "selected" : ""} onClick={() => setTab("text")}><FileText size={16} /> Website text</button>
        <button role="tab" aria-selected={tab === "appearance"} className={tab === "appearance" ? "selected" : ""} onClick={() => setTab("appearance")}><Palette size={16} /> Design &amp; brand</button>
        <button role="tab" aria-selected={tab === "members"} className={tab === "members" ? "selected" : ""} onClick={() => setTab("members")}><UsersRound size={16} /> Team profiles</button>
        <button role="tab" aria-selected={tab === "requests"} className={tab === "requests" ? "selected" : ""} onClick={() => setTab("requests")}><MailPlus size={16} /> Requests {accessRequests.data?.filter((item) => item.status === "pending").length ? `(${accessRequests.data.filter((item) => item.status === "pending").length})` : ""}</button>
        {primary && <button role="tab" aria-selected={tab === "team"} className={tab === "team" ? "selected" : ""} onClick={() => setTab("team")}><UsersRound size={16} /> Admin access</button>}
      </div>

      {tab === "events" && <EventsBoard events={adminContent.data?.events ?? []} onDone={invalidate} />}
      {tab === "slides" && <SlidesBoard slides={adminContent.data?.slides ?? []} onDone={invalidate} />}
      {tab === "updates" && <UpdatesBoard updates={adminContent.data?.updates ?? []} onDone={invalidate} />}
      {tab === "impact" && <ImpactBoard metrics={(adminContent.data?.impactMetrics ?? []) as ImpactMetricItem[]} onDone={invalidate} />}
      {tab === "text" && <WebsiteTextBoard values={{ ...SITE_TEXT_DEFAULTS, ...(adminContent.data?.siteText ?? {}) } as SiteTextValues} onDone={invalidate} />}
      {tab === "appearance" && <AppearanceBoard appearance={adminContent.data?.appearance as AppearanceItem} cards={(adminContent.data?.serviceCards ?? []) as ServiceCardItem[]} onDone={invalidate} />}
      {tab === "members" && <SortableProfilesBoard members={(adminContent.data?.teamMembers ?? []) as TeamMemberItem[]} onDone={invalidate} />}
      {tab === "requests" && <AdminRequestBoard requests={(accessRequests.data ?? []) as any} />}
      {tab === "team" && primary && <TeamBoard />}
    </div>
  );
}

const impactNames: Record<ImpactMetricKey, string> = {
  care_packages: "Care packages shared",
  clothing_items: "Clothing items recirculated",
  student_volunteers: "Student volunteers",
};

const websiteTextGroups: Array<{ title: string; copy: string; fields: Array<{ key: SiteTextKey; label: string; multiline?: boolean }> }> = [
  { title: "Home page sections", copy: "Update the core homepage headings and supporting text.", fields: [
    { key: "heroNote", label: "Hero note" }, { key: "whatWeDoKicker", label: "What We Do label" }, { key: "whatWeDoHeading", label: "What We Do heading" }, { key: "whatWeDoBody", label: "What We Do description", multiline: true },
    { key: "impactKicker", label: "Impact label" }, { key: "impactHeading", label: "Impact heading" }, { key: "impactBody", label: "Impact description", multiline: true }, { key: "impactBadge", label: "Impact badge" },
    { key: "eventsKicker", label: "Events label" }, { key: "eventsHeading", label: "Events heading" }, { key: "eventsBody", label: "Events description", multiline: true },
  ] },
  { title: "Stories and quotations", copy: "Edit the three story-card quotes that rotate on the public homepage.", fields: [
    { key: "storiesKicker", label: "Stories label" }, { key: "storiesHeading", label: "Stories heading" }, { key: "storiesBody", label: "Stories introduction", multiline: true },
    { key: "storyOneTitle", label: "Story 1 title" }, { key: "storyOneBody", label: "Story 1 quote", multiline: true }, { key: "storyOneContext", label: "Story 1 caption" },
    { key: "storyTwoTitle", label: "Story 2 title" }, { key: "storyTwoBody", label: "Story 2 quote", multiline: true }, { key: "storyTwoContext", label: "Story 2 caption" },
    { key: "storyThreeTitle", label: "Story 3 title" }, { key: "storyThreeBody", label: "Story 3 quote", multiline: true }, { key: "storyThreeContext", label: "Story 3 caption" },
  ] },
  { title: "Calls to action and footer", copy: "Set the action panel wording and the public footer text.", fields: [
    { key: "actionKicker", label: "Action panel label" }, { key: "actionHeading", label: "Action panel heading" }, { key: "actionBody", label: "Action panel description", multiline: true },
    { key: "volunteerLabel", label: "Volunteer button label" }, { key: "volunteerSubtext", label: "Volunteer button subtext" }, { key: "essentialsLabel", label: "Essentials button label" }, { key: "essentialsSubtext", label: "Essentials button subtext" },
    { key: "footerDescription", label: "Footer description", multiline: true }, { key: "socialHelper", label: "Social prompt" }, { key: "footerTagline", label: "Footer tagline" },
  ] },
  { title: "About Us page", copy: "Manage the public About page introduction, team heading, and volunteer invitation.", fields: [
    { key: "aboutHeading", label: "About heading" }, { key: "aboutIntro", label: "About introduction", multiline: true }, { key: "teamKicker", label: "Team label" }, { key: "teamHeading", label: "Team heading" }, { key: "teamIntro", label: "Team introduction", multiline: true },
    { key: "joinKicker", label: "Join label" }, { key: "joinHeading", label: "Join heading" }, { key: "joinBody", label: "Join description", multiline: true },
  ] },
];

function WebsiteTextBoard({ values, onDone }: { values: SiteTextValues; onDone: () => Promise<void> }) {
  const [draft, setDraft] = useState<SiteTextValues>(values);
  const update = trpc.content.updateSiteText.useMutation({ onSuccess: async () => { toast.success("Website text is live on the public site."); await onDone(); }, onError: (error) => toast.error(error.message || "Website text could not be saved.") });
  useEffect(() => setDraft(values), [values]);
  const setValue = (key: SiteTextKey, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  const save = () => {
    const entries = Object.entries(draft).map(([textKey, value]) => ({ textKey: textKey as SiteTextKey, value: value.trim() }));
    if (entries.some((entry) => !entry.value)) return toast.error("Keep every public text field filled in so visitors never see a blank section.");
    update.mutate({ entries });
  };
  return <section className="admin-board"><div className="admin-board-intro"><p className="admin-kicker">Website copy</p><h2>Change the words without touching code.</h2><p>Use these simple fields for general public wording, quotes, calls to action, and About Us copy. Events, updates, carousel slides, impact counts, team profiles, and visual settings stay in their own workspace tabs.</p></div><div className="website-text-groups">{websiteTextGroups.map((group) => <article className="website-text-card" key={group.title}><div className="form-card-title"><div><h3>{group.title}</h3><p>{group.copy}</p></div><FileText size={18} /></div><div className="website-text-fields">{group.fields.map((field) => <label key={field.key}>{field.label}{field.multiline ? <textarea value={draft[field.key]} onChange={(event) => setValue(field.key, event.target.value)} /> : <input value={draft[field.key]} onChange={(event) => setValue(field.key, event.target.value)} />}</label>)}</div></article>)}</div><div className="appearance-save-row"><p>Every field is public-facing. Read each change once before saving.</p><button className="admin-button admin-button-primary" onClick={save} disabled={update.isPending}>{update.isPending ? <Loader2 className="animate-spin" size={17} /> : <Save size={17} />} Save website text</button></div></section>;
}

function ImpactBoard({ metrics, onDone }: { metrics: ImpactMetricItem[]; onDone: () => Promise<void> }) {
  const [draft, setDraft] = useState<ImpactMetricItem[]>(metrics);
  const update = trpc.content.updateImpactMetrics.useMutation({
    onSuccess: async () => {
      toast.success("Impact counters are live on the public site.");
      await onDone();
    },
    onError: () => toast.error("Impact counters could not be saved. Please try again."),
  });

  useEffect(() => setDraft(metrics), [metrics]);

  const editMetric = (metricKey: ImpactMetricKey, field: "value" | "label", nextValue: string) => {
    setDraft((current) => current.map((metric) => {
      if (metric.metricKey !== metricKey) return metric;
      return field === "value"
        ? { ...metric, value: Math.max(0, Number.parseInt(nextValue || "0", 10) || 0) }
        : { ...metric, label: nextValue };
    }));
  };
  const save = () => {
    if (draft.length !== 3 || draft.some((metric) => metric.label.trim().length < 4)) {
      toast.error("Keep all three counters and add a clear public description for each one.");
      return;
    }
    update.mutate({ metrics: draft.map((metric) => ({ ...metric, label: metric.label.trim() })) });
  };

  return <section className="admin-board"><div className="admin-board-intro"><p className="admin-kicker">Impact reporting</p><h2>Tell the truth, then grow it.</h2><p>Update these counts only when you have confirmed totals. Every change appears in the public impact section right away.</p></div><div className="admin-list-card impact-editor-card"><div className="list-card-title"><h3>Public impact counters</h3><span>{draft.length}</span></div><div className="impact-editor-grid">{[...draft].sort((a, b) => a.position - b.position).map((metric) => <article className="impact-editor-item" key={metric.metricKey}><div><span className="impact-editor-index">0{metric.position + 1}</span><h4>{impactNames[metric.metricKey]}</h4></div><label>Confirmed count<input type="number" min="0" inputMode="numeric" value={metric.value} onChange={(event) => editMetric(metric.metricKey, "value", event.target.value)} /></label><label>Public description<input value={metric.label} onChange={(event) => editMetric(metric.metricKey, "label", event.target.value)} /></label></article>)}</div><div className="impact-editor-footer"><p>Use zero when activity has not started yet. Never estimate a count.</p><button className="admin-button admin-button-primary" onClick={save} disabled={update.isPending}>{update.isPending ? <Loader2 className="animate-spin" size={17} /> : <Save size={17} />} Save impact counts</button></div></div></section>;
}

function EventsBoard({ events, onDone }: { events: EventItem[]; onDone: () => Promise<void> }) {
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [title, setTitle] = useState("");
  const [campus, setCampus] = useState("Georgia Tech");
  const [details, setDetails] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [linkHref, setLinkHref] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const create = trpc.content.createEvent.useMutation({ onSuccess: async () => { toast.success("Event added to the content board."); clear(); await onDone(); } });
  const update = trpc.content.updateEvent.useMutation({ onSuccess: async () => { toast.success("Event saved."); clear(); await onDone(); } });
  const remove = trpc.content.deleteEvent.useMutation({ onSuccess: onDone });
  const busy = create.isPending || update.isPending;
  const clear = () => { setEditing(null); setTitle(""); setCampus("Georgia Tech"); setDetails(""); setStartsAt(""); setEndsAt(""); setLinkHref(""); setIsPublished(true); };
  const edit = (event: EventItem) => { setEditing(event); setTitle(event.title); setCampus(event.campus); setDetails(event.details ?? ""); setStartsAt(toLocalInputValue(event.startsAt)); setEndsAt(toLocalInputValue(event.endsAt)); setLinkHref(event.linkHref ?? ""); setIsPublished(event.isPublished); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const save = () => {
    if (!title.trim() || !campus.trim() || !startsAt) return toast.error("Add a title, campus, and start time.");
    const data = { title, campus, details, startsAt: inputToDate(startsAt)!, endsAt: inputToDate(endsAt), linkHref, isPublished };
    editing ? update.mutate({ id: editing.id, data }) : create.mutate(data);
  };
  return <section className="admin-board"><div className="admin-board-intro"><p className="admin-kicker">Upcoming dates</p><h2>Keep the campus trail current.</h2><p>Create an event once, then revise or remove it any time. Published dates appear on the public site in chronological order.</p></div><div className="admin-two-column"><div className="admin-form-card"><div className="form-card-title"><h3>{editing ? "Edit event" : "Add an event"}</h3>{editing && <button onClick={clear}><X size={16} /> Cancel edit</button>}</div><label>Event title<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Spring pantry pop-up" /></label><div className="form-row"><label>Campus<select value={campus} onChange={(e) => setCampus(e.target.value)}><option>Georgia Tech</option><option>Georgia State</option><option>Kennesaw State</option><option>Multi-campus</option></select></label><label className="toggle-label"><span>Visible on site</span><input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} /></label></div><label>Start date and time<input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} /></label><label>End date and time <small>Optional</small><input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} /></label><label>Details <small>Optional</small><textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="What should students know before they arrive?" /></label><label>Action link <small>Optional</small><input value={linkHref} onChange={(e) => setLinkHref(e.target.value)} placeholder="https://…" /></label><button className="admin-button admin-button-primary" onClick={save} disabled={busy}>{busy ? <Loader2 className="animate-spin" size={17} /> : <Save size={17} />}{editing ? "Save event" : "Add event"}</button></div><div className="admin-list-card"><div className="list-card-title"><h3>All events</h3><span>{events.length}</span></div>{events.length ? <div className="content-list">{events.map((event) => <article className="content-row" key={event.id}><div className="date-square"><b>{new Date(event.startsAt).toLocaleDateString(undefined, { month: "short" }).toUpperCase()}</b><strong>{new Date(event.startsAt).getDate()}</strong></div><div className="content-row-main"><div><h4>{event.title}</h4><span className={event.isPublished ? "status-published" : "status-draft"}>{event.isPublished ? "Live" : "Hidden"}</span></div><p><MapPin size={14} /> {event.campus} · {new Date(event.startsAt).toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" })}</p></div><div className="row-actions"><button aria-label={`Edit ${event.title}`} onClick={() => edit(event)}><Pencil size={15} /></button><button aria-label={`Delete ${event.title}`} className="danger" onClick={() => { if (window.confirm("Remove this event?")) remove.mutate({ id: event.id }); }}><Trash2 size={15} /></button></div></article>)}</div> : <EmptyState icon={CalendarDays} title="No events yet" copy="Add the next food drive, closet pop-up, or outreach shift from the form." />}</div></div></section>;
}

function SlidesBoard({ slides, onDone }: { slides: SlideItem[]; onDone: () => Promise<void> }) {
  const [editing, setEditing] = useState<SlideItem | null>(null);
  const [eyebrow, setEyebrow] = useState("Student-led mutual aid across ATL");
  const [headline, setHeadline] = useState("Small supplies.");
  const [accent, setAccent] = useState("Shared strength.");
  const [body, setBody] = useState("Can Do ATL brings students together to combat food and clothing insecurity across Georgia Tech, Georgia State, and Kennesaw State.");
  const [imageUrl, setImageUrl] = useState(primaryImage);
  const [imageKey, setImageKey] = useState("");
  const [imageAlt, setImageAlt] = useState("Students sharing food, clothing, and care supplies");
  const [position, setPosition] = useState(0);
  const [isPublished, setIsPublished] = useState(true);
  const upload = trpc.content.uploadHeroImage.useMutation();
  const create = trpc.content.createSlide.useMutation({ onSuccess: async () => { toast.success("Hero slide saved. It will rotate every four seconds when live."); clear(); await onDone(); } });
  const update = trpc.content.updateSlide.useMutation({ onSuccess: async () => { toast.success("Hero slide saved."); clear(); await onDone(); } });
  const remove = trpc.content.deleteSlide.useMutation({ onSuccess: onDone });
  const busy = create.isPending || update.isPending || upload.isPending;
  const clear = () => { setEditing(null); setEyebrow("Student-led mutual aid across ATL"); setHeadline("Small supplies."); setAccent("Shared strength."); setBody("Can Do ATL brings students together to combat food and clothing insecurity across Georgia Tech, Georgia State, and Kennesaw State."); setImageUrl(primaryImage); setImageKey(""); setImageAlt("Students sharing food, clothing, and care supplies"); setPosition(slides.length); setIsPublished(true); };
  const edit = (slide: SlideItem) => { setEditing(slide); setEyebrow(slide.eyebrow); setHeadline(slide.headline); setAccent(slide.accent ?? ""); setBody(slide.body); setImageUrl(slide.imageUrl); setImageKey(slide.imageKey ?? ""); setImageAlt(slide.imageAlt); setPosition(slide.position); setIsPublished(slide.isPublished); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const chooseFile = async (file?: File) => { if (!file) return; try { const dataUrl = await readImageFile(file); const uploaded = await upload.mutateAsync({ dataUrl }); setImageUrl(uploaded.url); setImageKey(uploaded.key); toast.success("Image uploaded. Add or save the slide to publish it."); } catch (error) { toast.error(error instanceof Error ? error.message : "Upload failed."); } };
  const save = () => { if (!headline.trim() || !eyebrow.trim() || !body.trim() || !imageUrl.trim() || !imageAlt.trim()) return toast.error("Complete the headline, summary, image, and image description."); const data = { eyebrow, headline, accent, body, imageUrl, imageKey, imageAlt, volunteerHref: "https://forms.gle/ZnfzPQnNQNVfWABXA", donateHref: "mailto:candoatltm@gmail.com?subject=Can%20Do%20ATL%20Essentials%20Donation", position: Number(position), isPublished }; editing ? update.mutate({ id: editing.id, data }) : create.mutate(data); };
  return <section className="admin-board"><div className="admin-board-intro"><p className="admin-kicker">Homepage motion</p><h2>Build the first impression.</h2><p>Every live slide advances automatically after four seconds. Add as many image slides as you need; each image becomes its own story in the public carousel.</p></div><div className="admin-two-column"><div className="admin-form-card"><div className="form-card-title"><h3>{editing ? "Edit hero slide" : "Add a hero slide"}</h3>{editing && <button onClick={clear}><X size={16} /> Cancel edit</button>}</div><label>Eyebrow<input value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} /></label><label>Main headline<input value={headline} onChange={(e) => setHeadline(e.target.value)} /></label><label>Accent line <small>Optional</small><input value={accent} onChange={(e) => setAccent(e.target.value)} /></label><label>Summary<textarea value={body} onChange={(e) => setBody(e.target.value)} /></label><div className="upload-zone"><img src={imageUrl} alt="" /><div><span className="upload-icon"><ImagePlus size={19} /></span><b>Hero image</b><p>PNG, JPEG, or WebP under 4.5 MB. Add every photo as its own slide.</p><label className="upload-button"><Upload size={15} /> {upload.isPending ? "Uploading…" : "Choose image"}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => chooseFile(e.target.files?.[0])} /></label></div></div><label>Image description<input value={imageAlt} onChange={(e) => setImageAlt(e.target.value)} /></label><div className="form-row"><label>Order<input type="number" min="0" value={position} onChange={(e) => setPosition(Number(e.target.value))} /></label><label className="toggle-label"><span>Visible on site</span><input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} /></label></div><button className="admin-button admin-button-primary" onClick={save} disabled={busy}>{busy ? <Loader2 className="animate-spin" size={17} /> : <Save size={17} />}{editing ? "Save slide" : "Add slide"}</button></div><div className="admin-list-card"><div className="list-card-title"><h3>Carousel queue</h3><span>{slides.length}</span></div>{slides.length ? <div className="slide-list">{slides.map((slide) => <article className="slide-row" key={slide.id}><img src={slide.imageUrl} alt="" /><div><div><span className={slide.isPublished ? "status-published" : "status-draft"}>{slide.isPublished ? "Live" : "Hidden"}</span><small>Slide {slide.position + 1}</small></div><h4>{slide.headline} {slide.accent}</h4><p>{slide.eyebrow}</p></div><div className="row-actions"><button aria-label={`Edit ${slide.headline}`} onClick={() => edit(slide)}><Pencil size={15} /></button><button aria-label={`Delete ${slide.headline}`} className="danger" onClick={() => { if (window.confirm("Remove this carousel slide?")) remove.mutate({ id: slide.id }); }}><Trash2 size={15} /></button></div></article>)}</div> : <EmptyState icon={Images} title="Your carousel starts here" copy="Add every photo as its own published slide. The public carousel will loop through them every four seconds." />}</div></div></section>;
}

function UpdatesBoard({ updates, onDone }: { updates: UpdateItem[]; onDone: () => Promise<void> }) {
  const [editing, setEditing] = useState<UpdateItem | null>(null);
  const [title, setTitle] = useState(""); const [body, setBody] = useState(""); const [linkLabel, setLinkLabel] = useState(""); const [linkHref, setLinkHref] = useState(""); const [status, setStatus] = useState<"draft" | "published">("published");
  const create = trpc.content.createUpdate.useMutation({ onSuccess: async () => { toast.success("Site update saved."); clear(); await onDone(); } }); const update = trpc.content.updateUpdate.useMutation({ onSuccess: async () => { toast.success("Site update saved."); clear(); await onDone(); } }); const remove = trpc.content.deleteUpdate.useMutation({ onSuccess: onDone }); const busy = create.isPending || update.isPending;
  const clear = () => { setEditing(null); setTitle(""); setBody(""); setLinkLabel(""); setLinkHref(""); setStatus("published"); }; const edit = (item: UpdateItem) => { setEditing(item); setTitle(item.title); setBody(item.body); setLinkLabel(item.linkLabel ?? ""); setLinkHref(item.linkHref ?? ""); setStatus(item.status); window.scrollTo({ top: 0, behavior: "smooth" }); }; const save = () => { if (!title.trim() || !body.trim()) return toast.error("Add a title and a message."); const data = { title, body, linkLabel, linkHref, status }; editing ? update.mutate({ id: editing.id, data }) : create.mutate(data); };
  return <section className="admin-board"><div className="admin-board-intro"><p className="admin-kicker">Website notes</p><h2>Share the latest with care.</h2><p>Post quick site-wide messages about a drive, campus resource, volunteer call, or partnership. Draft anything that needs another pass.</p></div><div className="admin-two-column"><div className="admin-form-card"><div className="form-card-title"><h3>{editing ? "Edit update" : "Write an update"}</h3>{editing && <button onClick={clear}><X size={16} /> Cancel edit</button>}</div><label>Headline<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. New pantry hours this week" /></label><label>Message<textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Keep this practical, direct, and helpful." /></label><div className="form-row"><label>Link label <small>Optional</small><input value={linkLabel} onChange={(e) => setLinkLabel(e.target.value)} placeholder="Learn more" /></label><label>Link URL <small>Optional</small><input value={linkHref} onChange={(e) => setLinkHref(e.target.value)} placeholder="https://…" /></label></div><label>Status<select value={status} onChange={(e) => setStatus(e.target.value as "draft" | "published")}><option value="published">Publish now</option><option value="draft">Save as draft</option></select></label><button className="admin-button admin-button-primary" onClick={save} disabled={busy}>{busy ? <Loader2 className="animate-spin" size={17} /> : <Save size={17} />}{editing ? "Save update" : "Publish update"}</button></div><div className="admin-list-card"><div className="list-card-title"><h3>Recent updates</h3><span>{updates.length}</span></div>{updates.length ? <div className="update-list">{updates.map((item) => <article className="update-row" key={item.id}><div><div><span className={item.status === "published" ? "status-published" : "status-draft"}>{item.status}</span><FileText size={15} /></div><h4>{item.title}</h4><p>{item.body}</p>{item.linkLabel && <span className="update-link"><LinkIcon size={13} /> {item.linkLabel}</span>}</div><div className="row-actions"><button aria-label={`Edit ${item.title}`} onClick={() => edit(item)}><Pencil size={15} /></button><button aria-label={`Delete ${item.title}`} className="danger" onClick={() => { if (window.confirm("Remove this update?")) remove.mutate({ id: item.id }); }}><Trash2 size={15} /></button></div></article>)}</div> : <EmptyState icon={FileText} title="No updates yet" copy="Your next message will appear here and on the public site once published." />}</div></div></section>;
}

function ProfilesBoard({ members, onDone }: { members: TeamMemberItem[]; onDone: () => Promise<void> }) {
  const [editing, setEditing] = useState<TeamMemberItem | null>(null);
  const [name, setName] = useState("Team member slot"); const [role, setRole] = useState("Add a role in Admin"); const [bio, setBio] = useState("This is an editable placeholder profile. Add a photo, name, role, introduction, and social links from the staff workspace."); const [imageUrl, setImageUrl] = useState(""); const [imageKey, setImageKey] = useState(""); const [linkedinUrl, setLinkedinUrl] = useState(""); const [instagramUrl, setInstagramUrl] = useState(""); const [facebookUrl, setFacebookUrl] = useState(""); const [tiktokUrl, setTiktokUrl] = useState(""); const [youtubeUrl, setYoutubeUrl] = useState(""); const [websiteUrl, setWebsiteUrl] = useState(""); const [position, setPosition] = useState(members.length); const [isPublished, setIsPublished] = useState(true);
  const upload = trpc.content.uploadTeamImage.useMutation({ onError: (error) => toast.error(error.message || "Profile image upload failed.") }); const create = trpc.content.createTeamMember.useMutation({ onSuccess: async () => { toast.success("Team profile added."); clear(); await onDone(); }, onError: (error) => toast.error(error.message || "Profile could not be added. Use complete https:// links for social fields.") }); const update = trpc.content.updateTeamMember.useMutation({ onSuccess: async () => { toast.success("Team profile saved."); clear(); await onDone(); }, onError: (error) => toast.error(error.message || "Profile could not be saved. Use complete https:// links for social fields.") }); const remove = trpc.content.deleteTeamMember.useMutation({ onSuccess: onDone, onError: (error) => toast.error(error.message || "Profile could not be removed.") }); const busy = upload.isPending || create.isPending || update.isPending;
  const clear = () => { setEditing(null); setName("Team member slot"); setRole("Add a role in Admin"); setBio("This is an editable placeholder profile. Add a photo, name, role, introduction, and social links from the staff workspace."); setImageUrl(""); setImageKey(""); setLinkedinUrl(""); setInstagramUrl(""); setFacebookUrl(""); setTiktokUrl(""); setYoutubeUrl(""); setWebsiteUrl(""); setPosition(members.length); setIsPublished(true); };
  const edit = (member: TeamMemberItem) => { setEditing(member); setName(member.name); setRole(member.role); setBio(member.bio ?? ""); setImageUrl(member.imageUrl ?? ""); setImageKey(member.imageKey ?? ""); setLinkedinUrl(member.linkedinUrl ?? ""); setInstagramUrl(member.instagramUrl ?? ""); setFacebookUrl(member.facebookUrl ?? ""); setTiktokUrl(member.tiktokUrl ?? ""); setYoutubeUrl(member.youtubeUrl ?? ""); setWebsiteUrl(member.websiteUrl ?? ""); setPosition(member.position); setIsPublished(member.isPublished); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const chooseFile = async (file?: File) => { if (!file) return; try { const dataUrl = await readImageFile(file); const uploaded = await upload.mutateAsync({ dataUrl }); setImageUrl(uploaded.url); setImageKey(uploaded.key); toast.success("Profile image uploaded. Save the profile to publish it."); } catch (error) { toast.error(error instanceof Error ? error.message : "Upload failed."); } };
  const save = () => { if (!name.trim() || !role.trim()) return toast.error("Add a name and a role for this profile."); const data = { name, role, bio, imageUrl, imageKey, linkedinUrl, instagramUrl, facebookUrl, tiktokUrl, youtubeUrl, websiteUrl, position: Number(position), isPublished }; editing ? update.mutate({ id: editing.id, data }) : create.mutate(data); };
  return <section className="admin-board"><div className="admin-board-intro"><p className="admin-kicker">About Us directory</p><h2>Make your team visible.</h2><p>Add every person as a profile. Their image, role, introduction, and linked social spaces appear on the expandable public About Us page.</p></div><div className="admin-two-column"><div className="admin-form-card profile-form-card"><div className="form-card-title"><h3>{editing ? "Edit profile" : "Add a profile"}</h3>{editing && <button onClick={clear}><X size={16} /> Cancel edit</button>}</div><label>Name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" /></label><label>Role in the organization<input value={role} onChange={(event) => setRole(event.target.value)} placeholder="e.g. Co-founder & outreach lead" /></label><div className="upload-zone profile-upload-zone">{imageUrl ? <img src={imageUrl} alt="Profile preview" /> : <div className="profile-image-placeholder"><ImagePlus size={23} /><span>Image slot</span></div>}<div><b>Profile image</b><p>PNG, JPEG, or WebP under 4.5 MB.</p><label className="upload-button"><Upload size={15} /> {upload.isPending ? "Uploading…" : "Choose image"}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => chooseFile(event.target.files?.[0])} /></label></div></div><label>Short introduction <small>Shown after a visitor expands the profile</small><textarea value={bio} onChange={(event) => setBio(event.target.value)} placeholder="A few lines about their work with Can Do ATL." /></label><p className="profile-social-title">Linked social spaces <small>Optional; only filled links appear publicly</small></p><div className="profile-social-fields"><label><Linkedin size={14} /> LinkedIn<input value={linkedinUrl} onChange={(event) => setLinkedinUrl(event.target.value)} placeholder="https://linkedin.com/in/..." /></label><label><Instagram size={14} /> Instagram<input value={instagramUrl} onChange={(event) => setInstagramUrl(event.target.value)} placeholder="https://instagram.com/..." /></label><label><Facebook size={14} /> Facebook<input value={facebookUrl} onChange={(event) => setFacebookUrl(event.target.value)} placeholder="https://facebook.com/..." /></label><label><Music2 size={14} /> TikTok<input value={tiktokUrl} onChange={(event) => setTiktokUrl(event.target.value)} placeholder="https://tiktok.com/@..." /></label><label><Youtube size={14} /> YouTube<input value={youtubeUrl} onChange={(event) => setYoutubeUrl(event.target.value)} placeholder="https://youtube.com/@..." /></label><label><Globe2 size={14} /> Website<input value={websiteUrl} onChange={(event) => setWebsiteUrl(event.target.value)} placeholder="https://..." /></label></div><div className="form-row"><label>Order<input type="number" min="0" value={position} onChange={(event) => setPosition(Number(event.target.value))} /></label><label className="toggle-label"><span>Visible on About Us</span><input type="checkbox" checked={isPublished} onChange={(event) => setIsPublished(event.target.checked)} /></label></div><button className="admin-button admin-button-primary" onClick={save} disabled={busy}>{busy ? <Loader2 className="animate-spin" size={17} /> : <Save size={17} />}{editing ? "Save profile" : "Add profile"}</button></div><div className="admin-list-card"><div className="list-card-title"><h3>Team profile slots</h3><span>{members.length}</span></div>{members.length ? <div className="team-profile-list">{members.map((member) => <article className="team-profile-row" key={member.id}><div className="team-profile-avatar">{member.imageUrl ? <img src={member.imageUrl} alt="" /> : <span>{member.name.slice(0, 2).toUpperCase()}</span>}</div><div className="content-row-main"><div><h4>{member.name}</h4><span className={member.isPublished ? "status-published" : "status-draft"}>{member.isPublished ? "Live" : "Hidden"}</span></div><p>{member.role} · position {member.position + 1}</p></div><div className="row-actions"><button aria-label={`Edit ${member.name}`} onClick={() => edit(member)}><Pencil size={15} /></button><button aria-label={`Delete ${member.name}`} className="danger" onClick={() => { if (window.confirm("Remove this team profile?")) remove.mutate({ id: member.id }); }}><Trash2 size={15} /></button></div></article>)}</div> : <EmptyState icon={UsersRound} title="No profiles yet" copy="Create a member profile and it will appear on the About Us page." />}</div></div></section>;
}

const surfaceNames = { page: "Page canvas", header: "Header", footer: "Footer" } as const;
const cardNames: Record<ServiceCardItem["cardKey"], string> = { food_drives: "Food Drives", clothing_closet: "Clothing Closet", community_outreach: "Community Outreach" };

function AppearanceBoard({ appearance, cards, onDone }: { appearance: AppearanceItem; cards: ServiceCardItem[]; onDone: () => Promise<void> }) {
  const [draft, setDraft] = useState<AppearanceItem>(appearance);
  const [cardDraft, setCardDraft] = useState<ServiceCardItem[]>(cards);
  const appearanceUpdate = trpc.content.updateAppearance.useMutation({ onSuccess: async () => { toast.success("Page appearance saved."); await onDone(); }, onError: () => toast.error("Appearance could not be saved.") });
  const cardUpdate = trpc.content.updateServiceCards.useMutation({ onSuccess: async () => { toast.success("Service-card images saved."); await onDone(); }, onError: () => toast.error("Service-card images could not be saved.") });
  const surfaceUpload = trpc.content.uploadAppearanceImage.useMutation();
  const brandUpload = trpc.content.uploadBrandImage.useMutation();
  const cardUpload = trpc.content.uploadServiceCardImage.useMutation();
  useEffect(() => setDraft(appearance), [appearance]);
  useEffect(() => setCardDraft(cards), [cards]);
  const appearancePayload = (current: AppearanceItem) => ({ ...current, logoUrl: current.logoUrl ?? "", logoKey: current.logoKey ?? "", pageImageUrl: current.pageImageUrl ?? "", pageImageKey: current.pageImageKey ?? "", headerImageUrl: current.headerImageUrl ?? "", headerImageKey: current.headerImageKey ?? "", footerImageUrl: current.footerImageUrl ?? "", footerImageKey: current.footerImageKey ?? "" });
  const setSurface = (surface: "page" | "header" | "footer", field: string, value: string | number) => setDraft((current) => ({ ...current, [`${surface}${field}`]: value } as AppearanceItem));
  const uploadSurface = async (surface: "page" | "header" | "footer", file?: File) => { if (!file) return; try { const dataUrl = await readImageFile(file); const uploaded = await surfaceUpload.mutateAsync({ surface, dataUrl }); const next = { ...draft, [`${surface}ImageUrl`]: uploaded.url, [`${surface}ImageKey`]: uploaded.key, [`${surface}Mode`]: "image" } as AppearanceItem; setDraft(next); appearanceUpdate.mutate(appearancePayload(next)); toast.success(`${surfaceNames[surface]} image uploaded and image mode selected.`); } catch (error) { toast.error(error instanceof Error ? error.message : "Upload failed."); } };
  const uploadBrand = async (file?: File) => { if (!file) return; try { const dataUrl = await readImageFile(file); const uploaded = await brandUpload.mutateAsync({ dataUrl }); const next = { ...draft, logoUrl: uploaded.url, logoKey: uploaded.key }; setDraft(next); appearanceUpdate.mutate(appearancePayload(next)); toast.success("Logo uploaded and published to the public site and browser tab."); } catch (error) { toast.error(error instanceof Error ? error.message : "Logo upload failed."); } };
  const updateCard = (cardKey: ServiceCardItem["cardKey"], field: keyof ServiceCardItem, value: string | number) => setCardDraft((current) => current.map((card) => card.cardKey === cardKey ? { ...card, [field]: value } : card));
  const uploadCard = async (cardKey: ServiceCardItem["cardKey"], state: "default" | "hover", file?: File) => { if (!file) return; try { const dataUrl = await readImageFile(file); const uploaded = await cardUpload.mutateAsync({ cardKey, state, dataUrl }); updateCard(cardKey, state === "default" ? "imageUrl" : "hoverImageUrl", uploaded.url); updateCard(cardKey, state === "default" ? "imageKey" : "hoverImageKey", uploaded.key); toast.success(`${cardNames[cardKey]} ${state === "default" ? "default" : "hover"} image uploaded. Save to publish it.`); } catch (error) { toast.error(error instanceof Error ? error.message : "Upload failed."); } };
  const saveAppearance = () => appearanceUpdate.mutate(appearancePayload(draft));
  const saveCards = () => cardUpdate.mutate({ cards: cardDraft.map((card) => ({ cardKey: card.cardKey, imageUrl: card.imageUrl, imageKey: card.imageKey ?? "", hoverImageUrl: card.hoverImageUrl, hoverImageKey: card.hoverImageKey ?? "", imageAlt: card.imageAlt, position: card.position })) });
  return <section className="admin-board"><div className="admin-board-intro"><p className="admin-kicker">Design and brand studio</p><h2>Make seasonal changes without rebuilding the site.</h2><p>Update the public logo and browser-tab icon, key color accents, button shape, and section backdrops here. Public text, events, profiles, carousel slides, and care-card images are managed in their own workspace tabs.</p></div><div className="brand-editor-grid"><article className="admin-form-card brand-identity-card"><div className="form-card-title"><h3>Logo and browser tab</h3><ImagePlus size={18} /></div><div className="brand-logo-preview">{draft.logoUrl ? <img src={draft.logoUrl} alt="Current logo preview" /> : <div><ImagePlus size={22} /><span>Logo slot</span></div>}</div><label className="upload-button"><Upload size={15} /> {brandUpload.isPending ? "Uploading…" : "Upload logo"}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => uploadBrand(event.target.files?.[0])} /></label><p className="admin-form-note">The same uploaded square image becomes the public header logo, footer logo, and browser-tab icon.</p><label>Organization name<input value={draft.siteName} onChange={(event) => setDraft((current) => ({ ...current, siteName: event.target.value }))} /></label><label>Browser-tab title<input value={draft.tabTitle} onChange={(event) => setDraft((current) => ({ ...current, tabTitle: event.target.value }))} /></label><label>Logo description<input value={draft.logoAlt} onChange={(event) => setDraft((current) => ({ ...current, logoAlt: event.target.value }))} /></label></article><article className="admin-form-card"><div className="form-card-title"><h3>Seasonal palette</h3><Palette size={18} /></div><p className="admin-form-note">These four colors update the main public-site accents while preserving readable page structure.</p><div className="brand-color-grid"><label>Primary green<input type="color" value={draft.primaryColor} onChange={(event) => setDraft((current) => ({ ...current, primaryColor: event.target.value }))} /></label><label>Action accent<input type="color" value={draft.accentColor} onChange={(event) => setDraft((current) => ({ ...current, accentColor: event.target.value }))} /></label><label>Highlight<input type="color" value={draft.highlightColor} onChange={(event) => setDraft((current) => ({ ...current, highlightColor: event.target.value }))} /></label><label>Ink color<input type="color" value={draft.inkColor} onChange={(event) => setDraft((current) => ({ ...current, inkColor: event.target.value }))} /></label></div><label>Public button shape<select value={draft.buttonShape} onChange={(event) => setDraft((current) => ({ ...current, buttonShape: event.target.value as AppearanceItem["buttonShape"] }))}><option value="pill">Pill — rounded and friendly</option><option value="soft">Soft corner — relaxed card style</option><option value="square">Square corner — crisp and direct</option></select></label><div className={`button-shape-preview shape-${draft.buttonShape}`}><span>Public call to action</span><button type="button">Preview button</button></div></article></div><div className="appearance-save-row"><p>Save after editing the logo details, colors, or button treatment. Uploaded logos publish automatically, and you can still revise the details before saving.</p><button className="admin-button admin-button-primary" onClick={saveAppearance} disabled={appearanceUpdate.isPending}>{appearanceUpdate.isPending ? <Loader2 className="animate-spin" size={17} /> : <Save size={17} />} Save brand and style</button></div><div className="appearance-grid">{(["page", "header", "footer"] as const).map((surface) => { const mode = draft[`${surface}Mode` as keyof AppearanceItem] as string; const image = draft[`${surface}ImageUrl` as keyof AppearanceItem] as string | null; const blur = draft[`${surface}ImageBlur` as keyof AppearanceItem] as number; const opacity = draft[`${surface}OverlayOpacity` as keyof AppearanceItem] as number; return <article className="appearance-card" key={surface}><div className="form-card-title"><h3>{surfaceNames[surface]}</h3><Palette size={18} /></div><label>Background style<select value={mode} onChange={(event) => setSurface(surface, "Mode", event.target.value)}><option value="solid">Solid color</option><option value="gradient">Gradient</option><option value="image">Background image</option></select></label><div className="appearance-color-row"><label>Base color<input type="color" value={draft[`${surface}Color` as keyof AppearanceItem] as string} onChange={(event) => setSurface(surface, "Color", event.target.value)} /></label><label>Gradient start<input type="color" value={draft[`${surface}GradientFrom` as keyof AppearanceItem] as string} onChange={(event) => setSurface(surface, "GradientFrom", event.target.value)} /></label><label>Gradient end<input type="color" value={draft[`${surface}GradientTo` as keyof AppearanceItem] as string} onChange={(event) => setSurface(surface, "GradientTo", event.target.value)} /></label></div><div className="appearance-image-preview">{image ? <img src={image} alt="Background preview" /> : <div><ImagePlus size={21} /><span>Background image slot</span></div>}<label className="upload-button"><Upload size={15} /> {surfaceUpload.isPending ? "Uploading…" : "Choose image"}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => uploadSurface(surface, event.target.files?.[0])} /></label></div><label className="appearance-range">Image blur <b>{blur}px</b><input type="range" min="0" max="24" value={blur} onChange={(event) => setSurface(surface, "ImageBlur", Number(event.target.value))} /></label><label className="appearance-range">Light overlay <b>{opacity}%</b><input type="range" min="0" max="92" value={opacity} onChange={(event) => setSurface(surface, "OverlayOpacity", Number(event.target.value))} /></label></article>; })}</div><div className="appearance-save-row"><p>Choose <strong>Background image</strong> after uploading an image to use it. Colors and gradients remain available at any time.</p><button className="admin-button admin-button-primary" onClick={saveAppearance} disabled={appearanceUpdate.isPending}>{appearanceUpdate.isPending ? <Loader2 className="animate-spin" size={17} /> : <Save size={17} />} Save appearance</button></div><div className="admin-board-intro service-card-intro"><p className="admin-kicker">Care is practical cards</p><h2>Give every card two moments.</h2><p>Visitors see the default image first. On hover, or with a tap on a touch screen, the card changes to its alternate image.</p></div><div className="service-editor-grid">{cardDraft.map((card) => <article className="service-editor-card" key={card.cardKey}><div className="form-card-title"><h3>{cardNames[card.cardKey]}</h3><span>0{card.position + 1}</span></div><div className="service-image-pair"><div><img src={card.imageUrl} alt="Default preview" /><label className="upload-button"><Upload size={14} /> Default image<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => uploadCard(card.cardKey, "default", event.target.files?.[0])} /></label></div><div><img src={card.hoverImageUrl} alt="Hover preview" /><label className="upload-button"><Upload size={14} /> Hover image<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => uploadCard(card.cardKey, "hover", event.target.files?.[0])} /></label></div></div><label>Image description<input value={card.imageAlt} onChange={(event) => updateCard(card.cardKey, "imageAlt", event.target.value)} /></label></article>)}</div><div className="appearance-save-row"><p>Use real activity images whenever possible and keep concise descriptions for accessibility.</p><button className="admin-button admin-button-primary" onClick={saveCards} disabled={cardUpdate.isPending}>{cardUpdate.isPending ? <Loader2 className="animate-spin" size={17} /> : <Save size={17} />} Save service-card images</button></div></section>;
}

function TeamBoard() {
  const [email, setEmail] = useState(""); const invites = trpc.access.listInvites.useQuery(); const utils = trpc.useUtils(); const invite = trpc.access.invite.useMutation({ onSuccess: async () => { toast.success("Administrator invitation saved."); setEmail(""); await utils.access.listInvites.invalidate(); } }); const revoke = trpc.access.revoke.useMutation({ onSuccess: () => utils.access.listInvites.invalidate() });
  return <section className="admin-board"><div className="admin-board-intro"><p className="admin-kicker">Primary administrator controls</p><h2>Invite people you trust.</h2><p>Only the primary Can Do ATL account can manage this allow-list. An invited person must sign in with the exact email listed here, then activate their invitation.</p></div><div className="admin-two-column"><div className="admin-form-card"><div className="form-card-title"><h3>Add an administrator</h3><ShieldCheck size={18} /></div><label>Email address<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.edu" /></label><button className="admin-button admin-button-primary" onClick={() => { if (!email) return toast.error("Enter an email address."); invite.mutate({ email }); }} disabled={invite.isPending}>{invite.isPending ? <Loader2 className="animate-spin" size={17} /> : <MailPlus size={17} />} Invite administrator</button><p className="admin-form-note">This makes the email eligible to activate access. It does not send an email message automatically.</p></div><div className="admin-list-card"><div className="list-card-title"><h3>Access list</h3><span>{invites.data?.length ?? 0}</span></div>{invites.data?.length ? <div className="content-list">{invites.data.map((item) => <article className="content-row invite-row" key={item.id}><span className="invite-avatar">{item.email.charAt(0).toUpperCase()}</span><div className="content-row-main"><div><h4>{item.email}</h4><span className={item.status === "accepted" ? "status-published" : item.status === "pending" ? "status-draft" : "status-revoked"}>{item.status}</span></div><p>{item.status === "accepted" ? "Access activated" : item.status === "pending" ? "Awaiting activation" : "Access removed"}</p></div>{item.status !== "revoked" && <div className="row-actions"><button aria-label={`Revoke ${item.email}`} className="danger" onClick={() => { if (window.confirm("Revoke this administrator invitation?")) revoke.mutate({ id: item.id }); }}><Trash2 size={15} /></button></div>}</article>)}</div> : <EmptyState icon={UsersRound} title="No additional administrators" copy="The workspace currently belongs to the primary Can Do ATL account only." />}</div></div></section>;
}

function EmptyState({ icon: Icon, title, copy }: { icon: typeof CalendarDays; title: string; copy: string }) { return <div className="admin-empty"><span><Icon size={24} /></span><h4>{title}</h4><p>{copy}</p></div>; }

export default function Admin() { return <AdminGate />; }
