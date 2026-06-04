import {
  assertElasticAmplitude,
  assertElasticPeriod,
  assertFiniteT,
  ELASTIC_DEFAULT_AMPLITUDE,
  ELASTIC_DEFAULT_PERIOD,
  elasticInOutRaw,
  elasticInRaw,
  elasticOutRaw,
} from './easing.internal';

/**
 * elastic ease-in 함수다.
 *
 * 시작 지점에서 스프링처럼 진동하며 출발한다.
 * t === 0 → 0, t === 1 → 1 (oscillation 공식보다 먼저 처리).
 * amplitude는 finite number이고 >= 1이어야 한다.
 * period는 finite positive number (> 0)이어야 한다.
 *
 * @param t easing progress (보통 [0, 1])
 * @param amplitude 진폭 (기본값 1, >= 1)
 * @param period 진동 주기 (기본값 0.3, > 0)
 */
export function elasticIn(
  t: number,
  amplitude: number = ELASTIC_DEFAULT_AMPLITUDE,
  period: number = ELASTIC_DEFAULT_PERIOD
): number {
  assertFiniteT(t);
  assertElasticAmplitude(amplitude);
  assertElasticPeriod(period);
  if (t === 0) return 0;
  if (t === 1) return 1;
  return elasticInRaw(t, amplitude, period);
}

/**
 * elastic ease-out 함수다.
 *
 * 끝 지점에서 스프링처럼 진동하며 정착한다.
 * t === 0 → 0, t === 1 → 1 (oscillation 공식보다 먼저 처리).
 * amplitude는 finite number이고 >= 1이어야 한다.
 * period는 finite positive number (> 0)이어야 한다.
 *
 * @param t easing progress (보통 [0, 1])
 * @param amplitude 진폭 (기본값 1, >= 1)
 * @param period 진동 주기 (기본값 0.3, > 0)
 */
export function elasticOut(
  t: number,
  amplitude: number = ELASTIC_DEFAULT_AMPLITUDE,
  period: number = ELASTIC_DEFAULT_PERIOD
): number {
  assertFiniteT(t);
  assertElasticAmplitude(amplitude);
  assertElasticPeriod(period);
  if (t === 0) return 0;
  if (t === 1) return 1;
  return elasticOutRaw(t, amplitude, period);
}

/**
 * elastic ease-in-out 함수다.
 *
 * 시작과 끝 양쪽에서 스프링 진동이 발생한다.
 * t === 0 → 0, t === 1 → 1 (oscillation 공식보다 먼저 처리).
 * amplitude는 finite number이고 >= 1이어야 한다.
 * period는 finite positive number (> 0)이어야 한다.
 * inOut에서 period를 1.5배 확장해 대칭 진동을 만든다.
 *
 * @param t easing progress (보통 [0, 1])
 * @param amplitude 진폭 (기본값 1, >= 1)
 * @param period 진동 주기 (기본값 0.3, > 0)
 */
export function elasticInOut(
  t: number,
  amplitude: number = ELASTIC_DEFAULT_AMPLITUDE,
  period: number = ELASTIC_DEFAULT_PERIOD
): number {
  assertFiniteT(t);
  assertElasticAmplitude(amplitude);
  assertElasticPeriod(period);
  if (t === 0) return 0;
  if (t === 1) return 1;
  return elasticInOutRaw(t, amplitude, period);
}
