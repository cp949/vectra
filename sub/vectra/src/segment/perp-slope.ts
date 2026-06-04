import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY } from '../internal/xy';
import type { SegmentLike } from '../types';

/**
 * segment a→b의 supporting line에 수직인 직선의 기울기를 반환한다.
 *
 * - horizontal segment(dy === 0, dx !== 0): Infinity.
 * - vertical segment(dx === 0, dy !== 0): 0.
 * - zero-length segment(dx === 0, dy === 0): NaN.
 * - 그 외: `-dx / dy`.
 * - non-finite 입력은 별도 validation 없이 JavaScript number 연산 결과를 따른다.
 *
 * @param line 수직 기울기를 계산할 segment
 */
export function perpSlope(line: SegmentLike): number {
  const a = readSegmentA(line);
  const b = readSegmentB(line);
  const ax = readX(a);
  const ay = readY(a);
  const dx = readX(b) - ax;
  const dy = readY(b) - ay;
  if (dx === 0 && dy === 0) return NaN;
  if (dy === 0) return Number.isFinite(dx) ? Infinity : NaN;
  if (dx === 0) return 0;
  return -dx / dy;
}
