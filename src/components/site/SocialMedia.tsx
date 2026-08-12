import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

export const SOCIAL_PROFILES = [
  { name: "Facebook", href: "https://facebook.com/clearfactng", Icon: FaFacebookF },
  { name: "X", href: "https://x.com/clearfactng", Icon: FaXTwitter },
  { name: "Instagram", href: "https://instagram.com/clearfactng", Icon: FaInstagram },
  { name: "YouTube", href: "https://youtube.com/@clearfactng", Icon: FaYoutube },
  { name: "LinkedIn", href: "https://linkedin.com/company/clearfact-news", Icon: FaLinkedinIn },
  { name: "WhatsApp", href: "https://wa.me/2347079405543", Icon: FaWhatsapp },
] as const;

type SocialFollowProps = {
  compact?: boolean;
  inverse?: boolean;
  className?: string;
};

export function SocialFollow({ compact = false, inverse = false, className = "" }: SocialFollowProps) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`} aria-label="Follow ClearFact News">
      {SOCIAL_PROFILES.map(({ name, href, Icon }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Follow ClearFact News on ${name}`}
          title={name}
          className={`inline-flex items-center justify-center rounded-full transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
            compact ? "h-7 w-7" : "h-10 w-10"
          } ${
            inverse
              ? "bg-primary-foreground/10 text-primary-foreground hover:bg-gold hover:text-gold-foreground"
              : "border border-border bg-background text-foreground/75 hover:border-primary hover:bg-primary hover:text-primary-foreground"
          }`}
        >
          <Icon className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
        </a>
      ))}
    </div>
  );
}

type ArticleShareProps = {
  url: string;
  title: string;
  layout?: "row" | "rail";
  showLabel?: boolean;
};

export function ArticleShare({ url, title, layout = "row", showLabel = true }: ArticleShareProps) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const shares = [
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      Icon: FaFacebookF,
      colour: "hover:bg-[#1877f2]",
    },
    {
      name: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      Icon: FaXTwitter,
      colour: "hover:bg-black",
    },
    {
      name: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
      Icon: FaWhatsapp,
      colour: "hover:bg-[#25d366]",
    },
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      Icon: FaLinkedinIn,
      colour: "hover:bg-[#0a66c2]",
    },
  ];

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2_000);
  };

  const nativeShare = async () => {
    if (navigator.share) await navigator.share({ title, url });
    else await copyLink();
  };

  return (
    <div className={layout === "rail" ? "flex flex-col items-center gap-2" : "flex flex-wrap items-center gap-2"}>
      {showLabel && (
        <span className={layout === "rail" ? "mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground [writing-mode:vertical-rl]" : "mr-2 text-sm font-bold"}>
          Share
        </span>
      )}
      {shares.map(({ name, href, Icon, colour }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share this article on ${name}`}
          title={`Share on ${name}`}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-transparent hover:text-white ${colour}`}
        >
          <Icon className="h-4 w-4" />
        </a>
      ))}
      <button type="button" onClick={() => void copyLink()} aria-label="Copy article link" title={copied ? "Link copied" : "Copy link"} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-foreground">
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
      <button type="button" onClick={() => void nativeShare()} aria-label="More sharing options" title="More sharing options" className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-3 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 md:hidden">
        <Share2 className="h-4 w-4" /> More
      </button>
      {copied && <span className="text-xs font-medium text-emerald-600" role="status">Link copied</span>}
    </div>
  );
}
