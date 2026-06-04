/**
 * SVG path data string의 strict grammar validation-only helper.
 *
 * domain barrel(./index)을 import하지 않는다.
 */

import { parseTokens, tokenize } from './svg-path-parser.internal';

/**
 * SVG path data string이 strict grammar로 parse 가능한지 검사한다.
 *
 * `parsePathDataInto`와 같은 grammar/실패 조건을 사용한다. parse 결과는 caller에
 * materialize하지 않고, 성공/실패 여부만 boolean으로 반환한다.
 *
 * caller 책임:
 * - `parsePathDataInto`와 동일한 strict 규칙을 적용한다. loose grammar로 부분 결과를 얻으려면
 *   `parsePathDataLooseInto(out, data)`를 직접 호출한다. loose parser는 boolean validation을
 *   제공하지 않고 partial command 배열을 항상 채워준다.
 * - 빈 문자열은 0개 command로 parse 성공한다 (`true` 반환). 빈 문자열을 거부해야 한다면
 *   caller가 별도로 검사한다.
 * - `1e309` 같은 Infinity로 평가되는 숫자, large-arc/sweep flag가 `0/1`이 아닌 값,
 *   command letter 외의 문자는 parse 실패로 처리되어 `false`를 반환한다.
 *
 * @param data 검사할 SVG path data string
 * @returns parse 가능하면 `true`, 그 외 `false`
 */
export function isValidPathData(data: string): boolean {
  return parseTokens(tokenize(data)) !== null;
}
