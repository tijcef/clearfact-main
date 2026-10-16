import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
const dir = await mkdtemp(`${tmpdir()}/cf-newsroom-`);
try {
  await build({ entryPoints: ['src/lib/wordpress.ts'], bundle: true, platform: 'node', format: 'esm', outfile: `${dir}/wp.mjs` });
  const wp = await import(pathToFileURL(`${dir}/wp.mjs`));
  const image = { _embedded: { 'wp:featuredmedia': [{ media_details: { width: 1200, height: 800, sizes: {
    medium: { width: 300, height: 200, source_url: 'https://cms.clearfact.ng/wp-content/uploads/a-300.jpg' },
    large: { width: 900, height: 600, source_url: 'https://cms.clearfact.ng/wp-content/uploads/a-900.jpg' },
    thumbnail: { width: 150, height: 150, source_url: 'https://cms.clearfact.ng/wp-content/uploads/a-square.jpg' },
  } } }] } };
  assert.equal(wp.getFeaturedImageSrcSet(image), '/media/a-300.jpg 300w, /media/a-900.jpg 900w');
  assert.equal(wp.getFeaturedImageSrcSet({}), undefined);
  assert.equal(wp.getFeaturedImageUrl(image), '/media/a-900.jpg');
  assert.equal(wp.getArticleQuality({slug:'short-story',content:{rendered:'<p>Short.</p>'}}).indexable, true);
  assert.equal(wp.getArticleQuality({slug:'short-story',content:{rendered:'<p>Short.</p>'}}).adEligible, false);
  const post={slug:'evidence',title:{rendered:'A sufficiently clear headline'},excerpt:{rendered:'A useful excerpt with enough detail for readers to understand the report before opening the full article.'},content:{rendered:Array.from({length:4},()=>`<p>${'reporting '.repeat(120)}</p>`).join('')+'<a href="https://example.org/record">Record</a>'}};
  assert.equal(wp.getArticleQuality(post).adEligible,true);
  assert.equal(wp.getArticleQuality({...post,clearfact_publishing:{sponsored:true,verification:'under_review'}}).adEligible,true,'Publishing metadata must not alter existing ad eligibility');
  let count=0;
  globalThis.fetch=async()=>{count++; return Response.json([{id:1,slug:'dedupe'}]);};
  await Promise.all([wp.getPosts(7),wp.getPosts(7),wp.getPosts(7)]);
  assert.equal(count,1,'Concurrent calls share one origin fetch');
  const result=await wp.getPosts(7); assert.equal(count,1); assert.equal(result[0].slug,'dedupe');
  await build({stdin:{contents:`import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import {EditorialDisclosure} from './src/components/site/EditorialDisclosure';export function render(post,compact=false){return renderToStaticMarkup(React.createElement(EditorialDisclosure,{post,compact}));}`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,platform:'node',format:'esm',banner:{js:"import {createRequire} from 'node:module';const require=createRequire(import.meta.url);"},jsx:'automatic',outfile:`${dir}/disclosure.mjs`});
  const {render}=await import(pathToFileURL(`${dir}/disclosure.mjs`));
  assert.equal(render({}),'','No automatic verified claim');
  assert.match(render({clearfact_publishing:{sponsored:true,sponsor_name:'<script>bad</script>'}}),/&lt;script&gt;/);
  assert.match(render({acf:{verification_status:'Sponsored'}},true),/Sponsored/);
  assert.equal(render({acf:{is_sponsored:'false'}},true),'');
  assert.match(render({clearfact_publishing:{verification:'verified'}}),/Verified by editor/);
  assert.match(render({clearfact_publishing:{correction:'An amended figure.'}}),/An amended figure/);
  console.log('PASS: responsive variants, unchanged ad/index decisions, request deduplication/cache, legacy sponsorship, escaped disclosures and explicit verification');
} finally {await rm(dir,{recursive:true,force:true});}
