/** relation-expansion 시험이 함께 쓰는 경계 상자 생성 함수를 모은다. */

import { createBounds } from '../../../src/bounds/create-bounds';
import { emptyInto } from '../../../src/bounds/empty-into';
/** 평평한 경계 상자의 빈 값 표지를 만든다. */
export function sentinel() {
  return emptyInto(createBounds());
}
