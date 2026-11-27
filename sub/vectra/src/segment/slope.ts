import type { Segment } from '../types/flat-shapes.internal';

/**
 * 선분 (x1, y1) → (x2, y2)의 기울기(dy / dx)를 반환한다.
 *
 * - vertical segment(dx === 0, dy !== 0): dy > 0이면 Infinity, dy < 0이면 -Infinity.
 * - zero-length segment(dx === 0, dy === 0): NaN.
 * - non-finite 입력은 별도 validation 없이 JavaScript number 연산 결과를 따른다.
 *
 * @param line 기울기를 계산할 segment
 */
export function slope(line: Segment): number {
  const ax = line.x1;
  const ay = line.y1;
  const dx = line.x2 - ax;
  const dy = line.y2 - ay;
  return dy / dx;
}
