/**
 * editor-geometry constrain-drag 단위 테스트
 *
 * constrainDragInto / constrainDrag 동작을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { constrainDrag } from '../../../src/editor-geometry/constrain-drag';
import { constrainDragInto } from '../../../src/editor-geometry/constrain-drag-into';

describe('editor-geometry - constrainDragInto', () => {
  // --- Into 패턴 ---

  test('out에 결과를 기록하고 out을 반환한다', () => {
    const out = { x: 0, y: 0 };
    const result = constrainDragInto(out, { x: 0, y: 0 }, { x: 5, y: 3 });
    expect(result).toBe(out);
    expect(out.x).toBe(5);
    expect(out.y).toBe(3);
  });

  test('tuple out에 결과를 기록하고 out을 반환한다', () => {
    const out: [number, number] = [0, 0];
    const result = constrainDragInto(out, { x: 0, y: 0 }, { x: 5, y: 3 });
    expect(result).toBe(out);
    expect(out[0]).toBe(5);
    expect(out[1]).toBe(3);
  });

  // --- options 없음 ---

  test('options 미지정 시 to를 그대로 기록한다', () => {
    const out = { x: 0, y: 0 };
    constrainDragInto(out, { x: 1, y: 2 }, { x: 7, y: 9 });
    expect(out.x).toBe(7);
    expect(out.y).toBe(9);
  });

  test('빈 options 객체 시 to를 그대로 기록한다', () => {
    const out = { x: 0, y: 0 };
    constrainDragInto(out, { x: 1, y: 2 }, { x: 7, y: 9 }, {});
    expect(out.x).toBe(7);
    expect(out.y).toBe(9);
  });

  // --- axisLock: 'horizontal' ---

  test("axisLock='horizontal': to.y → from.y로 강제", () => {
    const out = { x: 0, y: 0 };
    constrainDragInto(out, { x: 1, y: 2 }, { x: 7, y: 9 }, { axisLock: 'horizontal' });
    expect(out.x).toBe(7);
    expect(out.y).toBe(2);
  });

  test("axisLock='horizontal': from.y가 음수여도 올바르게 강제한다", () => {
    const out = { x: 0, y: 0 };
    constrainDragInto(out, { x: 0, y: -5 }, { x: 10, y: 3 }, { axisLock: 'horizontal' });
    expect(out.x).toBe(10);
    expect(out.y).toBe(-5);
  });

  // --- axisLock: 'vertical' ---

  test("axisLock='vertical': to.x → from.x로 강제", () => {
    const out = { x: 0, y: 0 };
    constrainDragInto(out, { x: 1, y: 2 }, { x: 7, y: 9 }, { axisLock: 'vertical' });
    expect(out.x).toBe(1);
    expect(out.y).toBe(9);
  });

  test("axisLock='vertical': from.x가 음수여도 올바르게 강제한다", () => {
    const out = { x: 0, y: 0 };
    constrainDragInto(out, { x: -3, y: 0 }, { x: 10, y: 8 }, { axisLock: 'vertical' });
    expect(out.x).toBe(-3);
    expect(out.y).toBe(8);
  });

  // --- axisLock: 'auto' ---

  test("axisLock='auto': |dx|>|dy| → y 고정(horizontal lock)", () => {
    const out = { x: 0, y: 0 };
    // dx=10, dy=3 → |dx|>|dy| → y를 from.y로 고정
    constrainDragInto(out, { x: 0, y: 0 }, { x: 10, y: 3 }, { axisLock: 'auto' });
    expect(out.x).toBe(10);
    expect(out.y).toBe(0);
  });

  test("axisLock='auto': |dy|>|dx| → x 고정(vertical lock)", () => {
    const out = { x: 0, y: 0 };
    // dx=3, dy=10 → |dy|>|dx| → x를 from.x로 고정
    constrainDragInto(out, { x: 0, y: 0 }, { x: 3, y: 10 }, { axisLock: 'auto' });
    expect(out.x).toBe(0);
    expect(out.y).toBe(10);
  });

  test("axisLock='auto': |dy|===|dx|, 비영값 → x 고정(vertical lock, dy>=dx 조건)", () => {
    const out = { x: 0, y: 0 };
    // dx=5, dy=5 → |dy|>=|dx| → x를 from.x로 고정
    constrainDragInto(out, { x: 0, y: 0 }, { x: 5, y: 5 }, { axisLock: 'auto' });
    expect(out.x).toBe(0);
    expect(out.y).toBe(5);
  });

  test("axisLock='auto': dx===dy===0 → to를 그대로 기록", () => {
    const out = { x: 0, y: 0 };
    constrainDragInto(out, { x: 3, y: 4 }, { x: 3, y: 4 }, { axisLock: 'auto' });
    expect(out.x).toBe(3);
    expect(out.y).toBe(4);
  });

  test("axisLock='auto': from과 to가 다른 위치, dx===dy===0 아님, 음수 delta 처리", () => {
    const out = { x: 0, y: 0 };
    // dx=-10, dy=-2 → |dx|>|dy| → y 고정
    constrainDragInto(out, { x: 5, y: 5 }, { x: -5, y: 3 }, { axisLock: 'auto' });
    expect(out.x).toBe(-5);
    expect(out.y).toBe(5);
  });

  // --- containIn (bounds 클램프) ---

  test('containIn: to가 bounds 안이면 그대로 기록한다', () => {
    const out = { x: 0, y: 0 };
    constrainDragInto(
      out,
      { x: 0, y: 0 },
      { x: 5, y: 5 },
      { containIn: { min: { x: 0, y: 0 }, max: { x: 10, y: 10 } } }
    );
    expect(out.x).toBe(5);
    expect(out.y).toBe(5);
  });

  test('containIn: to.x가 max.x를 초과하면 max.x로 클램프한다', () => {
    const out = { x: 0, y: 0 };
    constrainDragInto(
      out,
      { x: 0, y: 0 },
      { x: 15, y: 5 },
      { containIn: { min: { x: 0, y: 0 }, max: { x: 10, y: 10 } } }
    );
    expect(out.x).toBe(10);
    expect(out.y).toBe(5);
  });

  test('containIn: to.x가 min.x 미만이면 min.x로 클램프한다', () => {
    const out = { x: 0, y: 0 };
    constrainDragInto(
      out,
      { x: 0, y: 0 },
      { x: -5, y: 5 },
      { containIn: { min: { x: 0, y: 0 }, max: { x: 10, y: 10 } } }
    );
    expect(out.x).toBe(0);
    expect(out.y).toBe(5);
  });

  test('containIn: to.y가 max.y를 초과하면 max.y로 클램프한다', () => {
    const out = { x: 0, y: 0 };
    constrainDragInto(
      out,
      { x: 0, y: 0 },
      { x: 5, y: 20 },
      { containIn: { min: { x: 0, y: 0 }, max: { x: 10, y: 10 } } }
    );
    expect(out.x).toBe(5);
    expect(out.y).toBe(10);
  });

  test('containIn: to.y가 min.y 미만이면 min.y로 클램프한다', () => {
    const out = { x: 0, y: 0 };
    constrainDragInto(
      out,
      { x: 0, y: 0 },
      { x: 5, y: -3 },
      { containIn: { min: { x: 0, y: 0 }, max: { x: 10, y: 10 } } }
    );
    expect(out.x).toBe(5);
    expect(out.y).toBe(0);
  });

  // --- containIn + size (크기 반영 클램프) ---

  test('containIn + size: x축에서 드래그 대상 전체가 bounds 안에 들어오도록 클램프한다', () => {
    const out = { x: 0, y: 0 };
    // bounds: [0, 0] ~ [100, 100], size: {width:30, height:20}
    // to.x=80 → to.x + 30 = 110 > 100 → x = 100 - 30 = 70
    constrainDragInto(
      out,
      { x: 0, y: 0 },
      { x: 80, y: 5 },
      {
        containIn: { min: { x: 0, y: 0 }, max: { x: 100, y: 100 } },
        size: { width: 30, height: 20 },
      }
    );
    expect(out.x).toBe(70);
    expect(out.y).toBe(5);
  });

  test('containIn + size: y축에서 드래그 대상 전체가 bounds 안에 들어오도록 클램프한다', () => {
    const out = { x: 0, y: 0 };
    // bounds: [0, 0] ~ [100, 100], size: {width:30, height:20}
    // to.y=85 → to.y + 20 = 105 > 100 → y = 100 - 20 = 80
    constrainDragInto(
      out,
      { x: 0, y: 0 },
      { x: 5, y: 85 },
      {
        containIn: { min: { x: 0, y: 0 }, max: { x: 100, y: 100 } },
        size: { width: 30, height: 20 },
      }
    );
    expect(out.x).toBe(5);
    expect(out.y).toBe(80);
  });

  test('containIn + size: 좌측/상단 min 클램프에는 size가 영향을 주지 않는다', () => {
    const out = { x: 0, y: 0 };
    // to.x=-5 < min.x=0 → x=0 (min 클램프는 size 무관)
    constrainDragInto(
      out,
      { x: 0, y: 0 },
      { x: -5, y: -3 },
      {
        containIn: { min: { x: 0, y: 0 }, max: { x: 100, y: 100 } },
        size: { width: 30, height: 20 },
      }
    );
    expect(out.x).toBe(0);
    expect(out.y).toBe(0);
  });

  // --- degenerate: size > bounds 폭/높이 ---

  test('containIn + size: size.width가 bounds 폭을 초과하면 결과가 minX로 고정된다', () => {
    const out = { x: 0, y: 0 };
    // bounds: [0, 0] ~ [10, 10], size: {width:20, height:5}
    // maxClampX = max(0, 10 - 20) = max(0, -10) = 0 → x는 0으로 클램프
    constrainDragInto(
      out,
      { x: 5, y: 5 },
      { x: 5, y: 5 },
      {
        containIn: { min: { x: 0, y: 0 }, max: { x: 10, y: 10 } },
        size: { width: 20, height: 5 },
      }
    );
    expect(out.x).toBe(0);
    expect(out.y).toBe(5);
  });

  test('containIn + size: size.height가 bounds 높이를 초과하면 결과가 minY로 고정된다', () => {
    const out = { x: 0, y: 0 };
    // bounds: [0, 0] ~ [10, 10], size: {width:5, height:20}
    // maxClampY = max(0, 10 - 20) = max(0, -10) = 0 → y는 0으로 클램프
    constrainDragInto(
      out,
      { x: 5, y: 5 },
      { x: 5, y: 5 },
      {
        containIn: { min: { x: 0, y: 0 }, max: { x: 10, y: 10 } },
        size: { width: 5, height: 20 },
      }
    );
    expect(out.x).toBe(5);
    expect(out.y).toBe(0);
  });

  // --- containIn: BoundsTuple 형태 ---

  test('containIn tuple: BoundsTuple 형태로 bounds를 지정해도 클램프가 적용된다', () => {
    const out = { x: 0, y: 0 };
    // containIn을 [min, max] tuple로 전달
    constrainDragInto(
      out,
      { x: 0, y: 0 },
      { x: 15, y: 20 },
      {
        containIn: [
          { x: 0, y: 0 },
          { x: 10, y: 10 },
        ],
      }
    );
    expect(out.x).toBe(10);
    expect(out.y).toBe(10);
  });

  // --- axisLock + containIn 조합 ---

  test("axisLock='horizontal' + containIn: x클램프는 적용, y는 from.y로 강제", () => {
    const out = { x: 0, y: 0 };
    // from.y=2, to.x=15(초과), to.y=9
    // horizontal → y=from.y=2, x=min(15, 10)=10
    constrainDragInto(
      out,
      { x: 0, y: 2 },
      { x: 15, y: 9 },
      {
        axisLock: 'horizontal',
        containIn: { min: { x: 0, y: 0 }, max: { x: 10, y: 10 } },
      }
    );
    expect(out.x).toBe(10);
    expect(out.y).toBe(2);
  });

  test("axisLock='vertical' + containIn: y클램프는 적용, x는 from.x로 강제", () => {
    const out = { x: 0, y: 0 };
    // from.x=1, to.x=7, to.y=15(초과)
    // vertical → x=from.x=1, y=min(15, 10)=10
    constrainDragInto(
      out,
      { x: 1, y: 0 },
      { x: 7, y: 15 },
      {
        axisLock: 'vertical',
        containIn: { min: { x: 0, y: 0 }, max: { x: 10, y: 10 } },
      }
    );
    expect(out.x).toBe(1);
    expect(out.y).toBe(10);
  });

  test("axisLock='auto' + containIn: auto lock 후 containIn 클램프 적용", () => {
    const out = { x: 0, y: 0 };
    // from=(0,0), to=(15,5) → dx=15 > dy=5 → horizontal → y=0, x=15
    // containIn: x=min(15,10)=10, y=min(0,10)=0
    constrainDragInto(
      out,
      { x: 0, y: 0 },
      { x: 15, y: 5 },
      {
        axisLock: 'auto',
        containIn: { min: { x: 0, y: 0 }, max: { x: 10, y: 10 } },
      }
    );
    expect(out.x).toBe(10);
    expect(out.y).toBe(0);
  });

  // --- NaN/Infinity silent propagation ---

  test('NaN from: NaN이 결과에 propagate된다', () => {
    const out = { x: 0, y: 0 };
    constrainDragInto(out, { x: Number.NaN, y: 0 }, { x: 5, y: 5 }, { axisLock: 'auto' });
    // dx = 5-NaN = NaN, dy = 5-0 = 5; dx > dy → false → y dominant → toX = fromX = NaN
    expect(out.x).toBeNaN();
    expect(out.y).toBe(5);
  });

  test('NaN to: NaN이 결과에 propagate된다', () => {
    const out = { x: 0, y: 0 };
    constrainDragInto(out, { x: 0, y: 0 }, { x: Number.NaN, y: 5 });
    expect(out.x).toBeNaN();
    expect(out.y).toBe(5);
  });

  test('Infinity to: Infinity가 결과에 propagate된다 (options 없음)', () => {
    const out = { x: 0, y: 0 };
    constrainDragInto(out, { x: 0, y: 0 }, { x: Infinity, y: 5 });
    expect(out.x).toBe(Infinity);
    expect(out.y).toBe(5);
  });
});

describe('editor-geometry - constrainDrag', () => {
  // --- companion: 동일 로직, plain object 반환 ---

  test('options 미지정 시 to의 { x, y }를 반환한다', () => {
    const result = constrainDrag({ x: 1, y: 2 }, { x: 7, y: 9 });
    expect(result).toEqual({ x: 7, y: 9 });
  });

  test("axisLock='horizontal': to.y → from.y로 강제한 { x, y }를 반환한다", () => {
    const result = constrainDrag({ x: 1, y: 2 }, { x: 7, y: 9 }, { axisLock: 'horizontal' });
    expect(result).toEqual({ x: 7, y: 2 });
  });

  test("axisLock='vertical': to.x → from.x로 강제한 { x, y }를 반환한다", () => {
    const result = constrainDrag({ x: 1, y: 2 }, { x: 7, y: 9 }, { axisLock: 'vertical' });
    expect(result).toEqual({ x: 1, y: 9 });
  });

  test("axisLock='auto': |dx|>|dy| → y 고정한 결과를 반환한다", () => {
    const result = constrainDrag({ x: 0, y: 0 }, { x: 10, y: 3 }, { axisLock: 'auto' });
    expect(result).toEqual({ x: 10, y: 0 });
  });

  test("axisLock='auto': |dy|>|dx| → x 고정한 결과를 반환한다", () => {
    const result = constrainDrag({ x: 0, y: 0 }, { x: 3, y: 10 }, { axisLock: 'auto' });
    expect(result).toEqual({ x: 0, y: 10 });
  });

  test('containIn: to가 bounds를 벗어나면 클램프한 결과를 반환한다', () => {
    const result = constrainDrag(
      { x: 0, y: 0 },
      { x: 15, y: 20 },
      { containIn: { min: { x: 0, y: 0 }, max: { x: 10, y: 10 } } }
    );
    expect(result).toEqual({ x: 10, y: 10 });
  });

  test('새 plain object를 반환한다 (allocating companion)', () => {
    const from = { x: 0, y: 0 };
    const to = { x: 5, y: 5 };
    const result = constrainDrag(from, to);
    expect(result).not.toBe(from);
    expect(result).not.toBe(to);
    expect(result).toEqual({ x: 5, y: 5 });
  });
});
