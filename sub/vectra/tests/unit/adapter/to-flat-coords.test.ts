/** 점 객체 배열 변환과 버퍼 처리 시험. */

import { describe, expect, it } from 'vitest';
import { toFlatCoords } from '../../../src/adapter/flat/to-flat-coords';

describe('toFlatCoords', () => {
  describe('빈 배열 입력', () => {
    it('빈 배열을 반환한다', () => {
      expect(toFlatCoords([])).toEqual([]);
    });
  });

  describe('점 객체 배열 입력', () => {
    it('두 포인트를 flat 배열로 변환한다', () => {
      const result = toFlatCoords([
        { x: 1, y: 2 },
        { x: 3, y: 4 },
      ]);
      expect(result).toEqual([1, 2, 3, 4]);
    });
  });

  describe('새 배열 반환', () => {
    it('원본 입력을 변경하지 않는다', () => {
      const points = [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
      ];
      const result = toFlatCoords(points);
      expect(result).toEqual([1, 2, 3, 4]);
      expect(points[0]).toEqual({ x: 1, y: 2 });
    });
  });
});
