/**
 * editor-geometry constrain-rotate 단위 테스트
 *
 * constrainRotate 동작을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { constrainRotate } from '../../../src/editor-geometry/constrain-rotate';

const PI = Math.PI;
const DEG45 = PI / 4;
const DEG15 = PI / 12;

// ---------------------------------------------------------------------------
// tolerance 정책 — 양의 유한수가 아니면 snap 없음
// ---------------------------------------------------------------------------

describe('tolerance 비정상', () => {
  test('tolerance === 0: snap 없음, angle 그대로', () => {
    const angle = DEG45 * 0.4;
    expect(constrainRotate(angle, { step: DEG45, tolerance: 0 })).toBe(angle);
  });

  test('tolerance 음수: snap 없음, angle 그대로', () => {
    const angle = DEG45 * 0.4;
    expect(constrainRotate(angle, { step: DEG45, tolerance: -0.1 })).toBe(angle);
  });

  test('tolerance Infinity: snap 항상 발동', () => {
    // Infinity도 양의 유한수가 아니므로 snap 없음
    const angle = DEG45 * 0.4;
    expect(constrainRotate(angle, { step: DEG45, tolerance: Infinity })).toBe(angle);
  });

  test('tolerance NaN: snap 없음', () => {
    const angle = DEG45 * 0.4;
    expect(constrainRotate(angle, { step: DEG45, tolerance: Number.NaN })).toBe(angle);
  });
});

// ---------------------------------------------------------------------------
// step snap
// ---------------------------------------------------------------------------

describe('step snap', () => {
  test('tolerance 이내: 가장 가까운 step 배수로 snap', () => {
    // angle = 45° * 0.3 = 13.5°, step = 45°, tolerance = 20°
    // 가장 가까운 step: 0
    const angle = DEG45 * 0.3;
    const result = constrainRotate(angle, { step: DEG45, tolerance: DEG45 * 0.5 });
    expect(result).toBeCloseTo(0, 10);
  });

  test('tolerance 밖: angle 그대로', () => {
    // angle = 45° * 0.4 = 18°, step = 45°, tolerance = 10°
    // 가장 가까운 step: 0 (거리 = 18°), tolerance = 10° 미만 → snap 없음
    const angle = DEG45 * 0.4;
    const result = constrainRotate(angle, { step: DEG45, tolerance: DEG45 * 0.2 });
    expect(result).toBe(angle);
  });

  test('step snap: PI/4 단위로 PI/2에 snap', () => {
    const angle = PI / 2 + DEG45 * 0.1;
    const result = constrainRotate(angle, { step: DEG45, tolerance: DEG45 * 0.3 });
    expect(result).toBeCloseTo(PI / 2, 10);
  });

  test('음수 angle: 음수 step 배수로 snap', () => {
    const angle = -DEG45 * 0.3;
    const result = constrainRotate(angle, { step: DEG45, tolerance: DEG45 * 0.5 });
    expect(result).toBeCloseTo(0, 10);
  });

  test('invalid step (0): NaN propagation', () => {
    expect(constrainRotate(1.0, { step: 0, tolerance: 1.0 })).toBeNaN();
  });

  test('invalid step (음수): NaN propagation', () => {
    expect(constrainRotate(1.0, { step: -1, tolerance: 1.0 })).toBeNaN();
  });

  test('invalid step (NaN): NaN propagation', () => {
    expect(constrainRotate(1.0, { step: Number.NaN, tolerance: 1.0 })).toBeNaN();
  });
});

// ---------------------------------------------------------------------------
// snapAngles
// ---------------------------------------------------------------------------

describe('snapAngles', () => {
  test('가장 가까운 snapAngle로 snap (tolerance 이내)', () => {
    const snapAngles = [0, PI / 2, PI];
    const angle = PI / 2 + 0.05;
    const result = constrainRotate(angle, { snapAngles, tolerance: 0.1 });
    expect(result).toBeCloseTo(PI / 2, 10);
  });

  test('tolerance 밖이면 snap 없음', () => {
    const snapAngles = [0, PI / 2, PI];
    const angle = PI / 2 + 0.2;
    const result = constrainRotate(angle, { snapAngles, tolerance: 0.1 });
    expect(result).toBe(angle);
  });

  test('빈 snapAngles: step 없으면 snap 없음', () => {
    const angle = DEG45 * 0.3;
    const result = constrainRotate(angle, { snapAngles: [], tolerance: 1.0 });
    expect(result).toBe(angle);
  });

  test('여러 snapAngles 중 가장 가까운 것 선택', () => {
    const snapAngles = [0, DEG45, PI / 2];
    // angle = DEG45 + 0.05 → DEG45에 더 가깝다
    const angle = DEG45 + 0.05;
    const result = constrainRotate(angle, { snapAngles, tolerance: 0.1 });
    expect(result).toBeCloseTo(DEG45, 10);
  });
});

// ---------------------------------------------------------------------------
// step + snapAngles 둘 다 지정 — 더 가까운 쪽 반환
// ---------------------------------------------------------------------------

describe('step + snapAngles 조합', () => {
  test('step 후보가 더 가까우면 step 후보 반환', () => {
    // step = 45°, snapAngles = [30°]
    // angle = 44° → step 후보: 45° (거리 1°), snapAngle 후보: 30° (거리 14°)
    // step이 더 가깝다
    const step = DEG45;
    const snapAngles = [DEG15 * 2]; // 30°
    const angle = DEG45 - DEG15 * 0.07; // ~44°
    const result = constrainRotate(angle, { step, snapAngles, tolerance: 0.1 });
    expect(result).toBeCloseTo(DEG45, 10);
  });

  test('snapAngles 후보가 더 가까우면 snapAngles 후보 반환', () => {
    // step = 45°, snapAngles = [43°]
    // angle = 43.5° → step 후보: 45° (거리 1.5°), snapAngle 후보: 43° (거리 0.5°)
    // snapAngle이 더 가깝다
    const step = DEG45;
    const targetSnap = (43 * PI) / 180;
    const angle = (43.5 * PI) / 180;
    const result = constrainRotate(angle, { step, snapAngles: [targetSnap], tolerance: 0.1 });
    expect(result).toBeCloseTo(targetSnap, 10);
  });

  test('두 후보가 동일 거리: step 후보 우선 (insertion order)', () => {
    // step = 45°, snapAngles = [step - delta]
    // 동일 거리일 때 step 후보를 먼저 계산하므로 step 반환
    const step = DEG45;
    const delta = 0.01;
    const snapTarget = DEG45 - delta;
    const angle = DEG45 - delta / 2; // 정확히 중간
    const result = constrainRotate(angle, { step, snapAngles: [snapTarget], tolerance: 0.1 });
    // step 후보: DEG45 (거리 delta/2), snapAngle: snapTarget (거리 delta/2)
    // 동일 거리 → step 우선
    expect(result).toBeCloseTo(DEG45, 10);
  });
});

// ---------------------------------------------------------------------------
// signed-zero 경계
// ---------------------------------------------------------------------------

describe('signed-zero', () => {
  test('angle = -0: step snap 결과가 NaN이 아님', () => {
    // -0 입력이 NaN을 유발하지 않아야 한다
    const result = constrainRotate(-0, { step: DEG45, tolerance: DEG45 * 0.5 });
    expect(result).not.toBeNaN();
    expect(result).toBeCloseTo(0, 10);
  });
});

// ---------------------------------------------------------------------------
// NaN propagation
// ---------------------------------------------------------------------------

describe('NaN propagation', () => {
  test('angle NaN: NaN 반환', () => {
    expect(constrainRotate(Number.NaN, { step: DEG45, tolerance: 0.1 })).toBeNaN();
  });
});
