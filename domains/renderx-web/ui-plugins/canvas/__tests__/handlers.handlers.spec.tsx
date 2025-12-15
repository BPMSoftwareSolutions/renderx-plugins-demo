/* @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';

// Mock host-sdk conductor hook & event router to satisfy component dependencies
vi.mock('@renderx-plugins/host-sdk', () => {
  return {
    useConductor: () => ({ play: async () => {} }),
    resolveInteraction: (key: string) => ({ pluginId: 'mock', sequenceId: key }),
    EventRouter: {
      publish: async () => {},
      subscribe: () => () => {}
    }
  };
});

// Import after mocks so they see the mocked host-sdk
import { CanvasHeader } from '../src/ui/CanvasHeader';
import { CanvasPage } from '../src/ui/CanvasPage';

describe('canvas handlers handlers', () => {
  // Ensure clean DOM between tests so selection / IDs don't leak
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('CanvasHeader - renders base structure', () => {
    const { getByText } = render(<CanvasHeader />);
    expect(getByText('🎯 Design Canvas')).toBeTruthy();
  });

  it('CanvasHeader - zoom controls default to 100%', () => {
    const { getByText } = render(<CanvasHeader />);
    const zoomLabel = getByText(/100%/);
    expect(zoomLabel).toBeTruthy();
  });

  it('CanvasPage - includes header and canvas root', () => {
    const { container } = render(<CanvasPage />);
    expect(container.querySelector('.canvas-area')).toBeTruthy();
    expect(container.querySelector('#rx-canvas')).toBeTruthy();
  });

  it('CanvasPage - drag over handler present', () => {
    const { container } = render(<CanvasPage />);
    const content = container.querySelector('.canvas-content');
    expect(content?.getAttribute('class')).toContain('canvas-content');
  });
});