/**
 * correctEndpointArcRadii allocating companion unit test.
 *
 * 검증 방법:
 * - correctEndpointArcRadiiInto와 동등한 결과를 새 object로 반환한다.
 * - 보정이 필요한 경우와 필요 없는 경우 모두 Into와 일치한다.
 * - degenerate radius(rx<=0, ry<=0) 분기에서도 Into 결과와 일치한다.
 * - non-finite radius/coord에서도 Into 결과와 동일한 값을 전파한다.
 * - 호출 시마다 새 reference를 반환한다.
 */

import { describe, expect, it } from 'vitest';
import { correctEndpointArcRadii } from '../../../src/curve/correct-endpoint-arc-radii';
import { correctEndpointArcRadiiInto } from '../../../src/curve/correct-endpoint-arc-radii-into';
import type { ArcCommand, EndpointArcCorrectionWritable } from '../../../src/types';

/**
 * 테스트 기본값을 가진 ArcCommand를 만든다.
 * 각 케이스가 필요한 필드만 덮어쓴다.
 */
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

/**
 * Into 비교용 빈 output buffer를 만든다.
 */
function makeOut(): EndpointArcCorrectionWritable {
  return { rx: 0, ry: 0 };
}

describe('correctEndpointArcRadii', () => {
  it('보정이 필요 없는 경우 Into 결과와 일치한다', () => {
    const from = { x: 0, y: 0 };
    const arc = makeArc({ rx: 1, ry: 1, x: 1, y: 0 });
    const ref = correctEndpointArcRadiiInto(makeOut(), from, arc);
    const got = correctEndpointArcRadii(from, arc);
    expect(got).toEqual(ref);
  });

  it('endpoint 거리가 표현 범위를 넘으면 Into와 동일하게 동일 비율로 확대한다', () => {
    const from = { x: 0, y: 0 };
    const arc = makeArc({ rx: 1, ry: 1, x: 10, y: 0 });
    const ref = correctEndpointArcRadiiInto(makeOut(), from, arc);
    const got = correctEndpointArcRadii(from, arc);
    expect(got).toEqual(ref);
  });

  it('xRotation이 있는 ellipse도 Into 결과와 일치한다', () => {
    const from = { x: 0, y: 0 };
    const arc = makeArc({ rx: 1, ry: 1, xRotation: Math.PI / 2, x: 10, y: 0 });
    const ref = correctEndpointArcRadiiInto(makeOut(), from, arc);
    const got = correctEndpointArcRadii(from, arc);
    expect(got).toEqual(ref);
  });

  it('rx=0 degenerate에서 Into와 동일하게 원본 rx/ry를 그대로 반환한다', () => {
    const from = { x: 0, y: 0 };
    const arc = makeArc({ rx: 0, ry: 1, x: 5, y: 0 });
    const ref = correctEndpointArcRadiiInto(makeOut(), from, arc);
    const got = correctEndpointArcRadii(from, arc);
    expect(got).toEqual(ref);
    expect(got.rx).toBe(0);
    expect(got.ry).toBe(1);
  });

  it('ry<=0 degenerate에서 Into와 동일하게 원본 rx/ry를 그대로 반환한다', () => {
    const from = { x: 0, y: 0 };
    const arc = makeArc({ rx: 2, ry: -3, x: 5, y: 0 });
    const ref = correctEndpointArcRadiiInto(makeOut(), from, arc);
    const got = correctEndpointArcRadii(from, arc);
    expect(got).toEqual(ref);
    expect(got.rx).toBe(2);
    expect(got.ry).toBe(-3);
  });

  it('rx=Infinity면 Into와 동일하게 보정 없이 원본 값을 전파한다', () => {
    const from = { x: 0, y: 0 };
    const arc = makeArc({ rx: Number.POSITIVE_INFINITY, ry: 1, x: 5, y: 0 });
    const ref = correctEndpointArcRadiiInto(makeOut(), from, arc);
    const got = correctEndpointArcRadii(from, arc);
    expect(got).toEqual(ref);
  });

  it('rx=NaN면 Into와 동일하게 degenerate 분기로 원본 NaN을 전파한다', () => {
    const from = { x: 0, y: 0 };
    const arc = makeArc({ rx: Number.NaN, ry: 1, x: 5, y: 0 });
    const ref = correctEndpointArcRadiiInto(makeOut(), from, arc);
    const got = correctEndpointArcRadii(from, arc);
    // NaN !== NaN이라 toEqual로 비교하기 위해 field 단위로 검사
    expect(Number.isNaN(got.rx)).toBe(true);
    expect(Number.isNaN(ref.rx)).toBe(true);
    expect(got.ry).toBe(ref.ry);
  });

  it('endpoint -Infinity에서 Into와 동일하게 비교 결과를 전파한다', () => {
    const from = { x: 0, y: 0 };
    const arc = makeArc({ rx: 1, ry: 1, x: Number.NEGATIVE_INFINITY, y: 0 });
    const ref = correctEndpointArcRadiiInto(makeOut(), from, arc);
    const got = correctEndpointArcRadii(from, arc);
    expect(got.rx).toBe(ref.rx);
    expect(got.ry).toBe(ref.ry);
  });

  it('from.y=NaN에서 Into와 동일하게 lambda NaN을 전파한다', () => {
    const from = { x: 0, y: Number.NaN };
    const arc = makeArc({ rx: 1, ry: 1, x: 1, y: 0 });
    const ref = correctEndpointArcRadiiInto(makeOut(), from, arc);
    const got = correctEndpointArcRadii(from, arc);
    // NaN !== NaN이라 field별 NaN 여부로 비교
    expect(Number.isNaN(got.rx)).toBe(Number.isNaN(ref.rx));
    expect(Number.isNaN(got.ry)).toBe(Number.isNaN(ref.ry));
  });

  it('arc.xRotation=Infinity에서 Into와 동일하게 NaN을 전파한다', () => {
    const from = { x: 0, y: 0 };
    const arc = makeArc({ rx: 1, ry: 1, xRotation: Number.POSITIVE_INFINITY, x: 10, y: 0 });
    const ref = correctEndpointArcRadiiInto(makeOut(), from, arc);
    const got = correctEndpointArcRadii(from, arc);
    expect(Number.isNaN(got.rx)).toBe(Number.isNaN(ref.rx));
    expect(Number.isNaN(got.ry)).toBe(Number.isNaN(ref.ry));
  });

  it('호출 시마다 새 object reference를 반환한다', () => {
    const from = { x: 0, y: 0 };
    const arc = makeArc({ x: 1, y: 0 });
    const a = correctEndpointArcRadii(from, arc);
    const b = correctEndpointArcRadii(from, arc);
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });

  it('반환 object는 EndpointArcCorrectionWritable field를 포함한다', () => {
    const got = correctEndpointArcRadii({ x: 0, y: 0 }, makeArc({ x: 1, y: 0 }));
    expect(typeof got.rx).toBe('number');
    expect(typeof got.ry).toBe('number');
  });
});
