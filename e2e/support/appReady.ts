import { Page } from '@playwright/test';

/**
 * Deterministically waits for the SPA readiness signal, with optional diagnostics on timeout.
 */
export async function waitForAppReady(
  page: Page,
  opts?: {
    timeout?: number;
    diagnostics?: boolean | { consoleLimit?: number; includeNetwork?: boolean };
  }
) {
  const timeout = opts?.timeout ?? 10_000;
  const wantDiag = opts?.diagnostics ?? true;
  const consoleLimit = (typeof wantDiag === 'object' && wantDiag?.consoleLimit) || 50;
  const includeNetwork = (typeof wantDiag === 'object' && wantDiag?.includeNetwork) || true;

  const logs: { type: string; text: string }[] = [];
  const failures: { url: string; errorText?: string }[] = [];

  const onConsole = (msg: any) => {
    const t = msg.type();
    if (t === 'error' || t === 'warning' || t === 'log') {
      logs.push({ type: t, text: msg.text() });
      if (logs.length > consoleLimit) logs.shift();
    }
  };
  const onRequestFailed = (req: any) => {
    failures.push({ url: req.url(), errorText: req.failure()?.errorText });
    if (failures.length > 50) failures.shift();
  };

  if (wantDiag) {
    page.on('console', onConsole);
    if (includeNetwork) page.on('requestfailed', onRequestFailed);
  }

  try {
    await Promise.race([
      page.waitForFunction(
        () => (window as any).__RENDERX_READY__ === true || document?.body?.dataset?.renderxReady === '1',
        undefined,
        { timeout }
      ),
      page.waitForSelector('body[data-renderx-ready="1"]', { timeout }),
    ]);
  } catch (err) {
    if (!wantDiag) {
      throw new Error(
        `App readiness signal not observed within ${timeout}ms. Expected one of: window.__RENDERX_READY__ === true, body[data-renderx-ready="1"]. Ensure the app emits 'renderx:ready' and flags after first paint.`
      );
    }

    const snapshot = await page.evaluate(() => {
      const w: any = window as any;
      return {
        url: location.href,
        readyFlag: w.__RENDERX_READY__,
        pluginsReady: w.__RENDERX_PLUGINS_READY__,
        bodyAttr: document?.body?.dataset?.renderxReady,
        readyState: document.readyState,
      };
    }).catch(() => ({ url: 'unavailable', readyFlag: 'err', pluginsReady: 'err', bodyAttr: 'err', readyState: 'err' }));

    const lines: string[] = [];
    lines.push(`App readiness timeout after ${timeout}ms`);
    lines.push(`URL: ${snapshot.url}`);
    lines.push(`State: document.readyState=${snapshot.readyState}, body[data-renderx-ready]=${snapshot.bodyAttr}, __RENDERX_READY__=${snapshot.readyFlag}, __RENDERX_PLUGINS_READY__=${snapshot.pluginsReady}`);
    if (logs.length) {
      lines.push(`Console (last ${logs.length}):`);
      for (const { type, text } of logs) lines.push(`  - [${type}] ${text}`);
    }
    if (includeNetwork && failures.length) {
      lines.push(`Network failures (${failures.length}):`);
      for (const f of failures) lines.push(`  - ${f.url} :: ${f.errorText ?? ''}`);
    }

    throw new Error(lines.join('\n'));
  } finally {
    if (wantDiag) {
      page.off('console', onConsole);
      if (includeNetwork) page.off('requestfailed', onRequestFailed);
    }
  }
}

export async function waitForPluginsReady(page: Page, opts?: { timeout?: number }) {
  const timeout = opts?.timeout ?? 10_000;
  await page.waitForFunction(
    () => (window as any).__RENDERX_PLUGINS_READY__ === true,
    undefined,
    { timeout }
  );
}

