/**
 * endpointArcToCenter allocating companion unit test.
 *
 * 검증 방법:
 * - endpointArcToCenterInto와 동등한 결과를 새 object로 반환한다.
 * - degenerate case(from == arc endpoint)에서 NaN 없는 zero-length center form을 반환한다.
 * - 호출 시마다 새 reference를 반환한다.
 */

import { describe, expect, it } from 'vitest';
import { endpointArcToCenter } from '../../../src/curve/endpoint-arc-to-center';
import { endpointArcToCenterInto } from '../../../src/curve/endpoint-arc-to-center-into';
import type { ArcCommand, CenterArcWritable } from '../../../src/types';

// 기본 ArcCommand 생성 helper
function makeArc(overrides: Partial<ArcCommand> = {}): ArcCommand {
  return {
    kind: 'arc',
    rx: 1,
    ry: 1,
    xRotation: 0,
    largeArc: false,
    sweep: false,
    x: 1,
    y: 1,
    ...overrides,
  };
}

// Into용 빈 출력 buffer helper
function makeOut(): CenterArcWritable {
  return { cx: 0, cy: 0, rx: 0, ry: 0, xRotation: 0, startAngle: 0, endAngle: 0, sweep: false };
}

describe('endpointArcToCenter', () => {
  it('endpointArcToCenterInto와 동일한 결과를 반환한다 (quarter arc)', () => {
    const from = { x: 1, y: 0 };
    const arc = makeArc({ rx: 1, ry: 1, sweep: true, largeArc: false, x: 0, y: 1 });
    const ref = makeOut();
    endpointArcToCenterInto(ref, from, arc);
    const got = endpointArcToCenter(from, arc);
    expect(got).toEqual(ref);
  });

  it('xRotation/largeArc/sweep 조합에서도 Into 결과와 일치한다', () => {
    const from = { x: 2, y: 3 };
    const arc = makeArc({
      rx: 2,
      ry: 3,
      xRotation: Math.PI / 6,
      largeArc: true,
      sweep: true,
      x: -1,
      y: -1,
    });
    const ref = makeOut();
    endpointArcToCenterInto(ref, from, arc);
    const got = endpointArcToCenter(from, arc);
    expect(got).toEqual(ref);
  });

  it('from == arc endpoint이면 NaN 없는 zero-length center form을 반환한다', () => {
    const got = endpointArcToCenter({ x: 2, y: 3 }, makeArc({ rx: 1, ry: 1, x: 2, y: 3 }));
    expect(Number.isFinite(got.cx)).toBe(true);
    expect(Number.isFinite(got.cy)).toBe(true);
    expect(Number.isFinite(got.startAngle)).toBe(true);
    expect(Number.isFinite(got.endAngle)).toBe(true);
    expect(got.startAngle).toBe(got.endAngle);
    expect(got.cx).toBe(2);
    expect(got.cy).toBe(3);
  });

  it('호출 시마다 새 object reference를 반환한다', () => {
    const from = { x: 1, y: 0 };
    const arc = makeArc({ x: 0, y: 1 });
    const a = endpointArcToCenter(from, arc);
    const b = endpointArcToCenter(from, arc);
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });

  it('반환 object는 모든 CenterArcWritable field를 포함한다', () => {
    const got = endpointArcToCenter({ x: 1, y: 0 }, makeArc({ x: 0, y: 1 }));
    expect(typeof got.cx).toBe('number');
    expect(typeof got.cy).toBe('number');
    expect(typeof got.rx).toBe('number');
    expect(typeof got.ry).toBe('number');
    expect(typeof got.xRotation).toBe('number');
    expect(typeof got.startAngle).toBe('number');
    expect(typeof got.endAngle).toBe('number');
    expect(typeof got.sweep).toBe('boolean');
  });
});
