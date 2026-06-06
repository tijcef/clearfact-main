import PostCard from "./PostCard";

export default function TrendingNews({
  posts,
}: any) {
  const trendingPosts = posts.filter(
    (post: any) => post.acf?.trending
  );

  return (
    <section className="mt-10">

      <h2 className="text-3xl font-bold mb-6">
        Trending News
      </h2>

      <div className="grid md:grid-cols-2 gap-6">

        {trendingPosts.map((post: any) => (
          <PostCard
            key={post.id}
            post={post}
          />
        ))}

      </div>
    </section>
  );
}