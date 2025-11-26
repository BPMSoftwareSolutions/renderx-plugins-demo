import { describe, it, expect } from "vitest";
import {
  setSelectionObserver,
  getSelectionObserver,
  setClassesObserver,
  getClassesObserver,
  setCssRegistryObserver,
  getCssRegistryObserver,
  clearAllObservers,
} from "@renderx-plugins/control-panel/observer.store";

describe("observer.store idempotency", () => {
  let ctx: any;
  beforeEach(() => {
    ctx = {
      handler: null, // TODO: Import handler
      mocks: {
        database: vi.fn(),
        fileSystem: vi.fn(),
        logger: vi.fn(),
        eventBus: vi.fn()
      },
      input: {},
      output: null,
      error: null,`n      payload: {}
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    ctx = null;
  });
  it("setters are idempotent and clearAll resets observers", () => {
    clearAllObservers();

    const sel = () => {};
    const cls = () => {};
    const css = () => {};

    setSelectionObserver(sel);
    setSelectionObserver(sel); // idempotent
    expect(getSelectionObserver()).toBe(sel);

    setClassesObserver(cls);
    setClassesObserver(cls); // idempotent
    expect(getClassesObserver()).toBe(cls);

    setCssRegistryObserver(css);
    setCssRegistryObserver(css); // idempotent
    expect(getCssRegistryObserver()).toBe(css);

    clearAllObservers();
    expect(getSelectionObserver()).toBeNull();
    expect(getClassesObserver()).toBeNull();
    expect(getCssRegistryObserver()).toBeNull();
  });
});


