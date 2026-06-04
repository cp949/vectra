import { describe, expect, it } from 'vitest';
import { toFlatCoordsInto } from '../../../src/adapter/flat/to-flat-coords-into';

describe('toFlatCoordsInto', () => {
  describe('빈 배열 입력', () => {
    it('out을 그대로 유지한다', () => {
      const out: number[] = [];
      toFlatCoordsInto(out, []);
      expect(out).toEqual([]);
    });

    it('기존 out 내용을 건드리지 않는다', () => {
      const out = [1, 2, 3, 4];
      toFlatCoordsInto(out, []);
      expect(out).toEqual([1, 2, 3, 4]);
    });
  });

  describe('XYLike 배열 입력', () => {
    it('단일 포인트를 flat 형태로 기록한다', () => {
      const out: number[] = new Array(2);
      toFlatCoordsInto(out, [{ x: 3, y: 7 }]);
      expect(out[0]).toBe(3);
      expect(out[1]).toBe(7);
    });

    it('두 포인트를 flat 형태로 기록한다', () => {
      const out: number[] = new Array(4);
      toFlatCoordsInto(out, [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
      ]);
      expect(out).toEqual([1, 2, 3, 4]);
    });

    it('세 포인트를 flat 형태로 기록한다', () => {
      const out: number[] = new Array(6);
      toFlatCoordsInto(out, [
        { x: 10, y: 20 },
        { x: 30, y: 40 },
        { x: 50, y: 60 },
      ]);
      expect(out).toEqual([10, 20, 30, 40, 50, 60]);
    });
  });

  describe('XYTuple 배열 입력', () => {
    it('tuple 형태의 포인트를 flat 형태로 기록한다', () => {
      const out: number[] = new Array(4);
      toFlatCoordsInto(out, [
        [1, 2],
        [3, 4],
      ]);
      expect(out).toEqual([1, 2, 3, 4]);
    });
  });

  describe('XYLike와 XYTuple 혼합 입력', () => {
    it('혼합 배열을 flat 형태로 기록한다', () => {
      const out: number[] = new Array(4);
      toFlatCoordsInto(out, [{ x: 1, y: 2 }, [3, 4]]);
      expect(out).toEqual([1, 2, 3, 4]);
    });
  });

  describe('out buffer 재사용', () => {
    it('index 0부터 덮어쓰고 나머지는 유지한다', () => {
      const out = [0, 0, 0, 0, 99, 99];
      toFlatCoordsInto(out, [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
      ]);
      expect(out[0]).toBe(1);
      expect(out[1]).toBe(2);
      expect(out[2]).toBe(3);
      expect(out[3]).toBe(4);
      // 뒤쪽은 변경하지 않음
      expect(out[4]).toBe(99);
      expect(out[5]).toBe(99);
    });
  });

  describe('음수 좌표', () => {
    it('음수 좌표를 올바르게 기록한다', () => {
      const out: number[] = new Array(4);
      toFlatCoordsInto(out, [
        { x: -1, y: -2 },
        { x: -3, y: 4 },
      ]);
      expect(out).toEqual([-1, -2, -3, 4]);
    });
  });
});
