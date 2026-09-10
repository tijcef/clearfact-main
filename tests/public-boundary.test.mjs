import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const publications = read("frontend-patch/src/components/site/Publications.tsx");
const staff = read("frontend-patch/src/routes/staff.tsx");
const services = read("frontend-patch/src/lib/services.ts");
const proxy = read("frontend-patch/src/lib/services-proxy.ts");
const robots = read("frontend-patch/src/routes/robots[.]txt.ts");

for (const source of [publications, staff]) {
  assert.equal(source.includes("cms.clearfact.ng"), false, "public UI must not expose CMS origin");
  assert.equal(source.includes("wp-admin"), false, "public UI must not expose wp-admin");
  assert.equal(source.includes("admin-post.php"), false, "public UI must not expose admin-post.php");
}

assert.match(services, /cms\.clearfact\.ng/);
assert.match(proxy, /sanitizeCatalogue/);
assert.match(proxy, /book-asset/);
assert.match(robots, /Disallow: \/author/);
assert.match(robots, /Sitemap: https:\/\/clearfact\.ng\/sitemap\.xml/);
console.log("PASS: public UI and catalogue boundary does not expose WordPress destinations.");
