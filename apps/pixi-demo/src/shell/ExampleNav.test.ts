import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CATEGORIES, PRIMARY_EXAMPLES } from '../examples/catalog';
import { ExampleNav } from './ExampleNav';

describe('pixi demo example nav', () => {
  it('왼쪽 메뉴에서 예제를 canvas-demo처럼 카테고리별로 표시한다', () => {
    const html = renderToStaticMarkup(
      createElement(ExampleNav, {
        categories: CATEGORIES,
        examples: PRIMARY_EXAMPLES,
        selectedExampleId: PRIMARY_EXAMPLES[0].id,
        onSelectExample: () => undefined,
        isOpen: true,
        width: 280,
      })
    );

    expect(html).toContain('pixi-demo');
    expect(html).toContain('수학');
    expect(html).toContain('벡터');
    expect(html).toContain('각도');
    expect(html).toContain('변환');
    expect(html).toContain('커브');
    expect(html).toContain('패스');
    expect(html).toContain('직선');
    expect(html).toContain('레이');
    expect(html).toContain('선분');
    expect(html).toContain('사각형/Bounds');
    expect(html).toContain('원');
    expect(html).toContain('타원');
    expect(html).toContain('삼각형');
    expect(html).toContain('폴리곤');
    expect(html).toContain('Angle Heading Turn');
    expect(html).toContain('Transform Handles');
    expect(html).toContain('Bezier Control Inspector');
    expect(html).toContain('Content Fit Workbench');
    expect(html).toContain('Rotation Control Dial');
    expect(html).toContain('Vector Control Workbench');
    expect(html).toContain('Curve Sampling Workbench');
    expect(html).not.toContain('Rect Contains Point');
    expect(html).not.toContain('Circle Rect Overlap');
    expect(html).not.toContain('Angle Snap Dial');
  });
});
