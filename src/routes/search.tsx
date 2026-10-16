import { EditorialDisclosure } from "@/components/site/EditorialDisclosure";
import {
  getCategories,
  getTagId,
  getFeaturedImageUrl,
  getFeaturedImageSrcSet,
  getArticlePreview,
  isVideoPost,
  normalizeWpSlug,
  searchPosts,
  stripHtml,
} from "@/lib/wordpress";

import { createFileRoute, Link } from "@tanstack/react-router";
import { filterEditorialCategories } from "@/lib/site-navigation";

import { useEffect, useState, useRef } from "react";

import { Loader2 } from "lucide-react";
import { VideoLabel } from "@/components/site/VideoLabel";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: (search.q as string) ?? "",
    category: (search.category as string) ?? "",
    tag: (search.tag as string) ?? "",
    after:
      typeof search.after === "string" && /^\d{4}-\d{2}-\d{2}$/.test(search.after)
        ? search.after
        : undefined,
    before:
      typeof search.before === "string" && /^\d{4}-\d{2}-\d{2}$/.test(search.before)
        ? search.before
        : undefined,
  }),

  head: () => ({
    meta: [
      {
        title: "Search — ClearFact News",
      },
      {
        name: "description",
        content:
          "Search verified reports, fact-checks, investigations and analysis on ClearFact News.",
      },
      {
        name: "robots",
        content: "noindex,follow",
      },
    ],

    links: [
      {
        rel: "canonical",
        href: "https://clearfact.ng/search",
      },
    ],
  }),

  component: SearchPage,
});

function SearchPage() {
  const search = Route.useSearch();
  const { q, category, tag, after, before } = search;
  const navigate = Route.useNavigate();
  const generation = useRef(0);
  const [input, setInput] = useState(q);
  const [results, setResults] = useState<any[] | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [more, setMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  useEffect(() => {
    setInput(q);
  }, [q]);
  useEffect(() => {
    let active = true;
    generation.current += 1;
    async function load() {
      setResults(null);
      setError("");
      setPage(1);
      try {
        const available = filterEditorialCategories(await getCategories());
        if (!active) return;
        setCategories(available);
        const selected = available.find((item) => item.slug === category);
        if (category && !selected) {
          setResults([]);
          setMore(false);
          return;
        }
        const tagId = tag ? await getTagId(tag) : undefined;
        if (tag && !tagId) {
          setResults([]);
          setMore(false);
          return;
        }
        const posts = await searchPosts(q, 24, { categoryId: selected?.id, tagId, after, before });
        if (active) {
          setResults(posts);
          setMore(posts.length === 24);
        }
      } catch {
        if (active) {
          setResults([]);
          setError("Search is temporarily unavailable. Please try again.");
        }
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [q, category, tag, after, before]);
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const from = String(form.get("after") || "");
    const to = String(form.get("before") || "");
    if (from && to && from > to) {
      setError("The start date must be on or before the end date.");
      return;
    }
    navigate({
      to: "/search",
      search: {
        q: input.trim(),
        category: String(form.get("category") || ""),
        tag,
        after: from || undefined,
        before: to || undefined,
      },
    });
  };
  const loadMore = async () => {
    const current = generation.current;
    setLoadingMore(true);
    setError("");
    try {
      const selected = categories.find((item) => item.slug === category);
      const tagId = tag ? await getTagId(tag) : undefined;
      const posts = await searchPosts(q, 24, {
        categoryId: selected?.id,
        tagId,
        after,
        before,
        page: page + 1,
      });
      if (current !== generation.current) return;
      setResults((previous) => [
        ...new Map([...(previous || []), ...posts].map((item) => [item.id, item])).values(),
      ]);
      setPage((value) => value + 1);
      setMore(posts.length === 24);
    } catch {
      if (current === generation.current)
        setError("Could not load more results. Please try again.");
    } finally {
      setLoadingMore(false);
    }
  };
  return (
    <main className="container-news py-8 md:py-10">
      <h1 className="font-serif text-3xl">Search ClearFact</h1>
      <form
        key={`${category}:${after}:${before}:${categories.length}`}
        onSubmit={submit}
        className="mt-5 max-w-4xl space-y-4 rounded-xl border border-border p-4 md:p-6"
      >
        <label className="block text-sm font-semibold">
          Keyword or topic
          <input
            aria-label="Keyword or topic"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Search news, investigations and topics…"
            className="mt-2 h-11 w-full rounded-md border border-border bg-background px-3 font-normal"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="text-sm font-semibold">
            Category
            <select
              name="category"
              defaultValue={category}
              className="mt-2 h-11 w-full rounded-md border border-border bg-background px-2 font-normal"
            >
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold">
            From date
            <input
              type="date"
              name="after"
              defaultValue={after}
              className="mt-2 h-11 w-full min-w-0 rounded-md border border-border bg-background px-2 font-normal"
            />
          </label>
          <label className="text-sm font-semibold">
            To date
            <input
              type="date"
              name="before"
              defaultValue={before}
              className="mt-2 h-11 w-full min-w-0 rounded-md border border-border bg-background px-2 font-normal"
            />
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button className="h-11 rounded-md bg-primary px-6 font-semibold text-primary-foreground">
            Search
          </button>
          <Link
            to="/search"
            search={{ q: "", category: "", tag: "", after: undefined, before: undefined }}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Clear filters
          </Link>
        </div>
      </form>
      {tag && <p className="mt-4 text-sm">Tag: {tag}</p>}
      {error && (
        <p role="alert" className="mt-5 text-sm text-red-600">
          {error}
        </p>
      )}
      <section aria-live="polite" aria-busy={results === null} className="mt-8 max-w-4xl">
        {results === null ? (
          <p className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Searching…
          </p>
        ) : !results.length ? (
          <p>No stories found. Try a broader keyword or date range.</p>
        ) : (
          <>
            <p className="mb-5 text-sm text-muted-foreground">
              Showing {results.length} {results.length === 1 ? "story" : "stories"}
              {more ? " · More available below" : ""}
            </p>
            <ul className="space-y-6">
              {results.map((post) => (
                <li key={post.id} className="border-b border-border pb-6">
                  <Link
                    to="/post/$slug"
                    params={{ slug: normalizeWpSlug(post.slug) }}
                    className="group flex flex-col gap-4 sm:flex-row"
                  >
                    <div className="relative shrink-0 overflow-hidden rounded-lg sm:w-44">
                      <img
                        src={getFeaturedImageUrl(post, "/logo.jpg", "medium")}
                        srcSet={getFeaturedImageSrcSet(post)}
                        alt=""
                        loading="lazy"
                        className="aspect-video w-full object-cover"
                      />
                      {isVideoPost(post) && (
                        <span className="absolute bottom-2 left-2">
                          <VideoLabel />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <EditorialDisclosure post={post} compact />
                      <h2 className="font-serif text-xl group-hover:underline">
                        {stripHtml(post.title.rendered)}
                      </h2>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {getArticlePreview(post)}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {new Date(post.date).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          timeZone: "Africa/Lagos",
                        })}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            {more && (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="mt-6 min-h-11 rounded-md border border-border px-5 font-semibold disabled:opacity-60"
              >
                {loadingMore ? "Loading…" : "Load more stories"}
              </button>
            )}
          </>
        )}
      </section>
    </main>
  );
}
