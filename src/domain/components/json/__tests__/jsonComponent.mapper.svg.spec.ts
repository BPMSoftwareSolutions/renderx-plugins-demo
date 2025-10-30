import { describe, it, expect } from 'vitest';
import { mapJsonComponentToTemplate } from '../jsonComponent.mapper';

describe('mapJsonComponentToTemplate - SVG Components', () => {
	describe('AI-generated SVG with custom type', () => {
		const aiGeneratedSvg = {
			metadata: {
				type: 'custom-svg-flower',
				name: 'SVG Flower',
				category: 'custom',
				description: 'An SVG component that resembles a flower',
				version: '1.0.0',
				author: 'AI Generated',
				tags: ['svg', 'graphic', 'flower'],
			},
			ui: {
				template: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="flower-svg">
  <circle cx="12" cy="12" r="10" fill="var(--primary-color, #3b82f6)" />
  <circle cx="12" cy="6" r="4" fill="var(--secondary-color, #6b7280)" />
</svg>`,
				styles: {
					css: '.flower-svg { width: 100px; height: 100px; }',
					variables: {},
					library: {
						css: '.flower-svg { width: 50px; height: 50px; }',
						variables: {},
					},
				},
				icon: {
					mode: 'emoji',
					value: '🌸',
				},
			},
		};

		it('should detect SVG component by template content, not just type', () => {
			const template = mapJsonComponentToTemplate(aiGeneratedSvg);
			expect(template.tag).toBe('svg');
		});

		it('should extract viewBox from SVG template', () => {
			const template = mapJsonComponentToTemplate(aiGeneratedSvg);
			expect(template.content).toBeDefined();
			expect(template.content.viewBox).toBe('0 0 24 24');
		});

		it('should extract inner SVG markup', () => {
			const template = mapJsonComponentToTemplate(aiGeneratedSvg);
			expect(template.content).toBeDefined();
			expect(template.content.svgMarkup).toBeDefined();
			expect(template.content.svgMarkup).toContain('<circle');
			expect(template.content.svgMarkup).toContain('cx="12"');
		});

		it('should include CSS styles from ui.styles.css', () => {
			const template = mapJsonComponentToTemplate(aiGeneratedSvg);
			expect(template.css).toBe('.flower-svg { width: 100px; height: 100px; }');
		});

		it('should include library CSS styles', () => {
			const template = mapJsonComponentToTemplate(aiGeneratedSvg);
			expect(template.cssLibrary).toBe('.flower-svg { width: 50px; height: 50px; }');
		});

		it('should include icon emoji in data attributes', () => {
			const template = mapJsonComponentToTemplate(aiGeneratedSvg);
			expect(template.attributes).toBeDefined();
			expect(template.attributes['data-icon']).toBe('🌸');
		});

		it('should include category in data attributes', () => {
			const template = mapJsonComponentToTemplate(aiGeneratedSvg);
			expect(template.attributes['data-category']).toBe('custom');
		});

		it('should include description in data attributes', () => {
			const template = mapJsonComponentToTemplate(aiGeneratedSvg);
			expect(template.attributes['data-description']).toBe(
				'An SVG component that resembles a flower'
			);
		});

		it('should include base component classes', () => {
			const template = mapJsonComponentToTemplate(aiGeneratedSvg);
			expect(template.classes).toContain('rx-comp');
			expect(template.classes).toContain('rx-custom-svg-flower');
		});

		it('should provide default dimensions for SVG without integration config', () => {
			const template = mapJsonComponentToTemplate(aiGeneratedSvg);
			expect(template.dimensions).toBeDefined();
			expect(template.dimensions.width).toBe(900);
			expect(template.dimensions.height).toBe(500);
		});

		it('should handle SVG with preserveAspectRatio attribute', () => {
			const svgWithPreserve = {
				...aiGeneratedSvg,
				ui: {
					...aiGeneratedSvg.ui,
					template: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid slice">
  <circle cx="12" cy="12" r="10" />
</svg>`,
				},
			};

			const template = mapJsonComponentToTemplate(svgWithPreserve);
			expect(template.content.preserveAspectRatio).toBe('xMidYMid slice');
		});

		it('should handle SVG with both viewBox and preserveAspectRatio', () => {
			const svgWithBoth = {
				...aiGeneratedSvg,
				ui: {
					...aiGeneratedSvg.ui,
					template: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
  <rect width="100" height="100" fill="blue" />
</svg>`,
				},
			};

			const template = mapJsonComponentToTemplate(svgWithBoth);
			expect(template.content.viewBox).toBe('0 0 100 100');
			expect(template.content.preserveAspectRatio).toBe('none');
		});
	});

	describe('Standard SVG component', () => {
		const standardSvg = {
			metadata: {
				type: 'svg',
				name: 'SVG',
				version: '1.0.0',
				author: 'RenderX Team',
				description: 'SVG container',
				category: 'basic',
				tags: ['svg', 'vector'],
			},
			ui: {
				template: '<svg class="rx-comp rx-svg"></svg>',
				styles: {
					css: '.rx-svg * { vector-effect: non-scaling-stroke; }',
					variables: {},
					library: {
						variables: {},
						css: '.rx-lib .rx-svg { opacity: 0.98; }',
					},
				},
				icon: { mode: 'emoji', value: '🖼️', position: 'start' },
			},
			integration: {
				properties: {
					schema: {
						viewBox: { type: 'string', default: '0 0 900 500' },
						preserveAspectRatio: { type: 'string', default: 'xMidYMid meet' },
						svgMarkup: { type: 'string', default: '' },
					},
					defaultValues: {
						viewBox: '0 0 900 500',
						preserveAspectRatio: 'xMidYMid meet',
					},
				},
				canvasIntegration: {
					resizable: true,
					draggable: true,
					selectable: true,
					defaultWidth: 900,
					defaultHeight: 500,
				},
			},
		};

		it('should use integration defaultValues when provided', () => {
			const template = mapJsonComponentToTemplate(standardSvg);
			expect(template.content.viewBox).toBe('0 0 900 500');
			expect(template.content.preserveAspectRatio).toBe('xMidYMid meet');
		});

		it('should use canvas integration dimensions', () => {
			const template = mapJsonComponentToTemplate(standardSvg);
			expect(template.dimensions.width).toBe(900);
			expect(template.dimensions.height).toBe(500);
		});
	});

	describe('Edge cases', () => {
		it('should handle SVG with multiline template', () => {
			const multilineSvg = {
				metadata: { type: 'custom-svg', name: 'Test' },
				ui: {
					template: `<svg viewBox="0 0 50 50">
  <defs>
    <style>
      .cls-1 { fill: red; }
    </style>
  </defs>
  <circle class="cls-1" cx="25" cy="25" r="20" />
</svg>`,
					styles: { css: '', variables: {}, library: { css: '', variables: {} } },
					icon: { mode: 'emoji', value: '⭕' },
				},
			};

			const template = mapJsonComponentToTemplate(multilineSvg);
			expect(template.content.svgMarkup).toContain('<defs>');
			expect(template.content.svgMarkup).toContain('<style>');
			expect(template.content.viewBox).toBe('0 0 50 50');
		});

		it('should handle SVG with no viewBox attribute', () => {
			const noViewBoxSvg = {
				metadata: { type: 'custom-svg', name: 'Test' },
				ui: {
					template: '<svg><circle cx="12" cy="12" r="10" /></svg>',
					styles: { css: '', variables: {}, library: { css: '', variables: {} } },
					icon: { mode: 'emoji', value: '⭕' },
				},
			};

			const template = mapJsonComponentToTemplate(noViewBoxSvg);
			expect(template.content.svgMarkup).toContain('<circle');
			// Should use default dimensions
			expect(template.dimensions.width).toBe(900);
			expect(template.dimensions.height).toBe(500);
		});
	});
});

