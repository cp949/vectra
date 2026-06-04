/**
 * curve step helper unit test.
 *
 * 검증:
 * - stepPolylineInto: middle/before/after elbow, empty/single-point, tuple/object 입력,
 *   duplicate point 보존, non-finite pass-through, invalid mode RangeError.
 * - stepPathInto: move/line command 순서와 mode별 elbow.
 * - stepBeforePathInto / stepAfterPathInto: fixed mode가 stepPathInto({ mode }) 결과와 일치.
 */

import { describe, expect, it } from 'vitest';
import { stepAfterPathInto } from '../../../src/curve/step-after-path-into';
import { stepBeforePathInto } from '../../../src/curve/step-before-path-into';
import { stepPathInto } from '../../../src/curve/step-path-into';
import { stepPolylineInto } from '../../../src/curve/step-polyline-into';
import type { XYInput, XYObjectWritable } from '../../../src/types';

const SEG: XYInput[] = [
  { x: 0, y: 0 },
  { x: 10, y: 4 },
];

const TRI: XYInput[] = [
  { x: 0, y: 0 },
  { x: 10, y: 4 },
  { x: 20, y: 0 },
];

describe('stepPolylineInto', () => {
  it('middle mode는 각 segment에서 midX elbow 두 개를 거쳐 끝점에 도달한다', () => {
    const out: XYObjectWritable[] = [];
    expect(stepPolylineInto(out, SEG)).toBe(out);
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: 5, y: 0 },
      { x: 5, y: 4 },
      { x: 10, y: 4 },
    ]);
  });

  it('before mode는 (x1,y0) elbow를 거친다', () => {
    const out: XYObjectWritable[] = [];
    stepPolylineInto(out, SEG, { mode: 'before' });
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 4 },
    ]);
  });

  it('after mode는 (x0,y1) elbow를 거친다', () => {
    const out: XYObjectWritable[] = [];
    stepPolylineInto(out, SEG, { mode: 'after' });
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 4 },
      { x: 10, y: 4 },
    ]);
  });

  it('multi-segment middle mode는 첫 시작점만 포함하고 segment마다 elbow를 잇는다', () => {
    const out: XYObjectWritable[] = [];
    stepPolylineInto(out, TRI);
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: 5, y: 0 },
      { x: 5, y: 4 },
      { x: 10, y: 4 },
      { x: 15, y: 4 },
      { x: 15, y: 0 },
      { x: 20, y: 0 },
    ]);
  });

  it('빈 입력은 빈 배열을 반환한다', () => {
    const out: XYObjectWritable[] = [{ x: 9, y: 9 }];
    expect(stepPolylineInto(out, [])).toBe(out);
    expect(out).toEqual([]);
  });

  it('single-point 입력은 빈 배열을 반환한다', () => {
    const out: XYObjectWritable[] = [];
    stepPolylineInto(out, [{ x: 1, y: 2 }]);
    expect(out).toEqual([]);
  });

  it('tuple 입력도 object 입력과 같은 결과를 만든다', () => {
    const out: XYObjectWritable[] = [];
    stepPolylineInto(out, [
      [0, 0],
      [10, 4],
    ]);
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: 5, y: 0 },
      { x: 5, y: 4 },
      { x: 10, y: 4 },
    ]);
  });

  it('consecutive duplicate point를 제거하지 않는다', () => {
    const out: XYObjectWritable[] = [];
    stepPolylineInto(out, [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ]);
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ]);
  });

  it('NaN 좌표는 산술 결과 그대로 pass-through한다', () => {
    const out: XYObjectWritable[] = [];
    stepPolylineInto(out, [
      { x: Number.NaN, y: 0 },
      { x: 10, y: 4 },
    ]);
    // start (NaN,0), midX=(NaN+10)/2=NaN elbow 2개, 끝점 (10,4)
    expect(Number.isNaN(out[0].x)).toBe(true);
    expect(out[0].y).toBe(0);
    expect(Number.isNaN(out[1].x)).toBe(true);
    expect(Number.isNaN(out[2].x)).toBe(true);
    expect(out[3]).toEqual({ x: 10, y: 4 });
  });

  it('Infinity / -Infinity 좌표는 산술 결과 그대로 pass-through한다', () => {
    const outPos: XYObjectWritable[] = [];
    stepPolylineInto(outPos, [
      { x: Number.POSITIVE_INFINITY, y: 0 },
      { x: 10, y: 4 },
    ]);
    expect(outPos[0].x).toBe(Number.POSITIVE_INFINITY);
    expect(outPos[1].x).toBe(Number.POSITIVE_INFINITY);

    const outNeg: XYObjectWritable[] = [];
    stepPolylineInto(outNeg, [
      { x: Number.NEGATIVE_INFINITY, y: 0 },
      { x: 10, y: 4 },
    ]);
    expect(outNeg[0].x).toBe(Number.NEGATIVE_INFINITY);
    expect(outNeg[1].x).toBe(Number.NEGATIVE_INFINITY);
  });

  it('Infinity + -Infinity midX는 NaN으로 pass-through한다', () => {
    const out: XYObjectWritable[] = [];
    stepPolylineInto(out, [
      { x: Number.POSITIVE_INFINITY, y: 0 },
      { x: Number.NEGATIVE_INFINITY, y: 4 },
    ]);
    expect(out[0].x).toBe(Number.POSITIVE_INFINITY);
    // midX = (Infinity + -Infinity) / 2 = NaN
    expect(Number.isNaN(out[1].x)).toBe(true);
    expect(Number.isNaN(out[2].x)).toBe(true);
    expect(out[3].x).toBe(Number.NEGATIVE_INFINITY);
  });

  it('invalid mode는 RangeError를 던진다', () => {
    const out: XYObjectWritable[] = [];
    // @ts-expect-error invalid mode 런타임 검증
    expect(() => stepPolylineInto(out, SEG, { mode: 'diagonal' })).toThrow(RangeError);
  });
});

describe('stepPathInto', () => {
  it('middle mode는 move 1개 뒤 line command로 elbow를 잇는다', () => {
    const out = stepPathInto([], SEG);
    expect(out).toEqual([
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 5, y: 0 },
      { kind: 'line', x: 5, y: 4 },
      { kind: 'line', x: 10, y: 4 },
    ]);
  });

  it('before mode는 (x1,y0) elbow line을 만든다', () => {
    const out = stepPathInto([], SEG, { mode: 'before' });
    expect(out).toEqual([
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
      { kind: 'line', x: 10, y: 4 },
    ]);
  });

  it('after mode는 (x0,y1) elbow line을 만든다', () => {
    const out = stepPathInto([], SEG, { mode: 'after' });
    expect(out).toEqual([
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 0, y: 4 },
      { kind: 'line', x: 10, y: 4 },
    ]);
  });

  it('빈 입력과 single-point는 빈 command 배열을 반환한다', () => {
    expect(stepPathInto([], [])).toEqual([]);
    expect(stepPathInto([], [{ x: 1, y: 2 }])).toEqual([]);
  });

  it('invalid mode는 RangeError를 던진다', () => {
    // @ts-expect-error invalid mode 런타임 검증
    expect(() => stepPathInto([], SEG, { mode: 'zigzag' })).toThrow(RangeError);
  });
});

describe('stepBeforePathInto / stepAfterPathInto', () => {
  it('stepBeforePathInto는 stepPathInto({ mode: before }) 결과와 같다', () => {
    expect(stepBeforePathInto([], TRI)).toEqual(stepPathInto([], TRI, { mode: 'before' }));
  });

  it('stepAfterPathInto는 stepPathInto({ mode: after }) 결과와 같다', () => {
    expect(stepAfterPathInto([], TRI)).toEqual(stepPathInto([], TRI, { mode: 'after' }));
  });

  it('빈 입력은 빈 command 배열을 반환한다', () => {
    expect(stepBeforePathInto([], [])).toEqual([]);
    expect(stepAfterPathInto([], [])).toEqual([]);
  });
});
