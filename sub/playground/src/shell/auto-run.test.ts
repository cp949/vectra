import { describe, expect, it } from 'vitest';
import { AUTO_RUN_DEBOUNCE_MS, shouldScheduleAutoRun } from './auto-run';

describe('auto-run policy', () => {
  it('자동 실행은 demo 앱과 같은 debounce 지연 뒤에 실행된다', () => {
    expect(AUTO_RUN_DEBOUNCE_MS).toBe(500);
  });

  it('억제되지 않은 코드 변경만 예약한다', () => {
    expect(shouldScheduleAutoRun({ codeChanged: true, suppressed: false })).toBe(true);
    expect(shouldScheduleAutoRun({ codeChanged: false, suppressed: false })).toBe(false);
    expect(shouldScheduleAutoRun({ codeChanged: true, suppressed: true })).toBe(false);
  });
});
