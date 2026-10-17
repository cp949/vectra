/**
 * svg-path 파서와 compact 직렬화의 방어 분기 테스트.
 *
 * 파라미터가 모자란 command, 지원하지 않는 letter, subpath 없는 숫자 반복, command letter 없는
 * 선두 숫자를 strict와 loose 두 모드로 확인한다. strict는 전체 실패(`false`), loose는 실패 지점까지의
 * 결과를 돌려준다. compact 직렬화는 음수 소수의 leading zero 제거를 확인한다.
 */

import { describe, expect, test } from 'vitest';
import { isValidPathData } from '../../../src/svg-path/is-valid-path-data';
import { parsePathDataInto } from '../../../src/svg-path/parse-path-data-into';
import { parsePathDataLooseInto } from '../../../src/svg-path/parse-path-data-loose-into';
import { pathDataToCompactString } from '../../../src/svg-path/path-data-to-compact-string';
import type { PathCommand } from '../../../src/types/index';

const START: PathCommand = { kind: 'move', x: 0, y: 0 };

/** loose 모드로 parse한 결과를 돌려준다. loose는 항상 true를 반환하므로 결과 배열만 확인한다. */
function parseLoose(data: string): PathCommand[] {
  const out: PathCommand[] = [];
  expect(parsePathDataLooseInto(out, data)).toBe(true);
  return out;
}

describe('파라미터가 모자란 command', () => {
  const truncated: [string, string][] = [
    ['H', 'M0 0 H'],
    ['V', 'M0 0 V'],
    ['Q', 'M0 0 Q 1 1 2'],
    ['T', 'M0 0 T 1'],
    ['C', 'M0 0 C 1 1 2 2 3'],
    ['S', 'M0 0 S 1 1 2'],
  ];

  test.each(truncated)('%s의 파라미터가 모자라면 strict는 false를 돌려주고 out을 바꾸지 않는다', (_name, data) => {
    const out: PathCommand[] = [START];
    expect(parsePathDataInto(out, data)).toBe(false);
    expect(isValidPathData(data)).toBe(false);
    expect(out).toEqual([START]);
  });

  test.each(truncated)('%s의 파라미터가 모자라면 loose는 앞선 command까지만 돌려준다', (_name, data) => {
    expect(parseLoose(data)).toEqual([START]);
  });

  test('유한하지 않은 숫자 토큰은 파라미터 부족과 같이 처리한다', () => {
    expect(isValidPathData('M0 0 H 1e999')).toBe(false);
    expect(parseLoose('M0 0 H 1e999')).toEqual([START]);
  });

  test('loose는 파라미터가 모자란 command 앞의 command를 유지한다', () => {
    expect(parseLoose('M0 0 L 1 2 L 3')).toEqual([START, { kind: 'line', x: 1, y: 2 }]);
  });
});

describe('M의 파라미터 부족', () => {
  test('strict는 false를 돌려준다', () => {
    expect(isValidPathData('M0 0 L 1 2 M 3')).toBe(false);
  });

  test('loose는 모자란 M 앞까지만 돌려준다', () => {
    expect(parseLoose('M0 0 L 1 2 M 3')).toEqual([START, { kind: 'line', x: 1, y: 2 }]);
  });
});

describe('지원하지 않는 letter', () => {
  test('strict는 false를 돌려준다', () => {
    expect(isValidPathData('M0 0 X 1 2')).toBe(false);
  });

  test('loose는 그 letter 앞까지만 돌려준다', () => {
    expect(parseLoose('M0 0 X 1 2')).toEqual([START]);
  });
});

describe('subpath 없는 숫자', () => {
  test('Z 뒤 숫자 반복은 strict에서 false다', () => {
    expect(isValidPathData('Z 1 2')).toBe(false);
  });

  test('Z 뒤 숫자 반복은 loose에서 close까지만 돌려준다', () => {
    expect(parseLoose('Z 1 2')).toEqual([{ kind: 'close' }]);
  });

  test('command letter 없이 숫자로 시작하면 strict는 false, loose는 빈 배열이다', () => {
    expect(isValidPathData('1 2')).toBe(false);
    expect(parseLoose('1 2')).toEqual([]);
  });
});

describe('pathDataToCompactString — 음수 소수', () => {
  test('음수 소수는 부호 뒤 leading zero를 제거한다', () => {
    const commands: PathCommand[] = [
      { kind: 'move', x: -0.25, y: 0.5 },
      { kind: 'line', x: -0.0004, y: -1.5 },
    ];
    expect(pathDataToCompactString(commands)).toBe('M-.25 .5L-.0004 -1.5');
  });
});
