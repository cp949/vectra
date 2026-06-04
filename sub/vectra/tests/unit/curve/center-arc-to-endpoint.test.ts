/**
 * centerArcToEndpoint allocating companion unit test.
 *
 * 검증 방법:
 * - centerArcToEndpointInto와 동등한 결과를 새 object로 반환한다.
 * - kind/sweep/largeArc 결정 분기에서도 Into와 일치한다.
 * - degenerate(rx<=0 또는 ry<=0)에서 Into와 동일하게 endpoint=center를 기록한다.
 * - non-finite 입력에서도 Into 결과와 동일한 값을 전파한다.
 * - 호출 시마다 새 reference를 반환한다.
 */

import { describe, expect, it } from 'vitest';
import { centerArcToEndpoint } from '../../../src/curve/center-arc-to-endpoint';
import { centerArcToEndpointInto } from '../../../src/curve/center-arc-to-endpoint-into';
import type { ArcCommandWritable, CenterArcLike } from '../../../src/types';

/**
 * Into 비교용 빈 output buffer를 만든다.
 * kind는 ArcCommandWritable type에 따라 'arc'로 고정 초기화한다.
 */
function makeOut(): ArcCommandWritable {
  return {
    kind: 'arc',
    rx: 0,
    ry: 0,
    xRotation: 0,
    largeArc: false,
    sweep: false,
    x: 0,
    y: 0,
  };
}

describe('centerArcToEndpoint', () => {
  it('quarter arc(센터 0,0, sweep=true, 90°)에서 Into 결과와 일치한다', () => {
    const center: CenterArcLike = {
      cx: 0,
      cy: 0,
      rx: 1,
      ry: 1,
      xRotation: 0,
      startAngle: 0,
      endAngle: Math.PI / 2,
      sweep: true,
    };
    const ref = centerArcToEndpointInto(makeOut(), center);
    const got = centerArcToEndpoint(center);
    expect(got).toEqual(ref);
  });

  it('large arc(sweep >= π)에서 largeArc=true가 Into와 일치한다', () => {
    const center: CenterArcLike = {
      cx: 0,
      cy: 0,
      rx: 1,
      ry: 1,
      xRotation: 0,
      startAngle: 0,
      endAngle: Math.PI * 1.5,
      sweep: true,
    };
    const ref = centerArcToEndpointInto(makeOut(), center);
    const got = centerArcToEndpoint(center);
    expect(got).toEqual(ref);
    expect(got.largeArc).toBe(true);
  });

  it('xRotation, 비대칭 rx/ry, sweep=false 조합도 Into 결과와 일치한다', () => {
    const center: CenterArcLike = {
      cx: 2,
      cy: -3,
      rx: 4,
      ry: 1.5,
      xRotation: Math.PI / 6,
      startAngle: Math.PI / 4,
      endAngle: -Math.PI / 3,
      sweep: false,
    };
    const ref = centerArcToEndpointInto(makeOut(), center);
    const got = centerArcToEndpoint(center);
    expect(got).toEqual(ref);
  });

  it('rx<=0 degenerate에서 Into와 동일하게 endpoint=center를 기록한다', () => {
    const center: CenterArcLike = {
      cx: 5,
      cy: 7,
      rx: 0,
      ry: 2,
      xRotation: 0,
      startAngle: 0,
      endAngle: Math.PI,
      sweep: true,
    };
    const ref = centerArcToEndpointInto(makeOut(), center);
    const got = centerArcToEndpoint(center);
    expect(got).toEqual(ref);
    expect(got.x).toBe(5);
    expect(got.y).toBe(7);
    expect(got.largeArc).toBe(false);
  });

  it('ry<=0 degenerate에서도 Into와 동일하게 endpoint=center를 기록한다', () => {
    const center: CenterArcLike = {
      cx: -1,
      cy: 4,
      rx: 3,
      ry: -1,
      xRotation: 0,
      startAngle: 0,
      endAngle: Math.PI,
      sweep: true,
    };
    const ref = centerArcToEndpointInto(makeOut(), center);
    const got = centerArcToEndpoint(center);
    expect(got).toEqual(ref);
    expect(got.x).toBe(-1);
    expect(got.y).toBe(4);
  });

  it('endAngle=Infinity에서 Into와 동일한 endpoint NaN/Infinity를 전파한다', () => {
    const center: CenterArcLike = {
      cx: 0,
      cy: 0,
      rx: 1,
      ry: 1,
      xRotation: 0,
      startAngle: 0,
      endAngle: Number.POSITIVE_INFINITY,
      sweep: true,
    };
    const ref = centerArcToEndpointInto(makeOut(), center);
    const got = centerArcToEndpoint(center);
    // sin/cos(Infinity)는 NaN이라 field 단위로 비교한다.
    expect(Number.isNaN(got.x)).toBe(Number.isNaN(ref.x));
    expect(Number.isNaN(got.y)).toBe(Number.isNaN(ref.y));
    expect(got.largeArc).toBe(ref.largeArc);
    expect(got.sweep).toBe(ref.sweep);
    // |Infinity - 0| >= π → largeArc는 항상 true임을 명시.
    expect(got.largeArc).toBe(true);
  });

  it('startAngle=NaN에서 Into와 동일하게 largeArc 비교 결과를 전파한다', () => {
    const center: CenterArcLike = {
      cx: 0,
      cy: 0,
      rx: 1,
      ry: 1,
      xRotation: 0,
      startAngle: Number.NaN,
      endAngle: 0,
      sweep: true,
    };
    const ref = centerArcToEndpointInto(makeOut(), center);
    const got = centerArcToEndpoint(center);
    expect(got.largeArc).toBe(ref.largeArc);
    expect(got.sweep).toBe(ref.sweep);
  });

  it('호출 시마다 새 object reference를 반환한다', () => {
    const center: CenterArcLike = {
      cx: 0,
      cy: 0,
      rx: 1,
      ry: 1,
      xRotation: 0,
      startAngle: 0,
      endAngle: Math.PI / 2,
      sweep: true,
    };
    const a = centerArcToEndpoint(center);
    const b = centerArcToEndpoint(center);
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });

  it('반환 object는 ArcCommandWritable field를 모두 포함한다', () => {
    const got = centerArcToEndpoint({
      cx: 0,
      cy: 0,
      rx: 1,
      ry: 1,
      xRotation: 0,
      startAngle: 0,
      endAngle: Math.PI / 2,
      sweep: true,
    });
    expect(got.kind).toBe('arc');
    expect(typeof got.rx).toBe('number');
    expect(typeof got.ry).toBe('number');
    expect(typeof got.xRotation).toBe('number');
    expect(typeof got.largeArc).toBe('boolean');
    expect(typeof got.sweep).toBe('boolean');
    expect(typeof got.x).toBe('number');
    expect(typeof got.y).toBe('number');
  });
});
