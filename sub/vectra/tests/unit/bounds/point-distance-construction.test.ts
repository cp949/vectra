import { describe, expect, test } from 'vitest';
import { closestPoint } from '../../../src/bounds/closest-point';
import { closestPointInto } from '../../../src/bounds/closest-point-into';
import { distanceToPoint } from '../../../src/bounds/distance-to-point';
import { expandBySides } from '../../../src/bounds/expand-by-sides';
import { expandBySidesInto } from '../../../src/bounds/expand-by-sides-into';
import { fromCenter } from '../../../src/bounds/from-center';
import { fromCenterInto } from '../../../src/bounds/from-center-into';
import { fromPoints } from '../../../src/bounds/from-points';
import { fromRect } from '../../../src/bounds/from-rect';
import type { BoundsWritable, XYObjectWritable, XYWritable } from '../../../src/types';

function makeBounds(minX = 0, minY = 0, maxX = 0, maxY = 0): BoundsWritable {
  return { min: { x: minX, y: minY }, max: { x: maxX, y: maxY } };
}

function makePoint(x = 0, y = 0): XYObjectWritable {
  return { x, y };
}

// ─── closestPointInto ────────────────────────────────────────────────────────

describe('closestPointInto', () => {
  test('내부 point는 input 좌표를 그대로 기록하고 true를 반환한다', () => {
    const out = makePoint();
    const result = closestPointInto(out, makeBounds(0, 0, 10, 10), { x: 5, y: 5 });
    expect(result).toBe(true);
    expect(out).toEqual({ x: 5, y: 5 });
  });

  test('경계(boundary) point는 input 좌표를 그대로 기록한다', () => {
    const out = makePoint();
    closestPointInto(out, makeBounds(0, 0, 10, 10), { x: 0, y: 5 });
    expect(out).toEqual({ x: 0, y: 5 });
  });

  test('left 방향 외부 point는 min.x로 clamp한다', () => {
    const out = makePoint();
    closestPointInto(out, makeBounds(2, 2, 8, 8), { x: -3, y: 5 });
    expect(out).toEqual({ x: 2, y: 5 });
  });

  test('right 방향 외부 point는 max.x로 clamp한다', () => {
    const out = makePoint();
    closestPointInto(out, makeBounds(2, 2, 8, 8), { x: 15, y: 5 });
    expect(out).toEqual({ x: 8, y: 5 });
  });

  test('top 방향 외부 point는 min.y로 clamp한다', () => {
    const out = makePoint();
    closestPointInto(out, makeBounds(2, 2, 8, 8), { x: 5, y: -1 });
    expect(out).toEqual({ x: 5, y: 2 });
  });

  test('bottom 방향 외부 point는 max.y로 clamp한다', () => {
    const out = makePoint();
    closestPointInto(out, makeBounds(2, 2, 8, 8), { x: 5, y: 20 });
    expect(out).toEqual({ x: 5, y: 8 });
  });

  test('대각선 외부 point는 corner로 clamp한다', () => {
    const out = makePoint();
    closestPointInto(out, makeBounds(2, 2, 8, 8), { x: -1, y: -1 });
    expect(out).toEqual({ x: 2, y: 2 });
  });

  test('line bounds(zero-height)를 non-empty로 처리한다', () => {
    const out = makePoint();
    const result = closestPointInto(out, makeBounds(0, 5, 10, 5), { x: 3, y: 0 });
    expect(result).toBe(true);
    expect(out).toEqual({ x: 3, y: 5 });
  });

  test('point bounds(min === max)를 non-empty로 처리한다', () => {
    const out = makePoint();
    const result = closestPointInto(out, makeBounds(5, 5, 5, 5), { x: 3, y: 3 });
    expect(result).toBe(true);
    expect(out).toEqual({ x: 5, y: 5 });
  });

  test('empty(inverted) bounds에서 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makePoint(99, 99);
    const result = closestPointInto(out, makeBounds(10, 0, 5, 10), { x: 5, y: 5 });
    expect(result).toBe(false);
    expect(out).toEqual({ x: 99, y: 99 });
  });

  test('sentinel bounds에서 false를 반환한다', () => {
    const out = makePoint(99, 99);
    const result = closestPointInto(
      out,
      { min: { x: Infinity, y: Infinity }, max: { x: -Infinity, y: -Infinity } },
      { x: 0, y: 0 }
    );
    expect(result).toBe(false);
    expect(out).toEqual({ x: 99, y: 99 });
  });

  test('out이 bounds.min과 alias되어도 안전하다', () => {
    const minPt: XYWritable = { x: 0, y: 0 };
    const bounds: BoundsWritable = { min: minPt, max: { x: 10, y: 10 } };
    closestPointInto(minPt, bounds, { x: 15, y: 5 });
    expect(minPt).toEqual({ x: 10, y: 5 });
  });

  test('out이 bounds.max와 alias되어도 안전하다', () => {
    const maxPt: XYWritable = { x: 10, y: 10 };
    const bounds: BoundsWritable = { min: { x: 0, y: 0 }, max: maxPt };
    closestPointInto(maxPt, bounds, { x: -5, y: 5 });
    expect(maxPt).toEqual({ x: 0, y: 5 });
  });

  test('out이 point와 alias되어도 안전하다', () => {
    const pt: XYWritable = { x: 15, y: 5 };
    closestPointInto(pt, makeBounds(0, 0, 10, 10), pt);
    expect(pt).toEqual({ x: 10, y: 5 });
  });

  test('tuple BoundsLike를 처리한다', () => {
    const out = makePoint();
    const result = closestPointInto(
      out,
      [
        [2, 2],
        [8, 8],
      ],
      { x: 12, y: 5 }
    );
    expect(result).toBe(true);
    expect(out).toEqual({ x: 8, y: 5 });
  });

  test('tuple XYInput을 처리한다', () => {
    const out = makePoint();
    closestPointInto(out, makeBounds(2, 2, 8, 8), [12, 5]);
    expect(out).toEqual({ x: 8, y: 5 });
  });

  test('tuple XYWritable에 기록하고 동일 참조를 반환한다', () => {
    const out: [number, number] = [0, 0];
    const result = closestPointInto(out, makeBounds(0, 0, 10, 10), { x: 5, y: 5 });
    expect(result).toBe(true);
    expect(out[0]).toBe(5);
    expect(out[1]).toBe(5);
  });

  test('NaN 입력은 NaN으로 전파된다', () => {
    const out = makePoint();
    closestPointInto(out, makeBounds(0, 0, 10, 10), { x: NaN, y: 5 });
    expect(Number.isNaN(out.x)).toBe(true);
    expect(out.y).toBe(5);
  });

  test('Infinity 입력은 max로 clamp된다', () => {
    const out = makePoint();
    closestPointInto(out, makeBounds(0, 0, 10, 10), { x: Infinity, y: 5 });
    expect(out).toEqual({ x: 10, y: 5 });
  });

  test('-Infinity 입력은 min으로 clamp된다', () => {
    const out = makePoint();
    closestPointInto(out, makeBounds(0, 0, 10, 10), { x: -Infinity, y: 5 });
    expect(out).toEqual({ x: 0, y: 5 });
  });
});

// ─── closestPoint ─────────────────────────────────────────────────────────────

describe('closestPoint', () => {
  test('내부 point는 input 좌표를 그대로 반환한다', () => {
    expect(closestPoint(makeBounds(0, 0, 10, 10), { x: 5, y: 5 })).toEqual({ x: 5, y: 5 });
  });

  test('외부 point는 AABB boundary로 clamp한 좌표를 반환한다', () => {
    expect(closestPoint(makeBounds(0, 0, 10, 10), { x: 15, y: 5 })).toEqual({ x: 10, y: 5 });
  });

  test('empty bounds에서 undefined를 반환한다', () => {
    expect(closestPoint(makeBounds(10, 0, 5, 10), { x: 0, y: 0 })).toBeUndefined();
  });

  test('sentinel bounds에서 undefined를 반환한다', () => {
    expect(
      closestPoint({ min: { x: Infinity, y: Infinity }, max: { x: -Infinity, y: -Infinity } }, { x: 0, y: 0 })
    ).toBeUndefined();
  });

  test('새 plain { x, y } object를 반환한다', () => {
    const result = closestPoint(makeBounds(0, 0, 10, 10), { x: 5, y: 5 });
    expect(result).not.toBeNull();
    expect(typeof result?.x).toBe('number');
    expect(typeof result?.y).toBe('number');
  });

  test('line bounds를 non-empty로 처리한다', () => {
    expect(closestPoint(makeBounds(0, 5, 10, 5), { x: 3, y: 0 })).toEqual({ x: 3, y: 5 });
  });

  test('NaN 입력은 NaN으로 전파된다', () => {
    const result = closestPoint(makeBounds(0, 0, 10, 10), { x: NaN, y: 5 });
    expect(result).not.toBeUndefined();
    expect(Number.isNaN(result?.x)).toBe(true);
  });
});

// ─── distanceToPoint ──────────────────────────────────────────────────────────

describe('distanceToPoint', () => {
  test('내부 point는 0을 반환한다', () => {
    expect(distanceToPoint(makeBounds(0, 0, 10, 10), { x: 5, y: 5 })).toBe(0);
  });

  test('boundary point는 0을 반환한다', () => {
    expect(distanceToPoint(makeBounds(0, 0, 10, 10), { x: 0, y: 5 })).toBe(0);
    expect(distanceToPoint(makeBounds(0, 0, 10, 10), { x: 10, y: 5 })).toBe(0);
    expect(distanceToPoint(makeBounds(0, 0, 10, 10), { x: 5, y: 0 })).toBe(0);
    expect(distanceToPoint(makeBounds(0, 0, 10, 10), { x: 5, y: 10 })).toBe(0);
  });

  test('수평 방향 외부 point의 거리를 계산한다', () => {
    expect(distanceToPoint(makeBounds(0, 0, 10, 10), { x: 15, y: 5 })).toBe(5);
    expect(distanceToPoint(makeBounds(0, 0, 10, 10), { x: -3, y: 5 })).toBe(3);
  });

  test('수직 방향 외부 point의 거리를 계산한다', () => {
    expect(distanceToPoint(makeBounds(0, 0, 10, 10), { x: 5, y: 14 })).toBe(4);
    expect(distanceToPoint(makeBounds(0, 0, 10, 10), { x: 5, y: -2 })).toBe(2);
  });

  test('대각선 방향 외부 point의 거리를 계산한다', () => {
    // corner (0,0)에서 (-3, -4)까지 거리 = 5
    expect(distanceToPoint(makeBounds(0, 0, 10, 10), { x: -3, y: -4 })).toBeCloseTo(5);
  });

  test('line bounds(zero-height)의 거리를 계산한다', () => {
    expect(distanceToPoint(makeBounds(0, 5, 10, 5), { x: 3, y: 0 })).toBe(5);
  });

  test('point bounds의 거리를 계산한다', () => {
    // point bounds (5,5)에서 (5,8) 거리 = 3
    expect(distanceToPoint(makeBounds(5, 5, 5, 5), { x: 5, y: 8 })).toBeCloseTo(3);
  });

  test('empty(inverted) bounds에서 Infinity를 반환한다', () => {
    expect(distanceToPoint(makeBounds(10, 0, 5, 10), { x: 5, y: 5 })).toBe(Infinity);
  });

  test('sentinel bounds에서 Infinity를 반환한다', () => {
    expect(
      distanceToPoint({ min: { x: Infinity, y: Infinity }, max: { x: -Infinity, y: -Infinity } }, { x: 0, y: 0 })
    ).toBe(Infinity);
  });

  test('tuple BoundsLike를 처리한다', () => {
    expect(
      distanceToPoint(
        [
          [0, 0],
          [10, 10],
        ],
        { x: 15, y: 5 }
      )
    ).toBe(5);
  });

  test('NaN 입력은 NaN으로 전파된다', () => {
    expect(Number.isNaN(distanceToPoint(makeBounds(0, 0, 10, 10), { x: NaN, y: 5 }))).toBe(true);
  });

  test('Infinity 입력은 JS 산술 결과(Infinity)를 반환한다', () => {
    // cx = Math.min(Math.max(Infinity, 0), 10) = 10, 하지만 Infinity - 10 = Infinity
    expect(distanceToPoint(makeBounds(0, 0, 10, 10), { x: Infinity, y: 5 })).toBe(Infinity);
  });

  test('-Infinity 입력은 JS 산술 결과(Infinity)를 반환한다', () => {
    // cx = Math.min(Math.max(-Infinity, 0), 10) = 0, 하지만 -Infinity - 0 = -Infinity
    expect(distanceToPoint(makeBounds(0, 0, 10, 10), { x: -Infinity, y: 5 })).toBe(Infinity);
  });
});

// ─── expandBySidesInto ────────────────────────────────────────────────────────

describe('expandBySidesInto', () => {
  test('모든 방향을 개별 양만큼 확장한다', () => {
    const out = makeBounds();
    expandBySidesInto(out, makeBounds(2, 2, 8, 8), { top: 1, right: 2, bottom: 3, left: 4 });
    expect(out.min).toEqual({ x: -2, y: 1 });
    expect(out.max).toEqual({ x: 10, y: 11 });
  });

  test('누락 field는 0으로 처리한다', () => {
    const out = makeBounds();
    expandBySidesInto(out, makeBounds(2, 2, 8, 8), { top: 5 });
    expect(out.min).toEqual({ x: 2, y: -3 });
    expect(out.max).toEqual({ x: 8, y: 8 });
  });

  test('빈 padding object는 bounds를 그대로 복사한다', () => {
    const out = makeBounds();
    expandBySidesInto(out, makeBounds(2, 2, 8, 8), {});
    expect(out.min).toEqual({ x: 2, y: 2 });
    expect(out.max).toEqual({ x: 8, y: 8 });
  });

  test('음수 padding은 deflate이며 inverted 결과를 허용한다', () => {
    const out = makeBounds();
    expandBySidesInto(out, makeBounds(2, 2, 8, 8), { top: -10, bottom: -10 });
    // min.y = 2 - (-10) = 12, max.y = 8 + (-10) = -2 → inverted
    expect(out.min.y).toBe(12);
    expect(out.max.y).toBe(-2);
  });

  test('out === bounds여도 안전하다', () => {
    const out = makeBounds(2, 2, 8, 8);
    expandBySidesInto(out, out, { top: 1, right: 2, bottom: 3, left: 4 });
    expect(out.min).toEqual({ x: -2, y: 1 });
    expect(out.max).toEqual({ x: 10, y: 11 });
  });

  test('sentinel bounds에도 raw 산식을 적용한다', () => {
    const out = makeBounds();
    expandBySidesInto(
      out,
      { min: { x: Infinity, y: Infinity }, max: { x: -Infinity, y: -Infinity } },
      { top: 5, bottom: 5 }
    );
    expect(out.min.x).toBe(Infinity);
    expect(out.max.x).toBe(-Infinity);
  });

  test('반환값이 out의 동일 참조이다', () => {
    const out = makeBounds();
    const result = expandBySidesInto(out, makeBounds(2, 2, 8, 8), { top: 1 });
    expect(result).toBe(out);
  });

  test('tuple BoundsLike를 처리한다', () => {
    const out = makeBounds();
    expandBySidesInto(
      out,
      [
        [2, 2],
        [8, 8],
      ],
      { right: 3, left: 1 }
    );
    expect(out.min).toEqual({ x: 1, y: 2 });
    expect(out.max).toEqual({ x: 11, y: 8 });
  });
});

// ─── expandBySides ────────────────────────────────────────────────────────────

describe('expandBySides', () => {
  test('새 plain bounds object를 반환한다', () => {
    const result = expandBySides(makeBounds(2, 2, 8, 8), { top: 1, right: 2, bottom: 3, left: 4 });
    expect(result).toEqual({ min: { x: -2, y: 1 }, max: { x: 10, y: 11 } });
  });

  test('음수 padding은 deflate이다', () => {
    const result = expandBySides(makeBounds(2, 2, 8, 8), { left: -5 });
    expect(result.min.x).toBe(7);
  });
});

// ─── fromRect ─────────────────────────────────────────────────────────────────

describe('fromRect', () => {
  test('rect extent를 bounds로 변환한다', () => {
    const result = fromRect({ x: 2, y: 3, width: 6, height: 4 });
    expect(result).toEqual({ min: { x: 2, y: 3 }, max: { x: 8, y: 7 } });
  });

  test('fromRectInto와 동일한 결과를 반환한다', () => {
    const r = { x: -1, y: 2, width: 5, height: 3 };
    const result = fromRect(r);
    expect(result).toEqual({ min: { x: -1, y: 2 }, max: { x: 4, y: 5 } });
  });

  test('line rect(zero-height)는 line bounds가 된다', () => {
    const result = fromRect({ x: 0, y: 5, width: 10, height: 0 });
    expect(result).toEqual({ min: { x: 0, y: 5 }, max: { x: 10, y: 5 } });
  });

  test('point rect(zero-width, zero-height)는 point bounds가 된다', () => {
    const result = fromRect({ x: 3, y: 4, width: 0, height: 0 });
    expect(result).toEqual({ min: { x: 3, y: 4 }, max: { x: 3, y: 4 } });
  });

  test('negative dimension rect는 inverted bounds가 된다', () => {
    const result = fromRect({ x: 5, y: 5, width: -3, height: 2 });
    expect(result.min.x).toBe(5);
    expect(result.max.x).toBe(2);
  });

  test('tuple RectLike를 처리한다', () => {
    const result = fromRect([2, 3, 6, 4]);
    expect(result).toEqual({ min: { x: 2, y: 3 }, max: { x: 8, y: 7 } });
  });
});

// ─── fromPoints ───────────────────────────────────────────────────────────────

describe('fromPoints', () => {
  test('fromPointsInto와 동일한 결과를 반환한다', () => {
    const result = fromPoints([
      { x: 1, y: 2 },
      { x: 5, y: 0 },
      { x: 3, y: 7 },
    ]);
    expect(result).toEqual({ min: { x: 1, y: 0 }, max: { x: 5, y: 7 } });
  });

  test('빈 배열은 sentinel bounds를 반환한다', () => {
    const result = fromPoints([]);
    expect(result.min.x).toBe(Infinity);
    expect(result.min.y).toBe(Infinity);
    expect(result.max.x).toBe(-Infinity);
    expect(result.max.y).toBe(-Infinity);
  });

  test('단일 point는 point bounds를 반환한다', () => {
    const result = fromPoints([{ x: 3, y: 4 }]);
    expect(result).toEqual({ min: { x: 3, y: 4 }, max: { x: 3, y: 4 } });
  });

  test('tuple XYInput을 처리한다', () => {
    const result = fromPoints([
      [1, 2],
      [5, 0],
    ]);
    expect(result).toEqual({ min: { x: 1, y: 0 }, max: { x: 5, y: 2 } });
  });
});

// ─── fromCenterInto ───────────────────────────────────────────────────────────

describe('fromCenterInto', () => {
  test('center와 positive size로 bounds를 기록한다', () => {
    const out = makeBounds();
    fromCenterInto(out, { x: 5, y: 5 }, { x: 6, y: 4 });
    expect(out.min).toEqual({ x: 2, y: 3 });
    expect(out.max).toEqual({ x: 8, y: 7 });
  });

  test('zero size는 point bounds가 된다', () => {
    const out = makeBounds();
    fromCenterInto(out, { x: 5, y: 5 }, { x: 0, y: 0 });
    expect(out.min).toEqual({ x: 5, y: 5 });
    expect(out.max).toEqual({ x: 5, y: 5 });
  });

  test('negative size는 inverted bounds가 된다', () => {
    const out = makeBounds();
    fromCenterInto(out, { x: 5, y: 5 }, { x: -4, y: 2 });
    // hw = -2, hh = 1
    // min = (5 - (-2), 5 - 1) = (7, 4), max = (5 + (-2), 5 + 1) = (3, 6)
    expect(out.min).toEqual({ x: 7, y: 4 });
    expect(out.max).toEqual({ x: 3, y: 6 });
  });

  test('반환값이 out의 동일 참조이다', () => {
    const out = makeBounds();
    const result = fromCenterInto(out, { x: 5, y: 5 }, { x: 4, y: 4 });
    expect(result).toBe(out);
  });

  test('out이 center와 alias되어도 안전하다', () => {
    const center: XYWritable = { x: 5, y: 5 };
    const out: BoundsWritable = { min: center, max: { x: 0, y: 0 } };
    fromCenterInto(out, center, { x: 6, y: 4 });
    expect(out.min).toEqual({ x: 2, y: 3 });
    expect(out.max).toEqual({ x: 8, y: 7 });
  });

  test('tuple center와 size를 처리한다', () => {
    const out = makeBounds();
    fromCenterInto(out, [5, 5], [6, 4]);
    expect(out.min).toEqual({ x: 2, y: 3 });
    expect(out.max).toEqual({ x: 8, y: 7 });
  });

  test('NaN 입력은 NaN으로 전파된다', () => {
    const out = makeBounds();
    fromCenterInto(out, { x: NaN, y: 5 }, { x: 4, y: 4 });
    expect(Number.isNaN(out.min.x)).toBe(true);
    expect(Number.isNaN(out.max.x)).toBe(true);
  });

  test('Infinity size는 검증 없이 그대로 전파된다', () => {
    const out = makeBounds();
    fromCenterInto(out, { x: 0, y: 0 }, { x: Infinity, y: 4 });
    expect(out.min.x).toBe(-Infinity);
    expect(out.max.x).toBe(Infinity);
  });
});

// ─── fromCenter ───────────────────────────────────────────────────────────────

describe('fromCenter', () => {
  test('center와 positive size로 새 plain bounds를 반환한다', () => {
    const result = fromCenter({ x: 5, y: 5 }, { x: 6, y: 4 });
    expect(result).toEqual({ min: { x: 2, y: 3 }, max: { x: 8, y: 7 } });
  });

  test('zero size는 point bounds를 반환한다', () => {
    const result = fromCenter({ x: 3, y: 4 }, { x: 0, y: 0 });
    expect(result).toEqual({ min: { x: 3, y: 4 }, max: { x: 3, y: 4 } });
  });

  test('negative size는 inverted bounds를 반환한다', () => {
    const result = fromCenter({ x: 5, y: 5 }, { x: -4, y: 2 });
    expect(result.min.x).toBeGreaterThan(result.max.x);
  });

  test('tuple input을 처리한다', () => {
    const result = fromCenter([5, 5], [6, 4]);
    expect(result).toEqual({ min: { x: 2, y: 3 }, max: { x: 8, y: 7 } });
  });
});
