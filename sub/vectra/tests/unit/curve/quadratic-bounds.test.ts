/**
 * quadraticBounds allocating companion unit test.
 *
 * 검증 방법:
 * - quadraticBoundsInto와 동등한 결과를 새 object로 반환한다.
 * - degenerate case(collinear 3점)에서 extrema가 endpoints에 갇힌다.
 * - 호출 시마다 새 reference를 반환하고 min/max도 별도 object다.
 */

import { describe, expect, it } from 'vitest';
import { quadraticBounds } from '../../../src/curve/quadratic-bounds';
import { quadraticBoundsInto } from '../../../src/curve/quadratic-bounds-into';

describe('quadraticBounds', () => {
  it('quadraticBoundsInto와 동일한 결과를 반환한다 (interior extrema 포함)', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 5, y: 10 };
    const p2 = { x: 10, y: 0 };
    const ref = quadraticBoundsInto({ min: { x: 0, y: 0 }, max: { x: 0, y: 0 } }, p0, p1, p2);
    const got = quadraticBounds(p0, p1, p2);
    expect(got).toEqual(ref);
  });

  it('collinear 3점이면 endpoints가 곧 min/max이다 (interior extrema 없음)', () => {
    // p1이 p0, p2를 잇는 직선 위에 있으면 extrema가 endpoint와 일치한다.
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 5, y: 0 };
    const p2 = { x: 10, y: 0 };
    const got = quadraticBounds(p0, p1, p2);
    expect(got.min.x).toBe(0);
    expect(got.min.y).toBe(0);
    expect(got.max.x).toBe(10);
    expect(got.max.y).toBe(0);
  });

  it('호출 시마다 새 object reference를 반환한다 (min/max도 분리)', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 5, y: 10 };
    const p2 = { x: 10, y: 0 };
    const a = quadraticBounds(p0, p1, p2);
    const b = quadraticBounds(p0, p1, p2);
    expect(a).not.toBe(b);
    expect(a.min).not.toBe(b.min);
    expect(a.max).not.toBe(b.max);
    expect(a).toEqual(b);
  });

  it('반환 bounds는 plain `{ x, y }` 두 corner를 포함한다', () => {
    const got = quadraticBounds({ x: 0, y: 0 }, { x: 1, y: 2 }, { x: 4, y: 0 });
    expect(typeof got.min.x).toBe('number');
    expect(typeof got.min.y).toBe('number');
    expect(typeof got.max.x).toBe('number');
    expect(typeof got.max.y).toBe('number');
  });
});
