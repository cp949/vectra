import { readTriangleRawCoords } from '../internal/triangle';
import type { TriangleLike } from '../types';

/** 두 벡터 사이의 각도(radian)를 반환한다. 영벡터 방향이면 0을 반환한다. */
function angleBetween(dx1: number, dy1: number, dx2: number, dy2: number): number {
  const len1 = Math.hypot(dx1, dy1);
  const len2 = Math.hypot(dx2, dy2);
  if (len1 === 0 || len2 === 0) return 0;
  const cos = Math.max(-1, Math.min(1, (dx1 * dx2 + dy1 * dy2) / (len1 * len2)));
  return Math.acos(cos);
}

/**
 * triangle의 세 내각(radian)을 계산해 out에 순서대로 push한다.
 *
 * out.length를 먼저 0으로 초기화하고, vertex A, B, C 순으로 내각을 push한다.
 * degenerate triangle도 raw 산식으로 계산한다(0 또는 π 포함 가능).
 * 영벡터 방향이 있으면 해당 내각을 0으로 push한다.
 *
 * @param out 내각을 기록할 number 배열
 * @param triangle 내각을 계산할 triangle
 * @returns out
 */
export function interiorAnglesInto(out: number[], triangle: TriangleLike): number[] {
  const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(triangle);
  out.length = 0;
  // At A: vectors AB, AC
  out.push(angleBetween(bx - ax, by - ay, cx - ax, cy - ay));
  // At B: vectors BA, BC
  out.push(angleBetween(ax - bx, ay - by, cx - bx, cy - by));
  // At C: vectors CA, CB
  out.push(angleBetween(ax - cx, ay - cy, bx - cx, by - cy));
  return out;
}
