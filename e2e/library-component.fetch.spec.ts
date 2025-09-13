import { test, expect } from '@playwright/test';

test('fetch /json-sequences/library-component/index.json returns OK', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(async () => {
    try {
      const res = await fetch('/json-sequences/library-component/index.json');
      const ok = res.ok;
      const status = res.status;
      const text = ok ? await res.text() : '';
      return { ok, status, text: text.slice(0, 80) };
    } catch (e: any) {
      return { ok: false, status: -1, text: String(e?.message || e) };
    }
  });
  console.log('fetch /json-sequences/library-component/index.json =>', result);
  expect(result.ok, `Expected 200 OK for /json-sequences/library-component/index.json (got ${result.status})`).toBe(true);
});

