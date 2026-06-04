import { describe, expect, test } from 'vitest';
import { optimizePathDataString } from '../../../src/svg-path/optimize-path-data-string';
import type { PathCommand } from '../../../src/types/index';

describe('optimizePathDataString', () => {
  describe('기본 출력 — 빈 입력', () => {
    test('빈 배열은 빈 문자열을 반환한다', () => {
      expect(optimizePathDataString([])).toBe('');
    });
  });

  describe('precision 옵션 — 소수점 축소', () => {
    test('precision=2 적용 시 소수점 자릿수를 제한한다', () => {
      const commands: PathCommand[] = [{ kind: 'move', x: 1.256, y: 2.444 }];
      // precision=2: 1.256→"1.26"(반올림), 2.444→"2.44"(내림)
      expect(optimizePathDataString(commands, { precision: 2 })).toBe('M 1.26 2.44');
    });

    test('trailing zero를 제거한다 (1.500 → 1.5, 2.000 → 2)', () => {
      const commands: PathCommand[] = [{ kind: 'move', x: 1.5, y: 2.0 }];
      // precision=3: 1.500→"1.5", 2.000→"2"
      expect(optimizePathDataString(commands, { precision: 3 })).toBe('M 1.5 2');
    });

    test('precision=0 은 정수 출력을 반환한다', () => {
      const commands: PathCommand[] = [{ kind: 'move', x: 3.7, y: 1.2 }];
      // precision=0: 3.7→"4"(반올림), 1.2→"1"(내림)
      expect(optimizePathDataString(commands, { precision: 0 })).toBe('M 4 1');
    });
  });

  describe('command 수 불변', () => {
    test('input과 output의 command 수가 동일하다', () => {
      const commands: PathCommand[] = [
        { kind: 'move', x: 0, y: 0 },
        { kind: 'line', x: 10.123, y: 20.456 },
        { kind: 'quadratic', x1: 5.111, y1: 10.222, x: 15.333, y: 0.444 },
        { kind: 'close' },
      ];
      const result = optimizePathDataString(commands, { precision: 1 });
      // space로 분리 후 단일 command letter만 필터링 (M/L/Q/Z 각 1개씩)
      const commandLetters = result.split(' ').filter((t) => /^[MLQCAZ]$/.test(t));
      expect(commandLetters.length).toBe(4);
    });

    test('다중 subpath에서 command 수가 보존된다', () => {
      const commands: PathCommand[] = [
        { kind: 'move', x: 0, y: 0 },
        { kind: 'line', x: 10, y: 0 },
        { kind: 'close' },
        { kind: 'move', x: 20, y: 20 },
        { kind: 'line', x: 30, y: 20 },
      ];
      const result = optimizePathDataString(commands, { precision: 2 });
      expect(result).toBe('M 0 0 L 10 0 Z M 20 20 L 30 20');
    });
  });

  describe('options 미지정', () => {
    test('options 없이 호출하면 기본 포맷으로 출력한다', () => {
      const commands: PathCommand[] = [{ kind: 'move', x: 1.5, y: 2.75 }];
      expect(optimizePathDataString(commands)).toBe('M 1.5 2.75');
    });
  });
});
