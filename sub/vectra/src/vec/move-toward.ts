import { readX, readY } from '../internal/xy';
import { moveTowardPoint } from '../interpolation/move-toward-point';
import type { XYInput } from '../types';

/**
 * current 벡터를 target 방향으로 최대 maxDistance만큼 이동한 벡터를 새 object로 반환한다.
 *
 * `interpolation.moveTowardPoint`와 동일한 계산 및 정책을 사용하는 vec 도메인 alias다.
 * `maxDistance < 0`이면 RangeError를 던진다.
 * 모든 input의 x/y와 maxDistance는 finite number여야 한다.
 *
 * @param current 이동 시작 벡터
 * @param target 이동 목표 벡터
 * @param maxDistance 최대 이동 거리. 0 이상의 finite number여야 한다.
 */
export function moveToward(current: XYInput, target: XYInput, maxDistance: number): { x: number; y: number } {
  // v2-migration: vec의 tuple 입력 계약을 유지한다.
  const currentPoint = { x: readX(current), y: readY(current) };
  const targetPoint = { x: readX(target), y: readY(target) };
  return moveTowardPoint(currentPoint, targetPoint, maxDistance);
}
