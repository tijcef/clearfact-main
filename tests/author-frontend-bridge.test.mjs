import assert from "node:assert/strict";
import fs from "node:fs";

const sourcePrefix = fs.existsSync(
  new URL("../frontend-patch/src/", import.meta.url),
)
  ? "frontend-patch/src"
  : "src";

const read = (path) =>
  fs.readFileSync(new URL(`../${sourcePrefix}/${path}`, import.meta.url), "utf8");

const pluginUrl = [
  new URL("../wordpress-plugins/clearfact-books-store.php", import.meta.url),
  new URL("./fixtures/clearfact-books-store.php", import.meta.url),
].find((url) => fs.existsSync(url));

assert.ok(pluginUrl, "Books plugin source is missing.");
const plugin = fs.readFileSync(pluginUrl, "utf8");

const dashboard = read("components/site/AuthorBookDashboard.tsx");
const author = read("routes/author.tsx");
const proxy = read("lib/services-proxy.ts");

assert.match(author, /<AuthorBookDashboard\s*\/>/);
assert.doesNotMatch(author, /cms\.clearfact\.ng|wp-admin|admin-post\.php/);
assert.match(dashboard, /fetch\("\/api\/services\/books"/);
assert.doesNotMatch(dashboard, /book_submissions|author-books-private|admin-post\.php/);
assert.match(proxy, /SUPABASE_URL/);
assert.match(proxy, /clearfact-books\/v1/);
assert.match(plugin, /function cfb_api_submit/);
assert.match(plugin, /wp_redirect\(cfb_portal_url\(\)\);exit;/);

console.log("PASS: writer UI is frontend-only and the submission bridge is private.");