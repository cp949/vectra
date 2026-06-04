import type { XYInput, XYObjectWritable, XYWritable } from './xy.internal';

/** tuple 형태의 structural infinite-line input. */
export type InfiniteLineTuple = readonly [origin: XYInput, direction: XYInput];

/** origin과 direction으로 표현하는 structural infinite-line object input. */
export interface InfiniteLineObjectLike {
  /** infinite-line 기준점 */
  readonly origin: XYInput;

  /** infinite-line 방향 벡터 */
  readonly direction: XYInput;
}

/** origin과 direction으로 표현하는 structural infinite-line input. */
export type InfiniteLineLike = InfiniteLineObjectLike | InfiniteLineTuple;

/** writable origin과 direction에 결과를 기록할 수 있는 structural infinite-line output. */
export interface InfiniteLineWritable<
  Origin extends XYWritable = XYObjectWritable,
  Direction extends XYWritable = XYObjectWritable,
> {
  /** 기록 가능한 infinite-line 기준점 */
  origin: Origin;

  /** 기록 가능한 infinite-line 방향 벡터 */
  direction: Direction;
}
