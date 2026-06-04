import { readCircleCenter, readCircleRadius } from '../internal/circle';
import { readInfiniteLineDirection, readInfiniteLineOrigin } from '../internal/infinite-line';
import { cropLineFamilyByCircleInto } from '../internal/line-family-crop';
import { readX, readY } from '../internal/xy';
import type { CircleLike, InfiniteLineLike, SegmentWritable, XYWritable } from '../types';

/**
 * infinite-line이 circle 내부를 지나는 chord segment를 out에 기록하고 성공 여부를 반환한다.
 *
 * infinite-line range `(-Infinity, +Infinity)`와 disk 내부 구간의 교집합을 bounded segment로
 * 기록한다. infinite-line 자체는 수정하지 않고 `out` segment에만 기록한다. 성공하면 `out`에
 * 기록하고 `true`, no-hit/tangent/empty이면 `false`이고 `out`을 수정하지 않는다.
 * output segment endpoint 순서는 source direction의 increasing `t`다.
 * 실패 조건: zero-direction infinite-line, circle radius가 finite positive 아님, disk와 만나지
 * 않음, tangent(chord 길이 0). non-finite 좌표는 실패한다.
 *
 * @param out chord segment를 기록할 writable output
 * @param line chord를 구할 infinite-line
 * @param circle 경계 circle
 */
export function segmentInsideCircleInto(
  out: SegmentWritable<XYWritable, XYWritable>,
  line: InfiniteLineLike,
  circle: CircleLike
): boolean {
  const o = readInfiniteLineOrigin(line);
  const d = readInfiniteLineDirection(line);
  const center = readCircleCenter(circle);
  return cropLineFamilyByCircleInto(
    out,
    readX(o),
    readY(o),
    readX(d),
    readY(d),
    'inf',
    readX(center),
    readY(center),
    readCircleRadius(circle)
  );
}
