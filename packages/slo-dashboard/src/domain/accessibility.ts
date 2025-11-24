/**
 * Accessibility label mapping for compliance color indicators.
 */
export const ACCESSIBILITY_LABELS: Record<string,string> = {
  green: 'Healthy',
  yellow: 'Needs Attention',
  orange: 'Degraded',
  red: 'Critical'
};

export function getAccessibilityLabelForColor(color: string){
  return ACCESSIBILITY_LABELS[color] || 'Unknown';
}
