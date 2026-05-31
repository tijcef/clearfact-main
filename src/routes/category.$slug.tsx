import { createFileRoute, notFound } from "@tanstack/react-router";
import { ARTICLES, CATEGORIES } from "@/lib/news-data";
import { ArticleCard } from "@/components/site/ArticleCard";

export const Route = createFileRoute("/category/$slug")({
  loader: ({ params }) => {
    const cat = CATEGORIES.find((c) => c.slug === params.slug);
    if (!cat) throw notFound();
    return { cat };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.cat.label} — ClearFact News` },
          { name: "description", content: `Verified ${loaderData.cat.label} reporting from ClearFact News.` },
          { property: "og:title", content: `${loaderData.cat.label} — ClearFact News` },
          { property: "og:description", content: `Verified ${loaderData.cat.label} reporting from ClearFact News.` },
        ]
      : [],
  }),
  errorComponent: ({ error }) => <div className="container-news py-16">{error.message}</div>,
  notFoundComponent: () => <div className="container-news py-16">Category not found.</div>,
  component: CategoryPage,
});

function CategoryPage() {
  const { cat } = Route.useLoaderData();
  // mock by tagging all articles into this section
  const items = ARTICLES.filter((a) => a.category.toLowerCase().includes(cat.label.toLowerCase()))
    .concat(ARTICLES)
    .slice(0, 9);
  const [lead, ...rest] = items;
  return (
    <div className="container-news py-8 md:py-12">
      <div className="border-b-2 border-primary pb-3 mb-8">
        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Section</div>
        <h1 className="font-serif text-4xl md:text-5xl mt-1">{cat.label}</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Verified, transparent reporting from the ClearFact {cat.label} desk.
        </p>
      </div>
      <ArticleCard article={lead} variant="wide" />
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
        {rest.map((a) => <ArticleCard key={a.slug + Math.random()} article={a} />)}
      </div>
    </div>
  );
}
