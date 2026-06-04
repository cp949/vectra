import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CATEGORIES, EXAMPLES } from '../examples/catalog';
import { ExampleIndexPage } from './ExampleIndexPage';

describe('canvas demo index page', () => {
  it('showcase landing과 같은 dark list layout으로 예제를 표시한다', () => {
    const html = renderToStaticMarkup(
      createElement(ExampleIndexPage, { categories: CATEGORIES, examples: EXAMPLES, onSelectExample: () => undefined })
    );

    expect(html).toContain('background:#020617');
    expect(html).toContain('Function catalog demos');
    expect(html).toContain('Canvas Demo');
    expect(html).toContain(
      'Geometry and math examples with editable source, Canvas preview, console output, and URL-addressable examples.'
    );
    expect(html).toContain('/segment-snap');
    expect(html).not.toContain('canvas-demo 예제 목록');
    expect(html).not.toContain('MuiButton');
  });
});
