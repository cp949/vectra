import type { EllipseLike, PathCommand } from '../types/index';
import { fromEllipseInto, type PathFromEllipseOptions } from './from-ellipse-into';

/**
 * ellipse를 angle-uniform polygonal approximation으로 변환한 새 PathCommand[] 배열을 반환한다.
 *
 * 결과 구성: `Move(첫 점) + Line × (segments - 1) + Close`, 총 `segments + 1` command.
 *
 * 공식: `cx + cos(θ) * radiusX`, `cy + sin(θ) * radiusY`. parametric angle uniform sampling이며
 * arc-length uniform이 아니다. `ellipse.pointsInto`와 같은 sampling 전략이다.
 *
 * `ellipseCommandsInto`(4 cubic Bezier 근사)와는 다른 함수다. caller가 segment 개수를 직접 제어하고
 * 싶을 때 쓴다.
 *
 * - 기본값: `segments = 64`, `startAngle = 0`, `clockwise = true`.
 * - `segments`가 1 이상 정수가 아니면 `RangeError`.
 * - empty ellipse(`radiusX <= 0 || radiusY <= 0`) → 빈 배열.
 * - non-finite 입력은 좌표에 NaN/Infinity가 그대로 전파된다. throw 없음.
 *
 * 성능 최적화가 필요하면 `fromEllipseInto`를 사용한다.
 *
 * @param ellipse 변환할 ellipse input
 * @param options segments / startAngle / clockwise
 * @returns 새로 만든 PathCommand 배열
 */
export function fromEllipse(ellipse: EllipseLike, options?: PathFromEllipseOptions): PathCommand[] {
  return fromEllipseInto([], ellipse, options);
}
