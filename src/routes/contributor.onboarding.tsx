import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";
import { CheckCircle2, Loader2, Mail, Phone, IdCard, Camera, ChevronRight } from "lucide-react";

type Specialty = Database["public"]["Enums"]["contributor_specialty"];

const SPECIALTIES: { value: Specialty; label: string; desc: string }[] = [
  { value: "citizen_reporter", label: "Citizen Reporter", desc: "Eyewitness accounts and community news." },
  { value: "freelance_journalist", label: "Freelance Journalist", desc: "Independent reporting across beats." },
  { value: "verified_correspondent", label: "Verified Correspondent", desc: "Embedded reporter for a region." },
  { value: "investigative_reporter", label: "Investigative Reporter", desc: "Long-form, evidence-heavy work." },
  { value: "photojournalist", label: "Photojournalist", desc: "Visual storytelling with imagery." },
  { value: "videographer", label: "Videographer", desc: "On-site video and broadcast." },
];

export const Route = createFileRoute("/contributor/onboarding")({
  component: Onboarding,
});

function Onboarding() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [specialty, setSpecialty] = useState<Specialty>("citizen_reporter");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState<string | null>(null);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  if (!session) return null;
  const userId = session.user.id;

  const sendOtp = () => {
    if (!phone.match(/^\+?\d{10,15}$/)) return toast.error("Enter a valid phone number with country code");
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setOtpSent(code);
    toast.success(`Demo OTP sent: ${code}`, { duration: 8000 });
  };
  const verifyOtp = () => {
    if (otp === otpSent) { setPhoneVerified(true); toast.success("Phone verified"); }
    else toast.error("Incorrect OTP");
  };

  const uploadDoc = async (file: File, kind: "id" | "selfie") => {
    const path = `${userId}/${kind}-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("contributor-evidence").upload(path, file, { upsert: false });
    if (error) throw error;
    return path;
  };

  const finish = async () => {
    setBusy(true);
    try {
      let id_document_path: string | null = null;
      let selfie_path: string | null = null;
      if (idFile) id_document_path = await uploadDoc(idFile, "id");
      if (selfieFile) selfie_path = await uploadDoc(selfieFile, "selfie");

      const { error } = await supabase.from("contributor_profiles").upsert({
        user_id: userId,
        specialty,
        bio,
        location,
        phone,
        phone_verified: phoneVerified,
        email_verified: !!session.user.email_confirmed_at,
        id_verified: !!id_document_path,
        face_verified: !!selfie_path,
        id_document_path,
        selfie_path,
        onboarding_complete: phoneVerified && !!id_document_path && !!selfie_path,
      }, { onConflict: "user_id" });
      if (error) throw error;

      // Grant contributor role
      await supabase.from("user_roles").insert({ user_id: userId, role: "contributor" }).then(() => undefined, () => undefined);

      toast.success("You're in. Welcome to the newsroom.");
      navigate({ to: "/contributor" });
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setBusy(false); }
  };

  const steps = ["Profile", "Phone OTP", "ID document", "Selfie", "Submit"];

  return (
    <div className="container-news py-10 max-w-2xl">
      <div className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">Onboarding</div>
      <h1 className="font-serif text-3xl mt-2">Verify yourself to start reporting</h1>
      <p className="text-muted-foreground mt-2">All ClearFact contributors complete identity verification. Your documents are encrypted and only visible to ClearFact editors.</p>

      <ol className="flex items-center gap-2 my-8 text-xs">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-2">
            <span className={`h-7 w-7 grid place-items-center rounded-full font-semibold ${i + 1 <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{i + 1}</span>
            <span className={i + 1 === step ? "font-semibold" : "text-muted-foreground"}>{s}</span>
            {i < steps.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
          </li>
        ))}
      </ol>

      <div className="rounded-sm border border-border bg-card p-6 space-y-5">
        {step === 1 && (
          <>
            <Field label="Specialty">
              <div className="grid sm:grid-cols-2 gap-2">
                {SPECIALTIES.map((s) => (
                  <button key={s.value} onClick={() => setSpecialty(s.value)} className={`text-left p-3 rounded-sm border ${specialty === s.value ? "border-primary bg-accent" : "border-border hover:bg-accent/50"}`}>
                    <div className="font-semibold text-sm">{s.label}</div>
                    <div className="text-xs text-muted-foreground">{s.desc}</div>
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Bio"><textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} className="w-full p-3 rounded-sm border border-border bg-background" placeholder="Background, beats you cover…" /></Field>
            <Field label="Location"><input value={location} onChange={(e) => setLocation(e.target.value)} className="h-10 w-full px-3 rounded-sm border border-border bg-background" placeholder="Yola, Adamawa" /></Field>
            <div className="flex items-center gap-2 text-xs text-verified"><Mail className="h-4 w-4" /> Email verified via signup</div>
          </>
        )}
        {step === 2 && (
          <>
            <Field label="Phone number"><input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-10 w-full px-3 rounded-sm border border-border bg-background" placeholder="+234 803 000 0000" /></Field>
            {!otpSent && <button onClick={sendOtp} className="h-10 px-4 rounded-sm bg-primary text-primary-foreground font-semibold">Send OTP</button>}
            {otpSent && !phoneVerified && (
              <div className="flex items-center gap-2">
                <input value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} className="h-10 w-32 px-3 rounded-sm border border-border bg-background tracking-widest text-center" placeholder="••••••" />
                <button onClick={verifyOtp} className="h-10 px-4 rounded-sm bg-primary text-primary-foreground font-semibold">Verify</button>
              </div>
            )}
            {phoneVerified && <div className="flex items-center gap-2 text-sm text-verified"><CheckCircle2 className="h-4 w-4" /> Phone verified</div>}
          </>
        )}
        {step === 3 && (
          <>
            <p className="text-sm text-muted-foreground">Upload a clear photo of your government-issued ID (NIN slip, voter card, driver's licence, passport).</p>
            <Field label="ID document"><input type="file" accept="image/*,application/pdf" onChange={(e) => setIdFile(e.target.files?.[0] ?? null)} /></Field>
            {idFile && <div className="text-xs text-verified flex items-center gap-1"><IdCard className="h-3 w-3" /> {idFile.name} ready</div>}
          </>
        )}
        {step === 4 && (
          <>
            <p className="text-sm text-muted-foreground">Upload a selfie holding your ID. We compare it to confirm you're the document owner.</p>
            <Field label="Selfie"><input type="file" accept="image/*" capture="user" onChange={(e) => setSelfieFile(e.target.files?.[0] ?? null)} /></Field>
            {selfieFile && <div className="text-xs text-verified flex items-center gap-1"><Camera className="h-3 w-3" /> {selfieFile.name} ready</div>}
          </>
        )}
        {step === 5 && (
          <>
            <p className="text-sm">Review your details and submit. An editor will activate your account within 48 hours.</p>
            <ul className="text-sm space-y-1">
              <li><Phone className="inline h-3 w-3 mr-1" /> {phone} {phoneVerified ? "✓" : "(pending)"}</li>
              <li><IdCard className="inline h-3 w-3 mr-1" /> {idFile?.name ?? "—"}</li>
              <li><Camera className="inline h-3 w-3 mr-1" /> {selfieFile?.name ?? "—"}</li>
            </ul>
          </>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <button onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1} className="h-10 px-4 rounded-sm border border-border disabled:opacity-50">Back</button>
          {step < 5
            ? <button onClick={() => setStep((s) => s + 1)} className="h-10 px-5 rounded-sm bg-primary text-primary-foreground font-semibold">Next</button>
            : <button onClick={finish} disabled={busy} className="h-10 px-5 rounded-sm bg-primary text-primary-foreground font-semibold inline-flex items-center gap-2 disabled:opacity-60">{busy && <Loader2 className="h-4 w-4 animate-spin" />} Finish</button>}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">{label}</div>{children}</label>;
}
