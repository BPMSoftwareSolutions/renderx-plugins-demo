import { expect } from 'vitest';
import { getTelemetry } from './collector';
import { matchesContract, BddTelemetryContractPartial } from './contract';

declare module 'vitest' {
  interface Assertion<T = any> {
    toHaveTelemetry(partial: BddTelemetryContractPartial): T;
  }
}

export function installTelemetryMatcher() {
  expect.extend({
    toHaveTelemetry(partial: BddTelemetryContractPartial) {
      const all = getTelemetry();
      const matched = all.find(r => matchesContract(r, partial));
      if (matched) {
        return {
          pass: true,
          message: () => `Found telemetry matching contract for feature=${partial.feature || '*'} event=${partial.event || '*'}.`
        };
      }
      return {
        pass: false,
        message: () => `No telemetry record matched contract. Total records: ${all.length}. Partial=${JSON.stringify(partial)}`
      };
    }
  });
}
