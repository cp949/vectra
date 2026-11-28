/**
 * 삼각형의 각 꼭짓점에 대한 barycentric 가중치다.
 *
 * 반복 호출에는 필드 구성과 순서가 같은 객체를 넘긴다.
 */
export interface Barycentric {
  /** barycentric 좌표 u (vertex A 가중치) */
  readonly x: number;

  /** barycentric 좌표 v (vertex B 가중치) */
  readonly y: number;

  /** barycentric 좌표 w (vertex C 가중치) */
  readonly w: number;
}

/** barycentric 좌표를 기록할 수 있는 writable output type. */
export interface BarycentricWritable extends Barycentric {
  /** barycentric 좌표 u (vertex A 가중치) */
  x: number;

  /** barycentric 좌표 v (vertex B 가중치) */
  y: number;

  /** barycentric 좌표 w (vertex C 가중치) */
  w: number;
}
