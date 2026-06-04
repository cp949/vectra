import type { BoundsLike, BoundsSweepDetail, XYInput } from '../types';
import { boundsSweepPointInto } from './bounds-sweep-point-into';

/**
 * moving point를 velocity로 stationary target bounds에 sweep한 time-of-impact를 새 detail object로 반환한다.
 *
 * closed-boundary sweep이며 sweep 비율은 `t ∈ [0, 1]`이다. no-hit도 valid result다
 * (`hit: false`, `time: Infinity`, `normal (0, 0)`, `contact (NaN, NaN)`). 시작 시 point가 target에
 * overlap(closed)이면 start-overlap(`time: 0`, `startOverlap: true`, `normal (0, 0)`)이고 contact는 moving
 * point 자체다. zero velocity는 시작 overlap이면 start-overlap, 아니면 no-hit이다. proper hit은 마지막으로
 * 진입한 axis의 outward normal과 hit 시점 point 좌표를 기록하고, x/y가 같은 time에 진입하는 corner는 x axis
 * normal로 tie를 고정한다. non-finite point/velocity/target, empty/inverted target은 no-hit이다.
 * allocating companion — 매 호출 새 detail object와 새 nested normal/contact object를 만든다.
 *
 * @param point sweep 시작 위치의 moving point
 * @param velocity sweep velocity. `t ∈ [0, 1]` 동안 point가 이동하는 변위
 * @param target sweep 대상 stationary bounds
 */
export function boundsSweepPoint(point: XYInput, velocity: XYInput, target: BoundsLike): BoundsSweepDetail {
  return boundsSweepPointInto(
    { hit: false, time: 0, normal: { x: 0, y: 0 }, contact: { x: 0, y: 0 }, startOverlap: false },
    point,
    velocity,
    target
  );
}
