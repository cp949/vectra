import { describe, expect, expectTypeOf, test } from 'vitest';
import { boundsInto } from '../../../src/circle/bounds-into';
import { closestPointInto } from '../../../src/circle/closest-point-into';
import { pointAtAngleInto } from '../../../src/circle/point-at-angle-into';
import { pointAtTurnInto } from '../../../src/circle/point-at-turn-into';
import { scaleInto } from '../../../src/circle/scale-into';
import { translateInto } from '../../../src/circle/translate-into';
import type { BoundsWritable, CircleWritable, XYTupleWritable, XYWritable } from '../../../src/types';

function makeCircle(cx = 0, cy = 0, r = 5): CircleWritable {
  return { center: { x: cx, y: cy }, radius: r };
}

function makeBounds(): BoundsWritable {
  return { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
}

// ─── closestPointInto ────────────────────────────────────────────────────────

describe('closestPointInto - 외부 점', () => {
  test('circle 외부 점에서 가장 가까운 표면 위 점을 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const circle = makeCircle(0, 0, 5);
    // point (10, 0): direction (1, 0), closest = (5, 0)
    const result = closestPointInto(out, circle, { x: 10, y: 0 });
    expect(result).toBe(out);
    expect((out as { x: number; y: number }).x).toBeCloseTo(5, 10);
    expect((out as { x: number; y: number }).y).toBeCloseTo(0, 10);
  });

  test('tuple shorthand CircleLike에서 closest point를 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const circle = [[0, 0], 5] as const;
    const result = closestPointInto(out, circle, { x: 10, y: 0 });
    expect(result).toBe(out);
    expect((out as { x: number; y: number }).x).toBeCloseTo(5, 10);
    expect((out as { x: number; y: number }).y).toBeCloseTo(0, 10);
  });

  test('대각선 방향 외부 점에서 closest point를 계산한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const circle = makeCircle(0, 0, 5);
    // point (3, 4): distance = 5 = radius → 표면 위 점 = (3, 4)
    closestPointInto(out, circle, { x: 3, y: 4 });
    expect((out as { x: number; y: number }).x).toBeCloseTo(3, 10);
    expect((out as { x: number; y: number }).y).toBeCloseTo(4, 10);
  });

  test('offset center를 가진 circle에서 closest point를 계산한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const circle = makeCircle(2, 3, 5);
    // point (2, 13): direction from center (0, 1), closest = (2, 8)
    closestPointInto(out, circle, { x: 2, y: 13 });
    expect((out as { x: number; y: number }).x).toBeCloseTo(2, 10);
    expect((out as { x: number; y: number }).y).toBeCloseTo(8, 10);
  });
});

describe('closestPointInto - 내부 점', () => {
  test('circle 내부 점에서도 표면 위 가장 가까운 점을 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const circle = makeCircle(0, 0, 5);
    // point (1, 0): direction (1, 0), closest = (5, 0)
    closestPointInto(out, circle, { x: 1, y: 0 });
    expect((out as { x: number; y: number }).x).toBeCloseTo(5, 10);
    expect((out as { x: number; y: number }).y).toBeCloseTo(0, 10);
  });
});

describe('closestPointInto - center 일치', () => {
  test('point가 center와 같으면 (cx+r, cy) 를 기록한다 (angle 0 fallback)', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const circle = makeCircle(2, 3, 5);
    closestPointInto(out, circle, { x: 2, y: 3 });
    expect((out as { x: number; y: number }).x).toBeCloseTo(7, 10); // cx + r = 2 + 5
    expect((out as { x: number; y: number }).y).toBeCloseTo(3, 10);
  });
});

describe('closestPointInto - empty circle', () => {
  test('radius = 0이면 center 좌표를 기록한다', () => {
    const out: XYWritable = { x: 99, y: 99 };
    const circle = makeCircle(2, 3, 0);
    closestPointInto(out, circle, { x: 10, y: 10 });
    expect((out as { x: number; y: number }).x).toBe(2);
    expect((out as { x: number; y: number }).y).toBe(3);
  });

  test('radius < 0이면 center 좌표를 기록한다', () => {
    const out: XYWritable = { x: 99, y: 99 };
    const circle = makeCircle(2, 3, -1);
    closestPointInto(out, circle, { x: 10, y: 10 });
    expect((out as { x: number; y: number }).x).toBe(2);
    expect((out as { x: number; y: number }).y).toBe(3);
  });
});

describe('closestPointInto - aliasing', () => {
  test('out === circle.center aliasing에서도 정의대로 동작한다', () => {
    const center: XYWritable = { x: 0, y: 0 };
    const circle: CircleWritable = { center, radius: 5 };
    // out과 circle.center가 같은 reference
    const result = closestPointInto(center, circle, { x: 10, y: 0 });
    expect(result).toBe(center);
    expect((center as { x: number; y: number }).x).toBeCloseTo(5, 10);
    expect((center as { x: number; y: number }).y).toBeCloseTo(0, 10);
  });
});

// ─── closestPointInto - generic return type-level ────────────────────────────

describe('closestPointInto - generic return type', () => {
  test('mutable tuple out에 기록하고 tuple reference를 반환한다', () => {
    const out: [number, number] = [0, 0];
    const circle = makeCircle(0, 0, 5);
    const result = closestPointInto(out, circle, { x: 10, y: 0 });
    expect(result).toBe(out);
    expect(out[0]).toBeCloseTo(5, 10);
    expect(out[1]).toBeCloseTo(0, 10);
    expectTypeOf(result).toEqualTypeOf<[number, number]>();
  });

  test('외부 Point class instance에 기록하고 method chaining 타입을 보존한다', () => {
    class Point {
      constructor(
        public x: number,
        public y: number
      ) {}
      translateX(dx: number): this {
        this.x += dx;
        return this;
      }
    }
    const p = new Point(0, 0);
    const circle = makeCircle(0, 0, 5);
    const result = closestPointInto(p, circle, { x: 10, y: 0 });
    expect(result).toBe(p);
    expectTypeOf(result).toEqualTypeOf<Point>();
    // method chaining 타입 체크
    const chained = result.translateX(1);
    expectTypeOf(chained).toEqualTypeOf<Point>();
  });
});

// ─── pointAtAngleInto ─────────────────────────────────────────────────────────

describe('pointAtAngleInto', () => {
  test('angle 0에서 (cx+r, cy)를 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const circle = makeCircle(0, 0, 5);
    const result = pointAtAngleInto(out, circle, 0);
    expect(result).toBe(out);
    expect((out as { x: number; y: number }).x).toBeCloseTo(5, 10);
    expect((out as { x: number; y: number }).y).toBeCloseTo(0, 10);
  });

  test('angle π/2에서 (cx, cy+r)를 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const circle = makeCircle(0, 0, 5);
    pointAtAngleInto(out, circle, Math.PI / 2);
    expect((out as { x: number; y: number }).x).toBeCloseTo(0, 10);
    expect((out as { x: number; y: number }).y).toBeCloseTo(5, 10);
  });

  test('angle π에서 (cx-r, cy)를 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const circle = makeCircle(0, 0, 5);
    pointAtAngleInto(out, circle, Math.PI);
    expect((out as { x: number; y: number }).x).toBeCloseTo(-5, 10);
    expect((out as { x: number; y: number }).y).toBeCloseTo(0, 10);
  });

  test('angle 3π/2에서 (cx, cy-r)를 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const circle = makeCircle(0, 0, 5);
    pointAtAngleInto(out, circle, (3 * Math.PI) / 2);
    expect((out as { x: number; y: number }).x).toBeCloseTo(0, 10);
    expect((out as { x: number; y: number }).y).toBeCloseTo(-5, 10);
  });

  test('음수 angle에서 wrap없이 계산한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const circle = makeCircle(0, 0, 5);
    // -π/2 = 3π/2와 같은 위치
    pointAtAngleInto(out, circle, -Math.PI / 2);
    expect((out as { x: number; y: number }).x).toBeCloseTo(0, 10);
    expect((out as { x: number; y: number }).y).toBeCloseTo(-5, 10);
  });

  test('큰 angle(2π 초과)에서 wrap없이 계산한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const circle = makeCircle(0, 0, 5);
    // 2π = angle 0과 같은 위치
    pointAtAngleInto(out, circle, 2 * Math.PI);
    expect((out as { x: number; y: number }).x).toBeCloseTo(5, 10);
    expect((out as { x: number; y: number }).y).toBeCloseTo(0, 10);
  });

  test('empty circle에서 center 좌표를 기록한다', () => {
    const out: XYWritable = { x: 99, y: 99 };
    const circle = makeCircle(2, 3, 0);
    pointAtAngleInto(out, circle, Math.PI / 4);
    expect((out as { x: number; y: number }).x).toBe(2);
    expect((out as { x: number; y: number }).y).toBe(3);
  });

  test('mutable tuple out에 기록하고 tuple reference를 반환한다', () => {
    const out: [number, number] = [0, 0];
    const circle = makeCircle(0, 0, 5);
    const result = pointAtAngleInto(out, circle, 0);
    expect(result).toBe(out);
    expectTypeOf(result).toEqualTypeOf<[number, number]>();
  });
});

// ─── pointAtTurnInto ──────────────────────────────────────────────────────────────

describe('pointAtTurnInto', () => {
  test('t=0에서 angle 0 위치 (cx+r, cy)를 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const circle = makeCircle(0, 0, 5);
    const result = pointAtTurnInto(out, circle, 0);
    expect(result).toBe(out);
    expect((out as { x: number; y: number }).x).toBeCloseTo(5, 10);
    expect((out as { x: number; y: number }).y).toBeCloseTo(0, 10);
  });

  test('t=0.25에서 angle π/2 위치 (cx, cy+r)를 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const circle = makeCircle(0, 0, 5);
    pointAtTurnInto(out, circle, 0.25);
    expect((out as { x: number; y: number }).x).toBeCloseTo(0, 10);
    expect((out as { x: number; y: number }).y).toBeCloseTo(5, 10);
  });

  test('t=0.5에서 angle π 위치 (cx-r, cy)를 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const circle = makeCircle(0, 0, 5);
    pointAtTurnInto(out, circle, 0.5);
    expect((out as { x: number; y: number }).x).toBeCloseTo(-5, 10);
    expect((out as { x: number; y: number }).y).toBeCloseTo(0, 10);
  });

  test('t=0.75에서 angle 3π/2 위치 (cx, cy-r)를 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const circle = makeCircle(0, 0, 5);
    pointAtTurnInto(out, circle, 0.75);
    expect((out as { x: number; y: number }).x).toBeCloseTo(0, 10);
    expect((out as { x: number; y: number }).y).toBeCloseTo(-5, 10);
  });

  test('t=1.0에서 angle 2π 위치 (cx+r, cy)를 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const circle = makeCircle(0, 0, 5);
    pointAtTurnInto(out, circle, 1.0);
    expect((out as { x: number; y: number }).x).toBeCloseTo(5, 10);
    expect((out as { x: number; y: number }).y).toBeCloseTo(0, 10);
  });

  test('t < 0은 wrap하지 않고 그대로 계산한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const circle = makeCircle(0, 0, 5);
    // t = -0.25 → angle = -π/2 → (0, -5)
    pointAtTurnInto(out, circle, -0.25);
    expect((out as { x: number; y: number }).x).toBeCloseTo(0, 10);
    expect((out as { x: number; y: number }).y).toBeCloseTo(-5, 10);
  });

  test('t > 1은 wrap하지 않고 그대로 계산한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const circle = makeCircle(0, 0, 5);
    // t = 1.25 → angle = 2.5π = 2π + π/2 → (0, 5)
    pointAtTurnInto(out, circle, 1.25);
    expect((out as { x: number; y: number }).x).toBeCloseTo(0, 10);
    expect((out as { x: number; y: number }).y).toBeCloseTo(5, 10);
  });

  test('empty circle에서 center 좌표를 기록한다', () => {
    const out: XYWritable = { x: 99, y: 99 };
    const circle = makeCircle(2, 3, 0);
    pointAtTurnInto(out, circle, 0.5);
    expect((out as { x: number; y: number }).x).toBe(2);
    expect((out as { x: number; y: number }).y).toBe(3);
  });

  test('mutable tuple out에 기록하고 tuple reference를 반환한다', () => {
    const out: [number, number] = [0, 0];
    const circle = makeCircle(0, 0, 5);
    const result = pointAtTurnInto(out, circle, 0);
    expect(result).toBe(out);
    expectTypeOf(result).toEqualTypeOf<[number, number]>();
  });
});

// ─── boundsInto ───────────────────────────────────────────────────────────────

describe('boundsInto', () => {
  test('정상 circle의 bounding box를 기록한다', () => {
    const out = makeBounds();
    const circle = makeCircle(2, 3, 5);
    const result = boundsInto(out, circle);
    expect(result).toBe(out);
    expect((out.min as { x: number; y: number }).x).toBeCloseTo(-3, 10); // cx - r
    expect((out.min as { x: number; y: number }).y).toBeCloseTo(-2, 10); // cy - r
    expect((out.max as { x: number; y: number }).x).toBeCloseTo(7, 10); // cx + r
    expect((out.max as { x: number; y: number }).y).toBeCloseTo(8, 10); // cy + r
  });

  test('origin centered circle의 bounds를 기록한다', () => {
    const out = makeBounds();
    const circle = makeCircle(0, 0, 5);
    boundsInto(out, circle);
    expect((out.min as { x: number; y: number }).x).toBeCloseTo(-5, 10);
    expect((out.min as { x: number; y: number }).y).toBeCloseTo(-5, 10);
    expect((out.max as { x: number; y: number }).x).toBeCloseTo(5, 10);
    expect((out.max as { x: number; y: number }).y).toBeCloseTo(5, 10);
  });

  test('empty circle (radius=0)에서 sentinel empty bounds를 기록한다', () => {
    const out = makeBounds();
    const circle = makeCircle(0, 0, 0);
    boundsInto(out, circle);
    expect((out.min as { x: number; y: number }).x).toBe(Infinity);
    expect((out.min as { x: number; y: number }).y).toBe(Infinity);
    expect((out.max as { x: number; y: number }).x).toBe(-Infinity);
    expect((out.max as { x: number; y: number }).y).toBe(-Infinity);
  });

  test('empty circle (radius<0)에서 sentinel empty bounds를 기록한다', () => {
    const out = makeBounds();
    const circle = makeCircle(2, 3, -1);
    boundsInto(out, circle);
    expect((out.min as { x: number; y: number }).x).toBe(Infinity);
    expect((out.min as { x: number; y: number }).y).toBe(Infinity);
    expect((out.max as { x: number; y: number }).x).toBe(-Infinity);
    expect((out.max as { x: number; y: number }).y).toBe(-Infinity);
  });

  test('mutable tuple min/max storage에 기록한다', () => {
    const min: [number, number] = [0, 0];
    const max: [number, number] = [0, 0];
    const out: BoundsWritable<XYTupleWritable, XYTupleWritable> = { min, max };
    const circle = makeCircle(0, 0, 5);
    const result = boundsInto(out, circle);
    expect(result).toBe(out);
    expect(min).toEqual([-5, -5]);
    expect(max).toEqual([5, 5]);
  });

  test('out.min === circle.center aliasing에서도 정의대로 동작한다', () => {
    const center: { x: number; y: number } = { x: 2, y: 3 };
    const circle: CircleWritable = { center, radius: 5 };
    const out: BoundsWritable = { min: center, max: { x: 0, y: 0 } };
    boundsInto(out, circle);
    // center(=out.min)에 덮어쓰기가 발생해도 cx/cy는 미리 읽혔으므로 결과가 정확해야 한다
    expect((out.min as { x: number; y: number }).x).toBeCloseTo(-3, 10); // cx - r
    expect((out.min as { x: number; y: number }).y).toBeCloseTo(-2, 10);
    expect((out.max as { x: number; y: number }).x).toBeCloseTo(7, 10);
    expect((out.max as { x: number; y: number }).y).toBeCloseTo(8, 10);
  });
});

describe('boundsInto - generic return type', () => {
  test('BoundsWritable subtype의 return type을 보존한다', () => {
    interface TaggedBounds {
      min: { x: number; y: number };
      max: { x: number; y: number };
      tag: string;
    }
    const out: TaggedBounds = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 }, tag: 'test' };
    const circle = makeCircle(0, 0, 5);
    const result = boundsInto(out, circle);
    expectTypeOf(result).toEqualTypeOf<TaggedBounds>();
  });
});

// ─── translateInto ────────────────────────────────────────────────────────────

describe('translateInto', () => {
  test('object offset으로 center를 이동하고 radius는 유지한다', () => {
    const out = makeCircle(0, 0, 5);
    const circle = makeCircle(2, 3, 5);
    const result = translateInto(out, circle, { x: 10, y: -5 });
    expect(result).toBe(out);
    expect((out.center as { x: number; y: number }).x).toBeCloseTo(12, 10);
    expect((out.center as { x: number; y: number }).y).toBeCloseTo(-2, 10);
    expect(out.radius).toBe(5);
  });

  test('tuple offset으로 center를 이동한다', () => {
    const out = makeCircle();
    const circle = makeCircle(2, 3, 5);
    translateInto(out, circle, [1, -1] as const);
    expect((out.center as { x: number; y: number }).x).toBeCloseTo(3, 10);
    expect((out.center as { x: number; y: number }).y).toBeCloseTo(2, 10);
    expect(out.radius).toBe(5);
  });

  test('zero offset은 circle을 복사한다', () => {
    const out = makeCircle();
    const circle = makeCircle(2, 3, 5);
    translateInto(out, circle, { x: 0, y: 0 });
    expect((out.center as { x: number; y: number }).x).toBe(2);
    expect((out.center as { x: number; y: number }).y).toBe(3);
    expect(out.radius).toBe(5);
  });

  test('out === circle aliasing에서도 정의대로 동작한다', () => {
    const circle = makeCircle(2, 3, 5);
    const result = translateInto(circle, circle, { x: 10, y: -5 });
    expect(result).toBe(circle);
    expect((circle.center as { x: number; y: number }).x).toBeCloseTo(12, 10);
    expect((circle.center as { x: number; y: number }).y).toBeCloseTo(-2, 10);
    expect(circle.radius).toBe(5);
  });

  test('out.center === circle.center aliasing에서도 정의대로 동작한다', () => {
    const center: { x: number; y: number } = { x: 2, y: 3 };
    const circle: CircleWritable = { center, radius: 5 };
    const out: CircleWritable = { center, radius: 0 }; // center 공유
    translateInto(out, circle, { x: 10, y: -5 });
    expect(center.x).toBeCloseTo(12, 10);
    expect(center.y).toBeCloseTo(-2, 10);
    expect(out.radius).toBe(5);
  });

  test('offset === circle.center aliasing에서도 정의대로 동작한다', () => {
    const center: { x: number; y: number } = { x: 2, y: 3 };
    const circle: CircleWritable = { center, radius: 5 };
    const out = makeCircle(0, 0, 0);
    // offset이 circle.center와 같은 reference — out 기록 전에 offset이 먼저 읽혀야 한다
    translateInto(out, circle, center);
    expect((out.center as { x: number; y: number }).x).toBeCloseTo(4, 10); // 2 + 2
    expect((out.center as { x: number; y: number }).y).toBeCloseTo(6, 10); // 3 + 3
    expect(out.radius).toBe(5);
  });

  test('offset === out.center aliasing에서도 정의대로 동작한다', () => {
    const outCenter: { x: number; y: number } = { x: 1, y: 2 };
    const circle = makeCircle(2, 3, 5);
    const out: CircleWritable = { center: outCenter, radius: 0 };
    // offset은 out.center와 같은 reference (초기값 {x:1, y:2})
    translateInto(out, circle, outCenter);
    expect(outCenter.x).toBeCloseTo(3, 10); // 2 + 1
    expect(outCenter.y).toBeCloseTo(5, 10); // 3 + 2
    expect(out.radius).toBe(5);
  });
});

describe('translateInto - generic return type', () => {
  test('CircleWritable subtype의 return type을 보존한다', () => {
    interface TaggedCircle {
      center: { x: number; y: number };
      radius: number;
      tag: string;
    }
    const out: TaggedCircle = { center: { x: 0, y: 0 }, radius: 0, tag: 'test' };
    const circle = makeCircle(2, 3, 5);
    const result = translateInto(out, circle, { x: 1, y: 1 });
    expectTypeOf(result).toEqualTypeOf<TaggedCircle>();
  });
});

// ─── scaleInto ────────────────────────────────────────────────────────────────

describe('scaleInto', () => {
  test('양수 scalar로 center와 radius를 모두 곱한다', () => {
    const out = makeCircle();
    const circle = makeCircle(2, 3, 5);
    const result = scaleInto(out, circle, 2);
    expect(result).toBe(out);
    expect((out.center as { x: number; y: number }).x).toBeCloseTo(4, 10);
    expect((out.center as { x: number; y: number }).y).toBeCloseTo(6, 10);
    expect(out.radius).toBeCloseTo(10, 10);
  });

  test('scalar=0이면 center (0,0), radius 0이 된다', () => {
    const out = makeCircle();
    const circle = makeCircle(2, 3, 5);
    scaleInto(out, circle, 0);
    expect((out.center as { x: number; y: number }).x).toBe(0);
    expect((out.center as { x: number; y: number }).y).toBe(0);
    expect(out.radius).toBe(0);
  });

  test('음수 scalar는 radius 부호를 그대로 반영한다 (Math.abs 없음)', () => {
    const out = makeCircle();
    const circle = makeCircle(2, 3, 5);
    scaleInto(out, circle, -1);
    expect((out.center as { x: number; y: number }).x).toBeCloseTo(-2, 10);
    expect((out.center as { x: number; y: number }).y).toBeCloseTo(-3, 10);
    expect(out.radius).toBeCloseTo(-5, 10);
  });

  test('out === circle aliasing에서도 정의대로 동작한다', () => {
    const circle = makeCircle(2, 3, 5);
    const result = scaleInto(circle, circle, 3);
    expect(result).toBe(circle);
    expect((circle.center as { x: number; y: number }).x).toBeCloseTo(6, 10);
    expect((circle.center as { x: number; y: number }).y).toBeCloseTo(9, 10);
    expect(circle.radius).toBeCloseTo(15, 10);
  });

  test('mutable tuple center storage에 기록한다', () => {
    const center: [number, number] = [2, 3];
    const out: CircleWritable<XYTupleWritable> = { center, radius: 0 };
    const circle = makeCircle(2, 3, 5);
    scaleInto(out, circle, 2);
    expect(center).toEqual([4, 6]);
    expect(out.radius).toBe(10);
  });

  test('out.center === circle.center aliasing에서도 정의대로 동작한다', () => {
    const center: { x: number; y: number } = { x: 2, y: 3 };
    const circle: CircleWritable = { center, radius: 5 };
    const out: CircleWritable = { center, radius: 0 }; // center 공유
    scaleInto(out, circle, 3);
    expect(center.x).toBeCloseTo(6, 10);
    expect(center.y).toBeCloseTo(9, 10);
    expect(out.radius).toBeCloseTo(15, 10);
  });
});

describe('scaleInto - generic return type', () => {
  test('CircleWritable subtype의 return type을 보존한다', () => {
    interface TaggedCircle {
      center: { x: number; y: number };
      radius: number;
      tag: string;
    }
    const out: TaggedCircle = { center: { x: 0, y: 0 }, radius: 0, tag: 'test' };
    const circle = makeCircle(2, 3, 5);
    const result = scaleInto(out, circle, 2);
    expectTypeOf(result).toEqualTypeOf<TaggedCircle>();
  });
});
