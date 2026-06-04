import { describe, expect, test } from 'vitest';
import { createRng } from '../../../src/random/create-rng';
import { float } from '../../../src/random/float';
import { int } from '../../../src/random/int';
import { pointInBoundsInto } from '../../../src/random/point-in-bounds-into';

describe('createRng — seedable random source', () => {
  describe('number seed 재현성', () => {
    test('같은 number seed는 같은 sequence를 만든다', () => {
      const rngA = createRng(42);
      const rngB = createRng(42);
      const seqA = Array.from({ length: 10 }, () => rngA());
      const seqB = Array.from({ length: 10 }, () => rngB());
      expect(seqA).toEqual(seqB);
    });
  });

  describe('string seed 재현성', () => {
    test('같은 string seed는 같은 sequence를 만든다', () => {
      const rngA = createRng('hello');
      const rngB = createRng('hello');
      const seqA = Array.from({ length: 10 }, () => rngA());
      const seqB = Array.from({ length: 10 }, () => rngB());
      expect(seqA).toEqual(seqB);
    });

    test('빈 문자열 seed도 허용된다', () => {
      const rngA = createRng('');
      const rngB = createRng('');
      const seqA = Array.from({ length: 5 }, () => rngA());
      const seqB = Array.from({ length: 5 }, () => rngB());
      expect(seqA).toEqual(seqB);
    });
  });

  describe('다른 seed는 다른 초기 sequence를 만든다', () => {
    test('다른 number seed는 첫 번째 값이 다르다', () => {
      const rngA = createRng(1);
      const rngB = createRng(2);
      // 첫 10개 값 중 하나라도 달라야 한다
      const seqA = Array.from({ length: 10 }, () => rngA());
      const seqB = Array.from({ length: 10 }, () => rngB());
      expect(seqA).not.toEqual(seqB);
    });

    test('다른 string seed는 첫 번째 값이 다르다', () => {
      const rngA = createRng('foo');
      const rngB = createRng('bar');
      const seqA = Array.from({ length: 10 }, () => rngA());
      const seqB = Array.from({ length: 10 }, () => rngB());
      expect(seqA).not.toEqual(seqB);
    });

    test('number seed와 string seed는 다른 sequence를 만든다', () => {
      const rngA = createRng(0);
      const rngB = createRng('0');
      const seqA = Array.from({ length: 10 }, () => rngA());
      const seqB = Array.from({ length: 10 }, () => rngB());
      expect(seqA).not.toEqual(seqB);
    });
  });

  describe('반환값 범위', () => {
    test('반환값 128개가 모두 [0, 1) 범위다', () => {
      const rng = createRng(99);
      for (let i = 0; i < 128; i++) {
        const v = rng();
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(1);
      }
    });
  });

  describe('non-finite number seed 오류 처리', () => {
    test('NaN seed는 RangeError를 던진다', () => {
      expect(() => createRng(Number.NaN)).toThrow(RangeError);
    });

    test('Infinity seed는 RangeError를 던진다', () => {
      expect(() => createRng(Infinity)).toThrow(RangeError);
    });

    test('-Infinity seed는 RangeError를 던진다', () => {
      expect(() => createRng(-Infinity)).toThrow(RangeError);
    });
  });

  describe('integration — helper 함수에 주입', () => {
    test('float에 createRng 결과를 주입하면 재현 가능한 범위 값을 반환한다', () => {
      const rngA = createRng('seed-float');
      const rngB = createRng('seed-float');
      const valA = float(10, 20, rngA);
      const valB = float(10, 20, rngB);
      expect(valA).toBe(valB);
      expect(valA).toBeGreaterThanOrEqual(10);
      expect(valA).toBeLessThan(20);
    });

    test('int에 createRng 결과를 주입하면 재현 가능한 정수 값을 반환한다', () => {
      const rngA = createRng('seed-int');
      const rngB = createRng('seed-int');
      const valA = int(0, 100, rngA);
      const valB = int(0, 100, rngB);
      expect(valA).toBe(valB);
      expect(Number.isInteger(valA)).toBe(true);
      expect(valA).toBeGreaterThanOrEqual(0);
      expect(valA).toBeLessThanOrEqual(100);
    });

    test('pointInBoundsInto에 createRng 결과를 주입하면 재현 가능한 좌표를 기록한다', () => {
      const bounds = { min: { x: 0, y: 0 }, max: { x: 100, y: 100 } };
      const outA = { x: 0, y: 0 };
      const outB = { x: 0, y: 0 };
      const resultA = pointInBoundsInto(outA, bounds, createRng('seed-bounds'));
      const resultB = pointInBoundsInto(outB, bounds, createRng('seed-bounds'));
      expect(resultA).toBe(true);
      expect(resultB).toBe(true);
      expect(outA).toEqual(outB);
    });
  });
});
