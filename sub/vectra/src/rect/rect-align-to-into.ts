import type { RectAlignAnchor, RectAlignOptions } from '../types';
import type { Rect, RectWritable } from '../types/flat-shapes.internal';

const VALID_ANCHORS: readonly RectAlignAnchor[] = [
  'top-left',
  'top',
  'top-right',
  'left',
  'center',
  'right',
  'bottom-left',
  'bottom',
  'bottom-right',
];

/**
 * target의 크기를 유지한 채 container 안 anchor에 정렬한 위치를 out에 기록한다.
 *
 * `out.width`/`out.height`는 target 크기를 그대로 복사하고, `out.x`/`out.y`만 anchor 규칙으로
 * 계산한다. scale helper가 아니다. contain/cover scaling이 필요하면 `fitInsideInto`/
 * `fitOutsideInto`를 사용한다.
 *
 * anchor는 target과 container의 같은 anchor point를 일치시킨다.
 * - `left` 계열(`top-left`/`left`/`bottom-left`): `out.x = container.x`
 * - `center` 계열(`top`/`center`/`bottom`): `out.x = container.x + (container.width - target.width) / 2`
 * - `right` 계열(`top-right`/`right`/`bottom-right`): `out.x = container.x + container.width - target.width`
 * - `top` 계열(`top-left`/`top`/`top-right`): `out.y = container.y`
 * - `center` 계열(`left`/`center`/`right`): `out.y = container.y + (container.height - target.height) / 2`
 * - `bottom` 계열(`bottom-left`/`bottom`/`bottom-right`): `out.y = container.y + container.height - target.height`
 *
 * empty rect와 negative-dimension rect도 실패 분기 없이 raw 산식을 그대로 적용한다. 각 분기는
 * `(extent - target) * factor` 형태를 쓰지 않아 `0 * Infinity` NaN이 생기지 않는다. 입력 non-finite는
 * 검증 없이 pass-through하며, `left`(`out.x = cx`)/`top`(`out.y = cy`) anchor만 container 좌표를 직접
 * 복사해 non-finite 입력에서도 그 값을 보존한다. `center`/`right`/`bottom` anchor는 target extent를
 * 산식에 사용하므로 산술 결과(`NaN`/`Infinity`)를 그대로 기록한다(예: `right`에서 `cw`/`tw`가 모두
 * `Infinity`면 `Infinity - Infinity = NaN`). out과 target/container가 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 사각형 객체
 * @param target 크기와 정렬 대상이 되는 source rect. 위치(x/y)는 결과에 반영되지 않는다.
 * @param container 정렬 기준이 되는 container rect
 * @param options 정렬 옵션. `anchor` 생략 시 `'center'`. 9개 literal 외 anchor는 `RangeError`.
 */
export function rectAlignToInto<Out extends RectWritable>(
  out: Out,
  target: Rect,
  container: Rect,
  options?: RectAlignOptions
): Out {
  const anchor = options?.anchor ?? 'center';
  if (!VALID_ANCHORS.includes(anchor)) {
    throw new RangeError(
      `유효하지 않은 anchor: "${String(anchor)}". ${VALID_ANCHORS.map((a) => `'${a}'`).join(', ')} 중 하나여야 한다.`
    );
  }

  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const tw = target.width;
  const th = target.height;
  const cx = container.x;
  const cy = container.y;
  const cw = container.width;
  const ch = container.height;

  // 각 분기는 (cw - tw) * factor 형태를 쓰지 않아 0*Infinity NaN을 피한다.
  // left는 cx만 복사하고, right/center만 target extent(tw)를 산식에 쓴다.
  let x: number;
  if (anchor === 'top-left' || anchor === 'left' || anchor === 'bottom-left') {
    x = cx;
  } else if (anchor === 'top-right' || anchor === 'right' || anchor === 'bottom-right') {
    x = cx + cw - tw;
  } else {
    x = cx + (cw - tw) / 2;
  }

  let y: number;
  if (anchor === 'top-left' || anchor === 'top' || anchor === 'top-right') {
    y = cy;
  } else if (anchor === 'bottom-left' || anchor === 'bottom' || anchor === 'bottom-right') {
    y = cy + ch - th;
  } else {
    y = cy + (ch - th) / 2;
  }

  out.x = x;
  out.y = y;
  out.width = tw;
  out.height = th;
  return out;
}
