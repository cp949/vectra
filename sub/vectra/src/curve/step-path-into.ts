import type { PathCommand, StepCurveOptions, XYInput } from '../types';
import { resolveStepMode, writeStepPath } from './step.internal';

/**
 * point list를 orthogonal step path(move/line command)로 변환해 out에 기록하고 out을 반환한다.
 *
 * 기본 mode는 'middle'. segment p0→p1에서 'middle'은 midX=(x0+x1)/2의 (midX,y0),(midX,y1),
 * 'before'는 (x1,y0), 'after'는 (x0,y1) elbow를 거쳐 끝점에 도달한다.
 * 결과는 move 1개 뒤 line command로 구성된다. close는 자동 추가하지 않는다.
 * points.length < 2이면 out.length를 0으로 두고 반환한다.
 * consecutive duplicate point는 제거하지 않는다. non-finite 좌표는 산술 결과 그대로 pass-through한다.
 * invalid mode는 RangeError로 실패한다.
 *
 * @param out command를 기록할 PathCommand 배열. 기존 내용은 덮어쓴다.
 * @param points step path가 통과할 입력 point 배열
 * @param options step elbow mode 옵션. mode 기본값 'middle'.
 * @returns out
 */
export function stepPathInto<Out extends PathCommand[]>(
  out: Out,
  points: readonly XYInput[],
  options?: StepCurveOptions
): Out {
  const mode = resolveStepMode(options?.mode);
  return writeStepPath(out, points, mode);
}
