import type { Ellipse, PointWritable } from '../types/flat-shapes.internal';

/**
 * `pointsInto` / `points` 옵션.
 *
 * 객체를 생략하면 segments는 64, startAngle은 0 (+x 축), clockwise는 true (SVG y-down)다.
 */
export interface EllipsePointsOptions {
  /** sample 개수. 1 이상 정수. */
  segments: number;
  /** 첫 sample의 각도. radian. */
  startAngle: number;
  /** true면 SVG y-down clockwise. */
  clockwise: boolean;
}

/**
 * ellipse boundary 위 angle-uniform sample point 모음을 out에 기록하고 out을 반환한다.
 *
 * 옵션 생략 시 기본값: `segments = 64`, `startAngle = 0`, `clockwise = true` (SVG y-down clockwise).
 * 공식: `cx + cos(θ) * rx`, `cy + sin(θ) * ry`. arc-length uniform이 아니라
 * parametric angle uniform이다. 한쪽 radius가 훨씬 크면 sample 간격이 불균등해진다.
 * empty ellipse(`rx <= 0 || ry <= 0`)는 각 sample을 center 좌표로 기록한다.
 * 음수/-Infinity radius도 `rx <= 0` empty 분기로 흘러 center를 기록한다
 * (`pointAtAngleInto` 정책 일치). NaN/+Infinity radius만 산술 분기로 흘러 NaN/Infinity 좌표를 기록한다.
 * non-finite center/`startAngle`은 검증 없이 JS 산술 결과를 기록한다.
 * `segments`가 1 이상 정수가 아니면 (`0`, 음수, non-integer, NaN, ±Infinity 포함)
 * `RangeError`를 던지고 `out`을 수정하지 않는다 (`out.length = 0`도 수행하지 않음).
 * 성공 시 `out.length = 0`으로 비우고 `{ x, y }` plain object를 push한다.
 *
 * @param out sample point object를 기록할 mutable 배열
 * @param ellipse boundary를 sampling할 ellipse
 * @param options `segments`/`startAngle`/`clockwise`. 객체를 생략하면 기본값을 사용한다.
 */
export function pointsInto(out: PointWritable[], ellipse: Ellipse, options?: EllipsePointsOptions): PointWritable[] {
  const segments = options === undefined ? 64 : options.segments;
  if (!Number.isInteger(segments) || segments < 1) {
    throw new RangeError('pointsInto: segments must be an integer >= 1');
  }

  const startAngle = options === undefined ? 0 : options.startAngle;
  const clockwise = options === undefined ? true : options.clockwise;
  const cx = ellipse.cx;
  const cy = ellipse.cy;
  const rx = ellipse.rx;
  const ry = ellipse.ry;

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
