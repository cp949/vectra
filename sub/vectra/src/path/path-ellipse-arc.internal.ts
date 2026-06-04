import type { PathCommand } from '../types/index';

/** circle/ellipse cubic Bezier 근사 공통 옵션. */
export interface EllipseArcOptions {
  /** true = clockwise (SVG y-down 좌표계 기본). 기본값 true. */
  clockwise?: boolean;
}

/**
 * cubic Bezier quarter-arc 근사 상수.
 *
 * kappa = (4/3) * (sqrt(2) - 1) ≈ 0.5522847498. 단위원 90° 호를 단일 cubic Bezier로
 * 근사할 때 control point handle 길이 비율이다. 최대 반경 오차는 약 0.00027r로 작다.
 */
export const KAPPA = 0.5522847498;

/**
 * ellipse parameter angle θ에서 unsigned 곡률을 반환한다.
 *
 * 공식: `κ(θ) = rx * ry / (rx² sin²θ + ry² cos²θ)^(3/2)`.
 * `rx`, `ry`는 양수 가정이며 호출자가 보장한다. 분모가 `0`이면 `Infinity`로 흐른다.
 * non-finite `theta` 입력은 sin/cos가 NaN을 만들어 결과도 NaN으로 흐른다 (caller 책임).
 * 단위는 1 / length. circular 케이스(`rx == ry`)는 `1 / rx`로 수렴한다.
 *
 * @param rx ellipse x축 반지름 (양수)
 * @param ry ellipse y축 반지름 (양수)
 * @param theta ellipse parameter angle (radian)
 */
export function ellipseArcCurvature(rx: number, ry: number, theta: number): number {
  const sinT = Math.sin(theta);
  const cosT = Math.cos(theta);
  const denom = Math.hypot(rx * sinT, ry * cosT);
  return (rx * ry) / (denom * denom * denom);
}

/**
 * center (cx, cy), 반경 (rx, ry) 타원을 move + 4 cubic + close로 out에 기록하고 out을 반환한다.
 *
 * `circleCommandsInto`/`ellipseCommandsInto` 공유 구성 로직이다. 공개 함수 상호 참조를
 * 피하기 위해 internal helper로 분리한다. 시작점은 (cx + rx, cy)이며 4개의 90° cubic
 * Bezier로 한 바퀴를 근사한다. out을 clear(length = 0) 후 push로 채운다. degenerate
 * 반경(0, 음수)도 validation 없이 그대로 사용한다.
 *
 * @param out command를 기록할 mutable PathCommand 배열
 * @param cx 중심 x
 * @param cy 중심 y
 * @param rx x축 반경
 * @param ry y축 반경
 * @param clockwise true면 SVG y-down clockwise 방향, false면 counter-clockwise
 */
export function ellipseArcInto<Out extends PathCommand[]>(
  out: Out,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  clockwise: boolean
): Out {
  // s = +1이면 y-down clockwise, -1이면 counter-clockwise. handle 길이 = kappa * 반경.
  const s = clockwise ? 1 : -1;
  const ox = KAPPA * rx;
  const oy = KAPPA * ry;

  out.length = 0;
  out.push({ kind: 'move', x: cx + rx, y: cy } as Out[number]);

  // (cx+rx, cy) → (cx, cy+s·ry)
  out.push({
    kind: 'cubic',
    x1: cx + rx,
    y1: cy + s * oy,
    x2: cx + ox,
    y2: cy + s * ry,
    x: cx,
    y: cy + s * ry,
  } as Out[number]);
  // → (cx-rx, cy)
  out.push({
    kind: 'cubic',
    x1: cx - ox,
    y1: cy + s * ry,
    x2: cx - rx,
    y2: cy + s * oy,
    x: cx - rx,
    y: cy,
  } as Out[number]);
  // → (cx, cy-s·ry)
  out.push({
    kind: 'cubic',
    x1: cx - rx,
    y1: cy - s * oy,
    x2: cx - ox,
    y2: cy - s * ry,
    x: cx,
    y: cy - s * ry,
  } as Out[number]);
  // → (cx+rx, cy)
  out.push({
    kind: 'cubic',
    x1: cx + ox,
    y1: cy - s * ry,
    x2: cx + rx,
    y2: cy - s * oy,
    x: cx + rx,
    y: cy,
  } as Out[number]);

  out.push({ kind: 'close' } as Out[number]);
  return out;
}
