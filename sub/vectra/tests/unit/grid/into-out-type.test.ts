/**
 * 평평한 입력 계약과 외부 클래스 출력 보존을 검증한다.
 */
import { expect, expectTypeOf, test } from 'vitest';
import { gridCell } from '../../../src/grid/grid-cell';
import { gridCellInto } from '../../../src/grid/grid-cell-into';
import { gridCellCenterInto } from '../../../src/grid/grid-cell-center-into';
import { gridCellBoundsInto } from '../../../src/grid/grid-cell-bounds-into';
import { gridSnapInto } from '../../../src/grid/grid-snap-into';
import { gridCoordinatesInto } from '../../../src/grid/grid-coordinates-into';
import { boundsSplitGridInto } from '../../../src/grid/bounds-split-grid-into';
import { boundsTileInto } from '../../../src/grid/bounds-tile-into';
import { gridCellsInRectInto } from '../../../src/grid/grid-cells-in-rect-into';
import { gridLineInto } from '../../../src/grid/grid-line-into';
import { gridNeighbors4Into } from '../../../src/grid/grid-neighbors-4-into';
import { gridNeighbors8Into } from '../../../src/grid/grid-neighbors-8-into';
import type { Point, GridSpec, RectWritable, GridCellWritable } from '../../../src/types/flat-shapes.internal';

const spec = { originX: 0, originY: 0, cellWidth: 10, cellHeight: 10 };

test('gridCell 입력은 평평한 객체다', () => {
  expectTypeOf(gridCell).parameter(0).toEqualTypeOf<Point>();
  expectTypeOf(gridCell).parameter(1).toEqualTypeOf<GridSpec>();
});

/** 출력의 구조적 하위 타입을 검증할 외부 객체. */
class ExternalCell {
  col = 0;
  row = 0;
  tag = 'keep';
}

/** 출력의 구조적 하위 타입을 검증할 외부 객체. */
class ExternalPoint {
  x = 0;
  y = 0;
  tag = 'keep';
}

/** 출력의 구조적 하위 타입을 검증할 외부 객체. */
class ExternalRect {
  x = 0;
  y = 0;
  width = 0;
  height = 0;
  tag = 'keep';
}

test('gridCellInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalCell();
  const result = gridCellInto(out, { x: 0, y: 0 }, spec);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalCell>();
});

test('gridCellCenterInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalPoint();
  const result = gridCellCenterInto(out, { col: 0, row: 0 }, spec);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalPoint>();
});

test('gridCellBoundsInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalRect();
  const result = gridCellBoundsInto(out, { col: 0, row: 0 }, spec);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalRect>();
});

test('gridSnapInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalPoint();
  const result = gridSnapInto(out, { x: 0, y: 0 }, spec);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalPoint>();
});

test('gridCoordinatesInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalCell();
  const result = gridCoordinatesInto(out, 0, 1);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalCell>();
});

test('boundsSplitGridInto은 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: RectWritable[] = [];
  const result = boundsSplitGridInto(out, { minX: 0, minY: 0, maxX: 10, maxY: 10 }, 1, 1);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<RectWritable[]>();
});

test('boundsTileInto은 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: RectWritable[] = [];
  const result = boundsTileInto(out, { minX: 0, minY: 0, maxX: 10, maxY: 10 }, { x: 10, y: 10 });
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<RectWritable[]>();
});

test('gridCellsInRectInto은 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: GridCellWritable[] = [];
  const result = gridCellsInRectInto(out, { x: 0, y: 0, width: 10, height: 10 }, spec);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<GridCellWritable[]>();
});

test('gridLineInto은 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: GridCellWritable[] = [];
  const result = gridLineInto(out, { col: 0, row: 0 }, { col: 1, row: 1 });
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<GridCellWritable[]>();
});

test('gridNeighbors4Into은 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: GridCellWritable[] = [];
  const result = gridNeighbors4Into(out, { col: 0, row: 0 });
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<GridCellWritable[]>();
});

test('gridNeighbors8Into은 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: GridCellWritable[] = [];
  const result = gridNeighbors8Into(out, { col: 0, row: 0 });
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<GridCellWritable[]>();
});
