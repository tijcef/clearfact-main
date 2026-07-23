import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { Save, Send, Calendar, FileText, Loader2, UploadCloud, X, Eye, Pencil, History, Bold, Italic, Link2, List, Heading2, Quote, Sparkles, ShieldCheck, Plus, Trash2, AlertTriangle } from "lucide-react";
import { categories, moreCategories } from "@/lib/news-data";
import { analyzeArticle, type ArticleAnalysis } from "@/lib/ai-analysis.functions";

const CATEGORIES = [...categories, ...moreCategories];

type Source = { title: string; url: string; note?: string };

type Article = Database["public"]["Tables"]["articles"]["Row"];
type Insert = Database["public"]["Tables"]["articles"]["Insert"];

const VERIFICATIONS = ["Verified", "Under Review", "Developing", "Fact-Checked", "Opinion", "Sponsored"] as const;
const CONFIDENCES = ["High", "Medium", "Preliminary"] as const;

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);
}

type Revision = { id: string; created_at: string; title: string; excerpt: string; body: string; editor_name: string | null };

export function ArticleEditor({ existing }: { existing?: Article }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState<null | "save" | "publish" | "schedule">(null);
  const [tab, setTab] = useState<"write" | "preview" | "history">("write");
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [autoSavedAt, setAutoSavedAt] = useState<Date | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const ex = existing as (Article & { sources?: Source[]; trust_score?: number; ai_analysis?: ArticleAnalysis | null }) | undefined;
  const [sources, setSources] = useState<Source[]>(Array.isArray(ex?.sources) ? (ex!.sources as Source[]) : []);
  const [trustScore, setTrustScore] = useState<number>(typeof ex?.trust_score === "number" ? ex!.trust_score : 70);
  const [analysis, setAnalysis] = useState<ArticleAnalysis | null>(ex?.ai_analysis ?? null);
  const [analyzing, setAnalyzing] = useState(false);
  const [correctionNote, setCorrectionNote] = useState("");
  const [corrections, setCorrections] = useState<{ id: string; note: string; created_at: string; editor_name: string | null }[]>([]);

  const [form, setForm] = useState<Insert>({
    slug: existing?.slug ?? "",
    title: existing?.title ?? "",
    excerpt: existing?.excerpt ?? "",
    body: existing?.body ?? "",
    category: existing?.category ?? "Politics",
    cover_image: existing?.cover_image ?? "",
    verification: existing?.verification ?? "Under Review",
    confidence: existing?.confidence ?? "Medium",
    status: existing?.status ?? "draft",
    read_minutes: existing?.read_minutes ?? 3,
    tags: existing?.tags ?? [],
    author_name: existing?.author_name ?? "ClearFact Newsroom",
    scheduled_at: existing?.scheduled_at ?? null,
    published_at: existing?.published_at ?? null,
  });

  const set = <K extends keyof Insert>(k: K, v: Insert[K]) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!existing && form.title && !form.slug) set("slug", slugify(form.title));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.title]);

  // Load revisions + corrections
  useEffect(() => {
    if (!existing) return;
    (async () => {
      const sb = supabase as unknown as { from: (t: string) => { select: (s: string) => { eq: (c: string, v: string) => { order: (c: string, o: { ascending: boolean }) => Promise<{ data: { id: string; note: string; created_at: string; editor_name: string | null }[] | null }> } } } };
      const [{ data: revs }, { data: cors }] = await Promise.all([
        supabase.from("article_revisions").select("*").eq("article_id", existing.id).order("created_at", { ascending: false }).limit(20),
        sb.from("corrections").select("*").eq("article_id", existing.id).order("created_at", { ascending: false }),
      ]);
      setRevisions((revs ?? []) as Revision[]);
      setCorrections(cors ?? []);
    })();
  }, [existing]);

  const runAnalysis = async () => {
    if (!form.title || !form.body) { toast.error("Add title and body first"); return; }
    setAnalyzing(true);
    try {
      const result = await analyzeArticle({ data: { title: form.title, body: form.body ?? "", excerpt: form.excerpt ?? "" } });
      setAnalysis(result);
      setTrustScore(result.trust_score);
      toast.success("AI analysis complete");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Analysis failed");
    } finally { setAnalyzing(false); }
  };

  const addCorrection = async () => {
    if (!existing || !correctionNote.trim()) return;
    const { data: u } = await supabase.auth.getUser();
    const row = { article_id: existing.id, note: correctionNote.trim(), editor_id: u.user?.id ?? null, editor_name: form.author_name };
    const sb = supabase as unknown as { from: (t: string) => { insert: (r: unknown) => { select: (s: string) => { single: () => Promise<{ data: { id: string; note: string; created_at: string; editor_name: string | null } | null; error: Error | null }> } } } };
    const { data, error } = await sb.from("corrections").insert(row).select("*").single();
    if (error || !data) { toast.error(error?.message ?? "Failed"); return; }
    setCorrections((c) => [data, ...c]);
    setCorrectionNote("");
    toast.success("Correction logged publicly");
  };

  // Auto-save (drafts only, every 20s when changed)
  const lastSavedBody = useRef<string>(form.body ?? "");
  useEffect(() => {
    if (!existing) return;
    const t = setInterval(async () => {
      if (form.body === lastSavedBody.current) return;
      if (form.status === "published") return;
      const { error } = await supabase.from("articles")
        .update({ title: form.title, excerpt: form.excerpt, body: form.body }).eq("id", existing.id);
      if (!error) { lastSavedBody.current = form.body ?? ""; setAutoSavedAt(new Date()); }
    }, 20000);
    return () => clearInterval(t);
  }, [form.title, form.excerpt, form.body, form.status, existing]);

  const wrapSelection = (before: string, after = before) => {
    const el = bodyRef.current; if (!el) return;
    const start = el.selectionStart, end = el.selectionEnd;
    const text = el.value;
    const next = text.slice(0, start) + before + text.slice(start, end) + after + text.slice(end);
    set("body", next);
    setTimeout(() => { el.focus(); el.setSelectionRange(start + before.length, end + before.length); }, 0);
  };
  const prefixLines = (prefix: string) => {
    const el = bodyRef.current; if (!el) return;
    const start = el.selectionStart, end = el.selectionEnd;
    const text = el.value;
    const before = text.slice(0, start); const sel = text.slice(start, end) || "Heading"; const after = text.slice(end);
    const replaced = sel.split("\n").map((l) => prefix + l).join("\n");
    set("body", before + replaced + after);
  };

  const save = async (action: "save" | "publish" | "schedule") => {
    if (!form.title || !form.slug) { toast.error("Title and slug are required"); return; }
    setBusy(action);
    const { data: userData } = await supabase.auth.getUser();
    const payload = { ...form, author_id: userData.user?.id ?? null, sources, trust_score: trustScore, ai_analysis: analysis } as unknown as Insert;
    if (action === "publish") { payload.status = "published"; payload.published_at = new Date().toISOString(); }
    if (action === "schedule") {
      if (!form.scheduled_at) { setBusy(null); toast.error("Pick a schedule time"); return; }
      payload.status = "scheduled"; payload.published_at = form.scheduled_at;
    }
    if (action === "save") payload.status = form.status === "published" ? "published" : "draft";

    let error;
    let articleId = existing?.id;
    if (existing) {
      ({ error } = await supabase.from("articles").update(payload).eq("id", existing.id));
    } else {
      const { data, error: insErr } = await supabase.from("articles").insert(payload).select("id").single();
      error = insErr; articleId = data?.id;
    }
    if (!error && articleId) {
      await supabase.from("article_revisions").insert({
        article_id: articleId,
        title: payload.title, excerpt: payload.excerpt ?? "", body: payload.body ?? "",
        editor_id: userData.user?.id, editor_name: payload.author_name,
      });
    }
    setBusy(null);
    if (error) { toast.error(error.message); return; }
    toast.success(action === "publish" ? "Published" : action === "schedule" ? "Scheduled" : "Saved");
    navigate({ to: "/admin" });
  };

  const restore = (r: Revision) => {
    if (!confirm("Restore this revision into the editor? Save to apply.")) return;
    setForm((f) => ({ ...f, title: r.title, excerpt: r.excerpt, body: r.body }));
    setTab("write");
  };

  return (
    <div className="container-news py-8 grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-3xl">{existing ? "Edit article" : "New article"}</h1>
          <div className="flex gap-1 text-xs">
            {([["write", Pencil], ["preview", Eye], ["history", History]] as const).map(([k, Icon]) => (
              <button key={k} onClick={() => setTab(k)}
                className={`inline-flex items-center gap-1 px-3 h-8 rounded-sm border ${tab === k ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:bg-accent"}`}>
                <Icon className="h-3.5 w-3.5" /> {k}
              </button>
            ))}
          </div>
        </div>

        {autoSavedAt && existing && (
          <div className="text-xs text-muted-foreground">Auto-saved at {autoSavedAt.toLocaleTimeString()}</div>
        )}

        {tab === "write" && (
          <>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} required
              placeholder="Headline" className="w-full text-2xl font-serif p-3 rounded-sm border border-border bg-background outline-none focus:border-primary" />
            <input value={form.slug ?? ""} onChange={(e) => set("slug", slugify(e.target.value))}
              placeholder="url-slug" className="w-full p-3 rounded-sm border border-border bg-background outline-none focus:border-primary text-sm font-mono" />
            <textarea value={form.excerpt ?? ""} onChange={(e) => set("excerpt", e.target.value)} rows={3}
              placeholder="Short excerpt / dek" className="w-full p-3 rounded-sm border border-border bg-background outline-none focus:border-primary" />

            <div className="flex flex-wrap gap-1 border border-border rounded-sm p-1 bg-muted/40">
              <ToolBtn onClick={() => prefixLines("## ")} icon={Heading2} title="Heading" />
              <ToolBtn onClick={() => wrapSelection("**")} icon={Bold} title="Bold" />
              <ToolBtn onClick={() => wrapSelection("*")} icon={Italic} title="Italic" />
              <ToolBtn onClick={() => prefixLines("- ")} icon={List} title="List" />
              <ToolBtn onClick={() => prefixLines("> ")} icon={Quote} title="Quote" />
              <ToolBtn onClick={() => {
                const url = prompt("URL"); if (url) wrapSelection("[", `](${url})`);
              }} icon={Link2} title="Link" />
            </div>
            <textarea ref={bodyRef} value={form.body ?? ""} onChange={(e) => set("body", e.target.value)} rows={20}
              placeholder="Article body. Markdown supported: **bold**, *italic*, ## heading, > quote, - list, [link](url)"
              className="w-full p-3 rounded-sm border border-border bg-background outline-none focus:border-primary leading-relaxed font-mono text-sm" />
          </>
        )}

        {tab === "preview" && (
          <article className="rounded-sm border border-border p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">{form.category}</div>
            <h2 className="font-serif text-3xl mt-2 leading-tight">{form.title || "Untitled"}</h2>
            {form.cover_image && <img src={form.cover_image} alt="" className="mt-4 w-full aspect-[16/9] object-cover rounded-sm" />}
            {form.excerpt && <p className="mt-4 text-lg text-muted-foreground">{form.excerpt}</p>}
            <div className="mt-4 prose-content whitespace-pre-wrap leading-relaxed text-foreground/90">{form.body}</div>
          </article>
        )}

        {tab === "history" && (
          <div className="rounded-sm border border-border divide-y divide-border">
            {revisions.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">No revisions yet. Save the article to start a history trail.</div>
            ) : revisions.map((r) => (
              <div key={r.id} className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-serif font-semibold truncate">{r.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()} {r.editor_name ? `· ${r.editor_name}` : ""}
                  </div>
                </div>
                <button onClick={() => restore(r)} className="text-xs font-semibold text-primary hover:underline shrink-0">Restore</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <aside className="space-y-5">
        <div className="rounded-sm border border-border p-4 space-y-3">
          <h3 className="font-serif text-lg">Publish</h3>
          <button onClick={() => save("save")} disabled={!!busy}
            className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-sm border border-border hover:bg-accent disabled:opacity-60">
            {busy === "save" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />} Save draft
          </button>
          <button onClick={() => save("publish")} disabled={!!busy}
            className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-sm bg-primary text-primary-foreground font-semibold disabled:opacity-60">
            {busy === "publish" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Publish now
          </button>
          <div className="pt-2 border-t border-border">
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Schedule</label>
            <input type="datetime-local"
              value={form.scheduled_at ? new Date(form.scheduled_at).toISOString().slice(0, 16) : ""}
              onChange={(e) => set("scheduled_at", e.target.value ? new Date(e.target.value).toISOString() : null)}
              className="w-full mt-1 p-2 rounded-sm border border-border bg-background outline-none focus:border-primary" />
            <button onClick={() => save("schedule")} disabled={!!busy}
              className="mt-2 w-full inline-flex items-center justify-center gap-2 h-10 rounded-sm bg-gold text-gold-foreground font-semibold disabled:opacity-60">
              {busy === "schedule" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />} Schedule
            </button>
          </div>
        </div>

        <div className="rounded-sm border border-border p-4 space-y-3">
          <h3 className="font-serif text-lg">Metadata & SEO</h3>
          <Field label="Category">
            <select value={form.category ?? "Politics"} onChange={(e) => set("category", e.target.value)} className="w-full h-10 px-2 border border-border rounded-sm bg-background">
              {CATEGORIES.map((c) => <option key={c.slug}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Verification">
            <select value={form.verification ?? "Under Review"} onChange={(e) => set("verification", e.target.value as Insert["verification"])} className="w-full h-10 px-2 border border-border rounded-sm bg-background">
              {VERIFICATIONS.map((v) => <option key={v}>{v}</option>)}
            </select>
          </Field>
          <Field label="Confidence">
            <select value={form.confidence ?? "Medium"} onChange={(e) => set("confidence", e.target.value as Insert["confidence"])} className="w-full h-10 px-2 border border-border rounded-sm bg-background">
              {CONFIDENCES.map((v) => <option key={v}>{v}</option>)}
            </select>
          </Field>
          <Field label="Cover image">
            <CoverImageUpload value={form.cover_image ?? ""} onChange={(url) => set("cover_image", url)} />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Read mins"><input type="number" min={1} value={form.read_minutes ?? 3} onChange={(e) => set("read_minutes", Number(e.target.value))} className="w-full h-10 px-2 border border-border rounded-sm bg-background" /></Field>
            <Field label="Author"><input value={form.author_name ?? ""} onChange={(e) => set("author_name", e.target.value)} className="w-full h-10 px-2 border border-border rounded-sm bg-background" /></Field>
          </div>
          <Field label="SEO tags (comma separated)">
            <input value={(form.tags ?? []).join(", ")} onChange={(e) => set("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))} className="w-full h-10 px-2 border border-border rounded-sm bg-background" />
          </Field>
          <div className="text-[11px] text-muted-foreground">
            SEO preview: <span className="font-semibold text-foreground line-clamp-1">{form.title || "Title"}</span><br />
            <span className="line-clamp-2">{form.excerpt || "Description"}</span>
          </div>
        </div>

        {/* Truth & Verification Engine */}
        <div className="rounded-sm border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg flex items-center gap-2"><Sparkles className="h-4 w-4 text-gold" /> AI Editorial Audit</h3>
            <button type="button" onClick={runAnalysis} disabled={analyzing}
              className="text-xs h-8 px-3 rounded-sm bg-primary text-primary-foreground font-semibold inline-flex items-center gap-1 disabled:opacity-60">
              {analyzing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
              {analyzing ? "Analyzing…" : "Run audit"}
            </button>
          </div>
          {analysis ? (
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <Metric label="Trust" value={`${analysis.trust_score}/100`} good={analysis.trust_score >= 70} />
                <Metric label="Clickbait" value={`${analysis.clickbait_score}/100`} good={analysis.clickbait_score < 35} />
                <Metric label="Hate speech" value={analysis.hate_speech_risk} good={analysis.hate_speech_risk === "none" || analysis.hate_speech_risk === "low"} />
                <Metric label="Propaganda" value={analysis.propaganda_risk} good={analysis.propaganda_risk === "none" || analysis.propaganda_risk === "low"} />
                <Metric label="Duplicate" value={analysis.duplicate_risk} good={analysis.duplicate_risk === "none" || analysis.duplicate_risk === "low"} />
              </div>
              <p className="text-muted-foreground italic">{analysis.summary}</p>
              {analysis.fake_news_indicators.length > 0 && <Issue title="Misinformation signals" items={analysis.fake_news_indicators} />}
              {analysis.emotional_manipulation.length > 0 && <Issue title="Emotional manipulation" items={analysis.emotional_manipulation} />}
              {analysis.unverified_claims.length > 0 && <Issue title="Unverified claims" items={analysis.unverified_claims} />}
              {analysis.headline_alternatives.length > 0 && (
                <div className="pt-1">
                  <div className="font-semibold mb-1">Suggested headlines</div>
                  <ul className="space-y-1">
                    {analysis.headline_alternatives.map((h, i) => (
                      <li key={i}>
                        <button type="button" onClick={() => set("title", h)}
                          className="text-left text-primary hover:underline">↳ {h}</button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Scan the draft for clickbait, hate speech, propaganda, plagiarism risk, duplicate coverage and unverified claims.</p>
          )}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center justify-between">
              <span>Public trust score</span><span>{trustScore}/100</span>
            </label>
            <input type="range" min={0} max={100} value={trustScore} onChange={(e) => setTrustScore(Number(e.target.value))} className="w-full" />
          </div>
        </div>

        {/* Source Evidence */}
        <div className="rounded-sm border border-border p-4 space-y-3">
          <h3 className="font-serif text-lg flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-verified" /> Source evidence</h3>
          {sources.length === 0 && <p className="text-xs text-muted-foreground">Cite primary documents and named experts. Required for "Verified" status.</p>}
          {sources.map((s, i) => (
            <div key={i} className="space-y-1 border-l-2 border-primary pl-2">
              <input value={s.title} onChange={(e) => setSources((arr) => arr.map((x, j) => j === i ? { ...x, title: e.target.value } : x))}
                placeholder="Source title" className="w-full h-8 px-2 text-xs border border-border rounded-sm bg-background" />
              <input value={s.url} onChange={(e) => setSources((arr) => arr.map((x, j) => j === i ? { ...x, url: e.target.value } : x))}
                placeholder="https://…" className="w-full h-8 px-2 text-xs border border-border rounded-sm bg-background font-mono" />
              <div className="flex gap-1">
                <input value={s.note ?? ""} onChange={(e) => setSources((arr) => arr.map((x, j) => j === i ? { ...x, note: e.target.value } : x))}
                  placeholder="Evidence note (optional)" className="flex-1 h-8 px-2 text-xs border border-border rounded-sm bg-background" />
                <button type="button" onClick={() => setSources((arr) => arr.filter((_, j) => j !== i))}
                  className="h-8 w-8 grid place-items-center rounded-sm border border-border hover:bg-destructive hover:text-destructive-foreground"><Trash2 className="h-3 w-3" /></button>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => setSources((s) => [...s, { title: "", url: "", note: "" }])}
            className="text-xs inline-flex items-center gap-1 text-primary font-semibold hover:underline"><Plus className="h-3 w-3" /> Add source</button>
        </div>

        {/* Public Corrections Log */}
        {existing && (
          <div className="rounded-sm border border-border p-4 space-y-3">
            <h3 className="font-serif text-lg flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-breaking" /> Public corrections</h3>
            <p className="text-xs text-muted-foreground">Never silently edit. Log a public note for every material change.</p>
            <textarea value={correctionNote} onChange={(e) => setCorrectionNote(e.target.value)} rows={2}
              placeholder="What changed and why?" className="w-full p-2 text-xs border border-border rounded-sm bg-background" />
            <button type="button" onClick={addCorrection} disabled={!correctionNote.trim()}
              className="w-full h-9 rounded-sm bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-60">
              Log correction publicly
            </button>
            {corrections.length > 0 && (
              <ul className="space-y-2 pt-2 border-t border-border text-xs">
                {corrections.map((c) => (
                  <li key={c.id}>
                    <div className="text-muted-foreground">{new Date(c.created_at).toLocaleString()} · {c.editor_name ?? "Editor"}</div>
                    <div>{c.note}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}

function ToolBtn({ onClick, icon: Icon, title }: { onClick: () => void; icon: typeof Bold; title: string }) {
  return (
    <button type="button" onClick={onClick} title={title}
      className="h-8 w-8 grid place-items-center rounded-sm hover:bg-accent">
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Metric({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <div className={`rounded-sm border px-2 py-1.5 ${good ? "border-verified/40 bg-verified/10" : "border-breaking/40 bg-breaking/10"}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-semibold capitalize">{value}</div>
    </div>
  );
}

function Issue({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="border-l-2 border-breaking pl-2">
      <div className="font-semibold">{title}</div>
      <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
        {items.map((s, i) => <li key={i}>{s}</li>)}
      </ul>
    </div>
  );
}

function CoverImageUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);

  const upload = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB"); return; }
    setBusy(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("article-covers")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error) { setBusy(false); toast.error(error.message); return; }
    const { data } = supabase.storage.from("article-covers").getPublicUrl(path);
    onChange(data.publicUrl);
    setBusy(false);
    toast.success("Cover uploaded");
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  };

  if (value) {
    return (
      <div className="space-y-2">
        <div className="relative group">
          <img src={value} alt="Cover preview" className="w-full aspect-[16/9] object-cover rounded-sm border border-border" />
          <button type="button" onClick={() => onChange("")} aria-label="Remove cover"
            className="absolute top-2 right-2 h-8 w-8 grid place-items-center rounded-sm bg-background/90 border border-border hover:bg-destructive hover:text-destructive-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <button type="button" onClick={() => inputRef.current?.click()} disabled={busy}
          className="text-xs text-primary font-semibold hover:underline">
          Replace image
        </button>
        <input ref={inputRef} type="file" accept="image/*" hidden
          onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer border-2 border-dashed rounded-sm p-6 text-center transition-colors ${
          drag ? "border-primary bg-accent" : "border-border hover:border-primary hover:bg-accent/50"
        }`}
      >
        {busy ? (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
          </div>
        ) : (
          <>
            <UploadCloud className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="mt-2 text-sm font-semibold">Drop an image or click to browse</p>
            <p className="text-xs text-muted-foreground">PNG, JPG, WEBP · up to 5MB</p>
          </>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" hidden
        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="…or paste image URL"
        className="mt-2 w-full h-9 px-2 text-xs border border-border rounded-sm bg-background" />
    </div>
  );
}

export const VERIFICATION_VALUES = VERIFICATIONS;
export { Save };
