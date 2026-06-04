import { positiveModulo } from './range.internal';

/**
 * 호출자가 finite t와 length > 0을 보장한 상태에서 [0, length) phase를 반환한다.
 *
 * positive modulo를 사용하므로 음수 t도 양수 phase로 보정한다. 결과의 -0은 0으로 정규화한다.
 */
export function periodicPhase(t: number, length: number): number {
  return positiveModulo(t, length);
}

/**
 * 호출자가 finite t, length > 0, 2 * length가 finite임을 보장한 상태에서 ping-pong fold 결과를 반환한다.
 *
 * `[0, length]` 범위를 왕복한다. boundary는 `0`, `length`, `0` 순서로 반복한다.
 */
export function periodicPingPong(t: number, length: number): number {
  const period = 2 * length;
  const phase = positiveModulo(t, period);

  return phase <= length ? phase : period - phase;
}
