# Easier video posting

## One-time setup

1. Deploy this updated frontend using your existing deployment method. Keep the current environment variables and domain settings.
2. In WordPress, open Plugins → Add New Plugin → Upload Plugin.
3. Upload `backend-tools/clearfact-video.zip`, install it and activate **ClearFact Video Link**.

## Posting a video

1. Add or edit a WordPress post.
2. Paste the YouTube link into **YouTube Video Link**. In the block editor, look below the article editor for this box.
3. Enter the headline and article text normally. Choose Video plus any relevant topic category, and select a featured image.
4. Publish or update. Check the public article. Existing caches can take a few minutes to refresh.

Use a Shorts link for a vertical player; regular links use a landscape player. Existing iframe embeds retain their portrait shape when their original height exceeds their width. A Watch on YouTube link is included beneath each player.

Existing WordPress YouTube embed blocks and standalone YouTube links inside paragraphs are also supported. A video already embedded in the article is not added a second time by the new field. Ordinary links inside sentences remain links. Videos must allow embedding on YouTube.

## Scope

Ad components, eligibility rules, ads.txt, homepage layout, canonical URLs, robots rules, sitemap generation and indexing settings are unchanged. The video field is optional. The plugin stores a URL only; the updated frontend displays the player.

The supplied ZIP is source code for deployment, not a WordPress theme. Upload only the separate video plugin ZIP to WordPress.

## Visible Videos section

Videos now appears in the desktop main navigation, with a separate visible button on phones even while the menu is closed. Latest Videos appears just below the lead story on the homepage, with play symbols on thumbnails. It uses the existing /category/video address and needs no visitor login. The previous lower video section is removed to avoid duplication.
