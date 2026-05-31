import { Link } from "@tanstack/react-router";

export interface SimplePageProps {
  eyebrow?: string;
  title: string;
  intro?: string;
  children?: React.ReactNode;
}

export function SimplePage({ eyebrow, title, intro, children }: SimplePageProps) {
  return (
    <div>
      <section className="bg-accent border-b border-border">
        <div className="container-news py-12 md:py-16">
          {eyebrow && <div className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">{eyebrow}</div>}
          <h1 className="font-serif text-4xl md:text-5xl mt-2 text-balance">{title}</h1>
          {intro && <p className="text-muted-foreground mt-3 max-w-2xl text-lg">{intro}</p>}
        </div>
      </section>
      <section className="container-news py-12">
        <div className="max-w-3xl space-y-4 text-foreground/85 leading-relaxed [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:mt-8 [&_h2]:mb-2 [&_h2]:text-foreground [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_a]:text-primary [&_a]:underline">
          {children}
        </div>
        <div className="mt-10">
          <Link to="/" className="text-sm font-semibold text-primary hover:underline">← Back to homepage</Link>
        </div>
      </section>
    </div>
  );
}
