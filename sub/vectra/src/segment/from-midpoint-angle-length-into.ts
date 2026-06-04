import { readX, readY, writeXY } from '../internal/xy';
import type { SegmentWritable, XYInput, XYWritable } from '../types';

/**
 * midpoint를 중심으로 angle 방향을 따라 length 길이의 segment를 out에 기록하고 out을 반환한다.
 *
 * direction = (cos(angle), sin(angle)), half = length / 2.
 * a = midpoint - direction * half, b = midpoint + direction * half.
 * length = 0이면 midpoint에 zero-length segment를 기록한다.
 * negative length는 clamp하지 않는다. endpoint가 angle 반대 방향으로 뒤집히는 JavaScript 산술 결과를 따른다.
 * NaN/Infinity 입력은 별도 검증 없이 JavaScript 산술 결과를 따른다. angle = Infinity이면 cos/sin 결과가 NaN이다.
 * out.a 또는 out.b와 midpoint가 같은 storage여도 aliasing이 안전하다.
 *
 * @param out 결과를 기록할 writable segment output
 * @param midpoint segment 중심점
 * @param angle segment 방향각(radian)
 * @param length segment 전체 길이. 0이면 midpoint zero-length segment를 기록한다. 음수는 clamp하지 않는다
 */
export function fromMidpointAngleLengthInto<Out extends SegmentWritable<XYWritable, XYWritable>>(
  out: Out,
  midpoint: XYInput,
  angle: number,
  length: number
): Out {
  const mx = readX(midpoint);
  const my = readY(midpoint);
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const half = length / 2;
  writeXY(out.a, mx - dx * half, my - dy * half);
  writeXY(out.b, mx + dx * half, my + dy * half);
  return out;
}
