import { describe, expect, test } from 'vitest';
import { connectorLine, connectorLineInto } from '../../../src/editor-geometry';

describe('connectorLineInto', () => {
  test('두 bounds 중심을 잇는 segment를 기록한다', () => {
    const out = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };

    const result = connectorLineInto(
      out,
      { min: { x: 0, y: 2 }, max: { x: 10, y: 8 } },
      { min: { x: -4, y: -6 }, max: { x: 0, y: 2 } }
    );

    expect(result).toBe(out);
    expect(out).toEqual({
      a: { x: 5, y: 5 },
      b: { x: -2, y: -2 },
    });
  });

  test('tuple endpoint output과 input aliasing을 보존한다', () => {
    const from = { min: [0, 0] as [number, number], max: [4, 8] as [number, number] };
    const to = { min: from.min, max: [10, 10] as [number, number] };
    const out = { a: from.min, b: to.max };

    connectorLineInto(out, from, to);

    expect(out.a).toEqual([2, 4]);
    expect(out.b).toEqual([5, 5]);
  });
});

describe('connectorLine', () => {
  test('plain segment object를 새로 반환한다', () => {
    const result = connectorLine(
      { min: { x: 0, y: 0 }, max: { x: 2, y: 2 } },
      { min: { x: 4, y: 6 }, max: { x: 8, y: 10 } }
    );

    expect(result).toEqual({
      a: { x: 1, y: 1 },
      b: { x: 6, y: 8 },
    });
  });
});
