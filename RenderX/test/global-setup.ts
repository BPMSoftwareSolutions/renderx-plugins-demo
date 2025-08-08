import type { FullConfig } from '@playwright/test';

export default async function globalSetup(_config: FullConfig) {
  // no-op for now; could prepare test data or logs directory
}

