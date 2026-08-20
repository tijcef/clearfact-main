import PostCard from "./PostCard";

type HeroPost = {
  id: number | string;
  slug?: string;
  title?: {
    rendered?: string;
  };
  _embedded?: {
    ["wp:term"]?: Array<
      Array<{
        slug?: string;
        name?: string;
      }>
    >;
  };
};

type HeroProps = {
  posts: HeroPost[];
};

function getVerification(post: HeroPost) {
  const terms = post._embedded?.["wp:term"] ?? [];

  const allTerms = terms.flat();

  const verificationTerms = [
    "verified",
    "fact-checked",
    "developing",
    "opinion",
    "breaking",
  ];

  return allTerms.find((term) =>
    verificationTerms.includes(term.slug ?? "")
  );
}

export default function Hero({ posts }: HeroProps) {
  const breakingPost = posts.find((post) =>
    post._embedded?.["wp:term"]?.some((group) =>
      group.some((term) => term.slug === "breaking")
    )
  );

  const heroPost = breakingPost ?? posts[0];

  if (!heroPost) {
    return null;
  }

  const isBreaking = Boolean(breakingPost);
  const verification = getVerification(heroPost);

  return (
    <section
      className="mb-10"
      aria-labelledby="hero-story-heading"
    >
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span
            className={
              isBreaking
                ? "bg-red-600 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wide"
                : "bg-primary text-primary-foreground px-3 py-1 rounded text-xs font-bold uppercase tracking-wide"
            }
          >
            {isBreaking ? "Breaking News" : "Featured Story"}
          </span>

          {verification && !isBreaking && (
            <span className="px-3 py-1 rounded text-xs font-semibold uppercase tracking-wide border border-border">
              {verification.name}
            </span>
          )}
        </div>
      </div>

      <div id="hero-story-heading">
        <PostCard post={heroPost} />
      </div>
    </section>
  );
}