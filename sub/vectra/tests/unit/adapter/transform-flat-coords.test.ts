import { describe, expect, it } from 'vitest';
import { transformFlatCoords } from '../../../src/adapter/flat/transform-flat-coords';
import type { MatrixLike } from '../../../src/types/index';

describe('transformFlatCoords', () => {
  describe('빈 배열 입력', () => {
    it('빈 배열을 반환한다', () => {
      const identity: MatrixLike = [1, 0, 0, 1, 0, 0];
      expect(transformFlatCoords([], identity)).toEqual([]);
    });
  });

  describe('identity matrix', () => {
    it('좌표가 변하지 않는다', () => {
      const identity: MatrixLike = [1, 0, 0, 1, 0, 0];
      const result = transformFlatCoords([1, 2, 3, 4], identity);
      expect(result).toEqual([1, 2, 3, 4]);
    });
  });

  describe('이동 matrix', () => {
    it('tx=5, ty=10 이동이 적용된다', () => {
      const translate: MatrixLike = [1, 0, 0, 1, 5, 10];
      const result = transformFlatCoords([0, 0, 1, 1], translate);
      expect(result).toEqual([5, 10, 6, 11]);
    });
  });

  describe('새 배열 반환', () => {
    it('원본 입력을 변경하지 않는다', () => {
      const flat = [1, 2, 3, 4];
      const identity: MatrixLike = [1, 0, 0, 1, 0, 0];
      const result = transformFlatCoords(flat, identity);
      expect(result).toEqual([1, 2, 3, 4]);
      expect(result).not.toBe(flat);
    });
  });
});
