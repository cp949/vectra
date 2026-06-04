/**
 * projection / reflection / rejection / slide helper 단위 테스트.
 *
 * 대상 함수:
 *  - projectScalar       : vector a를 basis b에 투영한 scalar
 *  - reflectInto / reflect   : arbitrary normal에 대한 반사
 *  - rejectFromInto / rejectFrom : basis 방향 성분 제거
 *  - slideInto / slide       : normal 성분 제거 (collision slide)
 */

import { describe, expect, test } from 'vitest';
import { projectScalar } from '../../../src/vec/project-scalar';
import { reflect } from '../../../src/vec/reflect';
import { reflectInto } from '../../../src/vec/reflect-into';
import { rejectFrom } from '../../../src/vec/reject-from';
import { rejectFromInto } from '../../../src/vec/reject-from-into';
import { slide } from '../../../src/vec/slide';
import { slideInto } from '../../../src/vec/slide-into';

// ---------------------------------------------------------------------------
// projectScalar
// ---------------------------------------------------------------------------

describe('projectScalar — projection scalar 계산', () => {
  test('x축 basis로 projection scalar를 반환한다', () => {
    expect(projectScalar({ x: 3, y: 4 }, { x: 1, y: 0 })).toBeCloseTo(3);
  });

  test('y축 basis로 projection scalar를 반환한다', () => {
    expect(projectScalar({ x: 3, y: 4 }, { x: 0, y: 1 })).toBeCloseTo(4);
  });

  test('대각선 비정규화 basis로 올바른 scalar를 반환한다', () => {
    // a=(3,3), b=(2,2): dot=12, lengthSq=8 → 1.5
    expect(projectScalar({ x: 3, y: 3 }, { x: 2, y: 2 })).toBeCloseTo(1.5);
  });

  test('zero basis이면 0을 반환한다', () => {
    expect(projectScalar({ x: 5, y: 7 }, { x: 0, y: 0 })).toBe(0);
  });

  test('a.x가 NaN이면 NaN을 반환한다', () => {
    expect(projectScalar({ x: NaN, y: 0 }, { x: 1, y: 0 })).toBeNaN();
  });

  test('b.x가 Infinity이면 결과가 non-finite이다', () => {
    const result = projectScalar({ x: 1, y: 0 }, { x: Infinity, y: 0 });
    expect(Number.isFinite(result)).toBe(false);
  });

  test('b.y가 -Infinity이면 결과가 non-finite이다', () => {
    const result = projectScalar({ x: 0, y: 1 }, { x: 0, y: -Infinity });
    expect(Number.isFinite(result)).toBe(false);
  });

  test('a.x가 Infinity이면 결과가 non-finite이다', () => {
    const result = projectScalar({ x: Infinity, y: 0 }, { x: 1, y: 0 });
    expect(Number.isFinite(result)).toBe(false);
  });

  test('a.x가 -Infinity이면 결과가 non-finite이다', () => {
    const result = projectScalar({ x: -Infinity, y: 0 }, { x: 1, y: 0 });
    expect(Number.isFinite(result)).toBe(false);
  });

  test('b.x가 NaN이면 NaN을 반환한다', () => {
    expect(projectScalar({ x: 1, y: 0 }, { x: NaN, y: 0 })).toBeNaN();
  });

  test('tuple input을 받는다', () => {
    expect(projectScalar([3, 4], [1, 0])).toBeCloseTo(3);
  });
});

// ---------------------------------------------------------------------------
// reflectInto
// ---------------------------------------------------------------------------

describe('reflectInto — arbitrary normal에 대한 벡터 반사 (Into 버전)', () => {
  test('y축 unit normal로 아래방향 벡터를 반사한다', () => {
    const out = { x: 0, y: 0 };
    const result = reflectInto(out, { x: 1, y: -1 }, { x: 0, y: 1 });

    expect(result).toBe(out);
    expect(out.x).toBeCloseTo(1);
    expect(out.y).toBeCloseTo(1);
  });

  test('x축 unit normal로 벡터를 반사한다', () => {
    const out = { x: 0, y: 0 };
    reflectInto(out, { x: -2, y: 3 }, { x: 1, y: 0 });

    expect(out.x).toBeCloseTo(2);
    expect(out.y).toBeCloseTo(3);
  });

  test('non-unit normal (임의 길이)로 올바르게 반사한다', () => {
    const out = { x: 0, y: 0 };
    // normal=(0,2)은 (0,1)과 동일 방향 — 결과는 동일해야 함
    reflectInto(out, { x: 1, y: -1 }, { x: 0, y: 2 });

    expect(out.x).toBeCloseTo(1);
    expect(out.y).toBeCloseTo(1);
  });

  test('zero normal이면 vector를 그대로 복사한다', () => {
    const out = { x: 0, y: 0 };
    reflectInto(out, { x: 3, y: 4 }, { x: 0, y: 0 });

    expect(out.x).toBeCloseTo(3);
    expect(out.y).toBeCloseTo(4);
  });

  test('out === vector aliasing이 안전하다', () => {
    const v = { x: 1, y: -1 };
    const result = reflectInto(v, v, { x: 0, y: 1 });

    expect(result).toBe(v);
    expect(v.x).toBeCloseTo(1);
    expect(v.y).toBeCloseTo(1);
  });

  test('mutable tuple out의 타입이 유지된다', () => {
    const out: [number, number] = [0, 0];
    const result = reflectInto(out, { x: 1, y: -1 }, { x: 0, y: 1 });

    expect(result).toBe(out);
    expect(out[0]).toBeCloseTo(1);
    expect(out[1]).toBeCloseTo(1);
  });

  test('NaN 입력은 NaN으로 pass through한다', () => {
    const out = { x: 0, y: 0 };
    reflectInto(out, { x: NaN, y: 0 }, { x: 0, y: 1 });
    expect(out.x).toBeNaN();
  });

  test('Infinity 입력은 non-finite로 pass through한다', () => {
    const out = { x: 0, y: 0 };
    reflectInto(out, { x: Infinity, y: 0 }, { x: 1, y: 0 });
    expect(Number.isFinite(out.x)).toBe(false);
  });

  test('-Infinity 입력은 non-finite로 pass through한다', () => {
    const out = { x: 0, y: 0 };
    reflectInto(out, { x: -Infinity, y: 0 }, { x: 1, y: 0 });
    expect(Number.isFinite(out.x)).toBe(false);
  });

  test('normal.x가 NaN이면 결과가 non-finite이다', () => {
    const out = { x: 0, y: 0 };
    reflectInto(out, { x: 1, y: 0 }, { x: NaN, y: 0 });
    expect(Number.isFinite(out.x)).toBe(false);
  });

  test('normal.x가 Infinity이면 결과가 non-finite이다', () => {
    const out = { x: 0, y: 0 };
    reflectInto(out, { x: 1, y: 0 }, { x: Infinity, y: 0 });
    expect(Number.isFinite(out.x)).toBe(false);
  });

  test('normal.x가 -Infinity이면 결과가 non-finite이다', () => {
    const out = { x: 0, y: 0 };
    reflectInto(out, { x: 1, y: 0 }, { x: -Infinity, y: 0 });
    expect(Number.isFinite(out.x)).toBe(false);
  });

  test('tuple input을 받는다', () => {
    const out = { x: 0, y: 0 };
    reflectInto(out, [1, -1], [0, 1]);
    expect(out.x).toBeCloseTo(1);
    expect(out.y).toBeCloseTo(1);
  });
});

// ---------------------------------------------------------------------------
// reflect (companion)
// ---------------------------------------------------------------------------

describe('reflect — arbitrary normal에 대한 벡터 반사 (allocating companion)', () => {
  test('새 { x, y } object를 반환한다', () => {
    const v = { x: 1, y: -1 };
    const result = reflect(v, { x: 0, y: 1 });

    expect(result).not.toBe(v);
    expect(result.x).toBeCloseTo(1);
    expect(result.y).toBeCloseTo(1);
  });

  test('non-unit normal도 올바르게 처리한다', () => {
    const result = reflect({ x: 1, y: -1 }, { x: 0, y: 3 });

    expect(result.x).toBeCloseTo(1);
    expect(result.y).toBeCloseTo(1);
  });
});

// ---------------------------------------------------------------------------
// rejectFromInto
// ---------------------------------------------------------------------------

describe('rejectFromInto — basis 방향 성분 제거 (Into 버전)', () => {
  test('x축 basis에서 x성분을 제거한다', () => {
    const out = { x: 0, y: 0 };
    const result = rejectFromInto(out, { x: 3, y: 4 }, { x: 1, y: 0 });

    expect(result).toBe(out);
    expect(out.x).toBeCloseTo(0);
    expect(out.y).toBeCloseTo(4);
  });

  test('y축 basis에서 y성분을 제거한다', () => {
    const out = { x: 0, y: 0 };
    rejectFromInto(out, { x: 3, y: 4 }, { x: 0, y: 1 });

    expect(out.x).toBeCloseTo(3);
    expect(out.y).toBeCloseTo(0);
  });

  test('대각선 비정규화 basis에서 올바르게 rejection한다', () => {
    const out = { x: 0, y: 0 };
    // v=(2,0), b=(1,1): scalar=1, proj=(1,1), reject=(1,-1)
    rejectFromInto(out, { x: 2, y: 0 }, { x: 1, y: 1 });

    expect(out.x).toBeCloseTo(1);
    expect(out.y).toBeCloseTo(-1);
  });

  test('zero basis이면 vector를 그대로 복사한다', () => {
    const out = { x: 0, y: 0 };
    rejectFromInto(out, { x: 5, y: 6 }, { x: 0, y: 0 });

    expect(out.x).toBeCloseTo(5);
    expect(out.y).toBeCloseTo(6);
  });

  test('out === vector aliasing이 안전하다', () => {
    const v = { x: 3, y: 4 };
    const result = rejectFromInto(v, v, { x: 1, y: 0 });

    expect(result).toBe(v);
    expect(v.x).toBeCloseTo(0);
    expect(v.y).toBeCloseTo(4);
  });

  test('mutable tuple out의 타입이 유지된다', () => {
    const out: [number, number] = [0, 0];
    const result = rejectFromInto(out, { x: 3, y: 4 }, { x: 1, y: 0 });

    expect(result).toBe(out);
    expect(out[0]).toBeCloseTo(0);
    expect(out[1]).toBeCloseTo(4);
  });

  test('NaN 입력은 NaN으로 pass through한다', () => {
    const out = { x: 0, y: 0 };
    rejectFromInto(out, { x: NaN, y: 0 }, { x: 1, y: 0 });
    expect(out.x).toBeNaN();
  });

  test('Infinity 입력은 non-finite로 pass through한다', () => {
    const out = { x: 0, y: 0 };
    rejectFromInto(out, { x: Infinity, y: 0 }, { x: 1, y: 0 });
    expect(Number.isFinite(out.x)).toBe(false);
  });

  test('-Infinity 입력은 non-finite로 pass through한다', () => {
    const out = { x: 0, y: 0 };
    rejectFromInto(out, { x: -Infinity, y: 0 }, { x: 1, y: 0 });
    expect(Number.isFinite(out.x)).toBe(false);
  });

  test('basis.x가 NaN이면 결과가 non-finite이다', () => {
    const out = { x: 0, y: 0 };
    rejectFromInto(out, { x: 1, y: 0 }, { x: NaN, y: 0 });
    expect(Number.isFinite(out.x)).toBe(false);
  });

  test('basis.x가 Infinity이면 결과가 non-finite이다', () => {
    const out = { x: 0, y: 0 };
    rejectFromInto(out, { x: 1, y: 0 }, { x: Infinity, y: 0 });
    expect(Number.isFinite(out.x)).toBe(false);
  });

  test('basis.x가 -Infinity이면 결과가 non-finite이다', () => {
    const out = { x: 0, y: 0 };
    rejectFromInto(out, { x: 1, y: 0 }, { x: -Infinity, y: 0 });
    expect(Number.isFinite(out.x)).toBe(false);
  });

  test('tuple input을 받는다', () => {
    const out = { x: 0, y: 0 };
    rejectFromInto(out, [3, 4], [1, 0]);
    expect(out.x).toBeCloseTo(0);
    expect(out.y).toBeCloseTo(4);
  });
});

// ---------------------------------------------------------------------------
// rejectFrom (companion)
// ---------------------------------------------------------------------------

describe('rejectFrom — basis 방향 성분 제거 (allocating companion)', () => {
  test('새 { x, y } object를 반환한다', () => {
    const v = { x: 3, y: 4 };
    const result = rejectFrom(v, { x: 1, y: 0 });

    expect(result).not.toBe(v);
    expect(result.x).toBeCloseTo(0);
    expect(result.y).toBeCloseTo(4);
  });
});

// ---------------------------------------------------------------------------
// slideInto
// ---------------------------------------------------------------------------

describe('slideInto — normal 성분 제거, collision slide (Into 버전)', () => {
  test('y축 normal로 y성분을 제거한다', () => {
    const out = { x: 0, y: 0 };
    const result = slideInto(out, { x: 3, y: 4 }, { x: 0, y: 1 });

    expect(result).toBe(out);
    expect(out.x).toBeCloseTo(3);
    expect(out.y).toBeCloseTo(0);
  });

  test('경사 normal로 슬라이드 성분을 반환한다', () => {
    const out = { x: 0, y: 0 };
    // v=(2,0), n=(1,1): scalar=1, proj=(1,1), slide=(1,-1)
    slideInto(out, { x: 2, y: 0 }, { x: 1, y: 1 });

    expect(out.x).toBeCloseTo(1);
    expect(out.y).toBeCloseTo(-1);
  });

  test('zero normal이면 vector를 그대로 복사한다', () => {
    const out = { x: 0, y: 0 };
    slideInto(out, { x: 5, y: 6 }, { x: 0, y: 0 });

    expect(out.x).toBeCloseTo(5);
    expect(out.y).toBeCloseTo(6);
  });

  test('out === vector aliasing이 안전하다', () => {
    const v = { x: 3, y: 4 };
    const result = slideInto(v, v, { x: 0, y: 1 });

    expect(result).toBe(v);
    expect(v.x).toBeCloseTo(3);
    expect(v.y).toBeCloseTo(0);
  });

  test('mutable tuple out의 타입이 유지된다', () => {
    const out: [number, number] = [0, 0];
    const result = slideInto(out, { x: 3, y: 4 }, { x: 0, y: 1 });

    expect(result).toBe(out);
    expect(out[0]).toBeCloseTo(3);
    expect(out[1]).toBeCloseTo(0);
  });

  test('NaN 입력은 NaN으로 pass through한다', () => {
    const out = { x: 0, y: 0 };
    slideInto(out, { x: NaN, y: 0 }, { x: 0, y: 1 });
    expect(out.x).toBeNaN();
  });

  test('Infinity 입력은 non-finite로 pass through한다', () => {
    const out = { x: 0, y: 0 };
    slideInto(out, { x: Infinity, y: 0 }, { x: 1, y: 0 });
    expect(Number.isFinite(out.x)).toBe(false);
  });

  test('-Infinity 입력은 non-finite로 pass through한다', () => {
    const out = { x: 0, y: 0 };
    slideInto(out, { x: -Infinity, y: 0 }, { x: 1, y: 0 });
    expect(Number.isFinite(out.x)).toBe(false);
  });

  test('normal.x가 NaN이면 결과가 non-finite이다', () => {
    const out = { x: 0, y: 0 };
    slideInto(out, { x: 1, y: 0 }, { x: NaN, y: 0 });
    expect(Number.isFinite(out.x)).toBe(false);
  });

  test('normal.x가 Infinity이면 결과가 non-finite이다', () => {
    const out = { x: 0, y: 0 };
    slideInto(out, { x: 1, y: 0 }, { x: Infinity, y: 0 });
    expect(Number.isFinite(out.x)).toBe(false);
  });

  test('normal.x가 -Infinity이면 결과가 non-finite이다', () => {
    const out = { x: 0, y: 0 };
    slideInto(out, { x: 1, y: 0 }, { x: -Infinity, y: 0 });
    expect(Number.isFinite(out.x)).toBe(false);
  });

  test('tuple input을 받는다', () => {
    const out = { x: 0, y: 0 };
    slideInto(out, [3, 4], [0, 1]);
    expect(out.x).toBeCloseTo(3);
    expect(out.y).toBeCloseTo(0);
  });
});

// ---------------------------------------------------------------------------
// slide (companion)
// ---------------------------------------------------------------------------

describe('slide — normal 성분 제거, collision slide (allocating companion)', () => {
  test('새 { x, y } object를 반환한다', () => {
    const v = { x: 3, y: 4 };
    const result = slide(v, { x: 0, y: 1 });

    expect(result).not.toBe(v);
    expect(result.x).toBeCloseTo(3);
    expect(result.y).toBeCloseTo(0);
  });
});
