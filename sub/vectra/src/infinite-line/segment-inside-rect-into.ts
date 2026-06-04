import { readInfiniteLineDirection, readInfiniteLineOrigin } from '../internal/infinite-line';
import { cropLineFamilyByRectInto } from '../internal/line-family-crop';
import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import { readX, readY } from '../internal/xy';
import type { InfiniteLineLike, RectLike, SegmentWritable, XYWritable } from '../types';

/**
 * infinite-line이 axis-aligned rect 내부를 지나는 clipped segment를 out에 기록하고 성공 여부를 반환한다.
 *
 * infinite-line range `(-Infinity, +Infinity)`와 rect 내부 구간의 교집합을 bounded segment로
 * 기록한다. infinite-line 자체는 수정하지 않고 `out` segment에만 기록한다. 성공하면 `out`에
 * 기록하고 `true`, no-hit/empty이면 `false`이고 `out`을 수정하지 않는다.
 * output segment endpoint 순서는 source direction의 increasing `t`다.
 * 실패 조건: zero-direction infinite-line, empty rect(`width`/`height`가 `<= 0` 또는 ±Infinity·NaN),
 * rect와 만나지 않음, clip 길이 0. non-finite 좌표는 실패한다.
 *
 * @param out clipped segment를 기록할 writable output
 * @param line clipped segment를 구할 infinite-line
 * @param rect 경계 rect (axis-aligned)
 */
export function segmentInsideRectInto(
  out: SegmentWritable<XYWritable, XYWritable>,
  line: InfiniteLineLike,
  rect: RectLike
): boolean {
  const o = readInfiniteLineOrigin(line);
  const d = readInfiniteLineDirection(line);
  return cropLineFamilyByRectInto(
    out,
    readX(o),
    readY(o),
    readX(d),
    readY(d),
    'inf',
    readRectX(rect),
    readRectY(rect),
    readRectWidth(rect),
    readRectHeight(rect)
  );
}
