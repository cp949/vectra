import type { PathCommand, XYInput } from '../types';
import { stepBeforePathInto } from './step-before-path-into';

/**
 * point list를 'before' mode orthogonal step path로 변환한 새 PathCommand[] 배열을 반환한다.
 *
 * segment p0→p1에서 (x1,y0) elbow를 거쳐 끝점에 도달한다. `stepPath`의 mode:'before'와 같다.
 * 결과는 move 1개 뒤 line command로 구성된다. close는 자동 추가하지 않는다.
 * points.length < 2이면 빈 배열을 반환한다.
 * consecutive duplicate point는 제거하지 않는다. non-finite 좌표는 산술 결과 그대로 pass-through한다.
 * 성능 최적화가 필요하면 `stepBeforePathInto`를 사용한다.
 *
 * @param points step path가 통과할 입력 point 배열
 * @returns 새로 만든 PathCommand 배열
 */
export function stepBeforePath(points: readonly XYInput[]): PathCommand[] {
  return stepBeforePathInto([], points);
}
