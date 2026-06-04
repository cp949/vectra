import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';
import { assertFiniteNumbers } from './interpolation.internal';

/**
 * current를 target 방향으로 최대 maxDistance만큼 이동한 좌표를 out에 기록하고 out을 반환한다.
 *
 * euclidean distance가 maxDistance 이하이면 target을 out에 복사한다.
 * `current`와 `target`이 같은 좌표(distance === 0)이면 target을 out에 복사한다.
 * `maxDistance === 0`은 유효하며 current를 그대로 out에 복사한다.
 * `maxDistance < 0`이면 RangeError를 던진다.
 * 모든 input의 x/y와 maxDistance는 finite number여야 한다.
 * out이 current 또는 target과 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 writable output
 * @param current 이동 시작 좌표
 * @param target 이동 목표 좌표
 * @param maxDistance 최대 이동 거리. 0 이상의 finite number여야 한다.
 */
export function moveTowardPointInto<Out extends XYWritable>(
  out: Out,
  current: XYInput,
  target: XYInput,
  maxDistance: number
): Out {
  const cx = readX(current);
  const cy = readY(current);
  const tx = readX(target);
  const ty = readY(target);
  assertFiniteNumbers([cx, cy, tx, ty, maxDistance]);

  if (maxDistance < 0) {
    throw new RangeError('moveTowardPoint maxDistance must be non-negative');
  }

  const dx = tx - cx;
  const dy = ty - cy;

  // sqrt로 비교: distSq × maxDistance² 비교는 두 값이 모두 Infinity로 overflow하면 틀린 결론을 낸다
  const dist = Math.hypot(dx, dy);

  // distance가 maxDistance 이하이면 target에 도달한다 (distance === 0 포함)
  if (dist <= maxDistance) {
    return writeXY(out, tx, ty);
  }

  // target 방향 단위 벡터로 maxDistance만큼 이동한다
  return writeXY(out, cx + (dx / dist) * maxDistance, cy + (dy / dist) * maxDistance);
}
