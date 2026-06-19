const TWO_PI = Math.PI * 2;

/**
 * center 기준 정규화 offset의 turn parameter를 `[0, 1)`로 canonicalize한다.
 *
 * `atan2(dy, dx) / 2π`는 `(-0.5, 0.5]`를 반환하므로 `floor` 차감으로 `[0, 1)`로 옮긴다.
 * float 반올림으로 정확히 `1.0`이 되는 turn은 `0`으로 접는다.
 */
export function canonTurn(dx: number, dy: number): number {
  const t = Math.atan2(dy, dx) / TWO_PI;
  const turn = t - Math.floor(t);
  return turn < 1 ? turn : 0;
}

/** 정규화 좌표에서 ellipse 방정식 residual `|((x-cx)/rx)² + ((y-cy)/ry)² - 1|`을 구한다. */
export function ellipseResidual(x: number, y: number, cx: number, cy: number, invRx2: number, invRy2: number): number {
  const dx = x - cx;
  const dy = y - cy;
  return Math.abs(dx * dx * invRx2 + dy * dy * invRy2 - 1);
}

/** 정규화 좌표에서 점 `(x, y)`가 ellipse(center, inv radius²) 내부 또는 경계인지 판정한다. */
export function pointInEllipseClosedN(
  x: number,
  y: number,
  cx: number,
  cy: number,
  invRx2: number,
  invRy2: number,
  epsilon: number
): boolean {
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx * invRx2 + dy * dy * invRy2 <= 1 + epsilon;
}

export interface Hit {
  x: number;
  y: number;
  turn: number;
}
