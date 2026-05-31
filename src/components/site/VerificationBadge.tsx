import { ShieldCheck, AlertTriangle, Clock, Search, MessageSquareQuote, Megaphone } from "lucide-react";
import type { Verification } from "@/lib/news-data";

const map: Record<Verification, { cls: string; icon: typeof ShieldCheck }> = {
  Verified: { cls: "bg-verified text-verified-foreground", icon: ShieldCheck },
  "Fact-Checked": { cls: "bg-verified text-verified-foreground", icon: Search },
  "Under Review": { cls: "bg-muted text-foreground border border-border", icon: AlertTriangle },
  Developing: { cls: "bg-breaking text-breaking-foreground", icon: Clock },
  Opinion: { cls: "bg-accent text-accent-foreground border border-border", icon: MessageSquareQuote },
  Sponsored: { cls: "bg-gold text-gold-foreground", icon: Megaphone },
};

export function VerificationBadge({ status }: { status: Verification }) {
  const { cls, icon: Icon } = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${cls}`}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {status}
    </span>
  );
}
