import PostCard from "./PostCard";

export default function Hero({
  posts,
}: any) {
  const heroPost = posts[0];

  return (
    <section className="mb-10">
      <PostCard post={heroPost} />
    </section>
  );
}