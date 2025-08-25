/* @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { handlers as uiHandlers } from "../../plugins/control-panel/symphonies/ui/ui.symphony";

describe("Control Panel UI Sequences", () => {
  let mockCtx: any;

  beforeEach(() => {
    mockCtx = {
      payload: {},
      logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn()
      },
      conductor: {
        play: vi.fn()
      }
    };
  });

  describe("ui.init sequence handlers", () => {
    it("initConfig should mark config as loaded", () => {
      uiHandlers.initConfig({}, mockCtx);
      
      expect(mockCtx.payload.configLoaded).toBe(true);
      expect(mockCtx.logger.info).toHaveBeenCalledWith("Control Panel config initialized");
    });

    it("initResolver should create resolver instance", () => {
      const data = { config: { version: "1.0.0" } };
      
      uiHandlers.initResolver(data, mockCtx);
      
      expect(mockCtx.payload.resolverInitialized).toBe(true);
      expect(mockCtx.payload.resolver).toBeDefined();
      expect(mockCtx.logger.info).toHaveBeenCalledWith("Schema resolver initialized");
    });

    it("loadSchemas should mark schemas as loaded", () => {
      const data = { componentTypes: ['button', 'input'] };
      
      uiHandlers.loadSchemas(data, mockCtx);
      
      expect(mockCtx.payload.schemasLoaded).toBe(true);
      expect(mockCtx.logger.info).toHaveBeenCalledWith("Component schemas loaded");
    });

    it("registerObservers should mark observers as registered", () => {
      uiHandlers.registerObservers({}, mockCtx);
      
      expect(mockCtx.payload.observersRegistered).toBe(true);
      expect(mockCtx.logger.info).toHaveBeenCalledWith("UI observers registered");
    });

    it("notifyReady should mark UI as ready", () => {
      uiHandlers.notifyReady({}, mockCtx);
      
      expect(mockCtx.payload.uiReady).toBe(true);
      expect(mockCtx.payload.timestamp).toBeDefined();
      expect(mockCtx.logger.info).toHaveBeenCalledWith("Control Panel UI ready");
    });
  });

  describe("ui.render sequence handlers", () => {
    it("generateFields should generate empty fields when no resolver", () => {
      const data = { selectedElement: { header: { type: 'button' } } };
      
      uiHandlers.generateFields(data, mockCtx);
      
      expect(mockCtx.payload.fields).toEqual([]);
    });

    it("generateSections should generate empty sections when no resolver", () => {
      const data = { selectedElement: { header: { type: 'button' } } };
      
      uiHandlers.generateSections(data, mockCtx);
      
      expect(mockCtx.payload.sections).toEqual([]);
    });

    it("renderView should mark view as rendered", () => {
      uiHandlers.renderView({}, mockCtx);
      
      expect(mockCtx.payload.viewRendered).toBe(true);
      expect(mockCtx.payload.renderTimestamp).toBeDefined();
      expect(mockCtx.logger.info).toHaveBeenCalledWith("UI view rendered");
    });
  });

  describe("ui.field.change sequence handlers", () => {
    it("prepareField should prepare field change data", () => {
      const data = {
        fieldKey: 'content',
        value: 'New Value',
        selectedElement: { header: { id: 'test-id' } }
      };
      
      uiHandlers.prepareField(data, mockCtx);
      
      expect(mockCtx.payload.fieldKey).toBe('content');
      expect(mockCtx.payload.value).toBe('New Value');
      expect(mockCtx.payload.selectedElement).toEqual({ header: { id: 'test-id' } });
      expect(mockCtx.payload.fieldPrepared).toBe(true);
    });

    it("dispatchField should forward to canvas update", () => {
      mockCtx.payload = {
        fieldKey: 'content',
        value: 'New Value',
        selectedElement: { header: { id: 'test-id' } }
      };
      
      uiHandlers.dispatchField({}, mockCtx);
      
      expect(mockCtx.payload.fieldDispatched).toBe(true);
      expect(mockCtx.conductor.play).toHaveBeenCalledWith(
        "CanvasComponentPlugin",
        "canvas-component-update-symphony",
        {
          id: 'test-id',
          attribute: 'content',
          value: 'New Value'
        }
      );
    });

    it("setDirty should mark UI as dirty", () => {
      uiHandlers.setDirty({}, mockCtx);
      
      expect(mockCtx.payload.isDirty).toBe(true);
      expect(mockCtx.payload.dirtyTimestamp).toBeDefined();
    });

    it("awaitRefresh should mark refresh as awaited", () => {
      uiHandlers.awaitRefresh({}, mockCtx);
      
      expect(mockCtx.payload.refreshAwaited).toBe(true);
    });
  });

  describe("ui.field.validate sequence handlers", () => {
    it("validateField should validate field when no resolver", () => {
      const data = { field: { key: 'test' }, value: 'test-value' };
      
      uiHandlers.validateField(data, mockCtx);
      
      expect(mockCtx.payload.isValid).toBe(true);
      expect(mockCtx.payload.errors).toEqual([]);
    });

    it("mergeErrors should mark errors as merged", () => {
      mockCtx.payload = { fieldKey: 'test', isValid: false, errors: ['Error'] };
      
      uiHandlers.mergeErrors({}, mockCtx);
      
      expect(mockCtx.payload.errorsMerged).toBe(true);
    });

    it("updateView should mark view as updated", () => {
      uiHandlers.updateView({}, mockCtx);
      
      expect(mockCtx.payload.viewUpdated).toBe(true);
      expect(mockCtx.payload.updateTimestamp).toBeDefined();
    });
  });

  describe("ui.section.toggle sequence handlers", () => {
    it("toggleSection should toggle section state", () => {
      const data = { sectionId: 'content' };
      
      uiHandlers.toggleSection(data, mockCtx);
      
      expect(mockCtx.payload.sectionId).toBe('content');
      expect(mockCtx.payload.sectionToggled).toBe(true);
    });

    it("toggleSection should handle missing sectionId", () => {
      uiHandlers.toggleSection({}, mockCtx);
      
      expect(mockCtx.payload.sectionToggled).toBe(false);
      expect(mockCtx.payload.error).toContain("Section toggle requires sectionId");
    });
  });
});
