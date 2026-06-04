import { hasNonFiniteVertex, readTriangleRawCoords, triangleSignedArea2x } from '../internal/triangle';
import type { CircleWritable, TriangleLike, XYObjectWritable } from '../types';

/**
 * triangle의 방접원(excircle) 3개를 계산해 out에 push하고 out을 반환한다.
 *
 * out은 호출 전에 `out.length = 0`으로 초기화된 뒤 결과를 push한다.
 * 성공 시 index 0은 A-opposite, index 1은 B-opposite, index 2는 C-opposite excircle이다.
 * degenerate triangle(collinear, non-finite vertex, 또는 반둘레 분모가 0인 경우)이면
 * 빈 array를 반환한다.
 * input 좌표는 push 전에 local 변수로 읽어 aliasing을 방지한다.
 *
 * @param out 방접원 3개를 push할 array
 * @param triangle 방접원을 계산할 triangle
 * @returns out (성공 시 length 3, 실패 시 length 0)
 */
export function excirclesInto(
  out: CircleWritable<XYObjectWritable>[],
  triangle: TriangleLike
): CircleWritable<XYObjectWritable>[] {
  out.length = 0;
  if (hasNonFiniteVertex(triangle)) return out;
  const area2x = triangleSignedArea2x(triangle);
  if (area2x === 0) return out;
  // 입력 좌표를 local 변수로 미리 읽어둔다 (aliasing 안전)
  const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(triangle);
  // a = 변 BC (vertex A 맞은편), b = 변 CA, c = 변 AB
  const a = Math.hypot(cx - bx, cy - by);
  const b = Math.hypot(ax - cx, ay - cy);
  const c = Math.hypot(bx - ax, by - ay);
  const da = -a + b + c;
  const db = a - b + c;
  const dc = a + b - c;
  if (da === 0 || db === 0 || dc === 0) return out;
  const eax = (-a * ax + b * bx + c * cx) / da;
  const eay = (-a * ay + b * by + c * cy) / da;
  const ebx = (a * ax - b * bx + c * cx) / db;
  const eby = (a * ay - b * by + c * cy) / db;
  const ecx = (a * ax + b * bx - c * cx) / dc;
  const ecy = (a * ay + b * by - c * cy) / dc;
  // radius = |area| / (s − side) where s = (a+b+c)/2, s−a = da/2, s−b = db/2, s−c = dc/2
  const areaAbs = Math.abs(area2x) / 2;
  const ra = areaAbs / (da / 2);
  const rb = areaAbs / (db / 2);
  const rc = areaAbs / (dc / 2);
  out.push({ center: { x: eax, y: eay }, radius: ra });
  out.push({ center: { x: ebx, y: eby }, radius: rb });
  out.push({ center: { x: ecx, y: ecy }, radius: rc });
  return out;
}
