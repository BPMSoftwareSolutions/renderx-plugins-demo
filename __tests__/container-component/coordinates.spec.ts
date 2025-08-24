/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import {
  getContainerInnerRect,
  getLocalPoint,
  translateGlobalToLocal,
  clampToContainer,
  getContainerOf,
} from "../../plugins/container-component/utils/coordinates";

describe("Container coordinate utilities", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("getContainerInnerRect", () => {
    it("returns inner rect excluding padding", () => {
      const container = document.createElement("div");
      container.style.cssText = `
        position: absolute;
        left: 100px;
        top: 50px;
        width: 300px;
        height: 200px;
        padding: 10px 15px 20px 25px;
      `;
      document.body.appendChild(container);

      // Mock getBoundingClientRect
      container.getBoundingClientRect = () => ({
        left: 100,
        top: 50,
        right: 400,
        bottom: 250,
        width: 300,
        height: 200,
      } as DOMRect);

      const innerRect = getContainerInnerRect(container);
      
      expect(innerRect.left).toBe(125); // 100 + 25 (paddingLeft)
      expect(innerRect.top).toBe(60);   // 50 + 10 (paddingTop)
      expect(innerRect.right).toBe(385); // 400 - 15 (paddingRight)
      expect(innerRect.bottom).toBe(230); // 250 - 20 (paddingBottom)
      expect(innerRect.width).toBe(260); // 300 - 25 - 15
      expect(innerRect.height).toBe(170); // 200 - 10 - 20
    });
  });

  describe("getLocalPoint", () => {
    it("translates global point to container-local coordinates", () => {
      const container = document.createElement("div");
      container.style.cssText = `
        position: absolute;
        left: 100px;
        top: 50px;
        width: 300px;
        height: 200px;
        padding: 10px;
      `;
      container.scrollLeft = 5;
      container.scrollTop = 8;
      document.body.appendChild(container);

      container.getBoundingClientRect = () => ({
        left: 100,
        top: 50,
        right: 400,
        bottom: 250,
        width: 300,
        height: 200,
      } as DOMRect);

      const globalPoint = { x: 150, y: 100 };
      const localPoint = getLocalPoint(globalPoint, container);
      
      // Expected: global(150,100) - containerInner(110,60) + scroll(5,8) = (45,48)
      expect(localPoint.x).toBe(45);
      expect(localPoint.y).toBe(48);
    });
  });

  describe("translateGlobalToLocal", () => {
    it("translates global coordinates to local (simple case)", () => {
      const container = document.createElement("div");
      container.style.cssText = "position: absolute; left: 50px; top: 30px; padding: 5px;";
      document.body.appendChild(container);

      container.getBoundingClientRect = () => ({
        left: 50,
        top: 30,
        right: 250,
        bottom: 180,
        width: 200,
        height: 150,
      } as DOMRect);

      const result = translateGlobalToLocal({ x: 100, y: 80 }, container);
      
      // Expected: global(100,80) - containerInner(55,35) + scroll(0,0) = (45,45)
      expect(result.x).toBe(45);
      expect(result.y).toBe(45);
    });
  });

  describe("getContainerOf", () => {
    it("finds nearest container ancestor", () => {
      const container = document.createElement("div");
      container.setAttribute("data-role", "container");
      container.id = "test-container";
      
      const child = document.createElement("div");
      const grandchild = document.createElement("span");
      
      container.appendChild(child);
      child.appendChild(grandchild);
      document.body.appendChild(container);

      const result = getContainerOf(grandchild);
      expect(result).toBe(container);
      expect(result?.id).toBe("test-container");
    });

    it("returns null if no container ancestor found", () => {
      const element = document.createElement("div");
      document.body.appendChild(element);

      const result = getContainerOf(element);
      expect(result).toBeNull();
    });

    it("finds nested container (closest wins)", () => {
      const outerContainer = document.createElement("div");
      outerContainer.setAttribute("data-role", "container");
      outerContainer.id = "outer";
      
      const innerContainer = document.createElement("div");
      innerContainer.setAttribute("data-role", "container");
      innerContainer.id = "inner";
      
      const element = document.createElement("span");
      
      outerContainer.appendChild(innerContainer);
      innerContainer.appendChild(element);
      document.body.appendChild(outerContainer);

      const result = getContainerOf(element);
      expect(result).toBe(innerContainer);
      expect(result?.id).toBe("inner");
    });
  });
});
