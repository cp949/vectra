import { crossExceeds, DEFAULT_EPSILON } from '../internal/numeric';
import type { Polyline, PointWritable } from '../types/flat-shapes.internal';
import { hasNearbyPoint, hasNonFinitePolylinePoint, snapshotPolylinePoints } from './polyline-intersections.internal';
import { rawCrossParams, segmentSegmentDetailXY } from './segment-segment-detail.internal';

interface LocalHit {
  x: number;
  y: number;
  tA: number;
}

/**
 * 두 polyline boundary의 교점을 outPoints에 기록하고 같은 outPoints를 반환한다.
 *
 * subject와 target의 인접 segment를 순서대로 순회하고, bbox가 떨어진 쌍은 필요한 교차 조건을
 * 먼저 확인한다. 남은 쌍을 `segmentSegmentDetail`로 교차시킨다. polyline은 open path이므로
 * 마지막 point에서 첫 point로 닫지 않는다.
 * - transversal crossing은 교점 1점, shared vertex/segment endpoint 중복은 dedupe된 1점이다.
 * - collinear overlap은 clipped overlap start/end 두 점을 노출하고, 두 점이 epsilon 이하로
 *   수렴하면 1점으로 dedupe한다.
 * - zero-length segment는 point relation으로 환원하지 않고 건너뛴다. 두 polyline이 모두 valid
 *   segment가 없으면 빈 배열이다.
 * - `points.length < 2`, 좌표가 하나라도 non-finite이면 빈 배열이다.
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push된다. `outPoints`가 subject/target polyline array와
 * 같은 reference여도 alias-safe하도록 clear 전에 입력 좌표를 snapshot한다. push되는 point는 매 호출 새
 * `{ x, y }` object이며 입력 point object를 재사용하지 않는다. subject와 target이 같은 object여도
 * 입력 좌표를 그대로 재사용하지 않는다. 반환 순서는 subject segment index 오름차순이고, 같은 subject segment 안에서는
 * subject segment-local parameter `t` 오름차순이다(target segment index는 동률 tie-break).
 * `epsilon`은 평행/거리/dedupe 판정에만 쓰고 finite validation에는 쓰지 않는다. range 판정은
 * segment-local parameter의 정확 비교를 따른다.
 *
 * @param outPoints 교점을 기록할 배열. 기존 내용은 비우고 { x, y } 점을 넣는다.
 * @param subject 첫 번째 polyline. point ordering의 기준이다.
 * @param target 두 번째 polyline
 * @param epsilon 평행/거리/dedupe 판정 임계값
 *   생략하면 평행 판정이 `sin θ <= DEFAULT_EPSILON`(scale 불변)이다. 명시하면 `|cross| <= epsilon` 절대 비교다.
 */
export function polylinePolylineIntersectionsInto<Out extends PointWritable[]>(
  outPoints: Out,
  subject: Polyline,
  target: Polyline,
  epsilon?: number
): Out {
  const subPts = snapshotPolylinePoints(subject);
  const tgtPts = snapshotPolylinePoints(target);
  outPoints.length = 0;
  if (subPts.length < 2 || tgtPts.length < 2) return outPoints;
  if (hasNonFinitePolylinePoint(subPts) || hasNonFinitePolylinePoint(tgtPts)) return outPoints;

  const distEpsilon = epsilon ?? DEFAULT_EPSILON;
  if (!Number.isFinite(distEpsilon)) return outPoints;
  const epsSq = distEpsilon * distEpsilon;

  const targetBounds = new Float64Array(4 * (tgtPts.length - 1));
  let targetScale = Math.max(Math.abs(tgtPts[0].x), Math.abs(tgtPts[0].y));
  for (let j = 0; j < tgtPts.length - 1; j++) {
    const { x: x0, y: y0 } = tgtPts[j];
    const { x: x1, y: y1 } = tgtPts[j + 1];
    targetBounds[4 * j] = Math.min(x0, x1);
    targetBounds[4 * j + 1] = Math.max(x0, x1);
    targetBounds[4 * j + 2] = Math.min(y0, y1);
    targetBounds[4 * j + 3] = Math.max(y0, y1);
    targetScale = Math.max(targetScale, Math.abs(x1), Math.abs(y1));
  }

  for (let i = 0; i < subPts.length - 1; i++) {
    const { x: ax0, y: ay0 } = subPts[i];
    const { x: ax1, y: ay1 } = subPts[i + 1];
    // zero-length subject segment는 point relation으로 환원하지 않고 건너뛴다.
    if (ax0 === ax1 && ay0 === ay1) continue;

    const aMinX = Math.min(ax0, ax1);
    const aMaxX = Math.max(ax0, ax1);
    const aMinY = Math.min(ay0, ay1);
    const aMaxY = Math.max(ay0, ay1);
    const adx = ax1 - ax0;
    const ady = ay1 - ay0;
    const useX = Math.abs(adx) >= Math.abs(ady);
    const dominant = useX ? adx : ady;
    const minor = useX ? ady : adx;
    const aLenSq = adx * adx + ady * ady;
    // 차분과 투영 구간의 매개변수가 유한하고, 거리 정규화 후에도 지배 축이 남는 범위다.
    const canReject =
      Math.max(targetScale, Math.abs(ax0), Math.abs(ay0), Math.abs(ax1), Math.abs(ay1)) <= 1e75 &&
      Math.abs(dominant) >= 1e-150;

    const local: LocalHit[] = [];
    for (let j = 0; j < tgtPts.length - 1; j++) {
      const { x: bx0, y: by0 } = tgtPts[j];
      const { x: bx1, y: by1 } = tgtPts[j + 1];
      // zero-length target segment도 동일하게 건너뛴다.
      if (bx0 === bx1 && by0 === by1) continue;

      const k = 4 * j;
      if (
        canReject &&
        (targetBounds[k + 1] < aMinX ||
          aMaxX < targetBounds[k] ||
          targetBounds[k + 3] < aMinY ||
          aMaxY < targetBounds[k + 2])
      ) {
        const bdx = bx1 - bx0;
        const bdy = by1 - by0;
        const cross = adx * bdy - ady * bdx;
        const qx = bx0 - ax0;
        const qy = by0 - ay0;
        if (crossExceeds(cross, epsilon, aLenSq, bdx * bdx + bdy * bdy)) {
          // cross가 유한한 비평행 쌍은 거리로 공선으로 분류돼도 동일한 raw range 검사를 통과해야 한다.
          const { tA, tB } = rawCrossParams(qx, qy, adx, ady, bdx, bdy, cross);
          if (!(tA >= 0 && tA <= 1 && tB >= 0 && tB <= 1)) continue;
        } else {
          // detail과 같은 지배 축으로 나눈다. 두 값이 같으면 구간 대신 끝점 후보를 검사한다.
          const tStart = (useX ? qx : qy) / dominant;
          const tEnd = (useX ? bx1 - ax0 : by1 - ay0) / dominant;
          if (tStart !== tEnd && ((tStart < 0 && tEnd < 0) || (tStart > 1 && tEnd > 1))) continue;

          // 길이 정규화에서 지배 축 성분은 0이 되지 않는다. 따라서 pointLineDist는
          // 축에 투영한 잔차에 |dominant| / hypot(adx, ady) ≥ 1/2를 곱한 거리 이상이다.
          const residual = (useX ? qy : qx) - tStart * minor;
          if (Math.abs(residual) * 0.5 > distEpsilon) continue;
        }
      }

      const detail = segmentSegmentDetailXY(ax0, ay0, ax1, ay1, bx0, by0, bx1, by1, epsilon);
      if (detail.kind === 'point') {
        local.push({ x: detail.point.x, y: detail.point.y, tA: detail.tA });
      } else if (detail.kind === 'overlap') {
        local.push({ x: detail.start.x, y: detail.start.y, tA: detail.tA[0] });
        local.push({ x: detail.end.x, y: detail.end.y, tA: detail.tA[1] });
      }
    }

    // 같은 subject segment 안에서는 segment-local parameter tA 오름차순으로 정렬한다.
    // 동률 tA(같은 좌표)는 stable sort로 target segment index 순서를 유지하고 dedupe로 1점만 남는다.
    local.sort((p, q) => p.tA - q.tA);
    for (let k = 0; k < local.length; k++) {
      if (!hasNearbyPoint(outPoints, local[k].x, local[k].y, epsSq)) {
        outPoints.push({ x: local[k].x, y: local[k].y });
      }
    }
  }

  return outPoints;
}
