import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { getPosts } from "../lib/wordpress";
import CategorySection from "@/components/home/CategorySection";

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

  const latestPosts = posts.slice(0, 5);

  const trendingPosts = posts.filter(
    (post: any) => post.acf?.trending
  );

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
      
     {/* LATEST NEWS */}
<section className="mb-16">
  <h2 className="text-4xl font-black mb-8">
    Latest News
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

 <CategorySection title="Politics" slug="politics" posts={posts} />
<CategorySection title="Business" slug="business" posts={posts} />
<CategorySection title="Education" slug="education" posts={posts} />
<CategorySection title="Technology" slug="technology" posts={posts} />
<CategorySection title="Features" slug="features" posts={posts} />
<CategorySection title="Investigations" slug="investigations" posts={posts} />
<CategorySection title="Fact Check" slug="fact-check" posts={posts} />
<CategorySection title="Opportunities" slug="opportunities" posts={posts} />
<CategorySection title="Climate & Environment" slug="climate-environment" posts={posts} />
<CategorySection title="Data & Research" slug="data-research" posts={posts} />
<CategorySection title="Video" slug="video" posts={posts} />

</main>
);
}