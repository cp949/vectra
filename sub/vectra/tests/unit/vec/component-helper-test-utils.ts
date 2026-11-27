/**
 * vec 성분별 helper 시험이 함께 쓰는 단언과 공통 시험 묶음.
 * out 반환, aliasing, companion 결과를 같은 방식으로 검증한다.
 */
import { expect, test } from 'vitest';
import type { Point, PointWritable } from '../../../src/types/flat-shapes.internal';

type BinaryInto = (out: PointWritable, a: Point, b: Point) => PointWritable;
type BinaryCompanion = (a: Point, b: Point) => PointWritable;
export type ConstantCompanion = () => { x: number; y: number };

export type UnaryBehaviorCase = {
  into: (out: PointWritable, input: Point) => PointWritable;
  companion: (input: Point) => PointWritable;
  aliasInput: PointWritable;
  aliasExpected: readonly [number, number];
};
export type BinaryBehaviorCase = {
  name: string;
  into: BinaryInto;
  companion: BinaryCompanion;
  a: Point;
  b: Point;
  expected: readonly [number, number];
  aliasExpected?: readonly [number, number];
};

/** 점의 좌표가 기대 좌표 쌍과 같은지 확인한다. */
export function expectXY(actual: Point, expected: readonly [number, number]) {
  expect(actual).toEqual({ x: expected[0], y: expected[1] });
}

/**
 * 새 점 out에 기록하는 호출이 out을 반환하고 기대 좌표를 남기는지 확인한다.
 * initial로 out의 시작 좌표를 바꿔 덮어쓰기 여부도 검증한다.
 */
export function expectObjectOut(
  run: (out: PointWritable) => unknown,
  expected: readonly [number, number],
  initial: readonly [number, number] = [0, 0]
) {
  const out: PointWritable = { x: initial[0], y: initial[1] };
  const result = run(out);

  expect(result).toBe(out);
  expectXY(out, expected);
}

/** companion 결과가 같은 입력의 Into 기록 결과와 같은지 확인한다. */
export function expectCompanionMatchesInto(
  writeInto: (out: PointWritable) => unknown,
  runCompanion: () => { x: number; y: number }
) {
  const out: PointWritable = { x: 0, y: 0 };
  writeInto(out);
  const result = runCompanion();

  expect(result.x).toBe(out.x);
  expect(result.y).toBe(out.y);
}

/** 두 성분이 모두 NaN인지 확인한다. */
export function expectNaNComponents(actual: Point) {
  expect(Number.isNaN(actual.x)).toBe(true);
  expect(Number.isNaN(actual.y)).toBe(true);
}

/** 단항 helper의 제자리 기록과 companion 결과를 검증하는 시험을 등록한다. */
export function testUnaryBehavior(helper: UnaryBehaviorCase) {
  test('out === input self-aliasing에서도 올바른 결과를 반환한다', () => {
    const input = { ...helper.aliasInput };
    helper.into(input, input);

    expectXY(input, helper.aliasExpected);
  });

  test('companion은 각 성분을 계산한 점을 반환한다', () => {
    expectXY(helper.companion(helper.aliasInput), helper.aliasExpected);
  });
}

/** 이항 helper의 aliasing과 companion 결과를 검증하는 시험을 등록한다. */
export function testBinaryBehavior(helper: BinaryBehaviorCase) {
  const aliasExpected = helper.aliasExpected ?? helper.expected;

  test('out === a aliasing에서도 올바른 결과를 반환한다', () => {
    const a: PointWritable = { x: 3, y: 8 };
    helper.into(a, a, { x: 5, y: 2 });

    expectXY(a, aliasExpected);
  });

  test('out === b aliasing에서도 올바른 결과를 반환한다', () => {
    const b: PointWritable = { x: 5, y: 2 };
    helper.into(b, { x: 3, y: 8 }, b);

    expectXY(b, aliasExpected);
  });

  test('companion은 올바른 결과를 반환한다', () => {
    expectXY(helper.companion(helper.a, helper.b), helper.expected);
  });
}
