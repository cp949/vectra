import { moveTowardPointInto } from '../interpolation/move-toward-point-into';
import type { XYInput, XYWritable } from '../types';

/**
 * current 벡터를 target 방향으로 최대 maxDistance만큼 이동한 벡터를 out에 기록하고 out을 반환한다.
 *
 * `interpolation.moveTowardPointInto`와 동일한 계산 및 정책을 사용하는 vec 도메인 alias다.
 * `maxDistance < 0`이면 RangeError를 던진다.
 * 모든 input의 x/y와 maxDistance는 finite number여야 한다.
 * out이 current 또는 target과 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 writable output
 * @param current 이동 시작 벡터
 * @param target 이동 목표 벡터
 * @param maxDistance 최대 이동 거리. 0 이상의 finite number여야 한다.
 */
export function moveTowardInto<Out extends XYWritable>(
  out: Out,
  current: XYInput,
  target: XYInput,
  maxDistance: number
): Out {
  return moveTowardPointInto(out, current, target, maxDistance);
}
