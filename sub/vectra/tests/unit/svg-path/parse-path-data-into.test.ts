/**
 * SVG path data parser를 검증하는 테스트.
 * 절대/상대 command, 반복 좌표, shorthand reset, invalid grammar, output mutation 정책을 다룬다.
 */
import { describe, expect, test } from 'vitest';
import { parsePathDataInto } from '../../../src/svg-path/parse-path-data-into';
import type { PathCommand } from '../../../src/types/index';

// ──────────────────────────────────────────────
// parsePathDataInto — 기본
// ──────────────────────────────────────────────
describe('parsePathDataInto', () => {
  describe('기본 — 빈 입력', () => {
    test('empty string은 빈 배열로 성공한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, '')).toBe(true);
      expect(out).toEqual([]);
    });

    test('whitespace-only string은 빈 배열로 성공한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, '   \t\n  ')).toBe(true);
      expect(out).toEqual([]);
    });
  });

  // ──────────────────────────────────────────────
  // 절대 명령어
  // ──────────────────────────────────────────────
  describe('절대 명령어 — M/L/Z', () => {
    test('M command는 MoveCommand를 생성한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'M 10 20')).toBe(true);
      expect(out).toEqual([{ kind: 'move', x: 10, y: 20 }]);
    });

    test('L command는 LineCommand를 생성한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'M 0 0 L 10 20')).toBe(true);
      expect(out).toEqual([
        { kind: 'move', x: 0, y: 0 },
        { kind: 'line', x: 10, y: 20 },
      ]);
    });

    test('Z command는 CloseCommand를 생성한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'M 0 0 L 10 0 Z')).toBe(true);
      expect(out).toEqual([{ kind: 'move', x: 0, y: 0 }, { kind: 'line', x: 10, y: 0 }, { kind: 'close' }]);
    });

    test('z command도 CloseCommand를 생성한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'M 0 0 L 10 0 z')).toBe(true);
      expect(out).toEqual([{ kind: 'move', x: 0, y: 0 }, { kind: 'line', x: 10, y: 0 }, { kind: 'close' }]);
    });
  });

  describe('절대 명령어 — H/V', () => {
    test('H command는 x만 이동하는 LineCommand를 생성한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'M 10 20 H 50')).toBe(true);
      expect(out).toEqual([
        { kind: 'move', x: 10, y: 20 },
        { kind: 'line', x: 50, y: 20 },
      ]);
    });

    test('V command는 y만 이동하는 LineCommand를 생성한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'M 10 20 V 80')).toBe(true);
      expect(out).toEqual([
        { kind: 'move', x: 10, y: 20 },
        { kind: 'line', x: 10, y: 80 },
      ]);
    });
  });

  describe('절대 명령어 — Q/T', () => {
    test('Q command는 QuadraticCommand를 생성한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'M 0 0 Q 5 10 10 0')).toBe(true);
      expect(out).toEqual([
        { kind: 'move', x: 0, y: 0 },
        { kind: 'quadratic', x1: 5, y1: 10, x: 10, y: 0 },
      ]);
    });

    test('T command는 이전 Q control을 반사한 QuadraticCommand를 생성한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'M 0 0 Q 5 10 10 0 T 20 0')).toBe(true);
      expect(out).toEqual([
        { kind: 'move', x: 0, y: 0 },
        { kind: 'quadratic', x1: 5, y1: 10, x: 10, y: 0 },
        // control point: (10 - (5 - 10), 0 - (10 - 0)) = (15, -10)
        { kind: 'quadratic', x1: 15, y1: -10, x: 20, y: 0 },
      ]);
    });

    test('T command는 이전이 Q/T가 아니면 current point를 control로 사용한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'M 10 20 T 30 40')).toBe(true);
      expect(out).toEqual([
        { kind: 'move', x: 10, y: 20 },
        // 이전이 Q/T가 아니므로 control = current point (10, 20)
        { kind: 'quadratic', x1: 10, y1: 20, x: 30, y: 40 },
      ]);
    });
  });

  describe('절대 명령어 — C/S', () => {
    test('C command는 CubicCommand를 생성한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'M 0 0 C 1 2 3 4 5 6')).toBe(true);
      expect(out).toEqual([
        { kind: 'move', x: 0, y: 0 },
        { kind: 'cubic', x1: 1, y1: 2, x2: 3, y2: 4, x: 5, y: 6 },
      ]);
    });

    test('S command는 이전 C second control을 반사한 CubicCommand를 생성한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'M 0 0 C 1 2 3 4 5 6 S 7 8 9 10')).toBe(true);
      expect(out).toEqual([
        { kind: 'move', x: 0, y: 0 },
        { kind: 'cubic', x1: 1, y1: 2, x2: 3, y2: 4, x: 5, y: 6 },
        // reflected: (5 - (3 - 5), 6 - (4 - 6)) = (7, 8)
        { kind: 'cubic', x1: 7, y1: 8, x2: 7, y2: 8, x: 9, y: 10 },
      ]);
    });

    test('S command는 이전이 C/S가 아니면 current point를 first control로 사용한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'M 5 6 S 7 8 9 10')).toBe(true);
      expect(out).toEqual([
        { kind: 'move', x: 5, y: 6 },
        // 이전이 C/S가 아니므로 x1=cx, y1=cy
        { kind: 'cubic', x1: 5, y1: 6, x2: 7, y2: 8, x: 9, y: 10 },
      ]);
    });
  });

  describe('절대 명령어 — A', () => {
    test('A command는 ArcCommand를 생성한다 (degree → radian 변환)', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'M 0 0 A 25 26 90 0 1 50 0')).toBe(true);
      expect(out).toEqual([
        { kind: 'move', x: 0, y: 0 },
        {
          kind: 'arc',
          rx: 25,
          ry: 26,
          xRotation: 90 * (Math.PI / 180),
          largeArc: false,
          sweep: true,
          x: 50,
          y: 0,
        },
      ]);
    });

    test('A command는 음수 rx/ry를 절대값으로 보정한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'M 0 0 A -25 -26 0 0 0 50 0')).toBe(true);
      expect(out).toEqual([
        { kind: 'move', x: 0, y: 0 },
        {
          kind: 'arc',
          rx: 25,
          ry: 26,
          xRotation: 0,
          largeArc: false,
          sweep: false,
          x: 50,
          y: 0,
        },
      ]);
    });

    test('A command에서 large-arc-flag=1은 largeArc:true이다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'M 0 0 A 25 26 0 1 0 50 0')).toBe(true);
      expect(out[1]).toMatchObject({ kind: 'arc', largeArc: true, sweep: false });
    });

    test('A command에서 zero rx는 LineCommand로 변환된다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'M 0 0 A 0 25 0 0 0 50 30')).toBe(true);
      expect(out).toEqual([
        { kind: 'move', x: 0, y: 0 },
        { kind: 'line', x: 50, y: 30 },
      ]);
    });

    test('A command에서 zero ry는 LineCommand로 변환된다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'M 0 0 A 25 0 0 0 0 50 30')).toBe(true);
      expect(out).toEqual([
        { kind: 'move', x: 0, y: 0 },
        { kind: 'line', x: 50, y: 30 },
      ]);
    });

    test('start == end인 arc는 command를 push하지 않는다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'M 10 20 A 25 26 0 0 0 10 20')).toBe(true);
      // same endpoint: no-op
      expect(out).toEqual([{ kind: 'move', x: 10, y: 20 }]);
    });
  });

  // ──────────────────────────────────────────────
  // 상대 명령어
  // ──────────────────────────────────────────────
  describe('상대 명령어', () => {
    test('m command는 current point에 더해 MoveCommand를 생성한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'M 10 20 m 5 -3')).toBe(true);
      expect(out).toEqual([
        { kind: 'move', x: 10, y: 20 },
        { kind: 'move', x: 15, y: 17 },
      ]);
    });

    test('l command는 상대 좌표를 절대 LineCommand로 변환한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'M 10 20 l 5 -3')).toBe(true);
      expect(out).toEqual([
        { kind: 'move', x: 10, y: 20 },
        { kind: 'line', x: 15, y: 17 },
      ]);
    });

    test('h command는 x만 상대 이동하는 LineCommand를 생성한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'M 10 20 h 15')).toBe(true);
      expect(out).toEqual([
        { kind: 'move', x: 10, y: 20 },
        { kind: 'line', x: 25, y: 20 },
      ]);
    });

    test('v command는 y만 상대 이동하는 LineCommand를 생성한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'M 10 20 v -5')).toBe(true);
      expect(out).toEqual([
        { kind: 'move', x: 10, y: 20 },
        { kind: 'line', x: 10, y: 15 },
      ]);
    });

    test('q command는 상대 좌표를 절대 QuadraticCommand로 변환한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'M 10 20 q 5 10 10 0')).toBe(true);
      expect(out).toEqual([
        { kind: 'move', x: 10, y: 20 },
        { kind: 'quadratic', x1: 15, y1: 30, x: 20, y: 20 },
      ]);
    });

    test('c command는 상대 좌표를 절대 CubicCommand로 변환한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'M 0 0 c 1 2 3 4 5 6')).toBe(true);
      expect(out).toEqual([
        { kind: 'move', x: 0, y: 0 },
        { kind: 'cubic', x1: 1, y1: 2, x2: 3, y2: 4, x: 5, y: 6 },
      ]);
    });

    test('s command는 상대 좌표를 절대 CubicCommand로 변환한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'M 0 0 C 1 2 3 4 5 6 s 2 2 4 4')).toBe(true);
      expect(out).toEqual([
        { kind: 'move', x: 0, y: 0 },
        { kind: 'cubic', x1: 1, y1: 2, x2: 3, y2: 4, x: 5, y: 6 },
        // reflected: (7, 8), endpoint: (9, 10)
        { kind: 'cubic', x1: 7, y1: 8, x2: 7, y2: 8, x: 9, y: 10 },
      ]);
    });

    test('t command는 상대 좌표를 절대 QuadraticCommand로 변환한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'M 0 0 Q 5 10 10 0 t 10 0')).toBe(true);
      expect(out).toEqual([
        { kind: 'move', x: 0, y: 0 },
        { kind: 'quadratic', x1: 5, y1: 10, x: 10, y: 0 },
        // reflected: (15, -10), endpoint: (20, 0)
        { kind: 'quadratic', x1: 15, y1: -10, x: 20, y: 0 },
      ]);
    });

    test('a command는 상대 endpoint를 절대 ArcCommand로 변환한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'M 10 20 a 5 5 0 0 1 10 10')).toBe(true);
      expect(out).toEqual([
        { kind: 'move', x: 10, y: 20 },
        {
          kind: 'arc',
          rx: 5,
          ry: 5,
          xRotation: 0,
          largeArc: false,
          sweep: true,
          x: 20,
          y: 30,
        },
      ]);
    });
  });

  // ──────────────────────────────────────────────
  // 반복 좌표 쌍 처리
  // ──────────────────────────────────────────────
  describe('반복 좌표 쌍 처리', () => {
    test('M 이후 반복 pair는 L로 해석된다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'M 0 0 10 20 30 40')).toBe(true);
      expect(out).toEqual([
        { kind: 'move', x: 0, y: 0 },
        { kind: 'line', x: 10, y: 20 },
        { kind: 'line', x: 30, y: 40 },
      ]);
    });

    test('m 이후 반복 pair는 l로 해석된다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'M 0 0 m 5 5 10 10')).toBe(true);
      expect(out).toEqual([
        { kind: 'move', x: 0, y: 0 },
        { kind: 'move', x: 5, y: 5 },
        { kind: 'line', x: 15, y: 15 },
      ]);
    });

    test('L command 반복은 여러 LineCommand를 생성한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'M 0 0 L 10 20 30 40')).toBe(true);
      expect(out).toEqual([
        { kind: 'move', x: 0, y: 0 },
        { kind: 'line', x: 10, y: 20 },
        { kind: 'line', x: 30, y: 40 },
      ]);
    });

    test('C command 반복은 여러 CubicCommand를 생성한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'M 0 0 C 1 2 3 4 5 6 7 8 9 10 11 12')).toBe(true);
      expect(out).toEqual([
        { kind: 'move', x: 0, y: 0 },
        { kind: 'cubic', x1: 1, y1: 2, x2: 3, y2: 4, x: 5, y: 6 },
        { kind: 'cubic', x1: 7, y1: 8, x2: 9, y2: 10, x: 11, y: 12 },
      ]);
    });
  });

  // ──────────────────────────────────────────────
  // Z/z 이후 current point와 shorthand state reset
  // ──────────────────────────────────────────────
  describe('Z/z 이후 동작', () => {
    test('Z 이후 current point는 subpath 시작점으로 복원된다', () => {
      const out: PathCommand[] = [];
      // Z 이후 상대 이동은 subpath start (0,0) 기준
      expect(parsePathDataInto(out, 'M 0 0 L 10 10 Z l 5 5')).toBe(true);
      expect(out).toEqual([
        { kind: 'move', x: 0, y: 0 },
        { kind: 'line', x: 10, y: 10 },
        { kind: 'close' },
        { kind: 'line', x: 5, y: 5 },
      ]);
    });

    test('Z 이후 S command는 shorthand state가 reset되어 current point를 first control로 사용한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'M 0 0 C 1 2 3 4 5 6 Z S 7 8 9 10')).toBe(true);
      expect(out).toEqual([
        { kind: 'move', x: 0, y: 0 },
        { kind: 'cubic', x1: 1, y1: 2, x2: 3, y2: 4, x: 5, y: 6 },
        { kind: 'close' },
        // Z 이후 current point = (0,0), shorthand reset → x1 = cx = 0, y1 = cy = 0
        { kind: 'cubic', x1: 0, y1: 0, x2: 7, y2: 8, x: 9, y: 10 },
      ]);
    });
  });

  // ──────────────────────────────────────────────
  // Multi subpath
  // ──────────────────────────────────────────────
  describe('Multi subpath', () => {
    test('여러 subpath를 올바르게 처리한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'M 0 0 L 10 0 Z M 20 20 L 30 20')).toBe(true);
      expect(out).toEqual([
        { kind: 'move', x: 0, y: 0 },
        { kind: 'line', x: 10, y: 0 },
        { kind: 'close' },
        { kind: 'move', x: 20, y: 20 },
        { kind: 'line', x: 30, y: 20 },
      ]);
    });
  });

  // ──────────────────────────────────────────────
  // Tokenizer fixture
  // ──────────────────────────────────────────────
  describe('Tokenizer fixture', () => {
    test('M10-20: 부호가 구분자 역할을 한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'M10-20')).toBe(true);
      expect(out).toEqual([{ kind: 'move', x: 10, y: -20 }]);
    });

    test('M.5.6: decimal point가 구분자 역할을 한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'M.5.6')).toBe(true);
      expect(out).toEqual([{ kind: 'move', x: 0.5, y: 0.6 }]);
    });

    test('M1e2 3E-1: scientific notation을 파싱한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'M1e2 3E-1')).toBe(true);
      expect(out).toEqual([{ kind: 'move', x: 100, y: 0.3 }]);
    });

    test('comma/space 혼합 구분자를 처리한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'M 10,20 L 30,40')).toBe(true);
      expect(out).toEqual([
        { kind: 'move', x: 10, y: 20 },
        { kind: 'line', x: 30, y: 40 },
      ]);
    });

    test('command letter 없는 반복 숫자를 마지막 command로 처리한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'M 0 0 L 10 10 20 20')).toBe(true);
      expect(out).toEqual([
        { kind: 'move', x: 0, y: 0 },
        { kind: 'line', x: 10, y: 10 },
        { kind: 'line', x: 20, y: 20 },
      ]);
    });
  });

  // ──────────────────────────────────────────────
  // Invalid grammar
  // ──────────────────────────────────────────────
  describe('Invalid grammar — false 반환', () => {
    test('unsupported command는 false를 반환한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'M 0 0 X 10 20')).toBe(false);
    });

    test('incomplete numeric field는 false를 반환한다', () => {
      const out: PathCommand[] = [];
      // L은 x, y 두 값이 필요한데 하나만 있음
      expect(parsePathDataInto(out, 'M 0 0 L 10')).toBe(false);
    });

    test('A/a의 large-arc-flag가 0 또는 1이 아니면 false를 반환한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'M 0 0 A 5 5 0 2 0 10 0')).toBe(false);
    });

    test('A/a의 sweep-flag가 0 또는 1이 아니면 false를 반환한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'M 0 0 A 5 5 0 0 2 10 0')).toBe(false);
    });

    test('M 없이 시작하는 path는 false를 반환한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'L 10 20')).toBe(false);
    });

    test('Infinity로 평가되는 숫자(1e309)는 false를 반환한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'M 1e309 0')).toBe(false);
    });

    test('-Infinity로 평가되는 숫자(-1e309)는 false를 반환한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, 'M 0 -1e309')).toBe(false);
    });
  });

  // ──────────────────────────────────────────────
  // Output mutation policy
  // ──────────────────────────────────────────────
  describe('Output mutation policy', () => {
    test('invalid input에서 false를 반환하고 기존 out을 수정하지 않는다', () => {
      const existing: PathCommand[] = [{ kind: 'move', x: 1, y: 2 }];
      const result = parsePathDataInto(existing, 'M 0 0 X invalid');
      expect(result).toBe(false);
      expect(existing).toEqual([{ kind: 'move', x: 1, y: 2 }]);
    });

    test('valid input 성공 시 out을 clear 후 새 commands를 push한다', () => {
      const out: PathCommand[] = [{ kind: 'move', x: 99, y: 99 }];
      expect(parsePathDataInto(out, 'M 0 0 L 10 20')).toBe(true);
      expect(out).toEqual([
        { kind: 'move', x: 0, y: 0 },
        { kind: 'line', x: 10, y: 20 },
      ]);
    });
  });
});
