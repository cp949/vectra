import type { LineFamilyParam } from '../internal/line-family';
import { lineFamilyIntersects } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';

/*
 * ring self-intersection의 AABB sweep 가속.
 *
 * 목표
 * - `ringSelfIntersects`의 O(n²) pair 비교에서 후보 쌍을 줄인다.
 * - 반환값은 전수 비교와 모든 입력에서 같아야 한다. 성능 변경이다.
 *
 * 왜 pad가 필요한가
 * - `lineFamilyIntersects`는 순수 기하 판정이 아니다.
 * - 두 segment의 AABB가 떨어져 있어도 true를 낼 수 있다.
 * - 그래서 AABB를 edge별 반경 r_i만큼 넓힌다. 넓힌 AABB가 겹치는 쌍만 판정한다.
 * - 쌍 (a, b)의 허용 거리는 r_a + r_b다.
 * - 이 값은 판정이 true를 낼 수 있는 쌍의 AABB 거리 상한 이상이어야 한다.
 *
 * 반경
 *   r_i = ε + (ε + C·u/ε)·len_i + 8·u·M
 * - ε: DEFAULT_EPSILON (1e-9).
 * - u: Number.EPSILON.
 * - C: CROSSING_PAD_FACTOR (8).
 * - len_i: edge i의 길이.
 * - M: ring 좌표의 최대 절대값.
 * - 전역 pad를 쓰지 않는다. 긴 edge 하나가 모든 AABB를 넓혀 O(n²)로 퇴화하기 때문이다.
 *
 * r_a + r_b가 덮는 경로 (|a|, |b|는 두 edge 길이)
 * - collinear: 필요한 거리는 1e-9 + 1e-9·|b|다.
 *   B의 origin이 A의 직선에서 1e-9 이내여야 한다. sin θ ≤ 1e-9라 B의 먼 끝점은 1e-9·|b|까지 벗어난다.
 *   r_a + r_b에는 2e-9 + 1e-9·(|a| + |b|)가 있다.
 * - degenerate (길이 0): 필요한 거리는 1e-9다. r_a + r_b의 2e-9가 덮는다.
 * - crossing: 필요한 거리는 4·(|a| + |b|)·u/ε이다.
 *   근평행(sin θ가 ε 바로 위)에서는 cross 상쇄 때문에 t, u의 오차가 u/sin θ배로 커진다.
 *   유도 (1차 오차): |δcross| ≲ u·|a||b|, |δN_t| ≲ 1.5·u·|q||b|, |cross| > ε·|a||b|다.
 *   그러면 |a|·|δt| ≲ u·(1.5|q| + |t||a|)/ε다. |q| ≤ |t||a| + |u||b|를 넣으면 두 segment까지의
 *   거리 합이 4·(|a| + |b|)·u/ε 이하다.
 *   r_a + r_b에는 C·(|a| + |b|)·u/ε가 있다. C = 8이면 유도 상한 4의 2배다.
 *   근평행 쌍 약 2,600만 회 실측의 최댓값은 0.30·(|a| + |b|)·u/ε였다. 실측 대비 약 26배 여유다.
 * - 좌표 반올림: 8·u·M 항은 방어 마진이다. 위 경로의 필요한 거리에는 M이 들어가지 않는다.
 *   AABB는 원 vertex 좌표로 만든다. `min - r`, `max + r`의 반올림은 단조라 겹침 판정을 뒤집지 않는다.
 *   이 항을 0으로 바꾼 변이도 fuzz에서 불일치가 없었다. 1차 오차 분석이 놓친 경로에 대비해 남긴다.
 *   r_a + r_b에는 16·u·M이 있다.
 *
 * 쓰지 않는 입력 (undefined를 반환해 호출자가 O(n²) 루프로 폴백한다)
 * - edge 길이² > Math.sqrt(Number.MAX_VALUE). NaN, ±Infinity 좌표도 부정형 비교로 여기서 걸린다.
 *   이 한계 아래에서는 모든 쌍의 길이² 곱이 유한이라 `crossExceeds`가 절대 비교로 되돌아가지 않는다.
 *   절대 비교 분기는 sin θ 하한이 없어 거리 상한을 정할 수 없다.
 *   non-finite 좌표는 AABB 비교가 NaN에서 false라 true를 내는 쌍을 놓친다.
 * - 명시 epsilon은 이 파일에 오지 않는다. 평행 판정이 정규화되지 않아 이탈 상한을 정할 수 없다.
 *
 * 인자 순서
 * - `lineFamilyIntersects`는 인자 순서에 비대칭이다. collinear 경로는 B의 origin만 A의 직선까지 잰다.
 * - 전수 비교는 항상 (작은 index, 큰 index)로 호출한다. 이 파일도 같은 순서로 넘긴다.
 *
 * 계수를 바꾸면 위 유도를 다시 쓴다. 증명이 안 되는 경로는 폴백으로 뺀다.
 */

/**
 * 이 개수 미만의 ring은 전수 비교를 쓴다. 작은 ring에서는 정렬과 배열 할당 비용이 이득보다 크다.
 * 원형·star-shaped·긴 edge가 겹치는 zigzag 실측에서 손익분기는 vertex 약 40개였다.
 * 64에서는 이 세 입력 모두 sweep이 1.7배 이상 빠르다.
 */
export const SWEEP_MIN_VERTEX_COUNT = 64;

/** edge 길이² 상한이다. 이 값 이하면 모든 쌍의 길이² 곱이 유한하다. */
const MAX_SAFE_LEN_SQ = Math.sqrt(Number.MAX_VALUE);

/** crossing 경로 pad 계수 C. 유도 상한 4의 2배다. */
const CROSSING_PAD_FACTOR = 8;

/** 좌표 반올림 pad 계수. 필요한 거리 8·u·M 이하를 edge 하나가 덮는다(쌍으로는 16·u·M). */
const COORDINATE_PAD_FACTOR = 8;

/** edge 길이 한 단위당 반경: collinear 이탈 ε와 crossing 오차 증폭 C·u/ε의 합이다. */
const LENGTH_PAD_RATE = DEFAULT_EPSILON + (CROSSING_PAD_FACTOR * Number.EPSILON) / DEFAULT_EPSILON;

/**
 * 넓힌 AABB를 x로 정렬해 후보 쌍만 `lineFamilyIntersects`로 판정한다.
 *
 * `edges[i]`는 `pts[i]` → `pts[(i + 1) % n]` segment다. 인접 edge 쌍은 건너뛴다(첫 edge와 마지막 edge 포함).
 * 반환값이 `undefined`이면 sweep을 쓸 수 없는 입력이다. caller가 전수 비교로 폴백한다.
 *
 * @param edges ring의 edge param. 길이 4 이상
 * @returns 쌍 하나라도 true면 true, 모두 false면 false, 폴백이 필요하면 undefined
 */
export function sweepRingSelfIntersects(edges: readonly LineFamilyParam[]): boolean | undefined {
  const n = edges.length;

  const lengths = new Float64Array(n);
  let maxAbs = 0;
  for (let i = 0; i < n; i++) {
    const { ox, oy, dx, dy } = edges[i];
    const lenSq = dx * dx + dy * dy;
    // 부정형으로 쓴다. NaN과 Infinity가 `<=`에서 false라 여기서 걸린다.
    // `>`로 바꿔도 테스트는 통과한다. non-finite 좌표가 maxAbs를 NaN·Infinity로 만들어 모든 쌍을 비교하기 때문이다.
    // 그 전파에 기대지 않으려고 여기서 거른다.
    if (!(lenSq <= MAX_SAFE_LEN_SQ)) return undefined;
    lengths[i] = Math.sqrt(lenSq);
    // 모든 vertex는 어떤 edge의 origin이다. 여기서 ring 전체 좌표를 훑는다.
    maxAbs = Math.max(maxAbs, Math.abs(ox), Math.abs(oy));
  }

  const coordinatePad = COORDINATE_PAD_FACTOR * Number.EPSILON * maxAbs;
  const loX = new Float64Array(n);
  const hiX = new Float64Array(n);
  const loY = new Float64Array(n);
  const hiY = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const a = edges[i];
    // 끝점은 dx를 더하지 않고 다음 edge의 origin(원 vertex 좌표)을 쓴다. 덧셈 반올림이 끼지 않는다.
    const b = edges[i + 1 === n ? 0 : i + 1];
    const radius = DEFAULT_EPSILON + LENGTH_PAD_RATE * lengths[i] + coordinatePad;
    loX[i] = Math.min(a.ox, b.ox) - radius;
    hiX[i] = Math.max(a.ox, b.ox) + radius;
    loY[i] = Math.min(a.oy, b.oy) - radius;
    hiY[i] = Math.max(a.oy, b.oy) + radius;
  }

  const order = new Uint32Array(n);
  for (let i = 0; i < n; i++) order[i] = i;
  order.sort((p, q) => loX[p] - loX[q]);

  for (let k = 0; k < n; k++) {
    const i = order[k];
    const reach = hiX[i];
    for (let m = k + 1; m < n; m++) {
      const j = order[m];
      // 정렬상 뒤의 edge는 loX가 더 크다. 한 번 넘으면 이후 edge는 모두 x로 떨어져 있다.
      if (loX[j] > reach) break;
      if (loY[j] > hiY[i] || loY[i] > hiY[j]) continue;

      // 판정이 인자 순서에 비대칭이라 전수 비교와 같은 (작은 index, 큰 index) 순서로 넘긴다.
      const lo = i < j ? i : j;
      const hi = i < j ? j : i;
      if (hi - lo === 1 || (lo === 0 && hi === n - 1)) continue;
      if (lineFamilyIntersects(edges[lo], edges[hi], undefined)) return true;
    }
  }
  return false;
}
