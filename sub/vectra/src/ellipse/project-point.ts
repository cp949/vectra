import type { EllipseLike, XYInput, XYObjectWritable } from '../types';
import { projectPointInto } from './project-point-into';

/**
 * point를 ellipse boundary에 Euclidean closest projection으로 투영해 새 plain object로 반환한다.
 *
 * 내부 점도 boundary closest projection을 반환한다 (`closestPoint`와 동일 semantics).
 * empty ellipse(`radiusX <= 0 || radiusY <= 0`)는 center를 반환한다.
 * `point === ellipse.center` tie-break는 `(cx + radiusX, cy)`이다.
 * 반복 수치 해법이다. 수렴 실패 시 마지막 반복 값을 사용한다.
 *
 * @param ellipse projection 기준 ellipse
 * @param point projection할 기준 point
 * @param epsilon Newton-Raphson 수렴 판정 임계값. 기본값: 1e-10
 */
export function projectPoint(ellipse: EllipseLike, point: XYInput, epsilon?: number): XYObjectWritable {
  return projectPointInto({ x: 0, y: 0 }, ellipse, point, epsilon);
}
