/**
 * oriented-rect의 size 두 성분과 angle이 finite인지 검증한다.
 *
 * `width`, `height`, `angle` 중 하나라도 non-finite(`NaN`, `Infinity`, `-Infinity`)이면
 * `RangeError`다. `width <= 0` 또는 `height <= 0`은 empty 판정에 쓰이므로 throw하지 않는다.
 * center 좌표는 검증하지 않고 산술 결과로 pass-through한다. 모든 public oriented-rect query가
 * 같은 실패 정책을 공유하도록 이 helper를 통해 size/angle을 검증한다.
 *
 * @param width 검증할 size width 성분
 * @param height 검증할 size height 성분
 * @param angle 검증할 회전각. 단위는 radian.
 */
export function validateOrientedRectSizeAndAngle(width: number, height: number, angle: number): void {
  if (!Number.isFinite(width) || !Number.isFinite(height) || !Number.isFinite(angle)) {
    throw new RangeError(
      `oriented rect size and angle must be finite numbers, got size (${String(width)}, ${String(height)}), angle ${String(angle)}`
    );
  }
}
