import type { XYInput, XYObjectWritable, XYWritable } from './xy.internal';

/** tuple 형태의 structural circle input. */
export type CircleTuple = readonly [center: XYInput, radius: number];

/** 중심점과 반지름으로 표현하는 structural circle object input. */
export interface CircleObjectLike {
  /** circle 중심점 */
  readonly center: XYInput;

  /** circle 반지름 */
  readonly radius: number;
}

/** 중심점과 반지름으로 표현하는 structural circle input. */
export type CircleLike = CircleObjectLike | CircleTuple;

/** writable 중심점과 반지름에 결과를 기록할 수 있는 structural circle output. */
export interface CircleWritable<Center extends XYWritable = XYObjectWritable> {
  /** 기록 가능한 circle 중심점 */
  center: Center;

  /** 기록 가능한 circle 반지름 */
  radius: number;
}
