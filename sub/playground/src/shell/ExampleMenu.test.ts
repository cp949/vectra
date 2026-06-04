import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ExampleMenu, groupExamplesByCategory } from './ExampleMenu';

describe('groupExamplesByCategory', () => {
  it('카테고리 순서대로 정렬하고 예시를 카테고리별로 그룹화한다', () => {
    const grouped = groupExamplesByCategory(
      [
        { id: 'b', title: 'B', order: 1 },
        { id: 'a', title: 'A', order: 0 },
      ],
      [
        { id: 'two', title: 'Two', categoryId: 'b', source: { language: 'ts', code: '' } },
        { id: 'one', title: 'One', categoryId: 'a', source: { language: 'ts', code: '' } },
      ]
    );

    expect(grouped.map((item) => item.category.id)).toEqual(['a', 'b']);
    expect(grouped[0]?.examples.map((example) => example.id)).toEqual(['one']);
  });
});

describe('ExampleMenu 표시 정책', () => {
  const categories = [{ id: 'a', title: 'A', order: 0, defaultExpanded: true }];
  const examples = [
    {
      id: 'one',
      title: 'One',
      description: 'This description should be optional',
      categoryId: 'a',
      source: { language: 'ts' as const, code: '' },
    },
  ];

  it('기본값으로 예제 설명을 표시한다', () => {
    const html = renderToStaticMarkup(
      createElement(ExampleMenu, {
        categories,
        examples,
        selectedExampleId: 'one',
        onSelectExample: () => undefined,
      })
    );

    expect(html).toContain('One');
    expect(html).toContain('This description should be optional');
  });

  it('showDescriptions=false이면 왼쪽 메뉴의 예제 설명을 숨긴다', () => {
    const html = renderToStaticMarkup(
      createElement(ExampleMenu, {
        categories,
        examples,
        selectedExampleId: 'one',
        onSelectExample: () => undefined,
        showDescriptions: false,
      })
    );

    expect(html).toContain('One');
    expect(html).not.toContain('This description should be optional');
  });

  it('카테고리 헤더에서 예제 그룹의 접힘/펼침 상태를 표시한다', () => {
    const html = renderToStaticMarkup(
      createElement(ExampleMenu, {
        categories: [
          { id: 'a', title: 'A', order: 0, defaultExpanded: true },
          { id: 'b', title: 'B', order: 1, defaultExpanded: false },
        ],
        examples: [
          { id: 'one', title: 'One', categoryId: 'a', source: { language: 'ts', code: '' } },
          { id: 'two', title: 'Two', categoryId: 'b', source: { language: 'ts', code: '' } },
        ],
        selectedExampleId: 'one',
        onSelectExample: () => undefined,
      })
    );

    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('aria-controls="example-menu-category-a"');
    expect(html).toContain('id="example-menu-category-a"');
    expect(html).toContain('One');
    expect(html).not.toContain('Two');
  });

  it('예제별 보조 표시와 메뉴 상단 action 영역을 렌더한다', () => {
    const html = renderToStaticMarkup(
      createElement(ExampleMenu, {
        categories,
        examples,
        selectedExampleId: 'one',
        onSelectExample: () => undefined,
        menuAction: createElement('button', { type: 'button' }, 'Advanced'),
        renderExampleMeta: (example) => createElement('span', null, example.id === 'one' ? 'merge' : undefined),
      })
    );

    expect(html).toContain('Advanced');
    expect(html).toContain('merge');
  });
});

describe('ExampleMenu 검색 input', () => {
  const categories = [{ id: 'a', title: 'A', order: 0 }];
  const examples = [{ id: 'one', title: 'One', categoryId: 'a', source: { language: 'ts' as const, code: '' } }];

  it('검색 input이 렌더된다', () => {
    const html = renderToStaticMarkup(
      createElement(ExampleMenu, {
        categories,
        examples,
        selectedExampleId: 'one',
        onSelectExample: () => undefined,
      })
    );
    expect(html).toContain('예제 검색');
  });

  it('onOpenSearch가 있으면 Ctrl+/ 버튼이 렌더된다', () => {
    const html = renderToStaticMarkup(
      createElement(ExampleMenu, {
        categories,
        examples,
        selectedExampleId: 'one',
        onSelectExample: () => undefined,
        onOpenSearch: () => undefined,
      })
    );
    expect(html).toContain('Ctrl+/');
  });

  it('onOpenSearch가 없으면 Ctrl+/ 버튼이 없다', () => {
    const html = renderToStaticMarkup(
      createElement(ExampleMenu, {
        categories,
        examples,
        selectedExampleId: 'one',
        onSelectExample: () => undefined,
      })
    );
    expect(html).not.toContain('Ctrl+/');
  });
});
