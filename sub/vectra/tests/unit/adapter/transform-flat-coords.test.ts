/**
 * 평평한 좌표 배열의 행렬 변환과 결과 배열을 검증한다.
 */
import { describe, expect, it } from 'vitest';
import { transformFlatCoords } from '../../../src/adapter/flat/transform-flat-coords';
import type { Matrix } from '../../../src/types/flat-shapes.internal';

describe('transformFlatCoords', () => {
  describe('빈 배열 입력', () => {
    it('빈 배열을 반환한다', () => {
      const identity: Matrix = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
      expect(transformFlatCoords([], identity)).toEqual([]);
    });
  });

  describe('identity matrix', () => {
    it('좌표가 변하지 않는다', () => {
      const identity: Matrix = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
      const result = transformFlatCoords([1, 2, 3, 4], identity);
      expect(result).toEqual([1, 2, 3, 4]);
    });
  });

  describe('이동 matrix', () => {
    it('tx=5, ty=10 이동이 적용된다', () => {
      const translate: Matrix = { a: 1, b: 0, c: 0, d: 1, tx: 5, ty: 10 };
      const result = transformFlatCoords([0, 0, 1, 1], translate);
      expect(result).toEqual([5, 10, 6, 11]);
    });
  });

  describe('새 배열 반환', () => {
    it('원본 입력을 변경하지 않는다', () => {
      const flat = [1, 2, 3, 4];
      const identity: Matrix = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
      const result = transformFlatCoords(flat, identity);
      expect(result).toEqual([1, 2, 3, 4]);
      expect(result).not.toBe(flat);
    });
  });
});
