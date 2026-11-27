/** 타원 Into 함수가 외부 출력 객체의 구체 타입과 참조를 보존하는지 검증한다. */
import { expect, expectTypeOf, test } from 'vitest';
import { boundsInto, closestPointInto, copyInto, expandByInto, fociInto } from '../../../src/ellipse';

class ExternalBounds {
  minX = 0;
  minY = 0;
  maxX = 0;
  maxY = 0;
  label = 'bounds';
}

class ExternalPoint {
  x = 0;
  y = 0;
  label = 'point';
}

class ExternalEllipse {
  cx = 0;
  cy = 0;
  rx = 0;
  ry = 0;
  label = 'ellipse';
}

class ExternalSegment {
  x1 = 0;
  y1 = 0;
  x2 = 0;
  y2 = 0;
  label = 'segment';
}

const ellipse = { cx: 1, cy: 2, rx: 5, ry: 3 };

test('boundsInto는 외부 bounds 타입과 참조를 보존한다', () => {
  const out = new ExternalBounds();
  const result = boundsInto(out, ellipse);
  expectTypeOf(result).toEqualTypeOf<ExternalBounds>();
  expect(result).toBe(out);
});

test('closestPointInto는 외부 점 타입과 참조를 보존한다', () => {
  const out = new ExternalPoint();
  const result = closestPointInto(out, ellipse, { x: 10, y: 2 });
  expectTypeOf(result).toEqualTypeOf<ExternalPoint>();
  expect(result).toBe(out);
});

test('copyInto는 외부 타원 타입과 참조를 보존한다', () => {
  const out = new ExternalEllipse();
  const result = copyInto(out, ellipse);
  expectTypeOf(result).toEqualTypeOf<ExternalEllipse>();
  expect(result).toBe(out);
});

test('expandByInto는 외부 타원 타입과 참조를 보존한다', () => {
  const out = new ExternalEllipse();
  const result = expandByInto(out, ellipse, 1);
  expectTypeOf(result).toEqualTypeOf<ExternalEllipse>();
  expect(result).toBe(out);
});

test('fociInto는 외부 선분 타입과 참조를 보존한다', () => {
  const out = new ExternalSegment();
  const result = fociInto(out, ellipse);
  expectTypeOf(result).toEqualTypeOf<ExternalSegment>();
  expect(result).toBe(out);
});
