/**
 * (ax, ay)와 (bx, by) 사이의 squared Euclidean distance를 반환한다.
 *
 * `vec.distanceSq` public leaf를 직접 import할 수 없는 internal hot path
 * (snap candidate ranking, segment-point 거리 비교 등)에서 공유한다.
 *
 * @param ax 첫 점 x
 * @param ay 첫 점 y
 * @param bx 둘째 점 x
 * @param by 둘째 점 y
 */
export function distanceSqXY(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}
