/**
 * triangle Euler line 단위 테스트.
 *
 * eulerLineInto / eulerLine의 endpoint(out.a=centroid, out.b=orthocenter),
 * 정삼각형 zero-length segment, degenerate/non-finite 실패 정책, output 계약,
 * 같은 객체를 입력과 출력으로 쓰는 경우를 다룬다.
 */
import { describe, expect, test } from 'vitest';
import { centroid } from '../../../src/triangle/centroid';
import { eulerLine } from '../../../src/triangle/euler-line';
import { eulerLineInto } from '../../../src/triangle/euler-line-into';
import { orthocenter } from '../../../src/triangle/orthocenter';

/** 직각삼각형. 직각 꼭짓점 A(0,0)이 orthocenter, centroid=(4/3, 1) */
const right = { x1: 0, y1: 0, x2: 4, y2: 0, x3: 0, y3: 3 };

/** 예각삼각형 */
const acute = { x1: 0, y1: 0, x2: 4, y2: 0, x3: 1, y3: 3 };

/** 변이 1인 정삼각형. centroid와 orthocenter가 일치한다. */
const equilateral = { x1: 0, y1: 0, x2: 1, y2: 0, x3: 0.5, y3: Math.sqrt(3) / 2 };

/** collinear(degenerate) triangle */
const collinear = { x1: 0, y1: 0, x2: 2, y2: 0, x3: 4, y3: 0 };

/** 세 vertex가 한 점인 triangle */
const singlePoint = { x1: 1, y1: 1, x2: 1, y2: 1, x3: 1, y3: 1 };

/** zero-initialized segment writable을 만든다. */
function seg() {
  return { x1: 0, y1: 0, x2: 0, y2: 0 };
}

describe('eulerLineInto', () => {
  test('같은 객체를 triangle 입력과 선분 출력으로 쓸 수 있다', () => {
    const out = { ...acute };
    expect(eulerLineInto(out, out)).toBe(out);
    expect(out.x1).toBeCloseTo(5 / 3, 10);
    expect(out.y1).toBeCloseTo(1, 10);
    expect(out.x2).toBeCloseTo(1, 10);
    expect(out.y2).toBeCloseTo(1, 10);
  });

  test('직각삼각형: out.a는 centroid(4/3, 1), out.b는 orthocenter(0, 0)다', () => {
    const out = seg();
    const result = eulerLineInto(out, right);
    expect(result).toBe(out);
    expect(out.x1).toBeCloseTo(4 / 3, 10);
    expect(out.y1).toBeCloseTo(1, 10);
    expect(out.x2).toBeCloseTo(0, 10);
    expect(out.y2).toBeCloseTo(0, 10);
  });

  test('예각삼각형: out.a/out.b는 centroid/orthocenter companion과 일치한다', () => {
    const g = centroid(acute);
    const h = orthocenter(acute);
    expect(h).not.toBeUndefined();
    if (h === undefined) throw new Error('orthocenter가 정의되어야 한다');
    const out = seg();
    expect(eulerLineInto(out, acute)).toBe(out);
    expect(out.x1).toBeCloseTo(g.x, 10);
    expect(out.y1).toBeCloseTo(g.y, 10);
    expect(out.x2).toBeCloseTo(h.x, 10);
    expect(out.y2).toBeCloseTo(h.y, 10);
  });

  test('정삼각형: centroid와 orthocenter가 일치하는 zero-length segment로 성공한다', () => {
    const out = seg();
    const result = eulerLineInto(out, equilateral);
    expect(result).toBe(out);
    expect(out.x1).toBeCloseTo(out.x2, 10);
    expect(out.y1).toBeCloseTo(out.y2, 10);
    expect(out.x1).toBeCloseTo(0.5, 10);
    expect(out.y1).toBeCloseTo(Math.sqrt(3) / 6, 10);
  });

  test('collinear triangle: false를 반환하고 out을 수정하지 않는다', () => {
    const out = { x1: 99, y1: 99, x2: 88, y2: 88 };
    const result = eulerLineInto(out, collinear);
    expect(result).toBe(false);
    expect(out.x1).toBe(99);
    expect(out.y1).toBe(99);
    expect(out.x2).toBe(88);
    expect(out.y2).toBe(88);
  });

  test('single-point triangle: false를 반환하고 out을 수정하지 않는다', () => {
    const out = { x1: 99, y1: 99, x2: 88, y2: 88 };
    const result = eulerLineInto(out, singlePoint);
    expect(result).toBe(false);
    expect(out.x1).toBe(99);
    expect(out.x2).toBe(88);
  });

  test('non-finite vertex(Infinity): false를 반환하고 out을 수정하지 않는다', () => {
    const t = { x1: Infinity, y1: 0, x2: 4, y2: 0, x3: 0, y3: 3 };
    const out = { x1: 99, y1: 99, x2: 88, y2: 88 };
    expect(eulerLineInto(out, t)).toBe(false);
    expect(out.x1).toBe(99);
    expect(out.x2).toBe(88);
  });

  test('non-finite vertex(NaN): false를 반환하고 out을 수정하지 않는다', () => {
    const t = { x1: 0, y1: 0, x2: NaN, y2: 0, x3: 0, y3: 3 };
    const out = { x1: 99, y1: 99, x2: 88, y2: 88 };
    expect(eulerLineInto(out, t)).toBe(false);
    expect(out.x1).toBe(99);
    expect(out.y2).toBe(88);
  });

  test('non-finite vertex(-Infinity): false를 반환하고 out을 수정하지 않는다', () => {
    const t = { x1: 0, y1: 0, x2: 4, y2: 0, x3: 0, y3: -Infinity };
    const out = { x1: 99, y1: 99, x2: 88, y2: 88 };
    expect(eulerLineInto(out, t)).toBe(false);
    expect(out.y1).toBe(99);
    expect(out.x2).toBe(88);
  });
});

describe('eulerLine', () => {
  test('직각삼각형: Euler line segment를 새 plain object로 반환한다', () => {
    const result = eulerLine(right);
    expect(result).not.toBeUndefined();
    if (result === undefined) throw new Error('eulerLine이 정의되어야 한다');
    expect(result.x1).toBeCloseTo(4 / 3, 10);
    expect(result.y1).toBeCloseTo(1, 10);
    expect(result.x2).toBeCloseTo(0, 10);
    expect(result.y2).toBeCloseTo(0, 10);
  });

  test('성공 시 매번 새 object를 반환한다', () => {
    const r1 = eulerLine(right);
    const r2 = eulerLine(right);
    expect(r1).not.toBe(r2);
  });

  test('정삼각형: zero-length segment를 반환한다', () => {
    const result = eulerLine(equilateral);
    expect(result).not.toBeUndefined();
    if (result === undefined) throw new Error('eulerLine이 정의되어야 한다');
    expect(result.x1).toBeCloseTo(result.x2, 10);
    expect(result.y1).toBeCloseTo(result.y2, 10);
  });

  test('collinear triangle: undefined를 반환한다', () => {
    expect(eulerLine(collinear)).toBeUndefined();
  });

  test('single-point triangle: undefined를 반환한다', () => {
    expect(eulerLine(singlePoint)).toBeUndefined();
  });

  test('non-finite vertex: undefined를 반환한다', () => {
    const t = { x1: 0, y1: 0, x2: 4, y2: 0, x3: 0, y3: -Infinity };
    expect(eulerLine(t)).toBeUndefined();
  });
});
