/**
 * step curve helper의 공유 internal.
 *
 * mode 정규화, orthogonal vertex 생성, polyline/path 기록 helper를 모아둔다.
 * public step leaf는 이 helper만 공유하고 서로를 직접 import하지 않는다.
 */
import { readX, readY } from '../internal/xy';
import type { PathCommand, StepCurveMode, XYInput, XYWritable } from '../types';

/** step mode를 검증해 정규화한다. 생략 시 'middle'. invalid mode는 RangeError. */
export function resolveStepMode(mode: StepCurveMode | undefined): StepCurveMode {
  const resolved = mode ?? 'middle';
  if (resolved !== 'middle' && resolved !== 'before' && resolved !== 'after') {
    throw new RangeError(`mode must be 'middle' | 'before' | 'after', got ${String(resolved)}`);
  }
  return resolved;
}

/**
 * step curve의 orthogonal vertex를 순서대로 visit에 전달한다.
 *
 * 시작점을 먼저 전달하고 각 segment마다 mode별 elbow vertex와 끝점을 전달한다.
 * 호출자는 points.length >= 2를 보장한다.
 * non-finite 좌표는 산술 결과 그대로 전달하고 consecutive duplicate point는 제거하지 않는다.
 *
 * @param points step curve가 통과할 입력 point 배열
 * @param mode step elbow 위치 정책
 * @param visit 각 vertex의 (x, y)를 받는 콜백
 */
function forEachStepVertex(
  points: readonly XYInput[],
  mode: StepCurveMode,
  visit: (x: number, y: number) => void
): void {
  let xPrev = readX(points[0]);
  let yPrev = readY(points[0]);
  visit(xPrev, yPrev);
  for (let i = 1; i < points.length; i++) {
    const xCur = readX(points[i]);
    const yCur = readY(points[i]);
    if (mode === 'middle') {
      const midX = (xPrev + xCur) / 2;
      visit(midX, yPrev);
      visit(midX, yCur);
    } else if (mode === 'before') {
      visit(xCur, yPrev);
    } else {
      visit(xPrev, yCur);
    }
    visit(xCur, yCur);
    xPrev = xCur;
    yPrev = yCur;
  }
}

/**
 * step orthogonal polyline vertex를 out에 기록하고 out을 반환한다.
 *
 * points.length < 2이면 out.length를 0으로 두고 반환한다.
 *
 * @param out vertex를 기록할 writable point 배열. 기존 내용은 덮어쓴다.
 * @param points step polyline이 통과할 입력 point 배열
 * @param mode 정규화된 step elbow mode
 * @returns out
 */
export function writeStepPolyline(out: XYWritable[], points: readonly XYInput[], mode: StepCurveMode): XYWritable[] {
  out.length = 0;
  if (points.length < 2) return out;
  forEachStepVertex(points, mode, (x, y) => {
    out.push({ x, y });
  });
  return out;
}

/**
 * step orthogonal path를 move/line command로 out에 기록하고 out을 반환한다.
 *
 * points.length < 2이면 out.length를 0으로 두고 반환한다.
 *
 * @param out command를 기록할 PathCommand 배열. 기존 내용은 덮어쓴다.
 * @param points step path가 통과할 입력 point 배열
 * @param mode 정규화된 step elbow mode
 * @returns out
 */
export function writeStepPath<Out extends PathCommand[]>(
  out: Out,
  points: readonly XYInput[],
  mode: StepCurveMode
): Out {
  out.length = 0;
  if (points.length < 2) return out;
  let first = true;
  forEachStepVertex(points, mode, (x, y) => {
    if (first) {
      out.push({ kind: 'move', x, y } as Out[number]);
      first = false;
    } else {
      out.push({ kind: 'line', x, y } as Out[number]);
    }
  });
  return out;
}
