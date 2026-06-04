import { describe, expect, test } from 'vitest';
import { closestPoint } from '../../../src/ellipse/closest-point';
import { closestPointInto } from '../../../src/ellipse/closest-point-into';
import { distanceToPoint } from '../../../src/ellipse/distance-to-point';

// ─── closestPointInto ────────────────────────────────────────────────────────

describe('ellipse point distance - closestPointInto', () => {
  test('right boundary 바깥 점의 closest point는 right boundary이다', () => {
    // center(0,0), rx=3, ry=2, point=(5, 0) → closest = (3, 0)
    const out = { x: 0, y: 0 };
    const result = closestPointInto(out, { center: { x: 0, y: 0 }, radiusX: 3, radiusY: 2 }, { x: 5, y: 0 });
    expect(result).toBe(out);
    expect(out.x).toBeCloseTo(3, 8);
    expect(out.y).toBeCloseTo(0, 8);
  });

  test('left boundary 바깥 점의 closest point는 left boundary이다', () => {
    // point=(-7, 0) → closest = (-3, 0)
    const out = { x: 0, y: 0 };
    closestPointInto(out, { center: { x: 0, y: 0 }, radiusX: 3, radiusY: 2 }, { x: -7, y: 0 });
    expect(out.x).toBeCloseTo(-3, 8);
    expect(out.y).toBeCloseTo(0, 8);
  });

  test('top boundary 바깥 점의 closest point는 top boundary이다', () => {
    // point=(0, 6) → closest = (0, 2)
    const out = { x: 0, y: 0 };
    closestPointInto(out, { center: { x: 0, y: 0 }, radiusX: 3, radiusY: 2 }, { x: 0, y: 6 });
    expect(out.x).toBeCloseTo(0, 8);
    expect(out.y).toBeCloseTo(2, 8);
  });

  test('bottom boundary 바깥 점의 closest point는 bottom boundary이다', () => {
    // point=(0, -8) → closest = (0, -2)
    const out = { x: 0, y: 0 };
    closestPointInto(out, { center: { x: 0, y: 0 }, radiusX: 3, radiusY: 2 }, { x: 0, y: -8 });
    expect(out.x).toBeCloseTo(0, 8);
    expect(out.y).toBeCloseTo(-2, 8);
  });

  test('내부 점의 closest point는 boundary 위에 있다', () => {
    // 내부 점 (1, 0): boundary로 향하는 closest point가 ellipse 방정식을 만족해야 한다
    const out = { x: 0, y: 0 };
    const e = { center: { x: 0, y: 0 }, radiusX: 3, radiusY: 2 };
    closestPointInto(out, e, { x: 1, y: 0 });
    // 결과가 ellipse boundary 위에 있는지 확인: (x/rx)² + (y/ry)² ≈ 1
    const norm = (out.x / 3) ** 2 + (out.y / 2) ** 2;
    expect(norm).toBeCloseTo(1, 8);
  });

  test('center 점의 closest point는 right boundary이다 (tie-break θ₀=0)', () => {
    const out = { x: 0, y: 0 };
    closestPointInto(out, { center: { x: 0, y: 0 }, radiusX: 3, radiusY: 2 }, { x: 0, y: 0 });
    // tie-break: theta=0 → (cx+rx, cy)
    expect(out.x).toBeCloseTo(3, 8);
    expect(out.y).toBeCloseTo(0, 8);
  });

  test('quadrant exterior point의 closest point는 ellipse boundary 방정식을 만족한다', () => {
    // point=(4, 3), ellipse rx=3, ry=2
    const out = { x: 0, y: 0 };
    const e = { center: { x: 0, y: 0 }, radiusX: 3, radiusY: 2 };
    closestPointInto(out, e, { x: 4, y: 3 });
    const norm = (out.x / 3) ** 2 + (out.y / 2) ** 2;
    expect(norm).toBeCloseTo(1, 6);
  });

  test('offset center ellipse에서 동작한다', () => {
    // center=(5, 3), rx=4, ry=2, point=(12, 3) → closest = (9, 3)
    const out = { x: 0, y: 0 };
    closestPointInto(out, { center: { x: 5, y: 3 }, radiusX: 4, radiusY: 2 }, { x: 12, y: 3 });
    expect(out.x).toBeCloseTo(9, 8);
    expect(out.y).toBeCloseTo(3, 8);
  });

  test('empty ellipse는 center를 기록한다', () => {
    const out = { x: 9, y: 9 };
    closestPointInto(out, { center: { x: 3, y: 4 }, radiusX: 0, radiusY: 2 }, { x: 10, y: 10 });
    expect(out.x).toBe(3);
    expect(out.y).toBe(4);
  });

  test('empty ellipse (radiusY <= 0)는 center를 기록한다', () => {
    const out = { x: 9, y: 9 };
    closestPointInto(out, { center: { x: 3, y: 4 }, radiusX: 3, radiusY: -1 }, { x: 10, y: 10 });
    expect(out.x).toBe(3);
    expect(out.y).toBe(4);
  });

  test('mutable tuple output에 기록한다', () => {
    const out: [number, number] = [0, 0];
    const result = closestPointInto(out, { center: { x: 0, y: 0 }, radiusX: 3, radiusY: 2 }, { x: 5, y: 0 });
    expect(result).toBe(out);
    expect(out[0]).toBeCloseTo(3, 8);
    expect(out[1]).toBeCloseTo(0, 8);
  });

  test('tuple EllipseLike input을 처리한다', () => {
    const out = { x: 0, y: 0 };
    closestPointInto(out, [[0, 0], 3, 2] as const, { x: 5, y: 0 });
    expect(out.x).toBeCloseTo(3, 8);
    expect(out.y).toBeCloseTo(0, 8);
  });

  test('tuple XYInput point를 처리한다', () => {
    const out = { x: 0, y: 0 };
    closestPointInto(out, { center: { x: 0, y: 0 }, radiusX: 3, radiusY: 2 }, [5, 0]);
    expect(out.x).toBeCloseTo(3, 8);
    expect(out.y).toBeCloseTo(0, 8);
  });

  test('out === point aliasing에서도 안전하게 동작한다', () => {
    // out과 point가 같은 object를 참조해도 결과가 올바르다
    const shared = { x: 5, y: 0 };
    closestPointInto(shared, { center: { x: 0, y: 0 }, radiusX: 3, radiusY: 2 }, shared);
    expect(shared.x).toBeCloseTo(3, 8);
    expect(shared.y).toBeCloseTo(0, 8);
  });
});

// ─── closestPoint ────────────────────────────────────────────────────────────

describe('ellipse point distance - closestPoint', () => {
  test('right boundary 바깥 점의 closest point plain object를 반환한다', () => {
    const result = closestPoint({ center: { x: 0, y: 0 }, radiusX: 3, radiusY: 2 }, { x: 5, y: 0 });
    expect(result.x).toBeCloseTo(3, 8);
    expect(result.y).toBeCloseTo(0, 8);
  });

  test('empty ellipse는 center plain object를 반환한다', () => {
    const result = closestPoint({ center: { x: 3, y: 4 }, radiusX: 0, radiusY: 2 }, { x: 10, y: 10 });
    expect(result.x).toBe(3);
    expect(result.y).toBe(4);
  });

  test('closestPointInto와 동일한 좌표를 반환한다', () => {
    const e = { center: { x: 2, y: -1 }, radiusX: 4, radiusY: 3 };
    const p = { x: 7, y: 5 };
    const out = { x: 0, y: 0 };
    closestPointInto(out, e, p);
    const result = closestPoint(e, p);
    expect(result.x).toBeCloseTo(out.x, 10);
    expect(result.y).toBeCloseTo(out.y, 10);
  });

  test('tuple EllipseLike input과 tuple XYInput를 처리한다', () => {
    const result = closestPoint([[0, 0], 3, 2] as const, [5, 0]);
    expect(result.x).toBeCloseTo(3, 8);
    expect(result.y).toBeCloseTo(0, 8);
  });
});

// ─── distanceToPoint ─────────────────────────────────────────────────────────

describe('ellipse point distance - distanceToPoint', () => {
  test('right boundary 바깥 점의 거리는 point와 boundary 사이 거리이다', () => {
    // point=(5,0), closest=(3,0), distance=2
    const d = distanceToPoint({ center: { x: 0, y: 0 }, radiusX: 3, radiusY: 2 }, { x: 5, y: 0 });
    expect(d).toBeCloseTo(2, 8);
  });

  test('top boundary 바깥 점의 거리는 point와 boundary 사이 거리이다', () => {
    // point=(0,5), closest=(0,2), distance=3
    const d = distanceToPoint({ center: { x: 0, y: 0 }, radiusX: 3, radiusY: 2 }, { x: 0, y: 5 });
    expect(d).toBeCloseTo(3, 8);
  });

  test('boundary 위 점의 거리는 0이다', () => {
    // right endpoint (3, 0) on boundary
    const d = distanceToPoint({ center: { x: 0, y: 0 }, radiusX: 3, radiusY: 2 }, { x: 3, y: 0 });
    expect(d).toBeCloseTo(0, 8);
  });

  test('내부 점의 거리는 0이다', () => {
    const d = distanceToPoint({ center: { x: 0, y: 0 }, radiusX: 3, radiusY: 2 }, { x: 1, y: 1 });
    expect(d).toBe(0);
  });

  test('center 점의 거리는 0이다', () => {
    const d = distanceToPoint({ center: { x: 0, y: 0 }, radiusX: 3, radiusY: 2 }, { x: 0, y: 0 });
    expect(d).toBe(0);
  });

  test('empty ellipse는 center까지 Euclidean 거리를 반환한다', () => {
    // center=(3,4), point=(6,8): distance = sqrt(9+16) = 5
    const d = distanceToPoint({ center: { x: 3, y: 4 }, radiusX: 0, radiusY: 2 }, { x: 6, y: 8 });
    expect(d).toBeCloseTo(5, 8);
  });

  test('empty ellipse (radiusY <= 0) center까지 거리를 반환한다', () => {
    const d = distanceToPoint({ center: { x: 0, y: 0 }, radiusX: 3, radiusY: -1 }, { x: 3, y: 4 });
    expect(d).toBeCloseTo(5, 8);
  });

  test('offset center ellipse에서 바깥 점의 거리를 계산한다', () => {
    // center=(5,3), rx=4, ry=2, point=(12,3) → closest=(9,3), distance=3
    const d = distanceToPoint({ center: { x: 5, y: 3 }, radiusX: 4, radiusY: 2 }, { x: 12, y: 3 });
    expect(d).toBeCloseTo(3, 8);
  });

  test('tuple EllipseLike input과 tuple XYInput를 처리한다', () => {
    const d = distanceToPoint([[0, 0], 3, 2] as const, [5, 0]);
    expect(d).toBeCloseTo(2, 8);
  });
});
