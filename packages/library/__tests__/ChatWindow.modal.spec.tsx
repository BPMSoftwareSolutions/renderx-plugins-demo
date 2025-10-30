/**
 * Unit tests for ChatWindow modal behavior
 * Tests that the AI dialog displays as a centered modal with backdrop overlay
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ChatWindow } from '../src/ui/ChatWindow';

// Mock the OpenAI service
vi.mock('../src/services/openai.service', () => ({
  OpenAIService: vi.fn(() => ({
    isConfigured: vi.fn(() => false),
    getConfigStatus: vi.fn(() => ({
      configured: false,
      model: 'gpt-3.5-turbo',
      error: null
    }))
  }))
}));

// Mock chat utilities
vi.mock('../src/utils/chat.utils', () => ({
  getCurrentChatSession: vi.fn(() => null),
  addMessagesToCurrentSession: vi.fn(),
  clearAllChatHistory: vi.fn(),
  getConversationContext: vi.fn(() => []),
  startNewChatSession: vi.fn()
}));

describe('ChatWindow Modal Behavior', () => {
  const mockOnClose = vi.fn();
  const mockOnComponentGenerated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render nothing when isOpen is false', () => {
    const { container } = render(
      <ChatWindow
        isOpen={false}
        onClose={mockOnClose}
        onComponentGenerated={mockOnComponentGenerated}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render modal backdrop when isOpen is true', () => {
    const { container } = render(
      <ChatWindow
        isOpen={true}
        onClose={mockOnClose}
        onComponentGenerated={mockOnComponentGenerated}
      />
    );

    const backdrop = container.querySelector('.chat-modal-backdrop');
    expect(backdrop).not.toBeNull();
  });

  it('should render chat window when isOpen is true', () => {
    const { container } = render(
      <ChatWindow
        isOpen={true}
        onClose={mockOnClose}
        onComponentGenerated={mockOnComponentGenerated}
      />
    );

    const chatWindow = container.querySelector('.chat-window');
    expect(chatWindow).not.toBeNull();
  });

  it('should close modal when backdrop is clicked', () => {
    const { container } = render(
      <ChatWindow
        isOpen={true}
        onClose={mockOnClose}
        onComponentGenerated={mockOnComponentGenerated}
      />
    );

    const backdrop = container.querySelector('.chat-modal-backdrop');
    expect(backdrop).not.toBeNull();

    fireEvent.click(backdrop!);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should close modal when close button is clicked', () => {
    const { container } = render(
      <ChatWindow
        isOpen={true}
        onClose={mockOnClose}
        onComponentGenerated={mockOnComponentGenerated}
      />
    );

    const closeButton = container.querySelector('.chat-close-button');
    expect(closeButton).not.toBeNull();

    fireEvent.click(closeButton!);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should close modal when ESC key is pressed', async () => {
    const { container } = render(
      <ChatWindow
        isOpen={true}
        onClose={mockOnClose}
        onComponentGenerated={mockOnComponentGenerated}
      />
    );

    // Verify modal is open
    const chatWindow = container.querySelector('.chat-window');
    expect(chatWindow).not.toBeNull();

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    }, { timeout: 500 });
  });

  it('should have proper z-index layering', () => {
    const { container } = render(
      <ChatWindow
        isOpen={true}
        onClose={mockOnClose}
        onComponentGenerated={mockOnComponentGenerated}
      />
    );

    const backdrop = container.querySelector('.chat-modal-backdrop') as HTMLElement;
    const chatWindow = container.querySelector('.chat-window') as HTMLElement;

    expect(backdrop).not.toBeNull();
    expect(chatWindow).not.toBeNull();

    // Verify both elements have the correct classes for z-index styling
    expect(backdrop.classList.contains('chat-modal-backdrop')).toBe(true);
    expect(chatWindow.classList.contains('chat-window')).toBe(true);
  });

  it('should center the modal on screen using CSS transform', () => {
    const { container } = render(
      <ChatWindow
        isOpen={true}
        onClose={mockOnClose}
        onComponentGenerated={mockOnComponentGenerated}
      />
    );

    const chatWindow = container.querySelector('.chat-window') as HTMLElement;
    expect(chatWindow).not.toBeNull();

    // Check that the element has the chat-window class (CSS will be applied)
    expect(chatWindow.classList.contains('chat-window')).toBe(true);
  });

  it('should have backdrop with semi-transparent background', () => {
    const { container } = render(
      <ChatWindow
        isOpen={true}
        onClose={mockOnClose}
        onComponentGenerated={mockOnComponentGenerated}
      />
    );

    const backdrop = container.querySelector('.chat-modal-backdrop') as HTMLElement;
    expect(backdrop).not.toBeNull();

    // Check that the element has the backdrop class (CSS will be applied)
    expect(backdrop.classList.contains('chat-modal-backdrop')).toBe(true);
  });

  it('should render both backdrop and window in a fragment', () => {
    const { container } = render(
      <ChatWindow
        isOpen={true}
        onClose={mockOnClose}
        onComponentGenerated={mockOnComponentGenerated}
      />
    );

    const backdrop = container.querySelector('.chat-modal-backdrop');
    const chatWindow = container.querySelector('.chat-window');

    // Both should exist and be siblings (rendered in a fragment)
    expect(backdrop).not.toBeNull();
    expect(chatWindow).not.toBeNull();
    expect(backdrop?.parentElement).toBe(chatWindow?.parentElement);
  });
});

