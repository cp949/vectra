/**
 * svg-path-tokenizer.internal characterization 테스트.
 *
 * tokenize / readNum / readFlag를 .internal에서 직접 import해 현재 동작을 golden으로 고정한다
 * (분할 후 회귀 net). 기존 svg-path test는 전부 public API(parsePathDataInto 등)를 경유하므로
 * tokenizer helper를 직접 import하는 이 fixture가 미커버 단계를 채운다.
 *
 * 분기:
 *  - tokenize: command letter + 숫자 혼합, scientific notation, 음수/소수, 빈 string, unsupported letter 포함
 *  - readNum: idx.i 진행(성공 시 ++, 실패 시 불변), non-finite null, 정상 숫자
 *  - readFlag: 0→false / 1→true / 범위 밖→null / 빈 토큰→null
 */
import { describe, expect, test } from 'vitest';
import { readFlag, readNum, tokenize } from '../../../src/svg-path/svg-path-tokenizer.internal';

describe('tokenize', () => {
  test('command letter와 숫자 혼합 string을 토큰 배열로 분해한다', () => {
    expect(tokenize('M10 20 L30 40')).toEqual(['M', '10', '20', 'L', '30', '40']);
  });

  test('scientific notation을 단일 토큰으로 유지한다', () => {
    expect(tokenize('L1e3 2E-2')).toEqual(['L', '1e3', '2E-2']);
  });

  test('음수/소수/부호를 단일 토큰으로 분해한다', () => {
    expect(tokenize('-.5 +1.5')).toEqual(['-.5', '+1.5']);
  });

  test('빈 string은 빈 배열을 반환한다', () => {
    expect(tokenize('')).toEqual([]);
  });

  test('지원하지 않는 letter도 토큰에 포함한다', () => {
    expect(tokenize('X10')).toEqual(['X', '10']);
  });
});

describe('readNum', () => {
  test('성공 시 숫자를 반환하고 idx.i를 1 증가시킨다', () => {
    const idx = { i: 0 };
    expect(readNum(['12', 'x'], idx)).toBe(12);
    expect(idx.i).toBe(1);
  });

  test('non-finite 토큰은 null을 반환하고 idx.i는 불변이다', () => {
    const idx = { i: 0 };
    expect(readNum(['abc'], idx)).toBe(null);
    expect(idx.i).toBe(0);
  });

  test('범위를 벗어난 idx는 null을 반환한다', () => {
    const idx = { i: 2 };
    expect(readNum(['1', '2'], idx)).toBe(null);
    expect(idx.i).toBe(2);
  });

  test('Infinity 토큰은 non-finite로 null을 반환한다', () => {
    const idx = { i: 0 };
    expect(readNum(['Infinity'], idx)).toBe(null);
    expect(idx.i).toBe(0);
  });
});

describe('readFlag', () => {
  test('0은 false를 반환하고 idx.i를 증가시킨다', () => {
    const idx = { i: 0 };
    expect(readFlag(['0'], idx)).toBe(false);
    expect(idx.i).toBe(1);
  });

  test('1은 true를 반환한다', () => {
    const idx = { i: 0 };
    expect(readFlag(['1'], idx)).toBe(true);
    expect(idx.i).toBe(1);
  });

  test('범위 밖 값(2)은 null을 반환한다', () => {
    const idx = { i: 0 };
    expect(readFlag(['2'], idx)).toBe(null);
  });

  test('빈 토큰은 null을 반환한다', () => {
    const idx = { i: 0 };
    expect(readFlag([], idx)).toBe(null);
    expect(idx.i).toBe(0);
  });
});
