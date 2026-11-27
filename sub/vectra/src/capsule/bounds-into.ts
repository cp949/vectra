import { validateCapsuleRadius } from '../internal/capsule';
import type { BoundsWritable, Capsule } from '../types/flat-shapes.internal';

/**
 * capsule closed region을 포함하는 axis-aligned bounds를 out에 기록하고 out을 반환한다.
 *
 * bounds는 두 endpoint extent를 radius만큼 확장한 사각형이다. zero-axis capsule(두 끝점 좌표가 같음)도
 * 시작점 `(x1, y1)`와 radius `r`의 circle region AABB를 기록한다. `r < 0`와 non-finite radius는
 * `RangeError`다. endpoint 좌표 non-finite는 별도 검증하지 않고 산술 결과를 따른다. endpoint
 * 좌표와 radius를 먼저 읽으므로 input과 out이 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 경계 상자 객체
 * @param capsule bounds로 변환할 capsule
 */
export function boundsInto<Out extends BoundsWritable>(out: Out, capsule: Capsule): Out {
  const r = validateCapsuleRadius(capsule.r);
  const { x1, y1, x2, y2 } = capsule;

  out.minX = Math.min(x1, x2) - r;
  out.minY = Math.min(y1, y2) - r;
  out.maxX = Math.max(x1, x2) + r;
  out.maxY = Math.max(y1, y2) + r;
  return out;
}
