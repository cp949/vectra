import type { Segment, PointWritable } from '../types/flat-shapes.internal';
import { hypot2 } from '../internal/numeric';

/**
 * segment의 단위 법선벡터를 out에 기록하고 out을 반환한다. zero-length에서는 (0, 0)을 기록한다.
 *
 * @param out 법선 벡터를 기록할 점 객체
 * @param line 대상 segment
 * @param side 'left'(기본값, CCW: -dy,dx 정규화) 또는 'right'(CW: dy,-dx 정규화)
 */
export function normalInto<Out extends PointWritable>(out: Out, line: Segment, side: 'left' | 'right' = 'left'): Out {
  const ax = line.x1;
  const ay = line.y1;
  const bx = line.x2;
  const by = line.y2;
  const dx = bx - ax;
  const dy = by - ay;
  const len = hypot2(dx, dy);

  // zero-length 가드: 정규화 불가 시 영벡터 기록
  if (len === 0) {
    out.x = 0;
    out.y = 0;
    return out;
  }

  if (side === 'right') {
    // CW 방향: (dy, -dx) 정규화
    out.x = dy / len;
    out.y = -dx / len;
    return out;
  }

  // 기본 left = CCW 방향: (-dy, dx) 정규화
  out.x = -dy / len;
  out.y = dx / len;
  return out;
}
