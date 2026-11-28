/** iframe에 직렬화한 Canvas 그리기 API의 좌표 전달을 확인한다. */
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
  ) as (ctx: Record<string, unknown>, point: { x: number; y: number }, options: Record<string, unknown>) => void;

  const calls: string[] = [];
  const ctx = {
    beginPath: () => calls.push('beginPath'),
    arc: () => calls.push('arc'),
    fill: () => calls.push('fill'),
  };

  fn(ctx, { x: 12, y: 34 }, { color: '#38bdf8', radius: 5 });

  expect(calls).toEqual(['beginPath', 'arc', 'fill']);
}

describe('canvasDrawApi 직렬화 실행', () => {
  it('point 메서드는 iframe 직렬화 후에도 클로저 없이 실행된다', () => {
    runSerializedDrawMethod('point');
  });

  it('segment 메서드는 평평한 좌표를 iframe 직렬화 후에도 렌더링한다', () => {
    const fn = new Function(
      'ctx',
      `const api = ${serializeCanvasDrawApi(canvasDrawApi as unknown as Record<string, unknown>)}; api.segment(ctx, { x1: 1, y1: 2, x2: 5, y2: 6 }, { color: '#38bdf8', width: 2 });`
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

  it('bounds 메서드는 평평한 좌표를 iframe 직렬화 후에도 렌더링한다', () => {
    const fn = new Function(
      'ctx',
      `const api = ${serializeCanvasDrawApi(canvasDrawApi as unknown as Record<string, unknown>)}; api.bounds(ctx, { minX: 1, minY: 2, maxX: 5, maxY: 6 }, { fill: 'none' });`
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

  it('circle 메서드는 평평한 좌표를 iframe 직렬화 후에도 렌더링한다', () => {
    const fn = new Function(
      'ctx',
      `const api = ${serializeCanvasDrawApi(canvasDrawApi as unknown as Record<string, unknown>)}; api.circle(ctx, { cx: 3, cy: 4, r: 5 }, { fill: 'none' });`
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

  it('rect 메서드는 평평한 좌표를 iframe 직렬화 후에도 렌더링한다', () => {
    const fn = new Function(
      'ctx',
      `const api = ${serializeCanvasDrawApi(canvasDrawApi as unknown as Record<string, unknown>)}; api.rect(ctx, { x: 1, y: 2, width: 3, height: 4 }, { fill: 'none' });`
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
  it('polygon 메서드는 x, y가 번갈아 나오는 좌표 배열을 iframe 직렬화 후에도 닫힌 경로로 그린다', () => {
    const fn = new Function(
      'ctx',
      `const api = ${serializeCanvasDrawApi(canvasDrawApi as unknown as Record<string, unknown>)}; api.polygon(ctx, [0, 0, 4, 0, 4, 3], { fill: 'none' });`
    ) as (ctx: Record<string, unknown>) => void;

    const calls: unknown[][] = [];
    const ctx = {
      beginPath: () => calls.push(['beginPath']),
      moveTo: (...args: unknown[]) => calls.push(['moveTo', ...args]),
      lineTo: (...args: unknown[]) => calls.push(['lineTo', ...args]),
      closePath: () => calls.push(['closePath']),
      stroke: () => calls.push(['stroke']),
    };

    fn(ctx);

    expect(calls).toEqual([
      ['beginPath'],
      ['moveTo', 0, 0],
      ['lineTo', 4, 0],
      ['lineTo', 4, 3],
      ['closePath'],
      ['stroke'],
    ]);
  });
});
