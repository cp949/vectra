import type { RectAlignOptions, RectLike, RectWritable } from '../types';
import { createRect } from './create-rect';
import { rectAlignToInto } from './rect-align-to-into';

/**
 * target의 크기를 유지한 채 container 안 anchor에 정렬한 rect를 새 plain object로 반환한다.
 *
 * 결과 규칙은 `rectAlignToInto`와 동일하다. width/height는 target 크기를 유지하고 x/y만 anchor
 * 규칙으로 계산한다. scale helper가 아니다.
 *
 * empty rect와 negative-dimension rect도 실패 분기 없이 raw 산식을 그대로 적용한다. 각 분기는
 * `(extent - target) * factor` 형태를 쓰지 않아 `0 * Infinity` NaN이 생기지 않는다. 입력 non-finite는
 * 검증 없이 pass-through하며, `left`(`out.x = cx`)/`top`(`out.y = cy`) anchor만 container 좌표를 직접
 * 복사해 non-finite 입력에서도 그 값을 보존한다. `center`/`right`/`bottom` anchor는 target extent를
 * 산식에 사용하므로 산술 결과(`NaN`/`Infinity`)를 그대로 기록한다(예: `right`에서 `cw`/`tw`가 모두
 * `Infinity`면 `Infinity - Infinity = NaN`).
 *
 * @param target 크기와 정렬 대상이 되는 source rect. 위치(x/y)는 결과에 반영되지 않는다.
 * @param container 정렬 기준이 되는 container rect
 * @param options 정렬 옵션. `anchor` 생략 시 `'center'`. 9개 literal 외 anchor는 `RangeError`.
 */
export function rectAlignTo(target: RectLike, container: RectLike, options?: RectAlignOptions): RectWritable {
  return rectAlignToInto(createRect(), target, container, options);
}
