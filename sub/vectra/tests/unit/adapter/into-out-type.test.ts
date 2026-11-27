/** SVG polygon 파싱 결과가 호출자의 버퍼 타입과 참조를 보존하는지 시험한다. */

import { expect, expectTypeOf, test } from 'vitest';
import { parseSvgPolygonInto } from '../../../src/adapter/parse-svg-polygon-into';

/** 호출자가 좌표와 함께 별도 상태를 보관하는 버퍼다. */
class CoordinateBuffer extends Array<number> {
  label = 'polygon';
}

test('parseSvgPolygonInto는 좌표 버퍼의 타입과 참조를 보존한다', () => {
  const out = new CoordinateBuffer();
  const result = parseSvgPolygonInto(out, '1,2 3,4');

  expectTypeOf(result).toEqualTypeOf<CoordinateBuffer>();
  expect(result).toBe(out);
  expect(Array.from(out)).toEqual([1, 2, 3, 4]);
});
