/**
 * Drag Preview Component
 * Provides real-time visual feedback during drag operations with click offset compensation
 *
 * ALIGNMENT STRATEGY:
 * - Preview shows exactly where the component's TOP-LEFT CORNER will be placed
 * - Position = mouse position - click offset (compensated position)
 * - User sees accurate preview of final component placement
 * - Follows project CSS class generation patterns
 */

import React, { useEffect } from "react";
import { injectCSSRule } from "../utils/cssUtils";

interface DragPreviewProps {
  isVisible: boolean;
  position: { x: number; y: number };
  clickOffset: { x: number; y: number };
  componentData?: any;
  elementType?: string;
}

const DragPreview: React.FC<DragPreviewProps> = ({
  isVisible,
  position,
  clickOffset,
  componentData,
  elementType = "component"
}) => {
  // Generate unique CSS class for this preview
  const previewClass = "rx-drag-preview";

  useEffect(() => {
    // Inject base drag preview styles following project patterns
    injectCSSRule(`.${previewClass}`, {
      position: "absolute",
      pointerEvents: "none",
      zIndex: 1000,
      border: "2px dashed var(--primary-color, #667eea)",
      borderRadius: "var(--radius-md, 4px)",
      backgroundColor: "rgba(102, 126, 234, 0.15)",
      transition: "var(--transition-fast, 0.15s ease)",
      transform: "scale(0.95)",
      opacity: 0.85,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "11px",
      fontWeight: "500",
      color: "var(--primary-color, #667eea)",
      textAlign: "center",
      overflow: "hidden",
    });

    // Inject hidden state styles
    injectCSSRule(`.${previewClass}--hidden`, {
      display: "none",
    });

    // Inject debug info styles
    injectCSSRule(`.${previewClass}__debug`, {
      fontSize: "9px",
      opacity: 0.7,
      marginTop: "2px",
      fontFamily: "monospace",
    });
  }, [previewClass]);

  useEffect(() => {
    if (isVisible) {
      // Calculate the final position with click offset compensation
      // This is where the component's TOP-LEFT CORNER will be placed
      const compensatedX = position.x - clickOffset.x;
      const compensatedY = position.y - clickOffset.y;

      // Get component dimensions from data or use defaults
      const width = componentData?.integration?.canvasIntegration?.defaultWidth ||
                   componentData?.ui?.width || 120;
      const height = componentData?.integration?.canvasIntegration?.defaultHeight ||
                    componentData?.ui?.height || 40;

      // Inject dynamic positioning and sizing
      injectCSSRule(`.${previewClass}--active`, {
        left: `${compensatedX}px`,
        top: `${compensatedY}px`,
        width: `${width}px`,
        height: `${height}px`,
        display: "flex",
      });

      console.log(`🎯 DragPreview: Showing at compensated position (${compensatedX}, ${compensatedY}) with size ${width}x${height}`);
    }
  }, [isVisible, position, clickOffset, componentData, previewClass]);

  if (!isVisible) {
    return null;
  }

  // Calculate display values for debugging
  const compensatedX = position.x - clickOffset.x;
  const compensatedY = position.y - clickOffset.y;
  const componentName = componentData?.metadata?.name || elementType;

  return (
    <div className={`${previewClass} ${previewClass}--active`}>
      <div>
        <div>{componentName}</div>
        <div className={`${previewClass}__debug`}>
          ({compensatedX}, {compensatedY})
        </div>
      </div>
    </div>
  );
};

export default DragPreview;
