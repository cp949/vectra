/**
 * solveTriangleCircumcenter kernel 단위 테스트.
 *
 * triangle circumcenter 계열 6개 leaf가 공유하는 kernel의 interface를 직접 검증한다.
 * 외심 값, tuple/object 입력, degenerate/non-finite 실패 시 out 불변,
 * near-collinear에서 "성공 ⇒ 유한" 계약, out과 vertex가 alias일 때의 안전성을 다룬다.
 */
import { describe, expect, test } from 'vitest';
import { solveTriangleCircumcenter } from '../../../src/internal/triangle-circumcenter';

/** zero-initialized XY writable을 만든다. */
function point() {
  return { x: 0, y: 0 };
}

describe('solveTriangleCircumcenter', () => {
  test('직각삼각형: 외심은 빗변 중점 (2, 1.5)다', () => {
    const out = point();
    const ok = solveTriangleCircumcenter(out, { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 0, y: 3 } });
    expect(ok).toBe(true);
    expect(out.x).toBeCloseTo(2, 12);
    expect(out.y).toBeCloseTo(1.5, 12);
  });

  test('tuple 입력도 object 입력과 같은 외심을 낸다', () => {
    const fromObject = point();
    const fromTuple = point();
    solveTriangleCircumcenter(fromObject, { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 1, y: 3 } });
    solveTriangleCircumcenter(fromTuple, [
      [0, 0],
      [4, 0],
      [1, 3],
    ]);
    expect(fromTuple).toEqual(fromObject);
  });

  test('vertex 순서를 뒤집어 방향(CW/CCW)이 바뀌어도 외심은 같다', () => {
    const ccw = point();
    const cw = point();
    solveTriangleCircumcenter(ccw, { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 1, y: 3 } });
    solveTriangleCircumcenter(cw, { a: { x: 1, y: 3 }, b: { x: 4, y: 0 }, c: { x: 0, y: 0 } });
    expect(cw.x).toBeCloseTo(ccw.x, 12);
    expect(cw.y).toBeCloseTo(ccw.y, 12);
  });

  test.each([
    ['collinear', { a: { x: 0, y: 0 }, b: { x: 2, y: 0 }, c: { x: 4, y: 0 } }],
    ['세 vertex가 한 점', { a: { x: 1, y: 1 }, b: { x: 1, y: 1 }, c: { x: 1, y: 1 } }],
    ['NaN vertex', { a: { x: 0, y: 0 }, b: { x: Number.NaN, y: 0 }, c: { x: 0, y: 3 } }],
    ['Infinity vertex', { a: { x: 0, y: 0 }, b: { x: Number.POSITIVE_INFINITY, y: 0 }, c: { x: 0, y: 3 } }],
  ])('%s: false를 반환하고 out을 수정하지 않는다', (_name, triangle) => {
    const out = { x: 7, y: 8 };
    expect(solveTriangleCircumcenter(out, triangle)).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
  });

  test('near-collinear(signedArea2x≠0이지만 raw D 전개는 0): 성공하고 외심이 유한하다', () => {
    // signedArea2x = -1.42e-14(≠0, guard 통과)이지만 raw 좌표 전개 D = 2*(ax*(by-cy)+...)는 0이다.
    // denominator를 guard의 signed area와 같은 전개로 묶지 않으면 division-by-zero로 Infinity를 쓴다.
    const out = point();
    const ok = solveTriangleCircumcenter(out, {
      a: { x: 3.8400211035452747, y: 17.281933327867037 },
      b: { x: 8.156115648087077, y: 31.91817240438104 },
      c: { x: 9.039683586890016, y: 34.91442548901669 },
    });
    expect(ok).toBe(true);
    expect(Number.isFinite(out.x)).toBe(true);
    expect(Number.isFinite(out.y)).toBe(true);
  });

  test('out이 vertex 객체와 같은 참조여도 외심을 정확히 쓴다', () => {
    const expected = point();
    solveTriangleCircumcenter(expected, { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 1, y: 3 } });
    const triangle = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 1, y: 3 } };
    expect(solveTriangleCircumcenter(triangle.a, triangle)).toBe(true);
    expect(triangle.a).toEqual(expected);
  });
});
