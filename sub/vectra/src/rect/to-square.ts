import type { RectLike, RectWritable } from '../types';
import { createRect } from './create-rect';
import { toSquareInto } from './to-square-into';

/**
 * rect를 정사각형으로 변환한 결과를 새 plain object로 반환한다.
 *
 * 결과 규칙은 `toSquareInto`와 동일하다. 기본 mode는 `'min'`이다.
 *
 *
 * finite/non-finite 입력과 결과 처리 정책은 `toSquareInto`와 동일하다.
 * degenerate/empty 입력 처리 정책은 `toSquareInto`와 동일하다.
 * @param rect 변환할 source rect
 * @param mode 'min'은 짧은 변 길이, 'max'는 긴 변 길이를 한 변으로 사용한다. 기본값 'min'.
 */
export function toSquare(rect: RectLike, mode: 'min' | 'max' = 'min'): RectWritable {
  return toSquareInto(createRect(), rect, mode);
}
