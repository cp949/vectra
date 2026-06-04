import { writeXY } from '../internal/xy';
import type { XYWritable } from '../types';

/**
 * 주어진 각도에 해당하는 unit vector (cos(angle), sin(angle))를 out에 기록하고 out을 반환한다.
 *
 * vec.fromAngle과 mental model이 다른 angle domain equivalent이다.
 * non-finite angle은 RangeError를 던진다.
 *
 * 내부 계산(cos(angle), sin(angle))은 `vec/from-angle-into`와 동일하지만,
 * cross-domain public function import 정책(공개 함수끼리 상호 참조 금지)에 따라
 * 독립 구현한다.
 *
 * @param out 결과를 기록할 writable output
 * @param angle unit vector 방향각(라디안)
 */
export function toUnitVectorInto<Out extends XYWritable>(out: Out, angle: number): Out {
  if (!Number.isFinite(angle)) {
    throw new RangeError('angle arguments must be finite numbers');
  }

  return writeXY(out, Math.cos(angle), Math.sin(angle));
}
