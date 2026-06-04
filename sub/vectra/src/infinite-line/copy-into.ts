import { readInfiniteLineDirection, readInfiniteLineOrigin } from '../internal/infinite-line';
import { readX, readY, writeXY } from '../internal/xy';
import type { InfiniteLineLike, InfiniteLineWritable, XYInput, XYWritable } from '../types';

/** `InfiniteLineLike` source의 component를 `out`에 복사하고 `out`을 반환한다. */
export function copyInto<Out extends InfiniteLineWritable<XYWritable, XYWritable>>(
  out: Out,
  line: InfiniteLineLike
): Out;
/** origin/direction component를 `out`에 복사하고 `out`을 반환한다. */
export function copyInto<Out extends InfiniteLineWritable<XYWritable, XYWritable>>(
  out: Out,
  origin: XYInput,
  direction: XYInput
): Out;
export function copyInto<Out extends InfiniteLineWritable<XYWritable, XYWritable>>(
  out: Out,
  lineOrOrigin: InfiniteLineLike | XYInput,
  direction?: XYInput
): Out {
  // copyInto(out, out) alias 호출에서도 안전하도록 모든 좌표를 먼저 읽은 뒤 기록한다
  const originPoint =
    direction === undefined ? readInfiniteLineOrigin(lineOrOrigin as InfiniteLineLike) : (lineOrOrigin as XYInput);
  const directionPoint =
    direction === undefined ? readInfiniteLineDirection(lineOrOrigin as InfiniteLineLike) : direction;
  const ox = readX(originPoint);
  const oy = readY(originPoint);
  const dx = readX(directionPoint);
  const dy = readY(directionPoint);
  writeXY(out.origin, ox, oy);
  writeXY(out.direction, dx, dy);
  return out;
}
