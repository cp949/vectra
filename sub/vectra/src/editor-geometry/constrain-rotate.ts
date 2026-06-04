/**
 * constrainRotate — angle을 constraint 규칙으로 보정해 반환한다.
 */

import { snapScalar } from '../math/snap.internal';
import type { RotateConstraintOptions } from './types';

/**
 * angle(radian)을 constraint 규칙으로 보정한 값을 반환한다.
 *
 * - step이 지정되면 step 단위 격자에서 가장 가까운 후보를 계산한다.
 * - snapAngles가 지정되면 목록 중 가장 가까운 후보를 계산한다.
 * - 둘 다 지정되면 tolerance 이내 더 가까운 후보를 반환한다.
 * - tolerance 범위 밖이면 입력 angle을 그대로 반환한다.
 * - tolerance가 양의 유한수가 아니면 항상 입력 angle을 그대로 반환한다.
 * - invalid step(0, 음수, NaN) → NaN propagation.
 * - NaN 입력은 silent propagation. throw 없음.
 *
 * @param angle 보정할 각도 (radian)
 * @param options step, snapAngles, tolerance 옵션
 */
export function constrainRotate(angle: number, options: RotateConstraintOptions): number {
  const { tolerance, step, snapAngles } = options;

  // tolerance가 양의 유한수가 아니면 snap 없음
  if (!(tolerance > 0 && Number.isFinite(tolerance))) {
    return angle;
  }

  // angle이 유한수가 아니면 snapScalar contract 위반 없이 propagation
  if (!Number.isFinite(angle)) return angle;

  let bestCandidate: number | undefined;
  let bestDistance = Infinity;

  // step 후보 계산
  // invalid step(0, 음수, NaN) → NaN propagation (snapAngle과 동일 정책)
  if (step !== undefined) {
    if (!(step > 0)) {
      // step이 양수가 아니면 (0, 음수, NaN 포함) NaN propagation
      return Number.NaN;
    }
    const stepCandidate = snapScalar(angle, step, 0);
    const dist = Math.abs(angle - stepCandidate);
    if (dist <= tolerance) {
      bestCandidate = stepCandidate;
      bestDistance = dist;
    }
  }

  // snapAngles 후보 계산
  if (snapAngles !== undefined && snapAngles.length > 0) {
    for (const sa of snapAngles) {
      const dist = Math.abs(angle - sa);
      if (dist <= tolerance && dist < bestDistance) {
        bestCandidate = sa;
        bestDistance = dist;
      }
    }
  }

  return bestCandidate !== undefined ? bestCandidate : angle;
}
