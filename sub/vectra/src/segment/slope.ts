import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY } from '../internal/xy';
import type { SegmentLike } from '../types';

/**
 * segment a→b의 기울기(dy / dx)를 반환한다.
 *
 * - vertical segment(dx === 0, dy !== 0): dy > 0이면 Infinity, dy < 0이면 -Infinity.
 * - zero-length segment(dx === 0, dy === 0): NaN.
 * - non-finite 입력은 별도 validation 없이 JavaScript number 연산 결과를 따른다.
 *
 * @param line 기울기를 계산할 segment
 */
export function slope(line: SegmentLike): number {
  const a = readSegmentA(line);
  const b = readSegmentB(line);
  const ax = readX(a);
  const ay = readY(a);
  const dx = readX(b) - ax;
  const dy = readY(b) - ay;
  return dy / dx;
}
