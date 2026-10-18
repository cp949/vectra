/**
 * ellipse closest point 계산 core.
 *
 * 여러 leaf module에서 공유하는 numeric helper다.
 * 호출자는 radiusX > 0, radiusY > 0을 보장해야 한다.
 * empty ellipse 분기는 각 leaf module에서 처리한다.
 */

/** major 반지름 대비 이보다 먼 점은 방향만 남긴다. */
const FAR_LIMIT = 1e300;

/**
 * ellipse boundary에서 (dx, dy)에 Euclidean 거리가 가장 가까운 점의 angle θ를 계산한다.
 *
 * 반환한 θ의 boundary 점은 (rx cos θ, ry sin θ)이다.
 * 대칭을 이용해 점을 제1사분면으로 접고, major axis가 x가 되도록 축을 맞춘다.
 * p, q는 major 반지름으로 나눈 접힌 오프셋이고 b는 minor / major 비율이다.
 * k = 1 - b²는 evolute 반폭이다.
 * 최근접점의 법선 조건은 G(w) = (p / (k + b w))² + (q / w)² - 1 = 0으로 모인다.
 * w는 법선 거리에 해당하는 양수 매개변수다.
 * b²를 직접 쓰지 않으므로 b가 1e-300 규모여도 underflow하지 않는다.
 * 실제로는 w를 범위가 안전한 매개변수 t로 바꿔 푼다.
 * - p > k: t = b w. 하한 p - k가 양수다. (p - k) / b처럼 overflow하지 않는다.
 * - p <= k: t = w / q = 1 / sin φ. q가 subnormal이어도 정밀도를 잃지 않는다.
 * G는 t > 0에서 감소하는 볼록 함수다. 하한에서 시작하는 Newton 반복은 근을 넘지 않고 단조롭게 수렴한다.
 * Newton 보정은 t에 대한 비율로 계산한다. 도함수를 그대로 쓰면 t가 작을 때 overflow한다.
 * 수렴 판정: |Δt| <= epsilon * t. 64회 반복 상한.
 * major 반지름의 1e300배보다 먼 점은 방향만 남겨 p, q의 overflow를 막는다.
 * fallback: 수렴 실패 시 마지막 반복 값을 사용한다.
 *
 * 특수 입력:
 * - 점이 center이면 minor axis 쪽 양의 방향 vertex를 반환한다. rx > ry이면 θ = π/2, 아니면 θ = 0이다.
 * - minor axis 위의 점은 minor vertex를 반환한다.
 * - major axis 위의 점이 evolute 안이면 해가 둘이다. y(major가 y이면 x)가 양수인 쪽을 반환한다.
 *
 * @param dx point의 ellipse center 기준 x 오프셋
 * @param dy point의 ellipse center 기준 y 오프셋
 * @param rx x축 반지름 (양수 보장 필요)
 * @param ry y축 반지름 (양수 보장 필요)
 * @param epsilon Newton 수렴 판정 상대 임계값. 기본값: 1e-10
 */
export function ellipseClosestPointAngle(dx: number, dy: number, rx: number, ry: number, epsilon: number): number {
  // major axis가 x가 되도록 축을 맞춘다. 접힌 좌표 p, q는 major 반지름 기준이다.
  const swapped = rx < ry;
  const major = swapped ? ry : rx;
  const b = (swapped ? rx : ry) / major;
  let p = Math.abs(swapped ? dy : dx) / major;
  let q = Math.abs(swapped ? dx : dy) / major;
  // 먼 점은 방향만 남겨 거리를 major의 1e300배로 줄인다. 각도 변화는 1e-300 rad 규모다.
  if (!(p <= FAR_LIMIT && q <= FAR_LIMIT)) {
    const far = Math.max(Math.abs(dx), Math.abs(dy));
    p = (Math.abs(swapped ? dy : dx) / far) * FAR_LIMIT;
    q = (Math.abs(swapped ? dx : dy) / far) * FAR_LIMIT;
  }

  // center에서는 두 minor vertex가 동률이다. 양의 방향을 고른다. rx === ry이면 θ = 0이다.
  if (p === 0 && q === 0) return rx > ry ? Math.PI / 2 : 0;

  const evolute = (1 - b) * (1 + b);

  // 단위원 위 점 (cos φ, sin φ). 접힌 문제의 해를 여기에 담는다.
  let cosPhi: number;
  let sinPhi: number;

  if (q === 0) {
    // major axis 위의 점이다. evolute 안이면 해가 둘이고 sin φ > 0인 쪽을 고른다.
    if (p < evolute) {
      cosPhi = p / evolute;
      sinPhi = Math.sqrt((1 - cosPhi) * (1 + cosPhi));
    } else {
      cosPhi = 1;
      sinPhi = 0;
    }
  } else if (p === 0) {
    // minor axis 위의 점은 minor vertex가 최근접점이다.
    cosPhi = 0;
    sinPhi = 1;
  } else {
    // G(t) = (p / (k + scale t))² + (offset / t)² - 1을 푼다. p > k이면 t = b w, 아니면 t = w / q다.
    const outside = p > evolute;
    const scale = outside ? 1 : b * q;
    const offset = outside ? b * q : 1;
    // 하한은 두 항이 각각 1을 넘지 않는 조건에서 나온다. 이 지점에서 G(t) >= 0이다.
    let t = outside ? Math.max(offset, p - evolute) : 1;
    for (let i = 0; i < 64; i++) {
      const d0 = evolute + scale * t;
      const u = p / d0;
      const v = offset / t;
      const ratio = (u * u + v * v - 1) / (2 * ((scale * t * u * u) / d0 + v * v));
      t += t * ratio;
      if (Math.abs(ratio) <= epsilon) break;
    }
    cosPhi = p / (evolute + scale * t);
    sinPhi = offset / t;
  }

  // 접기 전 사분면 부호를 복원한다. 0은 양수로 본다.
  const signX = dx < 0 ? -1 : 1;
  const signY = dy < 0 ? -1 : 1;
  return swapped ? Math.atan2(signY * cosPhi, signX * sinPhi) : Math.atan2(signY * sinPhi, signX * cosPhi);
}
