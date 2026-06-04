import type { CenterArcLike, FlattenOptions, XYObjectWritable } from '../types';
import { ellipsePoint, isDegenerateRadii } from './arc.internal';

/**
 * arc subsegment의 chord-error(현 길이 대비 mid-arc 점과 chord의 거리)를 측정한다.
 *
 * adaptive subdivision의 flatness 판정에 사용한다. 두 endpoint p0, p1과 mid-arc 점 pm을
 * 받아 pm이 p0-p1 직선에서 떨어진 수직거리를 계산한다.
 */
function chordErrorFromMid(p0x: number, p0y: number, p1x: number, p1y: number, pmx: number, pmy: number): number {
  const dx = p1x - p0x;
  const dy = p1y - p0y;
  const chordLen = Math.hypot(dx, dy);
  if (chordLen === 0) {
    return Math.hypot(pmx - p0x, pmy - p0y);
  }
  // (pm - p0) cross (p1 - p0) / |p1 - p0|
  const cross = (pmx - p0x) * dy - (pmy - p0y) * dx;
  return Math.abs(cross) / chordLen;
}

/**
 * adaptive subdivision으로 arc를 flatten하는 내부 재귀 함수.
 *
 * 각 재귀 단계에서 (θa, θb)의 chord error를 mid-arc 점 기준으로 측정한다.
 * flat 판정 시 시작점 p0만 push하고, 마지막 끝점은 최상위 호출자가 담당한다.
 */
function flattenRecursive(
  out: XYObjectWritable[],
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  xRotation: number,
  thetaA: number,
  thetaB: number,
  p0x: number,
  p0y: number,
  p1x: number,
  p1y: number,
  flatness: number,
  depth: number,
  maxDepth: number
): void {
  // mid-arc 점 계산 — tuple 할당 없이 수식 직접 인라인
  const thetaMid = (thetaA + thetaB) * 0.5;
  const cosPhi = Math.cos(xRotation);
  const sinPhi = Math.sin(xRotation);
  const cosMid = Math.cos(thetaMid);
  const sinMid = Math.sin(thetaMid);
  const pmx = cx + cosPhi * rx * cosMid - sinPhi * ry * sinMid;
  const pmy = cy + sinPhi * rx * cosMid + cosPhi * ry * sinMid;

  const err = chordErrorFromMid(p0x, p0y, p1x, p1y, pmx, pmy);

  if (depth >= maxDepth || err < flatness) {
    // flat 판정: 시작점만 push (끝점은 다음 segment 또는 최상위에서 처리)
    out.push({ x: p0x, y: p0y });
    return;
  }

  flattenRecursive(out, cx, cy, rx, ry, xRotation, thetaA, thetaMid, p0x, p0y, pmx, pmy, flatness, depth + 1, maxDepth);
  flattenRecursive(out, cx, cy, rx, ry, xRotation, thetaMid, thetaB, pmx, pmy, p1x, p1y, flatness, depth + 1, maxDepth);
}

/**
 * center form arc를 adaptive subdivision으로 polyline에 근사하여 out에 기록하고 out을 반환한다.
 *
 * out을 clear(length=0)한 뒤 근사 polyline의 점들을 순서대로 push한다.
 * degenerate(rx<=0 또는 ry<=0)이면 center 좌표를 시작점과 끝점에 둔 polyline을 반환한다.
 * zero-sweep(startAngle === endAngle)이면 시작 각도의 ellipse 점을 두 번 push한 polyline을 반환한다.
 *
 * @param out polyline point를 push할 XYObjectWritable 배열. 기존 내용은 clear된다.
 * @param centerArc center form arc input
 * @param options flatten 옵션
 * @param options.flatness chord-error 허용 한계. 기본값: 0.5
 * @param options.maxRecursion subdivision 재귀 깊이 상한. 기본값: 32
 * @returns out
 */
export function arcFlattenInto(
  out: XYObjectWritable[],
  centerArc: CenterArcLike,
  options?: FlattenOptions
): XYObjectWritable[] {
  const flatness = options?.flatness ?? 0.5;
  const maxRecursion = options?.maxRecursion ?? 32;

  const { cx, cy, rx, ry, xRotation, startAngle, endAngle } = centerArc;

  out.length = 0;

  if (isDegenerateRadii(rx, ry)) {
    // degenerate: 시작과 끝 두 점 모두 center에 위치한 polyline을 만든다.
    out.push({ x: cx, y: cy });
    out.push({ x: cx, y: cy });
    return out;
  }

  if (startAngle === endAngle) {
    // zero-sweep: 시작과 끝이 같은 한 점에 위치한 polyline
    const pt: [number, number] = [0, 0];
    ellipsePoint(cx, cy, rx, ry, xRotation, startAngle, pt);
    out.push({ x: pt[0], y: pt[1] });
    out.push({ x: pt[0], y: pt[1] });
    return out;
  }

  const startPt: [number, number] = [0, 0];
  const endPt: [number, number] = [0, 0];
  ellipsePoint(cx, cy, rx, ry, xRotation, startAngle, startPt);
  ellipsePoint(cx, cy, rx, ry, xRotation, endAngle, endPt);

  flattenRecursive(
    out,
    cx,
    cy,
    rx,
    ry,
    xRotation,
    startAngle,
    endAngle,
    startPt[0],
    startPt[1],
    endPt[0],
    endPt[1],
    flatness,
    0,
    maxRecursion
  );

  // 마지막 끝점 push
  out.push({ x: endPt[0], y: endPt[1] });

  return out;
}
