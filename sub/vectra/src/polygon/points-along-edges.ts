import type { PolygonLike, XYObjectWritable } from '../types';
import { pointsAlongEdgesInto } from './points-along-edges-into';

/**
 * polygon boundary를 implicit closed ring으로 보고 arc-length 균등 간격으로 샘플링한 새 point 배열을 반환한다.
 *
 * 마지막 vertex에서 첫 vertex로 닫히는 edge까지 포함한다. 시작점(거리 0)은 항상 포함하고, closed ring이므로
 * 끝점(시작점 복제)은 추가하지 않는다. 0개 point면 빈 배열, 1개이거나 perimeter가 0이면 시작점 1개만 반환한다.
 * `spacing`이 finite positive number가 아니거나 perimeter가 finite가 아니면 RangeError를 던진다.
 * 대응 `pointsAlongEdgesInto`는 input point array와 outPoints가 같은 배열이어도 안전하다.
 *
 * @param polygon boundary를 읽을 polygon
 * @param spacing 균등 간격 (arc-length 단위, finite positive number)
 */
export function pointsAlongEdges(polygon: PolygonLike, spacing: number): XYObjectWritable[] {
  return pointsAlongEdgesInto([], polygon, spacing);
}
