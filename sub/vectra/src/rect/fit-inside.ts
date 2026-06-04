import type { RectLike, RectWritable } from '../types';
import { createRect } from './create-rect';
import { fitInsideInto } from './fit-inside-into';

/**
 * target의 aspect ratio를 유지하면서 container 내부에 fit한 rect를 새 plain object로 반환한다.
 *
 * 결과 규칙은 `fitInsideInto`와 동일하다.
 *
 *
 * degenerate/empty 입력 처리 정책은 `fitInsideInto`와 동일하다.
 * @param target aspect ratio와 size를 제공하는 source rect. 위치(x/y)는 결과에 반영되지 않는다.
 * @param container fit 대상 container rect
 */
export function fitInside(target: RectLike, container: RectLike): RectWritable {
  return fitInsideInto(createRect(), target, container);
}
