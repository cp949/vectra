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
