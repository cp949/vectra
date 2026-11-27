import type { BoundsWritable, Triangle } from '../types/flat-shapes.internal';

/**
 * triangle 세 vertex의 min/max extent를 계산해 out에 기록하고 반환한다.
 *
 * vertex 순서에 관계없이 실제 min/max를 계산한다.
 * degenerate triangle(collinear, 점 하나로 수렴)도 inverted bounds가 아닌 실제 extent를 기록한다.
 * non-finite vertex는 IEEE 754 전파 규칙을 따른다.
 *
 * @param out 최솟값과 최댓값을 기록할 bounds 객체
 * @param triangle bounds를 계산할 triangle
 * @returns out
 */
export function boundsInto<Out extends BoundsWritable>(out: Out, triangle: Triangle): Out {
  const { x1: ax, y1: ay, x2: bx, y2: by, x3: cx, y3: cy } = triangle;
  const minX = Math.min(ax, bx, cx);
  const minY = Math.min(ay, by, cy);
  const maxX = Math.max(ax, bx, cx);
  const maxY = Math.max(ay, by, cy);
  out.minX = minX;
  out.minY = minY;
  out.maxX = maxX;
  out.maxY = maxY;
  return out;
}
