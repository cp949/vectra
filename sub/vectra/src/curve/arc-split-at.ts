import type { CenterArcLike, CenterArcWritable } from '../types';
import { arcSplitAtInto } from './arc-split-at-into';

/**
 * center form arc를 normalized t 위치에서 분할한 새 CenterArcWritable[] 배열(길이 2)을 반환한다.
 *
 * 두 segment는 원본 centerArc의 cx, cy, rx, ry, xRotation, sweep을 그대로 보존하고
 * startAngle/endAngle만 분할 angle로 갱신한다.
 * 분할 angle은 startAngle + (endAngle - startAngle) * clampedT다.
 * t는 [0, 1]로 clamp한다. t <= 0이면 첫 segment가 zero-sweep(startAngle..startAngle), 둘째 segment가 원본 angle 범위다.
 * t >= 1이면 첫 segment가 원본 angle 범위, 둘째 segment가 zero-sweep(endAngle..endAngle)이다.
 * +Infinity는 1, -Infinity는 0으로 흡수된다.
 * t가 NaN이면 clamp 비교에 걸리지 않고 분할 angle이 NaN이 된다(non-finite pass-through).
 * degenerate radius(rx <= 0 또는 ry <= 0)와 zero-sweep arc도 실패로 보지 않고 동일한 angle 분할 구조를 반환한다.
 * 반환 segment object는 새 plain object다. 입력 centerArc object를 재사용하지 않는다.
 * 성능 최적화가 필요하면 `arcSplitAtInto`를 사용한다.
 *
 * @param centerArc center form arc input
 * @param t 분할 위치 ([0, 1]로 clamp, NaN은 분할 angle을 NaN으로 보존)
 * @returns 새로 만든 길이 2 CenterArcWritable 배열
 */
export function arcSplitAt(centerArc: CenterArcLike, t: number): CenterArcWritable[] {
  return arcSplitAtInto([], centerArc, t);
}
