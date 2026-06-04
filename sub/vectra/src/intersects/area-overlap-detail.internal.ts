/**
 * area overlap detail consumer helper의 internal 계산 kernel.
 *
 * axis-aligned area pair(rect, bounds)의 면적 중첩 관계를 분류한다.
 * public API에 노출되지 않는다.
 */

import type { AreaOverlapDetail } from '../types';

/**
 * min-corner + 크기로 정규화한 두 axis-aligned 영역의 면적 중첩 관계를 분류한다.
 *
 * 각 영역은 `[x, x + w] × [y, y + h]` closed 사각형이다. `w`/`h`가 `0` 이하이거나
 * non-finite면 면적이 없는 빈 영역으로 보고 `none`을 반환한다.
 *
 * - `none`: 한쪽이 빈 영역이거나 x/y 구간 중 하나라도 분리된다.
 * - `touch`: 교집합이 면적 없는 점/선분으로 수렴한다. corner touch는 점 1개,
 *   edge touch는 닿는 선분 양 끝점 2개를 반환한다.
 * - `overlap`: 교집합이 양의 면적을 가지고 어느 쪽도 다른 쪽을 완전히 포함하지 않는다.
 * - `contains`: 한쪽이 다른 쪽을 완전히 포함한다. 완전히 일치하는 경우도 `contains`다.
 *
 * touch point는 매 호출 새로 만든 plain `{ x, y }` object다.
 * `epsilon`은 구간 분리/touch/contains 경계 판정에만 쓰고 finite validation에는 쓰지 않는다.
 *
 * @param ax 첫 번째 영역 min-corner x
 * @param ay 첫 번째 영역 min-corner y
 * @param aw 첫 번째 영역 width
 * @param ah 첫 번째 영역 height
 * @param bx 두 번째 영역 min-corner x
 * @param by 두 번째 영역 min-corner y
 * @param bw 두 번째 영역 width
 * @param bh 두 번째 영역 height
 * @param epsilon 분리/touch/contains 경계 판정 임계값
 */
export function axisAlignedAreaOverlapDetail(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number,
  epsilon: number
): AreaOverlapDetail {
  if (!isFiniteArea(ax, ay, aw, ah) || !isFiniteArea(bx, by, bw, bh)) return { kind: 'none' };
  if (aw <= 0 || ah <= 0 || bw <= 0 || bh <= 0) return { kind: 'none' };

  const aMaxX = ax + aw;
  const aMaxY = ay + ah;
  const bMaxX = bx + bw;
  const bMaxY = by + bh;
  if (!Number.isFinite(aMaxX) || !Number.isFinite(aMaxY) || !Number.isFinite(bMaxX) || !Number.isFinite(bMaxY)) {
    return { kind: 'none' };
  }

  // 교집합 구간
  const ix0 = Math.max(ax, bx);
  const ix1 = Math.min(aMaxX, bMaxX);
  const iy0 = Math.max(ay, by);
  const iy1 = Math.min(aMaxY, bMaxY);
  const xOverlap = ix1 - ix0;
  const yOverlap = iy1 - iy0;

  // x 또는 y 구간이 분리되면 disjoint
  if (xOverlap < -epsilon || yOverlap < -epsilon) return { kind: 'none' };

  // 면적 없는 교집합: touch
  if (xOverlap <= epsilon || yOverlap <= epsilon) {
    const xThin = xOverlap <= epsilon;
    const yThin = yOverlap <= epsilon;
    if (xThin && yThin) {
      // corner touch: 점 1개
      return { kind: 'touch', points: [{ x: midpoint(ix0, ix1), y: midpoint(iy0, iy1) }] };
    }
    if (xThin) {
      // 세로 edge touch: x 고정, y 구간 양 끝점
      const x = midpoint(ix0, ix1);
      return {
        kind: 'touch',
        points: [
          { x, y: iy0 },
          { x, y: iy1 },
        ],
      };
    }
    // 가로 edge touch: y 고정, x 구간 양 끝점
    const y = midpoint(iy0, iy1);
    return {
      kind: 'touch',
      points: [
        { x: ix0, y },
        { x: ix1, y },
      ],
    };
  }

  // 양의 면적 중첩: containment 여부 판정
  if (contains(ax, ay, aMaxX, aMaxY, bx, by, bMaxX, bMaxY, epsilon)) return { kind: 'contains' };
  if (contains(bx, by, bMaxX, bMaxY, ax, ay, aMaxX, aMaxY, epsilon)) return { kind: 'contains' };
  return { kind: 'overlap' };
}

/** 영역 좌표/크기가 모두 finite인지 확인한다. */
function isFiniteArea(x: number, y: number, w: number, h: number): boolean {
  return Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(w) && Number.isFinite(h);
}

/** 두 좌표의 중점. 거의 같은 두 경계 좌표의 대표 touch 좌표를 만든다. */
function midpoint(lo: number, hi: number): number {
  return lo + (hi - lo) / 2;
}

/** 첫 번째 영역이 두 번째 영역을 epsilon 여유로 완전히 포함하는지 확인한다. */
function contains(
  oMinX: number,
  oMinY: number,
  oMaxX: number,
  oMaxY: number,
  iMinX: number,
  iMinY: number,
  iMaxX: number,
  iMaxY: number,
  epsilon: number
): boolean {
  return oMinX <= iMinX + epsilon && oMinY <= iMinY + epsilon && oMaxX >= iMaxX - epsilon && oMaxY >= iMaxY - epsilon;
}
