import { describe, expect, test } from 'vitest';
import { bezierScalarRaw, cubicBezierRaw, elasticInRaw } from '../../../src/easing/easing-parametric-raw.internal';
import { biasRaw, cliffRaw, logisticNormalizedRaw, seatRaw } from '../../../src/easing/easing-shaping-raw.internal';
import {
  bounceOutRaw,
  circInRaw,
  expoInRaw,
  expoOutRaw,
  powerInRaw,
  sineInRaw,
  sineOutRaw,
} from '../../../src/easing/easing-standard-raw.internal';

// easing.internal 4-group 분할의 behavior-preserving 검증.
// 추출된 raw helper를 직접 import해 분할 전 수식이 산출하는 현재 값으로 golden 고정한다.
// 기존 7개 public-API test는 raw를 간접 커버하므로, 직접 raw 호출 경로를 여기서 명시 고정한다.

describe('easing standard raw helper - golden', () => {
  test('endpoint exact 고정', () => {
    expect(sineInRaw(0)).toBe(0);
    expect(sineOutRaw(1)).toBe(1);
    expect(expoInRaw(0)).toBe(0);
    expect(expoOutRaw(1)).toBe(1);
    expect(circInRaw(0)).toBe(0);
  });

  test('대표 raw 수식 golden', () => {
    expect(powerInRaw(0.5, 2)).toBe(0.25);
    // bounceOut piecewise 마지막 분기에서 t=1은 정확히 1로 수렴한다.
    expect(bounceOutRaw(1)).toBe(1);
  });
});

describe('easing parametric raw helper - golden', () => {
  test('cubicBezierRaw endpoint exact + 중간 t Newton 수렴', () => {
    expect(cubicBezierRaw(0, 0.42, 0, 0.58, 1)).toBe(0);
    expect(cubicBezierRaw(1, 0.42, 0, 0.58, 1)).toBe(1);
    // 대칭 ease-in-out 제어점에서 t=0.5는 0.5로 수렴한다.
    expect(cubicBezierRaw(0.5, 0.42, 0, 0.58, 1)).toBeCloseTo(0.5, 10);
  });

  test('bezierScalarRaw De Casteljau golden (복사본 전달)', () => {
    // bezierScalarRaw는 in-place로 배열을 수정하므로 복사본을 전달한다.
    expect(bezierScalarRaw(0.5, [0, 0.5, 1])).toBe(0.5);
  });

  test('elasticInRaw 중간 t golden', () => {
    expect(elasticInRaw(0.5, 1, 0.3)).toBeCloseTo(-0.015625, 12);
  });
});

describe('easing shaping raw helper - golden', () => {
  test('biasRaw endpoint exact', () => {
    expect(biasRaw(0, 0.3)).toBe(0);
    expect(biasRaw(1, 0.3)).toBe(1);
  });

  test('대표 shaping raw 수식 golden', () => {
    expect(logisticNormalizedRaw(0.5, 2)).toBeCloseTo(0.5, 12);
    expect(seatRaw(0.5, 0.5, 2)).toBe(0.5);
    expect(cliffRaw(0.5, 0.5, 0.2)).toBeCloseTo(0.5, 12);
  });
});
