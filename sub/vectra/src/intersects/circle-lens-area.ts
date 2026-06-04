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
 * - proper lens: 두 원 중첩 면적의 표준 공식.
 *
 * center distance는 `Math.hypot`로 계산한다. disjoint/containment 경계는 exact 비교로 판정하며
 * near-equality tolerance를 추가하지 않는다. proper lens의 `acos` 인자와 kite 항은 내접 경계 근처
 * 반올림으로 정의역을 벗어나도 `NaN`이 나오지 않게 clamp한다. detail helper와 달리 면적 값을 직접
 * 반환하고 `Into`/companion이 없다.
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

  // proper lens: 두 원 중첩 면적 표준 공식. 마지막 항은 두 교점이 이루는 kite 면적이다.
  // 내접 경계(d → diff+) 근처에서 acos 인자와 kite 곱은 반올림으로 정의역을 살짝 벗어날 수 있어
  // [-1, 1]과 [0, ∞)로 clamp한다. 이렇게 하면 면적이 containment의 작은 disk area로 연속 수렴한다.
  const ra2 = ra * ra;
  const rb2 = rb * rb;
  const alpha = Math.acos(clampUnit((d * d + ra2 - rb2) / (2 * d * ra)));
  const beta = Math.acos(clampUnit((d * d + rb2 - ra2) / (2 * d * rb)));
  const kite = 0.5 * Math.sqrt(Math.max(0, (-d + ra + rb) * (d + ra - rb) * (d - ra + rb) * (d + ra + rb)));
  return ra2 * alpha + rb2 * beta - kite;
}

/** acos 인자를 [-1, 1]로 clamp해 near-tangent rounding으로 인한 domain NaN을 막는다. */
function clampUnit(v: number): number {
  if (v < -1) return -1;
  if (v > 1) return 1;
  return v;
}
