import { validateOrientedRectSizeAndAngle } from '../internal/oriented-rect';
import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import { writeXY } from '../internal/xy';
import type { OrientedRectWritable, RectLike, XYWritable } from '../types';

/**
 * axis-aligned rect와 angle로부터 oriented rect를 out에 기록하고 out을 반환한다.
 *
 * `center = (x + width/2, y + height/2)`, `size = (width, height)`, `angle`을 기록한다. negative
 * width/height는 size에 그대로 보존한다. empty 판정과 처리는 query helper 책임이다. `width`,
 * `height`, `angle`이 non-finite이면 `RangeError`다. `x`, `y`는 finite validation 없이 산술 결과를
 * 따른다. source 값을 먼저 모두 읽으므로 input rect와 out nested storage가 같은 object여도 안전하다.
 *
 * @param out oriented rect를 기록할 writable output
 * @param rect 변환할 axis-aligned rect
 * @param angle local x축 회전각. 단위는 radian.
 */
export function fromRectInto<Out extends OrientedRectWritable<XYWritable, XYWritable>>(
  out: Out,
  rect: RectLike,
  angle: number
): Out {
  // aliasing 안전 - 모든 입력 값을 먼저 읽은 후 기록한다
  const x = readRectX(rect);
  const y = readRectY(rect);
  const width = readRectWidth(rect);
  const height = readRectHeight(rect);
  validateOrientedRectSizeAndAngle(width, height, angle);

  writeXY(out.center, x + width / 2, y + height / 2);
  writeXY(out.size, width, height);
  out.angle = angle;
  return out;
}
