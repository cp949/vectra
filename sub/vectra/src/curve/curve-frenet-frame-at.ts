import type { CurveFrenetFrameResult, CurveLike } from '../types';
import { curveFrenetFrameAtInto } from './curve-frenet-frame-at-into';

/**
 * `CurveLike` 위의 파라미터 t에서 point / unit tangent / unit normal / signed curvature를
 * 한 번에 계산하여 새 nested plain object로 반환한다.
 *
 * `curveFrenetFrameAtInto`의 allocating companion. `point`/`tangent`/`normal`은 새 `{ x, y }` object다.
 * frame 계산 정책과 degenerate / 외삽 / non-finite pass-through 동작은 `curveFrenetFrameAtInto`를 따른다.
 *
 * @param curve quadratic 또는 cubic Bezier curve 입력
 * @param t 파라미터 (일반적으로 [0, 1], clamp 없음)
 */
export function curveFrenetFrameAt(curve: CurveLike, t: number): CurveFrenetFrameResult {
  const out: CurveFrenetFrameResult = {
    point: { x: 0, y: 0 },
    tangent: { x: 0, y: 0 },
    normal: { x: 0, y: 0 },
    curvature: 0,
  };
  return curveFrenetFrameAtInto(out, curve, t);
}
