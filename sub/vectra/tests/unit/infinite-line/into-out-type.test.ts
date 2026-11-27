/** 무한 직선 Into의 외부 출력 타입과 참조 보존을 검증한다. */
import { expect, expectTypeOf, test } from 'vitest';
import {
  copyInto,
  directionInto,
  fromAngleInto,
  fromCoefficientsInto,
  fromNormalInto,
  fromPointsInto,
  fromSegmentInto,
  fromSlopeInto,
} from '../../../src/infinite-line';

/** 사용자 코드의 무한 직선 출력 클래스다. */
class ExternalLine {
  ox = 0;
  oy = 0;
  dx = 0;
  dy = 0;
  label = 'line';
}

/** 사용자 코드의 점 출력 클래스다. */
class ExternalPoint {
  x = 0;
  y = 0;
  label = 'point';
}

test('직선 생성 Into는 외부 직선 타입과 참조를 보존한다', () => {
  const out = new ExternalLine();
  const line = { ox: 1, oy: 2, dx: 3, dy: 4 };
  const point = { x: 1, y: 2 };
  const copyResult = copyInto(out, line);
  expectTypeOf(copyResult).toEqualTypeOf<ExternalLine>();
  expect(copyResult).toBe(out);
  const fromAngleResult = fromAngleInto(out, point, 0);
  expectTypeOf(fromAngleResult).toEqualTypeOf<ExternalLine>();
  expect(fromAngleResult).toBe(out);
  const fromCoefficientsResult = fromCoefficientsInto(out, 1, 2, 3);
  expectTypeOf(fromCoefficientsResult).toEqualTypeOf<ExternalLine>();
  expect(fromCoefficientsResult).toBe(out);
  const fromNormalResult = fromNormalInto(out, point, point);
  expectTypeOf(fromNormalResult).toEqualTypeOf<ExternalLine>();
  expect(fromNormalResult).toBe(out);
  const fromPointsResult = fromPointsInto(out, point, point);
  expectTypeOf(fromPointsResult).toEqualTypeOf<ExternalLine>();
  expect(fromPointsResult).toBe(out);
  const fromSegmentResult = fromSegmentInto(out, { x1: 1, y1: 2, x2: 3, y2: 4 });
  expectTypeOf(fromSegmentResult).toEqualTypeOf<ExternalLine>();
  expect(fromSegmentResult).toBe(out);
  const fromSlopeResult = fromSlopeInto(out, 1);
  expectTypeOf(fromSlopeResult).toEqualTypeOf<ExternalLine>();
  expect(fromSlopeResult).toBe(out);
});

test('방향 Into는 외부 점 타입과 참조를 보존한다', () => {
  const out = new ExternalPoint();
  const result = directionInto(out, { ox: 1, oy: 2, dx: 3, dy: 4 });
  expectTypeOf(result).toEqualTypeOf<ExternalPoint>();
  expect(result).toBe(out);
});
