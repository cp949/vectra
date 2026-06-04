import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY, writeXY } from '../internal/xy';
import type { SegmentLike, XYWritable } from '../types';

/**
 * segment의 단위 법선벡터를 out에 기록하고 out을 반환한다. zero-length에서는 (0, 0)을 기록한다.
 *
 * @param out 법선벡터를 기록할 writable output
 * @param line 대상 segment
 * @param side 'left'(기본값, CCW: -dy,dx 정규화) 또는 'right'(CW: dy,-dx 정규화)
 */
export function normalInto<Out extends XYWritable>(out: Out, line: SegmentLike, side: 'left' | 'right' = 'left'): Out {
  const ax = readX(readSegmentA(line));
  const ay = readY(readSegmentA(line));
  const bx = readX(readSegmentB(line));
  const by = readY(readSegmentB(line));
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy);

  // zero-length 가드: 정규화 불가 시 영벡터 기록
  if (len === 0) {
    return writeXY(out, 0, 0);
  }

  if (side === 'right') {
    // CW 방향: (dy, -dx) 정규화
    return writeXY(out, dy / len, -dx / len);
  }

  // 기본 left = CCW 방향: (-dy, dx) 정규화
  return writeXY(out, -dy / len, dx / len);
}
