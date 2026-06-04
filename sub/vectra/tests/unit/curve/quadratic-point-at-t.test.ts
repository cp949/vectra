/**
 * quadraticPointAtT allocating companion unit test.
 *
 * 검증 방법:
 * - quadraticPointAtTInto와 동등한 결과를 새 object로 반환한다.
 * - t=0이면 p0, t=1이면 p2를 반환한다 (endpoint identity).
 * - 호출 시마다 새 reference를 반환한다.
 */

import { describe, expect, it } from 'vitest';
import { quadraticPointAtT } from '../../../src/curve/quadratic-point-at-t';
import { quadraticPointAtTInto } from '../../../src/curve/quadratic-point-at-t-into';

describe('quadraticPointAtT', () => {
  const p0 = { x: 0, y: 0 };
  const p1 = { x: 1, y: 2 };
  const p2 = { x: 4, y: 0 };

  it('quadraticPointAtTInto와 동일한 결과를 반환한다 (t=0.5)', () => {
    const ref = quadraticPointAtTInto({ x: 0, y: 0 }, p0, p1, p2, 0.5);
    const got = quadraticPointAtT(p0, p1, p2, 0.5);
    expect(got).toEqual(ref);
  });

  it('t=0이면 p0의 좌표를 반환한다', () => {
    const got = quadraticPointAtT(p0, p1, p2, 0);
    expect(got.x).toBe(0);
    expect(got.y).toBe(0);
  });

  it('t=1이면 p2의 좌표를 반환한다', () => {
    const got = quadraticPointAtT(p0, p1, p2, 1);
    expect(got.x).toBe(4);
    expect(got.y).toBe(0);
  });

  it('t가 [0,1] 밖이면 외삽 결과를 반환한다 (clamp 없음)', () => {
    // 동등성만 확인. clamp 없는 정책은 Into와 동일해야 한다.
    const ref = quadraticPointAtTInto({ x: 0, y: 0 }, p0, p1, p2, 1.5);
    const got = quadraticPointAtT(p0, p1, p2, 1.5);
    expect(got).toEqual(ref);
  });

  it('호출 시마다 새 object reference를 반환한다', () => {
    const a = quadraticPointAtT(p0, p1, p2, 0.5);
    const b = quadraticPointAtT(p0, p1, p2, 0.5);
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });

  it('반환 object는 plain `{ x, y }`이다', () => {
    const got = quadraticPointAtT(p0, p1, p2, 0.5);
    expect(typeof got.x).toBe('number');
    expect(typeof got.y).toBe('number');
  });
});
