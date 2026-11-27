/**
 * 평평한 입력 계약과 외부 클래스 출력 보존을 검증한다.
 */
import { expect, expectTypeOf, test } from 'vitest';
import { hexRound } from '../../../src/hex-grid/hex-round';
import { hexRoundInto } from '../../../src/hex-grid/hex-round-into';
import { hexNeighborInto } from '../../../src/hex-grid/hex-neighbor-into';
import { hexAxialToPixelInto } from '../../../src/hex-grid/hex-axial-to-pixel-into';
import { hexPixelToAxialInto } from '../../../src/hex-grid/hex-pixel-to-axial-into';
import { hexLineDrawInto } from '../../../src/hex-grid/hex-line-draw-into';
import { hexNeighborsInto } from '../../../src/hex-grid/hex-neighbors-into';
import { hexRingInto } from '../../../src/hex-grid/hex-ring-into';
import type { HexCube, HexLayout, HexAxialWritable } from '../../../src/types/flat-shapes.internal';

test('hexRound 입력은 평평한 객체다', () => {
  expectTypeOf(hexRound).parameter(0).toEqualTypeOf<HexCube>();
  expectTypeOf(hexLineDrawInto).parameter(1).toEqualTypeOf<HexCube>();
  expectTypeOf(hexAxialToPixelInto).parameter(2).toEqualTypeOf<HexLayout>();
  expectTypeOf(hexPixelToAxialInto).parameter(2).toEqualTypeOf<HexLayout>();
});

/** 출력의 구조적 하위 타입을 검증할 외부 객체. */
class ExternalAxial {
  q = 0;
  r = 0;
  tag = 'keep';
}

/** 출력의 구조적 하위 타입을 검증할 외부 객체. */
class ExternalPoint {
  x = 0;
  y = 0;
  tag = 'keep';
}

test('hexRoundInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalAxial();
  const result = hexRoundInto(out, { q: 0, r: 0, s: 0 });
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalAxial>();
});

test('hexNeighborInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalAxial();
  const result = hexNeighborInto(out, { q: 0, r: 0 }, 0);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalAxial>();
});

test('hexAxialToPixelInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalPoint();
  const result = hexAxialToPixelInto(out, { q: 0, r: 0 }, { originX: 0, originY: 0, size: 10, orientation: 'pointy' });
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalPoint>();
});

test('hexPixelToAxialInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalAxial();
  const result = hexPixelToAxialInto(out, { x: 0, y: 0 }, { originX: 0, originY: 0, size: 10, orientation: 'pointy' });
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalAxial>();
});

test('hexLineDrawInto은 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: HexAxialWritable[] = [];
  const result = hexLineDrawInto(out, { q: 0, r: 0, s: 0 }, { q: 0, r: 0, s: 0 });
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<HexAxialWritable[]>();
});

test('hexNeighborsInto은 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: HexAxialWritable[] = [];
  const result = hexNeighborsInto(out, { q: 0, r: 0 });
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<HexAxialWritable[]>();
});

test('hexRingInto은 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: HexAxialWritable[] = [];
  const result = hexRingInto(out, { q: 0, r: 0 }, 1);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<HexAxialWritable[]>();
});
