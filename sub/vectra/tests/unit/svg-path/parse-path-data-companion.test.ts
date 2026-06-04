/**
 * svg-path parse collection companion unit test.
 *
 * 각 companion이 대응 *-into 함수와 동등한 결과를 반환하는지 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { parsePathData } from '../../../src/svg-path/parse-path-data';
import { parsePathDataInto } from '../../../src/svg-path/parse-path-data-into';
import { parsePathDataLoose } from '../../../src/svg-path/parse-path-data-loose';
import { parsePathDataLooseInto } from '../../../src/svg-path/parse-path-data-loose-into';
import type { PathCommand } from '../../../src/types/index';

describe('parsePathData — 새 배열 반환', () => {
  test('parsePathDataInto 결과와 deep equal이다', () => {
    const expected: PathCommand[] = [];
    expect(parsePathDataInto(expected, 'M 0 0 L 10 20')).toBe(true);
    expect(parsePathData('M 0 0 L 10 20')).toEqual(expected);
  });

  test('strict parse 실패 시 undefined를 반환한다', () => {
    expect(parsePathData('M 0 0 L 10')).toBeUndefined();
  });

  test('빈 path string은 빈 배열을 반환한다', () => {
    expect(parsePathData('')).toEqual([]);
  });

  test('unknown command만 있는 path는 undefined를 반환한다', () => {
    expect(parsePathData('X bad')).toBeUndefined();
  });
});

describe('parsePathDataLoose — 새 배열 반환', () => {
  test('parsePathDataLooseInto 결과와 deep equal이다', () => {
    const expected: PathCommand[] = [];
    parsePathDataLooseInto(expected, 'M 0 0 L 10 20 X bad');
    expect(parsePathDataLoose('M 0 0 L 10 20 X bad')).toEqual(expected);
  });

  test('빈 path string은 빈 배열을 반환한다', () => {
    expect(parsePathDataLoose('')).toEqual([]);
  });
});
