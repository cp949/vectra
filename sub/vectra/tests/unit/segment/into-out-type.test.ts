/** 선분 조회와 복사의 Into 함수가 외부 클래스의 인스턴스와 타입을 보존하는지 검증한다. */
import { expect, expectTypeOf, test } from 'vitest';
import { angle } from '../../../src/segment/angle';
import { boundsInto } from '../../../src/segment/bounds-into';
import { centerOnInto } from '../../../src/segment/center-on-into';
import { closestPointInto } from '../../../src/segment/closest-point-into';
import { copyInto } from '../../../src/segment/copy-into';
import { endInto } from '../../../src/segment/end-into';
import type { Segment } from '../../../src/types/flat-shapes.internal';

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
