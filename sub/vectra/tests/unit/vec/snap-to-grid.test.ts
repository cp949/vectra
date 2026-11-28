/**
 * snapToGrid helper 단위 테스트.
 *
 * 대상 함수:
 *  - snapToGridInto : point를 component-wise grid vector로 snap하여 out에 기록
 *  - snapToGrid     : allocating companion
 */

import { describe, expect, test } from 'vitest';
import type { PointWritable } from '../../../src/types';
import { snapToGrid } from '../../../src/vec/snap-to-grid';
import { snapToGridInto } from '../../../src/vec/snap-to-grid-into';

describe('snapToGridInto — component-wise grid snap', () => {
  test('object point를 vector grid로 component-wise snap한다', () => {
    const out: PointWritable = { x: 0, y: 0 };
    const result = snapToGridInto(out, { x: 12.2, y: 18.7 }, { x: 5, y: 10 });

    expect(result).toBe(out);
    expect(out.x).toBe(10);
    expect(out.y).toBe(20);
  });

  test('균일 grid에서 각 성분을 독립적으로 snap한다', () => {
    const out: PointWritable = { x: 0, y: 0 };
    snapToGridInto(out, { x: 12.2, y: 18.7 }, { x: 5, y: 5 });

    expect(out.x).toBe(10);
    expect(out.y).toBe(20);
  });

  test('음수 좌표를 scalar snap과 동일하게 처리한다', () => {
    const out: PointWritable = { x: 0, y: 0 };
    snapToGridInto(out, { x: -12.2, y: -18.7 }, { x: 5, y: 10 });

    expect(out.x).toBe(-10);
    expect(out.y).toBe(-20);
  });

  test('동률 0.5는 Math.round 정책에 따라 양의 무한대 방향으로 올림한다', () => {
    const out: PointWritable = { x: 0, y: 0 };
    snapToGridInto(out, { x: 2.5, y: -2.5 }, { x: 1, y: 1 });

    expect(out.x).toBe(3);
    expect(out.y).toBe(-2);
  });

  test('grid size 0은 NaN 성분을 기록한다', () => {
    const out: PointWritable = { x: 0, y: 0 };
    snapToGridInto(out, { x: 5, y: 7 }, { x: 0, y: 0 });

    expect(Number.isNaN(out.x)).toBe(true);
    expect(Number.isNaN(out.y)).toBe(true);
  });

  test('non-finite 입력은 검증 없이 통과된다', () => {
    const out: PointWritable = { x: 0, y: 0 };
    snapToGridInto(out, { x: NaN, y: Infinity }, { x: 5, y: 5 });

    expect(Number.isNaN(out.x)).toBe(true);
    expect(out.y).toBe(Infinity);
  });

  test('-Infinity 입력은 검증 없이 통과된다', () => {
    const out: PointWritable = { x: 0, y: 0 };
    snapToGridInto(out, { x: -Infinity, y: -Infinity }, { x: 5, y: 5 });

    expect(out.x).toBe(-Infinity);
    expect(out.y).toBe(-Infinity);
  });

  test('out === input self-aliasing에서도 정확한 결과를 반환한다', () => {
    const point: PointWritable = { x: 12.2, y: 18.7 };
    const result = snapToGridInto(point, point, { x: 5, y: 10 });

    expect(result).toBe(point);
    expect(point.x).toBe(10);
    expect(point.y).toBe(20);
  });

  test('out === grid self-aliasing에서도 정확한 결과를 반환한다', () => {
    const grid: PointWritable = { x: 5, y: 10 };
    const result = snapToGridInto(grid, { x: 12.2, y: 18.7 }, grid);

    expect(result).toBe(grid);
    expect(grid.x).toBe(10);
    expect(grid.y).toBe(20);
  });
});

describe('snapToGrid — allocating companion', () => {
  test('grid에 스냅된 새 벡터를 반환한다', () => {
    const result = snapToGrid({ x: 12.2, y: 18.7 }, { x: 5, y: 10 });

    expect(result.x).toBe(10);
    expect(result.y).toBe(20);
  });
});
