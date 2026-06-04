import { endpointArcToCenterInto } from '../curve/endpoint-arc-to-center-into';
import { polylineTotalLength } from '../internal/polyline';
import type { CenterArcWritable, PathCommand, PathMeasurementOptions, XYObjectWritable } from '../types/index';
import { ellipseArcCurvature } from './path-ellipse-arc.internal';
import type { DrawSegment } from './path-segments.internal';
import { createCenterArcBuf, flattenDrawSegmentInto, forEachDrawSegment } from './path-segments.internal';

/**
 * segment kind에 따라 segment-local arc-length parameter `localT ∈ [0, 1]` 위치의 signed
 * curvature를 반환한다.
 *
 * arc-length parameter와 parametric/angular parameter의 정확한 매핑은 비선형이지만, 본 함수는
 * `propertiesAtLength`와 동일하게 linear approximation을 사용한다 (별도 numeric integration
 * 없음). 좌회전 = 양수 (y-up CCW 관례).
 */
function computeSegmentCurvature(seg: DrawSegment, localT: number, centerArcBuf: CenterArcWritable): number {
  if (seg.kind === 'line' || seg.kind === 'close') {
    return 0;
  }
  if (seg.kind === 'quadratic') {
    return quadraticSegmentCurvatureAt(seg, localT);
  }
  if (seg.kind === 'cubic') {
    return cubicSegmentCurvatureAt(seg, localT);
  }
  // arc: parameter angle = startAngle + (endAngle - startAngle) * localT.
  // sweep direction이 angle 부호를 결정하므로 magnitude × direction sign으로 구성한다.
  endpointArcToCenterInto(centerArcBuf, { x: seg.fromX, y: seg.fromY }, seg.command);
  const theta = centerArcBuf.startAngle + (centerArcBuf.endAngle - centerArcBuf.startAngle) * localT;
  const magnitude = ellipseArcCurvature(centerArcBuf.rx, centerArcBuf.ry, theta);
  // sweep = true (clockwise, y-down 기준)이면 좌회전 기준 음수가 된다.
  return centerArcBuf.sweep ? -magnitude : magnitude;
}

/**
 * quadratic Bezier signed curvature를 path 정책으로 계산한다.
 *
 * curve domain helper는 작은 `|B′|^3`를 `0`으로 clamp하지만, path public 정책은 zero
 * `|B′|`만 `NaN`이다. 그래서 threshold 없이 denominator가 정확히 0일 때만 `NaN`을 반환한다.
 */
function quadraticSegmentCurvatureAt(seg: Extract<DrawSegment, { kind: 'quadratic' }>, t: number): number {
  const cmd = seg.command;
  const twoMt = 2 * (1 - t);
  const twoT = 2 * t;
  const d1x = twoMt * (cmd.x1 - seg.fromX) + twoT * (cmd.x - cmd.x1);
  const d1y = twoMt * (cmd.y1 - seg.fromY) + twoT * (cmd.y - cmd.y1);
  const d2x = 2 * (cmd.x - 2 * cmd.x1 + seg.fromX);
  const d2y = 2 * (cmd.y - 2 * cmd.y1 + seg.fromY);
  const d1Len = Math.hypot(d1x, d1y);
  const d1Cubed = d1Len * d1Len * d1Len;
  if (d1Cubed === 0) return Number.NaN;
  return (d1x * d2y - d1y * d2x) / d1Cubed;
}

/**
 * cubic Bezier signed curvature를 path 정책으로 계산한다.
 *
 * zero `|B′|`만 `NaN` 처리한다. 작은 비퇴화 curve는 큰 유한 curvature로 그대로 노출한다.
 */
function cubicSegmentCurvatureAt(seg: Extract<DrawSegment, { kind: 'cubic' }>, t: number): number {
  const cmd = seg.command;
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;
  const twoMtT = 2 * mt * t;
  const d1x = 3 * (mt2 * (cmd.x1 - seg.fromX) + twoMtT * (cmd.x2 - cmd.x1) + t2 * (cmd.x - cmd.x2));
  const d1y = 3 * (mt2 * (cmd.y1 - seg.fromY) + twoMtT * (cmd.y2 - cmd.y1) + t2 * (cmd.y - cmd.y2));
  const d2x = 6 * (mt * (cmd.x2 - 2 * cmd.x1 + seg.fromX) + t * (cmd.x - 2 * cmd.x2 + cmd.x1));
  const d2y = 6 * (mt * (cmd.y2 - 2 * cmd.y1 + seg.fromY) + t * (cmd.y - 2 * cmd.y2 + cmd.y1));
  const d1Len = Math.hypot(d1x, d1y);
  const d1Cubed = d1Len * d1Len * d1Len;
  if (d1Cubed === 0) return Number.NaN;
  return (d1x * d2y - d1y * d2x) / d1Cubed;
}

/**
 * path의 arc-length offset `distance` 위치에서 signed curvature scalar를 반환한다.
 *
 * 단위는 reciprocal length (1 / length). 좌회전 = 양수 (signed curvature, y-up CCW 관례).
 * y-down 좌표계에서는 시각적으로 우회전이 양수로 보인다.
 *
 * segment kind별 공식:
 * - line / close → 0
 * - quadratic / cubic → Bezier curvature `(B' × B'') / |B'|^3`
 * - arc → `κ(θ) = rx * ry / (rx² sin²θ + ry² cos²θ)^(3/2)`. sweep === true (clockwise) 시 부호 반전.
 *
 * distance는 `pointAtLength`와 동일하게 clamp된다 (`<= 0` → 첫 segment 시작, `>= totalLength`
 * → 마지막 segment 끝).
 *
 * 반환 분류:
 * - empty path, Move-only path → `NaN`
 * - non-finite distance → `NaN`
 * - degenerate Bezier (zero `|B'|`) → `NaN`
 *
 * arc-length parameter `localT`와 parametric/angular parameter의 매핑은 비선형이지만, 본 함수는
 * `propertiesAtLength`와 동일한 linear approximation을 사용한다 (별도 numeric integration 없음).
 *
 * @param commands sampling할 path command sequence
 * @param distance path 시작점부터의 arc-length offset
 * @param options flatten 옵션 (flatness, maxRecursion)
 */
export function curvatureAtLength(
  commands: readonly PathCommand[],
  distance: number,
  options?: PathMeasurementOptions
): number {
  if (!Number.isFinite(distance)) return Number.NaN;

  const flatness = options?.flatness ?? 0.5;
  const maxRecursion = options?.maxRecursion ?? 32;
  const flatOpts = { flatness, maxRecursion };

  const segBuf: XYObjectWritable[] = [];
  const centerArcBuf = createCenterArcBuf();

  let cumulativeLen = 0;
  let found = false;
  let result = Number.NaN;
  let lastSeg: DrawSegment | undefined;

  forEachDrawSegment(commands, (seg) => {
    if (found) return;

    flattenDrawSegmentInto(segBuf, seg, flatOpts, centerArcBuf);
    const segLen = polylineTotalLength(segBuf);

    if (distance <= 0 || distance < cumulativeLen + segLen) {
      const localTarget = Math.max(0, distance - cumulativeLen);
      // segLen === 0이면 segment-local arc-length parameter는 0으로 정의한다.
      const localT = segLen === 0 ? 0 : Math.max(0, Math.min(1, localTarget / segLen));
      result = computeSegmentCurvature(seg, localT, centerArcBuf);
      found = true;
      return;
    }

    cumulativeLen += segLen;
    lastSeg = seg;
  });

  if (found) return result;
  // distance > totalLength → 마지막 segment 끝점 (localT = 1)
  if (lastSeg !== undefined) {
    return computeSegmentCurvature(lastSeg, 1, centerArcBuf);
  }
  // drawing segment 없음 (empty / Move-only)
  return Number.NaN;
}
