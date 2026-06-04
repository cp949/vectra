import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY } from '../internal/xy';
import type { SegmentLike, XYInput } from '../types';

/**
 * point가 segment의 supporting infinite line 어느 쪽에 있는지 반환한다.
 *
 * - 좌측(진행 방향 기준 left): `1`.
 * - 우측: `-1`.
 * - `|signedDistance| <= epsilon`: `0`.
 * - signedDistance가 NaN이면 `0`을 반환한다. non-finite 입력이 NaN 결과를 만들더라도
 *   literal union `-1 | 0 | 1` 계약을 보존한다.
 * - zero-length segment의 signedDistance는 0이므로 항상 `0`을 반환한다.
 *
 * @param line 기준 segment
 * @param point 판별할 point
 * @param epsilon 경계 허용 거리. 기본값 `1e-9`
 */
export function sideOfSupportingLine(line: SegmentLike, point: XYInput, epsilon = 1e-9): -1 | 0 | 1 {
  const a = readSegmentA(line);
  const b = readSegmentB(line);
  const ax = readX(a);
  const ay = readY(a);
  const dx = readX(b) - ax;
  const dy = readY(b) - ay;
  const len = Math.hypot(dx, dy);
  if (len === 0) return 0;
  const px = readX(point) - ax;
  const py = readY(point) - ay;
  // 2D cross product: d × (point - a) = dx * py - dy * px
  const d = (dx * py - dy * px) / len;
  // NaN이면 여기로 떨어짐 — 의도적 정책: NaN → 0
  if (d > epsilon) return 1;
  if (d < -epsilon) return -1;
  return 0;
}
