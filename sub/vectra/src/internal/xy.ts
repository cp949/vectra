import type { XYInput, XYObjectWritable, XYTupleWritable, XYWritable } from '../types';

/** input이 tuple 좌표이면 true를 반환한다. */
function isXYTuple(input: XYInput): input is readonly [number, number] {
  return Array.isArray(input);
}

/** out이 mutable tuple 좌표이면 true를 반환한다. */
function isXYTupleWritable(out: XYWritable): out is XYTupleWritable {
  return Array.isArray(out);
}

/**
 * XYInput에서 x 좌표를 읽는다.
 *
 * tuple input은 index 0을, object input은 x field를 읽는다.
 *
 * @param input x 좌표를 읽을 structural point
 */
export function readX(input: XYInput): number {
  return isXYTuple(input) ? input[0] : input.x;
}

/**
 * XYInput에서 y 좌표를 읽는다.
 *
 * tuple input은 index 1을, object input은 y field를 읽는다.
 *
 * @param input y 좌표를 읽을 structural point
 */
export function readY(input: XYInput): number {
  return isXYTuple(input) ? input[1] : input.y;
}

/**
 * XYWritable에 x/y 좌표를 기록하고 out을 반환한다.
 *
 * mutable tuple output은 index 0/1에 쓰고, object output은 x/y field에 쓴다.
 *
 * @param out 좌표를 기록할 writable output
 * @param x 기록할 x 좌표
 * @param y 기록할 y 좌표
 */
export function writeXY<Out extends XYWritable>(out: Out, x: number, y: number): Out {
  if (isXYTupleWritable(out)) {
    out[0] = x;
    out[1] = y;
  } else {
    // generic Out의 narrowing 한계로 캐스트 — tuple writable 분기가 아니면 object writable이다
    (out as XYObjectWritable).x = x;
    (out as XYObjectWritable).y = y;
  }

  return out;
}

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
