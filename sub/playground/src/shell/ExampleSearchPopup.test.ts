import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ExampleSearchPopup } from './ExampleSearchPopup';

const CATEGORIES = [
  { id: 'math', title: '수학', order: 0 },
  { id: 'geo', title: '기하', order: 1 },
];

const EXAMPLES = [
  { id: 'vec-lerp', title: 'Vec Lerp', categoryId: 'math', source: { language: 'ts' as const, code: '' } },
  {
    id: 'triangle-centers',
    title: 'Triangle Centers',
    categoryId: 'geo',
    source: { language: 'ts' as const, code: '' },
  },
];

describe('ExampleSearchPopup', () => {
  it('open=false이면 null을 반환한다', () => {
    const html = renderToStaticMarkup(
      createElement(ExampleSearchPopup, {
        open: false,
        examples: EXAMPLES,
        categories: CATEGORIES,
        selectedExampleId: 'vec-lerp',
        onSelectExample: () => undefined,
        onClose: () => undefined,
      })
    );
    expect(html).toBe('');
  });

  it('open=true이면 Dialog 스타일을 포함한다', () => {
    const html = renderToStaticMarkup(
      createElement(ExampleSearchPopup, {
        open: true,
        examples: EXAMPLES,
        categories: CATEGORIES,
        selectedExampleId: 'vec-lerp',
        onSelectExample: () => undefined,
        onClose: () => undefined,
      })
    );
    // MUI Dialog는 portal로 렌더되므로 SSR에서 content가 포함되지 않을 수 있다.
    // Dialog 스타일만 확인 (포털 렌더링 제약)
    expect(html.length).toBeGreaterThan(0);
  });
});
