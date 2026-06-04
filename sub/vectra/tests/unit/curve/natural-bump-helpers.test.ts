/**
 * curve natural spline / bump helper unit test.
 *
 * 검증:
 * - naturalSpline: two-point fallback(직선), three-point smooth curve, endpoint second derivative 0 control relation.
 * - naturalSpline polyline: segment endpoint 포함, join duplicate 제거, invalid steps RangeError, non-finite RangeError.
 * - naturalSpline path: move/cubic command 수와 endpoint 통과.
 * - bump X/Y: control point 좌표 정확성, empty/single-point 빈 output, tuple 입력, non-finite pass-through.
 */

import { describe, expect, it } from 'vitest';
import { bumpXPathInto } from '../../../src/curve/bump-x-path-into';
import { bumpYPathInto } from '../../../src/curve/bump-y-path-into';
import { naturalSplinePathInto } from '../../../src/curve/natural-spline-path-into';
import { naturalSplinePolylineInto } from '../../../src/curve/natural-spline-polyline-into';
import type { CubicCommand, XYInput, XYObjectWritable } from '../../../src/types';

const TWO: XYInput[] = [
  { x: 0, y: 0 },
  { x: 3, y: 6 },
];

const TRI: XYInput[] = [
  { x: 0, y: 0 },
  { x: 1, y: 1 },
  { x: 2, y: 0 },
];

const SEG: XYInput[] = [
  { x: 0, y: 0 },
  { x: 10, y: 4 },
];

describe('naturalSplinePathInto', () => {
  it('two-point 입력은 control point가 1/3, 2/3에 놓인 직선 cubic이다', () => {
    const out = naturalSplinePathInto([], TWO);
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({ kind: 'move', x: 0, y: 0 });
    const c = out[1] as CubicCommand;
    expect(c.kind).toBe('cubic');
    expect(c.x1).toBeCloseTo(1, 10);
    expect(c.y1).toBeCloseTo(2, 10);
    expect(c.x2).toBeCloseTo(2, 10);
    expect(c.y2).toBeCloseTo(4, 10);
    expect(c.x).toBeCloseTo(3, 10);
    expect(c.y).toBeCloseTo(6, 10);
  });

  it('three-point 입력은 move 1개 + cubic 2개로 모든 point를 통과한다', () => {
    const out = naturalSplinePathInto([], TRI);
    expect(out).toHaveLength(3);
    expect(out[0]).toEqual({ kind: 'move', x: 0, y: 0 });
    const c1 = out[1] as CubicCommand;
    const c2 = out[2] as CubicCommand;
    expect(c1.x).toBeCloseTo(1, 10);
    expect(c1.y).toBeCloseTo(1, 10);
    expect(c2.x).toBeCloseTo(2, 10);
    expect(c2.y).toBeCloseTo(0, 10);
  });

  it('endpoint second derivative 0 control relation을 만족한다', () => {
    const out = naturalSplinePathInto([], TRI);
    const first = out[1] as CubicCommand;
    const last = out[out.length - 1] as CubicCommand;
    // 글로벌 시작점 P0=(0,0): P0 - 2*c1 + c2 = 0
    expect(0 - 2 * first.x1 + first.x2).toBeCloseTo(0, 10);
    expect(0 - 2 * first.y1 + first.y2).toBeCloseTo(0, 10);
    // 글로벌 끝점 P3=last.(x,y): c1 - 2*c2 + P3 = 0
    expect(last.x1 - 2 * last.x2 + last.x).toBeCloseTo(0, 10);
    expect(last.y1 - 2 * last.y2 + last.y).toBeCloseTo(0, 10);
  });

  it('NaN / Infinity 좌표는 RangeError를 던진다', () => {
    expect(() =>
      naturalSplinePathInto(
        [],
        [
          { x: Number.NaN, y: 0 },
          { x: 1, y: 1 },
        ]
      )
    ).toThrow(RangeError);
    expect(() =>
      naturalSplinePathInto(
        [],
        [
          { x: 0, y: 0 },
          { x: 1, y: Number.POSITIVE_INFINITY },
        ]
      )
    ).toThrow(RangeError);
  });

  it('points < 2이면 빈 배열을 반환한다', () => {
    expect(naturalSplinePathInto([], [{ x: 0, y: 0 }])).toEqual([]);
    expect(naturalSplinePathInto([], [])).toEqual([]);
  });
});

describe('naturalSplinePolylineInto', () => {
  it('segment 끝점을 포함하고 join duplicate를 만들지 않는다', () => {
    const out: XYObjectWritable[] = [];
    naturalSplinePolylineInto(out, TRI, 4);
    // 2 segment, steps=4: 4 + 1*(4-1) = 7 point
    expect(out).toHaveLength(7);
    expect(out[0]).toEqual({ x: 0, y: 0 });
    expect(out[out.length - 1].x).toBeCloseTo(2, 10);
    expect(out[out.length - 1].y).toBeCloseTo(0, 10);
    for (let i = 1; i < out.length; i++) {
      expect(out[i].x === out[i - 1].x && out[i].y === out[i - 1].y).toBe(false);
    }
  });

  it('steps=1은 입력 vertex polyline을 반환한다', () => {
    const out: XYObjectWritable[] = [];
    naturalSplinePolylineInto(out, TRI, 1);
    expect(out).toHaveLength(3);
    expect(out[0]).toEqual({ x: 0, y: 0 });
    expect(out[2].x).toBeCloseTo(2, 10);
    expect(out[2].y).toBeCloseTo(0, 10);
  });

  it('invalid steps는 RangeError를 던진다', () => {
    expect(() => naturalSplinePolylineInto([], TRI, 0)).toThrow(RangeError);
    expect(() => naturalSplinePolylineInto([], TRI, -1)).toThrow(RangeError);
    expect(() => naturalSplinePolylineInto([], TRI, 3.5)).toThrow(RangeError);
    expect(() => naturalSplinePolylineInto([], TRI, 2 ** 53)).toThrow(RangeError);
  });

  it('points < 2이면 빈 배열을 반환한다', () => {
    expect(naturalSplinePolylineInto([], [{ x: 0, y: 0 }])).toEqual([]);
  });
});

describe('bumpXPathInto', () => {
  it('control point가 c1=(midX,y0), c2=(midX,y1)이다', () => {
    const out = bumpXPathInto([], SEG);
    expect(out[0]).toEqual({ kind: 'move', x: 0, y: 0 });
    expect(out[1]).toEqual({ kind: 'cubic', x1: 5, y1: 0, x2: 5, y2: 4, x: 10, y: 4 });
  });

  it('tuple 입력도 object 입력과 같은 결과를 만든다', () => {
    const out = bumpXPathInto(
      [],
      [
        [0, 0],
        [10, 4],
      ]
    );
    expect(out[1]).toEqual({ kind: 'cubic', x1: 5, y1: 0, x2: 5, y2: 4, x: 10, y: 4 });
  });

  it('empty / single-point는 빈 배열을 반환한다', () => {
    expect(bumpXPathInto([], [])).toEqual([]);
    expect(bumpXPathInto([], [{ x: 1, y: 2 }])).toEqual([]);
  });

  it('NaN / Infinity 좌표는 산술 결과 그대로 pass-through한다', () => {
    const nan = bumpXPathInto(
      [],
      [
        { x: Number.NaN, y: 0 },
        { x: 10, y: 4 },
      ]
    );
    expect(Number.isNaN((nan[1] as CubicCommand).x1)).toBe(true);
    const inf = bumpXPathInto(
      [],
      [
        { x: 0, y: 0 },
        { x: Number.POSITIVE_INFINITY, y: 4 },
      ]
    );
    expect((inf[1] as CubicCommand).x1).toBe(Number.POSITIVE_INFINITY);
    const negInf = bumpXPathInto(
      [],
      [
        { x: Number.NEGATIVE_INFINITY, y: 0 },
        { x: 10, y: 4 },
      ]
    );
    expect((negInf[1] as CubicCommand).x1).toBe(Number.NEGATIVE_INFINITY);
  });
});

describe('bumpYPathInto', () => {
  it('control point가 c1=(x0,midY), c2=(x1,midY)이다', () => {
    const out = bumpYPathInto([], SEG);
    expect(out[0]).toEqual({ kind: 'move', x: 0, y: 0 });
    expect(out[1]).toEqual({ kind: 'cubic', x1: 0, y1: 2, x2: 10, y2: 2, x: 10, y: 4 });
  });

  it('empty / single-point는 빈 배열을 반환한다', () => {
    expect(bumpYPathInto([], [])).toEqual([]);
    expect(bumpYPathInto([], [{ x: 1, y: 2 }])).toEqual([]);
  });
});
