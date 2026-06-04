import type { CircleCircleDetail, PointRelationDetail } from '../types';

const TWO_PI = Math.PI * 2;

/**
 * center 기준 offset의 normalized turn parameter를 `[0, 1)`로 canonicalize한다.
 *
 * `atan2(dy, dx) / 2π`는 `(-0.5, 0.5]`를 반환하므로 `floor` 차감으로 `[0, 1)`로 옮긴다.
 * 아주 작은 음수 turn은 `t - floor(t)`가 float 반올림으로 정확히 `1.0`이 될 수 있어 `0`으로 접는다.
 */
function canonTurn(dx: number, dy: number): number {
  const t = Math.atan2(dy, dx) / TWO_PI;
  const turn = t - Math.floor(t);
  return turn < 1 ? turn : 0;
}

/**
 * 정규화된 좌표계의 point detail을 원래 scale 좌표로 되돌린다.
 *
 * 외접/내접 tangent 모두 `a = (d² + rA² - rB²) / (2d)` 부호가 접점 방향을 결정해 한 식으로 처리한다.
 * `none` 반환은 fallback이다. `epsilon`이 좌표/반지름 scale에 필적하는 degenerate 입력에서는
 * tangent band가 contains/none 영역을 삼켜 `d → 0`·반지름 차이로 `a`가 발산하고 복원 좌표가
 * overflow할 수 있다. `epsilon ≪ min(rA, rB)`인 정상 입력에서는 접점이 envelope 안이라 도달하지 않는다.
 */
function scaledTangentDetail(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  rA: number,
  rB: number,
  d: number,
  scale: number
): PointRelationDetail | { kind: 'none' } {
  const a = (d * d + rA * rA - rB * rB) / (2 * d);
  const ux = (bx - ax) / d;
  const uy = (by - ay) / d;
  const pxn = ax + a * ux;
  const pyn = ay + a * uy;
  const px = pxn * scale;
  const py = pyn * scale;
  // fallback: epsilon이 scale에 필적하는 degenerate 입력에서만 overflow로 도달한다.
  if (!Number.isFinite(px) || !Number.isFinite(py)) return { kind: 'none' };
  return {
    kind: 'point',
    point: { x: px, y: py },
    tA: canonTurn(pxn - ax, pyn - ay),
    tB: canonTurn(pxn - bx, pyn - by),
  };
}

/**
 * 두 circle circumference의 교차 관계 detail을 raw 좌표/반지름에서 계산한다.
 *
 * `circleCircleDetail`과 `circleCircleIntersectionsInto`가 공유하는 source of truth다.
 * radius ≤ 0과 non-finite center/radius는 boolean relation 성격에 맞춰 `none`으로 처리한다.
 * `epsilon`은 center distance 비교와 tangent 판정에만 쓰고 finite validation에는 쓰지 않는다. 계산은
 * 공통 scale로 정규화해 `d²`/`r²` overflow를 피하고, 최종 좌표가 non-finite이면 `none`으로 환원한다.
 * `epsilon`은 절대 임계값이며 두 radius보다 충분히 작다고 가정한다. radius가 `epsilon` 규모 이하면
 * 분리/접선 경계가 합쳐져 분리된 circle을 `point`로 분류할 수 있다.
 */
export function circleCircleDetailXY(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  rA: number,
  rB: number,
  epsilon: number
): CircleCircleDetail {
  if (
    !Number.isFinite(ax) ||
    !Number.isFinite(ay) ||
    !Number.isFinite(bx) ||
    !Number.isFinite(by) ||
    !Number.isFinite(rA) ||
    !Number.isFinite(rB)
  ) {
    return { kind: 'none' };
  }
  if (rA <= 0 || rB <= 0) return { kind: 'none' };

  const scale = Math.max(Math.abs(ax), Math.abs(ay), Math.abs(bx), Math.abs(by), rA, rB, 1);
  const nax = ax / scale;
  const nay = ay / scale;
  const nbx = bx / scale;
  const nby = by / scale;
  const nrA = rA / scale;
  const nrB = rB / scale;
  const epsilonN = epsilon / scale;

  const dx = nbx - nax;
  const dy = nby - nay;
  const d = Math.hypot(dx, dy);
  if (!Number.isFinite(d)) return { kind: 'none' };

  const rSum = nrA + nrB;
  const rDiff = Math.abs(nrA - nrB);

  // concentric — 중심이 정확히 같을 때만 단축한다. division-by-zero(ux=dx/d)를 피하고
  // 반지름 동일 여부로 overlap/contains를 가른다. 중심이 미세하게라도 떨어지면(d>0)
  // 일반 경로가 two-point/contains/tangent를 정확히 분류한다.
  if (d === 0) {
    return rDiff <= epsilonN ? { kind: 'overlap' } : { kind: 'contains' };
  }

  // 외부 분리
  if (d > rSum + epsilonN) return { kind: 'none' };
  // 외접 tangent (|d - rSum| ≤ epsilonN)
  if (d >= rSum - epsilonN) return scaledTangentDetail(nax, nay, nbx, nby, nrA, nrB, d, scale);
  // 한 circle이 다른 disk 내부에 있고 경계가 닿지 않음
  if (d < rDiff - epsilonN) return { kind: 'contains' };
  // 내접 tangent (|d - rDiff| ≤ epsilonN)
  if (d <= rDiff + epsilonN) return scaledTangentDetail(nax, nay, nbx, nby, nrA, nrB, d, scale);

  // proper two-point — radical line foot에서 수직으로 ±h
  const a = (d * d + nrA * nrA - nrB * nrB) / (2 * d);
  const ux = dx / d;
  const uy = dy / d;
  const footx = nax + a * ux;
  const footy = nay + a * uy;
  const h = Math.sqrt(Math.max(0, nrA * nrA - a * a));
  const p0xn = footx - h * uy;
  const p0yn = footy + h * ux;
  const p1xn = footx + h * uy;
  const p1yn = footy - h * ux;
  const p0x = p0xn * scale;
  const p0y = p0yn * scale;
  const p1x = p1xn * scale;
  const p1y = p1yn * scale;

  // scale 복원 후 교점 좌표가 non-finite이면 `none`으로 환원한다.
  if (!Number.isFinite(p0x) || !Number.isFinite(p0y) || !Number.isFinite(p1x) || !Number.isFinite(p1y)) {
    return { kind: 'none' };
  }

  // circle a 기준 turn 오름차순
  const t0 = canonTurn(p0xn - nax, p0yn - nay);
  const t1 = canonTurn(p1xn - nax, p1yn - nay);
  return t0 <= t1
    ? {
        kind: 'two-point',
        points: [
          { x: p0x, y: p0y },
          { x: p1x, y: p1y },
        ],
      }
    : {
        kind: 'two-point',
        points: [
          { x: p1x, y: p1y },
          { x: p0x, y: p0y },
        ],
      };
}
