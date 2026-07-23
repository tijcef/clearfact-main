import PostCard from "./PostCard";

export default function TrendingNews({ posts }: any) {
  const trendingPosts =
    posts.filter((post: any) => post.acf?.trending) ||
    [];

  const displayPosts =
    trendingPosts.length > 0
      ? trendingPosts
      : posts.slice(0, 6);

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">
          Trending News
        </h2>

        <span className="text-sm text-muted-foreground">
          Most discussed stories
        </span>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayPosts.map((post: any) => (
          <PostCard
            key={post.id}
            post={post}
          />
        ))}
      </div>
    </section>
  );
}