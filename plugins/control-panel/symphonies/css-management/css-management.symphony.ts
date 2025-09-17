import { 
  createCssClass, 
  updateCssClass, 
  deleteCssClass, 
  getCssClass, 
  listCssClasses,
  applyCssClassToElement,
  removeCssClassFromElement
} from "./css-management.stage-crew";

// NOTE: Runtime sequences are mounted from JSON (see json-sequences/*). This file only exports handlers.

export const handlers = {
  createCssClass,
  updateCssClass,
  deleteCssClass,
  getCssClass,
  listCssClasses,
  applyCssClassToElement,
  removeCssClassFromElement,
  
  notifyUi(data: any, ctx: any) {
    ctx.logger?.info?.('[SYMPHONY] css-management.symphony notifyUi called with data:', data, 'ctx:', ctx);
    
    const { success, className, content, error } = ctx.payload || {};
    
    // Use EventRouter for cross-module communication
    try {
      // Access EventRouter via globalThis to avoid ESLint window warnings
      const globalRouter = (globalThis as any).RenderX?.EventRouter || 
                          (globalThis as any).renderxCommunicationSystem?.EventRouter;
      
      if (globalRouter) {
        globalRouter.publish('control.panel.css.registry.updated', { 
          success, 
          className, 
          content, 
          error,
          timestamp: Date.now()
        });
      } else {
        ctx.logger?.warn?.('EventRouter not available for CSS registry notification');
      }
    } catch (e) {
      ctx.logger?.warn?.("Control Panel CSS registry EventRouter error:", e);
    }
  },
};
