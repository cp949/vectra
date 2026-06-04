import type { RectLike, RectWritable } from '../types';
import { createRect } from './create-rect';
import { fitOutsideInto } from './fit-outside-into';

/**
 * target의 aspect ratio를 유지하면서 container를 완전히 덮는 rect를 새 plain object로 반환한다.
 *
 * 결과 규칙은 `fitOutsideInto`와 동일하다.
 *
 *
 * degenerate/empty 입력 처리 정책은 `fitOutsideInto`와 동일하다.
 * @param target aspect ratio와 size를 제공하는 source rect. 위치(x/y)는 결과에 반영되지 않는다.
 * @param container 덮을 대상 container rect
 */
export function fitOutside(target: RectLike, container: RectLike): RectWritable {
  return fitOutsideInto(createRect(), target, container);
}
