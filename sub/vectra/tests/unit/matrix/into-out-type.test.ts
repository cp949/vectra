/**
 * 행렬 Into 함수의 평평한 입력과 외부 클래스 출력의 타입 보존을 검증한다.
 */
import { expect, expectTypeOf, test } from 'vitest';
import { copyInto } from '../../../src/matrix/copy-into';
import { appendRotateInto } from '../../../src/matrix/append-rotate-into';
import { appendScaleInto } from '../../../src/matrix/append-scale-into';
import { appendTranslateInto } from '../../../src/matrix/append-translate-into';
import { lerpInto } from '../../../src/matrix/lerp-into';
import type { Matrix } from '../../../src/types/flat-shapes.internal';

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
