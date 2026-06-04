import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY, writeXY } from '../internal/xy';
import type { SegmentLike, SegmentWritable, XYWritable } from '../types';

/**
 * segment를 단위 방향벡터 기준으로 before/after만큼 연장한 결과를 out에 기록하고 out을 반환한다.
 * before는 a 방향 뒤쪽(a endpoint를 a→b 반대 방향으로 이동), after는 b 방향(b endpoint를 a→b 방향으로 이동).
 * 음수 허용, clamp 없음. zero-length segment는 input을 그대로 복사한다. input/output aliasing 허용.
 *
 * @param out 결과를 기록할 writable segment output
 * @param line 연장할 segment
 * @param before a endpoint를 뒤쪽으로 이동할 거리 (음수는 반대 방향)
 * @param after b endpoint를 앞쪽으로 이동할 거리 (음수는 반대 방향)
 */
export function extendInto<Out extends SegmentWritable<XYWritable, XYWritable>>(
  out: Out,
  line: SegmentLike,
  before: number,
  after: number
): Out {
  // aliasing 안전: 모든 좌표를 먼저 읽는다
  const ax = readX(readSegmentA(line));
  const ay = readY(readSegmentA(line));
  const bx = readX(readSegmentB(line));
  const by = readY(readSegmentB(line));
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy);
  if (len === 0) {
    writeXY(out.a, ax, ay);
    writeXY(out.b, bx, by);
    return out;
  }
  const ux = dx / len;
  const uy = dy / len;
  writeXY(out.a, ax - ux * before, ay - uy * before);
  writeXY(out.b, bx + ux * after, by + uy * after);
  return out;
}
