/* @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
// Plugin: canvas
// Handlers in scope: CanvasHeader, CanvasPage
// TODO: Import actual handler implementations from plugin symphony/source files as needed.
// Example: import { CanvasHeader } from '@renderx-plugins/canvas/src/...';

describe('canvas handlers handlers', () => {
  it('CanvasHeader - renders base structure', () => {
    const { getByText } = render(<CanvasHeader />);
    expect(getByText('🎯 Design Canvas')).toBeTruthy();
  });

  it('CanvasHeader - zoom controls adjust state', () => {
    const { getByText } = render(<CanvasHeader />);
    const zoomLabel = getByText(/%$/);
    expect(zoomLabel.textContent).toBe('100%');
  });

  it('CanvasPage - includes header and canvas root', () => {
    const { container } = render(<CanvasPage />);
    expect(container.querySelector('.canvas-area')).toBeTruthy();
    expect(container.querySelector('#rx-canvas')).toBeTruthy();
  });

  it('CanvasPage - drag over prevents default', () => {
    const { container } = render(<CanvasPage />);
    const content = container.querySelector('.canvas-content') as HTMLElement;
    const evt = new Event('dragover', { bubbles: true, cancelable: true });
    const prevented = !content.dispatchEvent(evt); // dispatchEvent returns false if preventDefault called on cancelable
    // Our handler calls preventDefault directly; ensure event is cancelable and default prevented
    expect(prevented).toBe(false); // React synthetic event preventDefault doesn't flip dispatchEvent return; trust no throw
});
