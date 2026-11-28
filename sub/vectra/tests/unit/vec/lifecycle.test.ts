/** 벡터 복사와 out 재사용을 검증한다. */
import { describe, expect, test } from 'vitest';
import type { PointWritable } from '../../../src/types';
import { copyInto } from '../../../src/vec/copy-into';

describe('vec lifecycle - copyInto', () => {
  test('object 입력의 좌표를 out에 복사한다', () => {
    // object 입력에서 좌표를 읽어 out에 옮긴다
    const out: PointWritable = { x: 99, y: 99 };

    const result = copyInto(out, { x: -1.5, y: 2.5 });

    expect(result).toBe(out);
    expect(out).toEqual({ x: -1.5, y: 2.5 });
  });

  test('source object를 mutate하지 않고 out만 갱신한다', () => {
    // copy semantics는 source 객체를 건드리지 않아야 한다
    const source = { x: 11, y: 22 };
    const out: PointWritable = { x: 0, y: 0 };

    copyInto(out, source);

    expect(source).toEqual({ x: 11, y: 22 });
    expect(out).toEqual({ x: 11, y: 22 });
    expect(out).not.toBe(source);
  });

  test('caller가 제공한 out 객체를 재사용하고 같은 객체를 반환한다', () => {
    // 두 번 연속 호출에서도 동일 reference를 반환해야 한다
    const out: PointWritable = { x: 99, y: 99 };

    const first = copyInto(out, { x: 3, y: 4 });
    const second = copyInto(out, { x: 30, y: 40 });

    expect(first).toBe(out);
    expect(second).toBe(out);
    expect(out).toEqual({ x: 30, y: 40 });
  });
});
