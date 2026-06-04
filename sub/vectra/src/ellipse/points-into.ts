import { readEllipseCenter, readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import { readX, readY } from '../internal/xy';
import type { EllipseLike, XYObjectWritable } from '../types';

/**
 * `pointsInto` / `points` 옵션.
 *
 * 표면은 `RegularPolygonOptions`와 비슷하지만 default가 다르므로 별도 정의한다.
 * `startAngle` 기본값은 `0` (위가 아닌 +x 축 시작), `clockwise` 기본값은 `true` (SVG y-down).
 */
export interface EllipsePointsOptions {
  /** sample 개수. 1 이상 정수. 기본값 `64`. */
  segments?: number;
  /** 첫 sample의 각도. radian. 기본값 `0` (+x 축). */
  startAngle?: number;
  /** true면 SVG y-down clockwise. 기본값 `true`. */
  clockwise?: boolean;
}

/**
 * ellipse boundary 위 angle-uniform sample point 모음을 out에 기록하고 out을 반환한다.
 *
 * 기본값: `segments = 64`, `startAngle = 0`, `clockwise = true` (SVG y-down clockwise).
 * 공식: `cx + cos(θ) * radiusX`, `cy + sin(θ) * radiusY`. arc-length uniform이 아니라
 * parametric angle uniform이다. 한쪽 radius가 훨씬 크면 sample 간격이 불균등해진다.
 * empty ellipse(`radiusX <= 0 || radiusY <= 0`)는 각 sample을 center 좌표로 기록한다.
 * 음수/-Infinity radius도 `rx <= 0` empty 분기로 흘러 center를 기록한다
 * (`pointAtAngleInto` 정책 일치). NaN/+Infinity radius만 산술 분기로 흘러 NaN/Infinity 좌표를 기록한다.
 * non-finite center/`startAngle`은 검증 없이 JS 산술 결과를 기록한다.
 * `segments`가 1 이상 정수가 아니면 (`0`, 음수, non-integer, NaN, ±Infinity 포함)
 * `RangeError`를 던지고 `out`을 수정하지 않는다 (`out.length = 0`도 수행하지 않음).
 * 성공 시 `out.length = 0`으로 비우고 `{ x, y }` plain object를 push한다.
 *
 * @param out sample point object를 기록할 mutable 배열
 * @param ellipse boundary를 sampling할 ellipse
 * @param options `segments`/`startAngle`/`clockwise`. 기본 `segments = 64`, `startAngle = 0`, `clockwise = true`
 */
export function pointsInto<Out extends XYObjectWritable[]>(
  out: Out,
  ellipse: EllipseLike,
  options?: EllipsePointsOptions
): Out {
  const segments = options?.segments ?? 64;
  if (!Number.isInteger(segments) || segments < 1) {
    throw new RangeError('pointsInto: segments must be an integer >= 1');
  }

  const startAngle = options?.startAngle ?? 0;
  const clockwise = options?.clockwise ?? true;
  const cx = readX(readEllipseCenter(ellipse));
  const cy = readY(readEllipseCenter(ellipse));
  const rx = readEllipseRadiusX(ellipse);
  const ry = readEllipseRadiusY(ellipse);

  out.length = 0;
  // empty ellipse는 각 sample을 center로 기록한다 (pointAtAngleInto 정책 일치)
  if (rx <= 0 || ry <= 0) {
    for (let i = 0; i < segments; i++) out.push({ x: cx, y: cy });
    return out;
  }

  const step = ((clockwise ? 1 : -1) * (2 * Math.PI)) / segments;
  for (let i = 0; i < segments; i++) {
    const angle = startAngle + step * i;
    out.push({ x: cx + Math.cos(angle) * rx, y: cy + Math.sin(angle) * ry });
  }
  return out;
}
