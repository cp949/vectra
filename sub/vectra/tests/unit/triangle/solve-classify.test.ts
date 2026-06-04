import { describe, expect, test } from 'vitest';
import { classifyPoint } from '../../../src/triangle/classify-point';
import { solveAsa } from '../../../src/triangle/solve-asa';
import { solveAsaInto } from '../../../src/triangle/solve-asa-into';
import { solveSss } from '../../../src/triangle/solve-sss';
import { solveSssInto } from '../../../src/triangle/solve-sss-into';

const tri = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 2, y: 3 } };

describe('solveSssInto — 세 변으로 내각 계산 (Into 버전)', () => {
  test('유효한 삼각형의 세 내각을 radian으로 기록한다', () => {
    const out = { a: 0, b: 0, c: 0 };
    const result = solveSssInto(out, 3, 4, 5);

    expect(result).toBe(out);
    // 직각삼각형: 가장 큰 각이 π/2
    expect(result !== false && result.c).toBeCloseTo(Math.PI / 2, 5);
    // 세 내각의 합이 π
    expect(result !== false && result.a + result.b + result.c).toBeCloseTo(Math.PI, 5);
  });

  test('정삼각형은 세 내각이 모두 π/3이다', () => {
    const out = { a: 0, b: 0, c: 0 };
    const result = solveSssInto(out, 5, 5, 5);

    expect(result !== false && result.a).toBeCloseTo(Math.PI / 3, 5);
    expect(result !== false && result.b).toBeCloseTo(Math.PI / 3, 5);
    expect(result !== false && result.c).toBeCloseTo(Math.PI / 3, 5);
  });

  test('삼각형 불등식을 위반하면 false를 반환하고 out을 수정하지 않는다', () => {
    const out = { a: 9, b: 9, c: 9 };
    expect(solveSssInto(out, 1, 2, 10)).toBe(false);
    // out이 수정되지 않아야 한다
    expect(out.a).toBe(9);
    expect(out.b).toBe(9);
    expect(out.c).toBe(9);
  });

  test('변이 0이거나 음수이면 false를 반환한다', () => {
    expect(solveSssInto({ a: 0, b: 0, c: 0 }, 0, 4, 5)).toBe(false);
    expect(solveSssInto({ a: 0, b: 0, c: 0 }, 3, -1, 5)).toBe(false);
  });

  test('non-finite 변이면 false를 반환한다', () => {
    expect(solveSssInto({ a: 0, b: 0, c: 0 }, Infinity, 4, 5)).toBe(false);
    expect(solveSssInto({ a: 0, b: 0, c: 0 }, 3, Number.NaN, 5)).toBe(false);
  });
});

describe('solveSss — 세 변으로 내각 계산 (allocating companion)', () => {
  test('유효한 삼각형은 내각 object를 반환한다', () => {
    const result = solveSss(3, 4, 5);

    expect(result).not.toBeUndefined();
    expect((result?.a ?? 0) + (result?.b ?? 0) + (result?.c ?? 0)).toBeCloseTo(Math.PI, 5);
  });

  test('invalid triangle은 undefined를 반환한다', () => {
    expect(solveSss(1, 2, 10)).toBeUndefined();
    expect(solveSss(0, 3, 4)).toBeUndefined();
  });
});

describe('solveAsaInto — 두 각도와 끼인 변으로 세 변 계산', () => {
  test('유효한 ASA 입력의 세 변을 기록한다', () => {
    const out = { a: 0, b: 0, c: 0 };
    const result = solveAsaInto(out, Math.PI / 6, 10, Math.PI / 3);

    expect(result).toBe(out);
    expect(result !== false && result.a).toBeCloseTo(10 * Math.sin(Math.PI / 6), 10);
    expect(result !== false && result.b).toBeCloseTo(10 * Math.sin(Math.PI / 3), 10);
    expect(result !== false && result.c).toBe(10);
  });

  test('solveSssInto와 교차 검증한다', () => {
    const sides = { a: 0, b: 0, c: 0 };
    const asa = solveAsaInto(sides, Math.PI / 6, 10, Math.PI / 3);
    expect(asa).not.toBe(false);

    const angles = { a: 0, b: 0, c: 0 };
    const sss = solveSssInto(angles, sides.a, sides.b, sides.c);

    expect(sss).not.toBe(false);
    expect(sss !== false && sss.a).toBeCloseTo(Math.PI / 6, 10);
    expect(sss !== false && sss.b).toBeCloseTo(Math.PI / 3, 10);
    expect(sss !== false && sss.c).toBeCloseTo(Math.PI / 2, 10);
  });

  test('불가능한 삼각형이면 false를 반환하고 out을 수정하지 않는다', () => {
    const out = { a: 9, b: 9, c: 9 };

    expect(solveAsaInto(out, Math.PI / 2, 10, Math.PI / 2)).toBe(false);
    expect(out).toEqual({ a: 9, b: 9, c: 9 });
  });

  test('non-finite 또는 0 이하 입력이면 false를 반환한다', () => {
    expect(solveAsaInto({ a: 0, b: 0, c: 0 }, Number.NaN, 10, Math.PI / 3)).toBe(false);
    expect(solveAsaInto({ a: 0, b: 0, c: 0 }, Math.PI / 6, Infinity, Math.PI / 3)).toBe(false);
    expect(solveAsaInto({ a: 0, b: 0, c: 0 }, Math.PI / 6, 0, Math.PI / 3)).toBe(false);
    expect(solveAsaInto({ a: 0, b: 0, c: 0 }, -1, 10, Math.PI / 3)).toBe(false);
  });
});

describe('solveAsa — allocating companion', () => {
  test('유효한 ASA 입력은 side set object를 반환한다', () => {
    const result = solveAsa(Math.PI / 6, 10, Math.PI / 3);

    expect(result).not.toBeUndefined();
    expect(result?.c).toBe(10);
    expect(result?.a).toBeCloseTo(5, 10);
  });

  test('invalid triangle은 undefined를 반환한다', () => {
    expect(solveAsa(Math.PI / 2, 10, Math.PI / 2)).toBeUndefined();
    expect(solveAsa(Math.PI / 6, -1, Math.PI / 3)).toBeUndefined();
  });
});

describe('classifyPoint — triangle 내 point 위치 분류', () => {
  test("삼각형 내부 point는 'inside'를 반환한다", () => {
    expect(classifyPoint(tri, { x: 2, y: 1 })).toBe('inside');
  });

  test("vertex 위 point는 'on-edge'를 반환한다", () => {
    expect(classifyPoint(tri, { x: 0, y: 0 })).toBe('on-edge');
    expect(classifyPoint(tri, { x: 4, y: 0 })).toBe('on-edge');
    expect(classifyPoint(tri, { x: 2, y: 3 })).toBe('on-edge');
  });

  test("edge 위 point는 'on-edge'를 반환한다", () => {
    // 변 ab 위 중간점
    expect(classifyPoint(tri, { x: 2, y: 0 })).toBe('on-edge');
  });

  test("삼각형 외부 point는 'outside'를 반환한다", () => {
    expect(classifyPoint(tri, { x: -1, y: 0 })).toBe('outside');
    expect(classifyPoint(tri, { x: 5, y: 5 })).toBe('outside');
  });

  test('degenerate triangle이면 outside를 반환한다', () => {
    const degen = { a: { x: 0, y: 0 }, b: { x: 2, y: 0 }, c: { x: 4, y: 0 } };
    expect(classifyPoint(degen, { x: 1, y: 0 })).toBe('outside');
  });
});
