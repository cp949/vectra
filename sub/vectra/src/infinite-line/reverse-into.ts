import { readInfiniteLineDirection, readInfiniteLineOrigin } from '../internal/infinite-line';
import { readX, readY, writeXY } from '../internal/xy';
import type { InfiniteLineLike, InfiniteLineWritable, XYWritable } from '../types';

/**
 * 같은 직선을 반대 방향으로 순회하도록 `direction`만 부호 반전해 `out`에 기록하고 `out`을 반환한다.
 *
 * `origin`은 유지한다. `out`과 `line`이 같은 object여도 alias-safe하다.
 */
export function reverseInto<Out extends InfiniteLineWritable<XYWritable, XYWritable>>(
  out: Out,
  line: InfiniteLineLike
): Out {
  // alias 호출에서도 안전하도록 모든 좌표를 먼저 읽는다
  const ox = readX(readInfiniteLineOrigin(line));
  const oy = readY(readInfiniteLineOrigin(line));
  const dx = readX(readInfiniteLineDirection(line));
  const dy = readY(readInfiniteLineDirection(line));
  writeXY(out.origin, ox, oy);
  writeXY(out.direction, -dx, -dy);
  return out;
}
