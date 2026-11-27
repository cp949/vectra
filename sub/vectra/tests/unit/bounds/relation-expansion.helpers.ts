import { createBounds } from '../../../src/bounds/create-bounds';
import { emptyInto } from '../../../src/bounds/empty-into';
import type { BoundsWritable } from '../../../src/types';

export function makeBounds(): BoundsWritable {
  return { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
}

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
