// Simple observer registry for Control Panel UI callbacks
// Keeps UI thin by allowing symphonies to notify registered observers
// IMPORTANT: Use a global singleton so UI and symphonies share the same store across bundles

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
  if (store.selectionObserver && store.pendingSelectionModel) {
    try {
      store.selectionObserver(store.pendingSelectionModel);
    } catch {}
    store.pendingSelectionModel = null;
  }
}

export function getSelectionObserver(): SelectionObserver | null {
  return getStore().selectionObserver;
}

export function notifySelection(selectionModel: any): boolean {
  const store = getStore();
  const observer = store.selectionObserver;
  if (observer) {
    try { observer(selectionModel); } catch {}
    return true;
  }
  store.pendingSelectionModel = selectionModel;
  return false;
}

export function consumePendingSelection(): any | null {
  const store = getStore();
  const pending = store.pendingSelectionModel || null;
  store.pendingSelectionModel = null;
  return pending;
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
