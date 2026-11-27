import { cropLineFamilyByCircleInto } from '../internal/line-family-crop';
import type { Circle, Segment, SegmentWritable } from '../types/flat-shapes.internal';

/**
 * segment를 circle boundary로 crop한 결과를 out에 기록하고 성공 여부를 반환한다.
 *
 * segment range `[0, 1]`과 disk 내부 구간의 교집합을 bounded segment로 기록한다. 성공하면
 * `out`에 기록하고 `true`, 실패/empty crop이면 `false`이고 `out`을 수정하지 않는다.
 * crop 결과 endpoint 순서는 원본 `a → b` 진행 방향을 유지한다.
 * 실패 조건: zero-length(degenerate) segment, circle radius가 finite positive 아님, disk와 만나지
 * 않음, tangent(clip 길이 0). non-finite 좌표는 valid bounded segment를 만들 수 없어 실패한다.
 * `out`과 input segment가 같은 object여도 안전하다.
 *
 * @param out 잘라낸 선분을 기록할 선분 객체
 * @param line crop할 segment
 * @param circle crop 경계 circle
 */
export function cropByCircleInto(out: SegmentWritable, line: Segment, circle: Circle): boolean {
  const ax = line.x1;
  const ay = line.y1;
  const bx = line.x2;
  const by = line.y2;
  return cropLineFamilyByCircleInto(out, ax, ay, bx - ax, by - ay, 'finite', circle.cx, circle.cy, circle.r);
}
