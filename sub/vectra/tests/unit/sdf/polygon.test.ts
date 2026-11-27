/** 도형의 부호 있는 거리와 입력 검증을 확인한다. */
import { describe, expect, test } from 'vitest';
import { sdfPolygon } from '../../../src/sdf/sdf-polygon';
import { NON_FINITE } from './_sdf-test-helpers';

describe('sdfPolygon', () => {
  // CCW 정사각형 [0,0] [10,0] [10,10] [0,10]
  const square = [0, 0, 10, 0, 10, 10, 0, 10];

  test('짝이 없는 꼭짓점 좌표는 RangeError다', () => {
    expect(() => sdfPolygon([1, 2, 3], { x: 0, y: 0 })).toThrow(RangeError);
  });

  test('points.length === 0은 RangeError다', () => {
    expect(() => sdfPolygon([], { x: 0, y: 0 })).toThrow(RangeError);
  });

  test('single-point polygon은 point distance를 반환한다', () => {
    expect(sdfPolygon([2, 3], { x: 2, y: 3 })).toBe(0);
    expect(sdfPolygon([2, 3], { x: 5, y: 7 })).toBe(5);
  });

  test('two-point polygon은 segment distance를 반환한다', () => {
    const seg = [0, 0, 10, 0];
    expect(sdfPolygon(seg, { x: 5, y: 0 })).toBe(0); // on segment
    expect(sdfPolygon(seg, { x: 5, y: 3 })).toBe(3); // perpendicular
    expect(sdfPolygon(seg, { x: 12, y: 0 })).toBe(2); // past endpoint
  });

  test('two-point polygon의 finite 좌표 차이가 overflow해도 segment distance를 유지한다', () => {
    const huge = Number.MAX_VALUE;
    const seg = [-huge, 0, huge, 0];
    expect(sdfPolygon(seg, { x: 0, y: 1 })).toBe(1);
  });

  test('two-point polygon의 finite distance 제곱이 overflow해도 segment distance를 유지한다', () => {
    const far = 1e200;
    const seg = [0, 0, 1, 0];
    expect(sdfPolygon(seg, { x: 0, y: far })).toBe(far);
  });

  test('CCW polygon interior point는 음수 boundary distance를 반환한다', () => {
    expect(sdfPolygon(square, { x: 5, y: 5 })).toBe(-5);
    expect(sdfPolygon(square, { x: 2, y: 5 })).toBe(-2); // 왼쪽 edge가 nearest
  });

  test('CW polygon도 같은 sign convention을 유지한다', () => {
    // square를 reverse한 CW winding
    const cw = [0, 0, 0, 10, 10, 10, 10, 0];
    expect(sdfPolygon(cw, { x: 5, y: 5 })).toBe(-5);
    expect(sdfPolygon(cw, { x: 2, y: 5 })).toBe(-2);
  });

  test('edge/corner boundary point는 0을 반환한다', () => {
    expect(sdfPolygon(square, { x: 0, y: 5 })).toBe(0); // 왼쪽 edge
    expect(sdfPolygon(square, { x: 5, y: 0 })).toBe(0); // 아래 edge
    expect(sdfPolygon(square, { x: 0, y: 0 })).toBe(0); // corner
    expect(sdfPolygon(square, { x: 10, y: 10 })).toBe(0); // corner
  });

  test('boundary 결과는 -0이 아닌 0이다', () => {
    expect(Object.is(sdfPolygon(square, { x: 0, y: 5 }), 0)).toBe(true);
  });

  test('exterior point는 양수 boundary distance를 반환한다', () => {
    expect(sdfPolygon(square, { x: 13, y: 5 })).toBe(3); // 오른쪽 바깥
    expect(sdfPolygon(square, { x: -4, y: 5 })).toBe(4); // 왼쪽 바깥
    // diagonal exterior: nearest corner (10,10) → sqrt(9+9)
    expect(sdfPolygon(square, { x: 13, y: 13 })).toBeCloseTo(Math.sqrt(18), 12);
  });

  test('대각 edge가 nearest인 interior/exterior point는 perpendicular distance를 반환한다', () => {
    // 직각삼각형, hypotenuse x+y=4
    const tri = [0, 0, 4, 0, 0, 4];
    // (1.5,1.5): hypotenuse가 nearest (foot (2,2)) → -1/√2
    expect(sdfPolygon(tri, { x: 1.5, y: 1.5 })).toBeCloseTo(-Math.SQRT1_2, 12);
    // (3,3): hypotenuse 바로 바깥 → +√2
    expect(sdfPolygon(tri, { x: 3, y: 3 })).toBeCloseTo(Math.SQRT2, 12);
  });

  test('concave polygon의 reflex 영역에서 ray casting sign convention을 유지한다', () => {
    // L-shape (concave), reflex vertex (2,2)
    const lshape = [0, 0, 4, 0, 4, 2, 2, 2, 2, 4, 0, 4];
    // arm 내부 → interior 음수
    expect(sdfPolygon(lshape, { x: 1, y: 1 })).toBe(-1);
    // notch(오목 영역)는 polygon 밖 → 양수
    expect(sdfPolygon(lshape, { x: 3, y: 3 })).toBe(1);
  });

  test('ray casting x 교점 좌표 차이가 overflow해도 exterior sign을 유지한다', () => {
    const huge = Number.MAX_VALUE;
    const tri = [huge, 0, -huge, 2, huge, 4];

    expect(sdfPolygon(tri, { x: -1, y: 1 })).toBeCloseTo(1, 12);
  });

  test('collinear ≥3 vertex polygon은 interior 음수 없이 boundary distance를 반환한다', () => {
    const collinear = [0, 0, 5, 0, 10, 0];
    expect(sdfPolygon(collinear, { x: 5, y: 0 })).toBe(0); // on segment
    expect(sdfPolygon(collinear, { x: 5, y: 3 })).toBe(3); // perpendicular
    expect(sdfPolygon(collinear, { x: 12, y: 0 })).toBe(2); // past endpoint
  });

  test('self-intersecting polygon은 repair 없이 finite 결과를 반환한다', () => {
    // bowtie: repair하지 않고 ray casting 결과를 그대로 쓴다 (no NaN/throw)
    const bowtie = [0, 0, 4, 4, 4, 0, 0, 4];
    const result = sdfPolygon(bowtie, { x: 2, y: 1 });
    expect(Number.isFinite(result)).toBe(true);
  });

  test('repeated-point edge polygon에서 NaN이 발생하지 않는다', () => {
    // 두 번째 꼭짓점이 첫 꼭짓점과 같아 길이 0인 변이 생긴다.
    const repeated = [0, 0, 0, 0, 10, 0, 10, 10, 0, 10];
    expect(Number.isNaN(sdfPolygon(repeated, { x: 5, y: 5 }))).toBe(false);
    expect(sdfPolygon(repeated, { x: 5, y: 5 })).toBe(-5);
    expect(sdfPolygon(repeated, { x: 0, y: 0 })).toBe(0);
  });

  test.each(NON_FINITE)('non-finite vertex x %p는 RangeError다', (bad) => {
    const poly = [0, 0, bad, 0, 10, 10];
    expect(() => sdfPolygon(poly, { x: 5, y: 5 })).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite vertex y %p는 RangeError다', (bad) => {
    const poly = [0, 0, 10, bad, 10, 10];
    expect(() => sdfPolygon(poly, { x: 5, y: 5 })).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite point.x %p는 RangeError다', (bad) => {
    expect(() => sdfPolygon(square, { x: bad, y: 5 })).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite point.y %p는 RangeError다', (bad) => {
    expect(() => sdfPolygon(square, { x: 5, y: bad })).toThrow(RangeError);
  });
});
