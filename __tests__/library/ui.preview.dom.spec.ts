/* @vitest-environment jsdom */
import { describe, it, expect, vi } from "vitest";

/**
 * Failing DOM-only spec that targets the extracted helper buildLibraryPreview.
 * This validates the preview DOM we expect LibraryPanel to render.
 */

describe("buildLibraryPreview", () => {
  it("creates a preview DOM that reflects template.tag/classes and applies css + cssVariables (FAILS until implemented)", async () => {
    const { buildLibraryPreview } = await import(
      "../../plugins/library/ui/LibraryPanel"
    );

    const template = {
      tag: "button",
      text: "Click me",
      classes: ["rx-comp", "rx-button"],
      css: ".rx-button { background: var(--bg-color); color: var(--text-color); }",
      cssVariables: { "bg-color": "rgb(17,34,51)", "text-color": "white" },
    } as any;

    const li = document.createElement("li");
    buildLibraryPreview(li, template);

    const child = li.querySelector(".rx-button");
    expect(child).toBeTruthy();

    const styleEl = li.querySelector("style");
    expect(styleEl).toBeTruthy();
    expect(styleEl!.textContent || "").toContain(".rx-button");

    const bg = getComputedStyle(li).getPropertyValue("--bg-color").trim();
    const fg = getComputedStyle(li).getPropertyValue("--text-color").trim();
    expect(bg).toBe("rgb(17,34,51)");
    expect(fg).toBe("white");
  });
});
