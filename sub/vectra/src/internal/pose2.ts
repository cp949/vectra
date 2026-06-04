import type { Pose2Like, Pose2Tuple, Pose2Writable, XYInput, XYWritable } from '../types';
import { writeXY } from './xy';

/** input이 tuple pose이면 true를 반환한다. */
function isPose2Tuple(pose: Pose2Like): pose is Pose2Tuple {
  return Array.isArray(pose);
}

/**
 * Pose2Like input에서 translation 위치를 읽는다.
 *
 * tuple input은 index 0을, object input은 position field를 읽는다.
 *
 * @param pose translation 위치를 읽을 structural pose
 */
export function readPosePosition(pose: Pose2Like): XYInput {
  return isPose2Tuple(pose) ? pose[0] : pose.position;
}

/**
 * Pose2Like input에서 angle을 읽는다. 단위는 radian.
 *
 * tuple input은 index 1을, object input은 angle field를 읽는다.
 *
 * @param pose angle을 읽을 structural pose
 */
export function readPoseAngle(pose: Pose2Like): number {
  return isPose2Tuple(pose) ? pose[1] : pose.angle;
}

/**
 * pose translation 두 성분과 angle이 finite인지 검증한다.
 *
 * `x`, `y`, `angle` 중 하나라도 non-finite(`NaN`, `Infinity`, `-Infinity`)이면 `RangeError`다.
 * 모든 public pose builder/transform이 같은 실패 정책을 공유하도록 이 helper를 통해 검증한다.
 *
 * @param x 검증할 translation x 성분
 * @param y 검증할 translation y 성분
 * @param angle 검증할 회전각. 단위는 radian.
 */
export function validatePoseFinite(x: number, y: number, angle: number): void {
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(angle)) {
    throw new RangeError(
      `pose translation and angle must be finite numbers, got translation (${String(x)}, ${String(y)}), angle ${String(angle)}`
    );
  }
}

/**
 * pose helper의 non-negative scalar option(epsilon, weight 등)이 finite이고 `>= 0`인지 검증한다.
 *
 * `value`가 non-finite(`NaN`, `Infinity`, `-Infinity`)이거나 음수이면 `RangeError`다.
 * rigid 판정 epsilon, approximate equality epsilon, distance weight처럼 non-negative finite를
 * 요구하는 pose option이 같은 실패 정책을 공유하도록 이 helper를 통해 검증한다.
 *
 * @param value 검증할 option 값
 * @param name 에러 메시지에 표시할 option 이름
 */
export function validatePoseEpsilon(value: number, name: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be a finite number >= 0, got ${String(value)}`);
  }
}

/**
 * 두 angle 사이 shortest angular difference의 absolute value를 반환한다. 단위는 radian.
 *
 * `atan2(sin(Δ), cos(Δ))`로 `Δ = a - b`를 `(-π, π]` 범위로 접은 뒤 absolute value를 취한다.
 * `2π` wrap-around에서도 안정적으로 `[0, π]` 결과를 낸다. 입력 angle을 normalize하지 않는다.
 * caller가 finite 검증을 먼저 끝낸다고 가정한다.
 *
 * @param a 첫 angle. 단위는 radian.
 * @param b 둘째 angle. 단위는 radian.
 */
export function shortestAngleDifferenceAbs(a: number, b: number): number {
  const delta = a - b;
  return Math.abs(Math.atan2(Math.sin(delta), Math.cos(delta)));
}

/**
 * transform 대상 point/vector 두 성분이 finite인지 검증한다.
 *
 * `x` 또는 `y`가 non-finite(`NaN`, `Infinity`, `-Infinity`)이면 `RangeError`다. pose transform이
 * pose 검증과 같은 실패 정책을 operand에도 적용하도록 이 helper를 통해 검증한다.
 *
 * @param x 검증할 operand x 성분
 * @param y 검증할 operand y 성분
 */
export function validatePoseOperandFinite(x: number, y: number): void {
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    throw new RangeError(`pose transform operand must have finite components, got (${String(x)}, ${String(y)})`);
  }
}

/**
 * 두 rigid pose 성분을 `left * right`로 합성해 out에 기록하고 out을 반환한다.
 *
 * `right`를 먼저 적용하고 `left`를 나중에 적용한다. 산식은
 * `angle = la + ra`, `position = left.position + R(la) * right.position`이다.
 * 모든 입력을 number 성분으로 받으므로 `out.position`이 `left`나 `right` position과 같은
 * storage여도 안전하다. caller가 finite 검증을 먼저 끝낸다고 가정한다.
 *
 * @param out 합성 결과를 기록할 writable pose output
 * @param lx left pose translation x 성분
 * @param ly left pose translation y 성분
 * @param la left pose 회전각. 단위는 radian.
 * @param rx right pose translation x 성분
 * @param ry right pose translation y 성분
 * @param ra right pose 회전각. 단위는 radian.
 */
export function writeComposedPose<Out extends Pose2Writable<XYWritable>>(
  out: Out,
  lx: number,
  ly: number,
  la: number,
  rx: number,
  ry: number,
  ra: number
): Out {
  const cos = Math.cos(la);
  const sin = Math.sin(la);
  writeXY(out.position, lx + cos * rx - sin * ry, ly + sin * rx + cos * ry);
  out.angle = la + ra;
  return out;
}

/**
 * rigid pose 성분의 inverse를 out에 기록하고 out을 반환한다.
 *
 * 산식은 `angle = -angle`, `position = R(-angle) * (-position)`이다. 모든 입력을 number
 * 성분으로 받으므로 `out.position`이 입력 pose position과 같은 storage여도 안전하다.
 * caller가 finite 검증을 먼저 끝낸다고 가정한다.
 *
 * @param out inverse 결과를 기록할 writable pose output
 * @param px inverse 대상 pose translation x 성분
 * @param py inverse 대상 pose translation y 성분
 * @param angle inverse 대상 pose 회전각. 단위는 radian.
 */
export function writeInvertedPose<Out extends Pose2Writable<XYWritable>>(
  out: Out,
  px: number,
  py: number,
  angle: number
): Out {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  writeXY(out.position, -(cos * px + sin * py), sin * px - cos * py);
  out.angle = -angle;
  return out;
}
