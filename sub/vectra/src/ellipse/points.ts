import type { EllipseLike, XYObjectWritable } from '../types';
import type { EllipsePointsOptions } from './points-into';
import { pointsInto } from './points-into';

/**
 * ellipse boundary 위 angle-uniform sample point 모음을 새 plain object 배열로 반환한다.
 *
 * 기본값: `segments = 64`, `startAngle = 0`, `clockwise = true` (SVG y-down clockwise).
 * 공식: `cx + cos(θ) * radiusX`, `cy + sin(θ) * radiusY`. arc-length uniform이 아니라
 * parametric angle uniform이다. 한쪽 radius가 훨씬 크면 sample 간격이 불균등해진다.
 * empty ellipse(`radiusX <= 0 || radiusY <= 0`)는 각 sample을 center 좌표로 기록한다.
 * 음수/-Infinity radius도 `rx <= 0` empty 분기로 흘러 center를 기록한다
 * (`pointAtAngleInto` 정책 일치). NaN/+Infinity radius만 산술 분기로 흘러 NaN/Infinity 좌표를 기록한다.
 * non-finite center/`startAngle`은 검증 없이 JS 산술 결과를 기록한다.
 * `segments`가 1 이상 정수가 아니면 (`0`, 음수, non-integer, NaN, ±Infinity 포함) `RangeError`를 던진다.
 *
 * @param ellipse boundary를 sampling할 ellipse
 * @param options `segments`/`startAngle`/`clockwise`. 기본 `segments = 64`, `startAngle = 0`, `clockwise = true`
 */
export function points(ellipse: EllipseLike, options?: EllipsePointsOptions): XYObjectWritable[] {
  return pointsInto<XYObjectWritable[]>([], ellipse, options);
}
