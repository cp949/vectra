import { readX, readY, writeXY } from '../internal/xy';
import type { CurveFrenetFrameWritable, CurveLike } from '../types';

/**
 * `CurveLike` 위의 파라미터 t에서 point / unit tangent / unit normal / signed curvature를
 * 한 번에 계산하여 out에 기록하고 out을 반환한다.
 *
 * - `curve.kind === 'quadratic'`이면 `p0`, `p1`, `p2`를, `'cubic'`이면 `p0`, `p1`, `p2`, `p3`를 쓴다.
 * - `t`는 clamp하지 않는다. `t < 0` 또는 `t > 1`이면 외삽(extrapolation) 결과가 된다.
 * - `point`는 curve evaluation 결과다.
 * - `tangent`는 1차 도함수를 정규화한 unit vector다. derivative가 zero vector이면 zero vector를 기록한다.
 * - `normal`은 tangent를 좌측 90도 회전한 `(-ty, tx)`다. zero tangent이면 zero vector다.
 * - `curvature`는 signed curvature `(d1.x*d2.y - d1.y*d2.x) / |d1|^3`다. `|d1|^3 < 1e-10`이면 `0`이다.
 *   양수 curvature는 반시계 방향(CCW) 굽힘을 나타낸다.
 *
 * 좌표/`t`가 non-finite이면 각 leaf와 동일하게 산술 결과를 pass-through한다.
 * aliasing 안전: 입력을 모두 먼저 읽은 후 output을 기록한다.
 *
 * @param out frame 결과를 기록할 writable output
 * @param curve quadratic 또는 cubic Bezier curve 입력
 * @param t 파라미터 (일반적으로 [0, 1], clamp 없음)
 */
export function curveFrenetFrameAtInto<Out extends CurveFrenetFrameWritable>(
  out: Out,
  curve: CurveLike,
  t: number
): Out {
  const mt = 1 - t;

  let px: number;
  let py: number;
  let d1x: number;
  let d1y: number;
  let d2x: number;
  let d2y: number;

  if (curve.kind === 'quadratic') {
    const p0x = readX(curve.p0);
    const p0y = readY(curve.p0);
    const p1x = readX(curve.p1);
    const p1y = readY(curve.p1);
    const p2x = readX(curve.p2);
    const p2y = readY(curve.p2);

    const mt2 = mt * mt;
    const t2 = t * t;
    const twoMtT = 2 * mt * t;

    // B(t) = (1-t)²·p0 + 2(1-t)t·p1 + t²·p2
    px = mt2 * p0x + twoMtT * p1x + t2 * p2x;
    py = mt2 * p0y + twoMtT * p1y + t2 * p2y;

    // B'(t) = 2(1-t)(p1-p0) + 2t(p2-p1)
    const twoMt = 2 * mt;
    const twoT = 2 * t;
    d1x = twoMt * (p1x - p0x) + twoT * (p2x - p1x);
    d1y = twoMt * (p1y - p0y) + twoT * (p2y - p1y);

    // B''(t) = 2(p2 - 2p1 + p0)  (상수)
    d2x = 2 * (p2x - 2 * p1x + p0x);
    d2y = 2 * (p2y - 2 * p1y + p0y);
  } else {
    const p0x = readX(curve.p0);
    const p0y = readY(curve.p0);
    const p1x = readX(curve.p1);
    const p1y = readY(curve.p1);
    const p2x = readX(curve.p2);
    const p2y = readY(curve.p2);
    const p3x = readX(curve.p3);
    const p3y = readY(curve.p3);

    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    const t2 = t * t;
    const t3 = t2 * t;
    const threeMt2T = 3 * mt2 * t;
    const threeMtT2 = 3 * mt * t2;
    const twoMtT = 2 * mt * t;

    // B(t) = (1-t)³·p0 + 3(1-t)²t·p1 + 3(1-t)t²·p2 + t³·p3
    px = mt3 * p0x + threeMt2T * p1x + threeMtT2 * p2x + t3 * p3x;
    py = mt3 * p0y + threeMt2T * p1y + threeMtT2 * p2y + t3 * p3y;

    // B'(t) = 3[(1-t)²(p1-p0) + 2(1-t)t(p2-p1) + t²(p3-p2)]
    d1x = 3 * (mt2 * (p1x - p0x) + twoMtT * (p2x - p1x) + t2 * (p3x - p2x));
    d1y = 3 * (mt2 * (p1y - p0y) + twoMtT * (p2y - p1y) + t2 * (p3y - p2y));

    // B''(t) = 6[(1-t)(p2-2p1+p0) + t(p3-2p2+p1)]
    d2x = 6 * (mt * (p2x - 2 * p1x + p0x) + t * (p3x - 2 * p2x + p1x));
    d2y = 6 * (mt * (p2y - 2 * p1y + p0y) + t * (p3y - 2 * p2y + p1y));
  }

  // unit tangent / normal: derivative가 정확히 zero vector이면 둘 다 zero vector.
  // normal은 tangent의 좌측 90도 회전 (-ty, tx). len === 0 분기를 leaf와 동일하게 두어
  // degenerate에서 signed -0이 새지 않도록 한다.
  const len = Math.hypot(d1x, d1y);
  let tx = 0;
  let ty = 0;
  let nx = 0;
  let ny = 0;
  if (len !== 0) {
    tx = d1x / len;
    ty = d1y / len;
    nx = -ty;
    ny = tx;
  }

  // signed curvature: |d1|^3 < 1e-10이면 degenerate로 0. non-finite는 산술 pass-through
  const d1Cubed = len * len * len;
  let curvature: number;
  if (d1Cubed < 1e-10) {
    curvature = 0;
  } else {
    curvature = (d1x * d2y - d1y * d2x) / d1Cubed;
  }

  writeXY(out.point, px, py);
  writeXY(out.tangent, tx, ty);
  writeXY(out.normal, nx, ny);
  out.curvature = curvature;
  return out;
}
