import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
const dir = await mkdtemp(`${tmpdir()}/clearfact-video-`);
try {
  await build({ entryPoints: ['src/lib/youtube.ts'], bundle: true, platform: 'node', format: 'esm', outfile: `${dir}/video.mjs` });
  const { parseYouTube, prepareYouTubeContent } = await import(pathToFileURL(`${dir}/video.mjs`));
  const id = 'Sy5FJHyq2Uc';
  for (const url of [`https://youtu.be/${id}?si=abc`, `https://www.youtube.com/watch?v=${id}&t=30`, `https://youtube.com/live/${id}`, `https://youtube.com/embed/${id}`]) assert.equal(parseYouTube(url)?.id, id);
  assert.equal(parseYouTube(`https://youtube.com/shorts/${id}`)?.portrait, true);
  for (const url of [`https://youtube.com.evil.test/watch?v=${id}`, `javascript:alert(1)`, 'https://youtube.com/watch?v=bad']) assert.equal(parseYouTube(url), null);
  const plain = '<p>Article text.</p>';
  assert.equal(prepareYouTubeContent(plain), plain);
  assert.match(prepareYouTubeContent(`<p>https://youtu.be/${id}</p>`), /<iframe/);
  assert.match(prepareYouTubeContent(`<figure><div class="wp-block-embed__wrapper">https://youtu.be/${id}</div></figure>`), /<iframe/);
  const inline = `<p>See <a href="https://youtu.be/${id}">this video</a> for detail.</p>`;
  assert.equal(prepareYouTubeContent(inline), inline);
  const legacy = `<iframe src="https://www.youtube.com/embed/${id}" width="360" height="640"></iframe>${plain}`;
  const result = prepareYouTubeContent(legacy, `https://youtu.be/${id}`);
  assert.equal((result.match(/<iframe/g) || []).length, 1);
  assert.match(result, /clearfact-video-portrait/);
  assert.ok(result.includes(plain));
  assert.ok(!prepareYouTubeContent(`<p>${legacy.split('</iframe>')[0]}</iframe></p>`).startsWith('<p>'));

  assert.match(prepareYouTubeContent(plain, `https://youtube.com/shorts/${id}`), /clearfact-video-portrait/);
  const unrelated = '<iframe src="https://example.com/widget"></iframe>';
  assert.equal(prepareYouTubeContent(unrelated), unrelated);
  console.log('PASS: YouTube URL variants, unsafe host rejection, legacy embeds, portrait sizing, field deduplication and unchanged ordinary content');
} finally { await rm(dir, { recursive: true, force: true }); }
