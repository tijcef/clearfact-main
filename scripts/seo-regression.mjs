import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
const dir = await mkdtemp(`${tmpdir()}/clearfact-seo-`);
try {
  await build({ entryPoints: ['src/lib/news-sitemap.ts'], bundle: true, platform: 'node', format: 'esm', outfile: `${dir}/news.mjs` });
  let requests = [];
  const now = Date.now();
  const date = new Date(now - 3600000).toISOString().replace(/Z$/, '');
  globalThis.fetch = async input => {
    const url = new URL(input); requests.push(url);
    return Response.json([
      { id: 1, slug: 'valid-story', date: '2001-01-01', date_gmt: date, title: { rendered: 'A & B' } },
      { id: 1, slug: 'valid-story', date, date_gmt: date, title: { rendered: 'A & B' } },
      { id: 2, slug: 'future', date: new Date(now + 3600000).toISOString(), title: { rendered: 'Future' } },
      { id: 3, slug: 'old', date: new Date(now - 72 * 3600000).toISOString(), title: { rendered: 'Old' } },
      { id: 4, slug: 'untitled', date, title: { rendered: '' } },
    ]);
  };
  const news = await import(pathToFileURL(`${dir}/news.mjs`));
  const response = await news.newsSitemapGetResponse();
  const xml = await response.text();
  assert.equal(response.status, 200);
  assert.equal((xml.match(/<url>/g) || []).length, 1);
  assert.ok(xml.includes(`<news:publication_date>${date}Z</news:publication_date>`));
  assert.equal(requests[0].searchParams.get('dates_are_gmt'), 'true');
  assert.ok(!requests[0].searchParams.get('_fields').includes('content'));
  await build({ entryPoints: ['src/lib/wordpress.ts'], bundle: true, platform: 'node', format: 'esm', outfile: `${dir}/wp.mjs` });
  requests = [];
  globalThis.fetch = async input => { requests.push(new URL(input)); return Response.json([{ id: 1, slug: 'story', date }]); };
  const wp = await import(pathToFileURL(`${dir}/wp.mjs`));
  assert.equal((await wp.getSitemapPosts()).length, 1);
  assert.equal(requests.length, 1, 'No speculative requests after the final page');
  console.log('PASS: UTC dates, future/old/empty-title filtering, deduplication, slim requests and final-page termination');
} finally { await rm(dir, { recursive: true, force: true }); }
