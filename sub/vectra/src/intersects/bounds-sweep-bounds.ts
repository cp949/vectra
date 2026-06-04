import type { BoundsLike, BoundsSweepDetail, XYInput } from '../types';
import { boundsSweepBoundsInto } from './bounds-sweep-bounds-into';

/**
 * moving bounds를 velocity로 stationary target bounds에 sweep한 time-of-impact를 새 detail object로 반환한다.
 *
 * Minkowski expansion으로 target을 moving bounds half-extent만큼 키운 뒤 moving bounds center를 point로
 * sweep한다. closed-boundary sweep이며 sweep 비율은 `t ∈ [0, 1]`이다. no-hit도 valid result다
 * (`hit: false`, `time: Infinity`, `normal (0, 0)`, `contact (NaN, NaN)`). 시작 시 moving bounds가 target에
 * overlap(closed)이면 start-overlap(`time: 0`, `startOverlap: true`, `normal (0, 0)`)이고 contact는 moving bounds
 * center다. proper hit의 contact는 expanded-space hit point가 아니라 hit 시점 moving bounds center다. zero velocity는
 * 시작 overlap이면 start-overlap, 아니면 no-hit이다. x/y가 같은 time에 진입하는 corner는 x axis normal로 tie를
 * 고정한다. non-finite 입력, empty/inverted moving·target bounds는 no-hit이다.
 * allocating companion — 매 호출 새 detail object와 새 nested normal/contact object를 만든다.
 *
 * @param moving sweep 시작 위치의 moving bounds
 * @param velocity sweep velocity. `t ∈ [0, 1]` 동안 moving bounds가 이동하는 변위
 * @param target sweep 대상 stationary bounds
 */
export function boundsSweepBounds(moving: BoundsLike, velocity: XYInput, target: BoundsLike): BoundsSweepDetail {
  return boundsSweepBoundsInto(
    { hit: false, time: 0, normal: { x: 0, y: 0 }, contact: { x: 0, y: 0 }, startOverlap: false },
    moving,
    velocity,
    target
  );
}
