/** 각도 변환의 출력 객체 타입과 참조를 검증한다. */
import { expect, expectTypeOf, test } from 'vitest';
import { toUnitVectorInto } from '../../../src/angle/to-unit-vector-into';
import type { PointWritable } from '../../../src/types/flat-shapes.internal';

test('각도 변환은 점 객체를 받고 출력의 구체 타입을 보존한다', () => {
  class Output {
    x = 0;
    y = 0;
    label = '점';
  }

  const out = new Output();
  const result = toUnitVectorInto(out, 0);
  expectTypeOf(toUnitVectorInto).parameter(0).toEqualTypeOf<PointWritable>();
  expectTypeOf(result).toEqualTypeOf<Output>();
  expect(result).toBe(out);
});
