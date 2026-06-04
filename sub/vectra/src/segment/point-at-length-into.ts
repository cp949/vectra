import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY, writeXY } from '../internal/xy';
import type { PointAtLengthOptions, SegmentLike, XYWritable } from '../types';

/**
 * segment 위 `distance` 길이 위치를 out에 기록하고 out을 반환한다.
 *
 * - 기본 동작: clamp. `distance <= 0`이면 시작점, `distance >= length(line)`이면 끝점을 기록한다.
 * - `options?.clamp === false`이면 extrapolation: `distance / length` 비율을 그대로 사용해
 *   supporting line 위 점을 기록한다.
 * - zero-length segment는 `distance`와 clamp 여부에 무관하게 시작점을 기록한다.
 * - `distance`가 `NaN`이면 clamp 비교가 모두 false이므로 default clamp 경로에서 extrapolation과
 *   동일한 NaN 좌표가 기록된다. non-finite 입력은 별도 validation 없이 JavaScript number 연산
 *   결과를 따른다.
 * - self-aliasing 안전: write 전 입력 좌표를 local 변수에 읽는다.
 *
 * @param out 결과를 기록할 writable output
 * @param line 대상 segment
 * @param distance segment 시작점에서의 arc-length 거리
 * @param options clamp 정책 옵션
 */
export function pointAtLengthInto<Out extends XYWritable>(
  out: Out,
  line: SegmentLike,
  distance: number,
  options?: PointAtLengthOptions
): Out {
  const a = readSegmentA(line);
  const b = readSegmentB(line);
  const ax = readX(a);
  const ay = readY(a);
  const dx = readX(b) - ax;
  const dy = readY(b) - ay;
  const len = Math.hypot(dx, dy);

  if (len === 0) return writeXY(out, ax, ay);

  const shouldClamp = options?.clamp !== false;
  if (shouldClamp) {
    if (distance <= 0) return writeXY(out, ax, ay);
    if (distance >= len) return writeXY(out, ax + dx, ay + dy);
  }
  const t = distance / len;
  return writeXY(out, ax + t * dx, ay + t * dy);
}
