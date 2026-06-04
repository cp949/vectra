/**
 * pathDataToCompactString unit test.
 *
 * compact 직렬화 형식(letter-number 붙임, 반복 가능한 command letter 생략, 내부 공백),
 * non-finite pass-through, round-trip, mutation 금지, 결정론을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { parsePathDataInto } from '../../../src/svg-path/parse-path-data-into';
import { pathDataToCompactString } from '../../../src/svg-path/path-data-to-compact-string';
import type { PathCommand } from '../../../src/types/index';

// ──────────────────────────────────────────────
// pathDataToCompactString
// canonical absolute PathCommand[] → compact (no space between letter and first number) SVG path data.
// command 사이 공백 없음. 내부 숫자 사이는 단일 공백. 반복 가능한 command letter는 생략.
// ──────────────────────────────────────────────
describe('pathDataToCompactString', () => {
  describe('기본 출력', () => {
    test('빈 배열은 빈 문자열을 반환한다', () => {
      expect(pathDataToCompactString([])).toBe('');
    });
  });

  describe('command별 compact 형식', () => {
    test('move는 "M10 20" 형식이다', () => {
      const commands: PathCommand[] = [{ kind: 'move', x: 10, y: 20 }];
      expect(pathDataToCompactString(commands)).toBe('M10 20');
    });

    test('line은 "L30 40" 형식이다', () => {
      const commands: PathCommand[] = [{ kind: 'line', x: 30, y: 40 }];
      expect(pathDataToCompactString(commands)).toBe('L30 40');
    });

    test('quadratic은 "Q5 10 15 0" 형식이다', () => {
      const commands: PathCommand[] = [{ kind: 'quadratic', x1: 5, y1: 10, x: 15, y: 0 }];
      expect(pathDataToCompactString(commands)).toBe('Q5 10 15 0');
    });

    test('cubic은 "C1 2 3 4 5 6" 형식이다', () => {
      const commands: PathCommand[] = [{ kind: 'cubic', x1: 1, y1: 2, x2: 3, y2: 4, x: 5, y: 6 }];
      expect(pathDataToCompactString(commands)).toBe('C1 2 3 4 5 6');
    });

    test('arc는 "A10 20 45 0 1 50 60" 형식이다 (xRotation radian → degree)', () => {
      // xRotation = 45 * Math.PI / 180 → 45도
      const commands: PathCommand[] = [
        {
          kind: 'arc',
          rx: 10,
          ry: 20,
          xRotation: 45 * (Math.PI / 180),
          largeArc: false,
          sweep: true,
          x: 50,
          y: 60,
        },
      ];
      expect(pathDataToCompactString(commands)).toBe('A10 20 45 0 1 50 60');
    });

    test('close는 "Z"이다', () => {
      const commands: PathCommand[] = [{ kind: 'close' }];
      expect(pathDataToCompactString(commands)).toBe('Z');
    });
  });

  describe('multi-command join', () => {
    test('M L Z M L은 공백 없이 letter로 구분된다', () => {
      const commands: PathCommand[] = [
        { kind: 'move', x: 0, y: 0 },
        { kind: 'line', x: 10, y: 0 },
        { kind: 'close' },
        { kind: 'move', x: 20, y: 20 },
        { kind: 'line', x: 30, y: 20 },
      ];
      expect(pathDataToCompactString(commands)).toBe('M0 0L10 0ZM20 20L30 20');
    });

    test('음수 부호가 있는 숫자도 내부 공백을 유지한다', () => {
      const commands: PathCommand[] = [
        { kind: 'move', x: 0, y: 0 },
        { kind: 'line', x: 10, y: 0 },
        { kind: 'line', x: -5, y: 0 },
      ];
      expect(pathDataToCompactString(commands)).toBe('M0 0L10 0 -5 0');
    });

    test('소수점으로 시작하는 숫자도 내부 공백을 유지한다', () => {
      const commands: PathCommand[] = [
        { kind: 'move', x: 0, y: 0 },
        { kind: 'line', x: 0.5, y: 0 },
        { kind: 'line', x: 1.5, y: 0.25 },
      ];
      expect(pathDataToCompactString(commands)).toBe('M0 0L.5 0 1.5 .25');
    });

    test('같은 L letter가 연속되면 두 번째 command부터 letter를 생략한다', () => {
      const commands: PathCommand[] = [
        { kind: 'line', x: 10, y: 0 },
        { kind: 'line', x: 20, y: 0 },
        { kind: 'line', x: 30, y: 0 },
      ];
      expect(pathDataToCompactString(commands)).toBe('L10 0 20 0 30 0');
    });

    test('같은 Q/C/A letter가 연속되면 두 번째 command부터 letter를 생략한다', () => {
      const commands: PathCommand[] = [
        { kind: 'quadratic', x1: 5, y1: 10, x: 15, y: 0 },
        { kind: 'quadratic', x1: 6, y1: 11, x: 16, y: 1 },
        { kind: 'cubic', x1: 1, y1: 2, x2: 3, y2: 4, x: 5, y: 6 },
        { kind: 'cubic', x1: 7, y1: 8, x2: 9, y2: 10, x: 11, y: 12 },
        { kind: 'arc', rx: 10, ry: 20, xRotation: 0, largeArc: false, sweep: true, x: 50, y: 60 },
        { kind: 'arc', rx: 11, ry: 21, xRotation: 0, largeArc: true, sweep: false, x: 51, y: 61 },
      ];
      expect(pathDataToCompactString(commands)).toBe(
        'Q5 10 15 0 6 11 16 1C1 2 3 4 5 6 7 8 9 10 11 12A10 20 0 0 1 50 60 11 21 0 1 0 51 61'
      );
    });

    test('M은 연속되어도 생략하지 않는다', () => {
      const commands: PathCommand[] = [
        { kind: 'move', x: 0, y: 0 },
        { kind: 'move', x: 10, y: 10 },
      ];
      expect(pathDataToCompactString(commands)).toBe('M0 0M10 10');
    });

    test('Z는 payload가 없으므로 연속되어도 생략하지 않는다', () => {
      const commands: PathCommand[] = [{ kind: 'close' }, { kind: 'close' }];
      expect(pathDataToCompactString(commands)).toBe('ZZ');
    });
  });

  describe('precision option', () => {
    test('precision=2에서 trailing zero는 제거된다', () => {
      const commands: PathCommand[] = [{ kind: 'move', x: 1.5, y: 0 }];
      // 1.50 → "1.5"
      expect(pathDataToCompactString(commands, { precision: 2 })).toBe('M1.5 0');
    });

    test('precision=2가 모든 숫자에 적용된다', () => {
      const commands: PathCommand[] = [
        { kind: 'move', x: 1.2345, y: 2.3456 },
        { kind: 'line', x: 3.5678, y: 4.6789 },
      ];
      expect(pathDataToCompactString(commands, { precision: 2 })).toBe('M1.23 2.35L3.57 4.68');
    });

    test('invalid precision은 fallback으로 String() 변환을 사용한다', () => {
      const commands: PathCommand[] = [{ kind: 'move', x: 1.5, y: 2 }];
      // precision이 정수가 아니면 formatNumber가 String()으로 fallback
      expect(pathDataToCompactString(commands, { precision: 1.5 as unknown as number })).toBe('M1.5 2');
    });
  });

  describe('non-finite field', () => {
    test('move: NaN field는 빈 문자열로 출력한다', () => {
      const commands: PathCommand[] = [{ kind: 'move', x: Number.NaN, y: 20 }];
      expect(pathDataToCompactString(commands)).toBe('M 20');
    });

    test('move: +Infinity field는 빈 문자열로 출력한다', () => {
      const commands: PathCommand[] = [{ kind: 'move', x: 10, y: Number.POSITIVE_INFINITY }];
      expect(pathDataToCompactString(commands)).toBe('M10 ');
    });

    test('move: -Infinity field도 빈 문자열로 출력한다', () => {
      const commands: PathCommand[] = [{ kind: 'move', x: Number.NEGATIVE_INFINITY, y: 10 }];
      expect(pathDataToCompactString(commands)).toBe('M 10');
    });

    test('arc: rx=NaN은 빈 문자열로 출력한다', () => {
      const commands: PathCommand[] = [
        { kind: 'arc', rx: Number.NaN, ry: 20, xRotation: 0, largeArc: false, sweep: true, x: 50, y: 60 },
      ];
      expect(pathDataToCompactString(commands)).toBe('A 20 0 0 1 50 60');
    });

    test('arc: rx=Infinity는 빈 문자열로 출력한다', () => {
      const commands: PathCommand[] = [
        { kind: 'arc', rx: Number.POSITIVE_INFINITY, ry: 20, xRotation: 0, largeArc: false, sweep: true, x: 50, y: 60 },
      ];
      expect(pathDataToCompactString(commands)).toBe('A 20 0 0 1 50 60');
    });

    test('arc: ry=NaN은 빈 문자열로 출력한다', () => {
      const commands: PathCommand[] = [
        { kind: 'arc', rx: 10, ry: Number.NaN, xRotation: 0, largeArc: false, sweep: true, x: 50, y: 60 },
      ];
      expect(pathDataToCompactString(commands)).toBe('A10  0 0 1 50 60');
    });

    test('arc: xRotation=NaN은 빈 문자열로 출력한다', () => {
      const commands: PathCommand[] = [
        { kind: 'arc', rx: 10, ry: 20, xRotation: Number.NaN, largeArc: false, sweep: true, x: 50, y: 60 },
      ];
      expect(pathDataToCompactString(commands)).toBe('A10 20  0 1 50 60');
    });
  });

  describe('round-trip', () => {
    test('M L Z 경로 round-trip은 원본 command와 동일하다', () => {
      const original: PathCommand[] = [{ kind: 'move', x: 0, y: 0 }, { kind: 'line', x: 10, y: 0 }, { kind: 'close' }];
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, pathDataToCompactString(original))).toBe(true);
      expect(out).toEqual(original);
    });

    test('multi-subpath round-trip은 원본 command와 동일하다', () => {
      const original: PathCommand[] = [
        { kind: 'move', x: 10, y: 20 },
        { kind: 'line', x: 30, y: 40 },
        { kind: 'close' },
        { kind: 'move', x: 100, y: 100 },
        { kind: 'line', x: 110, y: 100 },
      ];
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, pathDataToCompactString(original))).toBe(true);
      expect(out).toEqual(original);
    });

    test('quadratic/cubic round-trip은 원본과 동일하다', () => {
      const original: PathCommand[] = [
        { kind: 'move', x: 5, y: 5 },
        { kind: 'quadratic', x1: 10, y1: 0, x: 15, y: 5 },
        { kind: 'cubic', x1: 16, y1: 6, x2: 18, y2: 8, x: 20, y: 10 },
      ];
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, pathDataToCompactString(original))).toBe(true);
      expect(out).toEqual(original);
    });

    test('arc xRotation=0 round-trip은 원본과 정확히 동일하다', () => {
      // xRotation 0은 radian→degree→radian 변환 없이 정확히 round-trip된다
      const original: PathCommand[] = [
        { kind: 'move', x: 5, y: 5 },
        { kind: 'arc', rx: 10, ry: 20, xRotation: 0, largeArc: false, sweep: true, x: 25, y: 5 },
      ];
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, pathDataToCompactString(original))).toBe(true);
      expect(out).toEqual(original);
    });

    test('arc xRotation이 degree 정수에서 환산한 값이면 round-trip된다', () => {
      // 45 * Math.PI / 180 → degree 45 → radian 변환 후 원본과 일치
      const original: PathCommand[] = [
        { kind: 'move', x: 0, y: 0 },
        {
          kind: 'arc',
          rx: 10,
          ry: 20,
          xRotation: 45 * (Math.PI / 180),
          largeArc: false,
          sweep: true,
          x: 50,
          y: 60,
        },
      ];
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, pathDataToCompactString(original))).toBe(true);
      expect(out).toEqual(original);
    });
  });

  describe('mutation 금지', () => {
    test('입력 commands 배열을 mutate하지 않는다', () => {
      const commands: PathCommand[] = [
        { kind: 'move', x: 10, y: 20 },
        { kind: 'line', x: 30, y: 40 },
      ];
      const snapshot = JSON.parse(JSON.stringify(commands));
      pathDataToCompactString(commands);
      expect(commands).toEqual(snapshot);
    });

    test('입력 command object를 mutate하지 않는다', () => {
      const cmd: PathCommand = {
        kind: 'arc',
        rx: 10,
        ry: 20,
        xRotation: 0,
        largeArc: false,
        sweep: true,
        x: 50,
        y: 60,
      };
      const snapshot = { ...cmd };
      pathDataToCompactString([cmd]);
      expect(cmd).toEqual(snapshot);
    });
  });

  describe('결정론', () => {
    test('같은 commands를 두 번 직렬화한 결과가 동일하다', () => {
      const commands: PathCommand[] = [
        { kind: 'move', x: 10, y: 20 },
        { kind: 'line', x: 30, y: 40 },
        { kind: 'arc', rx: 5, ry: 5, xRotation: 0, largeArc: false, sweep: true, x: 50, y: 50 },
        { kind: 'close' },
      ];
      const result1 = pathDataToCompactString(commands);
      const result2 = pathDataToCompactString(commands);
      expect(result1 === result2).toBe(true);
    });
  });
});
