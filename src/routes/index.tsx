import { createFileRoute, Link } from "@tanstack/react-router";
import { ARTICLES, HERO } from "@/lib/news-data";
import { ArticleCard } from "@/components/site/ArticleCard";
import { VerificationBadge } from "@/components/site/VerificationBadge";
import { Newsletter } from "@/components/site/Newsletter";
import { ShieldCheck, Flame, TrendingUp, Cloud, LineChart, Radio, PlayCircle, Bookmark, Eye } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ClearFact News — Verified Nigerian journalism" },
      { name: "description", content: "Breaking news, fact-checks, investigations and analysis from Nigeria's transparency-first newsroom." },
      { property: "og:title", content: "ClearFact News" },
      { property: "og:description", content: "Verified. Transparent. Nigerian." },
    ],
  }),
  component: Home,
});

function SectionHeader({ icon: Icon, label, to }: { icon: typeof Flame; label: string; to?: string }) {
  return (
    <div className="flex items-end justify-between border-b-2 border-primary pb-2 mb-5">
      <h2 className="font-serif text-2xl flex items-center gap-2">
        <Icon className="h-5 w-5 text-gold" /> {label}
      </h2>
      {to && (
        <Link to={to} className="text-xs font-semibold uppercase tracking-wider text-primary hover:underline">
          See all →
        </Link>
      )}
    </div>
  );
}

function Home() {
  const featured = ARTICLES.slice(1, 5);
  const trending = ARTICLES.slice(2, 7);
  const trendingTop = ARTICLES.slice(0, 6);
  const videos = ARTICLES.slice(1, 5);
  const editorsPicks = ARTICLES.slice(3, 7);
  const opinion = ARTICLES.find((a) => a.category === "Investigations") ?? ARTICLES[5];

  return (
    <>
      {/* Hero */}
      <section className="container-news pt-6 md:pt-10">
        <div className="grid lg:grid-cols-3 gap-8">
          <article className="lg:col-span-2 group">
            <Link to="/" className="block overflow-hidden rounded-sm">
              <img
                src={HERO.image}
                alt=""
                width={1600}
                height={1024}
                className="aspect-[16/9] w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
            </Link>
            <div className="mt-4 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 bg-breaking text-breaking-foreground text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-breaking-foreground animate-pulse" /> Top Story
              </span>
              <VerificationBadge status={HERO.verification} />
              <span className="text-xs text-muted-foreground">{HERO.category}</span>
            </div>
            <Link to="/">
              <h1 className="mt-2 font-serif text-3xl md:text-5xl leading-[1.05] text-balance group-hover:underline decoration-gold underline-offset-4">
                {HERO.title}
              </h1>
            </Link>
            <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-3xl">{HERO.excerpt}</p>
            <div className="mt-3 text-xs text-muted-foreground">
              By <span className="font-semibold text-foreground">{HERO.author}</span> · {HERO.readMinutes} min read · Last verified just now
            </div>
          </article>

          <aside className="space-y-5">
            <div className="border border-border rounded-sm p-4">
              <h3 className="font-serif text-lg flex items-center gap-2"><Flame className="h-4 w-4 text-breaking" /> Breaking</h3>
              <ul className="mt-3 space-y-3">
                {ARTICLES.slice(0, 4).map((a) => (
                  <li key={a.slug} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-breaking shrink-0" />
                    <Link to="/" className="text-sm font-medium hover:underline decoration-gold underline-offset-4 leading-snug">
                      {a.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-border rounded-sm p-4 bg-primary text-primary-foreground">
              <div className="flex items-center gap-2 text-gold">
                <ShieldCheck className="h-4 w-4" />
                <h3 className="font-serif text-lg">Trust Snapshot</h3>
              </div>
              <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-primary-foreground/70">Verified</dt>
                  <dd className="font-serif text-2xl">98.4%</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-primary-foreground/70">Corrections</dt>
                  <dd className="font-serif text-2xl">12</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-primary-foreground/70">Sources</dt>
                  <dd className="font-serif text-2xl">3.1k</dd>
                </div>
              </dl>
              <Link to="/trust-center" className="mt-4 inline-flex h-9 items-center px-3 rounded-sm bg-gold text-gold-foreground text-xs font-semibold">
                Open Trust Center
              </Link>
            </div>

            <div className="border border-border rounded-sm p-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="flex items-center gap-1 text-muted-foreground text-xs"><Cloud className="h-3.5 w-3.5" /> Yola</div>
                <div className="font-serif text-2xl">31°C</div>
                <div className="text-xs text-muted-foreground">Sunny · H 35° L 22°</div>
              </div>
              <div>
                <div className="flex items-center gap-1 text-muted-foreground text-xs"><LineChart className="h-3.5 w-3.5" /> NGN/USD</div>
                <div className="font-serif text-2xl">₦1,180</div>
                <div className="text-xs text-verified">▲ 0.42%</div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Featured */}
      <section className="container-news mt-14">
        <SectionHeader icon={TrendingUp} label="Featured Headlines" />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      </section>

      {/* Trending strip */}
      <section className="container-news mt-14">
        <SectionHeader icon={TrendingUp} label="Trending Now" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {trendingTop.map((a, i) => (
            <Link key={a.slug} to="/" className="group block">
              <div className="relative overflow-hidden rounded-sm">
                <img src={a.image} alt="" loading="lazy" className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <span className="absolute top-1 left-1 bg-gold text-gold-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-sm">#{i + 1}</span>
              </div>
              <div className="text-[10px] uppercase tracking-wider text-primary font-semibold mt-2">{a.category}</div>
              <h3 className="font-serif text-sm leading-snug line-clamp-3 group-hover:underline decoration-gold underline-offset-4">{a.title}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Two columns: Most read + Editor's picks */}
      <section className="container-news mt-14 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <SectionHeader icon={Flame} label="Most Read" />
          <ol className="space-y-5">
            {trending.map((a, i) => (
              <li key={a.slug} className="flex gap-4">
                <span className="font-serif text-4xl text-gold leading-none w-10 shrink-0">{i + 1}</span>
                <div className="flex-1">
                  <ArticleCard article={a} variant="compact" />
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <SectionHeader icon={ShieldCheck} label="Fact-Check Spotlight" />
          <ArticleCard article={ARTICLES.find((a) => a.verification === "Fact-Checked")!} />
          <div className="mt-6 border-l-4 border-gold pl-4">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Opinion</div>
            <h3 className="font-serif text-xl mt-1">Why transparent corrections build a stronger democracy</h3>
            <p className="text-sm text-muted-foreground mt-2">A note from our Editor on accountability and reader trust.</p>
            <Link to="/fact-check" className="mt-2 inline-block text-sm font-semibold text-primary hover:underline">Read editorial →</Link>
          </div>
        </div>
      </section>

      {/* Wide investigation */}
      <section className="container-news mt-14">
        <div className="flex items-end justify-between border-b-2 border-primary pb-2 mb-5">
          <h2 className="font-serif text-2xl flex items-center gap-2">
            <Radio className="h-5 w-5 text-gold" /> Investigations
          </h2>
          <Link to="/category/$slug" params={{ slug: "investigations" }} className="text-xs font-semibold uppercase tracking-wider text-primary hover:underline">
            See all →
          </Link>
        </div>
        <ArticleCard article={opinion} variant="wide" />
      </section>

      {/* Video section */}
      <section className="container-news mt-14">
        <SectionHeader icon={PlayCircle} label="Watch · ClearFact Video" />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {videos.map((a) => (
            <Link key={a.slug} to="/" className="group block">
              <div className="relative overflow-hidden rounded-sm">
                <img src={a.image} alt="" loading="lazy" className="aspect-video w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <PlayCircle className="absolute inset-0 m-auto h-12 w-12 text-white drop-shadow-lg opacity-90 group-hover:scale-110 transition" />
                <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-mono px-1.5 py-0.5 rounded-sm">3:24</span>
              </div>
              <div className="text-[10px] uppercase tracking-wider text-primary font-semibold mt-2">{a.category}</div>
              <h3 className="font-serif text-base leading-snug line-clamp-2 group-hover:underline decoration-gold underline-offset-4">{a.title}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Editor's Picks + Most Viewed */}
      <section className="container-news mt-14 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <SectionHeader icon={Bookmark} label="Editor's Picks" />
          <div className="grid sm:grid-cols-2 gap-6">
            {editorsPicks.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </div>
        <div>
          <SectionHeader icon={Eye} label="Most Viewed Today" />
          <ol className="space-y-4">
            {trendingTop.slice(0, 5).map((a, i) => (
              <li key={a.slug} className="flex gap-3 pb-4 border-b border-border last:border-0">
                <span className="font-serif text-3xl text-gold leading-none">{i + 1}</span>
                <Link to="/" className="font-serif text-sm leading-snug hover:underline decoration-gold underline-offset-4 line-clamp-3">
                  {a.title}
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Newsletter */}
      <section className="container-news mt-14">
        <Newsletter />
      </section>

      <div className="h-10" />
    </>
  );
}
