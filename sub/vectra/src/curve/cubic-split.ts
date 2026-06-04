import type { CubicCurveWritable, XYInput, XYObjectWritable } from '../types';
import { cubicSplitInto } from './cubic-split-into';

/** cubicSplit의 dual output 결과 타입. */
export interface CubicSplit {
  /** 분할 후 좌측 cubic curve */
  left: CubicCurveWritable<XYObjectWritable, XYObjectWritable, XYObjectWritable, XYObjectWritable>;
  /** 분할 후 우측 cubic curve */
  right: CubicCurveWritable<XYObjectWritable, XYObjectWritable, XYObjectWritable, XYObjectWritable>;
}

function createCubicCurve(): CubicSplit['left'] {
  return {
    p0: { x: 0, y: 0 },
    p1: { x: 0, y: 0 },
    p2: { x: 0, y: 0 },
    p3: { x: 0, y: 0 },
  };
}

/**
 * cubic Bezier curve를 파라미터 t 위치에서 분할한 새 `{ left, right }` object를 반환한다.
 *
 * t는 clamp 없이 수식 그대로 계산한다. `left.p3`와 `right.p0`은 같은 좌표 값을 가지지만
 * 서로 다른 object reference이므로 한쪽을 mutate해도 다른 쪽에 영향이 없다.
 * 성능 최적화가 필요하면 `cubicSplitInto`를 사용한다.
 *
 *
 * caller-responsibility 가정은 `cubicSplitInto`와 동일하다.
 * @param p0 curve 시작점
 * @param p1 첫 번째 제어점
 * @param p2 두 번째 제어점
 * @param p3 curve 끝점
 * @param t 분할 파라미터 (일반적으로 [0, 1], clamp 없음)
 */
export function cubicSplit(p0: XYInput, p1: XYInput, p2: XYInput, p3: XYInput, t: number): CubicSplit {
  const left = createCubicCurve();
  const right = createCubicCurve();
  cubicSplitInto(left, right, p0, p1, p2, p3, t);
  return { left, right };
}
