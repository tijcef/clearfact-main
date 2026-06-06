export const WP_API = "https://clearfact.ng/wp-json/wp/v2";

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