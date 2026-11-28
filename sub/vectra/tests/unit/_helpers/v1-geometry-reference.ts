/** v1과 v2의 계산 결과를 비교하는 시험에서 옛 입력을 읽고 쓴다. */

import type { Point, PointWritable } from '../../../src/types/flat-shapes.internal';

export type XYInput = Point | readonly [number, number];
export type XYWritable = PointWritable | [number, number];
export type CircleLike = { readonly center: XYInput; readonly radius: number } | readonly [XYInput, number];
export type InfiniteLineLike = { readonly origin: XYInput; readonly direction: XYInput } | readonly [XYInput, XYInput];
export type PolygonLike = readonly XYInput[] | { readonly points: readonly XYInput[] };
export type RayLike =
  | { readonly origin: XYInput; readonly direction: XYInput }
  | readonly [number, number, number, number];
export type SegmentLike = { readonly a: XYInput; readonly b: XYInput } | readonly [XYInput, XYInput];

/** v1 Ray 입력이 배열인지 확인한다. */
function isRayTuple(ray: RayLike): ray is Extract<RayLike, readonly unknown[]> {
  return Array.isArray(ray);
}

/** ray input에서 origin point를 읽는다. */
export function readRayOrigin(ray: RayLike): XYInput {
  return isRayTuple(ray) ? [ray[0], ray[1]] : ray.origin;
}

/** ray input에서 direction vector를 읽는다. */
export function readRayDirection(ray: RayLike): XYInput {
  return isRayTuple(ray) ? [ray[2], ray[3]] : ray.direction;
}

/** v1 Circle 입력이 배열인지 확인한다. */
function isCircleTuple(circle: CircleLike): circle is Extract<CircleLike, readonly unknown[]> {
  return Array.isArray(circle);
}

/** circle input에서 중심점을 읽는다. */
export function readCircleCenter(circle: CircleLike): XYInput {
  return isCircleTuple(circle) ? circle[0] : circle.center;
}

/** circle input에서 반지름을 읽는다. */
export function readCircleRadius(circle: CircleLike): number {
  return isCircleTuple(circle) ? circle[1] : circle.radius;
}

/** input이 tuple 좌표이면 true를 반환한다. */
function isXYTuple(input: XYInput): input is readonly [number, number] {
  return Array.isArray(input);
}

/** out이 mutable tuple 좌표이면 true를 반환한다. */
function isXYTupleWritable(out: XYWritable): out is [number, number] {
  return Array.isArray(out);
}

/** v1 좌표에서 x를 읽는다. 배열은 인덱스로 읽는다. */
export function readX(input: XYInput): number {
  return isXYTuple(input) ? input[0] : input.x;
}

/** v1 좌표에서 y를 읽는다. 배열은 인덱스로 읽는다. */
export function readY(input: XYInput): number {
  return isXYTuple(input) ? input[1] : input.y;
}

/**
 * v1 출력에 x/y 좌표를 기록하고 out을 반환한다.
 *
 * mutable tuple output은 index 0/1에 쓰고, object output은 x/y field에 쓴다.
 *
 * @param out 좌표를 기록할 writable output
 * @param x 기록할 x 좌표
 * @param y 기록할 y 좌표
 */
export function writeXY<Out extends XYWritable>(out: Out, x: number, y: number): Out {
  if (isXYTupleWritable(out)) {
    out[0] = x;
    out[1] = y;
  } else {
    out.x = x;
    out.y = y;
  }

  return out;
}

/** v1 다각형 입력이 점 배열인지 확인한다. */
function isPolygonPointArray(polygon: PolygonLike): polygon is readonly XYInput[] {
  return Array.isArray(polygon);
}

/**
 * PolygonLike에서 single outer ring point array를 읽는다.
 *
 * array 자체를 넘긴 input은 그대로 사용하고, canonical object shape는 points field를 사용한다.
 *
 * @param polygon point array로 해석할 polygon input
 */
export function readPolygonPoints(polygon: PolygonLike): readonly XYInput[] {
  if (isPolygonPointArray(polygon)) return polygon;
  return polygon.points;
}

/** v1 InfiniteLine 입력이 배열인지 확인한다. */
function isInfiniteLineTuple(line: InfiniteLineLike): line is Extract<InfiniteLineLike, readonly unknown[]> {
  return Array.isArray(line);
}

/** infinite-line input에서 origin point를 읽는다. */
export function readInfiniteLineOrigin(line: InfiniteLineLike): XYInput {
  return isInfiniteLineTuple(line) ? line[0] : line.origin;
}

/** infinite-line input에서 direction vector를 읽는다. */
export function readInfiniteLineDirection(line: InfiniteLineLike): XYInput {
  return isInfiniteLineTuple(line) ? line[1] : line.direction;
}

/** v1 Segment 입력이 배열인지 확인한다. */
function isSegmentTuple(line: SegmentLike): line is Extract<SegmentLike, readonly unknown[]> {
  return Array.isArray(line);
}

/** segment input에서 시작 endpoint를 읽는다. */
export function readSegmentA(line: SegmentLike): XYInput {
  return isSegmentTuple(line) ? line[0] : line.a;
}

/** segment input에서 끝 endpoint를 읽는다. */
export function readSegmentB(line: SegmentLike): XYInput {
  return isSegmentTuple(line) ? line[1] : line.b;
}
