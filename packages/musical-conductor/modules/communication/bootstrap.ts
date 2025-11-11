/**
 * Logging Bootstrap
 * Ensures ConductorLogger global shims (__MC_LOG/INFO/WARN/ERROR) are initialized
 * before any other communication system code executes, removing the need for
 * fallback patterns like `(__MC_LOG || console.log)`.
 *
 * Safe to run multiple times; subsequent invocations detect existing globals.
 */
import { eventBus } from "./EventBus.js";
import { ConductorLogger } from "./sequences/monitoring/ConductorLogger.js";

(function initLoggingBootstrap() {
  try {
    const g: any = (globalThis as any);
    const already = g.__MC_LOG && g.__MC_INFO && g.__MC_WARN && g.__MC_ERROR;
    if (!already) {
      const logger = new ConductorLogger(eventBus as any, true);
      logger.init();
      // Minimal marker so we can confirm bootstrap presence in runtime logs
      g.__MC_LOG("🎼 Logging bootstrap initialized (early global shims established)");
    }
  } catch (e) {
    // Only fallback to console if absolutely necessary – should be rare.
    try {
      console.warn("⚠️ Logging bootstrap failed:", e);
    } catch {}
  }
})();
