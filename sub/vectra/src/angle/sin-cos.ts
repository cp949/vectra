import { sinCosInto } from './sin-cos-into';

/**
 * angle의 sin/cos 값을 담은 새 object를 반환한다.
 *
 * non-finite angle은 RangeError를 던진다.
 *
 * @param angle sin/cos를 계산할 각도(라디안)
 */
export function sinCos(angle: number): { sin: number; cos: number } {
  return sinCosInto({ sin: 0, cos: 0 }, angle);
}
