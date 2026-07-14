import {
  getCategories,
  getPosts,
  searchPosts,
} from "@/lib/wordpress";

import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";

import {
  useEffect,
  useState,
} from "react";

import {
  Loader2,
  Search as SearchIcon,
  Tag,
  TrendingUp,
} from "lucide-react";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: (search.q as string) ?? "",
    category: (search.category as string) ?? "",
    tag: (search.tag as string) ?? "",
  }),

  head: () => ({
    title: "Search — ClearFact News",

    meta: [
      {
        name: "description",
        content:
          "Search verified reports, fact-checks, investigations and analysis on ClearFact News.",
      },
      {
        name: "robots",
        content: "index,follow",
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

const TRENDING = [
  "election",
  "naira",
  "fact-check",
  "tinubu",
  "lagos",
  "agriculture",
  "security",
];

function SearchPage() {
  const { q, category, tag } = Route.useSearch();
  const navigate = Route.useNavigate();

  const [input, setInput] = useState(q);
  const [results, setResults] = useState<any[] | null>(null);
  const [wordpressCategories, setWordpressCategories] =
    useState<any[]>([]);

  useEffect(() => {
    setInput(q);
  }, [q]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();

        setWordpressCategories(
          Array.isArray(data)
            ? data.filter(
                (item: any) =>
                  item.slug !== "uncategorized"
              )
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load categories:",
          error
        );

        setWordpressCategories([]);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setResults(null);

        const posts = q
          ? await searchPosts(q)
          : await getPosts();

        const filteredPosts = Array.isArray(posts)
          ? posts.filter((post: any) => {
              const selectedCategory =
                wordpressCategories.find(
                  (item: any) =>
                    item.slug === category
                );

              const matchesCategory =
                !category ||
                (selectedCategory &&
                  post.categories?.includes(
                    selectedCategory.id
                  ));

              const matchesTag =
                !tag ||
                post._embedded?.[
                  "wp:term"
                ]?.[1]?.some(
                  (postTag: any) =>
                    postTag.slug === tag ||
                    postTag.name
                      ?.toLowerCase()
                      .replace(/\s+/g, "-") ===
                      tag.toLowerCase()
                );

              return matchesCategory && matchesTag;
            })
          : [];

        setResults(filteredPosts);
      } catch (error) {
        console.error(
          "Search failed:",
          error
        );

        setResults([]);
      }
    };

    loadPosts();
  }, [
    q,
    category,
    tag,
    wordpressCategories,
  ]);

  const submit = (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    navigate({
      to: "/search",
      search: {
        q: input.trim(),
        category,
        tag,
      },
    });
  };

  return (
    <div className="container-news py-10">
      <h1 className="font-serif text-3xl">
        Search ClearFact
      </h1>

      <form
        onSubmit={submit}
        className="mt-4 flex gap-2 max-w-2xl"
      >
        <label className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

          <input
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            placeholder="Search verified reports, fact-checks, topics…"
            className="w-full h-11 pl-9 pr-3 rounded-sm border border-border bg-background outline-none focus:border-primary"
          />
        </label>

        <button
          type="submit"
          className="h-11 px-5 rounded-sm bg-primary text-primary-foreground font-semibold"
        >
          Search
        </button>
      </form>

      <div className="mt-6 grid lg:grid-cols-4 gap-8">
        <aside className="space-y-6">
          <div>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">
              Categories
            </h3>

            <ul className="space-y-1 text-sm">
              <li>
                <Link
                  to="/search"
                  search={{
                    q,
                    category: "",
                    tag,
                  }}
                  className={`block px-2 py-1 rounded-sm ${
                    !category
                      ? "bg-accent font-semibold"
                      : "hover:bg-accent"
                  }`}
                >
                  All
                </Link>
              </li>

              {wordpressCategories.map(
                (item: any) => (
                  <li key={item.id}>
                    <Link
                      to="/search"
                      search={{
                        q,
                        category: item.slug,
                        tag,
                      }}
                      className={`block px-2 py-1 rounded-sm ${
                        category === item.slug
                          ? "bg-accent font-semibold"
                          : "hover:bg-accent"
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              Trending
            </h3>

            <div className="flex flex-wrap gap-1.5">
              {TRENDING.map((item) => (
                <Link
                  key={item}
                  to="/search"
                  search={{
                    q: item,
                    category: "",
                    tag: "",
                  }}
                  className="text-xs px-2 py-1 rounded-sm border border-border hover:bg-accent"
                >
                  #{item}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        <div className="lg:col-span-3">
          {(category || tag) && (
            <div className="mb-4 flex gap-2 flex-wrap text-xs">
              {category && (
                <Link
                  to="/search"
                  search={{
                    q,
                    category: "",
                    tag,
                  }}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-sm bg-primary text-primary-foreground"
                >
                  Category:{" "}
                  {wordpressCategories.find(
                    (item: any) =>
                      item.slug === category
                  )?.name || category}{" "}
                  ✕
                </Link>
              )}

              {tag && (
                <Link
                  to="/search"
                  search={{
                    q,
                    category,
                    tag: "",
                  }}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-sm bg-gold text-gold-foreground"
                >
                  <Tag className="h-3 w-3" />
                  {tag} ✕
                </Link>
              )}
            </div>
          )}

          {results === null ? (
            <div className="py-10 flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching…
            </div>
          ) : results.length === 0 ? (
            <div className="py-10 text-muted-foreground">
              No results. Try a different keyword or category.
            </div>
          ) : (
            <>
              <p className="mb-6 text-sm text-muted-foreground">
                {results.length}{" "}
                {results.length === 1
                  ? "result"
                  : "results"}{" "}
                found
              </p>

              <ul className="space-y-6">
                {results.map((post: any) => (
                  <li
                    key={post.id}
                    className="pb-6 border-b border-border last:border-0"
                  >
                    <Link
                      to="/post/$slug"
                      params={{
                        slug: post.slug,
                      }}
                    >
                      <h3
                        className="font-serif text-xl hover:underline decoration-gold underline-offset-4"
                        dangerouslySetInnerHTML={{
                          __html:
                            post.title.rendered,
                        }}
                      />
                    </Link>

                    <div
                      className="text-sm text-muted-foreground mt-2"
                      dangerouslySetInnerHTML={{
                        __html:
                          post.excerpt.rendered,
                      }}
                    />

                    <div className="text-xs text-muted-foreground mt-2">
                      {new Date(
                        post.date
                      ).toLocaleDateString(
                        "en-NG",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}