import { hypot2 } from '../internal/numeric';
import type { Segment, SegmentWritable } from '../types/flat-shapes.internal';

/**
 * segment를 단위 방향벡터 기준으로 before/after만큼 연장한 결과를 out에 기록하고 out을 반환한다.
 * before는 시작점을 진행 방향의 반대로, after는 끝점을 진행 방향으로 이동한다.
 * 음수 허용, clamp 없음. zero-length segment는 input을 그대로 복사한다. input/output aliasing 허용.
 *
 * @param out 결과를 기록할 선분 객체
 * @param line 연장할 segment
 * @param before 시작점을 뒤로 이동할 거리 (음수는 반대 방향)
 * @param after 끝점을 앞으로 이동할 거리 (음수는 반대 방향)
 */
export function extendInto<Out extends SegmentWritable>(out: Out, line: Segment, before: number, after: number): Out {
  // aliasing 안전: 모든 좌표를 먼저 읽는다
  const ax = line.x1;
  const ay = line.y1;
  const bx = line.x2;
  const by = line.y2;
  const dx = bx - ax;
  const dy = by - ay;
  const len = hypot2(dx, dy);
  if (len === 0) {
    out.x1 = ax;
    out.y1 = ay;
    out.x2 = bx;
    out.y2 = by;
    return out;
  }
  const ux = dx / len;
  const uy = dy / len;
  out.x1 = ax - ux * before;
  out.y1 = ay - uy * before;
  out.x2 = bx + ux * after;
  out.y2 = by + uy * after;
  return out;
}
