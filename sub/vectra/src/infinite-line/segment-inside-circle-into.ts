import { cropLineFamilyByCircleInto } from '../internal/line-family-crop';
import type { Circle, InfiniteLine, SegmentWritable } from '../types/flat-shapes.internal';

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
 * @param out 결과를 기록할 선분 객체
 * @param line chord를 구할 infinite-line
 * @param circle 경계 circle
 */
export function segmentInsideCircleInto(out: SegmentWritable, line: InfiniteLine, circle: Circle): boolean {
  const { ox, oy, dx, dy } = line;
  return cropLineFamilyByCircleInto(out, ox, oy, dx, dy, 'inf', circle.cx, circle.cy, circle.r);
}
