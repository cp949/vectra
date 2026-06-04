import { describe, expect, test } from 'vitest';
import { isValidPathData } from '../../../src/svg-path/is-valid-path-data';

// ──────────────────────────────────────────────
// isValidPathData
// strict grammar 기반 validation-only boolean helper.
// parse 결과를 caller에 노출하지 않으므로 out 매개변수가 없다.
// ──────────────────────────────────────────────
describe('isValidPathData', () => {
  describe('valid path data', () => {
    test('빈 문자열은 true이다 (parsePathDataInto와 동일 정책)', () => {
      expect(isValidPathData('')).toBe(true);
    });

    test('M L 절대 경로는 true이다', () => {
      expect(isValidPathData('M 0 0 L 10 10')).toBe(true);
    });

    test('A command가 valid flag와 함께 있으면 true이다', () => {
      expect(isValidPathData('M 0 0 A 10 10 0 1 0 20 20')).toBe(true);
    });

    test('상대 명령어 m l을 포함해도 true이다', () => {
      expect(isValidPathData('M 0 0 l 10 0 l 0 10 z')).toBe(true);
    });

    test('multi-subpath도 true이다', () => {
      expect(isValidPathData('M 0 0 L 10 0 Z M 20 20 L 30 20')).toBe(true);
    });
  });

  describe('invalid path data', () => {
    test('large-arc-flag가 0/1이 아니면 false이다', () => {
      expect(isValidPathData('M 0 0 A 10 10 0 2 0 20 20')).toBe(false);
    });

    test('sweep-flag가 0/1이 아니면 false이다', () => {
      expect(isValidPathData('M 0 0 A 10 10 0 1 2 20 20')).toBe(false);
    });

    test('unknown command letter가 있으면 false이다', () => {
      expect(isValidPathData('M 0 0 X 10 10')).toBe(false);
    });

    test('M에 좌표가 부족하면 false이다', () => {
      expect(isValidPathData('M 0')).toBe(false);
    });

    test('M 없이 L로 시작하면 false이다', () => {
      expect(isValidPathData('L 10 20')).toBe(false);
    });

    test('1e309처럼 Infinity로 평가되는 숫자가 있으면 false이다', () => {
      expect(isValidPathData('M 0 0 L 1e309 0')).toBe(false);
    });

    test('-1e309처럼 -Infinity로 평가되는 숫자가 있으면 false이다', () => {
      expect(isValidPathData('M -1e309 0')).toBe(false);
    });
  });
});
