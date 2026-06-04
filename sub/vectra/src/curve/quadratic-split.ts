import type { QuadraticCurveWritable, XYInput, XYObjectWritable } from '../types';
import { quadraticSplitInto } from './quadratic-split-into';

/** quadraticSplit의 dual output 결과 타입. */
export interface QuadraticSplit {
  /** 분할 후 좌측 quadratic curve */
  left: QuadraticCurveWritable<XYObjectWritable, XYObjectWritable, XYObjectWritable>;
  /** 분할 후 우측 quadratic curve */
  right: QuadraticCurveWritable<XYObjectWritable, XYObjectWritable, XYObjectWritable>;
}

function createQuadraticCurve(): QuadraticSplit['left'] {
  return {
    p0: { x: 0, y: 0 },
    p1: { x: 0, y: 0 },
    p2: { x: 0, y: 0 },
  };
}

/**
 * quadratic Bezier curve를 파라미터 t 위치에서 분할한 새 `{ left, right }` object를 반환한다.
 *
 * t는 clamp 없이 수식 그대로 계산한다. `left.p2`와 `right.p0`은 같은 좌표 값을 가지지만
 * 서로 다른 object reference이므로 한쪽을 mutate해도 다른 쪽에 영향이 없다.
 * 성능 최적화가 필요하면 `quadraticSplitInto`를 사용한다.
 *
 *
 * caller-responsibility 가정은 `quadraticSplitInto`와 동일하다.
 * @param p0 curve 시작점
 * @param p1 curve 제어점
 * @param p2 curve 끝점
 * @param t 분할 파라미터 (일반적으로 [0, 1], clamp 없음)
 */
export function quadraticSplit(p0: XYInput, p1: XYInput, p2: XYInput, t: number): QuadraticSplit {
  const left = createQuadraticCurve();
  const right = createQuadraticCurve();
  quadraticSplitInto(left, right, p0, p1, p2, t);
  return { left, right };
}
