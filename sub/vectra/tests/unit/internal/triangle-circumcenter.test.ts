/**
 * solveTriangleCircumcenter kernel 단위 테스트.
 *
 * triangle circumcenter 계열 6개 leaf가 공유하는 kernel의 interface를 직접 검증한다.
 * 외심 값, degenerate/non-finite 실패 시 out 불변,
 * near-collinear에서 "성공 ⇒ 유한" 계약을 다룬다.
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
    const ok = solveTriangleCircumcenter(out, { x1: 0, y1: 0, x2: 4, y2: 0, x3: 0, y3: 3 });
    expect(ok).toBe(true);
    expect(out.x).toBeCloseTo(2, 12);
    expect(out.y).toBeCloseTo(1.5, 12);
  });

  test('vertex 순서를 뒤집어 방향(CW/CCW)이 바뀌어도 외심은 같다', () => {
    const ccw = point();
    const cw = point();
    solveTriangleCircumcenter(ccw, { x1: 0, y1: 0, x2: 4, y2: 0, x3: 1, y3: 3 });
    solveTriangleCircumcenter(cw, { x1: 1, y1: 3, x2: 4, y2: 0, x3: 0, y3: 0 });
    expect(cw.x).toBeCloseTo(ccw.x, 12);
    expect(cw.y).toBeCloseTo(ccw.y, 12);
  });

  test.each([
    ['collinear', { x1: 0, y1: 0, x2: 2, y2: 0, x3: 4, y3: 0 }],
    ['세 vertex가 한 점', { x1: 1, y1: 1, x2: 1, y2: 1, x3: 1, y3: 1 }],
    ['NaN vertex', { x1: 0, y1: 0, x2: Number.NaN, y2: 0, x3: 0, y3: 3 }],
    ['Infinity vertex', { x1: 0, y1: 0, x2: Number.POSITIVE_INFINITY, y2: 0, x3: 0, y3: 3 }],
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
      x1: 3.8400211035452747,
      y1: 17.281933327867037,
      x2: 8.156115648087077,
      y2: 31.91817240438104,
      x3: 9.039683586890016,
      y3: 34.91442548901669,
    });
    expect(ok).toBe(true);
    expect(Number.isFinite(out.x)).toBe(true);
    expect(Number.isFinite(out.y)).toBe(true);
  });
});
