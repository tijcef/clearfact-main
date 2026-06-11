import { Link } from "@tanstack/react-router";
import type { Article } from "@/lib/news-data";
import { VerificationBadge } from "./VerificationBadge";

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function ArticleCard({ article, variant = "default" }: { article: Article; variant?: "default" | "compact" | "wide" }) {
  if (variant === "compact") {
    return (
      <article className="flex gap-3 group">
        <Link to="/" className="shrink-0">
          <img src={article.image} alt="" loading="lazy" className="h-20 w-28 object-cover rounded-sm" />
        </Link>
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">{article.category}</div>
          <Link to="/" className="block">
            <h3 className="font-serif text-base leading-snug group-hover:underline decoration-gold underline-offset-4 line-clamp-3">
              {article.title}
            </h3>
          </Link>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <VerificationBadge
  status={
    article.acf?.verification_status ||
    article.verification ||
    "Verified"
  }
/>
            <span>{timeAgo(article.publishedAt)}</span>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "wide") {
    return (
      <article className="grid md:grid-cols-2 gap-5 group">
        <Link to="/" className="block overflow-hidden rounded-sm">
          <img src={article.image} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">{article.category}</span>
            <VerificationBadge
  status={
    article.acf?.verification_status ||
    article.verification ||
    "Verified"
  }
/>
          </div>
          <Link to="/">
            <h2 className="mt-2 font-serif text-2xl md:text-3xl leading-tight text-balance group-hover:underline decoration-gold underline-offset-4">
              {article.title}
            </h2>
          </Link>
          <p className="mt-3 text-muted-foreground line-clamp-3">{article.excerpt}</p>
          <div className="mt-3 text-xs text-muted-foreground">
            By <span className="font-medium text-foreground">{article.author}</span> · {timeAgo(article.publishedAt)} · {article.readMinutes} min read
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col">
      <Link to="/" className="overflow-hidden rounded-sm">
        <img src={article.image} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
      </Link>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">{article.category}</span>
        <VerificationBadge
  status={
    article.acf?.verification_status ||
    article.verification ||
    "Verified"
  }
/>
      </div>
      <Link to="/">
        <h3 className="mt-1 font-serif text-xl leading-snug text-balance group-hover:underline decoration-gold underline-offset-4">
          {article.title}
        </h3>
      </Link>
      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
      <div className="mt-2 text-xs text-muted-foreground">
        {article.author} · {timeAgo(article.publishedAt)}
      </div>
    </article>
  );
}
