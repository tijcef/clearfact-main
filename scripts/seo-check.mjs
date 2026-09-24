const origin = (process.argv[2] || 'https://clearfact.ng').replace(/\/$/, '');
const targets = ['/', '/robots.txt', '/sitemap.xml', '/news-sitemap.xml', '/ads.txt'];

for (const path of targets) {
  const url = `${origin}${path}`;
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: { 'user-agent': 'ClearFact-SEO-Check/1.0' },
    });
    const text = await response.text();
    console.log(`\n${url}`);
    console.log(`status: ${response.status}`);
    console.log(`content-type: ${response.headers.get('content-type') || ''}`);
    console.log(`x-robots-tag: ${response.headers.get('x-robots-tag') || ''}`);
    console.log(`x-clearfact-build: ${response.headers.get('x-clearfact-build') || ''}`);
    if (path === '/sitemap.xml' || path === '/news-sitemap.xml') {
      console.log(`url count: ${(text.match(/<url>/g) || []).length}`);
    }
    if (path === '/ads.txt') {
      console.log(`publisher line present: ${text.includes('pub-8967021504063466')}`);
    }
  } catch (error) {
    console.error(`\n${url}\nERROR:`, error?.message || error);
  }
}
