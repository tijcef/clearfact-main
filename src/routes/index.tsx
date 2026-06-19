import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { getPosts } from "../lib/wordpress";
import { useTheme } from "next-themes";

export const Route = createFileRoute("/")({
  head: () => ({
    title: "ClearFact News | Verified Journalism From Nigeria",

    meta: [
      {
        name: "description",
        content:
          "ClearFact News delivers verified, transparent and timely journalism from Nigeria.",
      },
      {
        property: "og:title",
        content: "ClearFact News",
      },
      {
        property: "og:description",
        content: "Verified journalism from Nigeria.",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:url",
        content: "https://clearfact.ng/",
      },
      {
        property: "og:image",
        content: "https://clearfact.ng/clearfact-logo.jpg",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:title",
        content: "ClearFact News",
      },
      {
        name: "twitter:description",
        content: "Verified journalism from Nigeria.",
      },
      {
        name: "twitter:image",
        content: "https://clearfact.ng/clearfact-logo.jpg",
      },
    ],

    links: [
      {
        rel: "canonical",
        href: "https://clearfact.ng/",
      },
    ],
  }),

  component: Home,
});

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() =>
        setTheme(theme === "dark" ? "light" : "dark")
      }
      className="px-4 py-2 border rounded-lg"
    >
      {theme === "dark"
        ? "☀️ Light Mode"
        : "🌙 Dark Mode"}
    </button>
  );
}

async function Home() {
  const posts = await getPosts();

  if (!posts || posts.length === 0) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-5xl font-bold">
          ClearFact News
        </h1>

        <p className="mt-6 text-xl">
          No posts found from WordPress
        </p>
      </main>
    );
  }

  const heroPost = posts[0];

  const otherPosts = posts.slice(1);

  const latestPosts = posts.slice(0, 5);

  const featuredPosts = posts.filter(
    (post: any) => post.acf?.featured
  );

  const trendingPosts = posts.filter(
    (post: any) => post.acf?.trending
  );
const opportunitiesPosts = posts.filter((post: any) =>
  post._embedded?.["wp:term"]?.[0]?.some(
    (cat: any) => cat.slug === "opportunities"
  )
);

const factCheckPosts = posts.filter((post: any) =>
  post._embedded?.["wp:term"]?.[0]?.some(
    (cat: any) => cat.slug === "fact-check"
  )
);
const opportunitiesCount = opportunitiesPosts.length;

const latestFactChecks = factCheckPosts.slice(0, 3);
  const getVerificationColor = (status: string) => {
  switch (status) {
    case "Verified":
      return "bg-green-600 text-white";
    case "Fact-Checked":
      return "bg-blue-600 text-white";
    case "Developing":
      return "bg-yellow-500 text-black";
    case "Opinion":
      return "bg-purple-600 text-white";
    case "Breaking":
      return "bg-red-600 text-white";
    case "False Claim":
      return "bg-red-800 text-white";
    default:
      return "bg-gray-600 text-white";
  }
};

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">


<div className="bg-red-600 text-white px-5 py-3 rounded-xl mb-8 font-bold">

  🚨 BREAKING NEWS:
  {heroPost.title.rendered.replace(/<[^>]*>/g, "")}

</div>

      {/* HERO SECTION */}
      <section className="mb-16">

        <a href={`/post/${heroPost.slug}`}>

          <img
            src={
              heroPost._embedded?.[
                "wp:featuredmedia"
              ]?.[0]?.source_url ||
              "https://via.placeholder.com/1200x700"
            }
            alt=""
            className="w-full rounded-3xl aspect-video object-cover"
          />

        </a>

        <div className="mt-8">
<div className="flex gap-2 flex-wrap mb-4">

  {heroPost._embedded?.["wp:term"]?.[0]?.map(
    (cat: any) => (
      <span
        key={cat.id}
        className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full"
      >
        {cat.name}
      </span>
    )
  )}

  {heroPost.acf?.verification_status && (
    <span
      className={`text-xs px-3 py-1 rounded-full font-semibold ${getVerificationColor(
        heroPost.acf.verification_status
      )}`}
    >
      {heroPost.acf.verification_status}
    </span>
  )}

</div>

          <a href={`/post/${heroPost.slug}`}>

            <h2
              className="text-5xl md:text-6xl font-black leading-tight hover:underline"
              dangerouslySetInnerHTML={{
                __html: heroPost.title.rendered,
              }}
            />

          </a>

          <p className="text-sm text-gray-500 mt-5">
            {new Date(
              heroPost.date
            ).toDateString()}
          </p>

          <p className="text-sm text-gray-500 mt-1">
            By{" "}
            {heroPost._embedded?.author?.[0]
              ?.name || "ClearFact News"}
          </p>

          <div
            className="mt-6 text-xl text-gray-600 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: heroPost.excerpt.rendered,
            }}
          />

        </div>

      </section>

      <div className="mb-10">

  <input
    type="text"
    placeholder="🔍 Search ClearFact News..."
    className="w-full border rounded-xl p-4 text-lg"
  />

</div>
      
     {/* LATEST POSTS */}
<section className="mb-16">
  <h2 className="text-4xl font-black mb-8">
    Latest Posts
  </h2>

  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
    {latestPosts.map((post: any) => (
      <article
        key={post.id}
        className="border rounded-2xl overflow-hidden"
      >
        <a href={`/post/${post.slug}`}>
          <img
            src={
              post._embedded?.["wp:featuredmedia"]?.[0]
                ?.source_url ||
              "https://via.placeholder.com/800x500"
            }
            alt=""
            className="w-full h-56 object-cover"
          />
        </a>

        <div className="p-5">
          <div className="flex gap-2 flex-wrap mb-3">
            {post._embedded?.["wp:term"]?.[0]?.map(
              (cat: any) => (
                <span
                  key={cat.id}
                  className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full"
                >
                  {cat.name}
                </span>
              )
            )}

            {post.acf?.verification_status && (
              <span
                className={`text-xs px-3 py-1 rounded-full font-semibold ${getVerificationColor(
                  post.acf.verification_status
                )}`}
              >
                {post.acf.verification_status}
              </span>
            )}
          </div>

          <h3
            className="text-2xl font-bold leading-tight"
            dangerouslySetInnerHTML={{
              __html: post.title.rendered,
            }}
          />

          <p className="text-sm text-gray-500 mt-3">
            {new Date(post.date).toDateString()}
          </p>
        </div>
      </article>
    ))}
  </div>
</section>

{trendingPosts.length > 0 && (
  <section className="mb-16">
    <h2 className="text-4xl font-black mb-8">
      Trending News
    </h2>

    <div className="grid md:grid-cols-3 gap-6">
      {trendingPosts.slice(0, 3).map((post: any) => (
        <article key={post.id}>
          <a href={`/post/${post.slug}`}>
            <h3
              className="text-xl font-bold"
              dangerouslySetInnerHTML={{
                __html: post.title.rendered,
              }}
            />
          </a>
        </article>
      ))}
    </div>
  </section>
)}

{opportunitiesPosts.length > 0 && (
  <section className="mb-16">
    <h2 className="text-4xl font-black mb-8">
      Opportunities
    </h2>

    <div className="grid md:grid-cols-3 gap-6">
      {opportunitiesPosts.slice(0, 3).map(
        (post: any) => (
          <article key={post.id}>
            <a href={`/post/${post.slug}`}>
              <h3
                className="text-xl font-bold"
                dangerouslySetInnerHTML={{
                  __html: post.title.rendered,
                }}
              />
            </a>
          </article>
        )
      )}
    </div>
  </section>
)}

      {/* MAIN GRID */}
      <div className="grid lg:grid-cols-4 gap-10">

        {/* POSTS */}
        <div className="lg:col-span-3">

          <div className="grid gap-14">

            {otherPosts.map((post: any) => (
              <article
                key={post.id}
                className="border-b border-gray-200 pb-14"
              >

                <a href={`/post/${post.slug}`}>

                  <img
                    src={
                      post._embedded?.[
                        "wp:featuredmedia"
                      ]?.[0]?.source_url ||
                      "https://via.placeholder.com/1200x700"
                    }
                    alt=""
                    className="w-full rounded-2xl mb-6 aspect-video object-cover"
                  />

                </a>

                <div className="flex gap-2 flex-wrap mb-3">

  {post._embedded?.["wp:term"]?.[0]?.map(
  (cat: any) => (
    <span
      key={cat.id}
      className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full"
    >
      {cat.name}
    </span>
  )
)}

{post.acf?.verification_status && (
  <span
    className={`text-xs px-3 py-1 rounded-full font-semibold ${getVerificationColor(
      post.acf.verification_status
    )}`}
  >
    {post.acf.verification_status}
  </span>
)}

</div>

                <a href={`/post/${post.slug}`}>

                  <h2
                    className="text-4xl font-black hover:underline leading-tight"
                    dangerouslySetInnerHTML={{
                      __html: post.title.rendered,
                    }}
                  />

                </a>

                <p className="text-sm text-gray-500 mt-3">
                  {new Date(
                    post.date
                  ).toDateString()}
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

                {/* SOCIAL SHARE */}
                <div className="flex gap-4 mt-6 text-sm font-medium flex-wrap">

                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://clearfact.ng/post/${post.slug}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Facebook
                  </a>

                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://clearfact.ng/post/${post.slug}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-500 hover:underline"
                  >
                    Twitter/X
                  </a>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`https://clearfact.ng/post/${post.slug}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:underline"
                  >
                    WhatsApp
                  </a>

                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://clearfact.ng/post/${post.slug}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-800 hover:underline"
                  >
                    LinkedIn
                  </a>

                </div>

              </article>
            ))}

          </div>

        </div>

        {/* SIDEBAR */}
        {/* SIDEBAR */}
<aside className="space-y-8">

  {/* Follow ClearFact */}
  <div className="border rounded-2xl p-5">

    <h3 className="text-2xl font-bold mb-4">
      Follow ClearFact
    </h3>

    <div className="flex flex-col gap-3 text-blue-600">

      <a href="https://facebook.com" target="_blank">
        Facebook
      </a>

      <a href="https://instagram.com" target="_blank">
        Instagram
      </a>

      <a href="https://tiktok.com" target="_blank">
        TikTok
      </a>

      <a href="https://linkedin.com" target="_blank">
        LinkedIn
      </a>

      <a href="https://youtube.com" target="_blank">
        YouTube
      </a>

    </div>

  </div>

  {/* Opportunities */}
  <div className="border rounded-2xl p-5">

    <h3 className="text-2xl font-bold mb-4">
      🚀 Active Opportunities ({opportunitiesCount})
    </h3>

    <div className="flex flex-col gap-3">

      <a
        href="/category/opportunities"
        className="hover:text-blue-600"
      >
        Scholarships
      </a>

      <a
        href="/category/opportunities"
        className="hover:text-blue-600"
      >
        Fellowships
      </a>

      <a
        href="/category/opportunities"
        className="hover:text-blue-600"
      >
        Grants
      </a>

      <a
        href="/category/opportunities"
        className="hover:text-blue-600"
      >
        Jobs
      </a>

      <a
        href="/category/opportunities"
        className="hover:text-blue-600"
      >
        Internships
      </a>

    </div>

  </div>

  {/* Latest Fact Checks */}
  <div className="border rounded-2xl p-5">

    <h3 className="text-2xl font-bold mb-4">
      ✓ Latest Fact Checks
    </h3>

    <div className="flex flex-col gap-3">

      {latestFactChecks.map((post: any) => (
        <a
          key={post.id}
          href={`/post/${post.slug}`}
          className="hover:text-blue-600"
          dangerouslySetInnerHTML={{
            __html: post.title.rendered,
          }}
        />
      ))}

    </div>

  </div>

  {/* Today In Nigeria */}
  <div className="border rounded-2xl p-5">

    <h3 className="text-2xl font-bold mb-4">
      🇳🇬 Today in Nigeria
    </h3>

    <div className="space-y-4">

      <div className="border-b pb-3">
        <p className="font-semibold">
          💵 USD/NGN
        </p>
        <p>₦1,580</p>
      </div>

      <div className="border-b pb-3">
        <p className="font-semibold">
          ⛽ Fuel Price
        </p>
        <p>Abuja: ₦980/L</p>
      </div>

      <div className="border-b pb-3">
        <p className="font-semibold">
          🌦 Abuja Weather
        </p>
        <p>31°C</p>
      </div>

      <div>
        <p className="font-semibold">
          🚀 Opportunities
        </p>
        <p>{opportunitiesCount} active</p>
      </div>

    </div>

  </div>

</aside>

      </div>

    </main>
  );
}