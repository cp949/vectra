import { cropLineFamilyByRectInto } from '../internal/line-family-crop';
import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY } from '../internal/xy';
import type { RectLike, SegmentLike, SegmentWritable, XYWritable } from '../types';

/**
 * segment를 axis-aligned rect boundary로 crop한 결과를 out에 기록하고 성공 여부를 반환한다.
 *
 * segment range `[0, 1]`과 rect 내부 구간의 교집합을 bounded segment로 기록한다. 성공하면
 * `out`에 기록하고 `true`, 실패/empty crop이면 `false`이고 `out`을 수정하지 않는다.
 * crop 결과 endpoint 순서는 원본 `a → b` 진행 방향을 유지한다.
 * 실패 조건: zero-length(degenerate) segment, empty rect(`width`/`height`가 `<= 0` 또는
 * ±Infinity·NaN), rect와 만나지 않음, clip 길이 0. non-finite 좌표는 valid bounded segment를 만들 수 없어 실패한다.
 * `out`과 input segment가 같은 object여도 안전하다.
 *
 * @param out crop된 segment를 기록할 writable output
 * @param line crop할 segment
 * @param rect crop 경계 rect (axis-aligned)
 */
export function cropByRectInto(
  out: SegmentWritable<XYWritable, XYWritable>,
  line: SegmentLike,
  rect: RectLike
): boolean {
  const a = readSegmentA(line);
  const b = readSegmentB(line);
  const ax = readX(a);
  const ay = readY(a);
  const bx = readX(b);
  const by = readY(b);
  return cropLineFamilyByRectInto(
    out,
    ax,
    ay,
    bx - ax,
    by - ay,
    'finite',
    readRectX(rect),
    readRectY(rect),
    readRectWidth(rect),
    readRectHeight(rect)
  );
}
