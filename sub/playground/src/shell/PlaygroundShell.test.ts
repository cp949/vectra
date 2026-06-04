import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  PlaygroundShell,
  shouldAutoRunSelectedExample,
  shouldAutoRunSelectedExampleEffect,
  shouldOpenConsoleForLogCount,
} from './PlaygroundShell';

const runtimeAdapter = {
  allowedSpecifiers: [],
  defaultRuntimeSeed: {},
  createRunnerHtml: () => '',
};

describe('PlaygroundShell 예제 선택 실행 정책', () => {
  it('선택된 예제가 바뀌면 자동 실행한다', () => {
    expect(shouldAutoRunSelectedExample('ray-light-field', 'steering-swarm')).toBe(true);
  });

  it('같은 예제를 다시 렌더링할 때는 자동 실행하지 않는다', () => {
    expect(shouldAutoRunSelectedExample('steering-swarm', 'steering-swarm')).toBe(false);
  });

  it('shell 최초 mount에서는 현재 예제를 자동 실행한다', () => {
    expect(shouldAutoRunSelectedExampleEffect(false, 'ray-light-field', 'ray-light-field')).toBe(true);
  });

  it('최초 실행 이후에는 예제가 바뀔 때만 자동 실행한다', () => {
    expect(shouldAutoRunSelectedExampleEffect(true, 'ray-light-field', 'ray-light-field')).toBe(false);
    expect(shouldAutoRunSelectedExampleEffect(true, 'ray-light-field', 'steering-swarm')).toBe(true);
  });
});

describe('PlaygroundShell console 표시 정책', () => {
  it('새 console log가 추가되면 console dock을 연다', () => {
    expect(shouldOpenConsoleForLogCount(0, 1)).toBe(true);
    expect(shouldOpenConsoleForLogCount(1, 2)).toBe(true);
  });

  it('console log 개수가 늘지 않으면 console dock을 열지 않는다', () => {
    expect(shouldOpenConsoleForLogCount(0, 0)).toBe(false);
    expect(shouldOpenConsoleForLogCount(2, 1)).toBe(false);
  });
});

describe('PlaygroundShell chrome 표시 정책', () => {
  const selectedExample = {
    id: 'example-one',
    title: 'Example One',
    description: 'Detailed example description',
    categoryId: 'demo',
    source: { language: 'ts' as const, code: 'export function setup() {}' },
  };

  const categories = [{ id: 'demo', title: 'Demo', order: 0, defaultExpanded: true }];
  const examples = [selectedExample];

  it('기본값으로 왼쪽 메뉴 설명과 top bar 예제 제목/설명을 숨긴다', () => {
    const html = renderToStaticMarkup(
      createElement(PlaygroundShell, {
        selectedExample,
        categories,
        examples,
        runtimeAdapter,
        colorMode: 'light',
        onToggleColorMode: () => undefined,
        onSelectExample: () => undefined,
      })
    );

    expect(html.match(/Example One/g)?.length).toBe(1);
    expect(html).not.toContain('Detailed example description');
    expect(html).toContain('aria-label="Hide Menu"');
    expect(html).not.toContain('aria-label="Index"');
  });

  it('랜딩 페이지 핸들러가 있어도 top bar 왼쪽 버튼은 메뉴 토글로 표시한다', () => {
    const html = renderToStaticMarkup(
      createElement(PlaygroundShell, {
        selectedExample,
        categories,
        examples,
        runtimeAdapter,
        colorMode: 'light',
        onToggleColorMode: () => undefined,
        onSelectExample: () => undefined,
        onOpenIndex: () => undefined,
      })
    );

    expect(html).toContain('aria-label="Hide Menu"');
    expect(html).not.toContain('aria-label="Index"');
  });

  it('옵션을 켜면 기존처럼 왼쪽 메뉴 설명과 top bar 예제 제목/설명을 표시한다', () => {
    const html = renderToStaticMarkup(
      createElement(PlaygroundShell, {
        selectedExample,
        categories,
        examples,
        runtimeAdapter,
        colorMode: 'light',
        onToggleColorMode: () => undefined,
        onSelectExample: () => undefined,
        showExampleDescriptions: true,
        showHeaderExampleTitle: true,
      })
    );

    expect(html.match(/Example One/g)?.length).toBe(2);
    expect(html.match(/Detailed example description/g)?.length).toBe(2);
  });
});
