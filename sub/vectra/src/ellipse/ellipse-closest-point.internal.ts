/**
 * Newton-Raphson 기반 ellipse closest point 계산 core.
 *
 * 여러 leaf module에서 공유하는 numeric helper다.
 * 호출자는 radiusX > 0, radiusY > 0을 보장해야 한다.
 * empty ellipse 분기는 각 leaf module에서 처리한다.
 */

/**
 * ellipse boundary에서 (dx, dy) 방향의 closest point angle θ를 Newton-Raphson으로 계산한다.
 *
 * 목적함수: f(θ) = (cos θ - dx/rx)² + (sin θ - dy/ry)²의 최솟값 위치.
 * 수렴 판정: |Δθ| < epsilon이면 종료. 64회 반복 상한.
 * fallback: 수렴 실패 시 마지막 반복 값을 반환한다.
 *
 * @param dx point의 ellipse center 기준 x 오프셋
 * @param dy point의 ellipse center 기준 y 오프셋
 * @param rx x축 반지름 (양수 보장 필요)
 * @param ry y축 반지름 (양수 보장 필요)
 * @param epsilon Newton 수렴 판정 임계값. 기본값: 1e-10
 */
export function ellipseClosestPointAngle(dx: number, dy: number, rx: number, ry: number, epsilon: number): number {
  // center tie-break: point === ellipse center이면 θ₀ = 0 → (cx + rx, cy)
  const ux = dx / rx;
  const uy = dy / ry;

  // 초기값: θ₀ = atan2(dy/ry, dx/rx)
  let theta = Math.atan2(uy, ux);

  for (let i = 0; i < 64; i++) {
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);

    // f'(θ) = -2 * sin(θ) * (cos(θ) - dx/rx) + 2 * cos(θ) * (sin(θ) - dy/ry)
    // f''(θ) = -2 * cos(θ) * (cos(θ) - dx/rx) - 2 * sin(θ) * sin(θ)
    //         + 2 * (-sin(θ)) * (sin(θ) - dy/ry) + 2 * cos(θ) * cos(θ)
    //       = 2 - 2 * cos(θ) * (cos(θ) - dx/rx) - 2 * sin(θ) * (sin(θ) - dy/ry)

    // f'(θ) / 2 = -sinT*(cosT - ux) + cosT*(sinT - uy)
    const fp = -sinT * (cosT - ux) + cosT * (sinT - uy);

    // f''(θ) / 2 = 1 - cosT*(cosT - ux) - sinT*(sinT - uy)
    const fpp = 1 - cosT * (cosT - ux) - sinT * (sinT - uy);

    // fpp ≈ 0이면 분모 발산 방지를 위해 반복 종료
    if (fpp === 0) break;

    const delta = fp / fpp;
    theta -= delta;

    if (Math.abs(delta) < epsilon) break;
  }

  return theta;
}
