/**
 * rect.toSquareInto — rect를 정사각형으로 변환해 out에 기록한다.
 *
 * 검증: mode 'min'/'max' 동작(가로/세로/정사각형), center 정렬,
 * empty rect pass-through, 잘못된 mode RangeError, out===rect aliasing, 반환값.
 */
import { describe, expect, test } from 'vitest';
import { toSquareInto } from '../../../src/rect/to-square-into';
import type { RectWritable } from '../../../src/types';

function makeRect(): RectWritable {
  return { x: 0, y: 0, width: 0, height: 0 };
}

describe('rect - toSquareInto', () => {
  test('default mode는 min: width > height인 rect는 side = height, x center', () => {
    const out = makeRect();
    const result = toSquareInto(out, { x: 0, y: 0, width: 10, height: 4 });
    expect(out).toEqual({ x: 3, y: 0, width: 4, height: 4 });
    expect(result).toBe(out);
  });

  test('mode "min" 명시: width > height인 rect는 side = height, x center', () => {
    const out = makeRect();
    toSquareInto(out, { x: 0, y: 0, width: 10, height: 4 }, 'min');
    expect(out).toEqual({ x: 3, y: 0, width: 4, height: 4 });
  });

  test('mode "min": height > width인 rect는 side = width, y center', () => {
    const out = makeRect();
    toSquareInto(out, { x: 0, y: 0, width: 4, height: 10 }, 'min');
    expect(out).toEqual({ x: 0, y: 3, width: 4, height: 4 });
  });

  test('mode "max": width > height인 rect는 side = width, y center (위아래 확장)', () => {
    const out = makeRect();
    toSquareInto(out, { x: 0, y: 0, width: 10, height: 4 }, 'max');
    expect(out).toEqual({ x: 0, y: -3, width: 10, height: 10 });
  });

  test('mode "max": height > width인 rect는 side = height, x center (좌우 확장)', () => {
    const out = makeRect();
    toSquareInto(out, { x: 0, y: 0, width: 4, height: 10 }, 'max');
    expect(out).toEqual({ x: -3, y: 0, width: 10, height: 10 });
  });

  test('정사각형 rect: mode "min"과 "max" 모두 동일 결과', () => {
    const rect = { x: 5, y: 6, width: 8, height: 8 };
    const outMin = makeRect();
    const outMax = makeRect();
    toSquareInto(outMin, rect, 'min');
    toSquareInto(outMax, rect, 'max');
    expect(outMin).toEqual({ x: 5, y: 6, width: 8, height: 8 });
    expect(outMax).toEqual(outMin);
  });

  test('rect 위치가 (0,0) 아닌 경우: center가 rect center 기준', () => {
    const out = makeRect();
    toSquareInto(out, { x: 10, y: 20, width: 10, height: 4 }, 'min');
    // cx = 15, cy = 22, side = 4 → x = 13, y = 20
    expect(out).toEqual({ x: 13, y: 20, width: 4, height: 4 });
  });

  test('tuple rect 입력도 처리한다', () => {
    const out = makeRect();
    toSquareInto(out, [0, 0, 10, 4]);
    expect(out).toEqual({ x: 3, y: 0, width: 4, height: 4 });
  });

  test('empty rect (width=0): rect 그대로 복사', () => {
    const out = makeRect();
    toSquareInto(out, { x: 5, y: 6, width: 0, height: 10 });
    expect(out).toEqual({ x: 5, y: 6, width: 0, height: 10 });
  });

  test('empty rect (height=0): rect 그대로 복사', () => {
    const out = makeRect();
    toSquareInto(out, { x: 5, y: 6, width: 10, height: 0 });
    expect(out).toEqual({ x: 5, y: 6, width: 10, height: 0 });
  });

  test('negative width rect: rect 그대로 복사', () => {
    const out = makeRect();
    toSquareInto(out, { x: 5, y: 6, width: -1, height: 10 });
    expect(out).toEqual({ x: 5, y: 6, width: -1, height: 10 });
  });

  test('잘못된 mode "invalid": RangeError', () => {
    const out = makeRect();
    expect(() => toSquareInto(out, { x: 0, y: 0, width: 10, height: 4 }, 'invalid' as 'min')).toThrow(RangeError);
  });

  test('잘못된 mode null: RangeError', () => {
    const out = makeRect();
    expect(() => toSquareInto(out, { x: 0, y: 0, width: 10, height: 4 }, null as unknown as 'min')).toThrow(RangeError);
  });

  test('aliasing: out === rect (min)', () => {
    const rect: RectWritable = { x: 0, y: 0, width: 10, height: 4 };
    toSquareInto(rect, rect, 'min');
    expect(rect).toEqual({ x: 3, y: 0, width: 4, height: 4 });
  });

  test('aliasing: out === rect (max)', () => {
    const rect: RectWritable = { x: 0, y: 0, width: 10, height: 4 };
    toSquareInto(rect, rect, 'max');
    expect(rect).toEqual({ x: 0, y: -3, width: 10, height: 10 });
  });

  test('aliasing empty: out === rect (empty rect 복사)', () => {
    const rect: RectWritable = { x: 5, y: 6, width: 0, height: 10 };
    toSquareInto(rect, rect);
    expect(rect).toEqual({ x: 5, y: 6, width: 0, height: 10 });
  });

  test('반환값은 out과 같은 참조', () => {
    const out = makeRect();
    const result = toSquareInto(out, { x: 0, y: 0, width: 10, height: 4 });
    expect(result).toBe(out);
  });
});
