import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const dashboard = read("frontend-patch/src/components/site/AuthorBookDashboard.tsx");
const author = read("frontend-patch/src/routes/author.tsx");
const proxy = read("frontend-patch/src/lib/services-proxy.ts");
const plugin = read("wordpress-plugins/clearfact-books-store.php");

assert.match(author, /<AuthorBookDashboard\s*\/>/);
assert.doesNotMatch(author, /cms\.clearfact\.ng|wp-admin|admin-post\.php/);
assert.match(dashboard, /fetch\("\/api\/services\/books"/);
assert.doesNotMatch(dashboard, /book_submissions|author-books-private|admin-post\.php/);
assert.match(proxy, /SUPABASE_URL/);
assert.match(proxy, /clearfact-books\/v1/);
assert.match(plugin, /function cfb_api_submit/);
assert.match(plugin, /wp_redirect\(cfb_portal_url\(\)\);exit;/);

console.log("PASS: writer UI is frontend-only and the submission bridge is private.");
