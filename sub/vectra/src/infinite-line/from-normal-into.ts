import { readX, readY, writeXY } from '../internal/xy';
import type { InfiniteLineWritable, XYInput, XYWritable } from '../types';

/**
 * `origin`을 기준점으로, `normal`에 수직인 direction을 `out`에 기록하고 `out`을 반환한다.
 *
 * `direction = { x: -normal.y, y: normal.x }`로 기록한다 (y-up 수학 관례에서 normal을 좌측으로 90도 회전).
 * `normal`은 normalize하지 않는다. caller가 unit normal을 전달하지 않으면 direction도 같은 scale을 가진다.
 *
 * zero normal(`{ x: 0, y: 0 }`)은 degenerate direction(`{ x: 0, y: 0 }`)을 기록한다.
 *
 * non-finite normal component는 검증하지 않고 산술 결과를 그대로 direction에 기록한다.
 *
 * `out.origin`이 `origin`과, `out.direction`이 `normal`과 같은 object여도 alias-safe하다.
 *
 * @param out infinite-line을 기록할 writable output
 * @param origin infinite-line 기준점으로 복사할 좌표
 * @param normal 직선에 수직인 normal vector. normalize되어 있을 필요는 없다
 */
export function fromNormalInto<Out extends InfiniteLineWritable<XYWritable, XYWritable>>(
  out: Out,
  origin: XYInput,
  normal: XYInput
): Out {
  const ox = readX(origin);
  const oy = readY(origin);
  const nx = readX(normal);
  const ny = readY(normal);
  writeXY(out.origin, ox, oy);
  writeXY(out.direction, -ny, nx);
  return out;
}
