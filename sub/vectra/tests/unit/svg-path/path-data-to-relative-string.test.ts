import { describe, expect, test } from 'vitest';
import { parsePathDataInto } from '../../../src/svg-path/parse-path-data-into';
import { pathDataToRelativeString } from '../../../src/svg-path/path-data-to-relative-string';
import type { PathCommand } from '../../../src/types/index';

// ──────────────────────────────────────────────
// pathDataToRelativeString
// canonical absolute PathCommand[] → relative (lowercase) SVG path data.
// current point 초기값 (0, 0). close 후에는 subpath 시작점으로 복원.
// ──────────────────────────────────────────────
describe('pathDataToRelativeString', () => {
  describe('기본 출력', () => {
    test('빈 배열은 빈 문자열을 반환한다', () => {
      expect(pathDataToRelativeString([])).toBe('');
    });

    test('첫 move는 (0,0) 기준 dx dy로 출력한다', () => {
      const commands: PathCommand[] = [{ kind: 'move', x: 10, y: 20 }];
      expect(pathDataToRelativeString(commands)).toBe('m 10 20');
    });

    test('move → line → line은 current point 기준 상대 좌표로 출력한다', () => {
      const commands: PathCommand[] = [
        { kind: 'move', x: 10, y: 20 },
        { kind: 'line', x: 15, y: 15 },
        { kind: 'line', x: 20, y: 25 },
      ];
      expect(pathDataToRelativeString(commands)).toBe('m 10 20 l 5 -5 l 5 10');
    });
  });

  describe('Z/z 처리', () => {
    test('close는 "z"로 출력한다', () => {
      const commands: PathCommand[] = [{ kind: 'move', x: 0, y: 0 }, { kind: 'line', x: 10, y: 0 }, { kind: 'close' }];
      expect(pathDataToRelativeString(commands)).toBe('m 0 0 l 10 0 z');
    });

    test('close 이후 current point는 subpath start로 복원된다', () => {
      // M 10 20 L 30 40 Z M 100 100 →
      //   m 10 20 (current = 10,20, start = 10,20)
      //   l 20 20 (current = 30,40)
      //   z       (current 복원 = 10,20)
      //   m 90 80 (100-10, 100-20)
      const commands: PathCommand[] = [
        { kind: 'move', x: 10, y: 20 },
        { kind: 'line', x: 30, y: 40 },
        { kind: 'close' },
        { kind: 'move', x: 100, y: 100 },
      ];
      expect(pathDataToRelativeString(commands)).toBe('m 10 20 l 20 20 z m 90 80');
    });

    test('연속 close는 subpath start를 유지한다', () => {
      const commands: PathCommand[] = [
        { kind: 'move', x: 5, y: 5 },
        { kind: 'line', x: 15, y: 5 },
        { kind: 'close' },
        { kind: 'close' },
        { kind: 'move', x: 5, y: 5 },
      ];
      expect(pathDataToRelativeString(commands)).toBe('m 5 5 l 10 0 z z m 0 0');
    });
  });

  describe('Q/C control point 처리', () => {
    test('quadratic control은 command 시작점 기준 상대 좌표이다', () => {
      // current = (10, 20). Q x1=15 y1=30 endpoint=(20, 20)
      // → q dx1=5 dy1=10 dx=10 dy=0
      const commands: PathCommand[] = [
        { kind: 'move', x: 10, y: 20 },
        { kind: 'quadratic', x1: 15, y1: 30, x: 20, y: 20 },
      ];
      expect(pathDataToRelativeString(commands)).toBe('m 10 20 q 5 10 10 0');
    });

    test('cubic의 두 control은 command 시작점 기준 상대 좌표이다', () => {
      // current = (0, 0). C x1=1 y1=2 x2=3 y2=4 x=5 y=6
      // → c 1 2 3 4 5 6
      const commands: PathCommand[] = [
        { kind: 'move', x: 0, y: 0 },
        { kind: 'cubic', x1: 1, y1: 2, x2: 3, y2: 4, x: 5, y: 6 },
      ];
      expect(pathDataToRelativeString(commands)).toBe('m 0 0 c 1 2 3 4 5 6');
    });

    test('current가 (0,0)이 아닐 때도 cubic control은 시작점 기준이다', () => {
      // current = (10, 20). C x1=11 y1=22 x2=13 y2=24 x=15 y=26
      // → c 1 2 3 4 5 6
      const commands: PathCommand[] = [
        { kind: 'move', x: 10, y: 20 },
        { kind: 'cubic', x1: 11, y1: 22, x2: 13, y2: 24, x: 15, y: 26 },
      ];
      expect(pathDataToRelativeString(commands)).toBe('m 10 20 c 1 2 3 4 5 6');
    });
  });

  describe('Arc 처리', () => {
    test('arc endpoint는 상대, rx/ry/flags는 그대로, xRotation은 radian→degree', () => {
      // xRotation = Math.PI / 4 → 45도
      // current = (0, 0), endpoint (50, 60) → da rx ry deg flag flag dx dy
      const commands: PathCommand[] = [
        {
          kind: 'arc',
          rx: 10,
          ry: 20,
          xRotation: Math.PI / 4,
          largeArc: false,
          sweep: true,
          x: 50,
          y: 60,
        },
      ];
      // 첫 command가 arc이지만 current 초기값 (0,0) 기준으로 상대 endpoint도 (50, 60)
      expect(pathDataToRelativeString(commands)).toBe('a 10 20 45 0 1 50 60');
    });

    test('arc flags가 true/false에 따라 1/0으로 출력한다', () => {
      const commands: PathCommand[] = [
        { kind: 'move', x: 5, y: 5 },
        {
          kind: 'arc',
          rx: 3,
          ry: 4,
          xRotation: 0,
          largeArc: true,
          sweep: false,
          x: 15,
          y: 5,
        },
      ];
      expect(pathDataToRelativeString(commands)).toBe('m 5 5 a 3 4 0 1 0 10 0');
    });
  });

  describe('precision option', () => {
    test('SvgPathStringifyOptions.precision이 모든 숫자에 적용된다', () => {
      const commands: PathCommand[] = [
        { kind: 'move', x: 1.2345, y: 2.3456 },
        { kind: 'line', x: 3.5678, y: 4.6789 },
      ];
      // precision=2 적용
      // m 1.23 2.35  (1.2345→1.23, 2.3456→2.35)
      // l dx=2.3333→2.33, dy=2.3333→2.33
      expect(pathDataToRelativeString(commands, { precision: 2 })).toBe('m 1.23 2.35 l 2.33 2.33');
    });
  });

  describe('input mutation 금지', () => {
    test('입력 commands를 mutate하지 않는다', () => {
      const commands: PathCommand[] = [
        { kind: 'move', x: 10, y: 20 },
        { kind: 'line', x: 30, y: 40 },
      ];
      const snapshot = JSON.parse(JSON.stringify(commands));
      pathDataToRelativeString(commands);
      expect(commands).toEqual(snapshot);
    });
  });

  describe('NaN/Infinity field', () => {
    test('NaN field는 빈 문자열로 출력한다 (formatNumber 정책)', () => {
      // current = (0, 0), move x = NaN, y = 20 → m  20 (NaN 자리는 "")
      const commands: PathCommand[] = [{ kind: 'move', x: Number.NaN, y: 20 }];
      expect(pathDataToRelativeString(commands)).toBe('m  20');
    });

    test('+Infinity field는 빈 문자열로 출력한다 (formatNumber 정책)', () => {
      const commands: PathCommand[] = [{ kind: 'move', x: 10, y: Number.POSITIVE_INFINITY }];
      expect(pathDataToRelativeString(commands)).toBe('m 10 ');
    });

    test('-Infinity field도 빈 문자열로 출력한다 (formatNumber 정책)', () => {
      const commands: PathCommand[] = [{ kind: 'move', x: Number.NEGATIVE_INFINITY, y: 10 }];
      expect(pathDataToRelativeString(commands)).toBe('m  10');
    });

    test('NaN current는 후속 dx 계산을 NaN으로 오염시켜 빈 문자열로 출력된다 (pass-through)', () => {
      // 첫 move x=NaN. cx = NaN. 다음 line의 dx = 30 - NaN = NaN → 빈 문자열.
      const commands: PathCommand[] = [
        { kind: 'move', x: Number.NaN, y: 0 },
        { kind: 'line', x: 30, y: 0 },
      ];
      expect(pathDataToRelativeString(commands)).toBe('m  0 l  0');
    });
  });

  describe('첫 command가 move가 아닌 경우 (caller 책임)', () => {
    test('첫 command가 line이면 (0,0) 기준 dx dy로 출력한다 (SVG spec invalid path)', () => {
      // 결과 'l 10 20'은 SVG spec상 moveto 없이 시작해 strict parse 실패.
      const commands: PathCommand[] = [{ kind: 'line', x: 10, y: 20 }];
      expect(pathDataToRelativeString(commands)).toBe('l 10 20');
    });

    test('첫 command가 close이면 current 초기값 (0,0)이 유지된다', () => {
      const commands: PathCommand[] = [{ kind: 'close' }];
      expect(pathDataToRelativeString(commands)).toBe('z');
    });
  });

  describe('arc 음수 rx/ry (caller 책임)', () => {
    test('음수 rx/ry는 그대로 출력한다 — canonical은 양수 보관이므로 caller 책임', () => {
      const commands: PathCommand[] = [
        { kind: 'move', x: 0, y: 0 },
        { kind: 'arc', rx: -10, ry: -20, xRotation: 0, largeArc: false, sweep: false, x: 10, y: 0 },
      ];
      expect(pathDataToRelativeString(commands)).toBe('m 0 0 a -10 -20 0 0 0 10 0');
    });
  });

  describe('precision option — 모든 numeric field 적용', () => {
    test('precision은 arc rx/ry/xRotation degree에도 적용된다', () => {
      // xRotation = Math.PI / 6 → 29.999999999999996도. precision=2 → "30"
      const commands: PathCommand[] = [
        { kind: 'move', x: 0, y: 0 },
        {
          kind: 'arc',
          rx: 10.1234,
          ry: 20.5678,
          xRotation: Math.PI / 6,
          largeArc: false,
          sweep: true,
          x: 50,
          y: 60,
        },
      ];
      expect(pathDataToRelativeString(commands, { precision: 2 })).toBe('m 0 0 a 10.12 20.57 30 0 1 50 60');
    });

    test('precision=0은 모든 숫자를 정수로 자른다', () => {
      const commands: PathCommand[] = [
        { kind: 'move', x: 1.7, y: 2.3 },
        { kind: 'line', x: 5.1, y: 8.9 },
      ];
      // toFixed(0): 1.7→"2", 2.3→"2", dx 5.1-1.7=3.4→"3", dy 8.9-2.3=6.6→"7"
      expect(pathDataToRelativeString(commands, { precision: 0 })).toBe('m 2 2 l 3 7');
    });
  });

  describe('round-trip — pathDataToRelativeString → parsePathDataInto', () => {
    test('M L Z 경로 round-trip은 원본 command와 동일하다', () => {
      const original: PathCommand[] = [{ kind: 'move', x: 0, y: 0 }, { kind: 'line', x: 10, y: 20 }, { kind: 'close' }];
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, pathDataToRelativeString(original))).toBe(true);
      expect(out).toEqual(original);
    });

    test('multi-subpath close 후 move를 round-trip해도 동일하다', () => {
      const original: PathCommand[] = [
        { kind: 'move', x: 10, y: 20 },
        { kind: 'line', x: 30, y: 40 },
        { kind: 'close' },
        { kind: 'move', x: 100, y: 100 },
        { kind: 'line', x: 110, y: 100 },
      ];
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, pathDataToRelativeString(original))).toBe(true);
      expect(out).toEqual(original);
    });

    test('quadratic/cubic을 round-trip해도 동일하다', () => {
      const original: PathCommand[] = [
        { kind: 'move', x: 5, y: 5 },
        { kind: 'quadratic', x1: 10, y1: 0, x: 15, y: 5 },
        { kind: 'cubic', x1: 16, y1: 6, x2: 18, y2: 8, x: 20, y: 10 },
      ];
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, pathDataToRelativeString(original))).toBe(true);
      expect(out).toEqual(original);
    });

    test('arc xRotation=0 round-trip은 원본과 정확히 동일하다', () => {
      // xRotation != 0이면 radian → degree → radian 변환에서 floating-point drift가 있을 수 있다.
      // 0은 정확히 round-trip된다.
      const original: PathCommand[] = [
        { kind: 'move', x: 5, y: 5 },
        { kind: 'arc', rx: 10, ry: 20, xRotation: 0, largeArc: false, sweep: true, x: 25, y: 5 },
      ];
      const out: PathCommand[] = [];
      expect(parsePathDataInto(out, pathDataToRelativeString(original))).toBe(true);
      expect(out).toEqual(original);
    });
  });
});
