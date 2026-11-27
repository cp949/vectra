/** 타원 표면의 점 계산과 이동·배율 변환 계약을 검증한다. */
import { describe, expect, test } from 'vitest';
import { pointAtAngle } from '../../../src/ellipse/point-at-angle';
import { pointAtAngleInto } from '../../../src/ellipse/point-at-angle-into';
import { pointAtTurn } from '../../../src/ellipse/point-at-turn';
import { pointAtTurnInto } from '../../../src/ellipse/point-at-turn-into';
import { scale } from '../../../src/ellipse/scale';
import { scaleInto } from '../../../src/ellipse/scale-into';
import { translate } from '../../../src/ellipse/translate';
import { translateInto } from '../../../src/ellipse/translate-into';
import { makeEllipse } from './_helpers';

// ─── pointAtAngleInto ────────────────────────────────────────────────────────

describe('ellipse point - pointAtAngleInto', () => {
  test('angle=0에서 x축 양의 끝점을 기록한다', () => {
    const out = { x: 0, y: 0 };
    const result = pointAtAngleInto(out, { cx: 1, cy: 2, rx: 3, ry: 4 }, 0);
    expect(result).toBe(out);
    expect(out.x).toBeCloseTo(4, 10);
    expect(out.y).toBeCloseTo(2, 10);
  });

  test('angle=π/2에서 y축 양의 끝점을 기록한다', () => {
    const out = { x: 0, y: 0 };
    pointAtAngleInto(out, { cx: 1, cy: 2, rx: 3, ry: 4 }, Math.PI / 2);
    expect(out.x).toBeCloseTo(1, 10);
    expect(out.y).toBeCloseTo(6, 10);
  });

  test('angle=π에서 x축 음의 끝점을 기록한다', () => {
    const out = { x: 0, y: 0 };
    pointAtAngleInto(out, { cx: 1, cy: 2, rx: 3, ry: 4 }, Math.PI);
    expect(out.x).toBeCloseTo(-2, 10);
    expect(out.y).toBeCloseTo(2, 10);
  });

  test('angle=3π/2에서 y축 음의 끝점을 기록한다', () => {
    const out = { x: 0, y: 0 };
    pointAtAngleInto(out, { cx: 1, cy: 2, rx: 3, ry: 4 }, (3 * Math.PI) / 2);
    expect(out.x).toBeCloseTo(1, 10);
    expect(out.y).toBeCloseTo(-2, 10);
  });

  test('empty ellipse (rx=0)이면 center를 기록한다', () => {
    const out = { x: 9, y: 9 };
    pointAtAngleInto(out, { cx: 5, cy: 3, rx: 0, ry: 4 }, 0);
    expect(out.x).toBe(5);
    expect(out.y).toBe(3);
  });

  test('empty ellipse (ry<=0)이면 center를 기록한다', () => {
    const out = { x: 9, y: 9 };
    pointAtAngleInto(out, { cx: 5, cy: 3, rx: 3, ry: -1 }, 0);
    expect(out.x).toBe(5);
    expect(out.y).toBe(3);
  });
});

// ─── pointAtAngle ────────────────────────────────────────────────────────────

describe('ellipse point - pointAtAngle', () => {
  test('angle=0에서 x축 양의 끝점 plain object를 반환한다', () => {
    const result = pointAtAngle({ cx: 1, cy: 2, rx: 3, ry: 4 }, 0);
    expect(result.x).toBeCloseTo(4, 10);
    expect(result.y).toBeCloseTo(2, 10);
  });

  test('angle=π/2에서 y축 양의 끝점 plain object를 반환한다', () => {
    const result = pointAtAngle({ cx: 1, cy: 2, rx: 3, ry: 4 }, Math.PI / 2);
    expect(result.x).toBeCloseTo(1, 10);
    expect(result.y).toBeCloseTo(6, 10);
  });

  test('empty ellipse이면 center plain object를 반환한다', () => {
    const result = pointAtAngle({ cx: 5, cy: 3, rx: 0, ry: 4 }, 0);
    expect(result.x).toBe(5);
    expect(result.y).toBe(3);
  });

  test('pointAtAngleInto와 같은 좌표를 반환한다', () => {
    const e = { cx: 2, cy: -1, rx: 4, ry: 3 };
    const out = { x: 0, y: 0 };
    pointAtAngleInto(out, e, 1.2);
    const result = pointAtAngle(e, 1.2);
    expect(result.x).toBeCloseTo(out.x, 10);
    expect(result.y).toBeCloseTo(out.y, 10);
  });
});

// ─── pointAtTurnInto ─────────────────────────────────────────────────────────

describe('ellipse point - pointAtTurnInto', () => {
  test('turn=0에서 angle=0과 같은 좌표를 기록한다', () => {
    const e = { cx: 1, cy: 2, rx: 3, ry: 4 };
    const out1 = { x: 0, y: 0 };
    const out2 = { x: 0, y: 0 };
    pointAtAngleInto(out1, e, 0);
    const result = pointAtTurnInto(out2, e, 0);
    expect(result).toBe(out2);
    expect(out2.x).toBeCloseTo(out1.x, 10);
    expect(out2.y).toBeCloseTo(out1.y, 10);
  });

  test('turn=0.25에서 angle=π/2와 같은 좌표를 기록한다', () => {
    const e = { cx: 1, cy: 2, rx: 3, ry: 4 };
    const out1 = { x: 0, y: 0 };
    const out2 = { x: 0, y: 0 };
    pointAtAngleInto(out1, e, Math.PI / 2);
    pointAtTurnInto(out2, e, 0.25);
    expect(out2.x).toBeCloseTo(out1.x, 10);
    expect(out2.y).toBeCloseTo(out1.y, 10);
  });

  test('turn=0.5에서 angle=π와 같은 좌표를 기록한다', () => {
    const e = { cx: 1, cy: 2, rx: 3, ry: 4 };
    const out1 = { x: 0, y: 0 };
    const out2 = { x: 0, y: 0 };
    pointAtAngleInto(out1, e, Math.PI);
    pointAtTurnInto(out2, e, 0.5);
    expect(out2.x).toBeCloseTo(out1.x, 10);
    expect(out2.y).toBeCloseTo(out1.y, 10);
  });

  test('turn=0.75에서 angle=3π/2와 같은 좌표를 기록한다', () => {
    const e = { cx: 1, cy: 2, rx: 3, ry: 4 };
    const out1 = { x: 0, y: 0 };
    const out2 = { x: 0, y: 0 };
    pointAtAngleInto(out1, e, (3 * Math.PI) / 2);
    pointAtTurnInto(out2, e, 0.75);
    expect(out2.x).toBeCloseTo(out1.x, 10);
    expect(out2.y).toBeCloseTo(out1.y, 10);
  });

  test('empty ellipse이면 center를 기록한다', () => {
    const out = { x: 9, y: 9 };
    pointAtTurnInto(out, { cx: 5, cy: 3, rx: 0, ry: 4 }, 0.5);
    expect(out.x).toBe(5);
    expect(out.y).toBe(3);
  });

  test('turn wrap 없음: turn=1.0은 turn=0과 같다', () => {
    const e = { cx: 0, cy: 0, rx: 3, ry: 2 };
    const out1 = { x: 0, y: 0 };
    const out2 = { x: 0, y: 0 };
    pointAtTurnInto(out1, e, 0);
    pointAtTurnInto(out2, e, 1);
    // angle = 2π이면 cos(2π)=1, sin(2π)≈0, angle=0과 실질적으로 같다
    expect(out2.x).toBeCloseTo(out1.x, 10);
    expect(out2.y).toBeCloseTo(out1.y, 10);
  });
});

// ─── pointAtTurn ─────────────────────────────────────────────────────────────

describe('ellipse point - pointAtTurn', () => {
  test('turn=0에서 plain object를 반환한다', () => {
    const e = { cx: 1, cy: 2, rx: 3, ry: 4 };
    const result = pointAtTurn(e, 0);
    const ref = { x: 0, y: 0 };
    pointAtTurnInto(ref, e, 0);
    expect(result.x).toBeCloseTo(ref.x, 10);
    expect(result.y).toBeCloseTo(ref.y, 10);
  });

  test('empty ellipse이면 center plain object를 반환한다', () => {
    const result = pointAtTurn({ cx: 5, cy: 3, rx: -1, ry: 2 }, 0.5);
    expect(result.x).toBe(5);
    expect(result.y).toBe(3);
  });
});

// ─── translateInto ───────────────────────────────────────────────────────────

describe('ellipse transform - translateInto', () => {
  test('center에 offset을 더하고 out을 반환한다', () => {
    const out = makeEllipse();
    const result = translateInto(out, { cx: 1, cy: 2, rx: 3, ry: 4 }, { x: 5, y: -1 });
    expect(result).toBe(out);
    expect(out.cx).toBe(6);
    expect(out.cy).toBe(1);
    expect(out.rx).toBe(3);
    expect(out.ry).toBe(4);
  });

  test('radii는 그대로 복사한다', () => {
    const out = makeEllipse();
    translateInto(out, { cx: 0, cy: 0, rx: 7, ry: 5 }, { x: 2, y: 3 });
    expect(out.rx).toBe(7);
    expect(out.ry).toBe(5);
  });

  test('out === ellipse aliasing에서도 안전하게 동작한다', () => {
    const out = makeEllipse(3, 4, 5, 2);
    translateInto(out, out, { x: 1, y: 2 });
    expect(out.cx).toBe(4);
    expect(out.cy).toBe(6);
    expect(out.rx).toBe(5);
    expect(out.ry).toBe(2);
  });
});

// ─── translate ───────────────────────────────────────────────────────────────

describe('ellipse transform - translate', () => {
  test('center에 offset을 더한 plain object를 반환한다', () => {
    const result = translate({ cx: 1, cy: 2, rx: 3, ry: 4 }, { x: 5, y: -1 });
    expect(result).toEqual({ cx: 6, cy: 1, rx: 3, ry: 4 });
  });

  test('translateInto와 같은 결과를 반환한다', () => {
    const e = { cx: 2, cy: -1, rx: 4, ry: 3 };
    const offset = { x: -3, y: 7 };
    const out = makeEllipse();
    translateInto(out, e, offset);
    const result = translate(e, offset);
    expect(result.cx).toBe(out.cx);
    expect(result.cy).toBe(out.cy);
    expect(result.rx).toBe(out.rx);
    expect(result.ry).toBe(out.ry);
  });
});

// ─── scaleInto ───────────────────────────────────────────────────────────────

describe('ellipse transform - scaleInto', () => {
  test('center와 radii에 scale.x, scale.y를 곱하고 out을 반환한다', () => {
    const out = makeEllipse();
    const result = scaleInto(out, { cx: 2, cy: 3, rx: 4, ry: 5 }, { x: 2, y: 3 });
    expect(result).toBe(out);
    expect(out.cx).toBe(4);
    expect(out.cy).toBe(9);
    expect(out.rx).toBe(8);
    expect(out.ry).toBe(15);
  });

  test('non-uniform scale을 각 축에 독립 적용한다', () => {
    const out = makeEllipse();
    scaleInto(out, { cx: 1, cy: 2, rx: 3, ry: 4 }, { x: 0.5, y: 2 });
    expect(out.cx).toBe(0.5);
    expect(out.cy).toBe(4);
    expect(out.rx).toBe(1.5);
    expect(out.ry).toBe(8);
  });

  test('out === ellipse aliasing에서도 안전하게 동작한다', () => {
    const out = makeEllipse(2, 3, 4, 5);
    scaleInto(out, out, { x: 2, y: 3 });
    expect(out.cx).toBe(4);
    expect(out.cy).toBe(9);
    expect(out.rx).toBe(8);
    expect(out.ry).toBe(15);
  });

  test('uniform scale (scale.x === scale.y)을 처리한다', () => {
    const out = makeEllipse();
    scaleInto(out, { cx: 1, cy: 2, rx: 3, ry: 4 }, { x: 2, y: 2 });
    expect(out.cx).toBe(2);
    expect(out.cy).toBe(4);
    expect(out.rx).toBe(6);
    expect(out.ry).toBe(8);
  });
});

// ─── scale ───────────────────────────────────────────────────────────────────

describe('ellipse transform - scale', () => {
  test('center와 radii에 scale.x, scale.y를 곱한 plain object를 반환한다', () => {
    const result = scale({ cx: 2, cy: 3, rx: 4, ry: 5 }, { x: 2, y: 3 });
    expect(result).toEqual({ cx: 4, cy: 9, rx: 8, ry: 15 });
  });

  test('scaleInto와 같은 결과를 반환한다', () => {
    const e = { cx: 2, cy: -1, rx: 4, ry: 3 };
    const s = { x: 0.5, y: 2 };
    const out = makeEllipse();
    scaleInto(out, e, s);
    const result = scale(e, s);
    expect(result.cx).toBe(out.cx);
    expect(result.cy).toBe(out.cy);
    expect(result.rx).toBe(out.rx);
    expect(result.ry).toBe(out.ry);
  });
});
