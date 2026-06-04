import { describe, expect, it } from 'vitest';
import { toFloat32Array } from '../../../src/adapter/flat/to-float32-array';

describe('toFloat32Array', () => {
  describe('빈 배열 입력', () => {
    it('길이 0인 Float32Array를 반환한다', () => {
      const result = toFloat32Array([]);
      expect(result).toBeInstanceOf(Float32Array);
      expect(result.length).toBe(0);
    });
  });

  describe('XYLike 배열 입력', () => {
    it('두 포인트를 Float32Array로 변환한다', () => {
      const result = toFloat32Array([
        { x: 1, y: 2 },
        { x: 3, y: 4 },
      ]);
      expect(result).toBeInstanceOf(Float32Array);
      expect(result.length).toBe(4);
      expect(result[0]).toBe(1);
      expect(result[1]).toBe(2);
      expect(result[2]).toBe(3);
      expect(result[3]).toBe(4);
    });
  });

  describe('float32 정밀도 손실 round-trip', () => {
    it('float64 고정밀 값이 float32로 변환된다', () => {
      // float32로 표현할 수 없는 값
      const x = 1 / 3;
      const result = toFloat32Array([{ x, y: 0 }]);
      // Float32Array는 float32 precision
      expect(result[0]).toBe(Math.fround(x));
      // float64와 다를 수 있다
      expect(result[0]).not.toBe(x);
    });
  });
});
