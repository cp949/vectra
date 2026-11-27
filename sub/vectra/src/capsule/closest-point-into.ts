import { validateCapsuleRadius } from '../internal/capsule';
import { segmentClosestPointXY } from '../internal/segment';
import type { Capsule, Point, PointWritable } from '../types/flat-shapes.internal';
import { hypot2 } from '../internal/numeric';

/**
 * capsule closed region에서 point에 가장 가까운 점을 out에 기록하고 out을 반환한다.
 *
 * point가 capsule 내부나 boundary 위에 있으면 input point 좌표 자체를 기록한다. 외부 point는
 * axis segment 위 closest point에서 point 방향으로 radius만큼 나간 boundary point를 기록한다.
 * zero-axis capsule(두 끝점 좌표가 같음)은 시작점 `(x1, y1)`와 radius `r`의 circle region closest point와 같다.
 * `r < 0`와 non-finite radius는 `RangeError`다. endpoint 좌표 non-finite는 별도 검증하지
 * 않고 산술 결과를 따른다. 좌표를 모두 읽은 뒤 기록하므로 out과 point가 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 점 객체
 * @param capsule closest point를 계산할 capsule
 * @param point capsule region에 투영할 point
 */
export function closestPointInto<Out extends PointWritable>(out: Out, capsule: Capsule, point: Point): Out {
  const r = validateCapsuleRadius(capsule.r);
  const { x1, y1, x2, y2 } = capsule;
  const px = point.x;
  const py = point.y;

  const q = segmentClosestPointXY(x1, y1, x2, y2, px, py);
  const dx = px - q.x;
  const dy = py - q.y;
  const dist = hypot2(dx, dy);

  // 내부/boundary point는 region 안에 있으므로 point 자체가 closest point다.
  // dist <= r이면 외부가 아니다. 외부면 dist > r >= 0이라 dist > 0이고 division이 안전하다.
  if (dist <= r) {
    out.x = px;
    out.y = py;
    return out;
  }

  out.x = q.x + (dx / dist) * r;
  out.y = q.y + (dy / dist) * r;
  return out;
}
