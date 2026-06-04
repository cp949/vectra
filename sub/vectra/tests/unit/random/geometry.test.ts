import { describe, expect, test } from 'vitest';
import { directionInto } from '../../../src/random/direction-into';
import { pointInBoundsInto } from '../../../src/random/point-in-bounds-into';
import { pointInCircleInto } from '../../../src/random/point-in-circle-into';
import { pointInRectInto } from '../../../src/random/point-in-rect-into';
import { pointInTriangleInto } from '../../../src/random/point-in-triangle-into';
import { pointOnCircleInto } from '../../../src/random/point-on-circle-into';
import { pointOnSegmentInto } from '../../../src/random/point-on-segment-into';

import { sequence } from './_geometry-test-helpers';

describe('random geometry sampling', () => {
  test('directionInto는 angle-uniform 방향 벡터를 기록하고 out reference를 반환한다', () => {
    const out = { x: 0, y: 0 };
    // rng=0.5 → theta = PI → cos(PI)≈-1, sin(PI)≈0, length=2 → (-2, 0)
    const result = directionInto(out, 2, () => 0.5);
    expect(result).toBe(out);
    expect(out.x).toBeCloseTo(-2);
    expect(out.y).toBeCloseTo(0);
  });

  test('directionInto는 default length=1을 사용한다', () => {
    const out = { x: 0, y: 0 };
    // rng=0 → theta=0 → (1, 0)
    directionInto(out, 1, () => 0);
    expect(out.x).toBeCloseTo(1);
    expect(out.y).toBeCloseTo(0);
  });

  test('pointOnSegmentInto는 segment 위 점을 기록하고 out reference를 반환한다', () => {
    const out = { x: 0, y: 0 };
    // t=0.25, a=(10,20), b=(30,60) → (15, 30)
    const result = pointOnSegmentInto(out, { a: { x: 10, y: 20 }, b: { x: 30, y: 60 } }, () => 0.25);
    expect(result).toBe(out);
    expect(out).toEqual({ x: 15, y: 30 });
  });

  test('pointOnSegmentInto는 tuple segment shorthand를 지원한다', () => {
    const out = { x: 0, y: 0 };

    pointOnSegmentInto(
      out,
      [
        [10, 20],
        [30, 60],
      ],
      () => 0.25
    );

    expect(out).toEqual({ x: 15, y: 30 });
  });

  test('pointOnSegmentInto는 degenerate segment에서 endpoint를 기록한다', () => {
    const out = { x: 0, y: 0 };
    pointOnSegmentInto(out, { a: { x: 5, y: 7 }, b: { x: 5, y: 7 } }, () => 0.5);
    expect(out).toEqual({ x: 5, y: 7 });
  });

  test('pointInRectInto는 empty rect(width=0)에서 false를 반환하고 out을 유지한다', () => {
    const out = { x: 7, y: 8 };
    const result = pointInRectInto(out, { x: 0, y: 0, width: 0, height: 10 }, sequence([0.2, 0.3]));
    expect(result).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
  });

  test('pointInRectInto는 empty rect(height<0)에서 false를 반환하고 out을 유지한다', () => {
    const out = { x: 1, y: 2 };
    const result = pointInRectInto(out, { x: 0, y: 0, width: 10, height: -1 }, sequence([0.5, 0.5]));
    expect(result).toBe(false);
    expect(out).toEqual({ x: 1, y: 2 });
  });

  test('pointInRectInto는 valid rect 내부 좌표를 기록하고 true를 반환한다', () => {
    const out = { x: 0, y: 0 };
    // x=10, y=20, w=100, h=50, rng=[0.25, 0.5] → (10+25, 20+25) = (35, 45)
    const result = pointInRectInto(out, { x: 10, y: 20, width: 100, height: 50 }, sequence([0.25, 0.5]));
    expect(result).toBe(true);
    expect(out).toEqual({ x: 35, y: 45 });
  });

  test('pointInRectInto는 tuple rect 내부 좌표를 기록한다', () => {
    const out = { x: 0, y: 0 };
    const result = pointInRectInto(out, [10, 20, 100, 50], sequence([0.25, 0.5]));
    expect(result).toBe(true);
    expect(out).toEqual({ x: 35, y: 45 });
  });

  test('pointInBoundsInto는 inverted bounds(max.x < min.x)에서 false를 반환하고 out을 유지한다', () => {
    const out = { x: 1, y: 2 };
    const result = pointInBoundsInto(out, { min: { x: 5, y: 0 }, max: { x: 3, y: 10 } }, sequence([0.5, 0.5]));
    expect(result).toBe(false);
    expect(out).toEqual({ x: 1, y: 2 });
  });

  test('pointInBoundsInto는 valid bounds 내부 좌표를 기록하고 true를 반환한다', () => {
    const out = { x: 0, y: 0 };
    // min=(0,0), max=(10,20), rng=[0.5, 0.25] → (5, 5)
    const result = pointInBoundsInto(out, { min: { x: 0, y: 0 }, max: { x: 10, y: 20 } }, sequence([0.5, 0.25]));
    expect(result).toBe(true);
    expect(out).toEqual({ x: 5, y: 5 });
  });

  test('pointInCircleInto는 radius<=0인 circle에서 false를 반환하고 out을 유지한다', () => {
    const out = { x: 3, y: 4 };
    const result = pointInCircleInto(out, { center: { x: 0, y: 0 }, radius: 0 }, sequence([0.5, 0.5]));
    expect(result).toBe(false);
    expect(out).toEqual({ x: 3, y: 4 });
  });

  test('pointInCircleInto는 area-uniform 공식으로 disk 내부 좌표를 기록하고 true를 반환한다', () => {
    const out = { x: 0, y: 0 };
    // center=(1,2), radius=4, rng=[0.5, 0.5] → theta=PI, r=sqrt(0.5)*4
    // x = 1 + sqrt(0.5)*4*cos(PI) ≈ 1 - 2*sqrt(2) ≈ -1.828...
    // y = 2 + sqrt(0.5)*4*sin(PI) ≈ 2
    const result = pointInCircleInto(out, { center: { x: 1, y: 2 }, radius: 4 }, sequence([0.5, 0.5]));
    expect(result).toBe(true);
    const expectedR = Math.sqrt(0.5) * 4;
    expect(out.x).toBeCloseTo(1 + expectedR * Math.cos(Math.PI));
    expect(out.y).toBeCloseTo(2 + expectedR * Math.sin(Math.PI));
  });

  test('pointOnCircleInto는 radius<=0에서 false를 반환하고 out을 유지한다', () => {
    const out = { x: 5, y: 6 };
    const result = pointOnCircleInto(out, { center: { x: 0, y: 0 }, radius: -1 }, sequence([0.5]));
    expect(result).toBe(false);
    expect(out).toEqual({ x: 5, y: 6 });
  });

  test('pointOnCircleInto는 circumference 좌표를 기록하고 true를 반환한다', () => {
    const out = { x: 0, y: 0 };
    // center=(0,0), radius=5, rng=0 → theta=0 → (5, 0)
    const result = pointOnCircleInto(out, { center: { x: 0, y: 0 }, radius: 5 }, () => 0);
    expect(result).toBe(true);
    expect(out.x).toBeCloseTo(5);
    expect(out.y).toBeCloseTo(0);
  });

  test('pointInTriangleInto는 barycentric normal case를 기록하고 out reference를 반환한다', () => {
    const out = { x: 0, y: 0 };
    // a=(0,0), b=(4,0), c=(0,4), r=0.2, s=0.3 → r+s=0.5<=1, no reflection
    // x = 0 + 4*0.2 + 0*0.3 = 0.8
    // y = 0 + 0*0.2 + 4*0.3 = 1.2
    const result = pointInTriangleInto(out, { x: 0, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 4 }, sequence([0.2, 0.3]));
    expect(result).toBe(out);
    expect(out.x).toBeCloseTo(0.8);
    expect(out.y).toBeCloseTo(1.2);
  });

  test('pointInTriangleInto는 barycentric reflection case를 적용한다', () => {
    const out = { x: 0, y: 0 };
    // a=(0,0), b=(4,0), c=(0,4), r=0.7, s=0.6 → r+s=1.3>1 → r=0.3, s=0.4
    // x = 0 + 4*0.3 + 0*0.4 = 1.2
    // y = 0 + 0*0.3 + 4*0.4 = 1.6
    pointInTriangleInto(out, { x: 0, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 4 }, sequence([0.7, 0.6]));
    expect(out.x).toBeCloseTo(1.2);
    expect(out.y).toBeCloseTo(1.6);
  });

  test('tuple output도 올바르게 기록한다', () => {
    const out: [number, number] = [0, 0];
    directionInto(out, 1, () => 0);
    expect(out[0]).toBeCloseTo(1);
    expect(out[1]).toBeCloseTo(0);
  });
});
