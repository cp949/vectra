/**
 * triangle 내각 계산 단위 테스트.
 *
 * interiorAnglesInto의 합=π invariant, 정삼각형/직각삼각형 분포, out 초기화 정책,
 * degenerate input(collinear, point) 처리를 함께 다룬다.
 */
import { describe, expect, test } from 'vitest';
import { interiorAnglesInto } from '../../../src/triangle/interior-angles-into';

/** 3-4-5 직각삼각형: a(0,0) b(3,0) c(0,4) — CCW */
const right345 = { a: { x: 0, y: 0 }, b: { x: 3, y: 0 }, c: { x: 0, y: 4 } };

/** 변이 1인 정삼각형 */
const equilateral = {
  a: { x: 0, y: 0 },
  b: { x: 1, y: 0 },
  c: { x: 0.5, y: Math.sqrt(3) / 2 },
};

/** collinear(degenerate) triangle */
const collinear = { a: { x: 0, y: 0 }, b: { x: 2, y: 0 }, c: { x: 4, y: 0 } };

/** 한 점으로 수렴(all same vertex) */
const point = { a: { x: 1, y: 1 }, b: { x: 1, y: 1 }, c: { x: 1, y: 1 } };

describe('interiorAnglesInto', () => {
  test('3-4-5 직각삼각형: 세 내각의 합이 π이다', () => {
    const out: number[] = [];
    interiorAnglesInto(out, right345);
    expect(out).toHaveLength(3);
    expect(out[0] + out[1] + out[2]).toBeCloseTo(Math.PI, 10);
  });

  test('3-4-5 직각삼각형: vertex a(0,0)의 내각이 π/2이다', () => {
    const out: number[] = [];
    interiorAnglesInto(out, right345);
    expect(out[0]).toBeCloseTo(Math.PI / 2, 10);
  });

  test('정삼각형: 세 내각이 모두 π/3이다', () => {
    const out: number[] = [];
    interiorAnglesInto(out, equilateral);
    expect(out).toHaveLength(3);
    for (const angle of out) {
      expect(angle).toBeCloseTo(Math.PI / 3, 8);
    }
  });

  test('out.length를 먼저 초기화한다', () => {
    const out = [1, 2, 3, 4, 5];
    interiorAnglesInto(out, right345);
    expect(out).toHaveLength(3);
  });

  test('out을 반환한다', () => {
    const out: number[] = [];
    const result = interiorAnglesInto(out, right345);
    expect(result).toBe(out);
  });

  test('collinear triangle: 내각을 3개 push한다(0 또는 π 포함)', () => {
    const out: number[] = [];
    interiorAnglesInto(out, collinear);
    expect(out).toHaveLength(3);
  });

  test('point triangle(모든 vertex 동일): 세 내각이 모두 0이다', () => {
    const out: number[] = [];
    interiorAnglesInto(out, point);
    expect(out).toHaveLength(3);
    for (const angle of out) {
      expect(angle).toBe(0);
    }
  });

  test('tuple input도 처리한다', () => {
    const t = [
      { x: 0, y: 0 },
      { x: 3, y: 0 },
      { x: 0, y: 4 },
    ] as const;
    const out: number[] = [];
    interiorAnglesInto(out, t);
    expect(out).toHaveLength(3);
    expect(out[0] + out[1] + out[2]).toBeCloseTo(Math.PI, 10);
  });
});
