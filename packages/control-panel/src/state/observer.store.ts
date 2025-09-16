// Simple observer registry for Control Panel UI callbacks
// Keeps UI thin by allowing symphonies to notify registered observers
// IMPORTANT: Use a global singleton so UI and symphonies (built as separate bundles)
// share the same store instance in the browser/runtime.

type SelectionObserver = (selectionModel: any) => void;
type ClassesObserver = (classData: any) => void;
type CssRegistryObserver = (cssData: any) => void;

type Store = {
  selectionObserver: SelectionObserver | null;
  classesObserver: ClassesObserver | null;
  cssRegistryObserver: CssRegistryObserver | null;
  pendingSelectionModel: any | null;
};

function getStore(): Store {
  const g: any = (globalThis as any);
  if (!g.__RENDERX_CP_STORE__) {
    g.__RENDERX_CP_STORE__ = {
      selectionObserver: null,
      classesObserver: null,
      cssRegistryObserver: null,
      pendingSelectionModel: null,
    } as Store;
  }
  return g.__RENDERX_CP_STORE__ as Store;
}

export function setSelectionObserver(observer: SelectionObserver | null) {
  const store = getStore();
  if (observer === store.selectionObserver) return; // idempotent
  store.selectionObserver = observer;
  // observer registered; avoid console logging in production environments
  // Flush any pending selection immediately upon registration
  if (store.selectionObserver && store.pendingSelectionModel) {
    try {
      // flush pending selection on observer register
      store.selectionObserver(store.pendingSelectionModel);
    } catch {}
    store.pendingSelectionModel = null;
  }
}

export function getSelectionObserver(): SelectionObserver | null {
  return getStore().selectionObserver;
}

// Notify helper: returns true if delivered to an observer, false if buffered
export function notifySelection(selectionModel: any): boolean {
  const store = getStore();
  const observer = store.selectionObserver;
  if (observer) {
    try {
      // deliver selection to observer
      observer(selectionModel);
    } catch {}
    return true;
  }
  // buffer selection until observer registers
  store.pendingSelectionModel = selectionModel;
  return false;
}

export function setClassesObserver(observer: ClassesObserver | null) {
  const store = getStore();
  if (observer === store.classesObserver) return; // idempotent
  store.classesObserver = observer;
}

export function getClassesObserver(): ClassesObserver | null {
  return getStore().classesObserver;
}

export function setCssRegistryObserver(observer: CssRegistryObserver | null) {
  const store = getStore();
  if (observer === store.cssRegistryObserver) return; // idempotent
  store.cssRegistryObserver = observer;
}

export function getCssRegistryObserver(): CssRegistryObserver | null {
  return getStore().cssRegistryObserver;
}

// Utilities for cleanup/testing
export function clearAllObservers() {
  const store = getStore();
  store.selectionObserver = null;
  store.classesObserver = null;
  store.cssRegistryObserver = null;
  store.pendingSelectionModel = null;
}

// Read and clear any pending selection buffered before the UI observer registered
export function consumePendingSelection(): any | null {
  const store = getStore();
  const pending = store.pendingSelectionModel || null;
  store.pendingSelectionModel = null;
  return pending;
}
