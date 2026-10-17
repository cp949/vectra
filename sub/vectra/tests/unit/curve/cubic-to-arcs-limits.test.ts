/**
 * cubicToArcsInto의 수치 한계 동작 테스트.
 *
 * 검증 항목:
 *  1. 거의 직선인 cubic은 곡률 반지름이 각도 해상도를 넘어 sweep이 0인 arc 하나가 된다.
 *
 * 설계 메모:
 *  - 1번은 알려진 한계다. 끝점이 서로 다른데도 arc가 한 점으로 붕괴한다.
 *    정확히 직선인 cubic은 RangeError를 던지므로 두 동작이 어긋난다.
 *  - 이 테스트는 현재 동작을 고정한다. 동작을 바꾸면 이 테스트를 함께 고친다.
 */
import { describe, expect, test } from 'vitest';
import { cubicToArcsInto } from '../../../src/curve/cubic-to-arcs-into';
import type { CenterArcWritable } from '../../../src/types';

describe('cubicToArcsInto 수치 한계', () => {
  test('곡률 반지름이 3e16쯤인 cubic은 sweep이 0인 arc 하나가 된다', () => {
    const out: CenterArcWritable[] = [];
    cubicToArcsInto(out, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 1e-16 }, { x: 3, y: 0 });
    expect(out).toHaveLength(1);
    expect(out[0].rx / 3e16).toBeCloseTo(1, 6);
    expect(out[0].endAngle).toBe(out[0].startAngle);
    expect(out[0].sweep).toBe(true);
  });

  test('오목한 쪽으로 휘어도 sweep 0 arc가 되며 center는 반대편에 놓인다', () => {
    const out: CenterArcWritable[] = [];
    cubicToArcsInto(out, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: -1e-16 }, { x: 3, y: 0 });
    expect(out).toHaveLength(1);
    expect(out[0].cy).toBeGreaterThan(0);
    expect(out[0].endAngle).toBe(out[0].startAngle);
  });
});
