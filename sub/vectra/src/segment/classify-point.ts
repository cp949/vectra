import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY } from '../internal/xy';
import type { SegmentLike, XYInput } from '../types';

/**
 * point와 segment의 관계를 분류해 반환한다.
 *
 * - `'on'`: point가 segment 위에 있다 (0 ≤ t ≤ 1).
 * - `'before'`: point가 시작점 이전 연장선 위에 있다 (t < 0).
 * - `'after'`: point가 끝점 이후 연장선 위에 있다 (t > 1).
 * - `'off'`: point가 무한 직선 밖에 있다 (수직 거리 > epsilon).
 *
 * epsilon < 0이면 RangeError를 던진다.
 *
 * @param segment 대상 segment
 * @param point 분류할 point
 * @param epsilon 수직 거리 판정 임계값. 기본값 0
 */
export function classifyPoint(segment: SegmentLike, point: XYInput, epsilon = 0): 'on' | 'before' | 'after' | 'off' {
  if (epsilon < 0) {
    throw new RangeError('classifyPoint epsilon must be >= 0');
  }

  const segA = readSegmentA(segment);
  const segB = readSegmentB(segment);
  const ax = readX(segA);
  const ay = readY(segA);
  const bx = readX(segB);
  const by = readY(segB);
  const px = readX(point);
  const py = readY(point);

  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;

  // zero-length segment: point와 endpoint 사이 거리로 판정
  if (lenSq === 0) {
    const distSq = (px - ax) ** 2 + (py - ay) ** 2;
    return distSq <= epsilon * epsilon ? 'on' : 'off';
  }

  // 수직 거리: cross product / length
  const cross = (px - ax) * dy - (py - ay) * dx;
  const perpDistSq = (cross * cross) / lenSq;

  if (perpDistSq > epsilon * epsilon) return 'off';

  // projection t 계산
  const t = ((px - ax) * dx + (py - ay) * dy) / lenSq;

  if (t < 0) return 'before';
  if (t > 1) return 'after';
  return 'on';
}
