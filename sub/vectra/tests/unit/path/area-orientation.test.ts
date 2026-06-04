/**
 * TASK-03 area/orientation/containment unit tests.
 *
 * 대상: signedArea, area, isClockwise, orientCommandsInto, drawDirection, classifyPoint.
 *
 * 부호 convention(TASK-01 D5): y-down 좌표계에서 `signedArea > 0`을 CW로 해석한다.
 */
import { describe, expect, test } from 'vitest';
import { area } from '../../../src/path/area';
import { classifyPoint } from '../../../src/path/classify-point';
import { drawDirection } from '../../../src/path/draw-direction';
import { isClockwise } from '../../../src/path/is-clockwise';
import { orientCommandsInto } from '../../../src/path/orient-commands-into';
import { reverseCommandsInto } from '../../../src/path/reverse-commands-into';
import { signedArea } from '../../../src/path/signed-area';
import type { PathCommand } from '../../../src/types/index';

// ──────────────────────────────────────────────
// 공통 fixture
// ──────────────────────────────────────────────

/** 단위 정사각형 CW (y-down 화면 좌표계 기준). */
function makeUnitSquareCW(): PathCommand[] {
  return [
    { kind: 'move', x: 0, y: 0 },
    { kind: 'line', x: 1, y: 0 },
    { kind: 'line', x: 1, y: 1 },
    { kind: 'line', x: 0, y: 1 },
    { kind: 'close' },
  ];
}

/** 단위 정사각형 CCW (y-down 화면 좌표계 기준). */
function makeUnitSquareCCW(): PathCommand[] {
  return [
    { kind: 'move', x: 0, y: 0 },
    { kind: 'line', x: 0, y: 1 },
    { kind: 'line', x: 1, y: 1 },
    { kind: 'line', x: 1, y: 0 },
    { kind: 'close' },
  ];
}

/** 두 CW 단위 정사각형. */
function makeTwoCWSquares(): PathCommand[] {
  return [
    ...makeUnitSquareCW(),
    { kind: 'move', x: 10, y: 10 },
    { kind: 'line', x: 11, y: 10 },
    { kind: 'line', x: 11, y: 11 },
    { kind: 'line', x: 10, y: 11 },
    { kind: 'close' },
  ];
}

/** outer (0..200) + inner (50..150) — even-odd donut. */
function makeDonut(): PathCommand[] {
  return [
    { kind: 'move', x: 0, y: 0 },
    { kind: 'line', x: 200, y: 0 },
    { kind: 'line', x: 200, y: 200 },
    { kind: 'line', x: 0, y: 200 },
    { kind: 'close' },
    { kind: 'move', x: 50, y: 50 },
    { kind: 'line', x: 150, y: 50 },
    { kind: 'line', x: 150, y: 150 },
    { kind: 'line', x: 50, y: 150 },
    { kind: 'close' },
  ];
}

/** relative-scale tolerance. O(1) 값도 같은 helper로 비교한다. */
function expectAreaNear(actual: number, expected: number): void {
  const scale = Math.max(1, Math.abs(actual), Math.abs(expected));
  expect(Math.abs(actual - expected) / scale).toBeLessThan(1e-12);
}

/** 두 path command 배열이 동일한지 확인한다. */
function expectCommandsEqual(actual: readonly PathCommand[], expected: readonly PathCommand[]): void {
  expect(actual.length).toBe(expected.length);
  for (let i = 0; i < actual.length; i++) {
    expect(actual[i]).toEqual(expected[i]);
  }
}

/** 두 path command 배열이 값은 같고 command object reference는 다른지 확인한다. */
function expectCommandsEqualButDistinct(actual: readonly PathCommand[], expected: readonly PathCommand[]): void {
  expectCommandsEqual(actual, expected);
  for (let i = 0; i < actual.length; i++) {
    expect(actual[i]).not.toBe(expected[i]);
  }
}

// ──────────────────────────────────────────────
// signedArea
// ──────────────────────────────────────────────

describe('signedArea', () => {
  test('CW 단위 정사각형 → +1 (y-down 화면 좌표계)', () => {
    const result = signedArea(makeUnitSquareCW());
    expectAreaNear(result, 1);
  });

  test('CCW 단위 정사각형 → -1', () => {
    const result = signedArea(makeUnitSquareCCW());
    expectAreaNear(result, -1);
  });

  test('multi-subpath 두 CW 정사각형 → +2 (산술 합)', () => {
    const result = signedArea(makeTwoCWSquares());
    expectAreaNear(result, 2);
  });

  test('empty path → 0', () => {
    expect(signedArea([])).toBe(0);
  });

  test('move-only path → 0', () => {
    const cmds: PathCommand[] = [{ kind: 'move', x: 5, y: 5 }];
    expect(signedArea(cmds)).toBe(0);
  });

  test('close 없는 open path → shoelace 자동 close → +1', () => {
    // M 0,0 L 1,0 L 1,1 L 0,1 — close 없이도 shoelace로 마지막 → 첫 점 자동 close
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 1, y: 0 },
      { kind: 'line', x: 1, y: 1 },
      { kind: 'line', x: 0, y: 1 },
    ];
    const result = signedArea(cmds);
    expectAreaNear(result, 1);
  });

  test('NaN 좌표 입력 → NaN 결과 (pass-through)', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: Number.NaN, y: 0 },
      { kind: 'line', x: 1, y: 1 },
      { kind: 'close' },
    ];
    expect(Number.isNaN(signedArea(cmds))).toBe(true);
  });

  test('Infinity 좌표 입력 → non-finite 결과 (pass-through)', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: Number.POSITIVE_INFINITY, y: 0 },
      { kind: 'line', x: 1, y: 1 },
      { kind: 'close' },
    ];
    expect(Number.isFinite(signedArea(cmds))).toBe(false);
  });

  test('-Infinity 좌표 입력 → non-finite 결과 (pass-through)', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: Number.NEGATIVE_INFINITY, y: 0 },
      { kind: 'line', x: 1, y: 1 },
      { kind: 'close' },
    ];
    expect(Number.isFinite(signedArea(cmds))).toBe(false);
  });

  test('zero degenerate path → 0', () => {
    // (0,0)→(100,0)→(0,0)→close: 면적 0
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 100, y: 0 },
      { kind: 'line', x: 0, y: 0 },
      { kind: 'close' },
    ];
    expectAreaNear(signedArea(cmds), 0);
  });
});

// ──────────────────────────────────────────────
// area
// ──────────────────────────────────────────────

describe('area', () => {
  test('CW 단위 정사각형 → 1', () => {
    expectAreaNear(area(makeUnitSquareCW()), 1);
  });

  test('CCW 단위 정사각형 → 1 (absolute value)', () => {
    expectAreaNear(area(makeUnitSquareCCW()), 1);
  });

  test('signedArea의 절댓값과 일치', () => {
    const cmds = makeUnitSquareCCW();
    expect(area(cmds)).toBe(Math.abs(signedArea(cmds)));
  });

  test('multi-subpath 두 CW 정사각형 → 2', () => {
    expectAreaNear(area(makeTwoCWSquares()), 2);
  });

  test('empty path → 0', () => {
    expect(area([])).toBe(0);
  });
});

// ──────────────────────────────────────────────
// isClockwise
// ──────────────────────────────────────────────

describe('isClockwise', () => {
  test('CW 단위 정사각형 → true', () => {
    expect(isClockwise(makeUnitSquareCW())).toBe(true);
  });

  test('CCW 단위 정사각형 → false', () => {
    expect(isClockwise(makeUnitSquareCCW())).toBe(false);
  });

  test('zero-area path → false', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 100, y: 0 },
      { kind: 'line', x: 0, y: 0 },
      { kind: 'close' },
    ];
    expect(isClockwise(cmds)).toBe(false);
  });

  test('empty path → false', () => {
    expect(isClockwise([])).toBe(false);
  });
});

// ──────────────────────────────────────────────
// orientCommandsInto
// ──────────────────────────────────────────────

describe('orientCommandsInto', () => {
  test('clockwise=true & 입력 CW → 입력을 deep copy', () => {
    const input = makeUnitSquareCW();
    const out: PathCommand[] = [];
    const result = orientCommandsInto(out, input, true);
    expect(result).toBe(out);
    expect(out).not.toBe(input);
    expectCommandsEqualButDistinct(out, input);
  });

  test('clockwise=true & 입력 CCW → reverseCommandsInto 결과와 동등', () => {
    const input = makeUnitSquareCCW();
    const out: PathCommand[] = [];
    orientCommandsInto(out, input, true);
    const expected: PathCommand[] = [];
    reverseCommandsInto(expected, input);
    expectCommandsEqual(out, expected);
  });

  test('clockwise=false & 입력 CW → reverseCommandsInto 결과와 동등', () => {
    const input = makeUnitSquareCW();
    const out: PathCommand[] = [];
    orientCommandsInto(out, input, false);
    const expected: PathCommand[] = [];
    reverseCommandsInto(expected, input);
    expectCommandsEqual(out, expected);
  });

  test('clockwise=false & 입력 CCW → 입력을 deep copy', () => {
    const input = makeUnitSquareCCW();
    const out: PathCommand[] = [];
    orientCommandsInto(out, input, false);
    expectCommandsEqualButDistinct(out, input);
  });

  test('empty input → out.length === 0, out 반환', () => {
    const out: PathCommand[] = [{ kind: 'move', x: 99, y: 99 }];
    const result = orientCommandsInto(out, [], true);
    expect(result).toBe(out);
    expect(out.length).toBe(0);
  });

  test('out 반환 동일성', () => {
    const out: PathCommand[] = [];
    const result = orientCommandsInto(out, makeUnitSquareCW(), true);
    expect(result).toBe(out);
  });

  test('pre-existing 항목이 모두 clear된다', () => {
    const out: PathCommand[] = [
      { kind: 'move', x: 999, y: 999 },
      { kind: 'line', x: 998, y: 998 },
    ];
    orientCommandsInto(out, makeUnitSquareCW(), true);
    expect(out.length).toBe(makeUnitSquareCW().length);
    expect(out[0]).toEqual({ kind: 'move', x: 0, y: 0 });
  });
});

// ──────────────────────────────────────────────
// drawDirection
// ──────────────────────────────────────────────

describe('drawDirection', () => {
  test('CW path → 1 (y-down 기본 가정)', () => {
    expect(drawDirection(makeUnitSquareCW())).toBe(1);
  });

  test('CCW path → -1', () => {
    expect(drawDirection(makeUnitSquareCCW())).toBe(-1);
  });

  test('zero-area path → 0', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 100, y: 0 },
      { kind: 'line', x: 0, y: 0 },
      { kind: 'close' },
    ];
    expect(drawDirection(cmds)).toBe(0);
  });

  test('empty path → 0', () => {
    expect(drawDirection([])).toBe(0);
  });

  test('NaN 좌표 입력 → 0 (signedArea NaN은 양수도 음수도 아니므로 0)', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: Number.NaN, y: 0 },
      { kind: 'line', x: 1, y: 1 },
      { kind: 'close' },
    ];
    expect(drawDirection(cmds)).toBe(0);
  });
});

// ──────────────────────────────────────────────
// classifyPoint
// ──────────────────────────────────────────────

describe('classifyPoint', () => {
  test('내부 점 → inside', () => {
    expect(classifyPoint(makeUnitSquareCW(), { x: 0.5, y: 0.5 })).toBe('inside');
  });

  test('외부 점 → outside', () => {
    expect(classifyPoint(makeUnitSquareCW(), { x: 5, y: 5 })).toBe('outside');
  });

  test('boundary 점 (정확히 변 위) → boundary', () => {
    // (0.5, 0) — 위쪽 변 위
    expect(classifyPoint(makeUnitSquareCW(), { x: 0.5, y: 0 })).toBe('boundary');
  });

  test('boundary 꼭짓점 → boundary', () => {
    expect(classifyPoint(makeUnitSquareCW(), { x: 0, y: 0 })).toBe('boundary');
  });

  test('empty path → outside', () => {
    expect(classifyPoint([], { x: 0, y: 0 })).toBe('outside');
  });

  test('donut hole 내부 → outside (even-odd)', () => {
    // (100,100): outer + inner 모두 내부 → even-odd 짝수 → outside
    expect(classifyPoint(makeDonut(), { x: 100, y: 100 })).toBe('outside');
  });

  test('donut 외곽 영역 → inside', () => {
    expect(classifyPoint(makeDonut(), { x: 10, y: 10 })).toBe('inside');
  });

  test('non-finite point x=NaN → outside', () => {
    expect(classifyPoint(makeUnitSquareCW(), { x: Number.NaN, y: 0.5 })).toBe('outside');
  });

  test('non-finite point y=NaN → outside', () => {
    expect(classifyPoint(makeUnitSquareCW(), { x: 0.5, y: Number.NaN })).toBe('outside');
  });

  test('non-finite point x=Infinity → outside', () => {
    expect(classifyPoint(makeUnitSquareCW(), { x: Number.POSITIVE_INFINITY, y: 0.5 })).toBe('outside');
  });

  test('non-finite point x=-Infinity → outside', () => {
    expect(classifyPoint(makeUnitSquareCW(), { x: Number.NEGATIVE_INFINITY, y: 0.5 })).toBe('outside');
  });

  test('non-finite point y=Infinity → outside', () => {
    expect(classifyPoint(makeUnitSquareCW(), { x: 0.5, y: Number.POSITIVE_INFINITY })).toBe('outside');
  });

  test('non-finite point y=-Infinity → outside', () => {
    expect(classifyPoint(makeUnitSquareCW(), { x: 0.5, y: Number.NEGATIVE_INFINITY })).toBe('outside');
  });

  test('tuple point input → 동일 동작', () => {
    expect(classifyPoint(makeUnitSquareCW(), [0.5, 0.5])).toBe('inside');
    expect(classifyPoint(makeUnitSquareCW(), [5, 5])).toBe('outside');
  });

  test('tuple point boundary input → boundary', () => {
    // (0.5, 0)은 위쪽 변 위. tuple/object branch가 boundary 분기에서 동일 동작인지 확인.
    expect(classifyPoint(makeUnitSquareCW(), [0.5, 0])).toBe('boundary');
  });

  test('custom boundaryTolerance: 큰 값이면 인근 외부 점도 boundary로 분류', () => {
    // (1.05, 0.5)는 변 (x=1)에서 0.05 떨어진 외부 점. tolerance 0.1이면 boundary.
    expect(classifyPoint(makeUnitSquareCW(), { x: 1.05, y: 0.5 }, { boundaryTolerance: 0.1 })).toBe('boundary');
    // 기본 tolerance(1e-9)에서는 outside
    expect(classifyPoint(makeUnitSquareCW(), { x: 1.05, y: 0.5 })).toBe('outside');
  });
});
