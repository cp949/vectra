import type { XYInput, XYObjectWritable, XYWritable } from './xy.internal';

/** tuple 형태의 structural ray input. `[ox, oy, dx, dy]` */
export type RayTuple = readonly [ox: number, oy: number, dx: number, dy: number];

/** origin과 direction으로 표현하는 structural ray object input. */
export interface RayObjectLike {
  /** ray 기준점 */
  readonly origin: XYInput;

  /** ray 방향 벡터 */
  readonly direction: XYInput;
}

/** origin과 direction으로 표현하는 structural ray input. */
export type RayLike = RayTuple | RayObjectLike;

/** writable origin과 direction에 결과를 기록할 수 있는 structural ray output. */
export interface RayWritable<
  Origin extends XYWritable = XYObjectWritable,
  Direction extends XYWritable = XYObjectWritable,
> {
  /** 기록 가능한 ray 기준점 */
  origin: Origin;

  /** 기록 가능한 ray 방향 벡터 */
  direction: Direction;
}
