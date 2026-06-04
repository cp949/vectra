import { describe, expect, it } from 'vitest';
import { quadraticBoundsInto } from '../../../src/curve/quadratic-bounds-into';
import { quadraticDerivativeAtInto } from '../../../src/curve/quadratic-derivative-at-into';
import { quadraticExtrema } from '../../../src/curve/quadratic-extrema';
import { quadraticFlattenInto } from '../../../src/curve/quadratic-flatten-into';
import { quadraticHullInto } from '../../../src/curve/quadratic-hull-into';
import { quadraticLength } from '../../../src/curve/quadratic-length';
import { quadraticNormalAtInto } from '../../../src/curve/quadratic-normal-at-into';
import { quadraticPointAtTInto } from '../../../src/curve/quadratic-point-at-t-into';
import { quadraticSplitInto } from '../../../src/curve/quadratic-split-into';
import { quadraticTangentAtInto } from '../../../src/curve/quadratic-tangent-at-into';

// 상대 오차 비교 helper
function relErr(result: number, expected: number): number {
  if (expected === 0) return Math.abs(result);
  return Math.abs(result - expected) / Math.abs(expected);
}

describe('quadraticPointAtTInto', () => {
  const p0 = { x: 0, y: 0 };
  const p1 = { x: 1, y: 2 };
  const p2 = { x: 4, y: 0 };

  it('t=0이면 p0을 반환한다', () => {
    const out = { x: 0, y: 0 };
    quadraticPointAtTInto(out, p0, p1, p2, 0);
    expect(out.x).toBe(0);
    expect(out.y).toBe(0);
  });

  it('t=1이면 p2를 반환한다', () => {
    const out = { x: 0, y: 0 };
    quadraticPointAtTInto(out, p0, p1, p2, 1);
    expect(out.x).toBe(4);
    expect(out.y).toBe(0);
  });

  it('t=0.5 정확값을 반환한다', () => {
    // B(0.5) = 0.25*p0 + 0.5*p1 + 0.25*p2
    // x = 0.25*0 + 0.5*1 + 0.25*4 = 0 + 0.5 + 1 = 1.5
    // y = 0.25*0 + 0.5*2 + 0.25*0 = 1.0
    const out = { x: 0, y: 0 };
    quadraticPointAtTInto(out, p0, p1, p2, 0.5);
    expect(relErr(out.x, 1.5)).toBeLessThan(1e-12);
    expect(relErr(out.y, 1.0)).toBeLessThan(1e-12);
  });

  it('object/tuple mixed XYInput을 받는다', () => {
    const out = { x: 0, y: 0 };
    // p0을 tuple로 전달
    quadraticPointAtTInto(out, [0, 0], p1, p2, 0.5);
    expect(relErr(out.x, 1.5)).toBeLessThan(1e-12);
    expect(relErr(out.y, 1.0)).toBeLessThan(1e-12);
  });

  it('tuple output에 기록한다', () => {
    const out: [number, number] = [0, 0];
    quadraticPointAtTInto(out, p0, p1, p2, 0.5);
    expect(relErr(out[0], 1.5)).toBeLessThan(1e-12);
    expect(relErr(out[1], 1.0)).toBeLessThan(1e-12);
  });

  it('out을 반환한다', () => {
    const out = { x: 0, y: 0 };
    const ret = quadraticPointAtTInto(out, p0, p1, p2, 0.5);
    expect(ret).toBe(out);
  });
});

describe('quadraticDerivativeAtInto', () => {
  const p0 = { x: 0, y: 0 };
  const p1 = { x: 1, y: 2 };
  const p2 = { x: 4, y: 0 };

  it('t=0에서 derivative 정확값을 반환한다', () => {
    // B'(0) = 2*(p1-p0) = 2*(1,2) = (2, 4)
    const out = { x: 0, y: 0 };
    quadraticDerivativeAtInto(out, p0, p1, p2, 0);
    expect(relErr(out.x, 2)).toBeLessThan(1e-12);
    expect(relErr(out.y, 4)).toBeLessThan(1e-12);
  });

  it('t=1에서 derivative 정확값을 반환한다', () => {
    // B'(1) = 2*(p2-p1) = 2*(3,-2) = (6, -4)
    const out = { x: 0, y: 0 };
    quadraticDerivativeAtInto(out, p0, p1, p2, 1);
    expect(relErr(out.x, 6)).toBeLessThan(1e-12);
    expect(relErr(out.y, -4)).toBeLessThan(1e-12);
  });

  it('t=0.5에서 derivative 정확값을 반환한다', () => {
    // B'(t) = 2(1-t)(p1-p0) + 2t(p2-p1)
    // t=0.5: 2*0.5*(1,2) + 2*0.5*(3,-2) = (1,2)+(3,-2) = (4,0)
    const out = { x: 0, y: 0 };
    quadraticDerivativeAtInto(out, p0, p1, p2, 0.5);
    expect(relErr(out.x, 4)).toBeLessThan(1e-12);
    expect(out.y).toBe(0);
  });

  it('out을 반환한다', () => {
    const out = { x: 0, y: 0 };
    const ret = quadraticDerivativeAtInto(out, p0, p1, p2, 0);
    expect(ret).toBe(out);
  });
});

describe('quadraticTangentAtInto', () => {
  const p0 = { x: 0, y: 0 };
  const p1 = { x: 1, y: 2 };
  const p2 = { x: 4, y: 0 };

  it('정상 curve에서 unit tangent를 반환한다', () => {
    const out = { x: 0, y: 0 };
    quadraticTangentAtInto(out, p0, p1, p2, 0);
    // B'(0) = (2,4), normalize → (1/√5, 2/√5)
    const len = Math.hypot(out.x, out.y);
    expect(relErr(len, 1)).toBeLessThan(1e-12);
  });

  it('degenerate curve (p0==p1==p2)에서 zero vector를 반환한다', () => {
    const out = { x: 1, y: 1 };
    const p = { x: 3, y: 3 };
    quadraticTangentAtInto(out, p, p, p, 0.5);
    expect(out.x).toBe(0);
    expect(out.y).toBe(0);
  });

  it('out을 반환한다', () => {
    const out = { x: 0, y: 0 };
    const ret = quadraticTangentAtInto(out, p0, p1, p2, 0);
    expect(ret).toBe(out);
  });
});

describe('quadraticNormalAtInto', () => {
  const p0 = { x: 0, y: 0 };
  const p1 = { x: 1, y: 0 };
  const p2 = { x: 2, y: 0 };

  it('정상 curve에서 unit normal을 반환한다 (tangent 90도 회전)', () => {
    // horizontal line: tangent = (1,0), normal = (0,1) 또는 (0,-1)
    const out = { x: 0, y: 0 };
    quadraticNormalAtInto(out, p0, p1, p2, 0.5);
    const len = Math.hypot(out.x, out.y);
    expect(relErr(len, 1)).toBeLessThan(1e-12);
    // normal은 tangent와 수직
    const tangent = { x: 0, y: 0 };
    quadraticTangentAtInto(tangent, p0, p1, p2, 0.5);
    const dot = out.x * tangent.x + out.y * tangent.y;
    expect(Math.abs(dot)).toBeLessThan(1e-12);
  });

  it('degenerate curve에서 zero vector를 반환한다', () => {
    const out = { x: 1, y: 1 };
    const p = { x: 5, y: 5 };
    quadraticNormalAtInto(out, p, p, p, 0.5);
    expect(out.x).toBe(0);
    expect(out.y).toBe(0);
  });

  it('out을 반환한다', () => {
    const out = { x: 0, y: 0 };
    const ret = quadraticNormalAtInto(out, p0, p1, p2, 0.5);
    expect(ret).toBe(out);
  });
});

describe('quadraticSplitInto', () => {
  const p0 = { x: 0, y: 0 };
  const p1 = { x: 1, y: 2 };
  const p2 = { x: 4, y: 0 };

  function makeOut() {
    return {
      p0: { x: 0, y: 0 },
      p1: { x: 0, y: 0 },
      p2: { x: 0, y: 0 },
    };
  }

  it('left.p0이 원본 p0과 같다', () => {
    const outL = makeOut();
    const outR = makeOut();
    quadraticSplitInto(outL, outR, p0, p1, p2, 0.5);
    expect(outL.p0.x).toBe(0);
    expect(outL.p0.y).toBe(0);
  });

  it('right.p2가 원본 p2와 같다', () => {
    const outL = makeOut();
    const outR = makeOut();
    quadraticSplitInto(outL, outR, p0, p1, p2, 0.5);
    expect(outR.p2.x).toBe(4);
    expect(outR.p2.y).toBe(0);
  });

  it('left.p2와 right.p0이 같다 (de Casteljau 연속성)', () => {
    const outL = makeOut();
    const outR = makeOut();
    quadraticSplitInto(outL, outR, p0, p1, p2, 0.5);
    expect(outL.p2.x).toBe(outR.p0.x);
    expect(outL.p2.y).toBe(outR.p0.y);
  });

  it('split point가 원본 curve의 pointAt(t) 값과 일치한다', () => {
    const outL = makeOut();
    const outR = makeOut();
    quadraticSplitInto(outL, outR, p0, p1, p2, 0.5);
    const pt = { x: 0, y: 0 };
    quadraticPointAtTInto(pt, p0, p1, p2, 0.5);
    expect(relErr(outL.p2.x, pt.x)).toBeLessThan(1e-12);
    expect(relErr(outL.p2.y, pt.y)).toBeLessThan(1e-12);
  });

  it('outLeft를 반환한다', () => {
    const outL = makeOut();
    const outR = makeOut();
    const ret = quadraticSplitInto(outL, outR, p0, p1, p2, 0.5);
    expect(ret).toBe(outL);
  });
});

describe('quadraticHullInto', () => {
  const p0 = { x: 0, y: 0 };
  const p1 = { x: 1, y: 2 };
  const p2 = { x: 4, y: 0 };

  it('결과 배열 길이가 6이다', () => {
    const out: { x: number; y: number }[] = [];
    quadraticHullInto(out, p0, p1, p2, 0.5);
    expect(out.length).toBe(6);
  });

  it('[p0, p1, p2, lerpP01, lerpP12, pointAt] 순서이다', () => {
    const out: { x: number; y: number }[] = [];
    quadraticHullInto(out, p0, p1, p2, 0.5);
    // index 0 = p0
    expect(out[0].x).toBe(0);
    expect(out[0].y).toBe(0);
    // index 1 = p1
    expect(out[1].x).toBe(1);
    expect(out[1].y).toBe(2);
    // index 2 = p2
    expect(out[2].x).toBe(4);
    expect(out[2].y).toBe(0);
    // index 3 = lerpP01 = lerp(p0,p1,0.5) = (0.5,1)
    expect(relErr(out[3].x, 0.5)).toBeLessThan(1e-12);
    expect(relErr(out[3].y, 1)).toBeLessThan(1e-12);
    // index 4 = lerpP12 = lerp(p1,p2,0.5) = (2.5,1)
    expect(relErr(out[4].x, 2.5)).toBeLessThan(1e-12);
    expect(relErr(out[4].y, 1)).toBeLessThan(1e-12);
    // index 5 = pointAt(0.5) = lerp(lerpP01, lerpP12, 0.5) = (1.5, 1)
    expect(relErr(out[5].x, 1.5)).toBeLessThan(1e-12);
    expect(relErr(out[5].y, 1)).toBeLessThan(1e-12);
  });

  it('기존 내용을 clear 후 push한다 (out.length=0 정책)', () => {
    const sentinel = { x: 99, y: 99 };
    const out = [sentinel, sentinel];
    quadraticHullInto(out, p0, p1, p2, 0.5);
    expect(out.length).toBe(6);
    // sentinel이 남아 있지 않아야 한다
    expect(out[0]).not.toBe(sentinel);
  });

  it('out을 반환한다', () => {
    const out: { x: number; y: number }[] = [];
    const ret = quadraticHullInto(out, p0, p1, p2, 0.5);
    expect(ret).toBe(out);
  });
});

describe('quadraticExtrema', () => {
  it('단조 curve에서 extrema가 없다 (빈 배열)', () => {
    // 완전히 단조로운 수평선: extrema 없음
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 0 };
    const p2 = { x: 2, y: 0 };
    const result = quadraticExtrema(p0, p1, p2);
    expect(result.length).toBe(0);
  });

  it('interior extrema가 있는 curve에서 t ∈ (0,1) 값을 포함한다', () => {
    // y축 극값이 있는 curve: p0=(0,0), p1=(1,2), p2=(2,0)
    // dy/dt=0: t = (p0y-p1y)/(p0y-2*p1y+p2y) = (0-2)/(0-4+0) = -2/-4 = 0.5
    // x 방향 denominator: p0x-2*p1x+p2x = 0-2+2 = 0 → x extrema 없음
    // 따라서 result = [0.5]
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 2 };
    const p2 = { x: 2, y: 0 };
    const result = quadraticExtrema(p0, p1, p2);
    expect(result.length).toBeGreaterThan(0);
    for (const t of result) {
      expect(t).toBeGreaterThan(0);
      expect(t).toBeLessThan(1);
    }
    // y 방향 extrema t 정확값 검증
    expect(result[0]).toBeCloseTo(0.5, 12);
  });

  it('오름차순 정렬이다', () => {
    // x, y 둘 다 interior extrema가 있는 curve
    const p0 = { x: 0, y: 3 };
    const p1 = { x: 2, y: 0 };
    const p2 = { x: 4, y: 3 };
    const result = quadraticExtrema(p0, p1, p2);
    for (let i = 1; i < result.length; i++) {
      expect(result[i]).toBeGreaterThanOrEqual(result[i - 1]);
    }
  });

  it('degenerate curve (p0==p1==p2)에서 빈 배열을 반환한다', () => {
    const p = { x: 1, y: 1 };
    const result = quadraticExtrema(p, p, p);
    expect(result.length).toBe(0);
  });
});

describe('quadraticBoundsInto', () => {
  it('단조 curve에서 endpoints만으로 bounds가 결정된다', () => {
    // 완전 단조 x와 y: p0=(0,0), p1=(1,1), p2=(2,2)
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 1 };
    const p2 = { x: 2, y: 2 };
    const out = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    quadraticBoundsInto(out, p0, p1, p2);
    expect(out.min.x).toBe(0);
    expect(out.min.y).toBe(0);
    expect(out.max.x).toBe(2);
    expect(out.max.y).toBe(2);
  });

  it('interior extrema가 bounds를 확장한다', () => {
    // y extrema at t=0.5: p0=(0,0), p1=(1,2), p2=(2,0)
    // pointAt(0.5).y = 1.0 → bounds.max.y should be 1.0
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 2 };
    const p2 = { x: 2, y: 0 };
    const out = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    quadraticBoundsInto(out, p0, p1, p2);
    // y extrema: t=0.5, B(0.5).y = 1.0
    expect(relErr(out.max.y, 1)).toBeLessThan(1e-12);
    expect(out.min.x).toBe(0);
    expect(out.max.x).toBe(2);
  });

  it('out을 반환한다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 1 };
    const p2 = { x: 2, y: 2 };
    const out = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    const ret = quadraticBoundsInto(out, p0, p1, p2);
    expect(ret).toBe(out);
  });
});

describe('quadraticFlattenInto', () => {
  it('직선(collinear) curve에서 시작/끝 두 점만 생성한다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 0 };
    const p2 = { x: 2, y: 0 };
    const out: { x: number; y: number }[] = [];
    quadraticFlattenInto(out, p0, p1, p2);
    expect(out.length).toBe(2);
    expect(out[0].x).toBe(0);
    expect(out[out.length - 1].x).toBe(2);
  });

  it('flatness가 작을수록 point 수가 증가한다 (단조성)', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 3 };
    const p2 = { x: 2, y: 0 };

    const out1: { x: number; y: number }[] = [];
    quadraticFlattenInto(out1, p0, p1, p2, { flatness: 1.0 });

    const out2: { x: number; y: number }[] = [];
    quadraticFlattenInto(out2, p0, p1, p2, { flatness: 0.1 });

    expect(out2.length).toBeGreaterThanOrEqual(out1.length);
  });

  it('maxRecursion을 존중한다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 100 };
    const p2 = { x: 2, y: 0 };
    const out: { x: number; y: number }[] = [];
    // maxRecursion=1: 최대 1 단계 subdivision
    quadraticFlattenInto(out, p0, p1, p2, { flatness: 0.001, maxRecursion: 1 });
    // depth 1 → 최대 4점 (2^1 + 1 = 3점 근처)
    expect(out.length).toBeLessThanOrEqual(5);
  });

  it('기존 내용을 clear 후 push한다', () => {
    const sentinel = { x: 99, y: 99 };
    const out = [sentinel];
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 0 };
    const p2 = { x: 2, y: 0 };
    quadraticFlattenInto(out, p0, p1, p2);
    expect(out[0]).not.toBe(sentinel);
  });

  it('out을 반환한다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 0 };
    const p2 = { x: 2, y: 0 };
    const out: { x: number; y: number }[] = [];
    const ret = quadraticFlattenInto(out, p0, p1, p2);
    expect(ret).toBe(out);
  });
});

describe('quadraticLength', () => {
  it('직선 curve의 길이가 정확한 직선 길이에 근사한다', () => {
    // p0=(0,0), p1=(1,0), p2=(2,0) → 직선 길이 2
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 0 };
    const p2 = { x: 2, y: 0 };
    const len = quadraticLength(p0, p1, p2);
    expect(Math.abs(len - 2)).toBeLessThan(1e-6);
  });

  it('대각선 직선 curve의 길이가 정확하다', () => {
    // p0=(0,0), p1=(1,1), p2=(2,2) → 직선 길이 2√2
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 1 };
    const p2 = { x: 2, y: 2 };
    const len = quadraticLength(p0, p1, p2);
    const expected = 2 * Math.SQRT2;
    expect(Math.abs(len - expected)).toBeLessThan(1e-6);
  });

  it('segments가 클수록 길이가 안정된다', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 3 };
    const p2 = { x: 2, y: 0 };
    const len4 = quadraticLength(p0, p1, p2, { segments: 4 });
    const len16 = quadraticLength(p0, p1, p2, { segments: 16 });
    // 더 많은 segment로 적분 → 둘의 차이가 매우 작아야 한다
    expect(Math.abs(len4 - len16)).toBeLessThan(1e-4);
  });

  it('zero-length curve에서 0을 반환한다', () => {
    const p = { x: 2, y: 3 };
    const len = quadraticLength(p, p, p);
    expect(len).toBe(0);
  });
});
