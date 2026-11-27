/** 경로 함수의 평평한 입출력 계약을 검증한다. */
import { expect, expectTypeOf, test } from 'vitest';
import { arcByEndpointCommandsInto } from '../../../src/path/arc-by-endpoint-commands-into';
import { boundsInto } from '../../../src/path/bounds-into';
import { subpathBoundsInto } from '../../../src/path/subpath-bounds-into';
import { arcThroughCommandsInto } from '../../../src/path/arc-through-commands-into';
import { circleCommandsInto } from '../../../src/path/circle-commands-into';
import { ellipseCommandsInto } from '../../../src/path/ellipse-commands-into';
import { fromEllipseInto } from '../../../src/path/from-ellipse-into';
import { lineCommandsInto } from '../../../src/path/line-commands-into';
import { segmentCommandsInto } from '../../../src/path/segment-commands-into';
import { cubicThroughCommandsInto } from '../../../src/path/cubic-through-commands-into';
import { flattenInto } from '../../../src/path/flatten-into';
import type { PathCommand } from '../../../src/types';
import type { Point, PointWritable } from '../../../src/types/flat-shapes.internal';

test('시작점을 점 객체로 받는다', () => {
  expectTypeOf(arcByEndpointCommandsInto).parameter(1).toEqualTypeOf<Point>();
});

/** 출력의 구조적 하위 타입을 검증할 외부 객체. */
class ExternalBounds {
  minX = 0;
  minY = 0;
  maxX = 0;
  maxY = 0;
  tag = 'keep';
}

test('boundsInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalBounds();
  const result = boundsInto(out, []);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalBounds>();
});

test('subpathBoundsInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalBounds();
  const result = subpathBoundsInto(out, [], 0);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalBounds>();
});

test('arcByEndpointCommandsInto은 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PathCommand[] = [];
  const result = arcByEndpointCommandsInto(
    out,
    { x: 0, y: 0 },
    { kind: 'arc', rx: 2, ry: 2, xRotation: 0, largeArc: false, sweep: true, x: 2, y: 2 }
  );
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PathCommand[]>();
});

test('arcThroughCommandsInto은 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PathCommand[] = [];
  const result = arcThroughCommandsInto(out, { x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 0 });
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PathCommand[]>();
});

test('circleCommandsInto은 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PathCommand[] = [];
  const result = circleCommandsInto(out, { cx: 0, cy: 0, r: 1 });
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PathCommand[]>();
});

test('ellipseCommandsInto은 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PathCommand[] = [];
  const result = ellipseCommandsInto(out, { cx: 0, cy: 0, rx: 2, ry: 1 });
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PathCommand[]>();
});

test('fromEllipseInto은 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PathCommand[] = [];
  const result = fromEllipseInto(out, { cx: 0, cy: 0, rx: 2, ry: 1 });
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PathCommand[]>();
});

test('lineCommandsInto은 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PathCommand[] = [];
  const result = lineCommandsInto(out, { x: 0, y: 0 }, { x: 1, y: 1 });
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PathCommand[]>();
});

test('segmentCommandsInto은 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PathCommand[] = [];
  const result = segmentCommandsInto(out, { x1: 0, y1: 0, x2: 1, y2: 1 });
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PathCommand[]>();
});

test('cubicThroughCommandsInto은 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PathCommand[] = [];
  const result = cubicThroughCommandsInto(out, { x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 0 });
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PathCommand[]>();
});

test('flattenInto은 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PointWritable[] = [];
  const result = flattenInto(out, []);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointWritable[]>();
});
