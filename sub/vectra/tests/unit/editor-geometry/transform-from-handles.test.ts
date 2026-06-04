import { describe, expect, test } from 'vitest';
import { transformFromHandles } from '../../../src/editor-geometry/transform-from-handles';
import { transformFromHandlesInto } from '../../../src/editor-geometry/transform-from-handles-into';
import type { TransformFromHandlesInput, TransformFromHandlesOptions } from '../../../src/editor-geometry/types';
import type { MatrixObjectLike, MatrixWritable } from '../../../src/types';

type MatrixExpectation = Partial<Pick<MatrixWritable, 'a' | 'b' | 'c' | 'd' | 'tx' | 'ty'>>;

interface TransformCase {
  name: string;
  input: TransformFromHandlesInput;
  options?: TransformFromHandlesOptions;
  expected: MatrixExpectation;
  fixedPoint?: readonly [x: number, y: number];
}

interface FailureCase {
  name: string;
  input: TransformFromHandlesInput;
  sentinel: MatrixWritable;
}

const DEFAULT_BOUNDS = { min: { x: 0, y: 0 }, max: { x: 100, y: 80 } };

function makeMatrix(values: MatrixExpectation = {}): MatrixWritable {
  return { a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0, ...values };
}

function applyPoint(matrix: MatrixObjectLike, x: number, y: number): readonly [x: number, y: number] {
  return [matrix.a * x + matrix.c * y + matrix.tx, matrix.b * x + matrix.d * y + matrix.ty];
}

function expectMatrix(matrix: MatrixObjectLike, expected: MatrixExpectation): void {
  for (const key of ['a', 'b', 'c', 'd', 'tx', 'ty'] as const) {
    const value = expected[key];
    if (value !== undefined) {
      expect(matrix[key]).toBeCloseTo(value);
    }
  }
}

function expectFixedPoint(matrix: MatrixObjectLike, point: readonly [x: number, y: number]): void {
  const [x, y] = applyPoint(matrix, point[0], point[1]);

  expect(x).toBeCloseTo(point[0]);
  expect(y).toBeCloseTo(point[1]);
}

function expectIntoSuccess({ input, options, expected, fixedPoint }: Omit<TransformCase, 'name'>): MatrixWritable {
  const out = makeMatrix();
  const result = transformFromHandlesInto(out, input, options);

  expect(result).toBe(true);
  expectMatrix(out, expected);
  if (fixedPoint !== undefined) {
    expectFixedPoint(out, fixedPoint);
  }

  return out;
}

describe('corner handle resize', () => {
  test.each([
    {
      name: 'se handle: scale 두 축, anchor top-left 고정',
      input: { bounds: DEFAULT_BOUNDS, handle: 'se', to: { x: 150, y: 120 } },
      expected: { a: 1.5, b: 0, c: 0, d: 1.5 },
      fixedPoint: [0, 0],
    },
    {
      name: 'nw handle: scale 두 축, anchor bottom-right 고정',
      input: { bounds: DEFAULT_BOUNDS, handle: 'nw', to: { x: -50, y: -40 } },
      expected: { a: 1.5, d: 1.5 },
      fixedPoint: [100, 80],
    },
    {
      name: 'ne handle: 비등비 scale, anchor bottom-left 고정',
      input: { bounds: DEFAULT_BOUNDS, handle: 'ne', to: { x: 50, y: -20 } },
      expected: { a: 0.5, d: 1.25 },
      fixedPoint: [0, 80],
    },
    {
      name: 'sw handle: 비등비 scale, anchor top-right 고정',
      input: { bounds: DEFAULT_BOUNDS, handle: 'sw', to: { x: -20, y: 40 } },
      expected: { a: 1.2, d: 0.5 },
      fixedPoint: [100, 0],
    },
  ] satisfies readonly TransformCase[])('$name', (testCase) => {
    expectIntoSuccess(testCase);
  });
});

describe('edge handle resize', () => {
  test.each([
    {
      name: 'e handle: x축만 scale, anchor 좌측 고정',
      input: { bounds: DEFAULT_BOUNDS, handle: 'e', to: { x: 120, y: 40 } },
      expected: { a: 1.2, b: 0, c: 0, d: 1 },
      fixedPoint: [0, 40],
    },
    {
      name: 'w handle: x축만 scale, anchor 우측 고정',
      input: { bounds: DEFAULT_BOUNDS, handle: 'w', to: { x: -20, y: 40 } },
      expected: { a: 1.2, d: 1 },
      fixedPoint: [100, 40],
    },
    {
      name: 's handle: y축만 scale, anchor 상단 고정',
      input: { bounds: DEFAULT_BOUNDS, handle: 's', to: { x: 50, y: 120 } },
      expected: { a: 1, d: 1.5 },
      fixedPoint: [50, 0],
    },
    {
      name: 'n handle: y축만 scale, anchor 하단 고정',
      input: { bounds: DEFAULT_BOUNDS, handle: 'n', to: { x: 50, y: -20 } },
      expected: { a: 1, d: 1.25 },
      fixedPoint: [50, 80],
    },
  ] satisfies readonly TransformCase[])('$name', (testCase) => {
    expectIntoSuccess(testCase);
  });
});

describe('비원점 bounds에서의 anchor 고정', () => {
  test('se handle: 비원점 bounds에서 anchor top-left 고정', () => {
    expectIntoSuccess({
      input: {
        bounds: { min: { x: 20, y: 30 }, max: { x: 120, y: 130 } },
        handle: 'se',
        to: { x: 170, y: 180 },
      },
      expected: { a: 1.5, d: 1.5 },
      fixedPoint: [20, 30],
    });
  });
});

describe('zero-size bounds degenerate', () => {
  test.each([
    {
      name: 'width=0에서 x축 handle(e): false + out 미수정',
      input: {
        bounds: { min: { x: 0, y: 0 }, max: { x: 0, y: 80 } },
        handle: 'e',
        to: { x: 50, y: 40 },
      },
      sentinel: makeMatrix({ a: 99, d: 1 }),
    },
    {
      name: 'height=0에서 y축 handle(s): false + out 미수정',
      input: {
        bounds: { min: { x: 0, y: 0 }, max: { x: 100, y: 0 } },
        handle: 's',
        to: { x: 50, y: 50 },
      },
      sentinel: makeMatrix({ a: 1, d: 99 }),
    },
    {
      name: 'width=0에서 corner handle(se): false + out 미수정',
      input: {
        bounds: { min: { x: 0, y: 0 }, max: { x: 0, y: 80 } },
        handle: 'se',
        to: { x: 50, y: 120 },
      },
      sentinel: makeMatrix({ a: 42 }),
    },
    {
      name: 'edge handle n: height=0이어도 false',
      input: {
        bounds: { min: { x: 0, y: 0 }, max: { x: 100, y: 0 } },
        handle: 'n',
        to: { x: 50, y: -10 },
      },
      sentinel: makeMatrix({ d: 77 }),
    },
    {
      name: 'edge handle w: width=0이어도 false',
      input: {
        bounds: { min: { x: 0, y: 0 }, max: { x: 0, y: 80 } },
        handle: 'w',
        to: { x: -10, y: 40 },
      },
      sentinel: makeMatrix({ a: 55 }),
    },
  ] satisfies readonly FailureCase[])('$name', ({ input, sentinel }) => {
    const out = makeMatrix(sentinel);

    expect(transformFromHandlesInto(out, input)).toBe(false);
    expect(out).toEqual(sentinel);
  });
});

describe('NaN 입력', () => {
  test.each([
    {
      name: 'to.x NaN: false + out 미수정',
      input: { bounds: DEFAULT_BOUNDS, handle: 'se', to: { x: Number.NaN, y: 50 } },
      sentinel: makeMatrix({ a: 11 }),
    },
    {
      name: 'to.y NaN: false + out 미수정',
      input: { bounds: DEFAULT_BOUNDS, handle: 'se', to: { x: 150, y: Number.NaN } },
      sentinel: makeMatrix({ d: 22 }),
    },
    {
      name: 'bounds NaN minX: false + out 미수정',
      input: {
        bounds: { min: { x: Number.NaN, y: 0 }, max: { x: 100, y: 80 } },
        handle: 'se',
        to: { x: 150, y: 120 },
      },
      sentinel: makeMatrix({ a: 33 }),
    },
  ] satisfies readonly FailureCase[])('$name', ({ input, sentinel }) => {
    const out = makeMatrix(sentinel);

    expect(transformFromHandlesInto(out, input)).toBe(false);
    expect(out).toEqual(sentinel);
  });
});

describe('no-op drag (handle 제자리)', () => {
  test('se handle을 현재 위치로 드래그: identity-like matrix', () => {
    expectIntoSuccess({
      input: { bounds: DEFAULT_BOUNDS, handle: 'se', to: { x: 100, y: 80 } },
      expected: { a: 1, d: 1, tx: 0, ty: 0 },
    });
  });
});

describe('options.fromAnchor 명시', () => {
  test('fromAnchor center 명시: center 기준 scale', () => {
    expectIntoSuccess({
      input: { bounds: DEFAULT_BOUNDS, handle: 'se', to: { x: 150, y: 120 } },
      options: { fromAnchor: 'center' },
      expected: { a: 1.5, d: 1.5 },
      fixedPoint: [50, 40],
    });
  });
});

describe('aspectLocked', () => {
  test.each([
    {
      name: 'se handle aspectLocked: min scale로 두 축 보정',
      input: { bounds: DEFAULT_BOUNDS, handle: 'se', to: { x: 150, y: 200 } },
      options: { aspectLocked: true },
      expected: { a: 1.5, d: 1.5 },
    },
    {
      name: 'nw handle aspectLocked: 음수 scale 부호 보존',
      input: { bounds: DEFAULT_BOUNDS, handle: 'nw', to: { x: 200, y: 120 } },
      options: { aspectLocked: true },
      expected: { a: -0.5, d: -0.5 },
      fixedPoint: [100, 80],
    },
    {
      name: 'e handle aspectLocked 무시: x축만 scale',
      input: { bounds: DEFAULT_BOUNDS, handle: 'e', to: { x: 150, y: 40 } },
      options: { aspectLocked: true },
      expected: { a: 1.5, d: 1 },
    },
  ] satisfies readonly TransformCase[])('$name', (testCase) => {
    expectIntoSuccess(testCase);
  });
});

describe('BoundsLike tuple 입력', () => {
  test('bounds tuple: se handle 정상 작동', () => {
    expectIntoSuccess({
      input: {
        bounds: [
          { x: 0, y: 0 },
          { x: 100, y: 80 },
        ],
        handle: 'se',
        to: [150, 120],
      },
      expected: { a: 1.5, d: 1.5 },
    });
  });
});

describe('companion transformFromHandles', () => {
  test('성공: MatrixLike object 반환', () => {
    const result = transformFromHandles({
      bounds: DEFAULT_BOUNDS,
      handle: 'se',
      to: { x: 150, y: 120 },
    });

    expect(result).toBeDefined();
    if (result === undefined) throw new Error('transformFromHandles returned undefined');
    expectMatrix(result, { a: 1.5, b: 0, c: 0, d: 1.5 });
  });

  test('실패 (zero-size): undefined 반환', () => {
    const result = transformFromHandles({
      bounds: { min: { x: 0, y: 0 }, max: { x: 0, y: 80 } },
      handle: 'e',
      to: { x: 50, y: 40 },
    });

    expect(result).toBeUndefined();
  });

  test('실패 (NaN): undefined 반환', () => {
    const result = transformFromHandles({
      bounds: DEFAULT_BOUNDS,
      handle: 'se',
      to: { x: Number.NaN, y: 120 },
    });

    expect(result).toBeUndefined();
  });

  test('options 전달: fromAnchor center', () => {
    const result = transformFromHandles(
      {
        bounds: DEFAULT_BOUNDS,
        handle: 'se',
        to: { x: 150, y: 120 },
      },
      { fromAnchor: 'center' }
    );

    expect(result).toBeDefined();
    if (result === undefined) throw new Error('transformFromHandles returned undefined');
    expectFixedPoint(result, [50, 40]);
  });
});
