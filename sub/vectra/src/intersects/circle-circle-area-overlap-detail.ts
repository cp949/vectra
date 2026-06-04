import { readCircleCenter, readCircleRadius } from '../internal/circle';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readX, readY } from '../internal/xy';
import type { AreaOverlapDetail, CircleLike } from '../types';

/**
 * 두 disk(채워진 원)의 면적 중첩 관계 detail을 반환한다.
 *
 * `circleCircleDetail`은 circumference(경계선) 교점 관계인 반면 이 함수는 disk area 중첩 관계다.
 * boolean `intersectsCircleCircle`로 손실되는 touch / overlap / contains 구분을 노출한다.
 * - `none`: 외부 분리, radius ≤ 0, non-finite center/radius.
 * - `touch`: 외접/내접 tangent. tangent point 1개를 반환한다.
 * - `overlap`: 두 disk가 양의 면적으로 겹치는 proper lens. 어느 쪽도 다른 쪽을 포함하지 않는다.
 * - `contains`: 한 disk가 다른 disk를 완전히 포함한다. 동심 반지름 다른 disk와 완전히 같은 disk도 `contains`다.
 *
 * `AreaOverlapDetail`은 어느 쪽이 포함자인지 표현하지 않는다. 실제 lens 면적이나 교점은 담지 않는다.
 * tangent point는 매 호출 새로 만든 plain `{ x, y }` object이며 입력 center object를 재사용하지 않는다.
 * fixed plain result object이며 `Into`/companion 대상이 아니다.
 * `epsilon`은 center distance 기반 분리/tangent/contains 경계 판정에만 쓰고 finite validation에는
 * 쓰지 않는다. 계산은 공통 scale로 정규화해 center distance와 radius sum 비교 overflow를 피한다.
 * touch point 복원 좌표가 non-finite이면 `none`으로 환원한다. radius가 `epsilon` 규모 이하면
 * 분리/접선 경계가 합쳐질 수 있다.
 *
 * @param a 첫 번째 circle. tangent point 좌표 계산 기준이다.
 * @param b 두 번째 circle
 * @param epsilon 분리/tangent/contains 경계 판정 임계값
 */
export function circleCircleAreaOverlapDetail(
  a: CircleLike,
  b: CircleLike,
  epsilon = DEFAULT_EPSILON
): AreaOverlapDetail {
  const ca = readCircleCenter(a);
  const cb = readCircleCenter(b);
  const ax = readX(ca);
  const ay = readY(ca);
  const bx = readX(cb);
  const by = readY(cb);
  const ra = readCircleRadius(a);
  const rb = readCircleRadius(b);

  if (!Number.isFinite(ax) || !Number.isFinite(ay) || !Number.isFinite(bx) || !Number.isFinite(by)) {
    return { kind: 'none' };
  }
  if (!Number.isFinite(ra) || !Number.isFinite(rb) || ra <= 0 || rb <= 0) return { kind: 'none' };

  const scale = Math.max(Math.abs(ax), Math.abs(ay), Math.abs(bx), Math.abs(by), ra, rb, 1);
  const nax = ax / scale;
  const nay = ay / scale;
  const nbx = bx / scale;
  const nby = by / scale;
  const nra = ra / scale;
  const nrb = rb / scale;
  const epsilonN = epsilon / scale;

  const dx = nbx - nax;
  const dy = nby - nay;
  const d = Math.hypot(dx, dy);
  const sum = nra + nrb;
  const diff = Math.abs(nra - nrb);

  // 외부 분리
  if (d - sum > epsilonN) return { kind: 'none' };

  // 동심/준동심 disk는 tangent point를 안정적으로 정의할 수 없고 containment로 분류한다.
  if (d <= epsilonN) return { kind: 'contains' };

  // 외접 tangent: a 중심에서 b 방향으로 ra 거리
  if (Math.abs(d - sum) <= epsilonN) {
    const u = nra / d;
    return scaledTouch(nax + dx * u, nay + dy * u, scale);
  }

  // 내접 tangent band: 한 disk가 다른 disk 경계에 한 점으로 닿음
  if (Math.abs(d - diff) <= epsilonN) {
    // tangent point는 큰 disk 쪽 boundary 방향이다.
    const s = (nra >= nrb ? nra : -nra) / d;
    return scaledTouch(nax + dx * s, nay + dy * s, scale);
  }

  // containment(strict): 작은 disk가 큰 disk 안에 완전히 들어감
  if (d - diff < -epsilonN) return { kind: 'contains' };

  // proper lens
  return { kind: 'overlap' };
}

/** 정규화 좌표계의 touch point를 원래 좌표계로 복원한다. 복원 overflow는 none으로 환원한다. */
function scaledTouch(x: number, y: number, scale: number): AreaOverlapDetail {
  const px = x * scale;
  const py = y * scale;
  if (!Number.isFinite(px) || !Number.isFinite(py)) return { kind: 'none' };
  return { kind: 'touch', points: [{ x: px, y: py }] };
}
