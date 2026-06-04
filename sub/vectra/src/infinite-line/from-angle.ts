import type { InfiniteLineWritable, XYInput } from '../types';
import { createInfiniteLine } from './create-infinite-line';
import { fromAngleInto } from './from-angle-into';

/**
 * `origin`을 기준점으로, radian `angle` 방향 단위 벡터를 direction으로 가진 새 plain object를 반환한다.
 *
 * direction은 `{ x: Math.cos(angle), y: Math.sin(angle) }`이다.
 *
 * `angle = NaN | Infinity | -Infinity` 같은 non-finite 입력은 검증하지 않는다.
 * `Math.cos`/`Math.sin`의 산술 결과(`Math.cos(Infinity) === NaN` 등)가 direction component에 그대로 기록된다.
 *
 * @param origin infinite-line 기준점으로 복사할 좌표
 * @param angle direction 단위 벡터의 radian angle
 */
export function fromAngle(origin: XYInput, angle: number): InfiniteLineWritable {
  return fromAngleInto(createInfiniteLine(), origin, angle);
}
