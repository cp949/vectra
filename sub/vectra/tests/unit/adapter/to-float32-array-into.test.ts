import { describe, expect, it } from 'vitest';
import { toFloat32ArrayInto } from '../../../src/adapter/flat/to-float32-array-into';

describe('toFloat32ArrayInto', () => {
  describe('빈 배열 입력', () => {
    it('out을 그대로 유지한다', () => {
      const out = new Float32Array(0);
      toFloat32ArrayInto(out, []);
      expect(out.length).toBe(0);
    });
  });

  describe('XYLike 배열 입력', () => {
    it('두 포인트를 Float32Array에 기록한다', () => {
      const out = new Float32Array(4);
      toFloat32ArrayInto(out, [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
      ]);
      expect(out[0]).toBe(1);
      expect(out[1]).toBe(2);
      expect(out[2]).toBe(3);
      expect(out[3]).toBe(4);
    });
  });

  describe('XYTuple 배열 입력', () => {
    it('tuple 형태의 포인트를 Float32Array에 기록한다', () => {
      const out = new Float32Array(4);
      toFloat32ArrayInto(out, [
        [5, 6],
        [7, 8],
      ]);
      expect(out[0]).toBe(5);
      expect(out[1]).toBe(6);
      expect(out[2]).toBe(7);
      expect(out[3]).toBe(8);
    });
  });

  describe('float32 precision loss', () => {
    it('float64 정밀도 값이 float32로 반올림된다', () => {
      // float64 값 (JS number)
      const precise = 1.0000001192092896; // float64 표현 가능, float32 경계
      const out = new Float32Array(2);
      toFloat32ArrayInto(out, [{ x: precise, y: 0 }]);
      // Float32Array는 float32 precision으로 자동 변환
      expect(out[0]).toBe(Math.fround(precise));
    });

    it('정수 좌표는 float32 정밀도 손실이 없다', () => {
      const out = new Float32Array(4);
      toFloat32ArrayInto(out, [
        { x: 100, y: 200 },
        { x: -50, y: 75 },
      ]);
      expect(out[0]).toBe(100);
      expect(out[1]).toBe(200);
      expect(out[2]).toBe(-50);
      expect(out[3]).toBe(75);
    });
  });

  describe('buffer 재사용', () => {
    it('index 0부터 덮어쓰고 뒤쪽은 유지한다', () => {
      const out = new Float32Array([0, 0, 0, 0, 99, 99]);
      toFloat32ArrayInto(out, [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
      ]);
      expect(out[0]).toBe(1);
      expect(out[1]).toBe(2);
      expect(out[2]).toBe(3);
      expect(out[3]).toBe(4);
      expect(out[4]).toBe(99);
      expect(out[5]).toBe(99);
    });
  });
});
