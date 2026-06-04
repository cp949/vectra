import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CATEGORIES, EXAMPLE_TRIAGE, EXAMPLES, PRIMARY_EXAMPLES } from '../examples/catalog';
import { ExampleIndexPage } from './ExampleIndexPage';

describe('pixi demo index page', () => {
  it('showcase landing과 같은 dark list layout으로 예제를 표시한다', () => {
    const html = renderToStaticMarkup(
      createElement(ExampleIndexPage, {
        categories: CATEGORIES,
        examples: PRIMARY_EXAMPLES,
        onSelectExample: () => undefined,
        showAdvancedExamples: false,
        onToggleAdvancedExamples: () => undefined,
      })
    );

    expect(html).toContain('background:#020617');
    expect(html).toContain('Function catalog demos');
    expect(html).toContain('Pixi Demo');
    expect(html).toContain(
      'Geometry and math examples with editable source, Pixi preview, console output, and URL-addressable examples.'
    );
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
    expect(html).not.toContain('/orbit-segment');
    expect(html).toContain('/content-fit-workbench');
    expect(html).toContain('/shape-hitbox-lab');
    expect(html).toContain('/clearance-closest-point-lab');
    expect(html).toContain('/rect-layout-workbench');
    expect(html).toContain('/rotation-control-dial');
    expect(html).toContain('/circular-measurement-lab');
    expect(html).toContain('/curve-sampling-workbench');
    expect(html).toContain('/raycast-workbench');
    expect(html).toContain('/vector-control-workbench');
    expect(html).toContain('/vector-collision-response');
    expect(html).toContain('/motion-interpolation-workbench');
    expect(html).toContain('/segment-construction-lab');
    expect(html).toContain('/triangle-construction-lab');
    expect(html).not.toContain('/rect-contains-point');
    expect(html).not.toContain('/circle-rect-overlap');
    expect(html).not.toContain('/bounds-closest-point');
    expect(html).not.toContain('/rect-uniform-inflate');
    expect(html).not.toContain('/angle-snap-dial');
    expect(html).not.toContain('/ray-circle-hit');
    expect(html).not.toContain('/vec-wall-slide');
    expect(html).not.toContain('pixi-demo 예제 목록');
    expect(html).not.toContain('MuiButton');
  });

  it('advanced mode에서는 숨김 예제를 표시하고 triage badge를 붙인다', () => {
    const html = renderToStaticMarkup(
      createElement(ExampleIndexPage, {
        categories: CATEGORIES,
        examples: EXAMPLES,
        exampleTriage: EXAMPLE_TRIAGE,
        onSelectExample: () => undefined,
        showAdvancedExamples: true,
        onToggleAdvancedExamples: () => undefined,
      })
    );

    expect(html).toContain('Advanced');
    expect(html).toContain('/shape-hitbox-lab');
    expect(html).toContain('/rect-contains-point');
    expect(html).toContain('/circle-rect-overlap');
    expect(html).toContain('/angle-snap-dial');
    expect(html).toContain('/angle-octant-dial');
    expect(html).toContain('merge');
    expect(html).toContain('demote');
  });
});
