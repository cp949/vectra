import type { RectLike } from '../types';
import { pointInRectOutsideInto } from './point-in-rect-outside-into';
import type { RandomSource } from './random';

/**
 * outer rect 내부이면서 inner rect 밖인 영역의 무작위 점을 새 object로 반환한다.
 *
 * 영역을 top/bottom/left/right slab으로 분해해 면적 비례로 직접 선택한다. rejection loop는 쓰지 않는다.
 *
 * 다음이면 undefined를 반환하며 RNG도 소비하지 않는다.
 * - outer가 positive-area rect가 아니다 (`width <= 0 || height <= 0`).
 * - inner dimension이 음수다 (malformed hole, 자동 clip하지 않음).
 * - inner가 outer에 완전히 포함되지 않는다.
 * - inner가 outer를 덮어 outside area가 0이거나 area 합계가 non-finite다.
 *
 * 성공 시 RNG를 slab 선택 1회 + slab 내부 x/y 2회로 총 3회 소비한다. empty inner(dimension 0)는
 * outer 전체 2D uniform이 되며 이때도 3회를 소비한다. `rng` 반환값은 `[0, 1)` finite로 가정하고
 * clamp/normalize하지 않는다.
 *
 * @param outer sampling 영역의 바깥 rect
 * @param inner 제외할 안쪽 rect. outer에 완전히 포함되어야 한다
 * @param rng 난수 생성 함수. 생략하면 default entropy source를 사용한다
 */
export function pointInRectOutside(
  outer: RectLike,
  inner: RectLike,
  rng?: RandomSource
): { x: number; y: number } | undefined {
  const out = { x: 0, y: 0 };
  return pointInRectOutsideInto(out, outer, inner, rng) ? out : undefined;
}
