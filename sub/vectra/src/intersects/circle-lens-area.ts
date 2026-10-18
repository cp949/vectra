import { readCircleCenter, readCircleRadius } from '../internal/circle';
import { readX, readY } from '../internal/xy';
import type { CircleLike } from '../types';

/**
 * 두 disk(채워진 원)의 lens 중첩 면적을 scalar로 반환한다.
 *
 * 반환 값은 두 disk 교집합의 면적이다. `circleCircleAreaOverlapDetail`과 분기 경계는 공유하지만
 * 위상 분류 `touch`가 곧 면적 0은 아니다. 내접 tangent는 위상상 `touch`여도 작은 disk가 큰 disk에
 * 완전히 포함돼 경계 한 점만 닿으므로 면적은 작은 disk 전체다.
 * - radius ≤ 0, non-finite center/radius: `0`.
 * - disjoint, external tangent(`d === r1 + r2`): `0`(면적 중첩 없음).
 * - internal tangent(`d === |r1 - r2|`, `d > 0`), strict containment(`d < |r1 - r2|`), concentric: 작은 disk area.
 * - coincident equal circles(`d === 0`, 같은 반지름): full circle area.
 * - proper lens: 두 원호 조각(segment) 면적의 합.
 *
 * center distance는 `Math.hypot`로 계산한다. disjoint/containment 경계는 exact 비교로 판정하며
 * near-equality tolerance를 추가하지 않는다. proper lens의 중심각은 `atan2`로 구해 내접 경계 근처에서도
 * 정밀도를 잃지 않고 `NaN`이 나오지 않는다. detail helper와 달리 면적 값을 직접 반환하고
 * `Into`/companion이 없다.
 *
 * @param a 첫 번째 circle
 * @param b 두 번째 circle
 */
export function circleLensArea(a: CircleLike, b: CircleLike): number {
  const ca = readCircleCenter(a);
  const cb = readCircleCenter(b);
  const ax = readX(ca);
  const ay = readY(ca);
  const bx = readX(cb);
  const by = readY(cb);
  const ra = readCircleRadius(a);
  const rb = readCircleRadius(b);

  if (!Number.isFinite(ax) || !Number.isFinite(ay) || !Number.isFinite(bx) || !Number.isFinite(by)) return 0;
  if (!Number.isFinite(ra) || !Number.isFinite(rb) || ra <= 0 || rb <= 0) return 0;

  const d = Math.hypot(bx - ax, by - ay);
  const sum = ra + rb;
  const diff = Math.abs(ra - rb);

  // disjoint + external tangent: 면적 중첩 없음.
  if (d >= sum) return 0;

  // containment band: concentric/strict containment/internal tangent 모두 작은 disk가 큰 disk에
  // 완전히 포함된다. 교집합은 작은 disk 전체다.
  if (d <= diff) {
    const min = Math.min(ra, rb);
    return Math.PI * min * min;
  }

  // proper lens: 두 원 중첩 면적 = 각 원의 원호 조각(segment) 면적의 합이다.
  // 조각 면적은 r²·(2θ - sin 2θ) / 2이고 θ는 중심각의 절반이다. 표준 공식(r²θ 두 항에서 kite를 뺌)은
  // 외접·내접 근처에서 큰 항끼리 상쇄해 정밀도를 잃고, 반지름비가 크면 어디서든 잃는다.
  // 그래서 세 가지를 바꾼다.
  // - Heron 인수 `ra + rb - d`, `d ± (rb - ra)`를 오차 없는 합(twoSum)으로 구해 가까운 수의 차에서 정밀도를 잃지 않는다.
  // - θ를 acos(인자 1 근처에서 오차 ~sqrt(ε)) 대신 반각 접선 `tan(θa/2) = sqrt(F1·F3 / (F2·F4))`로 구한다.
  //   F2 = d + ra - rb, F3 = d - ra + rb 처럼 상쇄 없는 곱과 비만 쓴다.
  // - 조각 형태 `2θ - sin 2θ`는 작은 θ에서 급수로 계산한다.
  const sumErr = twoSumError(ra, rb, sum);
  const delta = rb - ra;
  const deltaErr = twoSumError(rb, -ra, delta);
  const f1 = sum - d + sumErr; // ra + rb - d
  const f2 = d - delta - deltaErr; // d + ra - rb
  const f3 = d + delta + deltaErr; // d - ra + rb
  const f4 = d + sum + sumErr; // d + ra + rb
  // 비 f1 / f2는 d가 반지름의 1e-308배보다 작으면 Infinity로 넘친다. 그러면 Infinity·0이 NaN이 된다.
  // 인수별 sqrt를 곱해 atan2에 넘긴다.
  const s1 = Math.sqrt(f1);
  const s2 = Math.sqrt(f2);
  const s3 = Math.sqrt(f3);
  const s4 = Math.sqrt(f4);
  const alpha = 2 * Math.atan2(s1 * s3, s2 * s4);
  const beta = 2 * Math.atan2(s1 * s2, s3 * s4);
  // r²을 먼저 구하면 r > 1.3e154에서 넘친다. 조각 형태 값에 r을 한 번씩 곱한다.
  return ra * ((ra * angleMinusSine(2 * alpha)) / 2) + rb * ((rb * angleMinusSine(2 * beta)) / 2);
}

/**
 * `a + b`를 `s`로 반올림했을 때 잃은 오차 `(a + b) - s`를 정확히 구한다(Knuth twoSum).
 *
 * @param s 호출자가 계산한 `a + b`
 */
function twoSumError(a: number, b: number, s: number): number {
  const bb = s - a;
  return a - (s - bb) + (b - bb);
}

/**
 * `x - sin(x)`를 `x ∈ [0, 2π]`에서 계산한다.
 *
 * `x`가 작으면 `x - sin(x)`가 거의 같은 두 수의 차라 유효숫자를 잃는다. `x <= 0.5`에서는
 * 급수 `x³/3! - x⁵/5! + x⁷/7! - ...`를 12항까지 더해 상대 정밀도를 유지한다.
 */
function angleMinusSine(x: number): number {
  if (x > 0.5) return x - Math.sin(x);
  const x2 = x * x;
  let term = (x * x2) / 6;
  let sum = 0;
  for (let k = 3; k < 27; k += 2) {
    sum += term;
    term = (-term * x2) / ((k + 1) * (k + 2));
  }
  return sum;
}
