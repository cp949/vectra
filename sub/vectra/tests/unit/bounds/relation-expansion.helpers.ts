import { emptyInto } from '../../../src/bounds/empty-into';
import type { BoundsWritable } from '../../../src/types';

export function makeBounds(): BoundsWritable {
  return { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
}

export function sentinel(): BoundsWritable {
  const out = makeBounds();
  emptyInto(out);
  return out;
}
