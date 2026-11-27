/** 원의 최근접점, 각도별 점, 경계 상자 및 변환 결과를 검증한다. */

import { describe, expect, expectTypeOf, test } from 'vitest';
import { boundsInto } from '../../../src/circle/bounds-into';
import { closestPointInto } from '../../../src/circle/closest-point-into';
import { pointAtAngleInto } from '../../../src/circle/point-at-angle-into';
import { pointAtTurnInto } from '../../../src/circle/point-at-turn-into';
import { scaleInto } from '../../../src/circle/scale-into';
import { translateInto } from '../../../src/circle/translate-into';
import type { CircleWritable, XYTupleWritable, XYWritable } from '../../../src/types';

/** 최근접점과 경계 상자에 사용할 평평한 원을 만든다. */
function makeFlatCircle(cx: number, cy: number, r: number) {
  return { cx, cy, r };
}

/** 아직 전환 중인 각도와 변환 API를 검증할 원을 만든다. */
function makeCircle(cx = 0, cy = 0, r = 5): CircleWritable {
  return { center: { x: cx, y: cy }, radius: r };
}

/** 경계 상자 출력을 초기화한다. */
function makeBounds() {
  return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
}

// ─── closestPointInto ────────────────────────────────────────────────────────

describe('closestPointInto - 외부 점', () => {
  test('circle 외부 점에서 가장 가까운 표면 위 점을 기록한다', () => {
    const out = { x: 0, y: 0 };
    const circle = makeFlatCircle(0, 0, 5);
    // point (10, 0): direction (1, 0), closest = (5, 0)
    const result = closestPointInto(out, circle, { x: 10, y: 0 });
    expect(result).toBe(out);
    expect(out.x).toBeCloseTo(5, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  test('대각선 방향 외부 점에서 closest point를 계산한다', () => {
    const out = { x: 0, y: 0 };
    const circle = makeFlatCircle(0, 0, 5);
    // point (3, 4): distance = 5 = radius → 표면 위 점 = (3, 4)
    closestPointInto(out, circle, { x: 3, y: 4 });
    expect(out.x).toBeCloseTo(3, 10);
    expect(out.y).toBeCloseTo(4, 10);
  });

  test('offset center를 가진 circle에서 closest point를 계산한다', () => {
    const out = { x: 0, y: 0 };
    const circle = makeFlatCircle(2, 3, 5);
    // point (2, 13): direction from center (0, 1), closest = (2, 8)
    closestPointInto(out, circle, { x: 2, y: 13 });
    expect(out.x).toBeCloseTo(2, 10);
    expect(out.y).toBeCloseTo(8, 10);
  });
});

describe('closestPointInto - 내부 점', () => {
  test('circle 내부 점에서도 표면 위 가장 가까운 점을 기록한다', () => {
    const out = { x: 0, y: 0 };
    const circle = makeFlatCircle(0, 0, 5);
    // point (1, 0): direction (1, 0), closest = (5, 0)
    closestPointInto(out, circle, { x: 1, y: 0 });
    expect(out.x).toBeCloseTo(5, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });
});

describe('closestPointInto - center 일치', () => {
  test('point가 center와 같으면 (cx+r, cy) 를 기록한다 (angle 0 fallback)', () => {
    const out = { x: 0, y: 0 };
    const circle = makeFlatCircle(2, 3, 5);
    closestPointInto(out, circle, { x: 2, y: 3 });
    expect(out.x).toBeCloseTo(7, 10); // cx + r = 2 + 5
    expect(out.y).toBeCloseTo(3, 10);
  });
});

describe('closestPointInto - empty circle', () => {
  test('radius = 0이면 center 좌표를 기록한다', () => {
    const out = { x: 99, y: 99 };
    const circle = makeFlatCircle(2, 3, 0);
    closestPointInto(out, circle, { x: 10, y: 10 });
    expect(out.x).toBe(2);
    expect(out.y).toBe(3);
  });

  test('radius < 0이면 center 좌표를 기록한다', () => {
    const out = { x: 99, y: 99 };
    const circle = makeFlatCircle(2, 3, -1);
    closestPointInto(out, circle, { x: 10, y: 10 });
    expect(out.x).toBe(2);
    expect(out.y).toBe(3);
  });
});

describe('closestPointInto - aliasing', () => {
  test('출력과 입력 점이 같은 객체여도 올바른 점을 기록한다', () => {
    const point = { x: 10, y: 0 };
    const circle = { cx: 0, cy: 0, r: 5 };
    expect(closestPointInto(point, circle, point)).toBe(point);
    expect(point).toEqual({ x: 5, y: 0 });
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
    const circle = makeFlatCircle(2, 3, 5);
    const result = boundsInto(out, circle);
    expect(result).toBe(out);
    expect(out.minX).toBeCloseTo(-3, 10); // cx - r
    expect(out.minY).toBeCloseTo(-2, 10); // cy - r
    expect(out.maxX).toBeCloseTo(7, 10); // cx + r
    expect(out.maxY).toBeCloseTo(8, 10); // cy + r
  });

  test('origin centered circle의 bounds를 기록한다', () => {
    const out = makeBounds();
    const circle = makeFlatCircle(0, 0, 5);
    boundsInto(out, circle);
    expect(out.minX).toBeCloseTo(-5, 10);
    expect(out.minY).toBeCloseTo(-5, 10);
    expect(out.maxX).toBeCloseTo(5, 10);
    expect(out.maxY).toBeCloseTo(5, 10);
  });

  test('empty circle (radius=0)에서 sentinel empty bounds를 기록한다', () => {
    const out = makeBounds();
    const circle = makeFlatCircle(0, 0, 0);
    boundsInto(out, circle);
    expect(out.minX).toBe(Infinity);
    expect(out.minY).toBe(Infinity);
    expect(out.maxX).toBe(-Infinity);
    expect(out.maxY).toBe(-Infinity);
  });

  test('empty circle (radius<0)에서 sentinel empty bounds를 기록한다', () => {
    const out = makeBounds();
    const circle = makeFlatCircle(2, 3, -1);
    boundsInto(out, circle);
    expect(out.minX).toBe(Infinity);
    expect(out.minY).toBe(Infinity);
    expect(out.maxX).toBe(-Infinity);
    expect(out.maxY).toBe(-Infinity);
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
