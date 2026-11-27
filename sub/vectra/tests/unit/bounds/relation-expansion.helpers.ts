/** relation-expansion 시험이 함께 쓰는 경계 상자 생성 함수를 모은다. */

import { createBounds } from '../../../src/bounds/create-bounds';
import { emptyInto } from '../../../src/bounds/empty-into';
import type { BoundsWritable } from '../../../src/types';

/** 아직 중첩 min/max를 받는 union·intersection·translate 시험의 출력 객체를 만든다. */
export function makeBounds(): BoundsWritable {
  return { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
}

/** 중첩 min/max 형식의 빈 값 표지를 만든다. 평평한 형식은 flatSentinel을 쓴다. */
export function sentinel(): BoundsWritable {
  const out = makeBounds();
  out.min.x = out.min.y = Infinity;
  out.max.x = out.max.y = -Infinity;
  return out;
}

/** 평평한 경계 상자의 빈 값 표지를 만든다. */
export function flatSentinel() {
  return emptyInto(createBounds());
}
