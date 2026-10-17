/**
 * cubicToArcsInto의 수치 한계 동작 테스트.
 *
 * 검증 항목:
 *  1. 거의 직선인 cubic은 곡률 반지름이 각도 해상도를 넘어 중심각이 사라지므로
 *     정확히 직선인 cubic과 같이 collinear RangeError를 던진다.
 *  2. 곡률 반지름이 해상도 안쪽이면 같은 모양의 cubic도 정상적으로 arc가 된다.
 *
 * 설계 메모:
 *  - 예전에는 1번이 startAngle === endAngle인 arc 하나를 돌려줬다.
 *    끝점이 달라도 arc가 한 점으로 붕괴하는 출력이었다.
 */
import { describe, expect, test } from 'vitest';
import { cubicToArcsInto } from '../../../src/curve/cubic-to-arcs-into';
import type { CenterArcWritable } from '../../../src/types';

describe('cubicToArcsInto 수치 한계', () => {
  test('곡률 반지름이 3e16쯤인 cubic은 collinear RangeError를 던진다', () => {
    const out: CenterArcWritable[] = [];
    expect(() => cubicToArcsInto(out, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 1e-16 }, { x: 3, y: 0 })).toThrow(
      /collinear segment cannot be approximated/
    );
  });

  test('반대쪽으로 휘어도 collinear RangeError를 던진다', () => {
    const out: CenterArcWritable[] = [];
    expect(() => cubicToArcsInto(out, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: -1e-16 }, { x: 3, y: 0 })).toThrow(
      RangeError
    );
  });

  test('정확히 직선인 cubic과 같은 오류 메시지를 쓴다', () => {
    const out: CenterArcWritable[] = [];
    const message = (y: number) => {
      try {
        cubicToArcsInto(out, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y }, { x: 3, y: 0 });
        return 'no error';
      } catch (error) {
        return (error as Error).message;
      }
    };
    expect(message(1e-16)).toBe(message(0));
  });

  test('곡률 반지름이 해상도 안쪽이면 sweep이 양수인 arc가 된다', () => {
    const out: CenterArcWritable[] = [];
    cubicToArcsInto(out, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 1e-3 }, { x: 3, y: 0 });
    expect(out.length).toBeGreaterThan(0);
    for (const arc of out) expect(arc.endAngle).not.toBe(arc.startAngle);
  });
});
