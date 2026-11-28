/**
 * cubicToArcsInto가 cubic 곡선을 원호 목록으로 근사하는지 검증한다.
 * 사분원 근사의 끝점 일치, 원형 호, tolerance에 따른 분할 수, out 규약을 다룬다.
 * 잘못된 옵션과 non-finite 좌표, 직선, 분할 한계의 RangeError를 확인한다.
 * sweep 방향과 atan2 -π 경계 교차 시 호 중점 위치도 검증한다.
 */
import { flatCubicFromLegacyPoints } from '../_helpers/curve-fixtures';
import { describe, expect, test } from 'vitest';
import { arcPointAtTInto } from '../../../src/curve/arc-point-at-t-into';
import { cubicToArcsInto } from '../../../src/curve/cubic-to-arcs-into';
import type { CenterArcWritable } from '../../../src/types';

// cubic으로 근사한 quarter-circle (unit circle, 1사분면)
const KAPPA = 0.5522847498;
const QC_P0 = { x: 1, y: 0 };
const QC_P1 = { x: 1, y: KAPPA };
const QC_P2 = { x: KAPPA, y: 1 };
const QC_P3 = { x: 0, y: 1 };

// ──────────────────────────────────────────────
// 정상 케이스
// ──────────────────────────────────────────────
describe('cubicToArcsInto — 정상 케이스', () => {
  test('quarter-circle cubic에서 1개 이상 arc를 반환한다', () => {
    const out: CenterArcWritable[] = [];
    cubicToArcsInto(out, flatCubicFromLegacyPoints(QC_P0, QC_P1, QC_P2, QC_P3));
    expect(out.length).toBeGreaterThanOrEqual(1);
  });

  test('quarter-circle cubic은 기본 tolerance에서 정확히 1개 arc를 반환한다', () => {
    const out: CenterArcWritable[] = [];
    cubicToArcsInto(out, flatCubicFromLegacyPoints(QC_P0, QC_P1, QC_P2, QC_P3));
    expect(out).toHaveLength(1);
  });

  test('첫 번째 arc의 시작점이 cubic p0와 일치한다', () => {
    const out: CenterArcWritable[] = [];
    cubicToArcsInto(out, flatCubicFromLegacyPoints(QC_P0, QC_P1, QC_P2, QC_P3));
    const arc = out[0];
    const startX = arc.cx + arc.rx * Math.cos(arc.startAngle);
    const startY = arc.cy + arc.ry * Math.sin(arc.startAngle);
    expect(startX).toBeCloseTo(QC_P0.x, 5);
    expect(startY).toBeCloseTo(QC_P0.y, 5);
  });

  test('마지막 arc의 끝점이 cubic p3와 일치한다', () => {
    const out: CenterArcWritable[] = [];
    cubicToArcsInto(out, flatCubicFromLegacyPoints(QC_P0, QC_P1, QC_P2, QC_P3));
    const arc = out[out.length - 1];
    const endX = arc.cx + arc.rx * Math.cos(arc.endAngle);
    const endY = arc.cy + arc.ry * Math.sin(arc.endAngle);
    expect(endX).toBeCloseTo(QC_P3.x, 5);
    expect(endY).toBeCloseTo(QC_P3.y, 5);
  });

  test('모든 결과 arc는 circular이다 (rx === ry, xRotation === 0)', () => {
    const out: CenterArcWritable[] = [];
    cubicToArcsInto(out, flatCubicFromLegacyPoints(QC_P0, QC_P1, QC_P2, QC_P3));
    for (const arc of out) {
      expect(arc.rx).toBe(arc.ry);
      expect(arc.xRotation).toBe(0);
    }
  });

  test('errorTolerance를 낮추면 segment 수가 같거나 증가한다', () => {
    const out1: CenterArcWritable[] = [];
    const out2: CenterArcWritable[] = [];
    cubicToArcsInto(out1, flatCubicFromLegacyPoints(QC_P0, QC_P1, QC_P2, QC_P3), {
      errorTolerance: 1e-3,
      maxSegments: 64,
      minSegmentT: 1e-6,
    });
    cubicToArcsInto(out2, flatCubicFromLegacyPoints(QC_P0, QC_P1, QC_P2, QC_P3), {
      errorTolerance: 1e-5,
      maxSegments: 64,
      minSegmentT: 1e-6,
    });
    expect(out2.length).toBeGreaterThanOrEqual(out1.length);
  });

  test('zero-length degenerate cubic은 빈 배열을 반환한다', () => {
    const out: CenterArcWritable[] = [];
    const pt = { x: 3, y: 5 };
    const result = cubicToArcsInto(out, flatCubicFromLegacyPoints(pt, pt, pt, pt));
    expect(result).toHaveLength(0);
  });

  test('out을 호출 초기에 clear한다', () => {
    const existing: CenterArcWritable = {
      cx: 99,
      cy: 99,
      rx: 1,
      ry: 1,
      xRotation: 0,
      startAngle: 0,
      endAngle: 1,
      sweep: true,
    };
    const out: CenterArcWritable[] = [existing];
    cubicToArcsInto(out, flatCubicFromLegacyPoints(QC_P0, QC_P1, QC_P2, QC_P3));
    expect(out).not.toContain(existing);
    expect(out[0].cx).not.toBe(99);
  });

  test('반환 reference는 out이다', () => {
    const out: CenterArcWritable[] = [];
    const result = cubicToArcsInto(out, flatCubicFromLegacyPoints(QC_P0, QC_P1, QC_P2, QC_P3));
    expect(result).toBe(out);
  });

  test('결과 arc object는 새 plain object로 생성된다', () => {
    const out: CenterArcWritable[] = [];
    cubicToArcsInto(out, flatCubicFromLegacyPoints(QC_P0, QC_P1, QC_P2, QC_P3));
    expect(out.length).toBeGreaterThan(0);
    for (const arc of out) {
      expect(arc).not.toBe(QC_P0);
      expect(arc).not.toBe(QC_P1);
      expect(arc).not.toBe(QC_P2);
      expect(arc).not.toBe(QC_P3);
    }
  });
});

// ──────────────────────────────────────────────
// 오류 케이스
// ──────────────────────────────────────────────
describe('cubicToArcsInto — 오류 케이스', () => {
  test('errorTolerance가 0이면 RangeError를 던진다', () => {
    expect(() =>
      cubicToArcsInto([], flatCubicFromLegacyPoints(QC_P0, QC_P1, QC_P2, QC_P3), {
        errorTolerance: 0,
        maxSegments: 64,
        minSegmentT: 1e-6,
      })
    ).toThrow(RangeError);
  });

  test('errorTolerance가 음수이면 RangeError를 던진다', () => {
    expect(() =>
      cubicToArcsInto([], flatCubicFromLegacyPoints(QC_P0, QC_P1, QC_P2, QC_P3), {
        errorTolerance: -1,
        maxSegments: 64,
        minSegmentT: 1e-6,
      })
    ).toThrow(RangeError);
  });

  test('errorTolerance가 Infinity이면 RangeError를 던진다', () => {
    expect(() =>
      cubicToArcsInto([], flatCubicFromLegacyPoints(QC_P0, QC_P1, QC_P2, QC_P3), {
        errorTolerance: Infinity,
        maxSegments: 64,
        minSegmentT: 1e-6,
      })
    ).toThrow(RangeError);
  });

  test('errorTolerance가 NaN이면 RangeError를 던진다', () => {
    expect(() =>
      cubicToArcsInto([], flatCubicFromLegacyPoints(QC_P0, QC_P1, QC_P2, QC_P3), {
        errorTolerance: NaN,
        maxSegments: 64,
        minSegmentT: 1e-6,
      })
    ).toThrow(RangeError);
  });

  test('maxSegments가 0이면 RangeError를 던진다', () => {
    expect(() =>
      cubicToArcsInto([], flatCubicFromLegacyPoints(QC_P0, QC_P1, QC_P2, QC_P3), {
        maxSegments: 0,
        errorTolerance: 1e-3,
        minSegmentT: 1e-6,
      })
    ).toThrow(RangeError);
  });

  test('maxSegments가 음수이면 RangeError를 던진다', () => {
    expect(() =>
      cubicToArcsInto([], flatCubicFromLegacyPoints(QC_P0, QC_P1, QC_P2, QC_P3), {
        maxSegments: -1,
        errorTolerance: 1e-3,
        minSegmentT: 1e-6,
      })
    ).toThrow(RangeError);
  });

  test('maxSegments가 NaN이면 RangeError를 던진다', () => {
    expect(() =>
      cubicToArcsInto([], flatCubicFromLegacyPoints(QC_P0, QC_P1, QC_P2, QC_P3), {
        maxSegments: NaN,
        errorTolerance: 1e-3,
        minSegmentT: 1e-6,
      })
    ).toThrow(RangeError);
  });

  test('minSegmentT가 0이면 RangeError를 던진다', () => {
    expect(() =>
      cubicToArcsInto([], flatCubicFromLegacyPoints(QC_P0, QC_P1, QC_P2, QC_P3), {
        minSegmentT: 0,
        errorTolerance: 1e-3,
        maxSegments: 64,
      })
    ).toThrow(RangeError);
  });

  test('minSegmentT가 NaN이면 RangeError를 던진다', () => {
    expect(() =>
      cubicToArcsInto([], flatCubicFromLegacyPoints(QC_P0, QC_P1, QC_P2, QC_P3), {
        minSegmentT: NaN,
        errorTolerance: 1e-3,
        maxSegments: 64,
      })
    ).toThrow(RangeError);
  });

  test('p0.x가 NaN이면 RangeError를 던진다', () => {
    expect(() => cubicToArcsInto([], flatCubicFromLegacyPoints({ x: NaN, y: 0 }, QC_P1, QC_P2, QC_P3))).toThrow(
      RangeError
    );
  });

  test('p1.y가 Infinity이면 RangeError를 던진다', () => {
    expect(() => cubicToArcsInto([], flatCubicFromLegacyPoints(QC_P0, { x: 1, y: Infinity }, QC_P2, QC_P3))).toThrow(
      RangeError
    );
  });

  test('p2.x가 -Infinity이면 RangeError를 던진다', () => {
    expect(() => cubicToArcsInto([], flatCubicFromLegacyPoints(QC_P0, QC_P1, { x: -Infinity, y: 1 }, QC_P3))).toThrow(
      RangeError
    );
  });

  test('p3.y가 NaN이면 RangeError를 던진다', () => {
    expect(() => cubicToArcsInto([], flatCubicFromLegacyPoints(QC_P0, QC_P1, QC_P2, { x: 0, y: NaN }))).toThrow(
      RangeError
    );
  });

  test('options 검증은 control point getter 평가보다 먼저 실행한다', () => {
    const unreadableCurve = {
      ...flatCubicFromLegacyPoints(QC_P0, QC_P1, QC_P2, QC_P3),
      get x0(): number {
        throw new Error('control point getter must not run');
      },
    };

    expect(() =>
      cubicToArcsInto([], unreadableCurve, { errorTolerance: 0, maxSegments: 64, minSegmentT: 1e-6 })
    ).toThrowError('cubicToArcsInto: errorTolerance must be a finite positive number');
  });

  test('제어점 좌표는 호출 초기에 한 번씩만 읽는다', () => {
    let reads = 0;
    cubicToArcsInto([], {
      kind: 'cubic',
      get x0(): number {
        reads++;
        return QC_P0.x;
      },
      get y0(): number {
        reads++;
        return QC_P0.y;
      },
      get x1(): number {
        reads++;
        return QC_P1.x;
      },
      get y1(): number {
        reads++;
        return QC_P1.y;
      },
      get x2(): number {
        reads++;
        return QC_P2.x;
      },
      get y2(): number {
        reads++;
        return QC_P2.y;
      },
      get x3(): number {
        reads++;
        return QC_P3.x;
      },
      get y3(): number {
        reads++;
        return QC_P3.y;
      },
    });
    expect(reads).toBe(8);
  });

  test('collinear straight cubic은 RangeError를 던진다', () => {
    // 완전 직선 cubic: 원호로 근사 불가
    expect(() =>
      cubicToArcsInto([], { kind: 'cubic', x0: 0, y0: 0, x1: 1, y1: 0, x2: 2, y2: 0, x3: 3, y3: 0 })
    ).toThrow(RangeError);
  });

  test('maxSegments 초과 시 RangeError를 던진다', () => {
    // errorTolerance를 매우 엄격하게 하면 분할이 많이 발생하여 maxSegments=1을 초과한다
    expect(() =>
      cubicToArcsInto([], flatCubicFromLegacyPoints(QC_P0, QC_P1, QC_P2, QC_P3), {
        errorTolerance: 1e-12,
        maxSegments: 1,
        minSegmentT: 1e-6,
      })
    ).toThrow(RangeError);
  });

  test('minSegmentT 수렴 실패 시 RangeError를 던진다', () => {
    // 매우 엄격한 tolerance + 큰 minSegmentT → 분할 한계에 도달
    expect(() =>
      cubicToArcsInto([], flatCubicFromLegacyPoints(QC_P0, QC_P1, QC_P2, QC_P3), {
        errorTolerance: 1e-15,
        minSegmentT: 0.4,
        maxSegments: 64,
      })
    ).toThrow(RangeError);
  });
});

// ──────────────────────────────────────────────
// sweep 방향 / atan2 -π 경계 교차
// ──────────────────────────────────────────────
/**
 * 점을 원점 기준으로 phi 라디안만큼 회전한다.
 * 사분원 fixture를 atan2 -π 경계로 옮길 때 쓴다.
 */
function rotate(p: { x: number; y: number }, phi: number): { x: number; y: number } {
  const c = Math.cos(phi);
  const s = Math.sin(phi);
  return { x: p.x * c - p.y * s, y: p.x * s + p.y * c };
}

describe('cubicToArcsInto — sweep 방향과 경계 교차', () => {
  test('±π 경계를 교차하는 CCW arc는 내부 경로가 올바르다 (consumer round-trip)', () => {
    // QC(0°→90° CCW)를 135° 회전하면 135°→225° 사분원이 되어 atan2 -π 경계(180°)를 교차한다.
    const phi = (3 * Math.PI) / 4;
    const out: CenterArcWritable[] = [];
    cubicToArcsInto(
      out,
      flatCubicFromLegacyPoints(rotate(QC_P0, phi), rotate(QC_P1, phi), rotate(QC_P2, phi), rotate(QC_P3, phi))
    );
    expect(out).toHaveLength(1);
    const arc = out[0];
    // 각이 증가하는 진행 → sweep true, endAngle >= startAngle
    expect(arc.sweep).toBe(true);
    expect(arc.endAngle).toBeGreaterThanOrEqual(arc.startAngle);
    // 사분원 기하 중점은 180° 위치 = (-1, 0). raw atan2 endAngle 버그면 (1, 0)으로 어긋난다.
    const mid = arcPointAtTInto({ x: 0, y: 0 }, arc, 0.5);
    expect(mid.x).toBeCloseTo(-1, 5);
    expect(mid.y).toBeCloseTo(0, 5);
  });

  test('역방향(CW) cubic은 sweep=false를 기록하고 내부 경로가 올바르다', () => {
    // QC를 뒤집으면 90°→0° (각 감소, CW) 진행이다.
    const out: CenterArcWritable[] = [];
    cubicToArcsInto(out, flatCubicFromLegacyPoints(QC_P3, QC_P2, QC_P1, QC_P0));
    expect(out).toHaveLength(1);
    const arc = out[0];
    expect(arc.sweep).toBe(false);
    expect(arc.endAngle).toBeLessThan(arc.startAngle);
    // 기하 중점은 45° 위치 = (√½, √½).
    const mid = arcPointAtTInto({ x: 0, y: 0 }, arc, 0.5);
    expect(mid.x).toBeCloseTo(Math.SQRT1_2, 5);
    expect(mid.y).toBeCloseTo(Math.SQRT1_2, 5);
  });

  test('±π 경계를 교차하는 CW arc도 내부 경로가 올바르다 (consumer round-trip)', () => {
    // 135° 회전한 QC를 뒤집으면 225°→135° (각 감소, CW)로 -π 경계를 교차한다.
    // sweep=false + (relEnd - 2π) unwrap 경로가 경계를 넘는 유일한 케이스다.
    const phi = (3 * Math.PI) / 4;
    const out: CenterArcWritable[] = [];
    cubicToArcsInto(
      out,
      flatCubicFromLegacyPoints(rotate(QC_P3, phi), rotate(QC_P2, phi), rotate(QC_P1, phi), rotate(QC_P0, phi))
    );
    expect(out).toHaveLength(1);
    const arc = out[0];
    expect(arc.sweep).toBe(false);
    expect(arc.endAngle).toBeLessThan(arc.startAngle);
    // 사분원 기하 중점은 180° 위치 = (-1, 0). raw atan2 endAngle 버그면 (1, 0)으로 어긋난다.
    const mid = arcPointAtTInto({ x: 0, y: 0 }, arc, 0.5);
    expect(mid.x).toBeCloseTo(-1, 5);
    expect(mid.y).toBeCloseTo(0, 5);
  });
});
