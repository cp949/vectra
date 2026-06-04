import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY, writeXY } from '../internal/xy';
import type { SegmentLike, XYInput, XYWritable } from '../types';

/**
 * `point`를 segment의 supporting infinite line에 투영한 점을 out에 기록하고 out을 반환한다.
 *
 * - endpoint clamp 없이 unclamped projection을 기록한다.
 *   `point`가 endpoint 바깥에 있어도 supporting infinite line 위 점을 기록한다.
 *   endpoint-clamped 최근점이 필요하면 `closestPointInto`를 사용한다.
 * - zero-length segment는 `point`에 무관하게 시작점을 기록한다.
 * - non-finite 입력은 별도 validation 없이 JavaScript number 연산 결과를 따른다.
 * - self-aliasing 안전: write 전 입력 좌표를 local 변수에 읽는다. `out`과 `point`가 같은
 *   object여도 안전하다.
 *
 * @param out 결과를 기록할 writable output
 * @param line 기준 segment
 * @param point supporting line에 투영할 point
 * @see projectPointInto
 */
export function nearestPointOnSupportingLineInto<Out extends XYWritable>(
  out: Out,
  line: SegmentLike,
  point: XYInput
): Out {
  const a = readSegmentA(line);
  const b = readSegmentB(line);
  const ax = readX(a);
  const ay = readY(a);
  const dx = readX(b) - ax;
  const dy = readY(b) - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return writeXY(out, ax, ay);
  const px = readX(point) - ax;
  const py = readY(point) - ay;
  const t = (px * dx + py * dy) / lenSq;
  return writeXY(out, ax + t * dx, ay + t * dy);
}
