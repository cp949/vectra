/**
 * cubicClosestPointInto / cubicClosestPoint unit test.
 *
 * 검증 방법:
 * - 직선 cubic Bezier에서 수직 발 위치와 비교한다.
 * - curve 밖의 점에서 endpoint가 최근접점인 경우.
 * - 대칭 case에서 curve 최고점이 최근접점.
 * - out을 반환한다 (Into variant).
 */

import { describe, expect, it } from 'vitest';
import { cubicClosestLocation } from '../../../src/curve/cubic-closest-location';
import { cubicClosestPoint } from '../../../src/curve/cubic-closest-point';
import { cubicClosestPointInto } from '../../../src/curve/cubic-closest-point-into';

function relErr(result: number, expected: number): number {
  if (expected === 0) return Math.abs(result);
  return Math.abs(result - expected) / Math.abs(expected);
}

describe('cubicClosestPointInto', () => {
  it('직선 cubic Bezier에서 수직 발과 일치한다', () => {
    // 직선: p0=(0,0), p1=(10/3,0), p2=(20/3,0), p3=(10,0)
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 10 / 3, y: 0 };
    const p2 = { x: 20 / 3, y: 0 };
    const p3 = { x: 10, y: 0 };
    const out = { x: 0, y: 0 };
    cubicClosestPointInto(out, p0, p1, p2, p3, { x: 5, y: 4 });
    expect(relErr(out.x, 5)).toBeLessThan(1e-5);
    expect(Math.abs(out.y)).toBeLessThan(1e-5);
  });

  it('query가 시작점 너머에 있으면 시작점이 최근접점이다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 3 };
    const p2 = { x: 3, y: 3 };
    const p3 = { x: 4, y: 0 };
    const out = { x: 0, y: 0 };
    cubicClosestPointInto(out, p0, p1, p2, p3, { x: -10, y: 0 });
    expect(relErr(out.x, 0)).toBeLessThan(1e-6);
    expect(relErr(out.y, 0)).toBeLessThan(1e-6);
  });

  it('query가 끝점 너머에 있으면 끝점이 최근접점이다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 3 };
    const p2 = { x: 3, y: 3 };
    const p3 = { x: 4, y: 0 };
    const out = { x: 0, y: 0 };
    cubicClosestPointInto(out, p0, p1, p2, p3, { x: 100, y: 0 });
    expect(relErr(out.x, 4)).toBeLessThan(1e-6);
    expect(relErr(out.y, 0)).toBeLessThan(1e-6);
  });

  it('대칭 cubic에서 중심점 위쪽 query → curve 최고점이 최근접점이다', () => {
    // p0=(0,0), p1=(1,6), p2=(3,6), p3=(4,0): 대칭. t=0.5 → y 최대
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 6 };
    const p2 = { x: 3, y: 6 };
    const p3 = { x: 4, y: 0 };
    // t=0.5: B(0.5) = 0.125*p0 + 0.375*p1 + 0.375*p2 + 0.125*p3
    const expectedX = 0.125 * 0 + 0.375 * 1 + 0.375 * 3 + 0.125 * 4;
    const expectedY = 0.125 * 0 + 0.375 * 6 + 0.375 * 6 + 0.125 * 0;
    const out = { x: 0, y: 0 };
    cubicClosestPointInto(out, p0, p1, p2, p3, { x: expectedX, y: 100 });
    expect(relErr(out.x, expectedX)).toBeLessThan(1e-5);
    expect(relErr(out.y, expectedY)).toBeLessThan(1e-5);
  });

  it('결과 점이 curve 위에 있다 (균등 샘플보다 가깝거나 같다)', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 4 };
    const p2 = { x: 3, y: 4 };
    const p3 = { x: 5, y: 0 };
    const query = { x: 2, y: 3 };
    const out = { x: 0, y: 0 };
    cubicClosestPointInto(out, p0, p1, p2, p3, query);
    const found = Math.hypot(out.x - query.x, out.y - query.y);

    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const mt = 1 - t;
      const bx = mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x;
      const by = mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y;
      const d = Math.hypot(bx - query.x, by - query.y);
      expect(d + 1e-5).toBeGreaterThanOrEqual(found);
    }
  });

  it('out을 반환한다', () => {
    const out = { x: 0, y: 0 };
    const ret = cubicClosestPointInto(
      out,
      { x: 0, y: 0 },
      { x: 1, y: 3 },
      { x: 3, y: 3 },
      { x: 4, y: 0 },
      { x: 2, y: 2 }
    );
    expect(ret).toBe(out);
  });

  it('tuple XYInput을 받는다', () => {
    const out1 = { x: 0, y: 0 };
    const out2 = { x: 0, y: 0 };
    const query = { x: 2, y: 2 };
    cubicClosestPointInto(out1, { x: 0, y: 0 }, { x: 1, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 0 }, query);
    cubicClosestPointInto(out2, [0, 0], [1, 3], [3, 3], [4, 0], [2, 2]);
    expect(Math.abs(out1.x - out2.x)).toBeLessThan(1e-10);
    expect(Math.abs(out1.y - out2.y)).toBeLessThan(1e-10);
  });
});

describe('cubicClosestPoint', () => {
  it('새 {x, y}를 반환한다', () => {
    const result = cubicClosestPoint(
      { x: 0, y: 0 },
      { x: 10 / 3, y: 0 },
      { x: 20 / 3, y: 0 },
      { x: 10, y: 0 },
      { x: 5, y: 4 }
    );
    expect(typeof result.x).toBe('number');
    expect(typeof result.y).toBe('number');
    expect(relErr(result.x, 5)).toBeLessThan(1e-5);
    expect(Math.abs(result.y)).toBeLessThan(1e-5);
  });
});

// S2-RM-020: closest-point Into와 closest-location의 point가 같은 좌표를 반환하는 회귀 검증.
describe('cubicClosestPointInto vs cubicClosestLocation 회귀', () => {
  it('같은 입력에서 같은 좌표를 반환한다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 4 };
    const p2 = { x: 3, y: 4 };
    const p3 = { x: 5, y: 0 };
    const query = { x: 2, y: 3 };
    const out = { x: 0, y: 0 };
    cubicClosestPointInto(out, p0, p1, p2, p3, query);
    const loc = cubicClosestLocation(p0, p1, p2, p3, query);
    expect(Math.abs(out.x - loc.point.x)).toBeLessThan(1e-12);
    expect(Math.abs(out.y - loc.point.y)).toBeLessThan(1e-12);
  });
});
