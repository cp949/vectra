import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CATEGORIES, EXAMPLES } from '../examples/catalog';
import { PlaygroundPage } from './PlaygroundPage';

describe('canvas demo playground page', () => {
  it('왼쪽 메뉴 홈 라벨을 Canvas Demo로 표시한다', () => {
    const selectedExample = EXAMPLES[0];
    if (!selectedExample) throw new Error('canvas demo 예제가 필요하다');

    const html = renderToStaticMarkup(
      createElement(PlaygroundPage, {
        selectedExample,
        categories: CATEGORIES,
        examples: EXAMPLES,
        onSelectExample: () => undefined,
        onOpenIndex: () => undefined,
        onDirtyChange: () => undefined,
        colorMode: 'light',
        onToggleColorMode: () => undefined,
      })
    );

    expect(html).toContain('Canvas Demo');
    expect(html).not.toContain('Vectra Showcase');
  });
});
