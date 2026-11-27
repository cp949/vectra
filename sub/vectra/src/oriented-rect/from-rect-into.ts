import { validateOrientedRectSizeAndAngle } from '../internal/oriented-rect';
import type { OrientedRectWritable, Rect } from '../types/flat-shapes.internal';

/**
 * axis-aligned rect와 angle로부터 oriented rect를 out에 기록하고 out을 반환한다.
 *
 * `cx = x + width/2`, `cy = y + height/2`, `width`, `height`, `angle`을 기록한다. 음수
 * width/height도 그대로 보존한다. empty 판정과 처리는 query helper 책임이다. `width`,
 * `height`, `angle`이 non-finite이면 `RangeError`다. `x`, `y`는 finite validation 없이 산술 결과를
 * 따른다. source 값을 먼저 모두 읽으므로 입력 rect와 out이 같은 객체여도 안전하다.
 *
 * @param out 결과를 기록할 회전 사각형 객체
 * @param rect 변환할 axis-aligned rect
 * @param angle local x축 회전각. 단위는 radian.
 */
export function fromRectInto<Out extends OrientedRectWritable>(out: Out, rect: Rect, angle: number): Out {
  // aliasing 안전 - 모든 입력 값을 먼저 읽은 후 기록한다
  const { x, y, width, height } = rect;
  validateOrientedRectSizeAndAngle(width, height, angle);

  out.cx = x + width / 2;
  out.cy = y + height / 2;
  out.width = width;
  out.height = height;
  out.angle = angle;
  return out;
}
