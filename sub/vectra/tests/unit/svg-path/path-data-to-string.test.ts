/**
 * SVG path command serializer를 검증하는 테스트.
 * command별 출력, number formatting, invalid field fallback, parser round-trip 제약을 다룬다.
 */
import { describe, expect, test } from 'vitest';
import { parsePathDataInto } from '../../../src/svg-path/parse-path-data-into';
import { pathDataToString } from '../../../src/svg-path/path-data-to-string';
import type { PathCommand } from '../../../src/types/index';

// ──────────────────────────────────────────────
// pathDataToString
// ──────────────────────────────────────────────
describe('pathDataToString', () => {
  // ──────────────────────────────────────────────
  // 기본 출력
  // ──────────────────────────────────────────────
  describe('기본 출력 — 빈 입력', () => {
    test('빈 배열은 빈 문자열을 반환한다', () => {
      expect(pathDataToString([])).toBe('');
    });
  });

  describe('단일 command 출력', () => {
    test('M command는 "M x y" 형식으로 출력한다', () => {
      const commands: PathCommand[] = [{ kind: 'move', x: 10, y: 20 }];
      expect(pathDataToString(commands)).toBe('M 10 20');
    });

    test('L command는 "L x y" 형식으로 출력한다', () => {
      const commands: PathCommand[] = [{ kind: 'line', x: 30, y: 40 }];
      expect(pathDataToString(commands)).toBe('L 30 40');
    });

    test('Q command는 "Q x1 y1 x y" 형식으로 출력한다', () => {
      const commands: PathCommand[] = [{ kind: 'quadratic', x1: 5, y1: 10, x: 15, y: 0 }];
      expect(pathDataToString(commands)).toBe('Q 5 10 15 0');
    });

    test('C command는 "C x1 y1 x2 y2 x y" 형식으로 출력한다', () => {
      const commands: PathCommand[] = [{ kind: 'cubic', x1: 1, y1: 2, x2: 3, y2: 4, x: 5, y: 6 }];
      expect(pathDataToString(commands)).toBe('C 1 2 3 4 5 6');
    });

    test('A command는 xRotation radian을 degree로 변환하여 출력한다', () => {
      // xRotation = Math.PI / 4 (45도) → degree 출력은 45
      const xRot = Math.PI / 4;
      const commands: PathCommand[] = [
        { kind: 'arc', rx: 10, ry: 20, xRotation: xRot, largeArc: false, sweep: true, x: 50, y: 60 },
      ];
      expect(pathDataToString(commands)).toBe('A 10 20 45 0 1 50 60');
    });

    test('Z command는 "Z"를 출력한다', () => {
      const commands: PathCommand[] = [{ kind: 'close' }];
      expect(pathDataToString(commands)).toBe('Z');
    });
  });

  describe('arc flag 출력', () => {
    test('largeArc true → "1", false → "0"으로 출력한다', () => {
      const commands: PathCommand[] = [
        { kind: 'arc', rx: 5, ry: 5, xRotation: 0, largeArc: true, sweep: false, x: 10, y: 0 },
      ];
      expect(pathDataToString(commands)).toBe('A 5 5 0 1 0 10 0');
    });

    test('sweep true → "1", false → "0"으로 출력한다', () => {
      const commands: PathCommand[] = [
        { kind: 'arc', rx: 5, ry: 5, xRotation: 0, largeArc: false, sweep: true, x: 10, y: 0 },
      ];
      expect(pathDataToString(commands)).toBe('A 5 5 0 0 1 10 0');
    });
  });

  describe('다중 command 출력', () => {
    test('M L Z M L 형태의 multi-subpath를 space로 join하여 출력한다', () => {
      const commands: PathCommand[] = [
        { kind: 'move', x: 0, y: 0 },
        { kind: 'line', x: 10, y: 0 },
        { kind: 'close' },
        { kind: 'move', x: 20, y: 20 },
        { kind: 'line', x: 30, y: 20 },
      ];
      expect(pathDataToString(commands)).toBe('M 0 0 L 10 0 Z M 20 20 L 30 20');
    });
  });

  // ──────────────────────────────────────────────
  // Number formatting — precision 없음
  // ──────────────────────────────────────────────
  describe('기본 number formatting — precision 없음', () => {
    test('정수는 그대로 출력한다', () => {
      const commands: PathCommand[] = [{ kind: 'move', x: 10, y: 20 }];
      expect(pathDataToString(commands)).toBe('M 10 20');
    });

    test('소수는 String() 기반으로 출력한다', () => {
      const commands: PathCommand[] = [{ kind: 'move', x: 1.5, y: 2.75 }];
      expect(pathDataToString(commands)).toBe('M 1.5 2.75');
    });
  });

  // ──────────────────────────────────────────────
  // Number formatting — valid precision
  // ──────────────────────────────────────────────
  describe('valid precision formatting', () => {
    test('precision 지정 시 반올림이 적용된다', () => {
      const commands: PathCommand[] = [{ kind: 'move', x: 1.256, y: 2.444 }];
      // precision=2: 1.256→"1.26"(반올림), 2.444→"2.44"(내림)
      expect(pathDataToString(commands, { precision: 2 })).toBe('M 1.26 2.44');
    });

    test('precision으로 trailing zero를 제거한다', () => {
      const commands: PathCommand[] = [{ kind: 'move', x: 1.5, y: 3.0 }];
      // precision=3: 1.500→"1.5", 3.000→"3"
      expect(pathDataToString(commands, { precision: 3 })).toBe('M 1.5 3');
    });

    test('precision으로 trailing decimal point를 제거한다', () => {
      const commands: PathCommand[] = [{ kind: 'move', x: 2.0, y: 4.0 }];
      // precision=2: 2.00→"2", 4.00→"4"
      expect(pathDataToString(commands, { precision: 2 })).toBe('M 2 4');
    });
  });

  // ──────────────────────────────────────────────
  // Number formatting — invalid precision fallback
  // ──────────────────────────────────────────────
  describe('invalid precision fallback — String() 기반 사용', () => {
    test('음수 precision은 String() 기반으로 출력한다', () => {
      const commands: PathCommand[] = [{ kind: 'move', x: 1.5, y: 2.75 }];
      expect(pathDataToString(commands, { precision: -1 })).toBe('M 1.5 2.75');
    });

    test('소수 precision은 String() 기반으로 출력한다', () => {
      const commands: PathCommand[] = [{ kind: 'move', x: 1.5, y: 2.75 }];
      expect(pathDataToString(commands, { precision: 1.5 })).toBe('M 1.5 2.75');
    });

    test('NaN precision은 String() 기반으로 출력한다', () => {
      const commands: PathCommand[] = [{ kind: 'move', x: 1.5, y: 2.75 }];
      expect(pathDataToString(commands, { precision: Number.NaN })).toBe('M 1.5 2.75');
    });
  });

  // ──────────────────────────────────────────────
  // Invalid number field 처리
  // ──────────────────────────────────────────────
  describe('invalid number field 처리', () => {
    test('NaN field는 빈 문자열로 출력한다', () => {
      const commands: PathCommand[] = [{ kind: 'move', x: Number.NaN, y: 20 }];
      expect(pathDataToString(commands)).toBe('M  20');
    });

    test('Infinity field는 빈 문자열로 출력한다', () => {
      const commands: PathCommand[] = [{ kind: 'move', x: 10, y: Number.POSITIVE_INFINITY }];
      expect(pathDataToString(commands)).toBe('M 10 ');
    });
  });

  // ──────────────────────────────────────────────
  // parser→serializer→parser round-trip
  // ──────────────────────────────────────────────
  describe('round-trip — parsePathDataInto → pathDataToString → parsePathDataInto', () => {
    test('M L Z 경로를 round-trip해도 command 내용이 동일하다', () => {
      const original = 'M 0 0 L 10 20 Z';
      const out1: PathCommand[] = [];
      expect(parsePathDataInto(out1, original)).toBe(true);

      const serialized = pathDataToString(out1);

      const out2: PathCommand[] = [];
      expect(parsePathDataInto(out2, serialized)).toBe(true);
      expect(out2).toEqual(out1);
    });

    test('arc command를 포함한 경로를 round-trip해도 command 내용이 동일하다', () => {
      // xRotation 0도 arc: degree→radian→serialize→degree 변환 일관성 확인
      const original = 'M 0 0 A 10 20 0 0 1 30 40';
      const out1: PathCommand[] = [];
      expect(parsePathDataInto(out1, original)).toBe(true);

      const serialized = pathDataToString(out1);

      const out2: PathCommand[] = [];
      expect(parsePathDataInto(out2, serialized)).toBe(true);
      expect(out2).toEqual(out1);
    });

    test('multi-subpath를 round-trip해도 command 내용이 동일하다', () => {
      const original = 'M 0 0 L 10 0 Z M 20 20 Q 25 10 30 20 Z';
      const out1: PathCommand[] = [];
      expect(parsePathDataInto(out1, original)).toBe(true);

      const serialized = pathDataToString(out1);

      const out2: PathCommand[] = [];
      expect(parsePathDataInto(out2, serialized)).toBe(true);
      expect(out2).toEqual(out1);
    });
  });

  // ──────────────────────────────────────────────
  // 출력 제약 — H/V/S/T 미포함
  // ──────────────────────────────────────────────
  describe('출력 제약 — H/V/S/T 미포함', () => {
    test('출력 문자열에 H, V, S, T command가 포함되지 않는다', () => {
      const commands: PathCommand[] = [
        { kind: 'move', x: 0, y: 0 },
        { kind: 'line', x: 10, y: 0 },
        { kind: 'line', x: 10, y: 10 },
        { kind: 'quadratic', x1: 5, y1: 5, x: 15, y: 15 },
        { kind: 'cubic', x1: 1, y1: 2, x2: 3, y2: 4, x: 20, y: 20 },
        { kind: 'arc', rx: 5, ry: 5, xRotation: 0, largeArc: false, sweep: false, x: 30, y: 30 },
        { kind: 'close' },
      ];
      const result = pathDataToString(commands);
      expect(result).not.toMatch(/\bH\b/);
      expect(result).not.toMatch(/\bV\b/);
      expect(result).not.toMatch(/\bS\b/);
      expect(result).not.toMatch(/\bT\b/);
    });
  });
});
