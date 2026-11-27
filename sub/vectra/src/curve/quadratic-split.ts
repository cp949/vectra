import { createZeroQuadraticCurve } from '../internal/curve-shapes';
import type { QuadraticCurveWritable, QuadraticCurve } from '../types/flat-shapes.internal';
import { quadraticSplitInto } from './quadratic-split-into';

/** quadraticSplit의 dual output 결과 타입. */
export interface QuadraticSplit {
  /** 분할 후 좌측 quadratic curve */
  left: QuadraticCurveWritable;
  /** 분할 후 우측 quadratic curve */
  right: QuadraticCurveWritable;
}

/**
 * quadratic Bezier curve를 파라미터 t 위치에서 분할한 새 `{ left, right }` object를 반환한다.
 *
 * t는 clamp 없이 수식 그대로 계산한다. 왼쪽 곡선의 끝점과 오른쪽 곡선의 시작점은 좌표가 같다.
 * 성능 최적화가 필요하면 `quadraticSplitInto`를 사용한다.
 *
 *
 * caller-responsibility 가정은 `quadraticSplitInto`와 동일하다.
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 * @param t 분할 파라미터 (일반적으로 [0, 1], clamp 없음)
 */
export function quadraticSplit(curve: QuadraticCurve, t: number): QuadraticSplit {
  const left = createZeroQuadraticCurve();
  const right = createZeroQuadraticCurve();
  quadraticSplitInto(left, right, curve, t);
  return { left, right };
}
