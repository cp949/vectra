import { readX, readY } from '../internal/xy';
import type { ArcCommand, CenterArcWritable, XYInput } from '../types';

/**
 * SVG 명세 F.6.5에 따라 endpoint arc를 center form으로 변환하여 out에 기록하고 out을 반환한다.
 *
 * - from == arc.endpoint 이면 zero-length(sweep 0) arc로 처리한다.
 *   `startAngle = endAngle = 0`, `cx/cy = from`, `rx/ry = arc.rx/arc.ry`를 기록한다.
 *   결과는 NaN 없이 항상 유효한 struct이다.
 * - rx 또는 ry가 0 이하면 degenerate로 처리해 center를 from/to 중점으로, sweep 0 arc로 기록한다.
 *   이 경우 `out.xRotation`은 `arc.xRotation` 원본값을 그대로 보존한다(caller가 xRotation을
 *   활용할 경우를 고려해 arbitrary 0으로 초기화하지 않는다).
 * - F.6.6.3 radius correction은 내부에서 자동 적용한다.
 * - sweep flag = true(시계 방향, SVG 정의)이면 결과 `endAngle >= startAngle`이다.
 *
 * 이 시점의 angle convention은 endAngle - startAngle의 부호 = (sweep ? +1 : -1) 이다.
 *
 * @param out center form을 기록할 writable output
 * @param from arc 시작점 (current point)
 * @param arc endpoint 형식의 ArcCommand
 * @returns out
 */
export function endpointArcToCenterInto<Out extends CenterArcWritable>(out: Out, from: XYInput, arc: ArcCommand): Out {
  const fromX = readX(from);
  const fromY = readY(from);
  const toX = arc.x;
  const toY = arc.y;

  // F.6.5의 degenerate case: from == to → zero-length arc
  // SVG 명세에서는 segment를 통째로 무시하지만, 우리는 NaN 없이 유효한 struct를 기록한다.
  if (fromX === toX && fromY === toY) {
    out.cx = fromX;
    out.cy = fromY;
    out.rx = arc.rx;
    out.ry = arc.ry;
    out.xRotation = arc.xRotation;
    out.startAngle = 0;
    out.endAngle = 0;
    out.sweep = arc.sweep;
    return out;
  }

  // degenerate radius도 zero-length arc로 처리한다.
  if (!(arc.rx > 0) || !(arc.ry > 0)) {
    out.cx = (fromX + toX) * 0.5;
    out.cy = (fromY + toY) * 0.5;
    out.rx = arc.rx;
    out.ry = arc.ry;
    out.xRotation = arc.xRotation;
    out.startAngle = 0;
    out.endAngle = 0;
    out.sweep = arc.sweep;
    return out;
  }

  const cosPhi = Math.cos(arc.xRotation);
  const sinPhi = Math.sin(arc.xRotation);

  // F.6.5 step 1: midpoint 변환 좌표계로 endpoint 계산
  const dx = (fromX - toX) * 0.5;
  const dy = (fromY - toY) * 0.5;
  const x1p = cosPhi * dx + sinPhi * dy;
  const y1p = -sinPhi * dx + cosPhi * dy;

  // F.6.6.3 lambda 보정 — 표현 불가 범위면 rx/ry를 확대한다.
  let rx = arc.rx;
  let ry = arc.ry;
  const lambda = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
  if (lambda > 1) {
    const s = Math.sqrt(lambda);
    rx *= s;
    ry *= s;
  }

  // F.6.5 step 2: 중심점 변환 좌표 (cx', cy') 계산
  const rxSq = rx * rx;
  const rySq = ry * ry;
  const x1pSq = x1p * x1p;
  const y1pSq = y1p * y1p;

  // 부호: largeArc == sweep 이면 음수, 다르면 양수
  const sign = arc.largeArc === arc.sweep ? -1 : 1;

  // 분자가 음수가 되지 않도록 보호 (수치 오차)
  const numerator = rxSq * rySq - rxSq * y1pSq - rySq * x1pSq;
  const denominator = rxSq * y1pSq + rySq * x1pSq;
  const radicand = denominator === 0 ? 0 : Math.max(numerator / denominator, 0);
  const coef = sign * Math.sqrt(radicand);
  const cxp = coef * ((rx * y1p) / ry);
  const cyp = coef * (-(ry * x1p) / rx);

  // F.6.5 step 3: 원래 좌표계로 center 복원
  const cx = cosPhi * cxp - sinPhi * cyp + (fromX + toX) * 0.5;
  const cy = sinPhi * cxp + cosPhi * cyp + (fromY + toY) * 0.5;

  // F.6.5 step 4: startAngle, deltaAngle 계산
  // u, v 각도 helper: angleBetween((1,0), v)는 atan2(v.y, v.x)
  // start = angle((1,0), ((x1'-cx')/rx, (y1'-cy')/ry))
  // delta = angle(start_vec, ((-x1'-cx')/rx, (-y1'-cy')/ry))
  const ux = (x1p - cxp) / rx;
  const uy = (y1p - cyp) / ry;
  const vx = (-x1p - cxp) / rx;
  const vy = (-y1p - cyp) / ry;

  const startAngle = Math.atan2(uy, ux);

  // signed delta angle 계산
  const dotUV = ux * vx + uy * vy;
  const crossUV = ux * vy - uy * vx;
  let deltaAngle = Math.atan2(crossUV, dotUV);

  // SVG sweep flag 보정: sweep=false면 delta < 0, sweep=true면 delta > 0
  if (!arc.sweep && deltaAngle > 0) {
    deltaAngle -= 2 * Math.PI;
  } else if (arc.sweep && deltaAngle < 0) {
    deltaAngle += 2 * Math.PI;
  }

  out.cx = cx;
  out.cy = cy;
  out.rx = rx;
  out.ry = ry;
  out.xRotation = arc.xRotation;
  out.startAngle = startAngle;
  out.endAngle = startAngle + deltaAngle;
  out.sweep = arc.sweep;
  return out;
}
