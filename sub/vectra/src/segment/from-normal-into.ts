import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY, writeXY } from '../internal/xy';
import type { SegmentLike, SegmentWritable, XYWritable } from '../types';

/**
 * segment 위 t 위치에서 left normal 방향으로 length만큼 연장한 segment를 out에 기록하고 out을 반환한다.
 *
 * a = pointAtT(segment, t) (unclamped). b = a + normal * length.
 * 기준 segment가 zero-length이면 normal 방향이 없으므로 a = b = pointAtT(segment, t)를 기록한다.
 * negative length는 clamp하지 않는다. right normal 방향으로 endpoint가 뒤집히는 JavaScript 산술 결과를 따른다.
 * t는 clamp하지 않는다. t < 0 또는 t > 1은 supporting line 위 extrapolation이다.
 * NaN/Infinity 입력은 별도 검증 없이 JavaScript 산술 결과를 따른다.
 * out과 segment가 같은 object여도 aliasing이 안전하다.
 *
 * @param out 결과를 기록할 writable segment output
 * @param segment 기준 segment. t 위치와 normal 방향의 기준
 * @param t parametric 위치. clamp하지 않는다
 * @param length normal 방향 연장 길이. 음수는 right normal 방향. clamp하지 않는다
 */
export function fromNormalInto<Out extends SegmentWritable<XYWritable, XYWritable>>(
  out: Out,
  segment: SegmentLike,
  t: number,
  length: number
): Out {
  // aliasing 안전을 위해 segment endpoint를 먼저 local 변수로 읽는다
  const segA = readSegmentA(segment);
  const segB = readSegmentB(segment);
  const ax = readX(segA);
  const ay = readY(segA);
  const bx = readX(segB);
  const by = readY(segB);
  const dx = bx - ax;
  const dy = by - ay;
  // a = pointAtT(segment, t) — unclamped
  const px = ax + t * dx;
  const py = ay + t * dy;
  const len = Math.hypot(dx, dy);
  if (len === 0) {
    // zero-length segment: normal 미정, a = b = pointAtT
    writeXY(out.a, px, py);
    writeXY(out.b, px, py);
  } else {
    // left normal: (-dy/len, dx/len)
    const nx = (-dy / len) * length;
    const ny = (dx / len) * length;
    writeXY(out.a, px, py);
    writeXY(out.b, px + nx, py + ny);
  }
  return out;
}
