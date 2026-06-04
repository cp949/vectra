import type { InfiniteLineLike, InfiniteLineTuple, XYInput } from '../types';

// readonly tuple narrowing은 Array.isArray로 명시한다 (agent trap: readonly-tuple-narrowing)
function isInfiniteLineTuple(line: InfiniteLineLike): line is InfiniteLineTuple {
  return Array.isArray(line);
}

/** infinite-line input에서 origin point를 읽는다. */
export function readInfiniteLineOrigin(line: InfiniteLineLike): XYInput {
  return isInfiniteLineTuple(line) ? line[0] : line.origin;
}

/** infinite-line input에서 direction vector를 읽는다. */
export function readInfiniteLineDirection(line: InfiniteLineLike): XYInput {
  return isInfiniteLineTuple(line) ? line[1] : line.direction;
}
