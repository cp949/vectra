/**
 * usability-recipes.test.ts
 *
 * MVP usability recipe 테스트.
 * 단위 함수 정확성이 아니라 실제 사용 시나리오에서 API가 편리한지를 검증한다.
 * - subpath import가 자연스러운가
 * - tuple/object/class instance가 억지 캐스팅 없이 흐르는가
 * - caller-owned output을 재사용할 수 있는가
 * - 여러 domain 조합에 glue code가 과하지 않은가
 * - README/docs 예제가 실제 API와 어긋나지 않는가
 */

import { describe, expect, it } from 'vitest';

// ── 레시피 1: 마우스 좌표를 segment에 투영하여 closest point 구하기 ──────────
// canvas demo의 segment snap 예제와 동일한 흐름을 검증한다.
describe('레시피 1: segment 투영과 snap point 계산', () => {
  it('object XYInput으로 closestPointInto, projectionT, distanceToPoint를 연결할 수 있다', async () => {
    const { closestPointInto } = await import('../../src/segment/closest-point-into');
    const { projectionT } = await import('../../src/segment/projection-t');
    const { distanceToPoint } = await import('../../src/segment/distance-to-point');
    const { length } = await import('../../src/segment/length');

    const line = { a: { x: 0, y: 0 }, b: { x: 100, y: 0 } };
    const pointer = { x: 50, y: 30 };

    // caller-owned output — 재사용 가능한 object
    const snap = { x: 0, y: 0 };
    const result = closestPointInto(snap, line, pointer);

    // out을 반환하므로 chain 가능하다
    expect(result).toBe(snap);
    // 수평 segment에서 pointer 바로 아래 점에 snap된다
    expect(snap.x).toBeCloseTo(50, 10);
    expect(snap.y).toBeCloseTo(0, 10);

    // scalar 결과는 직접 반환한다
    const t = projectionT(line, pointer);
    expect(t).toBeCloseTo(0.5, 10);

    const dist = distanceToPoint(line, pointer);
    expect(dist).toBeCloseTo(30, 10);

    const lineLen = length(line);
    expect(lineLen).toBeCloseTo(100, 10);
  });

  it('tuple XYInput으로도 snap point를 구할 수 있다 (억지 캐스팅 없음)', async () => {
    const { closestPointInto } = await import('../../src/segment/closest-point-into');
    const { projectionT } = await import('../../src/segment/projection-t');

    // tuple 형태 XYInput — XYWritable도 겸한다
    const line = { a: [0, 0] as [number, number], b: [100, 0] as [number, number] };
    const pointer: [number, number] = [75, 40];

    const snap: [number, number] = [0, 0];
    closestPointInto(snap, line, pointer);

    expect(snap[0]).toBeCloseTo(75, 10);
    expect(snap[1]).toBeCloseTo(0, 10);

    const t = projectionT(line, pointer);
    expect(t).toBeCloseTo(0.75, 10);
  });
});

// ── 레시피 2: 드래그 중 selection bounds 갱신 ──────────────────────────────────
// canvas demo의 Selection Bounds 예제와 동일한 흐름을 검증한다.
describe('레시피 2: 드래그 중 selection bounds 갱신', () => {
  it('expandToIncludePointInto로 caller-owned bounds를 재사용하며 갱신할 수 있다', async () => {
    const { emptyInto } = await import('../../src/bounds/empty-into');
    const { expandToIncludePointInto } = await import('../../src/bounds/expand-to-include-point-into');
    const { containsPoint } = await import('../../src/bounds/contains-point');
    const { width } = await import('../../src/bounds/width');
    const { height } = await import('../../src/bounds/height');

    // caller-owned output — 드래그 루프에서 재사용한다
    const selBounds = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    emptyInto(selBounds);

    // 드래그 포인트 목록 (object XYInput)
    const points = [
      { x: 10, y: 20 },
      { x: 80, y: 50 },
      { x: 30, y: 90 },
    ];

    for (const pt of points) {
      expandToIncludePointInto(selBounds, selBounds, pt);
    }

    expect(selBounds.min.x).toBeCloseTo(10, 10);
    expect(selBounds.min.y).toBeCloseTo(20, 10);
    expect(selBounds.max.x).toBeCloseTo(80, 10);
    expect(selBounds.max.y).toBeCloseTo(90, 10);

    expect(width(selBounds)).toBeCloseTo(70, 10);
    expect(height(selBounds)).toBeCloseTo(70, 10);

    // 선택 영역 안에 있는 점 확인
    expect(containsPoint(selBounds, { x: 50, y: 60 })).toBe(true);
    expect(containsPoint(selBounds, { x: 200, y: 200 })).toBe(false);
  });

  it('tuple 포인트로도 bounds를 갱신할 수 있다', async () => {
    const { emptyInto } = await import('../../src/bounds/empty-into');
    const { expandToIncludePointInto } = await import('../../src/bounds/expand-to-include-point-into');

    const selBounds = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    emptyInto(selBounds);

    const tuplePoints: Array<[number, number]> = [
      [5, 15],
      [95, 85],
    ];

    for (const pt of tuplePoints) {
      expandToIncludePointInto(selBounds, selBounds, pt);
    }

    expect(selBounds.min.x).toBeCloseTo(5, 10);
    expect(selBounds.max.x).toBeCloseTo(95, 10);
  });
});

// ── 레시피 3: polygon hit-test 후 snap 후보 계산 ──────────────────────────────
// canvas demo의 Polygon Hit Test 예제와 동일한 흐름을 검증한다.
describe('레시피 3: polygon hit-test 후 snap 후보 계산', () => {
  it('containsPoint로 hit 여부를 확인하고 closestPointInto로 snap 후보를 구한다', async () => {
    const { containsPoint } = await import('../../src/polygon/contains-point');
    const { closestPointInto } = await import('../../src/polygon/closest-point-into');
    const { boundsInto } = await import('../../src/polygon/bounds-into');

    // 시계 방향 사각형 polygon
    const poly = [
      { x: 50, y: 50 },
      { x: 250, y: 50 },
      { x: 250, y: 200 },
      { x: 50, y: 200 },
    ];

    const insidePoint = { x: 150, y: 125 };
    const outsidePoint = { x: 300, y: 300 };

    expect(containsPoint(poly, insidePoint)).toBe(true);
    expect(containsPoint(poly, outsidePoint)).toBe(false);

    // hit 됐을 때 closest edge point 계산
    const snap = { x: 0, y: 0 };
    closestPointInto(snap, poly, insidePoint);
    // 가장 가까운 edge point가 합리적인 범위 안에 있다
    expect(snap.x).toBeGreaterThanOrEqual(50);
    expect(snap.x).toBeLessThanOrEqual(250);
    expect(snap.y).toBeGreaterThanOrEqual(50);
    expect(snap.y).toBeLessThanOrEqual(200);

    // bounds 계산
    const polyBounds = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    boundsInto(polyBounds, poly);
    expect(polyBounds.min.x).toBeCloseTo(50, 10);
    expect(polyBounds.max.x).toBeCloseTo(250, 10);
  });
});

// ── 레시피 4: renderer/library point object를 변환 없이 XYInput으로 사용 ────────
// { x, y } structural input/output 계약을 검증한다.
describe('레시피 4: { x, y } structural object를 XYInput으로 사용', () => {
  it('{ x, y }를 가진 class instance를 캐스팅 없이 addInto에 사용할 수 있다', async () => {
    const { addInto } = await import('../../src/vec/add-into');
    const { scaleInto } = await import('../../src/vec/scale-into');
    const { subInto } = await import('../../src/vec/sub-into');

    class PointLike {
      constructor(
        public x: number,
        public y: number
      ) {}
    }

    const a = new PointLike(10, 20);
    const b = new PointLike(30, 40);

    // out은 caller-owned object다.
    const result = new PointLike(0, 0);
    addInto(result, a, b);

    expect(result.x).toBeCloseTo(40, 10);
    expect(result.y).toBeCloseTo(60, 10);

    // scaleInto도 동일하게 작동한다
    const scaled = new PointLike(0, 0);
    scaleInto(scaled, result, 0.5);
    expect(scaled.x).toBeCloseTo(20, 10);
    expect(scaled.y).toBeCloseTo(30, 10);

    // subInto도 작동한다
    const diff = new PointLike(0, 0);
    subInto(diff, b, a);
    expect(diff.x).toBeCloseTo(20, 10);
    expect(diff.y).toBeCloseTo(20, 10);
  });

  it('tuple [x, y]를 XYInput으로 사용하고 tuple output을 재사용할 수 있다', async () => {
    const { addInto } = await import('../../src/vec/add-into');
    const { distance } = await import('../../src/vec/distance');

    const a: [number, number] = [2, 3];
    const b: [number, number] = [4, 5];

    // README 예제와 동일한 코드
    const out = { x: 0, y: 0 };
    addInto(out, a, b);

    expect(out.x).toBeCloseTo(6, 10);
    expect(out.y).toBeCloseTo(8, 10);
    expect(distance(out, [6, 4])).toBeCloseTo(4, 10);

    // tuple out에도 기록 가능
    const tupleOut: [number, number] = [0, 0];
    addInto(tupleOut, a, b);
    expect(tupleOut[0]).toBeCloseTo(6, 10);
    expect(tupleOut[1]).toBeCloseTo(8, 10);
  });
});

// ── 레시피 5: transform matrix를 조합해 point와 bounds를 변환 ─────────────────
// canvas demo의 Matrix Transform 예제와 동일한 흐름을 검증한다.
describe('레시피 5: transform matrix 조합으로 point와 bounds 변환', () => {
  it('translation + rotation + scale matrix를 multiplyInto로 조합할 수 있다', async () => {
    const { translationMatrixInto } = await import('../../src/matrix/translation-matrix-into');
    const { scalingMatrixInto } = await import('../../src/matrix/scaling-matrix-into');
    const { multiplyInto } = await import('../../src/matrix/multiply-into');
    const { transformPointInto } = await import('../../src/matrix/transform-point-into');
    const { identityInto } = await import('../../src/matrix/identity-into');

    const m = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };

    // caller-owned matrix output을 재사용한다
    // translationMatrixInto는 XYInput offset을 받는다
    const translation = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
    translationMatrixInto(translation, { x: 100, y: 50 });

    const scale = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
    scalingMatrixInto(scale, 2, 2);

    // translation * scale 조합
    identityInto(m);
    multiplyInto(m, translation, scale);

    // point 변환: [0, 0] → multiplyInto(translation, scale) → [0,0]*scale + translate
    // (0,0) → scale → (0,0), then translate → (100, 50)
    const pt = { x: 0, y: 0 };
    const ptResult = { x: 0, y: 0 };
    transformPointInto(ptResult, m, pt);

    expect(ptResult.x).toBeCloseTo(100, 10);
    expect(ptResult.y).toBeCloseTo(50, 10);
  });

  it('rotation matrix로 point를 회전시킬 수 있다', async () => {
    const { rotationMatrixInto } = await import('../../src/matrix/rotation-matrix-into');
    const { transformPointInto } = await import('../../src/matrix/transform-point-into');

    const m = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
    // 90도 회전 (라디안 π/2)
    rotationMatrixInto(m, Math.PI / 2);

    // (1, 0) → 회전 후 (0, 1) 근사
    const pt = { x: 1, y: 0 };
    const out = { x: 0, y: 0 };
    transformPointInto(out, m, pt);

    expect(out.x).toBeCloseTo(0, 10);
    expect(out.y).toBeCloseTo(1, 10);
  });

  it('transformBoundsInto로 bounds를 matrix 변환할 수 있다', async () => {
    const { translationMatrixInto } = await import('../../src/matrix/translation-matrix-into');
    const { transformBoundsInto } = await import('../../src/matrix/transform-bounds-into');

    const m = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
    // translationMatrixInto는 XYInput offset을 받는다
    translationMatrixInto(m, { x: 10, y: 20 });

    const srcBounds = { min: { x: 0, y: 0 }, max: { x: 100, y: 50 } };
    const outBounds = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    transformBoundsInto(outBounds, m, srcBounds);

    expect(outBounds.min.x).toBeCloseTo(10, 10);
    expect(outBounds.min.y).toBeCloseTo(20, 10);
    expect(outBounds.max.x).toBeCloseTo(110, 10);
    expect(outBounds.max.y).toBeCloseTo(70, 10);
  });
});

// ── 레시피 6: random geometry sampling ─────────────────────────────────────────
// canvas demo의 Random Sampling 예제와 동일한 흐름을 검증한다.
describe('레시피 6: random geometry sampling', () => {
  it('pointInRectInto로 rect 안에 무작위 점을 샘플링할 수 있다', async () => {
    const { pointInRectInto } = await import('../../src/random/point-in-rect-into');

    const rect = { x: 10, y: 20, width: 100, height: 80 };
    const out = { x: 0, y: 0 };

    // 100번 샘플링해 모두 rect 안에 들어오는지 확인
    for (let i = 0; i < 100; i++) {
      pointInRectInto(out, rect);
      expect(out.x).toBeGreaterThanOrEqual(rect.x);
      expect(out.x).toBeLessThanOrEqual(rect.x + rect.width);
      expect(out.y).toBeGreaterThanOrEqual(rect.y);
      expect(out.y).toBeLessThanOrEqual(rect.y + rect.height);
    }
  });

  it('tuple output으로도 pointInRectInto를 사용할 수 있다', async () => {
    const { pointInRectInto } = await import('../../src/random/point-in-rect-into');

    const rect = { x: 0, y: 0, width: 200, height: 200 };
    const out: [number, number] = [0, 0];

    pointInRectInto(out, rect);

    expect(out[0]).toBeGreaterThanOrEqual(0);
    expect(out[0]).toBeLessThanOrEqual(200);
    expect(out[1]).toBeGreaterThanOrEqual(0);
    expect(out[1]).toBeLessThanOrEqual(200);
  });

  it('pointInBoundsInto로 bounds 안에 무작위 점을 샘플링할 수 있다', async () => {
    const { pointInBoundsInto } = await import('../../src/random/point-in-bounds-into');

    const bounds = { min: { x: -50, y: -50 }, max: { x: 50, y: 50 } };
    const out = { x: 0, y: 0 };

    for (let i = 0; i < 50; i++) {
      pointInBoundsInto(out, bounds);
      expect(out.x).toBeGreaterThanOrEqual(-50);
      expect(out.x).toBeLessThanOrEqual(50);
      expect(out.y).toBeGreaterThanOrEqual(-50);
      expect(out.y).toBeLessThanOrEqual(50);
    }
  });

  it('pointOnSegmentInto로 segment 위의 무작위 점을 샘플링할 수 있다', async () => {
    const { pointOnSegmentInto } = await import('../../src/random/point-on-segment-into');

    const seg = { a: { x: 0, y: 0 }, b: { x: 100, y: 0 } };
    const out = { x: 0, y: 0 };

    for (let i = 0; i < 50; i++) {
      pointOnSegmentInto(out, seg);
      // 수평 segment이므로 y = 0, x ∈ [0, 100]
      expect(out.x).toBeGreaterThanOrEqual(0);
      expect(out.x).toBeLessThanOrEqual(100);
      expect(out.y).toBeCloseTo(0, 10);
    }
  });

  it('directionInto로 단위 방향 벡터를 샘플링할 수 있다', async () => {
    const { directionInto } = await import('../../src/random/direction-into');
    const { length } = await import('../../src/vec/length');

    const out = { x: 0, y: 0 };

    for (let i = 0; i < 20; i++) {
      directionInto(out);
      // 단위 벡터이므로 길이가 1에 가까워야 한다
      expect(length(out)).toBeCloseTo(1, 5);
    }
  });
});

// ── 레시피 7: seeded random 재현성 검증 ────────────────────────────────────────
// 같은 seed로 생성한 두 rng가 동일한 결과를 만드는지 검증한다.
describe('레시피 7: seeded random 재현성', () => {
  it('같은 seed를 가진 두 createRng는 동일한 pointInBoundsInto 결과를 만든다', async () => {
    const { createRng } = await import('../../src/random/create-rng');
    const { pointInBoundsInto } = await import('../../src/random/point-in-bounds-into');

    const bounds = { min: { x: 0, y: 0 }, max: { x: 100, y: 100 } };
    const rngA = createRng(20260517);
    const rngB = createRng(20260517);
    const a = { x: 0, y: 0 };
    const b = { x: 0, y: 0 };

    pointInBoundsInto(a, bounds, rngA);
    pointInBoundsInto(b, bounds, rngB);

    expect(a).toEqual(b);
  });

  it('같은 seed를 가진 두 createRng는 동일한 random sequence를 만든다', async () => {
    const { createRng } = await import('../../src/random/create-rng');

    const rngA = createRng('demo-seed');
    const rngB = createRng('demo-seed');

    for (let i = 0; i < 10; i++) {
      expect(rngA()).toBe(rngB());
    }
  });

  it('다른 seed를 가진 두 createRng는 다른 sequence를 만든다', async () => {
    const { createRng } = await import('../../src/random/create-rng');

    const rngA = createRng(1);
    const rngB = createRng(2);

    // 첫 값이 서로 달라야 한다
    expect(rngA()).not.toBe(rngB());
  });
});

// ── README 예제 검증 ───────────────────────────────────────────────────────────
// README의 빠른 시작 예제 코드가 실제 API와 일치하는지 검증한다.
describe('README 빠른 시작 예제 검증', () => {
  it('Leaf subpath import 예제 — addInto와 distance가 README대로 동작한다', async () => {
    const { addInto } = await import('../../src/vec/add-into');
    const { distance } = await import('../../src/vec/distance');

    const out = { x: 0, y: 0 };

    // README 예제: addInto(out, { x: 2, y: 3 }, [4, 5]) → { x: 6, y: 8 }
    addInto(out, { x: 2, y: 3 }, [4, 5]);
    expect(out.x).toBeCloseTo(6, 10);
    expect(out.y).toBeCloseTo(8, 10);

    // README 예제: distance(out, [6, 4]) → 4
    expect(distance(out, [6, 4])).toBeCloseTo(4, 10);
  });

  it('Domain barrel import 예제 — normalizeInto와 nearEquals가 README대로 동작한다', async () => {
    const vec = await import('../../src/vec/index');

    const unit = { x: 0, y: 0 };

    // README 예제: vec.normalizeInto(unit, [3, 4]) → { x: 0.6, y: 0.8 }
    vec.normalizeInto(unit, [3, 4]);
    expect(unit.x).toBeCloseTo(0.6, 5);
    expect(unit.y).toBeCloseTo(0.8, 5);

    // README 예제: vec.nearEquals(unit, { x: 0.6, y: 0.8 }, 1e-9) → true
    expect(vec.nearEquals(unit, { x: 0.6, y: 0.8 }, 1e-9)).toBe(true);
  }, 10_000);
});
