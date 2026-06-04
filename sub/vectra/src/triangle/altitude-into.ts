import { hasNonFiniteVertex, readTriangleRawCoords } from '../internal/triangle';
import { writeXY } from '../internal/xy';
import type { SegmentWritable, TriangleLike, XYWritable } from '../types';

/**
 * triangle의 index vertex에서 맞은편 side로 내린 수선(altitude)을 out에 기록하고 out을 반환한다.
 *
 * index semantics (sideAtInto와 동일한 opposite side 기준):
 * - index 0 → vertex A에서 side BC(b→c)로 내린 수선
 * - index 1 → vertex B에서 side CA(c→a)로 내린 수선
 * - index 2 → vertex C에서 side AB(a→b)로 내린 수선
 *
 * out.a는 source vertex, out.b는 foot(수선의 발)이다.
 *
 * 다음 경우 false를 반환하고 out을 수정하지 않는다:
 * - invalid index (음수, 3 이상, NaN)
 * - non-finite vertex 좌표
 * - opposite side zero-length (lenSq === 0 또는 !isFinite)
 *
 * self-aliasing 안전: input 좌표를 모두 local 변수로 읽은 뒤 writeXY를 호출한다.
 *
 * @param out 수선을 기록할 writable output (out.a: source vertex, out.b: foot)
 * @param triangle 수선을 계산할 triangle
 * @param index 수선을 내릴 vertex index (0=A, 1=B, 2=C)
 * @returns out 또는 false(실패)
 */
export function altitudeInto<Out extends SegmentWritable<XYWritable, XYWritable>>(
  out: Out,
  triangle: TriangleLike,
  index: number
): Out | false {
  // invalid index 먼저 검사
  if (index !== 0 && index !== 1 && index !== 2) return false;

  // non-finite vertex 검사
  if (hasNonFiniteVertex(triangle)) return false;

  const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(triangle);

  // source vertex P와 opposite side U→V를 결정한다
  let px: number;
  let py: number;
  let ux: number;
  let uy: number;
  let vx: number;
  let vy: number;

  if (index === 0) {
    // vertex A → side BC
    px = ax;
    py = ay;
    ux = bx;
    uy = by;
    vx = cx;
    vy = cy;
  } else if (index === 1) {
    // vertex B → side CA
    px = bx;
    py = by;
    ux = cx;
    uy = cy;
    vx = ax;
    vy = ay;
  } else {
    // vertex C → side AB
    px = cx;
    py = cy;
    ux = ax;
    uy = ay;
    vx = bx;
    vy = by;
  }

  // opposite side direction과 lenSq 계산
  const dx = vx - ux;
  const dy = vy - uy;
  const lenSq = dx * dx + dy * dy;

  // zero-length opposite side 검사
  if (lenSq === 0 || !Number.isFinite(lenSq)) return false;

  // foot 계산: t = ((P - U) · (V - U)) / lenSq
  const t = ((px - ux) * dx + (py - uy) * dy) / lenSq;
  const footX = ux + t * dx;
  const footY = uy + t * dy;

  // self-aliasing 안전: 모든 좌표를 local 변수로 읽은 뒤 기록
  writeXY(out.a, px, py);
  writeXY(out.b, footX, footY);
  return out;
}
