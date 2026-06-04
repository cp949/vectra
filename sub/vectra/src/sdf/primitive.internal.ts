import { readX, readY } from '../internal/xy';
import type { XYInput } from '../types';

/**
 * 값이 finite가 아니면 RangeError를 던지고, finite면 그대로 반환한다.
 *
 * `NaN`, `Infinity`, `-Infinity`를 모두 거부한다. signed distance 입력은 모두 finite여야 하므로
 * shape 좌표와 point 좌표를 이 helper로 검증한다.
 *
 * @param value 검증할 좌표 또는 스칼라
 * @param label 실패 메시지에 쓸 입력 이름
 */
export function requireFinite(value: number, label: string): number {
  if (!Number.isFinite(value)) {
    throw new RangeError(`sdf ${label} must be a finite number, got ${String(value)}`);
  }
  return value;
}

/**
 * 값이 finite non-negative가 아니면 RangeError를 던지고, 맞으면 그대로 반환한다.
 *
 * `value < 0`과 non-finite 값(`NaN`, `Infinity`, `-Infinity`)을 거부한다. circle/capsule radius와
 * rect width/height처럼 음수가 의미 없는 size 입력을 검증한다.
 *
 * @param value 검증할 size 또는 radius
 * @param label 실패 메시지에 쓸 입력 이름
 */
export function requireNonNegative(value: number, label: string): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`sdf ${label} must be a finite non-negative number, got ${String(value)}`);
  }
  return value;
}

/**
 * signed distance 결과의 `-0`을 `+0`으로 정규화한다.
 *
 * 부호 반전이나 `max`/`min` 산술이 경계에서 `-0`을 만들 수 있다. boundary 결과는 항상 `+0`이어야
 * 하므로 `0` 비교로 `-0`을 흡수하고, non-zero 값은 그대로 반환한다. finite 입력만 통과하므로 `NaN`은
 * 도달하지 않는다.
 *
 * @param value 정규화할 signed distance 결과
 */
export function canonicalizeZero(value: number): number {
  return value === 0 ? 0 : value;
}

/**
 * closed interval과 scalar point 사이의 signed distance를 반환한다.
 *
 * `size === 0`은 interior 없는 point interval로 처리한다. `start + size`가 overflow해도 finite 좌표
 * 범위에서 left edge 기준 interior distance를 유지한다.
 *
 * @param start interval 시작 좌표
 * @param size interval 길이. caller가 finite non-negative를 보장한다
 * @param point distance를 측정할 좌표
 */
export function signedIntervalDistance(start: number, size: number, point: number): number {
  if (size === 0) return Math.abs(point - start);

  if (point < start) return start - point;

  const end = start + size;
  if (Number.isFinite(end)) {
    if (point > end) return point - end;
    const nearestEdgeDistance = Math.min(point - start, end - point);
    return nearestEdgeDistance === 0 ? 0 : -nearestEdgeDistance;
  }

  const leftDistance = point - start;
  return leftDistance === 0 ? 0 : -leftDistance;
}

/**
 * closed interval을 양쪽에서 같은 거리만큼 inset한 뒤 scalar point까지의 signed distance를 반환한다.
 *
 * `start + inset` 또는 `start + size - inset`가 overflow할 수 있으므로 시작점 기준 거리로 계산한다.
 * rounded rect처럼 inset interval까지의 box SDF를 만든 뒤 radius를 빼는 caller가 사용한다.
 *
 * @param start 원본 interval 시작 좌표
 * @param size 원본 interval 길이. caller가 finite non-negative를 보장한다
 * @param inset 양쪽에서 줄일 거리. caller가 `0 <= inset <= size / 2`를 보장한다
 * @param point distance를 측정할 좌표
 */
export function signedInsetIntervalDistance(start: number, size: number, inset: number, point: number): number {
  if (inset === 0) return signedIntervalDistance(start, size, point);

  if (point < start) return start - point + inset;

  const end = start + size;
  if (Number.isFinite(end)) {
    if (point > end) return point - end + inset;
    const leftDistance = point - start;
    const rightDistance = end - point;
    if (leftDistance < inset) return inset - leftDistance;
    if (rightDistance < inset) return inset - rightDistance;
    const nearestEdgeDistance = Math.min(leftDistance - inset, rightDistance - inset);
    return nearestEdgeDistance === 0 ? 0 : -nearestEdgeDistance;
  }

  const leftDistance = point - start;
  if (leftDistance < inset) return inset - leftDistance;

  const rightDistance = size - leftDistance;
  if (rightDistance < inset) return inset - rightDistance;

  const nearestEdgeDistance = Math.min(leftDistance - inset, rightDistance - inset);
  return nearestEdgeDistance === 0 ? 0 : -nearestEdgeDistance;
}

/**
 * XYInput의 x를 읽어 finite인지 검증하고 반환한다. non-finite면 RangeError다.
 *
 * @param point x를 읽을 structural point
 * @param label 실패 메시지에 쓸 입력 이름
 */
export function requireFiniteX(point: XYInput, label: string): number {
  return requireFinite(readX(point), `${label} x`);
}

/**
 * XYInput의 y를 읽어 finite인지 검증하고 반환한다. non-finite면 RangeError다.
 *
 * @param point y를 읽을 structural point
 * @param label 실패 메시지에 쓸 입력 이름
 */
export function requireFiniteY(point: XYInput, label: string): number {
  return requireFinite(readY(point), `${label} y`);
}

/**
 * point 목록의 모든 x/y 좌표가 finite인지 검증한다. non-finite면 RangeError다.
 *
 * polygon vertex처럼 가변 길이 좌표 묶음의 finite 정책을 강제한다. 실패 메시지는 index를 포함한다.
 * 빈 목록은 검증할 좌표가 없으므로 통과한다.
 *
 * @param points 검증할 point 목록
 * @param label 실패 메시지에 쓸 입력 이름
 */
export function requireFinitePoints(points: readonly XYInput[], label: string): void {
  for (let i = 0; i < points.length; i += 1) {
    requireFinite(readX(points[i]), `${label}[${i}] x`);
    requireFinite(readY(points[i]), `${label}[${i}] y`);
  }
}
