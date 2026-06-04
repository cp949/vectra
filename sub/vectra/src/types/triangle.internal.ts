import type { XYInput, XYObjectWritable, XYWritable } from './xy.internal';

/** tuple 형태의 structural triangle input. */
export type TriangleTuple = readonly [a: XYInput, b: XYInput, c: XYInput];

/** 세 vertex로 표현하는 structural triangle object input. */
export interface TriangleObjectLike {
  /** triangle 첫 번째 vertex */
  readonly a: XYInput;
  /** triangle 두 번째 vertex */
  readonly b: XYInput;
  /** triangle 세 번째 vertex */
  readonly c: XYInput;
}

/** 세 vertex로 표현하는 structural triangle input. */
export type TriangleLike = TriangleTuple | TriangleObjectLike;

/** 세 writable vertex에 결과를 기록할 수 있는 structural triangle output. */
export interface TriangleWritable<
  A extends XYWritable = XYObjectWritable,
  B extends XYWritable = XYObjectWritable,
  C extends XYWritable = XYObjectWritable,
> {
  /** 기록 가능한 첫 번째 vertex */
  a: A;
  /** 기록 가능한 두 번째 vertex */
  b: B;
  /** 기록 가능한 세 번째 vertex */
  c: C;
}

/** barycentric 좌표 input type. x = u (vertex A 가중치), y = v (vertex B 가중치), w = w (vertex C 가중치). */
export interface BarycentricLike {
  /** barycentric 좌표 u (vertex A 가중치) */
  readonly x: number;

  /** barycentric 좌표 v (vertex B 가중치) */
  readonly y: number;

  /** barycentric 좌표 w (vertex C 가중치) */
  readonly w: number;
}

/** barycentric 좌표를 기록할 수 있는 writable output type. */
export interface BarycentricWritable extends BarycentricLike {
  /** barycentric 좌표 u (vertex A 가중치) */
  x: number;

  /** barycentric 좌표 v (vertex B 가중치) */
  y: number;

  /** barycentric 좌표 w (vertex C 가중치) */
  w: number;
}
