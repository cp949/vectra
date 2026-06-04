import { describe, expect, test } from 'vitest';
import { parsePathDataLooseInto } from '../../../src/svg-path/parse-path-data-loose-into';
import type { PathCommand } from '../../../src/types/index';

describe('parsePathDataLooseInto', () => {
  // ──────────────────────────────────────────────
  // 기본 — 빈 입력
  // ──────────────────────────────────────────────
  describe('기본 — 빈 입력', () => {
    test('empty string은 빈 배열로 true를 반환한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataLooseInto(out, '')).toBe(true);
      expect(out).toEqual([]);
    });

    test('whitespace-only string은 빈 배열로 true를 반환한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataLooseInto(out, '   \t\n  ')).toBe(true);
      expect(out).toEqual([]);
    });
  });

  // ──────────────────────────────────────────────
  // 표준 SVG path — strict와 동일한 결과
  // ──────────────────────────────────────────────
  describe('표준 SVG path — strict와 동일한 결과', () => {
    test('M L 기본 path를 파싱한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataLooseInto(out, 'M 10 20 L 30 40')).toBe(true);
      expect(out).toEqual([
        { kind: 'move', x: 10, y: 20 },
        { kind: 'line', x: 30, y: 40 },
      ]);
    });

    test('M L Z path를 파싱한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataLooseInto(out, 'M 0 0 L 10 0 Z')).toBe(true);
      expect(out).toEqual([{ kind: 'move', x: 0, y: 0 }, { kind: 'line', x: 10, y: 0 }, { kind: 'close' }]);
    });
  });

  // ──────────────────────────────────────────────
  // whitespace 관용
  // ──────────────────────────────────────────────
  describe('whitespace 관용', () => {
    test('연속 공백을 허용한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataLooseInto(out, 'M  10  20')).toBe(true);
      expect(out).toEqual([{ kind: 'move', x: 10, y: 20 }]);
    });

    test('쉼표+공백 혼용을 허용한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataLooseInto(out, 'M10,20L30 40')).toBe(true);
      expect(out).toEqual([
        { kind: 'move', x: 10, y: 20 },
        { kind: 'line', x: 30, y: 40 },
      ]);
    });

    test('쉼표만 구분자로 사용해도 파싱한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataLooseInto(out, 'M 10,20 L 30,40')).toBe(true);
      expect(out).toEqual([
        { kind: 'move', x: 10, y: 20 },
        { kind: 'line', x: 30, y: 40 },
      ]);
    });
  });

  // ──────────────────────────────────────────────
  // partial success — unknown command letter
  // ──────────────────────────────────────────────
  describe('partial success — unknown command letter', () => {
    test('unknown command letter 중간 삽입 시 해당 지점까지 결과를 반환하고 true를 반환한다', () => {
      const out: PathCommand[] = [];
      // X는 지원하지 않는 command letter
      expect(parsePathDataLooseInto(out, 'M 10 20 X 30 40')).toBe(true);
      // M 10 20까지 파싱된다
      expect(out).toEqual([{ kind: 'move', x: 10, y: 20 }]);
    });

    test('path 시작부터 unknown command letter이면 빈 결과로 true를 반환한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataLooseInto(out, 'X 10 20')).toBe(true);
      expect(out).toEqual([]);
    });

    test('복수 command 후 unknown letter → 앞 command만 반환한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataLooseInto(out, 'M 0 0 L 10 10 W 20 20')).toBe(true);
      expect(out).toEqual([
        { kind: 'move', x: 0, y: 0 },
        { kind: 'line', x: 10, y: 10 },
      ]);
    });
  });

  // ──────────────────────────────────────────────
  // 0개 command 파싱
  // ──────────────────────────────────────────────
  describe('0개 command 파싱', () => {
    test('0개 command 파싱 시 out.length=0, true를 반환한다', () => {
      const out: PathCommand[] = [];
      // M 없이 L만 있으면 subpath 없음 → 0개 결과
      expect(parsePathDataLooseInto(out, 'L 10 20')).toBe(true);
      expect(out.length).toBe(0);
    });
  });

  // ──────────────────────────────────────────────
  // collection Into 정책 — out을 clear하지 않음
  // ──────────────────────────────────────────────
  describe('collection Into 정책 — out을 clear하지 않음', () => {
    test('호출 전 out에 있던 값을 유지하고 뒤에 push한다', () => {
      const existing: PathCommand = { kind: 'close' };
      const out: PathCommand[] = [existing];
      expect(parsePathDataLooseInto(out, 'M 10 20 L 30 40')).toBe(true);
      // 기존 { kind: 'close' } 이후에 parse 결과가 push된다
      expect(out[0]).toEqual(existing);
      expect(out).toEqual([{ kind: 'close' }, { kind: 'move', x: 10, y: 20 }, { kind: 'line', x: 30, y: 40 }]);
    });

    test('빈 path로 호출하면 기존 out 내용이 그대로 유지된다', () => {
      const out: PathCommand[] = [{ kind: 'move', x: 5, y: 5 }];
      expect(parsePathDataLooseInto(out, '')).toBe(true);
      expect(out).toEqual([{ kind: 'move', x: 5, y: 5 }]);
    });
  });

  // ──────────────────────────────────────────────
  // strict parsePathDataInto와의 비교 — 동일 케이스
  // ──────────────────────────────────────────────
  describe('strict와 동일 결과 케이스', () => {
    test('cubic bezier를 파싱한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataLooseInto(out, 'M 0 0 C 1 2 3 4 5 6')).toBe(true);
      expect(out).toEqual([
        { kind: 'move', x: 0, y: 0 },
        { kind: 'cubic', x1: 1, y1: 2, x2: 3, y2: 4, x: 5, y: 6 },
      ]);
    });

    test('quadratic bezier를 파싱한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataLooseInto(out, 'M 0 0 Q 1 2 3 4')).toBe(true);
      expect(out).toEqual([
        { kind: 'move', x: 0, y: 0 },
        { kind: 'quadratic', x1: 1, y1: 2, x: 3, y: 4 },
      ]);
    });

    test('arc command를 파싱한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataLooseInto(out, 'M 0 0 A 5 5 0 0 1 10 0')).toBe(true);
      expect(out).toEqual([
        { kind: 'move', x: 0, y: 0 },
        { kind: 'arc', rx: 5, ry: 5, xRotation: 0, largeArc: false, sweep: true, x: 10, y: 0 },
      ]);
    });

    test('H/V command를 파싱한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataLooseInto(out, 'M 10 10 H 20 V 30')).toBe(true);
      expect(out).toEqual([
        { kind: 'move', x: 10, y: 10 },
        { kind: 'line', x: 20, y: 10 },
        { kind: 'line', x: 20, y: 30 },
      ]);
    });

    test('command letter 없는 반복 숫자를 마지막 command로 처리한다', () => {
      const out: PathCommand[] = [];
      expect(parsePathDataLooseInto(out, 'M 0 0 L 10 10 20 20')).toBe(true);
      expect(out).toEqual([
        { kind: 'move', x: 0, y: 0 },
        { kind: 'line', x: 10, y: 10 },
        { kind: 'line', x: 20, y: 20 },
      ]);
    });
  });
});
