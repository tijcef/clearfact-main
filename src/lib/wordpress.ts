const API =
  "https://cms.tijcef.org/wp/wp-json/wp/v2/posts?_embed";

export async function getPosts() {
  try {
    const response = await fetch(API, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch posts");
    }

    const data = await response.json();

    console.log("WORDPRESS POSTS:", data);

    return data;
  } catch (error) {
    console.error("WordPress Fetch Error:", error);

    return [];
  }
}