/**
 * quadraticBounds가 quadraticBoundsInto와 같은 경계 상자를 새 객체로 돌려주는지 검증한다.
 * 같은 직선 위 세 점이면 끝점이 곧 경계다.
 */
import { flatQuadraticFromLegacyPoints } from '../_helpers/curve-fixtures';
import { describe, expect, it } from 'vitest';
import { quadraticBounds } from '../../../src/curve/quadratic-bounds';
import { quadraticBoundsInto } from '../../../src/curve/quadratic-bounds-into';

describe('quadraticBounds', () => {
  it('quadraticBoundsInto와 동일한 결과를 반환한다 (interior extrema 포함)', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 5, y: 10 };
    const p2 = { x: 10, y: 0 };
    const ref = quadraticBoundsInto({ minX: 0, minY: 0, maxX: 0, maxY: 0 }, flatQuadraticFromLegacyPoints(p0, p1, p2));
    const got = quadraticBounds(flatQuadraticFromLegacyPoints(p0, p1, p2));
    expect(got).toEqual(ref);
  });

  it('collinear 3점이면 endpoints가 곧 min/max이다 (interior extrema 없음)', () => {
    // p1이 p0, p2를 잇는 직선 위에 있으면 extrema가 endpoint와 일치한다.
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 5, y: 0 };
    const p2 = { x: 10, y: 0 };
    const got = quadraticBounds(flatQuadraticFromLegacyPoints(p0, p1, p2));
    expect(got.minX).toBe(0);
    expect(got.minY).toBe(0);
    expect(got.maxX).toBe(10);
    expect(got.maxY).toBe(0);
  });

  it('호출 시마다 새 object reference를 반환한다 (min/max도 분리)', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 5, y: 10 };
    const p2 = { x: 10, y: 0 };
    const a = quadraticBounds(flatQuadraticFromLegacyPoints(p0, p1, p2));
    const b = quadraticBounds(flatQuadraticFromLegacyPoints(p0, p1, p2));
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });

  it('반환 bounds는 plain `{ x, y }` 두 corner를 포함한다', () => {
    const got = quadraticBounds({ kind: 'quadratic', x0: 0, y0: 0, x1: 1, y1: 2, x2: 4, y2: 0 });
    expect(typeof got.minX).toBe('number');
    expect(typeof got.minY).toBe('number');
    expect(typeof got.maxX).toBe('number');
    expect(typeof got.maxY).toBe('number');
  });
});
