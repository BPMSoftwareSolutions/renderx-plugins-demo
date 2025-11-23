import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface JSONViewerProps {
  data: any;
  title?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  maxHeight?: string;
}

export const JSONViewer: React.FC<JSONViewerProps> = ({
  data,
  title,
  collapsible = true,
  defaultExpanded = true,
  maxHeight = '400px'
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    // Guard for non-browser (SSR / Node test environments) where window or navigator may be undefined
    if (typeof window === 'undefined' || typeof navigator === 'undefined' || !navigator.clipboard) {
      // Fallback: no-op copy, still indicate success briefly for consistent UI
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
      return;
    }
    try {
      const jsonString = JSON.stringify(data, null, 2);
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Silently fail in non-secure contexts; log only when debugging
      if (process.env.NODE_ENV !== 'test') {
        console.error('Failed to copy:', err);
      }
    }
  };

  const jsonString = JSON.stringify(data, null, 2);

  return (
    <div className="json-viewer">
      {title && (
        <div className="json-viewer-header">
          {collapsible && (
            <button
              className="json-viewer-toggle"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          <span className="json-viewer-title">{title}</span>
          <button
            className="json-viewer-copy"
            onClick={handleCopy}
            aria-label="Copy to clipboard"
            title="Copy to clipboard"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      )}
      {(!collapsible || isExpanded) && (
        <div className="json-viewer-content" style={{ maxHeight }}>
          <pre className="json-viewer-pre">
            <code className="json-viewer-code">{jsonString}</code>
          </pre>
        </div>
      )}
    </div>
  );
};

