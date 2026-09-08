import { useRef, useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
const services = [
  "Display advertisement",
  "Sponsored article",
  "Event coverage",
  "Video / social media campaign",
  "E-print advertisement",
  "Other media service",
];
export function ServiceForm({
  partnership = false,
  enabled = true,
}: {
  partnership?: boolean;
  enabled?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ reference: string; email_queued: boolean } | null>(null);
  const [consent, setConsent] = useState(false);
  const [choice, setChoice] = useState("");
  const key = useRef("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (!consent || !choice) {
      setError("Please choose a service or applicant type and accept the privacy notice.");
      return;
    }
    setBusy(true);
    setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    if (!key.current) key.current = crypto.randomUUID();
    try {
      const response = await fetch("/api/services/requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...values,
          service: choice,
          consent: true,
          kind: partnership ? "partnership" : "advertising",
          request_id: key.current,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Your request could not be submitted. Please try again.");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connection failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  if (result)
    return (
      <section role="status" className="rounded border border-border bg-accent p-6 space-y-3">
        <h2 className="!mt-0">{partnership ? "Application received" : "Request received"}</h2>
        <p>
          Your reference: <strong>{result.reference}</strong>. Save this reference for
          correspondence.
        </p>
        <p>
          {result.email_queued
            ? "A confirmation email has been queued. Check your inbox and spam folder."
            : "Your request is saved, but the confirmation email could not be queued. Please keep your reference and contact us."}
        </p>
        {!partnership && (
          <>
            <p>
              If you have paid, email your payment proof and this reference to{" "}
              <a href="mailto:ads@clearfact.ng">ads@clearfact.ng</a>. Attach your advert or creative
              files to the same email.
            </p>
            <a
              href={`mailto:ads@clearfact.ng?subject=${encodeURIComponent(`Payment proof / advertising materials — ${result.reference}`)}&body=${encodeURIComponent(`Reference: ${result.reference}\n\nPlease find my payment proof and advertising materials attached.\nTransaction reference:\nAmount paid (NGN):\nService / instructions:\n`)}`}
              className="inline-block font-semibold"
            >
              Email payment proof and materials
            </a>
            <p className="text-sm">
              Attach the files in your email app before sending. This confirmation is not a payment
              receipt. Staff will issue your receipt after verifying the payment.
            </p>
          </>
        )}
      </section>
    );
  return (
    <form onSubmit={submit} className="space-y-5 rounded border border-border p-5 sm:p-8">
      <h2 className="!mt-0">
        {partnership ? "Partnership application" : "Submit your service request"}
      </h2>
      <fieldset disabled={busy || !enabled} className="space-y-5 disabled:opacity-60">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full name *</Label>
            <Input id="name" name="name" autoComplete="name" required maxLength={120} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email for replies{!partnership && " and receipt"} *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={190}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="organisation">Organisation (if applicable)</Label>
            <Input
              id="organisation"
              name="organisation"
              autoComplete="organization"
              maxLength={180}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input id="phone" name="phone" type="tel" autoComplete="tel" maxLength={40} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="service">{partnership ? "Applicant type *" : "Service *"}</Label>
          <Select value={choice} onValueChange={setChoice}>
            <SelectTrigger id="service" className="w-full">
              <SelectValue placeholder="Please choose" />
            </SelectTrigger>
            <SelectContent>
              {(partnership ? ["Individual", "Organisation"] : services).map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="brief">
            {partnership ? "Your proposal *" : "What would you like ClearFact to do? *"}
          </Label>
          <Textarea
            id="brief"
            name="brief"
            required
            minLength={20}
            maxLength={6000}
            rows={7}
            placeholder={
              partnership
                ? "Describe your work, proposed collaboration, goals, contributions and timeline."
                : "Describe your advert or service, intended audience, preferred dates, budget and any publication instructions."
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="materials">Website or materials link (optional)</Label>
          <Input
            id="materials"
            name="materials"
            type="url"
            maxLength={1000}
            placeholder="https://"
          />
          <p className="text-sm text-muted-foreground">
            Share a link you are authorised to provide. Do not include passwords or confidential
            payment details.
          </p>
        </div>
        {!partnership && (
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="payment_reference">Invoice / transaction reference (if paid)</Label>
              <Input id="payment_reference" name="payment_reference" maxLength={120} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount paid in NGN (if paid)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                min="0.01"
                max="999999999"
                step="0.01"
              />
            </div>
          </div>
        )}
        <div className="hidden" aria-hidden="true">
          <label>
            Leave blank
            <input name="website_check" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <div className="flex items-start gap-3">
          <Checkbox
            id="consent"
            checked={consent}
            onCheckedChange={(v) => setConsent(v === true)}
          />
          <Label htmlFor="consent" className="block leading-relaxed">
            I have permission to share these materials and agree to ClearFact using these details to
            process this request under its <a href="/privacy">Privacy Policy</a>. *
          </Label>
        </div>
        <Button type="submit" disabled={busy || !enabled}>
          {busy ? "Submitting…" : partnership ? "Submit application" : "Submit service request"}
        </Button>
      </fieldset>
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      <p className="text-sm text-muted-foreground">
        {partnership
          ? "Applications are reviewed before any partnership is agreed."
          : "Requests and paid content are subject to review. Payment does not guarantee publication or favourable editorial coverage."}
      </p>
    </form>
  );
}
