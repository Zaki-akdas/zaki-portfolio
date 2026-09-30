// LCP deep-probe for the production home page: which element is LCP, the
// phase breakdown (TTFB / load delay / load time / render delay), and the
// network waterfall of what the LCP path depends on. Playwright traces real
// loading (no Lighthouse simulation), so this shows what a real visitor and
// a CI runner actually experience.
const { chromium } = require('@playwright/test');

const URL = process.env.TARGET || 'https://zakiakdas.vercel.app/';
const VIEWPORTS = {
  'ci-like-desktop': { width: 1280, height: 720 },
};

(async () => {
  const browser = await chromium.launch();
  for (const [label, viewport] of Object.entries(VIEWPORTS)) {
    const ctx = await browser.newContext({ viewport });
    const page = await ctx.newPage();
    const t0 = Date.now();
    const requests = [];
    page.on('response', async (res) => {
      const u = res.url();
      try {
        const headers = res.headers();
        requests.push({
          t: Date.now() - t0,
          url: u.replace(/\?.*/, '').slice(-90),
          type: headers['content-type']?.split(';')[0] || '?',
          cache: (headers['cache-control'] || '').slice(0, 30),
          cdn: headers['age'] != null ? `age=${headers['age']}` : '',
          size: (await res.body().catch(() => [])).length,
        });
      } catch {}
    });
    // Fresh context = no seen-flag = preloader runs, like CI/first visit
    await page.goto(URL, { waitUntil: 'load', timeout: 60000 });
    const lcp = await page.evaluate(
      () =>
        new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const es = list.getEntries();
            if (es.length) {
              const e = es[es.length - 1];
              resolve({ url: e.url, tag: e.element?.tagName, cls: e.element?.className?.slice?.(0, 80), size: e.size, startTime: e.startTime, id: e.id });
            }
          }).observe({ type: 'largest-contentful-paint', buffered: true });
          setTimeout(() => resolve(null), 8000);
        })
    );
    const nav = await page.evaluate(() => {
      const n = performance.getEntriesByType('navigation')[0];
      return { ttfb: n.responseStart, domLoaded: n.domContentLoadedEventEnd, load: n.loadEventEnd };
    });
    console.log(`\n=== ${label}`);
    console.log('  TTFB:', nav.ttfb.toFixed(0), 'ms | load event:', nav.load.toFixed(0), 'ms');
    if (lcp) {
      console.log('  LCP:', lcp.startTime.toFixed(0), 'ms |', lcp.tag, `.${String(lcp.cls).slice(0, 40)}`, '| size:', lcp.size);
      console.log('  LCP url:', lcp.url ? lcp.url.slice(0, 100) : '(text node)');
    } else console.log('  LCP: not observed');
    console.log('  --- waterfall (first 20 responses in order) ---');
    requests.slice(0, 20).forEach((r) =>
      console.log(
        `  +${String(r.t).padStart(5)}ms  ${String(r.type).padEnd(10)} ${String((r.size / 1024).toFixed(1) + 'KB').padStart(8)}  ${r.cache.padEnd(30)} ${r.url}`
      )
    );
    const big = requests.filter((r) => r.size > 100_000);
    if (big.length) {
      console.log('  --- responses >100KB ---');
      big.forEach((r) => console.log(`  +${r.t}ms ${r.type} ${(r.size / 1024).toFixed(0)}KB ${r.url}`));
    }
    await ctx.close();
  }
  await browser.close();
  console.log('\nLCP PROBE DONE');
})();
