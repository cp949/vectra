import type { TriangleLike, XYWritable } from '../types';
import { hasNonFiniteVertex, readTriangleRawCoords, triangleSignedArea2x } from './triangle';
import { writeXY } from './xy';

/**
 * triangle의 외심(circumcenter)을 out에 기록하고 성공 여부를 반환한다.
 *
 * triangle circumcenter 계열 leaf(circumcenter, circumcircle, circumradius, euler-line,
 * nine-point-circle, orthocenter)가 공유하는 kernel이다.
 *
 * - non-finite vertex 또는 signedArea2x === 0이면 out을 수정하지 않고 false를 반환한다.
 * - 성공하면 out에 (x, y)를 기록하고 true를 반환한다.
 * - 입력 triangle의 좌표를 모두 읽은 뒤에 out에 쓴다. out이 vertex와 alias여도 안전하다.
 *
 * denominator D는 guard에 쓰인 signed area와 같은 전개(D === 2 × signedArea2x)로 묶는다.
 * raw 좌표 전개 D = 2*(ax*(by-cy)+...)는 float 반올림이 달라 near-collinear(signedArea2x≠0)에서
 * D=0이 될 수 있다. 그러면 guard를 통과한 뒤 division-by-zero로 Infinity를 쓴다.
 * 따라서 성공이면 D≠0이고 결과는 유한하다.
 *
 * 반지름 등 파생 값은 호출 leaf가 계산한다.
 *
 * @param out 외심 좌표를 기록할 writable output
 * @param triangle 외심을 계산할 triangle
 * @returns 성공하면 true, degenerate triangle이면 false
 */
export function solveTriangleCircumcenter(out: XYWritable, triangle: TriangleLike): boolean {
  if (hasNonFiniteVertex(triangle)) return false;
  const area2x = triangleSignedArea2x(triangle);
  if (area2x === 0) return false;
  const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(triangle);
  const D = 2 * area2x;
  const a2 = ax ** 2 + ay ** 2;
  const b2 = bx ** 2 + by ** 2;
  const c2 = cx ** 2 + cy ** 2;
  const ux = (a2 * (by - cy) + b2 * (cy - ay) + c2 * (ay - by)) / D;
  const uy = (a2 * (cx - bx) + b2 * (ax - cx) + c2 * (bx - ax)) / D;
  writeXY(out, ux, uy);
  return true;
}
