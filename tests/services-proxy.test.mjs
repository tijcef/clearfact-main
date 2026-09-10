import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const source = fs.readFileSync(new URL('../frontend-patch/src/lib/services-proxy.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
const { proxyServices } = await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));
const env = { CLEARFACT_SERVICES_SECRET: 'test-secret-server-only' };
const origin = 'https://clearfact.ng';
const write = (body = '{}', headers = {}) => new Request(origin + '/api/services/requests', { method: 'POST', headers: { origin, 'content-type': 'application/json', ...headers }, body });
let calls = 0;
globalThis.fetch = async () => { calls++; throw new Error('Unexpected upstream call'); };
assert.equal((await proxyServices(write('{}', { origin: 'https://other.example' }), env)).status, 403);
assert.equal((await proxyServices(write('{bad'), env)).status, 400);
assert.equal((await proxyServices(write(' '.repeat(24001)), env)).status, 413);
assert.equal((await proxyServices(new Request(origin + '/api/services/requests'), env)).status, 405);
assert.equal((await proxyServices(new Request(origin + '/api/services/private-records'), env)).status, 404);
assert.equal(calls, 0);
globalThis.fetch = async (url, init) => {
  calls++; assert.equal(String(url), 'https://cms.clearfact.ng/wp-json/clearfact-services/v1/requests');
  assert.equal(init.headers['x-clearfact-secret'], env.CLEARFACT_SERVICES_SECRET);
  assert.equal(init.headers.cookie, undefined);
  return Response.json({reference:'CF-TEST-001',email_queued:false}, {status:201});
};
const result = await proxyServices(write('{}', {cookie:'private-session=abc'}), env);
assert.equal(result.status,201); assert.equal(result.headers.get('cache-control'),'no-store');
assert.match(result.headers.get('x-robots-tag'),/noindex/);
assert.deepEqual(await result.json(), {reference:'CF-TEST-001',email_queued:false});
globalThis.fetch = async () => new Response('<html>Unavailable</html>', {status:502});
assert.equal((await proxyServices(write(),env)).status,503);
globalThis.fetch = async () => { throw new Error('timeout'); };
assert.equal((await proxyServices(write(),env)).status,503);
globalThis.fetch = async (url, init) => {
 assert.equal(init.headers['x-clearfact-secret'], env.CLEARFACT_SERVICES_SECRET);
 return Response.json({bank:'Test bank', accepting_requests:true});
};
assert.equal((await (await proxyServices(new Request(origin+'/api/services/config'),env)).json()).ready,true);
globalThis.fetch = async () => Response.json({accepting_requests:false});
assert.equal((await (await proxyServices(new Request(origin+'/api/services/config'),env)).json()).ready,false);
globalThis.fetch = async (url, init) => { assert.equal(init.headers['x-clearfact-secret'], undefined); return Response.json({reference:'CF-NO-SECRET',email_queued:true},{status:201}); };
assert.equal((await proxyServices(write(),{})).status,201);
let assetCalls = 0;
globalThis.fetch = async (url, init) => {
  assetCalls++;
  if (assetCalls === 1) {
    assert.equal(String(url), 'https://cms.clearfact.ng/wp-json/clearfact-books/v1/public-asset?product=42&kind=cover');
    assert.equal(init.headers['x-clearfact-secret'], env.CLEARFACT_SERVICES_SECRET);
    return Response.json({ url: 'https://cms.clearfact.ng/wp-admin/admin-post.php?action=cfb_file&book=7&kind=cover', mime: 'image/png' });
  }
  assert.equal(String(url), 'https://cms.clearfact.ng/wp-admin/admin-post.php?action=cfb_file&book=7&kind=cover');
  return new Response('image-bytes', { headers: { 'content-type': 'image/png' } });
};
const asset = await proxyServices(new Request(origin+'/api/services/book-asset?product=42&kind=cover'), env);
assert.equal(asset.status, 200);
assert.equal(asset.headers.get('content-type'), 'image/png');
assert.equal(await asset.text(), 'image-bytes');
globalThis.fetch = async () => Response.json([
  { id: 42, title: 'Test book', cover: 'https://cms.clearfact.ng/wp-content/uploads/cover.jpg', sample: 'https://cms.clearfact.ng/?p=1', url: 'https://cms.clearfact.ng/product/test-book', store: true },
]);
const catalogue = await proxyServices(new Request(origin+'/api/services/catalogue?kind=books'), env);
const [book] = await catalogue.json();
assert.equal(book.cover, origin+'/api/services/book-asset?product=42&kind=cover');
assert.equal(book.sample, origin+'/api/services/book-asset?product=42&kind=sample');
assert.equal(book.url, origin+'/books/buy?product=42');
assert.equal(book.purchase_ready, false);
console.log('PASS: proxy origin, size, methods, validation, private headers, upstream errors, readiness and public book boundary.');
