import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
const dir=await mkdtemp(`${tmpdir()}/cf-reader-`);
try {
  await build({entryPoints:['src/lib/wordpress.ts'],bundle:true,platform:'node',format:'esm',outfile:`${dir}/wp.mjs`});
  const requests=[];
  globalThis.fetch=async input=>{
    const url=new URL(input); requests.push(url);
    if(url.searchParams.get('page')==='3') return Response.json({code:'rest_post_invalid_page_number',message:'Invalid page'}, {status:400});
    return Response.json([{id:8,title:{rendered:'A headline'},excerpt:{rendered:'<p>A headline A useful article preview.</p>'}}]);
  };
  const wp=await import(pathToFileURL(`${dir}/wp.mjs`));
  assert.equal(wp.getArticlePreview({title:{rendered:'A headline'},excerpt:{rendered:'<p>A headline A useful article preview.</p>'}}),'A useful article preview.');
  assert.equal(wp.getArticlePreview({title:{rendered:'A &amp; B'},excerpt:{rendered:'<p>A &amp; B — Useful facts. https://youtu.be/Sy5FJHyq2Uc</p>'}}),'Useful facts.');
  assert.ok(wp.getArticlePreview({excerpt:{rendered:'A long sentence with several words for a preview.'}},20).length<=21);
  assert.equal(wp.isVideoPost({_embedded:{'wp:term':[[{slug:'video'}]]}}),true);
  assert.equal(wp.isVideoPost({}),false);
  await wp.searchPosts('roads',24,{categoryId:6,tagId:7,after:'2026-10-01',before:'2026-10-15',page:2});
  const url=requests[0];
  for(const [key,value] of Object.entries({search:'roads',categories:'6',tags:'7',after:'2026-10-01T00:00:00',before:'2026-10-15T23:59:59',page:'2'})) assert.equal(url.searchParams.get(key),value);
  assert.deepEqual(await wp.searchPosts('roads',24,{page:3}),[]);
  console.log('PASS: clean previews, entity decoding, video detection, combined server search filters and final-page handling');
}finally{await rm(dir,{recursive:true,force:true});}
