import PostCard from "./PostCard";

export default function LatestNews({
  posts,
}: any) {
  return (
    <section className="mt-10">

      <h2 className="text-3xl font-bold mb-6">
        Latest News
      </h2>

      <div className="grid md:grid-cols-2 gap-6">

        {posts.map((post: any) => (
          <PostCard
            key={post.id}
            post={post}
          />
        ))}

      </div>
    </section>
  );
}