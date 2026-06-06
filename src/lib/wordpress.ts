export const WP_API = "https://cms.clearfact.ng/wp-json/wp/v2";

export async function getPosts() {
  const res = await fetch(`${WP_API}/posts?_embed`);
  return res.json();
}

export async function getCategories() {
  const res = await fetch(`${WP_API}/categories`);
  return res.json();
}

export async function getTags() {
  const res = await fetch(`${WP_API}/tags`);
  return res.json();
}

export async function searchPosts(query: string) {
  const res = await fetch(
    `${WP_API}/posts?search=${encodeURIComponent(query)}&_embed`
  );

  return res.json();
}

export async function getPostBySlug(slug: string) {
const res = await fetch(
`${WP_API}/posts?slug=${encodeURIComponent(slug)}&_embed`
);

if (!res.ok) {
throw new Error("Failed to fetch post");
}

const posts = await res.json();

return posts.length ? posts[0] : null;
}
export async function getPostsByCategory(categoryId: number) {
  const res = await fetch(
    `${WP_API}/posts?categories=${categoryId}&_embed`
  );

  return res.json();
}
export async function getRelatedPosts(
  categoryId: number,
  currentPostId: number,
  limit = 4
) {
  const res = await fetch(
    `${WP_API}/posts?categories=${categoryId}&per_page=${limit + 1}&_embed`,
    {
      next: { revalidate: 300 },
    }
  );

  const posts = await res.json();

  return posts
    .filter((post: any) => post.id !== currentPostId)
    .slice(0, limit);
}
export async function getComments(postId: number) {
  const res = await fetch(
    `${WP_API}/comments?post=${postId}`
  );

  return res.json();
}
export async function submitComment(
  postId: number,
  name: string,
  email: string,
  content: string
) {
  const res = await fetch(
    `${WP_API}/comments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        post: postId,
        author_name: name,
        author_email: email,
        content,
      }),
    }
  );

  return res.json();
}