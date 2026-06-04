/**
 * editor-geometry constrain-drawing-bounds 단위 테스트
 *
 * constrainDrawingBoundsInto / constrainDrawingBounds 동작을 검증한다.
 * 검증: corner/center origin, aspectLocked, zero delta, negative drag, tuple 입출력,
 *      nested point aliasing, companion 동치, NaN/Infinity silent propagation, shape no-op.
 */

import { describe, expect, test } from 'vitest';
import { constrainDrawingBounds } from '../../../src/editor-geometry/constrain-drawing-bounds';
import { constrainDrawingBoundsInto } from '../../../src/editor-geometry/constrain-drawing-bounds-into';

describe('editor-geometry - constrainDrawingBoundsInto', () => {
  // --- Into 패턴 ---

  test('out에 normalized bounds를 기록하고 out을 반환한다', () => {
    const out = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    const result = constrainDrawingBoundsInto(out, { x: 10, y: 20 }, { x: 30, y: 50 });
    expect(result).toBe(out);
    expect(out.min).toEqual({ x: 10, y: 20 });
    expect(out.max).toEqual({ x: 30, y: 50 });
  });

  // --- options 없음 ---

  test('options 미지정 시 corner-origin 산식을 쓴다', () => {
    const out = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    constrainDrawingBoundsInto(out, { x: 10, y: 20 }, { x: 30, y: 50 });
    expect(out.min).toEqual({ x: 10, y: 20 });
    expect(out.max).toEqual({ x: 30, y: 50 });
  });

  test('빈 options 객체 시 corner-origin 산식을 쓴다', () => {
    const out = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    constrainDrawingBoundsInto(out, { x: 10, y: 20 }, { x: 30, y: 50 }, {});
    expect(out.min).toEqual({ x: 10, y: 20 });
    expect(out.max).toEqual({ x: 30, y: 50 });
  });

  // --- negative drag direction ---

  test('pointer가 origin보다 작으면 normalized bounds로 기록한다', () => {
    const out = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    constrainDrawingBoundsInto(out, { x: 30, y: 50 }, { x: 10, y: 20 });
    expect(out.min).toEqual({ x: 10, y: 20 });
    expect(out.max).toEqual({ x: 30, y: 50 });
  });

  test('pointer가 한 축만 작아도 축별로 normalized 기록한다', () => {
    const out = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    // origin=(10,50), pointer=(30,20): x는 정방향, y는 역방향
    constrainDrawingBoundsInto(out, { x: 10, y: 50 }, { x: 30, y: 20 });
    expect(out.min).toEqual({ x: 10, y: 20 });
    expect(out.max).toEqual({ x: 30, y: 50 });
  });

  // --- fromCenter: true ---

  test('fromCenter=true: origin을 center로 보고 대칭 bounds를 기록한다', () => {
    const out = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    // origin=(5,5) center, pointer=(8,9): half=(3,4)
    constrainDrawingBoundsInto(out, { x: 5, y: 5 }, { x: 8, y: 9 }, { fromCenter: true });
    expect(out.min).toEqual({ x: 2, y: 1 });
    expect(out.max).toEqual({ x: 8, y: 9 });
  });

  test('fromCenter=true: pointer가 center보다 작아도 abs half-extent로 대칭 기록한다', () => {
    const out = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    // origin=(5,5) center, pointer=(2,1): half=(abs(-3),abs(-4))=(3,4)
    constrainDrawingBoundsInto(out, { x: 5, y: 5 }, { x: 2, y: 1 }, { fromCenter: true });
    expect(out.min).toEqual({ x: 2, y: 1 });
    expect(out.max).toEqual({ x: 8, y: 9 });
  });

  // --- aspectLocked: true (corner origin) ---

  test('aspectLocked=true: max(abs(dx),abs(dy)) square를 pointer 방향 sign으로 기록한다', () => {
    const out = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    // origin=(0,0), pointer=(10,4): s=10, rawOpp=(10,10)
    constrainDrawingBoundsInto(out, { x: 0, y: 0 }, { x: 10, y: 4 }, { aspectLocked: true });
    expect(out.min).toEqual({ x: 0, y: 0 });
    expect(out.max).toEqual({ x: 10, y: 10 });
  });

  test('aspectLocked=true: 음수 drag 방향에서도 sign을 유지한 square를 기록한다', () => {
    const out = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    // origin=(0,0), pointer=(-6,3): s=6, signX=-1,signY=1, rawOpp=(-6,6)
    constrainDrawingBoundsInto(out, { x: 0, y: 0 }, { x: -6, y: 3 }, { aspectLocked: true });
    expect(out.min).toEqual({ x: -6, y: 0 });
    expect(out.max).toEqual({ x: 0, y: 6 });
  });

  test('aspectLocked=true: dx=0이면 Math.sign(0)=0으로 해당 축이 origin으로 collapse한다', () => {
    const out = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    // origin=(0,0), pointer=(0,5): s=5, signX=0 → rawOppX=0, signY=1 → rawOppY=5
    constrainDrawingBoundsInto(out, { x: 0, y: 0 }, { x: 0, y: 5 }, { aspectLocked: true });
    expect(out.min).toEqual({ x: 0, y: 0 });
    expect(out.max).toEqual({ x: 0, y: 5 });
  });

  // --- fromCenter: true + aspectLocked: true ---

  test('fromCenter=true + aspectLocked=true: square 대칭 bounds를 기록한다', () => {
    const out = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    // origin=(5,5) center, pointer=(8,9): s=max(3,4)=4, half=(4,4)
    constrainDrawingBoundsInto(out, { x: 5, y: 5 }, { x: 8, y: 9 }, { fromCenter: true, aspectLocked: true });
    expect(out.min).toEqual({ x: 1, y: 1 });
    expect(out.max).toEqual({ x: 9, y: 9 });
  });

  test('fromCenter=true + aspectLocked=true: 음수 drag에서도 square 대칭 bounds를 기록한다', () => {
    const out = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    // origin=(5,5) center, pointer=(2,1): dx=-3, dy=-4, s=max(3,4)=4, half=(4,4)
    constrainDrawingBoundsInto(out, { x: 5, y: 5 }, { x: 2, y: 1 }, { fromCenter: true, aspectLocked: true });
    expect(out.min).toEqual({ x: 1, y: 1 });
    expect(out.max).toEqual({ x: 9, y: 9 });
  });

  // --- zero delta ---

  test('zero delta: min/max가 origin으로 collapse한다', () => {
    const out = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    constrainDrawingBoundsInto(out, { x: 3, y: 4 }, { x: 3, y: 4 });
    expect(out.min).toEqual({ x: 3, y: 4 });
    expect(out.max).toEqual({ x: 3, y: 4 });
  });

  test('zero delta + aspectLocked: s=0으로 origin에 collapse한다', () => {
    const out = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    constrainDrawingBoundsInto(out, { x: 3, y: 4 }, { x: 3, y: 4 }, { aspectLocked: true });
    expect(out.min).toEqual({ x: 3, y: 4 });
    expect(out.max).toEqual({ x: 3, y: 4 });
  });

  test('zero delta + fromCenter: half=0으로 origin에 collapse한다', () => {
    const out = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    constrainDrawingBoundsInto(out, { x: 3, y: 4 }, { x: 3, y: 4 }, { fromCenter: true });
    expect(out.min).toEqual({ x: 3, y: 4 });
    expect(out.max).toEqual({ x: 3, y: 4 });
  });

  // --- shape no-op ---

  test("shape='ellipse'는 산식에 영향을 주지 않고 bounds를 그대로 기록한다", () => {
    const out = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    constrainDrawingBoundsInto(out, { x: 10, y: 20 }, { x: 30, y: 50 }, { shape: 'ellipse' });
    expect(out.min).toEqual({ x: 10, y: 20 });
    expect(out.max).toEqual({ x: 30, y: 50 });
  });

  // --- tuple 입출력 ---

  test('tuple input과 object output을 혼합해도 산출한다', () => {
    const out = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    const origin: [number, number] = [10, 20];
    const pointer: [number, number] = [30, 50];
    constrainDrawingBoundsInto(out, origin, pointer);
    expect(out.min).toEqual({ x: 10, y: 20 });
    expect(out.max).toEqual({ x: 30, y: 50 });
  });

  test('tuple nested point output에 좌표를 기록한다', () => {
    const out = { min: [0, 0] as [number, number], max: [0, 0] as [number, number] };
    constrainDrawingBoundsInto(out, { x: 10, y: 20 }, { x: 30, y: 50 });
    expect(out.min).toEqual([10, 20]);
    expect(out.max).toEqual([30, 50]);
  });

  // --- aliasing ---

  test('out.min === pointer aliasing이어도 입력을 먼저 읽어 안전하게 기록한다', () => {
    const pointer = { x: 10, y: 20 };
    const out = { min: pointer, max: { x: 0, y: 0 } };
    constrainDrawingBoundsInto(out, { x: 30, y: 50 }, pointer);
    expect(out.min).toBe(pointer);
    expect(out.min).toEqual({ x: 10, y: 20 });
    expect(out.max).toEqual({ x: 30, y: 50 });
  });

  test('out.max === origin aliasing이어도 입력을 먼저 읽어 안전하게 기록한다', () => {
    const origin = { x: 30, y: 50 };
    const out = { min: { x: 0, y: 0 }, max: origin };
    constrainDrawingBoundsInto(out, origin, { x: 10, y: 20 });
    expect(out.max).toBe(origin);
    expect(out.min).toEqual({ x: 10, y: 20 });
    expect(out.max).toEqual({ x: 30, y: 50 });
  });

  // --- NaN / Infinity silent propagation ---

  test('NaN origin 좌표는 해당 축에 NaN을 propagate한다', () => {
    const out = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    constrainDrawingBoundsInto(out, { x: Number.NaN, y: 0 }, { x: 10, y: 10 });
    expect(out.min.x).toBeNaN();
    expect(out.max.x).toBeNaN();
    expect(out.min.y).toBe(0);
    expect(out.max.y).toBe(10);
  });

  test('Infinity pointer 좌표는 해당 축에 Infinity를 propagate한다', () => {
    const out = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    constrainDrawingBoundsInto(out, { x: 0, y: 0 }, { x: Infinity, y: 5 });
    expect(out.min.x).toBe(0);
    expect(out.max.x).toBe(Infinity);
    expect(out.min.y).toBe(0);
    expect(out.max.y).toBe(5);
  });

  test('Infinity pointer + fromCenter는 half-extent에 Infinity를 propagate한다', () => {
    const out = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    constrainDrawingBoundsInto(out, { x: 0, y: 0 }, { x: Infinity, y: 5 }, { fromCenter: true });
    expect(out.min.x).toBe(-Infinity);
    expect(out.max.x).toBe(Infinity);
    expect(out.min.y).toBe(-5);
    expect(out.max.y).toBe(5);
  });
});

describe('editor-geometry - constrainDrawingBounds', () => {
  // --- companion: 동일 로직, 새 plain bounds object 반환 ---

  test('corner-origin normalized bounds를 새 plain object로 반환한다', () => {
    const result = constrainDrawingBounds({ x: 10, y: 20 }, { x: 30, y: 50 });
    expect(result).toEqual({ min: { x: 10, y: 20 }, max: { x: 30, y: 50 } });
  });

  test('fromCenter=true 대칭 bounds를 반환한다', () => {
    const result = constrainDrawingBounds({ x: 5, y: 5 }, { x: 8, y: 9 }, { fromCenter: true });
    expect(result).toEqual({ min: { x: 2, y: 1 }, max: { x: 8, y: 9 } });
  });

  test('aspectLocked=true square bounds를 반환한다', () => {
    const result = constrainDrawingBounds({ x: 0, y: 0 }, { x: 10, y: 4 }, { aspectLocked: true });
    expect(result).toEqual({ min: { x: 0, y: 0 }, max: { x: 10, y: 10 } });
  });

  test('Into 결과와 같은 좌표를 반환한다', () => {
    // origin=(-6,3) corner, pointer=(4,-2), aspectLocked: dx=10, dy=-5, s=10
    // rawOpp=(-6+10, 3-10)=(4,-7) → min=(-6,-7), max=(4,3)
    const expected = { min: { x: -6, y: -7 }, max: { x: 4, y: 3 } };
    const into = constrainDrawingBoundsInto(
      { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } },
      { x: -6, y: 3 },
      { x: 4, y: -2 },
      { aspectLocked: true }
    );
    const companion = constrainDrawingBounds({ x: -6, y: 3 }, { x: 4, y: -2 }, { aspectLocked: true });
    expect(into).toEqual(expected);
    expect(companion).toEqual(into);
  });

  test('매 호출 새 plain object를 반환한다 (allocating companion)', () => {
    const origin = { x: 0, y: 0 };
    const pointer = { x: 5, y: 5 };
    const a = constrainDrawingBounds(origin, pointer);
    const b = constrainDrawingBounds(origin, pointer);
    expect(a).not.toBe(b);
    expect(a.min).not.toBe(b.min);
    expect(a.max).not.toBe(b.max);
    expect(a).toEqual({ min: { x: 0, y: 0 }, max: { x: 5, y: 5 } });
  });
});
