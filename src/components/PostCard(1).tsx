import { getFeaturedImageUrl } from "@/lib/wordpress";

type Props = {
  post: any;
};

export default function PostCard({ post }: Props) {
  return (
    <article className="border rounded-xl overflow-hidden">
      {/* Image */}
      {getFeaturedImageUrl(post) && (
        <img
          src={getFeaturedImageUrl(post)}
          alt={post.title.rendered}
          className="w-full h-60 object-cover"
          loading="lazy"
          decoding="async"
        />
      )}

      <div className="p-4">
        {/* Category */}
        <div className="flex gap-2 mb-3">
          {post._embedded?.["wp:term"]?.[0]?.map((cat: any) => (
            <span key={cat.id} className="bg-red-600 text-white text-xs px-2 py-1 rounded">
              {cat.name}
            </span>
          ))}
        </div>

        {/* Title */}
        <a href={`/news/${post.slug}`}>
          <h2
            className="text-2xl font-bold hover:text-red-600"
            dangerouslySetInnerHTML={{
              __html: post.title.rendered,
            }}
          />
        </a>

        {/* Meta */}
        <p className="text-gray-500 text-sm mt-2">
          {new Date(post.date).toDateString()} • By {post._embedded?.author?.[0]?.name}
        </p>

        {/* Excerpt */}
        <div
          className="mt-4 text-gray-700"
          dangerouslySetInnerHTML={{
            __html: post.excerpt.rendered,
          }}
        />

        {/* Tags */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {post.acf?.featured && (
            <span className="bg-black text-white px-2 py-1 text-xs rounded">Featured</span>
          )}

          {post.acf?.trending && (
            <span className="bg-blue-600 text-white px-2 py-1 text-xs rounded">Trending</span>
          )}

          {post.acf?.top_story && (
            <span className="bg-green-600 text-white px-2 py-1 text-xs rounded">Top Story</span>
          )}
        </div>
      </div>
    </article>
  );
}
