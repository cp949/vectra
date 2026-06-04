import type { XYInput, XYObjectWritable, XYWritable } from './xy.internal';

/** tuple 형태의 structural bounds input. */
export type BoundsTuple = readonly [min: XYInput, max: XYInput];

/** min/max extent로 표현하는 structural bounds object input. */
export interface BoundsObjectLike {
  /** bounds 최솟값 corner */
  readonly min: XYInput;

  /** bounds 최댓값 corner */
  readonly max: XYInput;
}

/** min/max extent로 표현하는 structural bounds input. */
export type BoundsLike = BoundsObjectLike | BoundsTuple;

/** min/max writable corner에 결과를 기록할 수 있는 structural bounds output. */
export interface BoundsWritable<Min extends XYWritable = XYObjectWritable, Max extends XYWritable = XYObjectWritable> {
  /** 기록 가능한 bounds 최솟값 corner */
  min: Min;

  /** 기록 가능한 bounds 최댓값 corner */
  max: Max;
}

/** top/right/bottom/left 개별 양으로 표현하는 structural bounds padding input. */
export interface BoundsPaddingLike {
  /** top 방향 확장량. 미지정 시 0. */
  readonly top?: number;

  /** right 방향 확장량. 미지정 시 0. */
  readonly right?: number;

  /** bottom 방향 확장량. 미지정 시 0. */
  readonly bottom?: number;

  /** left 방향 확장량. 미지정 시 0. */
  readonly left?: number;
}
