import type { Segment } from '../types/flat-shapes.internal';

/**
 * 선분 (x1, y1) → (x2, y2)의 supporting line에 수직인 직선의 기울기를 반환한다.
 *
 * - horizontal segment(dy === 0, dx !== 0): Infinity.
 * - vertical segment(dx === 0, dy !== 0): 0.
 * - zero-length segment(dx === 0, dy === 0): NaN.
 * - 그 외: `-dx / dy`.
 * - non-finite 입력은 별도 validation 없이 JavaScript number 연산 결과를 따른다.
 *
 * @param line 수직 기울기를 계산할 segment
 */
export function perpSlope(line: Segment): number {
  const ax = line.x1;
  const ay = line.y1;
  const dx = line.x2 - ax;
  const dy = line.y2 - ay;
  if (dx === 0 && dy === 0) return NaN;
  if (dy === 0) return Number.isFinite(dx) ? Infinity : NaN;
  if (dx === 0) return 0;
  return -dx / dy;
}
