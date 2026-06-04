/** 코드 변경 후 자동 실행까지 기다리는 시간 */
export const AUTO_RUN_DEBOUNCE_MS = 500;

/** 자동 실행 계산 입력 */
interface AutoRunScheduleInput {
  /** 마지막 실행 이후 코드가 변경되었는지 여부 */
  readonly codeChanged: boolean;
  /** 예제 선택/Reset 등 명시적 실행 직후 변경인지 여부 */
  readonly suppressed: boolean;
}

/** 코드 변경에 대해 자동 실행을 예약할지 판단한다 */
export function shouldScheduleAutoRun(input: AutoRunScheduleInput): boolean {
  return input.codeChanged && !input.suppressed;
}
