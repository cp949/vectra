/** polyline Into의 입력 타입과 외부 출력 객체의 참조·반환 타입을 검증한다. */
import { expect, expectTypeOf, test } from 'vitest';
import { boundsInto } from '../../../src/polyline/bounds-into';
import { pointAtLengthInto } from '../../../src/polyline/point-at-length-into';
import { cumulativeLengthsInto } from '../../../src/polyline/cumulative-lengths-into';
import { segmentLengthsInto } from '../../../src/polyline/segment-lengths-into';
import { tangentsInto } from '../../../src/polyline/tangents-into';
import { normalsInto } from '../../../src/polyline/normals-into';
import { sampleFixedCountInto } from '../../../src/polyline/sample-fixed-count-into';
import { sampleUniformInto } from '../../../src/polyline/sample-uniform-into';
import { sliceByLengthInto } from '../../../src/polyline/slice-by-length-into';
import type { PointWritable, Polyline } from '../../../src/types/flat-shapes.internal';

/** 호출자가 제공하는 bounds 클래스다. */
class ExternalBounds {
  minX = 0;
  minY = 0;
  maxX = 0;
  maxY = 0;
  tag = 'bounds';
}

test('boundsInto는 점 배열을 읽고 외부 bounds의 타입과 참조를 보존한다', () => {
  expectTypeOf(boundsInto).parameter(1).toEqualTypeOf<Polyline>();
  const out = new ExternalBounds();
  const result = boundsInto(out, [{ x: 1, y: 2 }]);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalBounds>();
});

test('pointAtLengthInto는 읽기 전용 점 배열을 받는다', () => {
  expectTypeOf(pointAtLengthInto).parameter(1).toEqualTypeOf<Polyline>();
});

test('cumulativeLengthsInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: number[] = [];
  const result = cumulativeLengthsInto(out, []);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<number[]>();
});

test('segmentLengthsInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: number[] = [];
  const result = segmentLengthsInto(out, []);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<number[]>();
});

test('tangentsInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PointWritable[] = [];
  const result = tangentsInto(out, []);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointWritable[]>();
});

test('normalsInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PointWritable[] = [];
  const result = normalsInto(out, []);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointWritable[]>();
});

test('sampleFixedCountInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PointWritable[] = [];
  const result = sampleFixedCountInto(out, [], 1);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointWritable[]>();
});

test('sampleUniformInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PointWritable[] = [];
  const result = sampleUniformInto(out, [], 1);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointWritable[]>();
});

test('sliceByLengthInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PointWritable[] = [];
  const result = sliceByLengthInto(out, [], 0, 1);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointWritable[]>();
});
