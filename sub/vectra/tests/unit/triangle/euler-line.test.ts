/**
 * triangle Euler line 단위 테스트.
 *
 * eulerLineInto / eulerLine의 endpoint(out.a=centroid, out.b=orthocenter),
 * 정삼각형 zero-length segment, degenerate/non-finite 실패 정책, output 계약,
 * aliasing 안전성을 다룬다.
 */
import { describe, expect, test } from 'vitest';
import { centroid } from '../../../src/triangle/centroid';
import { eulerLine } from '../../../src/triangle/euler-line';
import { eulerLineInto } from '../../../src/triangle/euler-line-into';
import { orthocenter } from '../../../src/triangle/orthocenter';

/** 직각삼각형. 직각 꼭짓점 A(0,0)이 orthocenter, centroid=(4/3, 1) */
const right = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 0, y: 3 } };

/** 예각삼각형 */
const acute = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 1, y: 3 } };

/** 변이 1인 정삼각형. centroid와 orthocenter가 일치한다. */
const equilateral = {
  a: { x: 0, y: 0 },
  b: { x: 1, y: 0 },
  c: { x: 0.5, y: Math.sqrt(3) / 2 },
};

/** collinear(degenerate) triangle */
const collinear = { a: { x: 0, y: 0 }, b: { x: 2, y: 0 }, c: { x: 4, y: 0 } };

/** 세 vertex가 한 점인 triangle */
const singlePoint = { a: { x: 1, y: 1 }, b: { x: 1, y: 1 }, c: { x: 1, y: 1 } };

/** zero-initialized segment writable을 만든다. */
function seg() {
  return { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
}

describe('eulerLineInto', () => {
  test('직각삼각형: out.a는 centroid(4/3, 1), out.b는 orthocenter(0, 0)다', () => {
    const out = seg();
    const result = eulerLineInto(out, right);
    expect(result).toBe(out);
    expect(out.a.x).toBeCloseTo(4 / 3, 10);
    expect(out.a.y).toBeCloseTo(1, 10);
    expect(out.b.x).toBeCloseTo(0, 10);
    expect(out.b.y).toBeCloseTo(0, 10);
  });

  test('예각삼각형: out.a/out.b는 centroid/orthocenter companion과 일치한다', () => {
    const g = centroid(acute);
    const h = orthocenter(acute);
    expect(h).not.toBeUndefined();
    if (h === undefined) throw new Error('orthocenter가 정의되어야 한다');
    const out = seg();
    expect(eulerLineInto(out, acute)).toBe(out);
    expect(out.a.x).toBeCloseTo(g.x, 10);
    expect(out.a.y).toBeCloseTo(g.y, 10);
    expect(out.b.x).toBeCloseTo(h.x, 10);
    expect(out.b.y).toBeCloseTo(h.y, 10);
  });

  test('정삼각형: centroid와 orthocenter가 일치하는 zero-length segment로 성공한다', () => {
    const out = seg();
    const result = eulerLineInto(out, equilateral);
    expect(result).toBe(out);
    expect(out.a.x).toBeCloseTo(out.b.x, 10);
    expect(out.a.y).toBeCloseTo(out.b.y, 10);
    expect(out.a.x).toBeCloseTo(0.5, 10);
    expect(out.a.y).toBeCloseTo(Math.sqrt(3) / 6, 10);
  });

  test('tuple input도 처리한다', () => {
    const t = [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 0, y: 3 },
    ] as const;
    const out = seg();
    const result = eulerLineInto(out, t);
    expect(result).toBe(out);
    expect(out.a.x).toBeCloseTo(4 / 3, 10);
    expect(out.a.y).toBeCloseTo(1, 10);
    expect(out.b.x).toBeCloseTo(0, 10);
    expect(out.b.y).toBeCloseTo(0, 10);
  });

  test('out.a가 input vertex storage와 aliasing되어도 올바른 결과를 기록한다', () => {
    const shared = { x: 0, y: 0 };
    // vertex a와 out.a가 같은 object다.
    const t = { a: shared, b: { x: 4, y: 0 }, c: { x: 0, y: 3 } };
    const out = { a: shared, b: { x: 0, y: 0 } };
    const result = eulerLineInto(out, t);
    expect(result).toBe(out);
    expect(out.a.x).toBeCloseTo(4 / 3, 10);
    expect(out.a.y).toBeCloseTo(1, 10);
    expect(out.b.x).toBeCloseTo(0, 10);
    expect(out.b.y).toBeCloseTo(0, 10);
  });

  test('collinear triangle: false를 반환하고 out을 수정하지 않는다', () => {
    const out = { a: { x: 99, y: 99 }, b: { x: 88, y: 88 } };
    const result = eulerLineInto(out, collinear);
    expect(result).toBe(false);
    expect(out.a.x).toBe(99);
    expect(out.a.y).toBe(99);
    expect(out.b.x).toBe(88);
    expect(out.b.y).toBe(88);
  });

  test('single-point triangle: false를 반환하고 out을 수정하지 않는다', () => {
    const out = { a: { x: 99, y: 99 }, b: { x: 88, y: 88 } };
    const result = eulerLineInto(out, singlePoint);
    expect(result).toBe(false);
    expect(out.a.x).toBe(99);
    expect(out.b.x).toBe(88);
  });

  test('non-finite vertex(Infinity): false를 반환하고 out을 수정하지 않는다', () => {
    const t = { a: { x: Infinity, y: 0 }, b: { x: 4, y: 0 }, c: { x: 0, y: 3 } };
    const out = { a: { x: 99, y: 99 }, b: { x: 88, y: 88 } };
    expect(eulerLineInto(out, t)).toBe(false);
    expect(out.a.x).toBe(99);
    expect(out.b.x).toBe(88);
  });

  test('non-finite vertex(NaN): false를 반환하고 out을 수정하지 않는다', () => {
    const t = { a: { x: 0, y: 0 }, b: { x: NaN, y: 0 }, c: { x: 0, y: 3 } };
    const out = { a: { x: 99, y: 99 }, b: { x: 88, y: 88 } };
    expect(eulerLineInto(out, t)).toBe(false);
    expect(out.a.x).toBe(99);
    expect(out.b.y).toBe(88);
  });

  test('non-finite vertex(-Infinity): false를 반환하고 out을 수정하지 않는다', () => {
    const t = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 0, y: -Infinity } };
    const out = { a: { x: 99, y: 99 }, b: { x: 88, y: 88 } };
    expect(eulerLineInto(out, t)).toBe(false);
    expect(out.a.y).toBe(99);
    expect(out.b.x).toBe(88);
  });

  test('near-collinear(signedArea2x≠0이지만 raw D 전개가 0): 성공 시 유한 segment를 쓴다', () => {
    // signedArea2x = -1.42e-14(≠0, guard 통과)이지만 raw 좌표 전개 D = 2*(ax*(by-cy)+...)는 0이다.
    // denominator를 guard의 signed area와 같은 전개로 묶지 않으면 division-by-zero로 Infinity를 쓴다.
    const t = {
      a: { x: 3.8400211035452747, y: 17.281933327867037 },
      b: { x: 8.156115648087077, y: 31.91817240438104 },
      c: { x: 9.039683586890016, y: 34.91442548901669 },
    };
    const out = seg();
    const result = eulerLineInto(out, t);
    // signedArea2x≠0이라 non-degenerate → 성공해야 한다. 성공 시 endpoint는 유한이어야 한다(Infinity/NaN 금지).
    expect(result).not.toBe(false);
    expect(Number.isFinite(out.a.x)).toBe(true);
    expect(Number.isFinite(out.a.y)).toBe(true);
    expect(Number.isFinite(out.b.x)).toBe(true);
    expect(Number.isFinite(out.b.y)).toBe(true);
  });
});

describe('eulerLine', () => {
  test('직각삼각형: Euler line segment를 새 plain object로 반환한다', () => {
    const result = eulerLine(right);
    expect(result).not.toBeUndefined();
    if (result === undefined) throw new Error('eulerLine이 정의되어야 한다');
    expect(result.a.x).toBeCloseTo(4 / 3, 10);
    expect(result.a.y).toBeCloseTo(1, 10);
    expect(result.b.x).toBeCloseTo(0, 10);
    expect(result.b.y).toBeCloseTo(0, 10);
  });

  test('성공 시 매번 새 object를 반환한다', () => {
    const r1 = eulerLine(right);
    const r2 = eulerLine(right);
    expect(r1).not.toBe(r2);
    expect(r1?.a).not.toBe(r2?.a);
  });

  test('정삼각형: zero-length segment를 반환한다', () => {
    const result = eulerLine(equilateral);
    expect(result).not.toBeUndefined();
    if (result === undefined) throw new Error('eulerLine이 정의되어야 한다');
    expect(result.a.x).toBeCloseTo(result.b.x, 10);
    expect(result.a.y).toBeCloseTo(result.b.y, 10);
  });

  test('collinear triangle: undefined를 반환한다', () => {
    expect(eulerLine(collinear)).toBeUndefined();
  });

  test('single-point triangle: undefined를 반환한다', () => {
    expect(eulerLine(singlePoint)).toBeUndefined();
  });

  test('non-finite vertex: undefined를 반환한다', () => {
    const t = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 0, y: -Infinity } };
    expect(eulerLine(t)).toBeUndefined();
  });
});
