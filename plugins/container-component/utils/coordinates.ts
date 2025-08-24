/**
 * Container coordinate utilities for translating between global and local coordinate spaces
 */

export type Point = { x: number; y: number };
export type Rect = { left: number; top: number; right: number; bottom: number; width: number; height: number };

/**
 * Get the inner rect of a container (excluding padding, including scroll offset)
 */
export function getContainerInnerRect(container: HTMLElement): Rect {
  const rect = container.getBoundingClientRect();
  const computedStyle = getComputedStyle(container);
  
  const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
  const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
  const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
  const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;
  
  return {
    left: rect.left + paddingLeft,
    top: rect.top + paddingTop,
    right: rect.right - paddingRight,
    bottom: rect.bottom - paddingBottom,
    width: rect.width - paddingLeft - paddingRight,
    height: rect.height - paddingTop - paddingBottom,
  };
}

/**
 * Translate a global point (clientX/clientY) to local coordinates relative to a container
 */
export function getLocalPoint(globalPoint: Point, container: HTMLElement): Point {
  const innerRect = getContainerInnerRect(container);
  return {
    x: globalPoint.x - innerRect.left + container.scrollLeft,
    y: globalPoint.y - innerRect.top + container.scrollTop,
  };
}

/**
 * Translate global coordinates to local coordinates, accounting for nested containers
 */
export function translateGlobalToLocal(globalPoint: Point, targetContainer: HTMLElement): Point {
  // For now, simple implementation - can be extended for nested container chains
  return getLocalPoint(globalPoint, targetContainer);
}

/**
 * Clamp a point to stay within container inner bounds
 */
export function clampToContainer(point: Point, container: HTMLElement): Point {
  const innerRect = getContainerInnerRect(container);
  const containerRect = container.getBoundingClientRect();
  
  // Convert to container-local coordinates for clamping
  const localPoint = getLocalPoint({ x: innerRect.left + point.x, y: innerRect.top + point.y }, container);
  
  const maxX = container.scrollWidth - (innerRect.width - containerRect.width);
  const maxY = container.scrollHeight - (innerRect.height - containerRect.height);
  
  return {
    x: Math.max(0, Math.min(localPoint.x, maxX)),
    y: Math.max(0, Math.min(localPoint.y, maxY)),
  };
}

/**
 * Find the nearest container element (with data-role="container") that contains the given element
 */
export function getContainerOf(element: HTMLElement): HTMLElement | null {
  let current = element.parentElement;
  while (current) {
    if (current.getAttribute('data-role') === 'container') {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}
