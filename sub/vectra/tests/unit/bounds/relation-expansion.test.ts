import { describe, expect, test } from 'vitest';
import { emptyInto } from '../../../src/bounds/empty-into';
import { makeBounds } from './relation-expansion.helpers';
import './relation-expansion.expansion-cases';
import './relation-expansion.relations-cases';

describe('bounds - emptyInto', () => {
  test('sentinel bounds를 기록하고 out을 반환한다', () => {
    const out = makeBounds();
    const result = emptyInto(out);
    expect(out.min).toEqual({ x: Infinity, y: Infinity });
    expect(out.max).toEqual({ x: -Infinity, y: -Infinity });
    expect(result).toBe(out);
  });
});
