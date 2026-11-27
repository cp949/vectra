/**
 * 행렬 Into 함수의 평평한 입력과 외부 클래스 출력의 타입 보존을 검증한다.
 */
import { expect, expectTypeOf, test } from 'vitest';
import { copyInto } from '../../../src/matrix/copy-into';
import { appendRotateInto } from '../../../src/matrix/append-rotate-into';
import { appendScaleInto } from '../../../src/matrix/append-scale-into';
import { appendTranslateInto } from '../../../src/matrix/append-translate-into';
import { lerpInto } from '../../../src/matrix/lerp-into';
import { clampViewportBoundsInto } from '../../../src/matrix/clamp-viewport-bounds-into';
import { zoomToFitInto } from '../../../src/matrix/zoom-to-fit-into';
import { zoomAtPointInto } from '../../../src/matrix/zoom-at-point-into';
import { fitBoundsInto } from '../../../src/matrix/fit-bounds-into';
import { fitRectInto } from '../../../src/matrix/fit-rect-into';
import { translationMatrixInto } from '../../../src/matrix/translation-matrix-into';
import { rotationAroundPointInto } from '../../../src/matrix/rotation-around-point-into';
import { scaleAroundPointInto } from '../../../src/matrix/scale-around-point-into';
import type { BoundsPadding, Matrix } from '../../../src/types/flat-shapes.internal';

/** 추가 필드를 가진 외부 행렬 출력. */
class ExternalMatrix {
  a = 1;
  b = 0;
  c = 0;
  d = 1;
  tx = 0;
  ty = 0;
  tag = 'matrix';
}

test('copyInto는 평평한 행렬을 받아 외부 클래스 출력을 반환한다', () => {
  expectTypeOf(copyInto<ExternalMatrix>).parameters.toEqualTypeOf<[ExternalMatrix, Matrix]>();
  const out = new ExternalMatrix();
  const result = copyInto(out, new ExternalMatrix());
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalMatrix>();
});

test('appendRotateInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalMatrix();
  const result = appendRotateInto(out, new ExternalMatrix(), 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalMatrix>();
});

test('appendScaleInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalMatrix();
  const result = appendScaleInto(out, new ExternalMatrix(), 2, 3);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalMatrix>();
});

test('appendTranslateInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalMatrix();
  const result = appendTranslateInto(out, new ExternalMatrix(), { x: 2, y: 3 });
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalMatrix>();
});

test('lerpInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalMatrix();
  const result = lerpInto(out, new ExternalMatrix(), new ExternalMatrix(), 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalMatrix>();
});

test('clampViewportBoundsInto는 네 방향을 지정한 padding을 받는다', () => {
  expectTypeOf(clampViewportBoundsInto).parameter(3).toEqualTypeOf<{ padding: BoundsPadding } | undefined>();
});

/** 추가 필드를 가진 외부 경계 상자 출력. */
class ExternalBounds {
  minX = 0;
  minY = 0;
  maxX = 10;
  maxY = 10;
  tag = 'bounds';
}

test('clampViewportBoundsInto는 외부 클래스 출력을 그대로 반환한다', () => {
  const out = new ExternalBounds();
  const result = clampViewportBoundsInto(out, out, new ExternalBounds());
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalBounds>();
});

test('zoomToFitInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalMatrix();
  const result = zoomToFitInto(out, new ExternalBounds(), new ExternalBounds());
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalMatrix>();
});

test('zoomAtPointInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalMatrix();
  const result = zoomAtPointInto(out, new ExternalMatrix(), { x: 3, y: 5 }, 2);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalMatrix>();
});

test('fitBoundsInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalMatrix();
  const result = fitBoundsInto(out, new ExternalBounds(), new ExternalBounds());
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalMatrix>();
});

test('fitRectInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalMatrix();
  const result = fitRectInto(out, { x: 0, y: 0, width: 10, height: 10 }, { x: 0, y: 0, width: 20, height: 30 });
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalMatrix>();
});

test('translationMatrixInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalMatrix();
  const result = translationMatrixInto(out, { x: 3, y: 5 });
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalMatrix>();
});

test('rotationAroundPointInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalMatrix();
  const result = rotationAroundPointInto(out, { x: 3, y: 5 }, 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalMatrix>();
});

test('scaleAroundPointInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalMatrix();
  const result = scaleAroundPointInto(out, { x: 3, y: 5 }, { x: 2, y: 3 });
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalMatrix>();
});
