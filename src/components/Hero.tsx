import PostCard from "./PostCard";

export default function Hero({ posts }: any) {
  const breakingPost = posts.find((post: any) =>
    post._embedded?.["wp:term"]?.[0]?.some(
      (cat: any) => cat.slug === "breaking"
    )
  );

  const heroPost = breakingPost || posts[0];

  if (!heroPost) return null;

  return (
    <section className="mb-10">
      <div className="mb-3">
        <span className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold uppercase">
          Breaking Story
        </span>
      </div>

      <PostCard post={heroPost} />
    </section>
  );
}