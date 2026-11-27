/** 타원의 접선과 법선 방향 및 반지름 확장 계약을 검증한다. */
import { describe, expect, it } from 'vitest';
import { expandBy } from '../../../src/ellipse/expand-by';
import { expandByInto } from '../../../src/ellipse/expand-by-into';
import { normalAt } from '../../../src/ellipse/normal-at';
import { normalAtInto } from '../../../src/ellipse/normal-at-into';
import { tangentAt } from '../../../src/ellipse/tangent-at';
import { tangentAtInto } from '../../../src/ellipse/tangent-at-into';

/** 접선과 법선 방향의 내적을 구한다. */
function dot(tx: number, ty: number, nx: number, ny: number): number {
  return tx * nx + ty * ny;
}

describe('tangentAtInto / tangentAt', () => {
  const ellipse = { cx: 0, cy: 0, rx: 3, ry: 2 };

  it('θ=0에서 접선 방향은 (0, ry)이다', () => {
    const out = tangentAtInto({ x: 0, y: 0 }, ellipse, 0);
    expect(out.x).toBeCloseTo(0, 10);
    expect(out.y).toBeCloseTo(2, 10);
  });

  it('θ=π/2에서 접선 방향은 (-rx, 0)이다', () => {
    const out = tangentAtInto({ x: 0, y: 0 }, ellipse, Math.PI / 2);
    expect(out.x).toBeCloseTo(-3, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  it('θ=π에서 접선 방향은 (0, -ry)이다', () => {
    const out = tangentAtInto({ x: 0, y: 0 }, ellipse, Math.PI);
    expect(out.x).toBeCloseTo(0, 10);
    expect(out.y).toBeCloseTo(-2, 10);
  });

  it('임의 각도 θ=π/4에서 공식 결과를 반환한다', () => {
    const angle = Math.PI / 4;
    const out = tangentAtInto({ x: 0, y: 0 }, ellipse, angle);
    expect(out.x).toBeCloseTo(-3 * Math.sin(angle), 10);
    expect(out.y).toBeCloseTo(2 * Math.cos(angle), 10);
  });

  it('empty ellipse (rx=0)는 zero vector를 반환한다', () => {
    const empty = { cx: 1, cy: 2, rx: 0, ry: 2 };
    const out = tangentAtInto({ x: 0, y: 0 }, empty, 0);
    expect(out.x).toBe(0);
    expect(out.y).toBe(0);
  });

  it('empty ellipse (ry=0)는 zero vector를 반환한다', () => {
    const empty = { cx: 0, cy: 0, rx: 3, ry: 0 };
    const out = tangentAtInto({ x: 0, y: 0 }, empty, Math.PI / 4);
    expect(out.x).toBe(0);
    expect(out.y).toBe(0);
  });

  it('tangentAtInto는 out을 반환한다', () => {
    const out = { x: 0, y: 0 };
    const result = tangentAtInto(out, ellipse, 0);
    expect(result).toBe(out);
  });

  it('tangentAt companion은 같은 결과를 반환한다', () => {
    const angle = Math.PI / 3;
    const via = tangentAtInto({ x: 0, y: 0 }, ellipse, angle);
    const direct = tangentAt(ellipse, angle);
    expect(direct.x).toBeCloseTo(via.x, 10);
    expect(direct.y).toBeCloseTo(via.y, 10);
  });
});

describe('normalAtInto / normalAt', () => {
  const ellipse = { cx: 0, cy: 0, rx: 3, ry: 2 };

  it('θ=0에서 법선 방향은 (1/rx, 0)이다', () => {
    const out = normalAtInto({ x: 0, y: 0 }, ellipse, 0);
    expect(out.x).toBeCloseTo(1 / 3, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  it('θ=π/2에서 법선 방향은 (0, 1/ry)이다', () => {
    const out = normalAtInto({ x: 0, y: 0 }, ellipse, Math.PI / 2);
    expect(out.x).toBeCloseTo(0, 10);
    expect(out.y).toBeCloseTo(1 / 2, 10);
  });

  it('θ=π에서 법선 방향은 (-1/rx, 0)이다', () => {
    const out = normalAtInto({ x: 0, y: 0 }, ellipse, Math.PI);
    expect(out.x).toBeCloseTo(-1 / 3, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  it('임의 각도 θ=π/4에서 공식 결과를 반환한다', () => {
    const angle = Math.PI / 4;
    const out = normalAtInto({ x: 0, y: 0 }, ellipse, angle);
    expect(out.x).toBeCloseTo(Math.cos(angle) / 3, 10);
    expect(out.y).toBeCloseTo(Math.sin(angle) / 2, 10);
  });

  it('empty ellipse (rx=0)는 zero vector를 반환한다', () => {
    const empty = { cx: 0, cy: 0, rx: 0, ry: 2 };
    const out = normalAtInto({ x: 0, y: 0 }, empty, Math.PI / 4);
    expect(out.x).toBe(0);
    expect(out.y).toBe(0);
  });

  it('empty ellipse (ry=0)는 zero vector를 반환한다', () => {
    const empty = { cx: 0, cy: 0, rx: 3, ry: 0 };
    const out = normalAtInto({ x: 0, y: 0 }, empty, Math.PI / 4);
    expect(out.x).toBe(0);
    expect(out.y).toBe(0);
  });

  it('normalAtInto는 out을 반환한다', () => {
    const out = { x: 0, y: 0 };
    const result = normalAtInto(out, ellipse, 0);
    expect(result).toBe(out);
  });

  it('normalAt companion은 같은 결과를 반환한다', () => {
    const angle = Math.PI / 3;
    const via = normalAtInto({ x: 0, y: 0 }, ellipse, angle);
    const direct = normalAt(ellipse, angle);
    expect(direct.x).toBeCloseTo(via.x, 10);
    expect(direct.y).toBeCloseTo(via.y, 10);
  });
});

describe('tangent ⊥ normal 관계', () => {
  const ellipse = { cx: 2, cy: -3, rx: 5, ry: 4 };

  it.each([0, Math.PI / 6, Math.PI / 4, Math.PI / 3, Math.PI / 2, Math.PI, (3 * Math.PI) / 2])(
    'θ=%f에서 tangent · normal ≈ 0이다',
    (angle) => {
      const t = tangentAt(ellipse, angle);
      const n = normalAt(ellipse, angle);
      expect(dot(t.x, t.y, n.x, n.y)).toBeCloseTo(0, 10);
    }
  );
});

describe('expandByInto / expandBy', () => {
  const ellipse = { cx: 1, cy: 2, rx: 5, ry: 3 };

  it('양수 delta로 반지름이 증가한다', () => {
    const out = expandByInto({ cx: 0, cy: 0, rx: 0, ry: 0 }, ellipse, 2);
    expect(out.cx).toBe(1);
    expect(out.cy).toBe(2);
    expect(out.rx).toBe(7);
    expect(out.ry).toBe(5);
  });

  it('음수 delta로 반지름이 감소한다', () => {
    const out = expandByInto({ cx: 0, cy: 0, rx: 0, ry: 0 }, ellipse, -1);
    expect(out.rx).toBe(4);
    expect(out.ry).toBe(2);
  });

  it('delta=0이면 복사본과 동일하다', () => {
    const out = expandByInto({ cx: 0, cy: 0, rx: 0, ry: 0 }, ellipse, 0);
    expect(out.rx).toBe(5);
    expect(out.ry).toBe(3);
    expect(out.cx).toBe(1);
    expect(out.cy).toBe(2);
  });

  it('결과 radius가 음수이면 0으로 clamp된다', () => {
    const out = expandByInto({ cx: 0, cy: 0, rx: 0, ry: 0 }, ellipse, -10);
    expect(out.rx).toBe(0);
    expect(out.ry).toBe(0);
  });

  it('정확히 경계값(결과=0)이면 0이다', () => {
    const e = { cx: 0, cy: 0, rx: 3, ry: 4 };
    const out = expandByInto({ cx: 0, cy: 0, rx: 0, ry: 0 }, e, -3);
    expect(out.rx).toBe(0);
    expect(out.ry).toBe(1);
  });

  it('center는 변경되지 않는다', () => {
    const out = expandByInto({ cx: 0, cy: 0, rx: 0, ry: 0 }, ellipse, 100);
    expect(out.cx).toBe(1);
    expect(out.cy).toBe(2);
  });

  it('expandByInto는 out을 반환한다', () => {
    const out = { cx: 0, cy: 0, rx: 0, ry: 0 };
    const result = expandByInto(out, ellipse, 1);
    expect(result).toBe(out);
  });

  it('expandBy companion은 같은 결과를 반환한다', () => {
    const delta = 2;
    const via = expandByInto({ cx: 0, cy: 0, rx: 0, ry: 0 }, ellipse, delta);
    const direct = expandBy(ellipse, delta);
    expect(direct.cx).toBe(via.cx);
    expect(direct.cy).toBe(via.cy);
    expect(direct.rx).toBe(via.rx);
    expect(direct.ry).toBe(via.ry);
  });
});
