import type { Circle, SegmentWritable } from '../types/flat-shapes.internal';
import { externalTangentsInto } from './external-tangents-into';

/**
 * 두 원의 external tangent segment들을 새 배열로 반환한다.
 *
 * 각 선분의 시작점은 첫 번째 원의 접점이고 끝점은 두 번째 원의 접점이다.
 * 둘 중 하나라도 empty circle(radius <= 0)이면 빈 배열을 반환한다.
 * 중심이 같으면 빈 배열을 반환한다.
 * 한 원이 다른 원 내부에 있어 external tangent가 없으면 빈 배열을 반환한다.
 * 내접 collapse case에서는 같은 segment를 중복 push하지 않는다.
 * non-finite 좌표와 radius는 caller 책임이다.
 *
 * @param circleA 첫 번째 원
 * @param circleB 두 번째 원
 */
export function externalTangents(circleA: Circle, circleB: Circle): SegmentWritable[] {
  return externalTangentsInto([], circleA, circleB);
}
