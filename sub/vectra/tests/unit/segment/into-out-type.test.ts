/** 선분 조회와 복사의 Into 함수가 외부 클래스의 인스턴스와 타입을 보존하는지 검증한다. */
import { expect, expectTypeOf, test } from 'vitest';
import { angle } from '../../../src/segment/angle';
import { boundsInto } from '../../../src/segment/bounds-into';
import { centerOnInto } from '../../../src/segment/center-on-into';
import { closestPointInto } from '../../../src/segment/closest-point-into';
import { copyInto } from '../../../src/segment/copy-into';
import { createSegment } from '../../../src/segment/create-segment';
import { endInto } from '../../../src/segment/end-into';
import { extendInto } from '../../../src/segment/extend-into';
import { fromAngleInto } from '../../../src/segment/from-angle-into';
import { fromCircleInto } from '../../../src/segment/from-circle-into';
import { fromMidpointAngleLengthInto } from '../../../src/segment/from-midpoint-angle-length-into';
import { fromNormalInto } from '../../../src/segment/from-normal-into';
import { fromPointVectorInto } from '../../../src/segment/from-point-vector-into';
import { markerInto } from '../../../src/segment/marker-into';
import { midpointInto } from '../../../src/segment/midpoint-into';
import { nearestPointOnSupportingLine } from '../../../src/segment/nearest-point-on-supporting-line';
import { nearestPointOnSupportingLineInto } from '../../../src/segment/nearest-point-on-supporting-line-into';
import { normalInto } from '../../../src/segment/normal-into';
import { pointAtLengthInto } from '../../../src/segment/point-at-length-into';
import { pointAtTInto } from '../../../src/segment/point-at-t-into';
import { projectPointInto } from '../../../src/segment/project-point-into';
import { reverseInto } from '../../../src/segment/reverse-into';
import { rotateAroundInto } from '../../../src/segment/rotate-around-into';
import { rotateInto } from '../../../src/segment/rotate-into';
import type { PointAtLengthOptions } from '../../../src/types';
import type { PointWritable, Segment, SegmentWritable } from '../../../src/types/flat-shapes.internal';

class OutputPoint {
  x = 0;
  y = 0;
  label = 'point';
}

class OutputSegment {
  x1 = 0;
  y1 = 0;
  x2 = 0;
  y2 = 0;
  label = 'segment';
}

class OutputBounds {
  minX = 0;
  minY = 0;
  maxX = 0;
  maxY = 0;
  label = 'bounds';
}

test('angle은 평평한 선분을 받는다', () => {
  expectTypeOf(angle).parameter(0).toEqualTypeOf<Segment>();
  const line = { x1: 0, y1: 0, x2: 0, y2: 4 };
  expect(angle(line)).toBe(Math.PI / 2);
});

test('boundsInto는 경계 상자 출력의 구체 타입과 참조를 보존한다', () => {
  const out = new OutputBounds();
  const result = boundsInto(out, { x1: 2, y1: 3, x2: 5, y2: 1 });

  expectTypeOf(result).toEqualTypeOf<OutputBounds>();
  expect(result).toBe(out);
  expect(out).toMatchObject({ minX: 2, minY: 1, maxX: 5, maxY: 3 });
});

test('copyInto와 centerOnInto는 선분 출력의 구체 타입과 참조를 보존한다', () => {
  const out = new OutputSegment();
  const line = { x1: 0, y1: 0, x2: 4, y2: 0 };
  const copied = copyInto(out, line);
  const centered = centerOnInto(out, out, { x: 2, y: 3 });

  expectTypeOf(copied).toEqualTypeOf<OutputSegment>();
  expectTypeOf(centered).toEqualTypeOf<OutputSegment>();
  expect(copied).toBe(out);
  expect(centered).toBe(out);
  expect(out).toMatchObject({ x1: 0, y1: 3, x2: 4, y2: 3 });
});

test('closestPointInto와 endInto는 점 출력의 구체 타입과 참조를 보존한다', () => {
  const out = new OutputPoint();
  const line = { x1: 1, y1: 2, x2: 3, y2: 4 };
  const closest = closestPointInto(out, line, { x: 1, y: 2 });
  expect(out).toMatchObject({ x: 1, y: 2 });
  const end = endInto(out, line);

  expectTypeOf(closest).toEqualTypeOf<OutputPoint>();
  expectTypeOf(end).toEqualTypeOf<OutputPoint>();
  expect(closest).toBe(out);
  expect(end).toBe(out);
  expect(out).toMatchObject({ x: 3, y: 4 });
});

test('createSegment는 두 끝점이 원점인 평평한 선분을 생성한다', () => {
  expectTypeOf(createSegment()).toEqualTypeOf<SegmentWritable>();
  expect(createSegment()).toEqual({ x1: 0, y1: 0, x2: 0, y2: 0 });
});

test('연장과 생성 함수는 선분 출력의 구체 타입과 참조를 보존한다', () => {
  const out = new OutputSegment();
  const line = { x1: 0, y1: 0, x2: 4, y2: 0 };
  const origin = { x: 1, y: 2 };
  const extended = extendInto(out, line, 1, 2);
  const fromAngle = fromAngleInto(out, origin, 0, 2);
  const fromCircle = fromCircleInto(out, { cx: 0, cy: 0, r: 2 });
  const fromMidpoint = fromMidpointAngleLengthInto(out, origin, 0, 2);
  const fromNormal = fromNormalInto(out, line, 0.5, 2);
  const fromVector = fromPointVectorInto(out, origin, { x: 2, y: 0 });

  expectTypeOf(extended).toEqualTypeOf<OutputSegment>();
  expectTypeOf(fromAngle).toEqualTypeOf<OutputSegment>();
  expectTypeOf(fromCircle).toEqualTypeOf<OutputSegment>();
  expectTypeOf(fromMidpoint).toEqualTypeOf<OutputSegment>();
  expectTypeOf(fromNormal).toEqualTypeOf<OutputSegment>();
  expectTypeOf(fromVector).toEqualTypeOf<OutputSegment>();
  for (const result of [extended, fromAngle, fromCircle, fromMidpoint, fromNormal, fromVector]) {
    expect(result).toBe(out);
  }
});

test('midpointInto는 점 출력의 구체 타입과 참조를 보존한다', () => {
  const out = new OutputPoint();
  const result = midpointInto(out, { x1: 0, y1: 0, x2: 4, y2: 6 });

  expectTypeOf(result).toEqualTypeOf<OutputPoint>();
  expect(result).toBe(out);
  expect(out).toMatchObject({ x: 2, y: 3 });
});

test('markerInto는 새 점을 추가하므로 원소 타입을 PointWritable로 고정한다', () => {
  const out: OutputPoint[] = [];
  const result = markerInto(out, { x1: 0, y1: 0, x2: 4, y2: 0 });

  expectTypeOf(result).toEqualTypeOf<PointWritable[]>();
  expect(result).toBe(out);
  expect(result).toHaveLength(3);
  expect(result[0]).not.toBeInstanceOf(OutputPoint);
});

test('nearestPointOnSupportingLine은 평평한 선분을 받는다', () => {
  expectTypeOf(nearestPointOnSupportingLine).parameter(0).toEqualTypeOf<Segment>();
});

test('거리 기반 위치 옵션은 clamp 필드를 요구한다', () => {
  expectTypeOf<PointAtLengthOptions>().toEqualTypeOf<{ clamp: boolean }>();
});

test('선분 위치와 투영 및 법선 Into는 점 출력의 구체 타입과 참조를 보존한다', () => {
  const out = new OutputPoint();
  const line = { x1: 1, y1: 2, x2: 5, y2: 2 };
  const point = { x: 3, y: 8 };
  const nearest = nearestPointOnSupportingLineInto(out, line, point);
  const normal = normalInto(out, line);
  const atLength = pointAtLengthInto(out, line, 2);
  const atT = pointAtTInto(out, line, 0.5);
  const projected = projectPointInto(out, line, point);

  expectTypeOf(nearest).toEqualTypeOf<OutputPoint>();
  expectTypeOf(normal).toEqualTypeOf<OutputPoint>();
  expectTypeOf(atLength).toEqualTypeOf<OutputPoint>();
  expectTypeOf(atT).toEqualTypeOf<OutputPoint>();
  expectTypeOf(projected).toEqualTypeOf<OutputPoint>();
  for (const result of [nearest, normal, atLength, atT, projected]) {
    expect(result).toBe(out);
  }
});

test('선분 반전과 회전 Into는 선분 출력의 구체 타입과 참조를 보존한다', () => {
  const out = new OutputSegment();
  const line = { x1: 1, y1: 2, x2: 5, y2: 2 };
  const reversed = reverseInto(out, line);
  const rotatedAround = rotateAroundInto(out, line, { x: 1, y: 1 }, Math.PI);
  const rotated = rotateInto(out, line, Math.PI);

  expectTypeOf(reversed).toEqualTypeOf<OutputSegment>();
  expectTypeOf(rotatedAround).toEqualTypeOf<OutputSegment>();
  expectTypeOf(rotated).toEqualTypeOf<OutputSegment>();
  for (const result of [reversed, rotatedAround, rotated]) {
    expect(result).toBe(out);
  }
});
