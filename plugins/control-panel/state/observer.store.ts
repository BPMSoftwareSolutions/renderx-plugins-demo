// Simple observer registry for Control Panel UI callbacks
// Keeps UI thin by allowing symphonies to notify registered observers

type SelectionObserver = (selectionModel: any) => void;
type ClassesObserver = (classData: any) => void;

let selectionObserver: SelectionObserver | null = null;
let classesObserver: ClassesObserver | null = null;

export function setSelectionObserver(observer: SelectionObserver | null) {
  selectionObserver = observer;
}

export function getSelectionObserver(): SelectionObserver | null {
  return selectionObserver;
}

export function setClassesObserver(observer: ClassesObserver | null) {
  classesObserver = observer;
}

export function getClassesObserver(): ClassesObserver | null {
  return classesObserver;
}
