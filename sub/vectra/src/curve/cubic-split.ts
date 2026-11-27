import { createZeroCubicCurve } from '../internal/curve-shapes';
import type { CubicCurveWritable, CubicCurve } from '../types/flat-shapes.internal';
import { cubicSplitInto } from './cubic-split-into';

/** cubicSplit의 dual output 결과 타입. */
export interface CubicSplit {
  /** 분할 후 좌측 cubic curve */
  left: CubicCurveWritable;
  /** 분할 후 우측 cubic curve */
  right: CubicCurveWritable;
}

/**
 * cubic Bezier curve를 파라미터 t 위치에서 분할한 새 `{ left, right }` object를 반환한다.
 *
 * t는 clamp 없이 수식 그대로 계산한다. 왼쪽 곡선의 끝점과 오른쪽 곡선의 시작점은 좌표가 같다.
 * 성능 최적화가 필요하면 `cubicSplitInto`를 사용한다.
 *
 *
 * caller-responsibility 가정은 `cubicSplitInto`와 동일하다.
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 * @param t 분할 파라미터 (일반적으로 [0, 1], clamp 없음)
 */
export function cubicSplit(curve: CubicCurve, t: number): CubicSplit {
  const left = createZeroCubicCurve();
  const right = createZeroCubicCurve();
  cubicSplitInto(left, right, curve, t);
  return { left, right };
}
