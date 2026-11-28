import { describe, expect, test } from 'vitest';
import { intersectsCircleCircle } from '../../../src/intersects/intersects-circle-circle';
import { intersectsCircleRect } from '../../../src/intersects/intersects-circle-rect';
import { intersectsCircleSegment } from '../../../src/intersects/intersects-circle-segment';

const intersectsSegment = (
  circle: Parameters<typeof intersectsCircleSegment>[0],
  segment: Parameters<typeof intersectsCircleSegment>[1],
  epsilon?: number
) => intersectsCircleSegment(circle, segment, epsilon);

describe('circle boolean query - intersectsCircle', () => {
  test('두 circle이 분리되면 false를 반환한다', () => {
    // distance=6 > r1+r2=4
    const a = { cx: 0, cy: 0, r: 2 };
    const b = { cx: 6, cy: 0, r: 2 };
    expect(intersectsCircleCircle(a, b)).toBe(false);
  });

  test('외접 tangent (distance = r1 + r2)이면 true를 반환한다', () => {
    // distance=4 = r1+r2=4
    const a = { cx: 0, cy: 0, r: 2 };
    const b = { cx: 4, cy: 0, r: 2 };
    expect(intersectsCircleCircle(a, b)).toBe(true);
  });

  test('두 circle이 교차하면 true를 반환한다', () => {
    // distance=4 < r1+r2=6
    const a = { cx: 0, cy: 0, r: 3 };
    const b = { cx: 4, cy: 0, r: 3 };
    expect(intersectsCircleCircle(a, b)).toBe(true);
  });

  test('내접 tangent (distance = |r1 - r2|)이면 true를 반환한다', () => {
    // distance=3 = r1 - r2 (b가 a 내부에서 a 경계에 접함)
    const a = { cx: 0, cy: 0, r: 5 };
    const b = { cx: 3, cy: 0, r: 2 };
    expect(intersectsCircleCircle(a, b)).toBe(true);
  });

  test('한 circle이 다른 circle을 완전히 포함하면 true를 반환한다', () => {
    // distance=1 < r1+r2=12
    const a = { cx: 0, cy: 0, r: 10 };
    const b = { cx: 1, cy: 0, r: 2 };
    expect(intersectsCircleCircle(a, b)).toBe(true);
  });

  test('동심원이면 true를 반환한다', () => {
    // distance=0 < r1+r2=8
    const a = { cx: 0, cy: 0, r: 3 };
    const b = { cx: 0, cy: 0, r: 5 };
    expect(intersectsCircleCircle(a, b)).toBe(true);
  });

  test('a가 empty (radius=0)이면 false를 반환한다', () => {
    const a = { cx: 0, cy: 0, r: 0 };
    const b = { cx: 0, cy: 0, r: 5 };
    expect(intersectsCircleCircle(a, b)).toBe(false);
  });

  test('b가 empty (radius<0)이면 false를 반환한다', () => {
    const a = { cx: 0, cy: 0, r: 5 };
    const b = { cx: 0, cy: 0, r: -1 };
    expect(intersectsCircleCircle(a, b)).toBe(false);
  });
});

describe('circle boolean query - intersectsRect', () => {
  test('rect 외부에서 완전히 분리되면 false를 반환한다', () => {
    const circle = { cx: 0, cy: 0, r: 2 };
    const rect = { x: 10, y: 10, width: 5, height: 5 };
    expect(intersectsCircleRect(circle, rect)).toBe(false);
  });

  test('rect edge에 tangent이면 true를 반환한다 (closest point = edge)', () => {
    // closest point = (5, 0), dist = 5 = radius
    const circle = { cx: 0, cy: 0, r: 5 };
    const rect = { x: 5, y: -3, width: 10, height: 6 };
    expect(intersectsCircleRect(circle, rect)).toBe(true);
  });

  test('rect corner zone에서 corner를 통과하면 true를 반환한다 (closest point = corner)', () => {
    // rect [0,0,5,5], center (-2,-2) → closest=(0,0), distSq=8 < r²=9
    const circle = { cx: -2, cy: -2, r: 3 };
    const rect = { x: 0, y: 0, width: 5, height: 5 };
    expect(intersectsCircleRect(circle, rect)).toBe(true);
  });

  test('rect corner에 tangent이면 true를 반환한다 (corner zone, closed boundary)', () => {
    // rect [0,0,5,5], center (-3,-4) → closest=(0,0), distSq=25 = r²=25
    const circle = { cx: -3, cy: -4, r: 5 };
    const rect = { x: 0, y: 0, width: 5, height: 5 };
    expect(intersectsCircleRect(circle, rect)).toBe(true);
  });

  test('rect corner zone에서 corner 밖에 머무르면 false를 반환한다', () => {
    // rect [0,0,5,5], center (-3,-4) → closest=(0,0), distSq=25 > r²=16
    const circle = { cx: -3, cy: -4, r: 4 };
    const rect = { x: 0, y: 0, width: 5, height: 5 };
    expect(intersectsCircleRect(circle, rect)).toBe(false);
  });

  test('circle과 rect가 교차하면 true를 반환한다', () => {
    // closest point = (2, 0), dist = 2 < radius=5
    const circle = { cx: 0, cy: 0, r: 5 };
    const rect = { x: 2, y: -3, width: 10, height: 6 };
    expect(intersectsCircleRect(circle, rect)).toBe(true);
  });

  test('circle이 rect를 완전히 포함하면 true를 반환한다', () => {
    const circle = { cx: 0, cy: 0, r: 20 };
    const rect = { x: -5, y: -5, width: 10, height: 10 };
    expect(intersectsCircleRect(circle, rect)).toBe(true);
  });

  test('rect가 circle을 완전히 포함하면 true를 반환한다', () => {
    // circle center가 rect 안에 있음 → closest point = center, dist = 0 < r
    const circle = { cx: 0, cy: 0, r: 2 };
    const rect = { x: -10, y: -10, width: 20, height: 20 };
    expect(intersectsCircleRect(circle, rect)).toBe(true);
  });

  test('empty circle (radius=0)이면 false를 반환한다', () => {
    const circle = { cx: 0, cy: 0, r: 0 };
    const rect = { x: -5, y: -5, width: 10, height: 10 };
    expect(intersectsCircleRect(circle, rect)).toBe(false);
  });

  test('empty circle (radius < 0)이면 false를 반환한다', () => {
    const circle = { cx: 0, cy: 0, r: -1 };
    const rect = { x: -5, y: -5, width: 10, height: 10 };
    expect(intersectsCircleRect(circle, rect)).toBe(false);
  });

  test('empty rect (width=0)이면 false를 반환한다', () => {
    const circle = { cx: 0, cy: 0, r: 5 };
    const rect = { x: 0, y: -3, width: 0, height: 6 };
    expect(intersectsCircleRect(circle, rect)).toBe(false);
  });

  test('empty rect (height=0)이면 false를 반환한다', () => {
    const circle = { cx: 0, cy: 0, r: 5 };
    const rect = { x: -3, y: 0, width: 6, height: 0 };
    expect(intersectsCircleRect(circle, rect)).toBe(false);
  });
});

describe('circle boolean query - intersectsSegment', () => {
  test('segment가 circle 밖에 있으면 false를 반환한다', () => {
    // closest point = (5, 0), dist = 5 > radius=2
    const circle = { center: { x: 0, y: 0 }, radius: 2 };
    const segment = { a: { x: 5, y: 0 }, b: { x: 10, y: 0 } };
    expect(intersectsSegment(circle, segment)).toBe(false);
  });

  test('한 endpoint가 circle 경계 위에 있으면 true를 반환한다 (closed boundary)', () => {
    // endpoint (3, 4) dist = 5 = radius
    const circle = { center: { x: 0, y: 0 }, radius: 5 };
    const segment = { a: { x: 3, y: 4 }, b: { x: 10, y: 0 } };
    expect(intersectsSegment(circle, segment)).toBe(true);
  });

  test('한 endpoint가 circle 안에 있으면 true를 반환한다', () => {
    // endpoint (3, 0) dist = 3 < radius=5
    const circle = { center: { x: 0, y: 0 }, radius: 5 };
    const segment = { a: { x: 3, y: 0 }, b: { x: 10, y: 0 } };
    expect(intersectsSegment(circle, segment)).toBe(true);
  });

  test('양 endpoint가 circle 안에 있으면 true를 반환한다', () => {
    const circle = { center: { x: 0, y: 0 }, radius: 10 };
    const segment = { a: { x: 1, y: 0 }, b: { x: 5, y: 0 } };
    expect(intersectsSegment(circle, segment)).toBe(true);
  });

  test('segment 중간이 circle을 통과하면 true를 반환한다', () => {
    // closest point = (0, 0), dist = 0 < radius=2
    const circle = { center: { x: 0, y: 0 }, radius: 2 };
    const segment = { a: { x: -5, y: 0 }, b: { x: 5, y: 0 } };
    expect(intersectsSegment(circle, segment)).toBe(true);
  });

  test('segment가 circle에 tangent이면 true를 반환한다', () => {
    // circle center (0, 5) r=5, segment (-5,0)-(5,0), closest = (0, 0), dist = 5 = r
    const circle = { center: { x: 0, y: 5 }, radius: 5 };
    const segment = { a: { x: -5, y: 0 }, b: { x: 5, y: 0 } };
    expect(intersectsSegment(circle, segment)).toBe(true);
  });

  test('degenerate segment (a===b 좌표)가 circle 안에 있으면 true를 반환한다', () => {
    const circle = { center: { x: 0, y: 0 }, radius: 5 };
    const segment = { a: { x: 3, y: 0 }, b: { x: 3, y: 0 } };
    expect(intersectsSegment(circle, segment)).toBe(true);
  });

  test('degenerate segment (a===b 좌표)가 circle 밖에 있으면 false를 반환한다', () => {
    const circle = { center: { x: 0, y: 0 }, radius: 2 };
    const segment = { a: { x: 5, y: 0 }, b: { x: 5, y: 0 } };
    expect(intersectsSegment(circle, segment)).toBe(false);
  });

  test('empty circle (radius=0)이면 false를 반환한다', () => {
    const circle = { center: { x: 0, y: 0 }, radius: 0 };
    const segment = { a: { x: -5, y: 0 }, b: { x: 5, y: 0 } };
    expect(intersectsSegment(circle, segment)).toBe(false);
  });

  test('empty circle (radius < 0)이면 false를 반환한다', () => {
    const circle = { center: { x: 0, y: 0 }, radius: -1 };
    const segment = { a: { x: -5, y: 0 }, b: { x: 5, y: 0 } };
    expect(intersectsSegment(circle, segment)).toBe(false);
  });

  test('tuple center / tuple endpoint에서도 동작한다', () => {
    // endpoint (3, 0) dist = 3 < radius=5
    const circle = { center: [0, 0] as const, radius: 5 };
    const segment = { a: [3, 0] as const, b: [10, 0] as const };
    expect(intersectsSegment(circle, segment)).toBe(true);
  });

  test('tuple segment shorthand에서도 동작한다', () => {
    const circle = { center: { x: 0, y: 0 }, radius: 2 };
    const segment = [
      [-5, 0],
      [5, 0],
    ] as const;

    expect(intersectsSegment(circle, segment)).toBe(true);
  });
});
