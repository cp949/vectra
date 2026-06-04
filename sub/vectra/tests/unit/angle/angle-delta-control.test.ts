/**
 * angle domain delta, 방향 판정, 근접 판정, 보간, 목표 이동을 검증한다.
 */
import { describe, expect, test } from 'vitest';
import { angleDelta } from '../../../src/angle/angle-delta';
import { directedAngleDelta } from '../../../src/angle/directed-angle-delta';
import { isAngleBetween } from '../../../src/angle/is-angle-between';
import { lerpAngle } from '../../../src/angle/lerp-angle';
import { moveTowardAngle } from '../../../src/angle/move-toward-angle';
import { nearAngle } from '../../../src/angle/near-angle';
import { shortestLerpAngle } from '../../../src/angle/shortest-lerp-angle';
import { turnDirection } from '../../../src/angle/turn-direction';
import { nonFiniteValues } from './_fixtures/angle-fixtures';

describe('angleDelta - shortest delta [-π, π)', () => {
  test('0에서 π/2까지의 delta는 π/2이다', () => {
    expect(angleDelta(0, Math.PI / 2)).toBeCloseTo(Math.PI / 2, 10);
  });

  test('3π/4에서 -3π/4까지의 delta는 π/2이다 (wrap-around)', () => {
    expect(angleDelta(Math.PI * 0.75, -Math.PI * 0.75)).toBeCloseTo(Math.PI / 2, 10);
  });

  test('0에서 0까지의 delta는 0이다', () => {
    expect(angleDelta(0, 0)).toBe(0);
  });

  test('π에서 -π까지의 delta는 0이다 (같은 wrap 위치)', () => {
    // wrapRadians(-π - π) = wrapRadians(-2π) = 0
    expect(angleDelta(Math.PI, -Math.PI)).toBe(0);
  });

  test('0에서 π까지의 delta는 -π이다 (π는 -π로 감긴다)', () => {
    // wrapRadians(π - 0) = wrapRadians(π) = -π (half-open [-π, π))
    expect(angleDelta(0, Math.PI)).toBe(-Math.PI);
  });

  test('0에서 -π까지의 delta는 -π이다', () => {
    expect(angleDelta(0, -Math.PI)).toBe(-Math.PI);
  });

  test('π/2에서 -π/2까지의 delta는 -π이다', () => {
    // wrapRadians(-π/2 - π/2) = wrapRadians(-π) = -π
    expect(angleDelta(Math.PI / 2, -Math.PI / 2)).toBe(-Math.PI);
  });

  test('2π에서 0까지의 delta는 0이다 (2π는 0과 동일)', () => {
    expect(angleDelta(2 * Math.PI, 0)).toBeCloseTo(0, 10);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => angleDelta(value, 0)).toThrow(RangeError);
    expect(() => angleDelta(0, value)).toThrow(RangeError);
  });
});

describe('directedAngleDelta - wrap 없는 signed delta', () => {
  test('π/2에서 0까지의 directed delta는 -π/2이다 (to - from)', () => {
    expect(directedAngleDelta(Math.PI / 2, 0)).toBeCloseTo(-Math.PI / 2, 10);
  });

  test('0에서 2π까지의 directed delta는 2π이다 (wrap 없음)', () => {
    expect(directedAngleDelta(0, 2 * Math.PI)).toBeCloseTo(2 * Math.PI, 10);
  });

  test('3π에서 0까지의 directed delta는 -3π이다', () => {
    expect(directedAngleDelta(3 * Math.PI, 0)).toBeCloseTo(-3 * Math.PI, 10);
  });

  test('같은 값은 0을 반환한다', () => {
    expect(directedAngleDelta(Math.PI / 4, Math.PI / 4)).toBe(0);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => directedAngleDelta(value, 0)).toThrow(RangeError);
    expect(() => directedAngleDelta(0, value)).toThrow(RangeError);
  });
});

describe('turnDirection - 회전 방향 판정', () => {
  test('CCW(양방향) delta가 양수이면 1을 반환한다', () => {
    expect(turnDirection(0, Math.PI / 2)).toBe(1);
  });

  test('CW(음방향) delta가 음수이면 -1을 반환한다', () => {
    expect(turnDirection(Math.PI / 2, 0)).toBe(-1);
  });

  test('같은 angle이면 0을 반환한다', () => {
    expect(turnDirection(Math.PI / 4, Math.PI / 4)).toBe(0);
  });

  test('epsilon 이내 차이면 0을 반환한다', () => {
    const small = 0.001;
    expect(turnDirection(0, small, 0.01)).toBe(0);
  });

  test('epsilon을 초과하면 1을 반환한다', () => {
    const small = 0.1;
    expect(turnDirection(0, small, 0.05)).toBe(1);
  });

  test('delta가 epsilon과 정확히 같으면 0을 반환한다 (inclusive boundary)', () => {
    // angleDelta(0, eps) = eps. eps <= eps 이므로 0이다.
    const eps = 0.05;
    expect(turnDirection(0, eps, eps)).toBe(0);
    expect(turnDirection(0, -eps, eps)).toBe(0);
  });

  test('음수 epsilon은 RangeError를 던진다', () => {
    expect(() => turnDirection(0, 1, -0.01)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => turnDirection(value, 0)).toThrow(RangeError);
    expect(() => turnDirection(0, value)).toThrow(RangeError);
  });
});

describe('nearAngle - wrap 기반 근접 판정', () => {
  test('Math.PI와 -Math.PI는 wrap 기준으로 동일하므로 true이다', () => {
    expect(nearAngle(Math.PI, -Math.PI)).toBe(true);
  });

  test('동일한 angle은 true이다', () => {
    expect(nearAngle(Math.PI / 3, Math.PI / 3)).toBe(true);
  });

  test('epsilon보다 큰 차이면 false이다', () => {
    expect(nearAngle(0, 0.1, 0.05)).toBe(false);
  });

  test('epsilon 이내면 true이다', () => {
    expect(nearAngle(0, 0.001, 0.01)).toBe(true);
  });

  test('epsilon 없이 호출하면 0으로 처리된다', () => {
    // 기본 epsilon은 0이므로 완전히 같은 값만 true
    expect(nearAngle(0, 1e-8)).toBe(false);
    expect(nearAngle(0, 0)).toBe(true);
  });

  test('음수 epsilon은 RangeError를 던진다', () => {
    expect(() => nearAngle(0, 0, -0.01)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => nearAngle(value, 0)).toThrow(RangeError);
    expect(() => nearAngle(0, value)).toThrow(RangeError);
  });
});

describe('isAngleBetween - CCW 호 포함 여부', () => {
  test('start와 end 사이 angle은 true이다', () => {
    expect(isAngleBetween(Math.PI / 4, 0, Math.PI / 2)).toBe(true);
  });

  test('start 경계값은 포함이다 (inclusive)', () => {
    expect(isAngleBetween(0, 0, Math.PI / 2)).toBe(true);
  });

  test('end 경계값은 포함이다 (inclusive)', () => {
    expect(isAngleBetween(Math.PI / 2, 0, Math.PI / 2)).toBe(true);
  });

  test('호 바깥 angle은 false이다', () => {
    expect(isAngleBetween(Math.PI, 0, Math.PI / 2)).toBe(false);
  });

  test('wrap boundary를 넘는 CCW 호: 3π/4에서 π/2까지 CCW에 π가 포함된다', () => {
    // 3π/4에서 π/2까지 CCW 방향으로 sweep하면 π, -π, -π/2, 0, π/2 순으로 지나간다
    // 이 sweep에 π가 포함되어야 한다
    expect(isAngleBetween(Math.PI, (3 * Math.PI) / 4, Math.PI / 2)).toBe(true);
  });

  test('wrap boundary CCW 호에서 0이 포함된다', () => {
    // π에서 π/2까지 CCW: sweep = 3π/2. 경로: π → 3π/2 → 0 → π/2. 0은 포함이다.
    expect(isAngleBetween(0, Math.PI, Math.PI / 2)).toBe(true);
  });

  test('angle - start = π일 때 -π boundary 오판 없이 포함 판정한다', () => {
    // sweep이 π 이상이면 π (= -π와 동일 위치)는 포함이어야 한다
    expect(isAngleBetween(Math.PI, 0, (3 * Math.PI) / 2)).toBe(true);
    // -π는 π와 같은 위치이므로 동일하게 포함이다
    expect(isAngleBetween(-Math.PI, 0, (3 * Math.PI) / 2)).toBe(true);
    // sweep이 π/2이면 π는 호 바깥이다
    expect(isAngleBetween(Math.PI, 0, Math.PI / 2)).toBe(false);
  });

  test('start === end이면 해당 angle만 true이다', () => {
    expect(isAngleBetween(Math.PI / 4, Math.PI / 4, Math.PI / 4)).toBe(true);
    expect(isAngleBetween(0, Math.PI / 4, Math.PI / 4)).toBe(false);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => isAngleBetween(value, 0, Math.PI)).toThrow(RangeError);
    expect(() => isAngleBetween(0, value, Math.PI)).toThrow(RangeError);
    expect(() => isAngleBetween(0, 0, value)).toThrow(RangeError);
  });
});

describe('lerpAngle - 단순 linear 보간', () => {
  test('t=0이면 from을 반환한다', () => {
    expect(lerpAngle(0, Math.PI, 0)).toBe(0);
  });

  test('t=1이면 to를 반환한다', () => {
    expect(lerpAngle(0, Math.PI, 1)).toBeCloseTo(Math.PI, 10);
  });

  test('t=0.5이면 중간값을 반환한다', () => {
    expect(lerpAngle(0, Math.PI, 0.5)).toBeCloseTo(Math.PI / 2, 10);
  });

  test('t < 0 extrapolation을 허용한다', () => {
    // from=0, to=1, t=-1: 0 + (1-0)*(-1) = -1
    expect(lerpAngle(0, 1, -1)).toBeCloseTo(-1, 10);
  });

  test('t > 1 extrapolation을 허용한다', () => {
    // from=0, to=1, t=2: 0 + (1-0)*2 = 2
    expect(lerpAngle(0, 1, 2)).toBeCloseTo(2, 10);
  });

  test('wrap을 적용하지 않는다: from=3π/4, to=-3π/4, t=0.5이면 0이다', () => {
    // 단순 lerp: 3π/4 + (-3π/4 - 3π/4) * 0.5 = 3π/4 - 3π/4 = 0
    expect(lerpAngle((3 * Math.PI) / 4, (-3 * Math.PI) / 4, 0.5)).toBeCloseTo(0, 10);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => lerpAngle(value, 0, 0.5)).toThrow(RangeError);
    expect(() => lerpAngle(0, value, 0.5)).toThrow(RangeError);
    expect(() => lerpAngle(0, 1, value)).toThrow(RangeError);
  });
});

describe('shortestLerpAngle - shortest path circular 보간', () => {
  test('t=0이면 from을 반환한다', () => {
    expect(shortestLerpAngle(0, Math.PI / 2, 0)).toBe(0);
  });

  test('t=1이면 to와 같은 wrap 위치를 반환한다', () => {
    // from=0, to=π/2: angleDelta(0, π/2)=π/2, result=0+π/2=π/2
    expect(shortestLerpAngle(0, Math.PI / 2, 1)).toBeCloseTo(Math.PI / 2, 10);
  });

  test('shortest path로 보간한다: 3π/4에서 -3π/4까지 t=0.5', () => {
    // angleDelta(3π/4, -3π/4) = wrapRadians(-3π/2) = π/2
    // result = 3π/4 + π/2 * 0.5 = 3π/4 + π/4 = π
    // 하지만 π는 wrapRadians 기준 -π와 같으므로 결과값은 π (raw, wrap 안 함)
    expect(shortestLerpAngle((3 * Math.PI) / 4, (-3 * Math.PI) / 4, 0.5)).toBeCloseTo(Math.PI, 10);
  });

  test('t < 0 extrapolation을 허용한다', () => {
    // from=0, to=π/4: angleDelta=π/4, t=-1: 0 + π/4*(-1) = -π/4
    expect(shortestLerpAngle(0, Math.PI / 4, -1)).toBeCloseTo(-Math.PI / 4, 10);
  });

  test('t > 1 extrapolation을 허용한다', () => {
    // from=0, to=π/4: angleDelta=π/4, t=2: 0 + π/4*2 = π/2
    expect(shortestLerpAngle(0, Math.PI / 4, 2)).toBeCloseTo(Math.PI / 2, 10);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => shortestLerpAngle(value, 0, 0.5)).toThrow(RangeError);
    expect(() => shortestLerpAngle(0, value, 0.5)).toThrow(RangeError);
    expect(() => shortestLerpAngle(0, 1, value)).toThrow(RangeError);
  });
});

describe('moveTowardAngle - 목표 방향 이동', () => {
  test('delta가 maxDelta 이내면 target을 반환한다', () => {
    expect(moveTowardAngle(0, Math.PI / 4, Math.PI)).toBe(Math.PI / 4);
  });

  test('delta가 maxDelta와 정확히 같으면 target을 반환한다', () => {
    expect(moveTowardAngle(0, Math.PI / 4, Math.PI / 4)).toBe(Math.PI / 4);
  });

  test('delta가 maxDelta 초과이면 shortest direction으로 maxDelta 이동한다', () => {
    // from=0, target=π/2, maxDelta=π/4: CCW 방향으로 π/4 이동 → π/4
    expect(moveTowardAngle(0, Math.PI / 2, Math.PI / 4)).toBeCloseTo(Math.PI / 4, 10);
  });

  test('shortest direction으로 이동한다 (CW가 더 짧을 때)', () => {
    // from=0, target=-π/4, maxDelta=π/8: angleDelta(0,-π/4)=-π/4, CW 방향 → -π/8
    expect(moveTowardAngle(0, -Math.PI / 4, Math.PI / 8)).toBeCloseTo(-Math.PI / 8, 10);
  });

  test('wrap-around를 올바르게 처리한다', () => {
    // from=3π/4, target=-3π/4: angleDelta=π/2 (CCW), maxDelta=π/4
    // 3π/4 + π/4 = π
    expect(moveTowardAngle((3 * Math.PI) / 4, (-3 * Math.PI) / 4, Math.PI / 4)).toBeCloseTo(Math.PI, 10);
  });

  test('maxDelta=0이면 current를 그대로 반환한다', () => {
    expect(moveTowardAngle(Math.PI / 4, Math.PI / 2, 0)).toBeCloseTo(Math.PI / 4, 10);
  });

  test('target이 정확히 π 반대편일 때 angleDelta의 tie-break 방향으로 이동한다', () => {
    // angleDelta(0, π) = -π ([-π,π) half-open 경계). CW 방향으로 이동한다.
    expect(moveTowardAngle(0, Math.PI, Math.PI / 4)).toBeCloseTo(-Math.PI / 4, 10);
  });

  test('음수 maxDelta는 RangeError를 던진다', () => {
    expect(() => moveTowardAngle(0, 1, -0.1)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => moveTowardAngle(value, 0, 0.1)).toThrow(RangeError);
    expect(() => moveTowardAngle(0, value, 0.1)).toThrow(RangeError);
    expect(() => moveTowardAngle(0, 1, value)).toThrow(RangeError);
  });
});
