import { describe, expect, it } from 'vitest';
import { canvasDrawApi } from './draw';
import { serializeCanvasDrawApi } from './serialize-draw-api';

/** 직렬화된 draw API 메서드를 클로저 없는 iframe 환경처럼 실행한다 */
function runSerializedDrawMethod(methodName: keyof typeof canvasDrawApi): void {
  const fn = new Function(
    'ctx',
    'point',
    'options',
    `const api = ${serializeCanvasDrawApi(canvasDrawApi as unknown as Record<string, unknown>)}; api[${JSON.stringify(methodName)}](ctx, point, options);`
  ) as (ctx: Record<string, unknown>, point: readonly [number, number], options: Record<string, unknown>) => void;

  const calls: string[] = [];
  const ctx = {
    beginPath: () => calls.push('beginPath'),
    arc: () => calls.push('arc'),
    fill: () => calls.push('fill'),
  };

  fn(ctx, [12, 34], { color: '#38bdf8', radius: 5 });

  expect(calls).toEqual(['beginPath', 'arc', 'fill']);
}

describe('canvasDrawApi 직렬화 실행', () => {
  it('point 메서드는 iframe 직렬화 후에도 클로저 없이 실행된다', () => {
    runSerializedDrawMethod('point');
  });

  it('segment 메서드는 object shorthand를 iframe 직렬화 후에도 렌더링한다', () => {
    const fn = new Function(
      'ctx',
      `const api = ${serializeCanvasDrawApi(canvasDrawApi as unknown as Record<string, unknown>)}; api.segment(ctx, { a: { x: 1, y: 2 }, b: { x: 5, y: 6 } }, { color: '#38bdf8', width: 2 });`
    ) as (ctx: Record<string, unknown>) => void;

    const calls: unknown[][] = [];
    const ctx = {
      beginPath: () => calls.push(['beginPath']),
      moveTo: (...args: unknown[]) => calls.push(['moveTo', ...args]),
      lineTo: (...args: unknown[]) => calls.push(['lineTo', ...args]),
      stroke: () => calls.push(['stroke']),
      set strokeStyle(value: unknown) {
        calls.push(['strokeStyle', value]);
      },
      set lineWidth(value: unknown) {
        calls.push(['lineWidth', value]);
      },
    };

    fn(ctx);

    expect(calls).toEqual([
      ['beginPath'],
      ['moveTo', 1, 2],
      ['lineTo', 5, 6],
      ['strokeStyle', '#38bdf8'],
      ['lineWidth', 2],
      ['stroke'],
    ]);
  });

  it('bounds 메서드는 tuple shorthand를 iframe 직렬화 후에도 렌더링한다', () => {
    const fn = new Function(
      'ctx',
      `const api = ${serializeCanvasDrawApi(canvasDrawApi as unknown as Record<string, unknown>)}; api.bounds(ctx, [[1, 2], [5, 6]], { fill: 'none' });`
    ) as (ctx: Record<string, unknown>) => void;

    const calls: unknown[][] = [];
    const ctx = {
      beginPath: () => calls.push(['beginPath']),
      rect: (...args: unknown[]) => calls.push(['rect', ...args]),
      stroke: () => calls.push(['stroke']),
    };

    fn(ctx);

    expect(calls).toEqual([['beginPath'], ['rect', 1, 2, 4, 4], ['stroke']]);
  });

  it('circle 메서드는 tuple shorthand를 iframe 직렬화 후에도 렌더링한다', () => {
    const fn = new Function(
      'ctx',
      `const api = ${serializeCanvasDrawApi(canvasDrawApi as unknown as Record<string, unknown>)}; api.circle(ctx, [[3, 4], 5], { fill: 'none' });`
    ) as (ctx: Record<string, unknown>) => void;

    const calls: unknown[][] = [];
    const ctx = {
      beginPath: () => calls.push(['beginPath']),
      arc: (...args: unknown[]) => calls.push(['arc', ...args]),
      stroke: () => calls.push(['stroke']),
    };

    fn(ctx);

    expect(calls).toEqual([['beginPath'], ['arc', 3, 4, 5, 0, Math.PI * 2], ['stroke']]);
  });

  it('rect 메서드는 tuple shorthand를 iframe 직렬화 후에도 렌더링한다', () => {
    const fn = new Function(
      'ctx',
      `const api = ${serializeCanvasDrawApi(canvasDrawApi as unknown as Record<string, unknown>)}; api.rect(ctx, [1, 2, 3, 4], { fill: 'none' });`
    ) as (ctx: Record<string, unknown>) => void;

    const calls: unknown[][] = [];
    const ctx = {
      beginPath: () => calls.push(['beginPath']),
      rect: (...args: unknown[]) => calls.push(['rect', ...args]),
      stroke: () => calls.push(['stroke']),
    };

    fn(ctx);

    expect(calls).toEqual([['beginPath'], ['rect', 1, 2, 3, 4], ['stroke']]);
  });
});
