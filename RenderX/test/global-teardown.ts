import type { FullConfig } from '@playwright/test';

export default async function globalTeardown(_config: FullConfig) {
  // no-op for now; could clean temp data
}

