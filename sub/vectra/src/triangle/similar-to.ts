import { hasNonFiniteVertex, readTriangleRawCoords, triangleSignedArea2x } from '../internal/triangle';
import type { TriangleLike } from '../types';

/**
 * 두 triangle이 닮음(similar)인지 boolean으로 반환한다.
 *
 * fixed vertex correspondence를 사용한다: A↔A', B↔B', C↔C'. 대응 변은 AB↔A'B', BC↔B'C',
 * CA↔C'A'. vertex permutation matching은 하지 않으므로 같은 모양이라도 vertex order가 다르면
 * 대응 변 ratio가 어긋나 false가 될 수 있다.
 *
 * 판정: 세 대응 변 ratio(`|A'B'|/|AB|`, `|B'C'|/|BC|`, `|C'A'|/|CA|`)가 서로 epsilon 이내로
 * 같으면 닮음이다. epsilon은 ratio 차이의 절대 허용오차이며 기본값은 1e-9다.
 *
 * orientation: 기본 reflection 불허. 두 triangle의 signedArea 부호가 다르면 false.
 * allowReflection이 true면 부호 차이를 무시한다.
 *
 * degenerate triangle(둘 중 하나라도 signedArea === 0)이거나 non-finite vertex이면 false.
 * degenerate를 먼저 배제하므로 모든 변 길이 > 0이고 ratio 분모는 0이 아니다.
 *
 * @param a 비교할 첫 번째 triangle
 * @param b 비교할 두 번째 triangle
 * @param options.epsilon ratio 차이 절대 허용오차 (기본값 1e-9, 음수이면 RangeError)
 * @param options.allowReflection true면 orientation 부호 차이를 허용한다 (기본값 false)
 */
export function similarTo(
  a: TriangleLike,
  b: TriangleLike,
  options?: { epsilon?: number; allowReflection?: boolean }
): boolean {
  const epsilon = options?.epsilon ?? 1e-9;
  if (epsilon < 0) throw new RangeError('epsilon must be non-negative');
  const allowReflection = options?.allowReflection ?? false;

  if (hasNonFiniteVertex(a) || hasNonFiniteVertex(b)) return false;

  const area2xA = triangleSignedArea2x(a);
  const area2xB = triangleSignedArea2x(b);
  // degenerate triangle은 닮음 판정 대상이 아니다(변 길이 0 분모도 함께 배제한다).
  if (area2xA === 0 || area2xB === 0) return false;

  // 기본 reflection 불허: orientation 부호가 다르면 false.
  if (!allowReflection && Math.sign(area2xA) !== Math.sign(area2xB)) return false;

  const ca = readTriangleRawCoords(a);
  const cb = readTriangleRawCoords(b);
  const rAB = Math.hypot(cb.bx - cb.ax, cb.by - cb.ay) / Math.hypot(ca.bx - ca.ax, ca.by - ca.ay);
  const rBC = Math.hypot(cb.cx - cb.bx, cb.cy - cb.by) / Math.hypot(ca.cx - ca.bx, ca.cy - ca.by);
  const rCA = Math.hypot(cb.ax - cb.cx, cb.ay - cb.cy) / Math.hypot(ca.ax - ca.cx, ca.ay - ca.cy);

  // pairwise 비교(세 조건 모두 유지). 절대 허용오차이므로 |rCA - rAB|는 앞 두 조건에서 <= 2·epsilon만
  // 보장돼 transitive하지 않다. 세 번째 조건을 지우면 허용오차가 느슨해지므로 제거하지 않는다.
  return Math.abs(rAB - rBC) <= epsilon && Math.abs(rBC - rCA) <= epsilon && Math.abs(rCA - rAB) <= epsilon;
}
