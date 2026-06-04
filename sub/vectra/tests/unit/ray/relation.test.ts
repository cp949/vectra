import { describe, expect, expectTypeOf, test } from 'vitest';
import { rayFrom } from '../../../src/ray/ray-from';
import { singleIntersection } from '../../../src/ray/single-intersection';
import { singleIntersectionInto } from '../../../src/ray/single-intersection-into';
import type { XYObjectWritable } from '../../../src/types';

// 편의 헬퍼
// +x 방향 ray (origin=(0,0))
const rayRight = rayFrom({ x: 0, y: 0 }, { x: 1, y: 0 });
// +y 방향 ray (origin=(0,0))
const rayUp = rayFrom({ x: 0, y: 0 }, { x: 0, y: 1 });
// +x 방향 ray (origin=(2,1))
const rayRight2 = rayFrom({ x: 2, y: 1 }, { x: 1, y: 0 });
// -x 방향 ray (origin=(0,0))
const rayLeft = rayFrom({ x: 0, y: 0 }, { x: -1, y: 0 });
// degenerate ray (direction=0)
const degA = rayFrom({ x: 1, y: 0 }, { x: 0, y: 0 });
const degB = rayFrom({ x: 1, y: 0 }, { x: 0, y: 0 });
const degC = rayFrom({ x: 5, y: 5 }, { x: 0, y: 0 });

// ─────────────────────────────────────────────
// singleIntersectionInto
// ─────────────────────────────────────────────
describe('singleIntersectionInto', () => {
  test('forward-forward 교점 기록 + true', () => {
    // a: (0,1)→+x, b: (1,0)→+y → 교점 (1,1)
    const a = rayFrom({ x: 0, y: 1 }, { x: 1, y: 0 });
    const b = rayFrom({ x: 1, y: 0 }, { x: 0, y: 1 });
    const out: XYObjectWritable = { x: 0, y: 0 };
    expect(singleIntersectionInto(out, a, b)).toBe(true);
    expect(out.x).toBeCloseTo(1);
    expect(out.y).toBeCloseTo(1);
  });

  test('backward (t<0) → false', () => {
    // a: (2,0)→+x, b: (0,1)→+y — a 기준 t<0
    const a = rayFrom({ x: 2, y: 0 }, { x: 1, y: 0 });
    const b = rayFrom({ x: 0, y: 1 }, { x: 0, y: 1 });
    const out: XYObjectWritable = { x: 99, y: 99 };
    expect(singleIntersectionInto(out, a, b)).toBe(false);
    expect(out.x).toBe(99);
    expect(out.y).toBe(99);
  });

  test('parallel disjoint → false', () => {
    const out: XYObjectWritable = { x: 99, y: 99 };
    expect(singleIntersectionInto(out, rayRight, rayRight2)).toBe(false);
    expect(out.x).toBe(99);
  });

  test('collinear overlap → false (단일 교점 없음)', () => {
    const a = rayFrom({ x: 0, y: 0 }, { x: 1, y: 0 });
    const b = rayFrom({ x: 3, y: 0 }, { x: 1, y: 0 });
    const out: XYObjectWritable = { x: 99, y: 99 };
    expect(singleIntersectionInto(out, a, b)).toBe(false);
    expect(out.x).toBe(99);
  });

  test('degenerate a, b 위 → true, a.origin 기록', () => {
    // degA origin=(1,0), rayRight origin=(0,0) dir=(1,0)
    const out: XYObjectWritable = { x: 0, y: 0 };
    expect(singleIntersectionInto(out, degA, rayRight)).toBe(true);
    expect(out.x).toBeCloseTo(1);
    expect(out.y).toBeCloseTo(0);
  });

  test('endpoint touch → true, endpoint 좌표 기록', () => {
    // a: (0,1)→+x, b: (0,0)→+y — cross≠0, t=0, u=1 → (0,1)
    const a = rayFrom({ x: 0, y: 1 }, { x: 1, y: 0 });
    const b = rayFrom({ x: 0, y: 0 }, { x: 0, y: 1 });
    const out: XYObjectWritable = { x: 0, y: 0 };
    expect(singleIntersectionInto(out, a, b)).toBe(true);
    expect(out.x).toBeCloseTo(0);
    expect(out.y).toBeCloseTo(1);
  });

  test('양쪽 degenerate — origin 일치 → true, origin 기록', () => {
    const out: XYObjectWritable = { x: 0, y: 0 };
    expect(singleIntersectionInto(out, degA, degB)).toBe(true);
    expect(out.x).toBeCloseTo(1);
    expect(out.y).toBeCloseTo(0);
  });

  test('반환 타입이 boolean', () => {
    const out: XYObjectWritable = { x: 0, y: 0 };
    expectTypeOf(singleIntersectionInto(out, rayRight, rayUp)).toBeBoolean();
  });
});

// ─────────────────────────────────────────────
// singleIntersection (companion)
// ─────────────────────────────────────────────
describe('singleIntersection (companion)', () => {
  test('교점 있으면 { x, y } 반환', () => {
    const a = rayFrom({ x: 0, y: 1 }, { x: 1, y: 0 });
    const b = rayFrom({ x: 1, y: 0 }, { x: 0, y: 1 });
    const pt = singleIntersection(a, b);
    expect(pt).toBeDefined();
    expect(pt?.x).toBeCloseTo(1);
    expect(pt?.y).toBeCloseTo(1);
  });

  test('교점 없으면 undefined 반환', () => {
    // backward
    const a = rayFrom({ x: 2, y: 0 }, { x: 1, y: 0 });
    const b = rayFrom({ x: 0, y: 1 }, { x: 0, y: 1 });
    expect(singleIntersection(a, b)).toBeUndefined();
  });

  test('collinear → undefined', () => {
    const a = rayFrom({ x: 0, y: 0 }, { x: 1, y: 0 });
    const b = rayFrom({ x: 3, y: 0 }, { x: 1, y: 0 });
    expect(singleIntersection(a, b)).toBeUndefined();
  });

  test('반환 타입이 XYObjectWritable | undefined', () => {
    expectTypeOf(singleIntersection(rayRight, rayUp)).toEqualTypeOf<XYObjectWritable | undefined>();
  });

  test('epsilon 인자 전달 시 동작', () => {
    // 매우 큰 epsilon으로 parallel 처리 → undefined
    const a = rayFrom({ x: 0, y: 1 }, { x: 1, y: 0 });
    const b = rayFrom({ x: 1, y: 0 }, { x: 0, y: 1 });
    expect(singleIntersection(a, b, 1e10)).toBeUndefined();
  });
});
