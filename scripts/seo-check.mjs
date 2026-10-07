// Run after deployment: node scripts/seo-check.mjs https://clearfact.ng
const origin = (process.argv[2] || 'https://clearfact.ng').replace(/\/$/, '');
let failures = 0;
const urls = new Set(['/', '/robots.txt', '/sitemap.xml', '/news-sitemap.xml', '/ads.txt'].map(p => origin + p));
async function check(url) {
  try {
    const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(45000) });
    const body = await response.text();
    const type = response.headers.get('content-type') || '';
    const robots = response.headers.get('x-robots-tag') || '';
    const metaNoindex = /<meta\b[^>]*(?:name\s*=\s*["'](?:robots|googlebot)["'][^>]*content\s*=\s*["'][^"']*\bnoindex\b|content\s*=\s*["'][^"']*\bnoindex\b[^>]*name\s*=\s*["'](?:robots|googlebot)["'])/i.test(body);
    const sitemap = new URL(url).pathname.endsWith('sitemap.xml');
    const canonical = body.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)/i)?.[1];
    const problems = [];
    if (response.status !== 200) problems.push(`HTTP ${response.status}`);
    if (/\bnoindex\b/i.test(robots) || metaNoindex) problems.push('noindex');
    if (sitemap && (!type.includes('xml') || !body.includes('<urlset'))) problems.push('invalid sitemap response');
    if (new URL(url).pathname.startsWith('/post/') && (!canonical || canonical !== url)) problems.push('missing/mismatched canonical');
    if (response.url !== url) problems.push(`redirect to ${response.url}`);
    if (problems.length) { failures++; console.error('FAIL', url, problems.join('; ')); }
    else console.log('PASS', url, response.headers.get('x-clearfact-build') || '');
    if (sitemap && response.ok) {
      for (const match of body.matchAll(/<loc>([^<]+)<\/loc>/g)) {
        const loc = match[1].replace(/&amp;/g, '&');
        if (new URL(loc).origin === origin) urls.add(loc);
        else { failures++; console.error('FAIL foreign sitemap URL', loc); }
      }
    }
  } catch (error) { failures++; console.error('FAIL', url, error.message); }
}
// Discover sitemap URLs first, then audit in small batches to avoid overloading the CMS.
for (const path of ['/sitemap.xml', '/news-sitemap.xml']) await check(origin + path);
const remaining = [...urls].filter(url => !new URL(url).pathname.endsWith('sitemap.xml'));
for (let i = 0; i < remaining.length; i += 3) await Promise.all(remaining.slice(i, i + 3).map(check));
console.log(`Audit finished: ${urls.size} URLs, ${failures} failures.`);
process.exitCode = failures ? 1 : 0;
