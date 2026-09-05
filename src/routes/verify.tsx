import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BadgeCheck, Search, ShieldCheck, TriangleAlert } from "lucide-react";

export const Route = createFileRoute("/verify")({
  head: () => ({
    meta: [
      { title: "Verify Official Document | ClearFact News" },
      { name: "description", content: "Verify the authenticity and current status of an official ClearFact document." },
      { name: "robots", content: "noindex,follow" },
    ],
    links: [{ rel: "canonical", href: "https://clearfact.ng/verify" }],
  }),
  component: VerifyPage,
});

type Result = {
  valid: boolean;
  document_id?: string;
  document_type?: string;
  holder?: string;
  issue_date?: string;
  status?: string;
};

function VerifyPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [searched, setSearched] = useState(false);

  async function verify(value: string) {
    const clean = value.trim();
    if (!clean) return;
    setLoading(true); setSearched(false); setResult(null);
    try {
      const r = await fetch(`/api/document-verify?code=${encodeURIComponent(clean)}`, { headers: { accept: "application/json" } });
      const data = await r.json().catch(() => ({ valid: false }));
      setResult(data);
    } catch { setResult({ valid: false }); }
    finally { setLoading(false); setSearched(true); }
  }

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (token) { setCode(token); void verify(token); }
  }, []);

  const status = result?.status || "";
  const isValid = result?.valid && status.toLowerCase() === "valid";

  return <main className="min-h-[70vh] bg-muted/30">
    <section className="bg-primary text-primary-foreground">
      <div className="container-news py-12 md:py-16 max-w-4xl">
        <div className="flex items-center gap-2 text-gold text-xs font-semibold uppercase tracking-[0.22em]"><ShieldCheck className="h-4 w-4"/> Official Authentication</div>
        <h1 className="font-serif text-4xl md:text-5xl mt-3">ClearFact Document Verification</h1>
        <p className="mt-4 text-primary-foreground/80 max-w-2xl leading-7">Check whether a letter, certificate, staff credential or other official document was issued by ClearFact Media Ltd.</p>
      </div>
    </section>

    <section className="container-news py-10 md:py-14 max-w-4xl">
      <div className="bg-background border rounded-xl p-6 md:p-8 shadow-sm">
        <label className="font-semibold block mb-2" htmlFor="verification-code">Document ID or verification code</label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input id="verification-code" value={code} onChange={e=>setCode(e.target.value)} onKeyDown={e=>{if(e.key==='Enter') void verify(code)}} placeholder="e.g. CF/OL/2026/001" className="flex-1 h-11 rounded-md border bg-background px-4" />
          <button onClick={()=>void verify(code)} disabled={loading || !code.trim()} className="h-11 px-6 rounded-md bg-primary text-primary-foreground font-semibold disabled:opacity-60 flex items-center justify-center gap-2"><Search className="h-4 w-4"/>{loading ? "Verifying…" : "Verify document"}</button>
        </div>
      </div>

      {searched && result && <div className="mt-6 bg-background border rounded-xl p-6 md:p-8 shadow-sm">
        {result.valid ? <>
          <div className="flex items-start gap-3">
            {isValid ? <BadgeCheck className="h-9 w-9 text-green-600 shrink-0"/> : <TriangleAlert className="h-9 w-9 text-amber-600 shrink-0"/>}
            <div><h2 className="font-serif text-2xl">{isValid ? "Verified ClearFact Document" : `Document status: ${status}`}</h2><p className="text-muted-foreground mt-1">The details below are from ClearFact's official verification register.</p></div>
          </div>
          <dl className="mt-7 grid sm:grid-cols-2 gap-x-8 gap-y-5">
            <div><dt className="text-sm text-muted-foreground">Document ID</dt><dd className="font-semibold mt-1">{result.document_id || "—"}</dd></div>
            <div><dt className="text-sm text-muted-foreground">Document Type</dt><dd className="font-semibold mt-1">{result.document_type || "—"}</dd></div>
            <div><dt className="text-sm text-muted-foreground">Recipient / Holder</dt><dd className="font-semibold mt-1">{result.holder || "—"}</dd></div>
            <div><dt className="text-sm text-muted-foreground">Issue Date</dt><dd className="font-semibold mt-1">{result.issue_date || "—"}</dd></div>
            <div><dt className="text-sm text-muted-foreground">Current Status</dt><dd className="font-semibold mt-1">{status || "—"}</dd></div>
          </dl>
          <p className="mt-7 text-sm text-muted-foreground border-t pt-5">Always compare these verification details with the document presented to you. A mismatch may indicate that the document has been altered.</p>
        </> : <div className="flex gap-3"><TriangleAlert className="h-8 w-8 text-destructive shrink-0"/><div><h2 className="font-serif text-2xl">Document not verified</h2><p className="text-muted-foreground mt-2">No matching published ClearFact record was found. Check the code carefully. If the document claims to be official, contact ClearFact for confirmation.</p></div></div>}
      </div>}
    </section>
  </main>;
}
