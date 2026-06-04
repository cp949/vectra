/**
 * quadraticClosestPointInto / quadraticClosestPoint unit test.
 *
 * 검증 방법:
 * - 직선 Bezier에서 수직 발(foot) 위치와 비교한다.
 * - curve 밖의 점에서 endpoint가 최근접점인 경우.
 * - 대칭 case에서 t=0.5 위치 점이 최근접점.
 * - out을 반환한다 (Into variant).
 */

import { describe, expect, it } from 'vitest';
import { quadraticClosestLocation } from '../../../src/curve/quadratic-closest-location';
import { quadraticClosestPoint } from '../../../src/curve/quadratic-closest-point';
import { quadraticClosestPointInto } from '../../../src/curve/quadratic-closest-point-into';

function relErr(result: number, expected: number): number {
  if (expected === 0) return Math.abs(result);
  return Math.abs(result - expected) / Math.abs(expected);
}

describe('quadraticClosestPointInto', () => {
  it('직선 Bezier에서 수직 발과 일치한다', () => {
    // p0=(0,0) p1=(5,0) p2=(10,0): 직선. query=(5,3) → 발=(5,0)
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 5, y: 0 };
    const p2 = { x: 10, y: 0 };
    const out = { x: 0, y: 0 };
    quadraticClosestPointInto(out, p0, p1, p2, { x: 5, y: 3 });
    expect(relErr(out.x, 5)).toBeLessThan(1e-6);
    expect(Math.abs(out.y)).toBeLessThan(1e-6);
  });

  it('query가 curve 시작점 너머에 있으면 시작점이 최근접점이다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 2 };
    const p2 = { x: 4, y: 0 };
    const out = { x: 0, y: 0 };
    quadraticClosestPointInto(out, p0, p1, p2, { x: -10, y: 0 });
    expect(relErr(out.x, 0)).toBeLessThan(1e-6);
    expect(relErr(out.y, 0)).toBeLessThan(1e-6);
  });

  it('query가 curve 끝점 너머에 있으면 끝점이 최근접점이다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 2 };
    const p2 = { x: 4, y: 0 };
    const out = { x: 0, y: 0 };
    quadraticClosestPointInto(out, p0, p1, p2, { x: 100, y: 0 });
    expect(relErr(out.x, 4)).toBeLessThan(1e-6);
    expect(relErr(out.y, 0)).toBeLessThan(1e-6);
  });

  it('대칭 curve에서 중심점 위쪽 query → curve 최고점이 최근접점이다', () => {
    // p0=(0,0) p1=(2,4) p2=(4,0): 대칭 포물선. t=0.5 → (2,2). query=(2,10)
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 2, y: 4 };
    const p2 = { x: 4, y: 0 };
    const out = { x: 0, y: 0 };
    quadraticClosestPointInto(out, p0, p1, p2, { x: 2, y: 10 });
    expect(relErr(out.x, 2)).toBeLessThan(1e-5);
    expect(relErr(out.y, 2)).toBeLessThan(1e-5);
  });

  it('결과 점이 curve 위에 있다 (squared distance가 최소)', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 3 };
    const p2 = { x: 5, y: 1 };
    const query = { x: 2, y: 2 };
    const out = { x: 0, y: 0 };
    quadraticClosestPointInto(out, p0, p1, p2, query);
    const found = Math.hypot(out.x - query.x, out.y - query.y);

    // t를 균등 샘플링해서 더 가까운 점이 없는지 확인
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const mt = 1 - t;
      const bx = mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x;
      const by = mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y;
      const d = Math.hypot(bx - query.x, by - query.y);
      expect(d + 1e-6).toBeGreaterThanOrEqual(found);
    }
  });

  it('out을 반환한다', () => {
    const out = { x: 0, y: 0 };
    const ret = quadraticClosestPointInto(out, { x: 0, y: 0 }, { x: 1, y: 2 }, { x: 4, y: 0 }, { x: 2, y: 1 });
    expect(ret).toBe(out);
  });

  it('tuple XYInput을 받는다', () => {
    const out1 = { x: 0, y: 0 };
    const out2 = { x: 0, y: 0 };
    const query = { x: 3, y: 2 };
    quadraticClosestPointInto(out1, { x: 0, y: 0 }, { x: 2, y: 3 }, { x: 4, y: 0 }, query);
    quadraticClosestPointInto(out2, [0, 0], [2, 3], [4, 0], [3, 2]);
    expect(Math.abs(out1.x - out2.x)).toBeLessThan(1e-10);
    expect(Math.abs(out1.y - out2.y)).toBeLessThan(1e-10);
  });
});

describe('quadraticClosestPoint', () => {
  it('새 {x, y}를 반환한다', () => {
    const result = quadraticClosestPoint({ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 10, y: 0 }, { x: 5, y: 3 });
    expect(typeof result.x).toBe('number');
    expect(typeof result.y).toBe('number');
    expect(relErr(result.x, 5)).toBeLessThan(1e-6);
    expect(Math.abs(result.y)).toBeLessThan(1e-6);
  });
});

// S2-RM-020: closest-point Into와 closest-location의 point가 같은 좌표를 반환하는 회귀 검증.
describe('quadraticClosestPointInto vs quadraticClosestLocation 회귀', () => {
  it('같은 입력에서 같은 좌표를 반환한다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 3 };
    const p2 = { x: 5, y: 1 };
    const query = { x: 2, y: 2 };
    const out = { x: 0, y: 0 };
    quadraticClosestPointInto(out, p0, p1, p2, query);
    const loc = quadraticClosestLocation(p0, p1, p2, query);
    expect(Math.abs(out.x - loc.point.x)).toBeLessThan(1e-12);
    expect(Math.abs(out.y - loc.point.y)).toBeLessThan(1e-12);
  });
});
