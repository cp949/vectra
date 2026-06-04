/** x/y field를 읽을 수 있는 2D 좌표 input object. */
export interface XYLike {
  /** x축 좌표 */
  readonly x: number;

  /** y축 좌표 */
  readonly y: number;
}

/** readonly tuple 형태의 2D 좌표 input. */
export type XYTuple = readonly [x: number, y: number];

/** vectra public API가 좌표 input으로 받는 structural union. */
export type XYInput = XYLike | XYTuple;

/** x/y field에 좌표를 기록할 수 있는 2D 좌표 output object. */
export interface XYObjectWritable {
  /** 기록 가능한 x축 좌표 */
  x: number;

  /** 기록 가능한 y축 좌표 */
  y: number;
}

/** mutable tuple 형태의 2D 좌표 output. */
export type XYTupleWritable = [x: number, y: number];

/** vectra Into 함수가 좌표 output으로 받는 writable structural union. */
export type XYWritable = XYObjectWritable | XYTupleWritable;
