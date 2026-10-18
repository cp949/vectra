/**
 * cubicToArcsInto의 수치 한계 동작 테스트.
 *
 * 검증 항목:
 *  1. 거의 직선인 cubic은 곡률 반지름이 각도 해상도를 넘어 endAngle이 startAngle로 반올림되므로
 *     정확히 직선인 cubic과 같이 collinear RangeError를 던진다.
 *  2. 곡률 반지름이 해상도 안쪽이면 같은 모양의 cubic도 정상적으로 arc가 된다.
 *  3. 해상도 경계의 아주 작은 중심각은 휘는 방향과 관계없이 작은 각폭으로 남는다.
 *  4. center-form으로 재구성한 끝점이 errorTolerance 안에 있다.
 *     반지름이 크면 startAngle 반올림만으로 끝점이 어긋나므로 그런 segment는 collinear RangeError로 끝난다.
 *
 * 설계 메모:
 *  - 예전에는 1번이 startAngle === endAngle인 arc 하나를 돌려줬다.
 *    끝점이 달라도 arc가 한 점으로 붕괴하는 출력이었다.
 */
import { describe, expect, test } from 'vitest';
import { cubicToArcsInto } from '../../../src/curve/cubic-to-arcs-into';
import type { CenterArcWritable } from '../../../src/types';

/**
 * arc의 startAngle 또는 endAngle을 center-form으로 재구성한 점과 기대 점의 거리.
 */
function endpointError(arc: CenterArcWritable, angle: number, x: number, y: number): number {
  return Math.hypot(arc.cx + arc.rx * Math.cos(angle) - x, arc.cy + arc.rx * Math.sin(angle) - y);
}

describe('cubicToArcsInto 수치 한계', () => {
  const loose = { errorTolerance: 10 };

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

  test('곡률 반지름이 해상도 안쪽이면 중심각이 0이 아닌 arc가 된다', () => {
    const out: CenterArcWritable[] = [];
    cubicToArcsInto(out, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 1e-3 }, { x: 3, y: 0 });
    expect(out.length).toBeGreaterThan(0);
    for (const arc of out) expect(arc.endAngle).not.toBe(arc.startAngle);
  });

  test('아주 작은 음수 중심각이 2π로 접혀 원 한 바퀴 arc가 되지 않는다', () => {
    // 곡률 반지름이 3e15다. 예전에는 절대 각도 차 -1.1e-15를 [0, 2π)로 접어 각폭 2π arc를 돌려줬다.
    // 끝점 재구성 오차가 0.3쯤이라 기본 errorTolerance로는 RangeError다. 허용오차를 넓혀 arc를 받는다.
    const out: CenterArcWritable[] = [];
    cubicToArcsInto(out, { x: 0, y: 0 }, { x: -1, y: 0 }, { x: -2, y: -1e-15 }, { x: -3, y: 0 }, loose);
    expect(out.length).toBeGreaterThan(0);
    for (const arc of out) expect(Math.abs(arc.endAngle - arc.startAngle)).toBeLessThan(1e-12);
  });

  test('π 회전한 cubic도 같은 각폭의 arc가 된다', () => {
    const out: CenterArcWritable[] = [];
    const rotated: CenterArcWritable[] = [];
    cubicToArcsInto(out, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 1e-15 }, { x: 3, y: 0 }, loose);
    cubicToArcsInto(rotated, { x: 0, y: 0 }, { x: -1, y: 0 }, { x: -2, y: -1e-15 }, { x: -3, y: 0 }, loose);
    expect(rotated.length).toBe(out.length);
    for (let i = 0; i < out.length; i++) {
      expect(rotated[i].endAngle - rotated[i].startAngle).toBeCloseTo(out[i].endAngle - out[i].startAngle, 15);
    }
  });

  test('곡률 반지름이 3e15인 cubic은 끝점이 어긋난 arc 대신 collinear RangeError를 던진다', () => {
    // startAngle 반올림만으로 시작점이 0.3쯤 어긋난다. 기본 errorTolerance 1e-3을 넘는다.
    const out: CenterArcWritable[] = [];
    expect(() => cubicToArcsInto(out, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 1e-15 }, { x: 3, y: 0 })).toThrow(
      /collinear segment cannot be approximated/
    );
  });

  test('돌려준 arc의 재구성 끝점은 errorTolerance 안에 있다', () => {
    const errorTolerance = 1e-3;
    for (let exponent = -16; exponent <= -8; exponent += 0.25) {
      for (const sign of [1, -1]) {
        const out: CenterArcWritable[] = [];
        const y = sign * 10 ** exponent;
        try {
          cubicToArcsInto(out, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y }, { x: 3, y: 0 }, { errorTolerance });
        } catch (error) {
          expect((error as Error).message).toMatch(/collinear segment cannot be approximated/);
          continue;
        }
        const first = out[0];
        const last = out[out.length - 1];
        expect(endpointError(first, first.startAngle, 0, 0)).toBeLessThanOrEqual(errorTolerance);
        expect(endpointError(last, last.endAngle, 3, 0)).toBeLessThanOrEqual(errorTolerance);
        for (let i = 1; i < out.length; i++) {
          const prev = out[i - 1];
          const joint = endpointError(
            out[i],
            out[i].startAngle,
            prev.cx + prev.rx * Math.cos(prev.endAngle),
            prev.cy + prev.rx * Math.sin(prev.endAngle)
          );
          expect(joint).toBeLessThanOrEqual(2 * errorTolerance);
        }
      }
    }
  });

  test('끝점 재구성 오차가 errorTolerance 안이면 큰 반지름 arc도 받는다', () => {
    const out: CenterArcWritable[] = [];
    cubicToArcsInto(out, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 1e-15 }, { x: 3, y: 0 }, { errorTolerance: 1 });
    expect(out.length).toBe(1);
    expect(endpointError(out[0], out[0].startAngle, 0, 0)).toBeLessThanOrEqual(1);
  });
});
