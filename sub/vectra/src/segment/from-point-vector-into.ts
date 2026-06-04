import { readX, readY, writeXY } from '../internal/xy';
import type { SegmentWritable, XYInput, XYWritable } from '../types';

/**
 * origin에서 vec 방향으로 이동한 endpoint를 out에 기록하고 out을 반환한다.
 *
 * a = origin, b = origin + vec.
 * vec = (0, 0)이면 zero-length segment를 기록한다.
 * NaN/Infinity 입력은 별도 검증 없이 JavaScript 산술 결과를 따른다.
 * out.a 또는 out.b와 origin/vec가 같은 storage여도 aliasing이 안전하다.
 *
 * @param out 결과를 기록할 writable segment output
 * @param origin 시작점
 * @param vec 방향 벡터. out.b에 origin + vec를 기록한다
 */
export function fromPointVectorInto<Out extends SegmentWritable<XYWritable, XYWritable>>(
  out: Out,
  origin: XYInput,
  vec: XYInput
): Out {
  const ox = readX(origin);
  const oy = readY(origin);
  const vx = readX(vec);
  const vy = readY(vec);
  writeXY(out.a, ox, oy);
  writeXY(out.b, ox + vx, oy + vy);
  return out;
}
