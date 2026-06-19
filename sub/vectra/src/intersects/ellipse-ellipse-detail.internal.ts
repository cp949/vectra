import type { EllipseEllipseDetail, PointRelationDetail, XYObjectWritable } from '../types';
import { canonTurn, ellipseResidual, type Hit, pointInEllipseClosedN } from './ellipse-ellipse-conic.internal';
import { solveQuadraticReal, solveQuarticReal } from './ellipse-ellipse-solver.internal';

export type { Hit } from './ellipse-ellipse-conic.internal';
export { canonTurn, ellipseResidual, pointInEllipseClosedN } from './ellipse-ellipse-conic.internal';
// 분할된 solver/conic helper를 동일 경로에서 노출하는 re-export 배럴.
// 소비처는 ellipseEllipseDetailXY만 import하지만, helper도 sibling .internal. 경계에서
// 재노출해 import 경로를 단일화한다.
export { solveCubicReal, solveQuadraticReal, solveQuarticReal } from './ellipse-ellipse-solver.internal';

// Newton 최대 반복. 정상 seed는 step-size break로 1~2회에 끝난다. wrong-sign seed가
// 실제 교점으로 이주하는 경우 완전 수렴까지 더 필요하므로(미수렴 시 dedupe가 못 합쳐
// two-point가 multi-point로 오분류됨) 여유 상한을 둔다. step-size break가 수렴 후 조기
// 종료하므로 큰 값이어도 정상 케이스 비용은 늘지 않는다.
const NEWTON_MAX_ITER = 64;

/**
 * 두 axis-aligned ellipse boundary의 교차 관계 detail을 raw 좌표/반지름에서 계산한다.
 *
 * `ellipseEllipseDetail`이 호출하는 source of truth다. empty(rx/ry ≤ 0)와 non-finite
 * center/radius는 boolean relation 성격에 맞춰 `none`으로 처리한다. 분기 tolerance(`epsilon`,
 * 절대값)와 좌표 dedupe/residual tolerance를 의미상 분리한다. 계산은 공통 scale로 정규화하되
 * center offset은 정규화 전에 직접 차분해 local offset 손실을 피한다. quartic root에서 복원한
 * 교점은 양쪽 ellipse 방정식 residual 가드를 통과한 점만 채택하고, 최종 좌표가 non-finite이면
 * 그 점을 버린다.
 *
 * @param epsilon 분기·tangent·containment 판정 임계값(절대)
 */
export function ellipseEllipseDetailXY(
  cax: number,
  cay: number,
  rax: number,
  ray: number,
  cbx: number,
  cby: number,
  rbx: number,
  rby: number,
  epsilon: number
): EllipseEllipseDetail {
  // C2 non-finite
  if (
    !Number.isFinite(cax) ||
    !Number.isFinite(cay) ||
    !Number.isFinite(rax) ||
    !Number.isFinite(ray) ||
    !Number.isFinite(cbx) ||
    !Number.isFinite(cby) ||
    !Number.isFinite(rbx) ||
    !Number.isFinite(rby)
  ) {
    return { kind: 'none' };
  }
  // C1 empty
  if (rax <= 0 || ray <= 0 || rbx <= 0 || rby <= 0) return { kind: 'none' };

  // ellipse a를 원점으로 옮기는 frame에서 정규화한다. center offset은 정규화 전에 직접
  // 차분해 local offset을 잃지 않는다(scale-normalized-difference-precision-loss 함정).
  // scale은 절대 center 크기가 아니라 translated frame의 radius/offset 규모로 정한다.
  // 절대 center가 커도(예: 1e8) radius/offset이 작으면(예: 1e-2) normalized radius가
  // 1로 유지되어 conic 계수 폭발과 quartic 정밀도 손실을 막는다.
  const oxAbs = cbx - cax; // ellipse a center 기준 b center offset (원 좌표)
  const oyAbs = cby - cay;
  const scale = Math.max(rax, ray, rbx, rby, Math.abs(oxAbs), Math.abs(oyAbs), 1);
  const ox = oxAbs / scale; // 정규화 offset
  const oy = oyAbs / scale;
  const nrax = rax / scale;
  const nray = ray / scale;
  const nrbx = rbx / scale;
  const nrby = rby / scale;
  const epsilonN = epsilon / scale;

  // ellipse a는 정규화 좌표 원점 중심. ellipse b는 (ox, oy) 중심.
  const A1 = 1 / (nrax * nrax);
  const B1 = 1 / (nray * nray);
  const A2 = 1 / (nrbx * nrbx);
  const B2 = 1 / (nrby * nrby);

  // C3 coincident: 같은 center + radius epsilon 이내
  if (Math.abs(ox) <= epsilonN && Math.abs(oy) <= epsilonN) {
    if (Math.abs(nrax - nrbx) <= epsilonN && Math.abs(nray - nrby) <= epsilonN) {
      return { kind: 'overlap' };
    }
  }

  // 차분 conic: α x² + β y² + γ x + δ y + ε = 0 (ellipse a 정규화 좌표 기준)
  const alpha = A2 - A1;
  const beta = B2 - B1;
  const gamma = -2 * A2 * ox;
  const delta = -2 * B2 * oy;
  const epsC = A2 * ox * ox + B2 * oy * oy;

  // dedupe/residual tolerance — 정규화 좌표 거리 기준 별도 임계
  // (numerical-solver-tolerance-split 함정). quartic root는 1차 scale이므로
  // 분기 epsilonN보다 느슨한 임계를 쓴다.
  const dedupeTol = Math.max(epsilonN, 1e-7);
  const residualTol = Math.max(epsilonN * 8, 1e-7);
  // solver 전용 임계: monic 정규화된 계수 frame에서 leading-coeff downgrade와 중근 판정
  // 기준이다. 정규화 후 계수는 O(1)이므로 float64 분해능(~2.2e-16)보다 충분히 큰 1e-12로
  // 두어 진짜 0 계수/중근은 잡고 정상 근은 보존한다.
  const solveEps = 1e-12;

  const hits: Hit[] = [];

  const pushHit = (rawX: number, rawY: number): void => {
    if (!Number.isFinite(rawX) || !Number.isFinite(rawY)) return;
    // 두 ellipse 방정식 {E_a=0, E_b=0}에 대한 2D Newton polish.
    // 두 ellipse가 거의 접하면(near-tangency) x root가 ill-conditioned라 quartic이 돌려준
    // x가 약간 부정확하고, ellipse a 기준 ±복원 y는 정확해도 ellipse b residual이 residualTol을
    // 초과해 실제 교점이 통째로 버려진다(false contains). 양쪽 곡선으로 동시에 끌어와 보정한다.
    // 실제 교점이 없으면 Newton이 수렴하지 않아 residual 가드가 그대로 거른다.
    let x = rawX;
    let y = rawY;
    for (let i = 0; i < NEWTON_MAX_ITER; i++) {
      const fa = x * x * A1 + y * y * B1 - 1;
      const dxb = x - ox;
      const dyb = y - oy;
      const fb = dxb * dxb * A2 + dyb * dyb * B2 - 1;
      const j11 = 2 * A1 * x;
      const j12 = 2 * B1 * y;
      const j21 = 2 * A2 * dxb;
      const j22 = 2 * B2 * dyb;
      const det = j11 * j22 - j12 * j21;
      if (Math.abs(det) <= solveEps) break; // Jacobian 특이(공통 접선 등) → 보정 중단
      const hx = (fa * j22 - fb * j12) / det;
      const hy = (j11 * fb - j21 * fa) / det;
      x -= hx;
      y -= hy;
      if (hx * hx + hy * hy <= solveEps * solveEps) break;
    }
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    // 양쪽 ellipse 방정식 residual 가드(relation-detail-parameter-coordinate-agreement 함정)
    if (ellipseResidual(x, y, 0, 0, A1, B1) > residualTol) return;
    if (ellipseResidual(x, y, ox, oy, A2, B2) > residualTol) return;
    // ellipse a 정규화 좌표 turn (ordering 기준)
    const turn = canonTurn(x / nrax, y / nray);
    hits.push({ x, y, turn });
  };

  // 차분 conic을 x에 대한 식으로 환원한다. y는 항상 ellipse a 방정식
  // y² = (1 - A1 x²)/B1 에서 ±부호로 복원하고 residual 가드가 잘못된 부호를 거른다.
  // δ로 직접 나눠 y를 복원하면 |δ|가 작을 때(두 ellipse가 거의 같은 y 위치)
  // catastrophic cancellation으로 y가 0으로 붕괴해 실제 교점을 놓친다. 그래서 양 분기
  // 모두 ellipse a 기준 ±복원을 쓰고, x root만 δ 유무로 2차/4차로 나눠 구한다.
  const P = alpha - (beta * A1) / B1;
  const Q = gamma;
  const R = epsC + beta / B1;
  // y2는 제곱 frame(거리²)이므로 선형 거리 임계 dedupeTol이 아니라 그 제곱(y2Tol)과 비교한다.
  const y2Tol = dedupeTol * dedupeTol;
  const pushFromX = (x: number): void => {
    const y2 = (1 - A1 * x * x) / B1;
    if (y2 < -y2Tol) return;
    const yy = Math.sqrt(Math.max(0, y2));
    pushHit(x, yy);
    if (yy > dedupeTol) pushHit(x, -yy);
  };

  let xRoots: number[];
  if (Math.abs(delta) <= solveEps) {
    // δ ≈ 0: 차분 conic에 y 항 없음 → P x² + Q x + R = 0.
    xRoots = solveQuadraticReal(P, Q, R, solveEps);
  } else {
    // δ ≠ 0: E_a 대입 B1·(P x²+Q x+R)² + δ²·(A1 x² - 1) = 0의 x root.
    const d2 = delta * delta;
    xRoots = solveQuarticReal(
      B1 * P * P,
      B1 * 2 * P * Q,
      B1 * (Q * Q + 2 * P * R) + d2 * A1,
      B1 * 2 * Q * R,
      B1 * R * R - d2,
      solveEps
    );
  }
  for (const x of xRoots) pushFromX(x);

  // 정규화 좌표 거리 기준 dedupe
  const distinct: Hit[] = [];
  for (const h of hits) {
    let dup = false;
    for (const k of distinct) {
      const dx = h.x - k.x;
      const dy = h.y - k.y;
      if (dx * dx + dy * dy <= dedupeTol * dedupeTol) {
        dup = true;
        break;
      }
    }
    if (!dup) distinct.push(h);
  }

  if (distinct.length === 0) {
    // C4/C5: boundary 교점 0개 → containment vs disjoint
    // a center(원점)가 b 내부면 a ⊂ b, b center가 a 내부면 b ⊂ a
    if (pointInEllipseClosedN(0, 0, ox, oy, A2, B2, epsilonN)) return { kind: 'contains' };
    if (pointInEllipseClosedN(ox, oy, 0, 0, A1, B1, epsilonN)) return { kind: 'contains' };
    return { kind: 'none' };
  }

  // ellipse a 기준 turn 오름차순 정렬
  distinct.sort((p, q) => p.turn - q.turn);

  // 정규화 frame(ellipse a 원점) 좌표를 원래 좌표로 복원하며 non-finite 검사.
  // h.x*scale은 a 원점 기준 offset이므로 cax/cay를 직접 더한다(round-trip 정밀도 손실 회피).
  const points: XYObjectWritable[] = [];
  for (const h of distinct) {
    const px = h.x * scale + cax;
    const py = h.y * scale + cay;
    if (!Number.isFinite(px) || !Number.isFinite(py)) return { kind: 'none' };
    points.push({ x: px, y: py });
  }

  if (points.length === 1) {
    // C6 tangent — 단일 boundary 교점
    const h = distinct[0] as Hit;
    const point = points[0] as XYObjectWritable;
    const detail: PointRelationDetail = {
      kind: 'point',
      point,
      tA: canonTurn(h.x / nrax, h.y / nray),
      tB: canonTurn((h.x - ox) / nrbx, (h.y - oy) / nrby),
    };
    return detail;
  }
  if (points.length === 2) {
    // C7 two-point
    return { kind: 'two-point', points: [points[0] as XYObjectWritable, points[1] as XYObjectWritable] };
  }
  // C8 multi-point (3~4점)
  return { kind: 'multi-point', points };
}
