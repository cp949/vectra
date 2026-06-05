import { expect, expectTypeOf, test } from 'vitest';
import type { XYInput, XYWritable } from '../../../src/types';

export type UnaryInto = <T extends XYWritable>(out: T, input: XYInput) => T;
export type UnaryCompanion = (input: XYInput) => { x: number; y: number };
export type BinaryInto = <T extends XYWritable>(out: T, a: XYInput, b: XYInput) => T;
export type BinaryCompanion = (a: XYInput, b: XYInput) => { x: number; y: number };
export type ConstantInto = <T extends XYWritable>(out: T) => T;
export type ConstantCompanion = () => { x: number; y: number };

export type UnaryBehaviorCase = {
  into: UnaryInto;
  companion: UnaryCompanion;
  aliasInput: XYWritable;
  aliasExpected: readonly [number, number];
  tupleInput: XYInput;
  tupleExpected: readonly [number, number];
};
export type BinaryBehaviorCase = {
  name: string;
  into: BinaryInto;
  companion: BinaryCompanion;
  a: XYInput;
  b: XYInput;
  expected: readonly [number, number];
  aliasExpected?: readonly [number, number];
};

export function expectXY(actual: XYInput, expected: readonly [number, number]) {
  if (Array.isArray(actual)) {
    expect(actual[0]).toBe(expected[0]);
    expect(actual[1]).toBe(expected[1]);
    return;
  }

  expect(actual).toEqual({ x: expected[0], y: expected[1] });
}

export function toTuple(input: XYInput): [number, number] {
  if ('x' in input) {
    return [input.x, input.y];
  }
  return [input[0], input[1]];
}

export function expectTupleOut(run: (out: [number, number]) => [number, number], expected: readonly [number, number]) {
  const out: [number, number] = [0, 0];
  const result = run(out);

  expect(result).toBe(out);
  expect(out[0]).toBe(expected[0]);
  expect(out[1]).toBe(expected[1]);
  expectTypeOf(result).toEqualTypeOf<[number, number]>();
}

export function expectObjectOut(
  run: (out: XYWritable) => unknown,
  expected: readonly [number, number],
  initial: readonly [number, number] = [0, 0]
) {
  const out: XYWritable = { x: initial[0], y: initial[1] };
  const result = run(out);

  expect(result).toBe(out);
  expectXY(out, expected);
}

export function expectCompanionMatchesInto(
  writeInto: (out: XYWritable) => unknown,
  runCompanion: () => { x: number; y: number }
) {
  const out: XYWritable = { x: 0, y: 0 };
  writeInto(out);
  const result = runCompanion();

  expect(result.x).toBe(out.x);
  expect(result.y).toBe(out.y);
}

export function expectNaNComponents(actual: XYInput) {
  const [x, y] = 'x' in actual ? [actual.x, actual.y] : [actual[0], actual[1]];

  expect(Number.isNaN(x)).toBe(true);
  expect(Number.isNaN(y)).toBe(true);
}

export function testUnaryBehavior(helper: UnaryBehaviorCase) {
  test('out === input self-aliasing에서도 올바른 결과를 반환한다', () => {
    const input = { ...helper.aliasInput };
    helper.into(input, input);

    expectXY(input, helper.aliasExpected);
  });

  test('tuple 입력을 처리하고 out을 반환한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const result = helper.into(out, helper.tupleInput);

    expect(result).toBe(out);
    expectXY(out, helper.tupleExpected);
  });

  test('mutable tuple out에 결과를 기록하고 tuple reference를 반환한다', () => {
    expectTupleOut((out) => helper.into(out, helper.tupleInput), helper.tupleExpected);
  });

  test('companion은 올바른 결과를 반환한다', () => {
    expectXY(helper.companion(helper.tupleInput), helper.tupleExpected);
  });
}

export function testBinaryBehavior(helper: BinaryBehaviorCase) {
  const aliasExpected = helper.aliasExpected ?? helper.expected;

  test('out === a aliasing에서도 올바른 결과를 반환한다', () => {
    const a: XYWritable = { x: 3, y: 8 };
    helper.into(a, a, { x: 5, y: 2 });

    expectXY(a, aliasExpected);
  });

  test('out === b aliasing에서도 올바른 결과를 반환한다', () => {
    const b: XYWritable = { x: 5, y: 2 };
    helper.into(b, { x: 3, y: 8 }, b);

    expectXY(b, aliasExpected);
  });

  test('tuple 입력과 object 입력을 혼합하여 처리한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const result = helper.into(out, toTuple(helper.a), helper.b);

    expect(result).toBe(out);
    expectXY(out, helper.expected);
  });

  test('mutable tuple out에 결과를 기록하고 tuple reference를 반환한다', () => {
    expectTupleOut((out) => helper.into(out, helper.a, helper.b), helper.expected);
  });

  test('companion은 올바른 결과를 반환한다', () => {
    expectXY(helper.companion(helper.a, helper.b), helper.expected);
  });
}
