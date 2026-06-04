import type { PathCommand, XYInput } from '../types';
import { writeStepPath } from './step.internal';

/**
 * point list를 'after' mode orthogonal step path로 변환해 out에 기록하고 out을 반환한다.
 *
 * segment p0→p1에서 (x0,y1) elbow를 거쳐 끝점에 도달한다. `stepPathInto`의 mode:'after'와 같다.
 * 결과는 move 1개 뒤 line command로 구성된다. close는 자동 추가하지 않는다.
 * points.length < 2이면 out.length를 0으로 두고 반환한다.
 * consecutive duplicate point는 제거하지 않는다. non-finite 좌표는 산술 결과 그대로 pass-through한다.
 *
 * @param out command를 기록할 PathCommand 배열. 기존 내용은 덮어쓴다.
 * @param points step path가 통과할 입력 point 배열
 * @returns out
 */
export function stepAfterPathInto<Out extends PathCommand[]>(out: Out, points: readonly XYInput[]): Out {
  return writeStepPath(out, points, 'after');
}
