/** 두 경계의 중심을 평평한 선분으로 연결하는지 검증한다. */
import { describe, expect, test } from 'vitest';
import { connectorLine, connectorLineInto } from '../../../src/editor-geometry';

describe('connectorLineInto', () => {
  test('두 bounds 중심을 잇는 segment를 기록한다', () => {
    const out = { x1: 0, y1: 0, x2: 0, y2: 0 };

    const result = connectorLineInto(
      out,
      { minX: 0, minY: 2, maxX: 10, maxY: 8 },
      { minX: -4, minY: -6, maxX: 0, maxY: 2 }
    );

    expect(result).toBe(out);
    expect(out).toEqual({
      x1: 5,
      y1: 5,
      x2: -2,
      y2: -2,
    });
  });
});

describe('connectorLine', () => {
  test('plain segment object를 새로 반환한다', () => {
    const result = connectorLine({ minX: 0, minY: 0, maxX: 2, maxY: 2 }, { minX: 4, minY: 6, maxX: 8, maxY: 10 });

    expect(result).toEqual({
      x1: 1,
      y1: 1,
      x2: 6,
      y2: 8,
    });
  });
});
