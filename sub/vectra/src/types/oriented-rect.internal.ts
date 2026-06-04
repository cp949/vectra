import type { XYInput, XYObjectWritable, XYWritable } from './xy.internal';

/** tuple 형태의 structural oriented-rect input. */
export type OrientedRectTuple = readonly [center: XYInput, size: XYInput, angle: number];

/** center/size/angle로 표현하는 structural oriented-rect object input. */
export interface OrientedRectObjectLike {
  /** oriented rect 중심 좌표 */
  readonly center: XYInput;

  /** width(`x`)/height(`y`) 의미의 size pair. `size.x <= 0 || size.y <= 0`은 empty다. */
  readonly size: XYInput;

  /** local x축 회전각. 단위는 radian이며 positive direction은 matrix 2D 회전 convention과 맞춘다. */
  readonly angle: number;
}

/** center/size/angle object 또는 tuple로 표현하는 structural oriented-rect input. */
export type OrientedRectLike = OrientedRectObjectLike | OrientedRectTuple;

/** center/size/angle에 결과를 기록할 수 있는 structural oriented-rect output. */
export interface OrientedRectWritable<
  Center extends XYWritable = XYObjectWritable,
  Size extends XYWritable = XYObjectWritable,
> {
  /** 기록 가능한 oriented rect 중심 좌표 */
  center: Center;

  /** 기록 가능한 width(`x`)/height(`y`) size pair */
  size: Size;

  /** 기록 가능한 local x축 회전각. 단위는 radian. */
  angle: number;
}
