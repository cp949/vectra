import { describe, expect, test } from 'vitest';
import { identityInto } from '../../../src/matrix/identity-into';
import type { MatrixWritable } from '../../../src/types';
import { makeMatrix } from './_matrix-test-helpers';

describe('matrix lifecycle - identityInto', () => {
  test('identity component를 기록하고 out을 반환한다', () => {
    const out = makeMatrix();
    const result = identityInto(out);
    expect(result).toBe(out);
    expect(out).toEqual({ a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
  });

  test('기존 값을 덮어쓴다', () => {
    const out: MatrixWritable = { a: 5, b: 3, c: 2, d: 7, tx: 10, ty: 20 };
    identityInto(out);
    expect(out).toEqual({ a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
  });

  test('generic Out 타입이 보존된다', () => {
    interface MyMatrix extends MatrixWritable {
      tag: string;
    }
    const out: MyMatrix = { a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0, tag: 'id' };
    const result = identityInto(out);
    expect(result).toBe(out);
    expect(result.tag).toBe('id');
  });
});
