import { createFileRoute } from "@tanstack/react-router";
import { getPosts } from "../lib/wordpress";
import { useTheme } from "next-themes";

export const Route = createFileRoute("/")({
  component: Home,
});

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() =>
        setTheme(theme === "dark" ? "light" : "dark")
      }
      className="px-4 py-2 border rounded-lg mb-8"
    >
      {theme === "dark"
        ? "☀️ Light Mode"
        : "🌙 Dark Mode"}
    </button>
  );
}

async function Home() {
  const posts = await getPosts();

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-5xl font-bold mb-4">
        ClearFact News
      </h1>

      <p className="text-gray-500 mb-8 text-lg">
        Verified journalism from Nigeria
      </p>

      <ThemeToggle />

      {posts.length === 0 ? (
        <div className="text-xl">
          No posts found from WordPress
        </div>
      ) : (
        <div className="grid gap-12">
          {posts.map((post: any) => (
            <article
              key={post.id}
              className="border-b border-gray-200 pb-12"
            >
              <a href={`/post/${post.slug}`}>
                <img
                  src={
                    post._embedded?.["wp:featuredmedia"]?.[0]
                      ?.source_url ||
                    "https://via.placeholder.com/1200x700"
                  }
                  alt=""
                  className="w-full rounded-2xl mb-6 aspect-video object-cover"
                />
              </a>

              <div className="mb-3">
                <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                  News
                </span>
              </div>

              <a href={`/post/${post.slug}`}>
                <h2
                  className="text-4xl font-bold hover:underline leading-tight"
                  dangerouslySetInnerHTML={{
                    __html: post.title.rendered,
                  }}
                />
              </a>

              <p className="text-sm text-gray-500 mt-3">
                {new Date(post.date).toDateString()}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                By{" "}
                {post._embedded?.author?.[0]?.name ||
                  "ClearFact News"}
              </p>

              <div
                className="mt-5 text-lg text-gray-600 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: post.excerpt.rendered,
                }}
              />

              <a
                href={`/post/${post.slug}`}
                className="inline-block mt-6 text-blue-600 font-semibold text-lg"
              >
                Read Full Story →
              </a>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}