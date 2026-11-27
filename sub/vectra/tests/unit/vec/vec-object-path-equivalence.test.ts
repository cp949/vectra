/**
 * vec 산술 함수의 좌표 계산을 이전 구현과 비트 단위로 비교한다.
 *
 * 대상: addInto/add, subInto/sub, scaleInto/scale, addScaledInto/addScaled, subtractScaledInto/subtractScaled,
 * dot, cross, length, lengthSq, distance, distanceSq, normalizeInto, reflectInto, reflectAcrossNormalInto.
 *
 * 점 객체 및 외부 클래스 입력의 계산 결과와 out aliasing을 검증한다.
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
import type { PointWritable } from '../../../src/types/flat-shapes.internal';
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

/** 좌표를 갱신할 수 있는 외부 점 클래스. */
class Point2 {
  constructor(
    public x: number,
    public y: number
  ) {}
}

type Rng = () => number;

const SPECIAL = [0, -0, 1, -1, 1e-300, 1e150, -1e150, 1e308, -1e308, NaN, Infinity, -Infinity, 0.5, -0.5];

/** 난수로 목록의 원소를 고른다. */
function pick<T>(rng: Rng, list: readonly T[]): T {
  return list[Math.floor(rng() * list.length)];
}

/** 경곗값, 작은 정수, 실수를 섞어 좌표를 만든다. */
function coord(rng: Rng): number {
  const r = rng();
  if (r < 0.12) return pick(rng, SPECIAL);
  if (r < 0.5) return Math.floor(rng() * 9) - 4;
  return (rng() - 0.5) * 20;
}

/** 일반 객체, 외부 클래스, 추가 필드가 있는 객체를 섞어 만든다. */
function makePoint(rng: Rng): PointWritable {
  const x = coord(rng);
  const y = coord(rng);
  const form = Math.floor(rng() * 3);
  if (form === 0) return new Point2(x, y);
  if (form === 1) {
    const point = { x, y, extra: 1 };
    return point;
  }
  return { x, y };
}

/** 이전 구현이 반환한 좌표를 비교용 쌍으로 읽는다. */
function snapshot(v: XYWritable | XYInput): [number, number] {
  return Array.isArray(v) ? [v[0], v[1]] : [(v as XYObjectWritable).x, (v as XYObjectWritable).y];
}

/** NaN과 음의 영을 구분하는 좌표 비교를 수행한다. */
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
    for (let i = 0; i < N; i++) {
      const a = makePoint(rng);
      const b = makePoint(rng);
      const scalar = coord(rng);
      const useScaled = i % 2 === 0;
      const reference = useScaled ? ref.subtractScaledInto : ref.subInto;
      const [expectedX, expectedY] = snapshot(reference({ x: 0, y: 0 }, a, b, scalar));
      const out = i % 3 === 0 ? a : i % 3 === 1 ? b : { x: 9, y: 9 };
      const result = useScaled ? subtractScaledInto(out, a, b, scalar) : subInto(out, a, b);
      if (result !== out || !same(expectedX, out.x) || !same(expectedY, out.y)) {
        throw new Error(`점 객체 뺄셈 불일치: 반복 ${i}`);
      }
    }
  });

  test(`무작위 ${N}건: 점 객체 반사 함수가 이전 구현과 같다`, () => {
    const rng = createRng(20260106);
    for (let i = 0; i < N; i++) {
      const a = { x: coord(rng), y: coord(rng) };
      const b = { x: coord(rng), y: coord(rng) };
      const useUnitNormal = i % 2 === 0;
      const reference = useUnitNormal ? ref.reflectAcrossNormalInto : ref.reflectInto;
      const reflect = useUnitNormal ? reflectAcrossNormalInto : reflectInto;
      const [expectedX, expectedY] = snapshot(reference({ x: 0, y: 0 }, a, b));
      const out = i % 3 === 0 ? a : i % 3 === 1 ? b : { x: 0, y: 0 };
      const result = reflect(out, a, b);
      if (result !== out || !same(expectedX, out.x) || !same(expectedY, out.y)) {
        throw new Error(`점 객체 반사 불일치: 반복 ${i}`);
      }
    }
  });

  test(`무작위 ${N}건: 한 벡터를 받는 Into 함수가 이전 구현과 같다`, () => {
    const rng = createRng(20260102);
    for (let i = 0; i < N; i++) {
      const outKind = Math.floor(rng() * 3);
      const s = coord(rng);
      const useScale = i % 2 === 0;
      const a = makePoint(rng);
      const actualOut = outKind === 2 ? a : { x: 0, y: 0 };
      const expectedOut = { x: 0, y: 0 };
      const expectedResult = useScale ? ref.scaleInto(expectedOut, a, s) : ref.normalizeInto(expectedOut, a);
      const actualResult = useScale ? scaleInto(actualOut, a, s) : normalizeInto(actualOut, a);
      expect(actualResult).toBe(actualOut);
      const [ex, ey] = snapshot(expectedResult);
      const [ax, ay] = snapshot(actualResult);
      if (!same(ex, ax) || !same(ey, ay)) {
        throw new Error(
          `${useScale ? 'scaleInto' : 'normalizeInto'} 불일치: a=${JSON.stringify(a)} out=${outKind} s=${s} 기대=(${ex}, ${ey}) 실제=(${ax}, ${ay})`
        );
      }
    }
  });

  test(`무작위 ${N}건: 새 object를 반환하는 companion이 이전 구현과 같다`, () => {
    const rng = createRng(20260103);
    for (let i = 0; i < N; i++) {
      const s = coord(rng);
      const a = makePoint(rng);
      const b = makePoint(rng);
      const cases: Array<[string, XYObjectWritable, XYWritable]> = [
        ['sub', sub(a, b), ref.subInto({ x: 0, y: 0 }, a, b)],
        ['scale', scale(a, s), ref.scaleInto({ x: 0, y: 0 }, a, s)],
        ['subtractScaled', subtractScaled(a, b, s), ref.subtractScaledInto({ x: 0, y: 0 }, a, b, s)],
      ];
      for (const [name, actual, expected] of cases) {
        const [ex, ey] = snapshot(expected);
        if (Array.isArray(actual) || !same(ex, actual.x) || !same(ey, actual.y)) {
          throw new Error(
            `${name} 불일치: a=${JSON.stringify(a)} b=${JSON.stringify(b)} s=${s} 기대=(${ex}, ${ey}) 실제=(${actual.x}, ${actual.y})`
          );
        }
      }
    }
  });

  test(`무작위 ${N}건: 숫자를 반환하는 함수가 이전 구현과 같다`, () => {
    const rng = createRng(20260104);
    for (let i = 0; i < N; i++) {
      const a = makePoint(rng);
      const b = makePoint(rng);
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
            `${name} 불일치: a=${JSON.stringify(a)} b=${JSON.stringify(b)} 기대=${expected} 실제=${actual}`
          );
        }
      }
    }
  });

  test('out이 입력과 같은 object여도 결과가 같다', () => {
    const v = { x: 1, y: 2 };
    expect(addScaledInto(v, v, v, 2)).toBe(v);
    expect(v).toEqual({ x: 3, y: 6 });
    const point = { x: 1, y: 2 };
    subInto(point, point, { x: 0.5, y: 0.5 });
    expect(point).toEqual({ x: 0.5, y: 1.5 });
  });
});
