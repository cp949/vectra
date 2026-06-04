import { describe, expect, it } from 'vitest';
import { AUTO_RUN_DEBOUNCE_MS, shouldScheduleAutoRun } from './auto-run';

describe('auto-run policy', () => {
  it('자동 실행은 기본 debounce 지연 뒤에 실행된다', () => {
    expect(AUTO_RUN_DEBOUNCE_MS).toBe(500);
  });

  it('자동 실행이 켜져 있고 억제되지 않은 변경만 예약한다', () => {
    expect(shouldScheduleAutoRun({ autoRunEnabled: true, suppressed: false })).toBe(true);
    expect(shouldScheduleAutoRun({ autoRunEnabled: false, suppressed: false })).toBe(false);
    expect(shouldScheduleAutoRun({ autoRunEnabled: true, suppressed: true })).toBe(false);
  });
});
