/**
 * angle domain sector containment helper(`sectorContains`)를 검증한다.
 */
import { describe, expect, test } from 'vitest';
import { sectorContains } from '../../../src/angle/sector-contains';
import { nonFiniteValues } from './_fixtures/angle-fixtures';

describe('sectorContains - sector 호 포함 여부', () => {
  test('기본 방향 ccw: start와 end 사이 angle은 true이다', () => {
    expect(sectorContains(Math.PI / 4, 0, Math.PI / 2)).toBe(true);
  });

  test('기본 방향 ccw: 호 바깥 angle은 false이다', () => {
    expect(sectorContains(Math.PI, 0, Math.PI / 2)).toBe(false);
  });

  test('explicit cw: ccw에서 바깥인 angle이 cw sector에 포함된다', () => {
    // 0에서 π/2까지 cw 방향 sweep은 3π/2. 7π/4는 cw 경로 위에 있다.
    expect(sectorContains((7 * Math.PI) / 4, 0, Math.PI / 2, 'cw')).toBe(true);
  });

  test('explicit cw: cw 경로 밖 angle은 false이다', () => {
    // 0에서 π/2까지 cw sweep 3π/2 경로에 π/4는 없다.
    expect(sectorContains(Math.PI / 4, 0, Math.PI / 2, 'cw')).toBe(false);
  });

  test('wrap-around: start > end ccw 호가 0을 포함한다', () => {
    // π에서 π/2까지 ccw sweep = 3π/2. 경로: π → 3π/2 → 0 → π/2. 0은 포함이다.
    expect(sectorContains(0, Math.PI, Math.PI / 2)).toBe(true);
  });

  test('wrap-around: cw 호가 0을 가로질러 포함한다', () => {
    // π/2에서 π까지 cw sweep = 3π/2. 경로: π/2 → 0 → 3π/2 → π. 0과 7π/4는 포함이다.
    expect(sectorContains(0, Math.PI / 2, Math.PI, 'cw')).toBe(true);
    expect(sectorContains((7 * Math.PI) / 4, Math.PI / 2, Math.PI, 'cw')).toBe(true);
    // 3π/4는 cw 경로(긴 호) 밖, ccw 짧은 호 (π/2, π) 안이라 false이다.
    expect(sectorContains((3 * Math.PI) / 4, Math.PI / 2, Math.PI, 'cw')).toBe(false);
  });

  test('start 경계값은 포함이다 (inclusive)', () => {
    expect(sectorContains(0, 0, Math.PI / 2)).toBe(true);
    expect(sectorContains(0, 0, Math.PI / 2, 'cw')).toBe(true);
  });

  test('start와 full-turn equivalent인 angle은 start 경계로 포함이다', () => {
    expect(sectorContains(2 * Math.PI, 0, Math.PI / 2)).toBe(true);
    expect(sectorContains(-2 * Math.PI, 0, Math.PI / 2, 'cw')).toBe(true);
  });

  test('end 경계값은 포함이다 (inclusive)', () => {
    expect(sectorContains(Math.PI / 2, 0, Math.PI / 2)).toBe(true);
    expect(sectorContains(Math.PI / 2, 0, Math.PI / 2, 'cw')).toBe(true);
  });

  test('end와 full-turn equivalent인 angle은 end 경계로 포함이다', () => {
    expect(sectorContains((5 * Math.PI) / 2, 0, Math.PI / 2)).toBe(true);
    expect(sectorContains((-3 * Math.PI) / 2, 0, Math.PI / 2, 'cw')).toBe(true);
  });

  test('end가 start의 full-turn equivalent이면 sweep이 0인 zero-sweep이다', () => {
    // end - start = 2π → sweep 0. start 위치만 포함한다.
    expect(sectorContains(0, 0, 2 * Math.PI)).toBe(true);
    expect(sectorContains(Math.PI / 4, 0, 2 * Math.PI)).toBe(false);
  });

  test('zero-sweep: start === end이면 해당 angle만 true이다', () => {
    expect(sectorContains(Math.PI / 4, Math.PI / 4, Math.PI / 4)).toBe(true);
    expect(sectorContains(0, Math.PI / 4, Math.PI / 4)).toBe(false);
  });

  test('zero-sweep은 full circle로 해석하지 않는다 (cw도 동일)', () => {
    expect(sectorContains(Math.PI / 4, Math.PI / 4, Math.PI / 4, 'cw')).toBe(true);
    expect(sectorContains(Math.PI, Math.PI / 4, Math.PI / 4, 'cw')).toBe(false);
  });

  test('cw에서 end가 full-turn equivalent이면 zero-sweep이다', () => {
    // end - start = 2π → cw sweep도 0. start 위치만 포함한다.
    expect(sectorContains(0, 0, 2 * Math.PI, 'cw')).toBe(true);
    expect(sectorContains(Math.PI / 4, 0, 2 * Math.PI, 'cw')).toBe(false);
  });

  test('invalid direction은 RangeError를 던진다', () => {
    // @ts-expect-error invalid direction 런타임 검증
    expect(() => sectorContains(0, 0, Math.PI / 2, 'up')).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 angle %s는 RangeError를 던진다', (value) => {
    expect(() => sectorContains(value, 0, Math.PI / 2)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 start %s는 RangeError를 던진다', (value) => {
    expect(() => sectorContains(0, value, Math.PI / 2)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 end %s는 RangeError를 던진다', (value) => {
    expect(() => sectorContains(0, 0, value)).toThrow(RangeError);
  });
});
