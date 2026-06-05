import { describe, expect, it } from 'vitest';
import { decodeFlatCoords } from '../../../src/adapter/flat/decode-flat-coords';
import { decodeFlatCoordsInto } from '../../../src/adapter/flat/decode-flat-coords-into';

// ─────────────────────────────────────────────────────────────────────────────
// decodeFlatCoords — companion 기본 동작
// ─────────────────────────────────────────────────────────────────────────────

describe('decodeFlatCoords — 새 배열 반환', () => {
  it('빈 flat 배열이면 빈 배열을 반환한다', () => {
    expect(decodeFlatCoords([])).toEqual([]);
  });

  it('두 포인트를 새 배열로 반환한다', () => {
    const result = decodeFlatCoords([1, 2, 3, 4]);
    expect(result).toEqual([
      { x: 1, y: 2 },
      { x: 3, y: 4 },
    ]);
  });

  it('세 포인트를 새 배열로 반환한다', () => {
    const result = decodeFlatCoords([10, 20, 30, 40, 50, 60]);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ x: 10, y: 20 });
    expect(result[1]).toEqual({ x: 30, y: 40 });
    expect(result[2]).toEqual({ x: 50, y: 60 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// decodeFlatCoords — Into 결과와 동등
// ─────────────────────────────────────────────────────────────────────────────

describe('decodeFlatCoords — decodeFlatCoordsInto 결과와 동등', () => {
  it('단일 포인트 결과가 Into와 deep equal이다', () => {
    const flat = [5, 10];
    const out: { x: number; y: number }[] = [];
    decodeFlatCoordsInto(out, flat);
    expect(decodeFlatCoords(flat)).toEqual(out);
  });

  it('세 포인트 결과가 Into와 deep equal이다', () => {
    const flat = [1, 2, 3, 4, 5, 6];
    const out: { x: number; y: number }[] = [];
    decodeFlatCoordsInto(out, flat);
    expect(decodeFlatCoords(flat)).toEqual(out);
  });

  it('홀수 길이 flat은 Into 결과와 동등하다', () => {
    const flat = [1, 2, 3];
    const out: { x: number; y: number }[] = [];
    decodeFlatCoordsInto(out, flat);
    expect(decodeFlatCoords(flat)).toEqual(out);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// decodeFlatCoords — 홀수 길이 처리
// ─────────────────────────────────────────────────────────────────────────────

describe('decodeFlatCoords — 홀수 길이 입력', () => {
  it('길이 1이면 빈 배열을 반환한다', () => {
    expect(decodeFlatCoords([1])).toEqual([]);
  });

  it('길이 3이면 첫 쌍만 반환한다', () => {
    expect(decodeFlatCoords([1, 2, 3])).toEqual([{ x: 1, y: 2 }]);
  });
});
