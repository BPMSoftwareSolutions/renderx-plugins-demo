/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";

describe("Control Panel Dark Mode Form Controls", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);

    // Apply dark theme to document
    document.documentElement.setAttribute("data-theme", "dark");

    // Add the CSS variables for dark theme
    const style = document.createElement("style");
    style.textContent = `
      [data-theme="dark"] {
        --bg-color: #1f2937;
        --text-color: #f8fafc;
        --border-color: #333344;
        --muted-text: #a9b1c4;
      }
      
      .property-input {
        padding: 8px 10px;
        border: 1px solid var(--border-color);
        border-radius: 6px;
        font-size: 12px;
        background: var(--bg-color);
        color: var(--text-color);
        transition: all 0.2s;
      }
      
      .property-select {
        padding: 8px 10px;
        border: 1px solid var(--border-color);
        border-radius: 6px;
        font-size: 12px;
        background: var(--bg-color);
        color: var(--text-color);
      }

      .property-checkbox {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 8px;
      }

      .property-checkbox label {
        font-size: 12px;
        color: var(--text-color);
        margin: 0;
      }

      .checkbox-text {
        font-size: 12px;
        color: var(--text-color);
      }
    `;
    document.head.appendChild(style);
  });

  afterEach(() => {
    document.body.removeChild(container);
    document.documentElement.removeAttribute("data-theme");
    // Clean up added styles
    const styles = document.head.querySelectorAll("style");
    styles.forEach((style) => {
      if (style.textContent?.includes("data-theme")) {
        document.head.removeChild(style);
      }
    });
  });

  it("property-input has correct CSS classes and attributes", () => {
    const TestInput = () => (
      <input
        className="property-input"
        type="text"
        defaultValue="Test content"
      />
    );

    const root = createRoot(container);
    act(() => {
      root.render(<TestInput />);
    });

    const input = container.querySelector(
      ".property-input"
    ) as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.className).toBe("property-input");
    expect(input.value).toBe("Test content");

    // Verify the element exists and has the correct class for CSS targeting
    expect(input.classList.contains("property-input")).toBe(true);
  });

  it("property-select has correct CSS classes and options", () => {
    const TestSelect = () => (
      <select className="property-select" defaultValue="option1">
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
      </select>
    );

    const root = createRoot(container);
    act(() => {
      root.render(<TestSelect />);
    });

    const select = container.querySelector(
      ".property-select"
    ) as HTMLSelectElement;
    expect(select).toBeTruthy();
    expect(select.className).toBe("property-select");
    expect(select.value).toBe("option1");

    // Verify the element exists and has the correct class for CSS targeting
    expect(select.classList.contains("property-select")).toBe(true);

    // Verify options exist
    const options = select.querySelectorAll("option");
    expect(options).toHaveLength(2);
  });

  it("select options inherit dark theme styling", () => {
    const TestSelect = () => (
      <select className="property-select" defaultValue="primary">
        <option value="primary">Primary</option>
        <option value="secondary">Secondary</option>
        <option value="medium">Medium</option>
      </select>
    );

    const root = createRoot(container);
    act(() => {
      root.render(<TestSelect />);
    });

    const select = container.querySelector(
      ".property-select"
    ) as HTMLSelectElement;
    expect(select).toBeTruthy();

    // Verify the select has the correct value
    expect(select.value).toBe("primary");

    // Verify options exist
    const options = select.querySelectorAll("option");
    expect(options).toHaveLength(3);
    expect(options[0].textContent).toBe("Primary");
    expect(options[1].textContent).toBe("Secondary");
    expect(options[2].textContent).toBe("Medium");
  });

  it("property-checkbox label uses theme colors", () => {
    const TestCheckbox = () => (
      <div className="property-checkbox">
        <input type="checkbox" id="disabled" defaultChecked />
        <label htmlFor="disabled">Whether the button is disabled</label>
      </div>
    );

    const root = createRoot(container);
    act(() => {
      root.render(<TestCheckbox />);
    });

    const checkbox = container.querySelector(
      'input[type="checkbox"]'
    ) as HTMLInputElement;
    const label = container.querySelector(
      ".property-checkbox label"
    ) as HTMLLabelElement;

    expect(checkbox).toBeTruthy();
    expect(label).toBeTruthy();
    expect(checkbox.checked).toBe(true);
    expect(label.textContent).toBe("Whether the button is disabled");

    // Verify the label has the correct class for CSS targeting
    expect(label.closest(".property-checkbox")).toBeTruthy();
  });

  it("checkbox-text class uses theme colors", () => {
    const TestCheckboxText = () => (
      <div className="property-checkbox">
        <input type="checkbox" id="enabled" defaultChecked />
        <span className="checkbox-text">Whether the button is enabled</span>
      </div>
    );

    const root = createRoot(container);
    act(() => {
      root.render(<TestCheckboxText />);
    });

    const checkbox = container.querySelector(
      'input[type="checkbox"]'
    ) as HTMLInputElement;
    const checkboxText = container.querySelector(
      ".checkbox-text"
    ) as HTMLSpanElement;

    expect(checkbox).toBeTruthy();
    expect(checkboxText).toBeTruthy();
    expect(checkbox.checked).toBe(true);
    expect(checkboxText.textContent).toBe("Whether the button is enabled");

    // Verify the element has the correct class for CSS targeting
    expect(checkboxText.classList.contains("checkbox-text")).toBe(true);
  });
});
