import { readX, readY } from '../internal/xy';
import type { FlattenOptions, XYInput, XYObjectWritable } from '../types';

/**
 * flatness 기준 측정 helper.
 * 제어점 p1이 p0-p2 직선 중점에서 얼마나 벗어나는지 계산한다.
 *
 * flatness = |p1 - midpoint(p0, p2)|
 */
function measureFlatness(p0x: number, p0y: number, p1x: number, p1y: number, p2x: number, p2y: number): number {
  const midX = (p0x + p2x) * 0.5;
  const midY = (p0y + p2y) * 0.5;
  return Math.hypot(p1x - midX, p1y - midY);
}

/**
 * adaptive subdivision으로 flatten하는 내부 재귀 함수.
 * flat 판단 시 p0만 push하고, 마지막 p2는 최상위 호출자가 담당한다.
 */
function flattenRecursive(
  out: XYObjectWritable[],
  p0x: number,
  p0y: number,
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
  flatness: number,
  depth: number,
  maxDepth: number
): void {
  if (depth >= maxDepth || measureFlatness(p0x, p0y, p1x, p1y, p2x, p2y) < flatness) {
    // flat 판정: 현재 segment의 시작점만 push (끝점은 다음 segment 또는 최상위에서 처리)
    out.push({ x: p0x, y: p0y });
    return;
  }

  // t=0.5에서 de Casteljau 분할
  const lerpP01x = (p0x + p1x) * 0.5;
  const lerpP01y = (p0y + p1y) * 0.5;
  const lerpP12x = (p1x + p2x) * 0.5;
  const lerpP12y = (p1y + p2y) * 0.5;
  const midX = (lerpP01x + lerpP12x) * 0.5;
  const midY = (lerpP01y + lerpP12y) * 0.5;

  flattenRecursive(out, p0x, p0y, lerpP01x, lerpP01y, midX, midY, flatness, depth + 1, maxDepth);
  flattenRecursive(out, midX, midY, lerpP12x, lerpP12y, p2x, p2y, flatness, depth + 1, maxDepth);
}

/**
 * quadratic Bezier curve를 adaptive subdivision으로 polyline에 근사하여 out에 기록하고 out을 반환한다.
 *
 * out을 clear(length=0)한 뒤 근사 polyline의 점들을 순서대로 push한다.
 * 직선(flat) curve는 시작점과 끝점 두 개만 push한다.
 *
 * @param out polyline point를 push할 XYObjectWritable 배열. 기존 내용은 clear된다.
 * @param p0 curve 시작점
 * @param p1 curve 제어점
 * @param p2 curve 끝점
 * @param options flatten 옵션
 * @param options.flatness 선형 근사 허용 geometric error. 기본값: 0.5
 * @param options.maxRecursion subdivision 재귀 깊이 상한. 기본값: 32
 */
export function quadraticFlattenInto(
  out: XYObjectWritable[],
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  options?: FlattenOptions
): XYObjectWritable[] {
  const flatness = options?.flatness ?? 0.5;
  const maxRecursion = options?.maxRecursion ?? 32;

  const p0x = readX(p0);
  const p0y = readY(p0);
  const p1x = readX(p1);
  const p1y = readY(p1);
  const p2x = readX(p2);
  const p2y = readY(p2);

  // 기존 내용 clear
  out.length = 0;

  // 재귀 flatten: 시작점들을 push하고 마지막으로 끝점 push
  flattenRecursive(out, p0x, p0y, p1x, p1y, p2x, p2y, flatness, 0, maxRecursion);

  // 마지막 끝점 push
  out.push({ x: p2x, y: p2y });

  return out;
}
