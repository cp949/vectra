/**
 * curve monotone cubic helper unit test.
 *
 * 검증:
 * - monotoneX, monotoneY 계열: 증가/감소 axis 통과, duplicate axis RangeError, non-finite axis RangeError.
 * - path command가 모든 입력 point를 segment endpoint로 통과한다.
 * - polyline sample이 segment endpoint를 포함하고 join duplicate를 만들지 않는다.
 * - local monotone data에서 sampled 값이 인접 endpoint 범위를 벗어나지 않는다 (overshoot 제한).
 * - invalid steps RangeError.
 */

import { describe, expect, it } from 'vitest';
import { monotoneXPathInto } from '../../../src/curve/monotone-x-path-into';
import { monotoneXPolylineInto } from '../../../src/curve/monotone-x-polyline-into';
import { monotoneYPathInto } from '../../../src/curve/monotone-y-path-into';
import { monotoneYPolylineInto } from '../../../src/curve/monotone-y-polyline-into';
import type { CubicCommand, PathCommand, PointWritable } from '../../../src/types';
import type { Point } from '../../../src/types/flat-shapes.internal';

// x축이 strict 증가하는 표준 입력.
const X_INC: Point[] = [
  { x: 0, y: 0 },
  { x: 1, y: 1 },
  { x: 2, y: 3 },
  { x: 3, y: 6 },
];

// 증가 후 plateau 후 감소: overshoot 제한 검증용. 모든 y는 [0, 1]에 머물러야 한다.
const X_PLATEAU: Point[] = [
  { x: 0, y: 0 },
  { x: 1, y: 1 },
  { x: 2, y: 1 },
  { x: 3, y: 0 },
];

// y축이 strict 증가하고 x는 monotonic이 아닌 입력.
const Y_INC: Point[] = [
  { x: 0, y: 0 },
  { x: 2, y: 1 },
  { x: 2, y: 2 },
  { x: 4, y: 3 },
];

// path가 입력 point를 segment endpoint로 통과하는지 검증한다.
function expectPathThroughPoints(out: PathCommand[], points: Point[]): void {
  expect(out[0]).toEqual({ kind: 'move', x: points[0].x, y: points[0].y });
  expect(out).toHaveLength(points.length);
  for (let i = 1; i < points.length; i++) {
    const cmd = out[i] as CubicCommand;
    expect(cmd.kind).toBe('cubic');
    expect(cmd.x).toBeCloseTo(points[i].x, 10);
    expect(cmd.y).toBeCloseTo(points[i].y, 10);
  }
}

describe('monotoneXPathInto', () => {
  it('증가하는 x에서 move 1개 + cubic으로 모든 입력 point를 통과한다', () => {
    const out = monotoneXPathInto([], X_INC);
    expectPathThroughPoints(out, X_INC);
  });

  it('감소하는 x도 입력 순서대로 통과한다', () => {
    const dec: Point[] = [
      { x: 3, y: 0 },
      { x: 2, y: 2 },
      { x: 1, y: 2 },
      { x: 0, y: 4 },
    ];
    const out = monotoneXPathInto([], dec);
    expectPathThroughPoints(out, dec);
  });

  it('duplicate x는 RangeError를 던진다', () => {
    expect(() =>
      monotoneXPathInto(
        [],
        [
          { x: 0, y: 0 },
          { x: 0, y: 1 },
          { x: 2, y: 2 },
        ]
      )
    ).toThrow(RangeError);
  });

  it('비단조 x는 RangeError를 던진다', () => {
    expect(() =>
      monotoneXPathInto(
        [],
        [
          { x: 0, y: 0 },
          { x: 2, y: 1 },
          { x: 1, y: 2 },
        ]
      )
    ).toThrow(RangeError);
  });

  it('NaN / Infinity 좌표는 RangeError를 던진다', () => {
    expect(() =>
      monotoneXPathInto(
        [],
        [
          { x: Number.NaN, y: 0 },
          { x: 1, y: 1 },
        ]
      )
    ).toThrow(RangeError);
    expect(() =>
      monotoneXPathInto(
        [],
        [
          { x: 0, y: 0 },
          { x: Number.POSITIVE_INFINITY, y: 1 },
        ]
      )
    ).toThrow(RangeError);
    expect(() =>
      monotoneXPathInto(
        [],
        [
          { x: 0, y: Number.NaN },
          { x: 1, y: 1 },
        ]
      )
    ).toThrow(RangeError);
    expect(() =>
      monotoneXPathInto(
        [],
        [
          { x: Number.NEGATIVE_INFINITY, y: 0 },
          { x: 1, y: 1 },
        ]
      )
    ).toThrow(RangeError);
  });

  it('points < 2이면 빈 배열을 반환한다', () => {
    expect(monotoneXPathInto([], [{ x: 0, y: 0 }])).toEqual([]);
    expect(monotoneXPathInto([], [])).toEqual([]);
  });
});

describe('monotoneYPathInto', () => {
  it('증가하는 y에서 x monotonic 없이도 모든 입력 point를 통과한다', () => {
    const out = monotoneYPathInto([], Y_INC);
    expectPathThroughPoints(out, Y_INC);
  });

  it('감소하는 y도 입력 순서대로 통과한다', () => {
    const dec: Point[] = [
      { x: 0, y: 3 },
      { x: 2, y: 2 },
      { x: 2, y: 1 },
      { x: 4, y: 0 },
    ];
    const out = monotoneYPathInto([], dec);
    expectPathThroughPoints(out, dec);
  });

  it('duplicate y는 RangeError를 던진다', () => {
    expect(() =>
      monotoneYPathInto(
        [],
        [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 2, y: 2 },
        ]
      )
    ).toThrow(RangeError);
  });

  it('NaN / Infinity 좌표는 RangeError를 던진다', () => {
    expect(() =>
      monotoneYPathInto(
        [],
        [
          { x: 0, y: Number.NaN },
          { x: 1, y: 1 },
        ]
      )
    ).toThrow(RangeError);
    expect(() =>
      monotoneYPathInto(
        [],
        [
          { x: 0, y: 0 },
          { x: 1, y: Number.NEGATIVE_INFINITY },
        ]
      )
    ).toThrow(RangeError);
    expect(() =>
      monotoneYPathInto(
        [],
        [
          { x: 0, y: 0 },
          { x: Number.POSITIVE_INFINITY, y: 1 },
        ]
      )
    ).toThrow(RangeError);
  });
});

describe('monotoneXPolylineInto', () => {
  it('segment 끝점을 포함하고 join duplicate를 만들지 않는다', () => {
    const out: PointWritable[] = [];
    monotoneXPolylineInto(out, X_INC, { steps: 3 });
    // 3 segment, steps=3: 3 + 2*(3-1) = 7 point
    expect(out).toHaveLength(7);
    expect(out[0]).toEqual({ x: 0, y: 0 });
    expect(out[out.length - 1].x).toBeCloseTo(3, 10);
    expect(out[out.length - 1].y).toBeCloseTo(6, 10);
    // 인접 sample이 정확히 동일하지 않다 (join duplicate 없음)
    for (let i = 1; i < out.length; i++) {
      expect(out[i].x === out[i - 1].x && out[i].y === out[i - 1].y).toBe(false);
    }
  });

  it('local monotone(plateau) data에서 sampled y가 [0,1]을 벗어나지 않는다', () => {
    const out: PointWritable[] = [];
    monotoneXPolylineInto(out, X_PLATEAU, { steps: 12 });
    for (const p of out) {
      expect(p.y).toBeLessThanOrEqual(1 + 1e-9);
      expect(p.y).toBeGreaterThanOrEqual(-1e-9);
    }
  });

  it('steps=1은 입력 vertex polyline을 반환한다', () => {
    const out: PointWritable[] = [];
    monotoneXPolylineInto(out, X_INC, { steps: 1 });
    expect(out).toHaveLength(4);
    expect(out[0]).toEqual({ x: 0, y: 0 });
    expect(out[3].x).toBeCloseTo(3, 10);
  });

  it('invalid steps는 RangeError를 던진다', () => {
    expect(() => monotoneXPolylineInto([], X_INC, { steps: 0 })).toThrow(RangeError);
    expect(() => monotoneXPolylineInto([], X_INC, { steps: -1 })).toThrow(RangeError);
    expect(() => monotoneXPolylineInto([], X_INC, { steps: 2.5 })).toThrow(RangeError);
    expect(() => monotoneXPolylineInto([], X_INC, { steps: 2 ** 53 })).toThrow(RangeError);
  });

  it('invalid steps RangeError 시 out 내용을 변경하지 않는다', () => {
    const out: PointWritable[] = [{ x: 9, y: 9 }];
    expect(() => monotoneXPolylineInto(out, X_INC, { steps: 0 })).toThrow(RangeError);
    expect(out).toEqual([{ x: 9, y: 9 }]);
  });

  it('points < 2이면 빈 배열을 반환한다', () => {
    expect(monotoneXPolylineInto([], [{ x: 0, y: 0 }])).toEqual([]);
  });
});

describe('monotoneYPolylineInto', () => {
  it('segment 끝점을 포함하고 sampled x/y가 단조성을 유지한다', () => {
    const out: PointWritable[] = [];
    monotoneYPolylineInto(out, Y_INC, { steps: 8 });
    expect(out[0]).toEqual({ x: 0, y: 0 });
    expect(out[out.length - 1].y).toBeCloseTo(3, 10);
    // y는 strict 증가 data이므로 sampled y가 비감소다.
    for (let i = 1; i < out.length; i++) {
      expect(out[i].y).toBeGreaterThanOrEqual(out[i - 1].y - 1e-9);
    }
  });
});
