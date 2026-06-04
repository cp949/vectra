import type { InfiniteLineWritable, XYInput } from '../types';
import { createInfiniteLine } from './create-infinite-line';
import { fromNormalInto } from './from-normal-into';

/**
 * `origin`을 기준점으로, `normal`에 수직인 direction을 가진 새 plain object를 반환한다.
 *
 * `direction = { x: -normal.y, y: normal.x }`로 기록한다 (y-up 수학 관례에서 normal을 좌측으로 90도 회전).
 * `normal`은 normalize하지 않는다. caller가 unit normal을 전달하지 않으면 direction도 같은 scale을 가진다.
 *
 * zero normal(`{ x: 0, y: 0 }`)은 degenerate direction(`{ x: 0, y: 0 }`)을 기록한다.
 *
 * non-finite normal component는 검증하지 않고 산술 결과를 그대로 direction에 기록한다.
 *
 * @param origin infinite-line 기준점으로 복사할 좌표
 * @param normal 직선에 수직인 normal vector. normalize되어 있을 필요는 없다
 */
export function fromNormal(origin: XYInput, normal: XYInput): InfiniteLineWritable {
  return fromNormalInto(createInfiniteLine(), origin, normal);
}
