/**
 * vec 산술 함수의 좌표 계산을 이전 구현과 비트 단위로 비교한다.
 *
 * 대상: addInto/add, subInto/sub, scaleInto/scale, addScaledInto/addScaled, subtractScaledInto/subtractScaled,
 * dot, cross, length, lengthSq, distance, distanceSq, normalizeInto, reflectInto, reflectAcrossNormalInto.
 *
 * 점 객체 덧셈은 별도로 검증한다. 나머지 함수는 객체·tuple·외부 클래스와 out aliasing을 함께 검증한다.
 *
 * 정수·실수·큰 값·±0·NaN·±Infinity·zero vector 좌표에서 결과가 이전 구현과 `Object.is` 수준으로 같다.
 * 이전 구현은 공유 readX/readY/writeXY로 읽고 쓴다.
 * 이전 구현도 Euclidean 길이를 `hypot2`로 구한다. `hypot2` 자체의 정밀도는 `tests/unit/internal/hypot2.test.ts`가 고정한다.
 */
import { describe, expect, test } from 'vitest';
import { add } from '../../../src/vec/add';
import { addInto } from '../../../src/vec/add-into';
import { addScaled } from '../../../src/vec/add-scaled';
import { addScaledInto } from '../../../src/vec/add-scaled-into';
import { cross } from '../../../src/vec/cross';
import { distance } from '../../../src/vec/distance';
import { distanceSq } from '../../../src/vec/distance-sq';
import { dot } from '../../../src/vec/dot';
import { length } from '../../../src/vec/length';
import { lengthSq } from '../../../src/vec/length-sq';
import { normalizeInto } from '../../../src/vec/normalize-into';
import { reflectAcrossNormalInto } from '../../../src/vec/reflect-across-normal-into';
import { reflectInto } from '../../../src/vec/reflect-into';
import { scale } from '../../../src/vec/scale';
import { scaleInto } from '../../../src/vec/scale-into';
import { sub } from '../../../src/vec/sub';
import { subInto } from '../../../src/vec/sub-into';
import { subtractScaled } from '../../../src/vec/subtract-scaled';
import { subtractScaledInto } from '../../../src/vec/subtract-scaled-into';
import { hypot2 } from '../../../src/internal/numeric';
import { readX, readY, writeXY } from '../../../src/internal/xy';
import { createRng } from '../../../src/random/create-rng';
import type { XYInput, XYObjectWritable, XYWritable } from '../../../src/types';

// 이전 구현. 공유 readX/readY/writeXY를 그대로 쓴다. 새 구현의 비교 기준으로만 쓴다.

const ref = {
  addInto: (out: XYWritable, a: XYInput, b: XYInput) => writeXY(out, readX(a) + readX(b), readY(a) + readY(b)),
  subInto: (out: XYWritable, a: XYInput, b: XYInput) => writeXY(out, readX(a) - readX(b), readY(a) - readY(b)),
  scaleInto: (out: XYWritable, input: XYInput, s: number) => writeXY(out, readX(input) * s, readY(input) * s),
  addScaledInto: (out: XYWritable, a: XYInput, b: XYInput, s: number) => {
    const ax = readX(a);
    const ay = readY(a);
    const bx = readX(b);
    const by = readY(b);
    return writeXY(out, ax + bx * s, ay + by * s);
  },
  subtractScaledInto: (out: XYWritable, a: XYInput, b: XYInput, s: number) => {
    const ax = readX(a);
    const ay = readY(a);
    const bx = readX(b);
    const by = readY(b);
    return writeXY(out, ax - bx * s, ay - by * s);
  },
  normalizeInto: (out: XYWritable, input: XYInput) => {
    const x = readX(input);
    const y = readY(input);
    const len = hypot2(x, y);
    return len === 0 ? writeXY(out, 0, 0) : writeXY(out, x / len, y / len);
  },
  reflectInto: (out: XYWritable, vector: XYInput, normal: XYInput) => {
    const vx = readX(vector);
    const vy = readY(vector);
    const nx = readX(normal);
    const ny = readY(normal);
    const lsq = nx * nx + ny * ny;
    if (lsq === 0) return writeXY(out, vx, vy);
    const k = (2 * (vx * nx + vy * ny)) / lsq;
    return writeXY(out, vx - k * nx, vy - k * ny);
  },
  reflectAcrossNormalInto: (out: XYWritable, vector: XYInput, normal: XYInput) => {
    const vx = readX(vector);
    const vy = readY(vector);
    const nx = readX(normal);
    const ny = readY(normal);
    const dot2 = 2 * (vx * nx + vy * ny);
    return writeXY(out, vx - dot2 * nx, vy - dot2 * ny);
  },
  dot: (a: XYInput, b: XYInput) => readX(a) * readX(b) + readY(a) * readY(b),
  cross: (a: XYInput, b: XYInput) => readX(a) * readY(b) - readY(a) * readX(b),
  length: (a: XYInput) => hypot2(readX(a), readY(a)),
  lengthSq: (a: XYInput) => {
    const x = readX(a);
    const y = readY(a);
    return x * x + y * y;
  },
  distance: (a: XYInput, b: XYInput) => hypot2(readX(b) - readX(a), readY(b) - readY(a)),
  distanceSq: (a: XYInput, b: XYInput) => {
    const dx = readX(b) - readX(a);
    const dy = readY(b) - readY(a);
    return dx * dx + dy * dy;
  },
};

class Point2 {
  constructor(
    readonly x: number,
    readonly y: number
  ) {}
}

type Rng = () => number;

const SPECIAL = [0, -0, 1, -1, 1e-300, 1e150, -1e150, 1e308, -1e308, NaN, Infinity, -Infinity, 0.5, -0.5];

function pick<T>(rng: Rng, list: readonly T[]): T {
  return list[Math.floor(rng() * list.length)];
}

function coord(rng: Rng): number {
  const r = rng();
  if (r < 0.12) return pick(rng, SPECIAL);
  if (r < 0.5) return Math.floor(rng() * 9) - 4;
  return (rng() - 0.5) * 20;
}

/** 입력 한 개의 명세. 같은 명세로 이전 구현과 새 구현이 쓸 입력을 따로 만든다. */
interface VecSpec {
  form: number;
  x: number;
  y: number;
}

/** 0=객체 1=tuple 2=class 3=x/y field를 가진 tuple(tuple로 읽혀야 한다) 4=객체(추가 field) */
function makeVec(spec: VecSpec): XYInput {
  switch (spec.form) {
    case 0:
      return { x: spec.x, y: spec.y };
    case 1:
      return [spec.x, spec.y];
    case 2:
      return new Point2(spec.x, spec.y);
    case 3: {
      const tuple = [spec.x, spec.y] as unknown as { x: number; y: number } & [number, number];
      tuple.x = 7;
      tuple.y = 8;
      return tuple;
    }
    default:
      return { x: spec.x, y: spec.y, extra: 1 } as XYInput;
  }
}

function makeSpec(rng: Rng, objectBias: number): VecSpec {
  const form = rng() < objectBias ? (rng() < 0.7 ? 0 : 2) : Math.floor(rng() * 5);
  return { form, x: coord(rng), y: coord(rng) };
}

/** out의 모양. 0=객체 1=tuple 2=입력 a와 같은 값(aliasing) 3=입력 b와 같은 값(aliasing) */
function makeOut(kind: number, a: VecSpec, b: VecSpec): XYWritable {
  if (kind === 1) return [9, 9];
  if (kind === 2) return a.form === 1 ? [a.x, a.y] : ({ x: a.x, y: a.y } as XYObjectWritable);
  if (kind === 3) return b.form === 1 ? [b.x, b.y] : ({ x: b.x, y: b.y } as XYObjectWritable);
  return { x: 9, y: 9 };
}

function snapshot(v: XYWritable | XYInput): [number, number] {
  return Array.isArray(v) ? [v[0], v[1]] : [(v as XYObjectWritable).x, (v as XYObjectWritable).y];
}

function same(a: number, b: number): boolean {
  return Object.is(a, b);
}

const N = 120_000;

describe('vec 산술 함수 — 이전 구현과 비트 단위 동일성', () => {
  test(`무작위 ${N}건: 점 객체 덧셈 Into와 companion이 이전 구현과 같다`, () => {
    const rng = createRng(20260105);
    for (let i = 0; i < N; i++) {
      const a = { x: coord(rng), y: coord(rng) };
      const b = { x: coord(rng), y: coord(rng) };
      const scalar = coord(rng);
      const expected = ref.addInto({ x: 0, y: 0 }, a, b);
      const expectedScaled = ref.addScaledInto({ x: 0, y: 0 }, a, b, scalar);
      const out = i % 2 === 0 ? { ...a } : { ...b };
      const inputA = i % 2 === 0 ? out : a;
      const inputB = i % 2 === 0 ? b : out;
      const actual = add(a, b);
      const actualScaled = addScaled(a, b, scalar);
      const useScaled = i % 3 !== 0;
      const result = useScaled ? addScaledInto(out, inputA, inputB, scalar) : addInto(out, inputA, inputB);
      const expectedOut = useScaled ? expectedScaled : expected;
      const [expectedX, expectedY] = snapshot(expected);
      const [expectedScaledX, expectedScaledY] = snapshot(expectedScaled);
      const [expectedOutX, expectedOutY] = snapshot(expectedOut);
      if (
        !same(actual.x, expectedX) ||
        !same(actual.y, expectedY) ||
        !same(actualScaled.x, expectedScaledX) ||
        !same(actualScaled.y, expectedScaledY) ||
        result !== out ||
        !same(out.x, expectedOutX) ||
        !same(out.y, expectedOutY)
      ) {
        throw new Error(`점 객체 덧셈 불일치: 반복 ${i}`);
      }
    }
  });

  test(`무작위 ${N}건: 두 벡터를 받는 Into 함수가 이전 구현과 같다`, () => {
    const rng = createRng(20260101);
    const fns: Array<
      [
        string,
        (out: XYWritable, a: XYInput, b: XYInput, s: number) => XYWritable,
        (out: XYWritable, a: XYInput, b: XYInput, s: number) => XYWritable,
      ]
    > = [
      ['subInto', (o, a, b) => subInto(o, a, b), (o, a, b) => ref.subInto(o, a, b)],
      ['subtractScaledInto', subtractScaledInto, ref.subtractScaledInto],
      ['reflectInto', (o, a, b) => reflectInto(o, a, b), (o, a, b) => ref.reflectInto(o, a, b)],
      [
        'reflectAcrossNormalInto',
        (o, a, b) => reflectAcrossNormalInto(o, a, b),
        (o, a, b) => ref.reflectAcrossNormalInto(o, a, b),
      ],
    ];
    for (let i = 0; i < N; i++) {
      const bias = i % 3 === 0 ? 1 : 0.3;
      const aSpec = makeSpec(rng, bias);
      const bSpec = makeSpec(rng, bias);
      const outKind = Math.floor(rng() * 4);
      const s = coord(rng);
      const [name, fn, reference] = fns[i % fns.length];
      const expectedOut = makeOut(outKind, aSpec, bSpec);
      const actualOut = makeOut(outKind, aSpec, bSpec);
      const expectedResult = reference(expectedOut, makeVec(aSpec), makeVec(bSpec), s);
      const actualResult = fn(actualOut, makeVec(aSpec), makeVec(bSpec), s);
      expect(actualResult).toBe(actualOut);
      expect(Array.isArray(actualOut)).toBe(Array.isArray(expectedOut));
      const [ex, ey] = snapshot(expectedResult);
      const [ax, ay] = snapshot(actualResult);
      if (!same(ex, ax) || !same(ey, ay)) {
        throw new Error(
          `${name} 불일치: a=${JSON.stringify(aSpec)} b=${JSON.stringify(bSpec)} out=${outKind} s=${s} 기대=(${ex}, ${ey}) 실제=(${ax}, ${ay})`
        );
      }
    }
  });

  test(`무작위 ${N}건: 한 벡터를 받는 Into 함수가 이전 구현과 같다`, () => {
    const rng = createRng(20260102);
    for (let i = 0; i < N; i++) {
      const aSpec = makeSpec(rng, i % 3 === 0 ? 1 : 0.3);
      const outKind = Math.floor(rng() * 3);
      const s = coord(rng);
      const useScale = i % 2 === 0;
      const expectedOut = makeOut(outKind, aSpec, aSpec);
      const actualOut = makeOut(outKind, aSpec, aSpec);
      const expectedResult = useScale
        ? ref.scaleInto(expectedOut, makeVec(aSpec), s)
        : ref.normalizeInto(expectedOut, makeVec(aSpec));
      const actualResult = useScale
        ? scaleInto(actualOut, makeVec(aSpec), s)
        : normalizeInto(actualOut, makeVec(aSpec));
      expect(actualResult).toBe(actualOut);
      const [ex, ey] = snapshot(expectedResult);
      const [ax, ay] = snapshot(actualResult);
      if (!same(ex, ax) || !same(ey, ay)) {
        throw new Error(
          `${useScale ? 'scaleInto' : 'normalizeInto'} 불일치: a=${JSON.stringify(aSpec)} out=${outKind} s=${s} 기대=(${ex}, ${ey}) 실제=(${ax}, ${ay})`
        );
      }
    }
  });

  test(`무작위 ${N}건: 새 object를 반환하는 companion이 이전 구현과 같다`, () => {
    const rng = createRng(20260103);
    for (let i = 0; i < N; i++) {
      const aSpec = makeSpec(rng, i % 3 === 0 ? 1 : 0.3);
      const bSpec = makeSpec(rng, i % 3 === 0 ? 1 : 0.3);
      const s = coord(rng);
      const cases: Array<[string, XYObjectWritable, XYWritable]> = [
        ['sub', sub(makeVec(aSpec), makeVec(bSpec)), ref.subInto({ x: 0, y: 0 }, makeVec(aSpec), makeVec(bSpec))],
        ['scale', scale(makeVec(aSpec), s), ref.scaleInto({ x: 0, y: 0 }, makeVec(aSpec), s)],
        [
          'subtractScaled',
          subtractScaled(makeVec(aSpec), makeVec(bSpec), s),
          ref.subtractScaledInto({ x: 0, y: 0 }, makeVec(aSpec), makeVec(bSpec), s),
        ],
      ];
      for (const [name, actual, expected] of cases) {
        const [ex, ey] = snapshot(expected);
        if (Array.isArray(actual) || !same(ex, actual.x) || !same(ey, actual.y)) {
          throw new Error(
            `${name} 불일치: a=${JSON.stringify(aSpec)} b=${JSON.stringify(bSpec)} s=${s} 기대=(${ex}, ${ey}) 실제=(${actual.x}, ${actual.y})`
          );
        }
      }
    }
  });

  test(`무작위 ${N}건: 숫자를 반환하는 함수가 이전 구현과 같다`, () => {
    const rng = createRng(20260104);
    for (let i = 0; i < N; i++) {
      const aSpec = makeSpec(rng, i % 3 === 0 ? 1 : 0.3);
      const bSpec = makeSpec(rng, i % 3 === 0 ? 1 : 0.3);
      const a = { x: aSpec.x, y: aSpec.y };
      const b = { x: bSpec.x, y: bSpec.y };
      const cases: Array<[string, number, number]> = [
        ['dot', dot(a, b), ref.dot(a, b)],
        ['cross', cross(a, b), ref.cross(a, b)],
        ['length', length(a), ref.length(a)],
        ['lengthSq', lengthSq(a), ref.lengthSq(a)],
        ['distance', distance(a, b), ref.distance(a, b)],
        ['distanceSq', distanceSq(a, b), ref.distanceSq(a, b)],
      ];
      for (const [name, actual, expected] of cases) {
        if (!same(expected, actual)) {
          throw new Error(
            `${name} 불일치: a=${JSON.stringify(aSpec)} b=${JSON.stringify(bSpec)} 기대=${expected} 실제=${actual}`
          );
        }
      }
    }
  });

  test('out이 입력과 같은 object여도 결과가 같다', () => {
    const v = { x: 1, y: 2 };
    expect(addScaledInto(v, v, v, 2)).toBe(v);
    expect(v).toEqual({ x: 3, y: 6 });
    const t: [number, number] = [1, 2];
    subInto(t, t, [0.5, 0.5]);
    expect(t).toEqual([0.5, 1.5]);
  });
});
