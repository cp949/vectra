import { readX, readY, writeXY } from '../internal/xy';
import type { InfiniteLineWritable, XYInput, XYWritable } from '../types';

/**
 * `origin`을 기준점으로, radian `angle` 방향 단위 벡터를 direction으로 `out`에 기록하고 `out`을 반환한다.
 *
 * direction은 `{ x: Math.cos(angle), y: Math.sin(angle) }`이다.
 *
 * `angle = NaN | Infinity | -Infinity` 같은 non-finite 입력은 검증하지 않는다.
 * `Math.cos`/`Math.sin`의 산술 결과(`Math.cos(Infinity) === NaN` 등)가 direction component에 그대로 기록된다.
 *
 * `out.origin`이 `origin`과 같은 object여도 alias-safe하다 (origin 좌표를 먼저 읽은 뒤 기록한다).
 *
 * @param out infinite-line을 기록할 writable output
 * @param origin infinite-line 기준점으로 복사할 좌표
 * @param angle direction 단위 벡터의 radian angle
 */
export function fromAngleInto<Out extends InfiniteLineWritable<XYWritable, XYWritable>>(
  out: Out,
  origin: XYInput,
  angle: number
): Out {
  const ox = readX(origin);
  const oy = readY(origin);
  writeXY(out.origin, ox, oy);
  writeXY(out.direction, Math.cos(angle), Math.sin(angle));
  return out;
}
