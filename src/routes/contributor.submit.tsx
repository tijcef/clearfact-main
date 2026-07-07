import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useServerFn } from "@tanstack/react-start";
import { screenSubmission } from "@/lib/contributor.functions";
import { categories, moreCategories } from "@/lib/news-data";
import { toast } from "sonner";
import { Loader2, MapPin, Plus, UploadCloud, X, Sparkles, Send, Save } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Source = { title: string; url: string };
type Evidence = { path: string; name: string; type: string };

export const Route = createFileRoute("/contributor/submit")({
  component: SubmitForm,
});

function SubmitForm() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const screen = useServerFn(screenSubmission);
  const [id, setId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("Politics");
  const [tagsText, setTagsText] = useState("");
  const [cover, setCover] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [geo, setGeo] = useState<{ lat: number; lng: number; place: string } | null>(null);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [busy, setBusy] = useState<null | "save" | "submit" | "cover" | "evidence">(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!session) return null;
  const userId = session.user.id;

  // Auto-create draft on first save
  const ensureDraft = async (): Promise<string> => {
    if (id) return id;
    const { data, error } = await supabase.from("contributor_submissions").insert({
      contributor_id: userId,
      title: title || "Untitled",
      excerpt, body, category,
      tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean),
      cover_image: cover,
      evidence: evidence as unknown as Database["public"]["Tables"]["contributor_submissions"]["Row"]["evidence"],
      sources: sources as unknown as Database["public"]["Tables"]["contributor_submissions"]["Row"]["sources"],
      geo: geo as unknown as Database["public"]["Tables"]["contributor_submissions"]["Row"]["geo"],
      seo_title: seoTitle || null, seo_description: seoDesc || null,
      status: "draft",
    }).select("id").single();
    if (error) throw error;
    setId(data.id);
    return data.id;
  };

  const saveDraft = async () => {
    setBusy("save");
    try {
      const sid = await ensureDraft();
      await supabase.from("contributor_submissions").update({
        title, excerpt, body, category,
        tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean),
        cover_image: cover,
        evidence: evidence as unknown as Database["public"]["Tables"]["contributor_submissions"]["Row"]["evidence"],
        sources: sources as unknown as Database["public"]["Tables"]["contributor_submissions"]["Row"]["sources"],
        geo: geo as unknown as Database["public"]["Tables"]["contributor_submissions"]["Row"]["geo"],
        seo_title: seoTitle || null, seo_description: seoDesc || null,
      }).eq("id", sid);
      toast.success("Draft saved");
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(null); }
  };

  const submit = async () => {
    if (!title || !body || body.length < 200) return toast.error("Title and a substantive body (200+ chars) are required");
    if (sources.length === 0) return toast.error("Add at least one source");
    setBusy("submit");
    try {
      const sid = await ensureDraft();
      await supabase.from("contributor_submissions").update({
        title, excerpt, body, category,
        tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean),
        cover_image: cover,
        evidence: evidence as unknown as Database["public"]["Tables"]["contributor_submissions"]["Row"]["evidence"],
        sources: sources as unknown as Database["public"]["Tables"]["contributor_submissions"]["Row"]["sources"],
        geo: geo as unknown as Database["public"]["Tables"]["contributor_submissions"]["Row"]["geo"],
        seo_title: seoTitle || null, seo_description: seoDesc || null,
        status: "ai_review",
        submitted_at: new Date().toISOString(),
      }).eq("id", sid);

      toast.message("Running AI fake-news + plagiarism scan…");
      const result = await screen({ data: { submissionId: sid, title, body, excerpt } });
      if (result.verdict === "reject") toast.error("AI screening flagged this submission. See feedback in My Stories.");
      else toast.success("Submitted to editors for review");
      navigate({ to: "/contributor/submissions" });
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(null); }
  };

  const uploadCover = async (f: File) => {
    setBusy("cover");
    try {
      const path = `${userId}/${Date.now()}-${f.name}`;
      const { error } = await supabase.storage.from("contributor-media").upload(path, f);
      if (error) throw error;
      const { data: pub } = supabase.storage.from("contributor-media").getPublicUrl(path);
      setCover(pub.publicUrl);
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(null); }
  };

  const uploadEvidence = async (files: FileList) => {
    setBusy("evidence");
    try {
      const out: Evidence[] = [];
      for (const f of Array.from(files)) {
        const path = `${userId}/evidence-${Date.now()}-${f.name}`;
        const { error } = await supabase.storage.from("contributor-evidence").upload(path, f);
        if (error) throw error;
        out.push({ path, name: f.name, type: f.type });
      }
      setEvidence((e) => [...e, ...out]);
      toast.success(`${out.length} file(s) attached`);
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(null); }
  };

  const captureGeo = () => {
    if (!navigator.geolocation) return toast.error("Geolocation unavailable");
    navigator.geolocation.getCurrentPosition(
      (pos) => setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude, place: "" }),
      () => toast.error("Permission denied"),
    );
  };

  return (
    <div className="container-news py-8 grid lg:grid-cols-[1fr_320px] gap-6">
      <div className="space-y-4">
        <h1 className="font-serif text-3xl">New submission</h1>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Headline (be specific, no clickbait)" className="w-full h-12 px-4 rounded-sm border border-border bg-background font-serif text-xl" />
        <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} placeholder="One-paragraph dek / standfirst" className="w-full p-3 rounded-sm border border-border bg-background" />

        {cover ? (
          <div className="relative">
            <img src={cover} alt="cover" className="w-full rounded-sm border border-border" />
            <button onClick={() => setCover(null)} className="absolute top-2 right-2 h-8 w-8 grid place-items-center rounded-sm bg-background/90 border border-border"><X className="h-4 w-4" /></button>
          </div>
        ) : (
          <label className="border-2 border-dashed border-border rounded-sm p-6 grid place-items-center text-sm text-muted-foreground cursor-pointer hover:bg-accent/40">
            <UploadCloud className="h-6 w-6 mb-1" /> {busy === "cover" ? "Uploading…" : "Drop or click to upload cover image"}
            <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && uploadCover(e.target.files[0])} />
          </label>
        )}

        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={20} placeholder="Write your story. Markdown supported. Include who, what, when, where, why, how." className="w-full p-4 rounded-sm border border-border bg-background font-serif leading-relaxed" />
      </div>

      <aside className="space-y-4">
        <div className="rounded-sm border border-border bg-card p-4 space-y-3">
          <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Publish</div>
          <button onClick={saveDraft} disabled={!!busy} className="w-full h-10 rounded-sm border border-border font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60">
            {busy === "save" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save draft
          </button>
          <button onClick={submit} disabled={!!busy} className="w-full h-10 rounded-sm bg-primary text-primary-foreground font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60">
            {busy === "submit" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Submit for review
          </button>
          <p className="text-[11px] text-muted-foreground flex items-start gap-1"><Sparkles className="h-3 w-3 mt-0.5" /> Submitting runs AI fake-news, hate-speech, plagiarism and duplicate checks before it reaches an editor.</p>
        </div>

        <div className="rounded-sm border border-border bg-card p-4 space-y-3">
          <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Metadata</div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 w-full px-3 rounded-sm border border-border bg-background">
            {categories.map((c) => <option key={c.slug}>{c.name}</option>)}
          </select>
          <input value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="tags, comma, separated" className="h-10 w-full px-3 rounded-sm border border-border bg-background text-sm" />
          <button onClick={captureGeo} className="w-full h-9 rounded-sm border border-border text-sm inline-flex items-center justify-center gap-1.5"><MapPin className="h-4 w-4" /> {geo ? `${geo.lat.toFixed(3)}, ${geo.lng.toFixed(3)}` : "Add geo-tag"}</button>
        </div>

        <div className="rounded-sm border border-border bg-card p-4 space-y-3">
          <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Sources</div>
          {sources.map((s, i) => (
            <div key={i} className="flex gap-1">
              <input value={s.title} onChange={(e) => setSources((arr) => arr.map((x, j) => i === j ? { ...x, title: e.target.value } : x))} placeholder="Source name" className="h-9 flex-1 px-2 rounded-sm border border-border bg-background text-xs" />
              <input value={s.url} onChange={(e) => setSources((arr) => arr.map((x, j) => i === j ? { ...x, url: e.target.value } : x))} placeholder="URL" className="h-9 flex-1 px-2 rounded-sm border border-border bg-background text-xs" />
              <button onClick={() => setSources((a) => a.filter((_, j) => j !== i))} className="h-9 w-9 grid place-items-center rounded-sm border border-border"><X className="h-3 w-3" /></button>
            </div>
          ))}
          <button onClick={() => setSources((s) => [...s, { title: "", url: "" }])} className="w-full h-9 rounded-sm border border-dashed border-border text-xs inline-flex items-center justify-center gap-1"><Plus className="h-3 w-3" /> Add source</button>
        </div>

        <div className="rounded-sm border border-border bg-card p-4 space-y-3">
          <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Evidence (private to editors)</div>
          <input ref={fileRef} type="file" multiple hidden onChange={(e) => e.target.files && uploadEvidence(e.target.files)} />
          <button onClick={() => fileRef.current?.click()} disabled={busy === "evidence"} className="w-full h-9 rounded-sm border border-border text-xs inline-flex items-center justify-center gap-1.5">
            {busy === "evidence" ? <Loader2 className="h-3 w-3 animate-spin" /> : <UploadCloud className="h-3 w-3" />} Upload documents/photos
          </button>
          {evidence.map((ev, i) => (
            <div key={i} className="text-[11px] flex items-center justify-between bg-accent/40 rounded-sm px-2 py-1">
              <span className="truncate">{ev.name}</span>
              <button onClick={() => setEvidence((a) => a.filter((_, j) => j !== i))}><X className="h-3 w-3" /></button>
            </div>
          ))}
        </div>

        <div className="rounded-sm border border-border bg-card p-4 space-y-2">
          <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">SEO</div>
          <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="SEO title (≤60 chars)" maxLength={60} className="h-9 w-full px-2 rounded-sm border border-border bg-background text-xs" />
          <textarea value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} placeholder="Meta description (≤160 chars)" rows={3} maxLength={160} className="w-full p-2 rounded-sm border border-border bg-background text-xs" />
        </div>
      </aside>
    </div>
  );
}
